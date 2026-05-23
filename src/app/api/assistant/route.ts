import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/require-auth";
import { db } from "@/lib/db";
import {
  streamAssistantReply,
  generateConversationTitle,
  type KnowledgeChunk,
  type ChatTurn,
} from "@/lib/ai";
import { AssistantQuerySchema } from "@/lib/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const user = await requireUser();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = AssistantQuerySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  const { conversationId, question } = parsed.data;

  // Resolve / create conversation.
  let conversation = conversationId
    ? await db.conversation.findFirst({
        where: { id: conversationId, userId: user.id },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      })
    : null;
  if (conversationId && !conversation) {
    return Response.json({ error: "Conversation not found" }, { status: 404 });
  }
  if (!conversation) {
    conversation = await db.conversation.create({
      data: { userId: user.id, title: "New conversation" },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
  }

  // Persist the user message first so it's in the transcript even if streaming fails.
  await db.message.create({
    data: {
      conversationId: conversation.id,
      role: "USER",
      content: question,
    },
  });

  // Build chat history (excluding the just-saved turn — we pass `question` separately).
  const history: ChatTurn[] = conversation.messages.map((m) => ({
    role: m.role as ChatTurn["role"],
    content: m.content,
  }));

  // Pull all knowledge items in the user's org.
  const items = await db.knowledgeItem.findMany({
    where: { orgId: user.orgId },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { name: true } } },
  });
  const knowledge: KnowledgeChunk[] = items.map((k) => ({
    id: k.id,
    title: k.title,
    type: k.type,
    authorName: k.author.name,
    content: k.content,
  }));
  const knownIds = new Set(items.map((k) => k.id));

  // Stream the reply to the client AND accumulate to persist + extract citations.
  const encoder = new TextEncoder();
  const convId = conversation.id;
  const isFirstTurn = history.length === 0;

  const stream = new ReadableStream({
    async start(controller) {
      // First, tell the client the conversation ID so it can update its URL.
      controller.enqueue(
        encoder.encode(JSON.stringify({ type: "open", conversationId: convId }) + "\n"),
      );

      let full = "";
      try {
        for await (const delta of streamAssistantReply({
          question,
          history,
          knowledge,
        })) {
          full += delta;
          controller.enqueue(
            encoder.encode(JSON.stringify({ type: "delta", text: delta }) + "\n"),
          );
        }

        // Parse [K<id>] citations from the full reply.
        const cited = new Set<string>();
        for (const m of full.matchAll(/\[K([A-Za-z0-9_-]+)\]/g)) {
          const id = m[1];
          if (knownIds.has(id)) cited.add(id);
        }
        const citations = [...cited];

        await db.message.create({
          data: {
            conversationId: convId,
            role: "ASSISTANT",
            content: full,
            citations: JSON.stringify(citations),
          },
        });

        // Bump conversation updatedAt and, for the first turn, set a title.
        if (isFirstTurn) {
          const title = await generateConversationTitle(question).catch(
            () => question.slice(0, 60),
          );
          await db.conversation.update({
            where: { id: convId },
            data: { title, updatedAt: new Date() },
          });
        } else {
          await db.conversation.update({
            where: { id: convId },
            data: { updatedAt: new Date() },
          });
        }

        controller.enqueue(
          encoder.encode(
            JSON.stringify({ type: "done", citations }) + "\n",
          ),
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Stream failed";
        controller.enqueue(
          encoder.encode(JSON.stringify({ type: "error", message: msg }) + "\n"),
        );
        // Persist partial reply so the user can see what was generated.
        if (full) {
          await db.message
            .create({
              data: {
                conversationId: convId,
                role: "ASSISTANT",
                content: full + "\n\n_[truncated due to error]_",
              },
            })
            .catch(() => {});
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
