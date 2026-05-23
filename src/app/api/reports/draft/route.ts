import type { NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/require-auth";
import { db } from "@/lib/db";
import { streamWeeklyDraft, type WeekActivity } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const InputSchema = z.object({
  reportId: z.string(),
});

export async function POST(req: NextRequest) {
  const user = await requireUser();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = InputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }

  const report = await db.weeklyReport.findFirst({
    where: { id: parsed.data.reportId, userId: user.id },
    select: { weekStart: true },
  });
  if (!report) {
    return Response.json({ error: "Report not found" }, { status: 404 });
  }

  const weekStart = report.weekStart;
  const weekEnd = new Date(weekStart.getTime() + 7 * 86400_000);

  const [authoredKnowledge, conversations] = await Promise.all([
    db.knowledgeItem.findMany({
      where: {
        authorId: user.id,
        createdAt: { gte: weekStart, lt: weekEnd },
      },
      select: { title: true, type: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    db.conversation.findMany({
      where: {
        userId: user.id,
        updatedAt: { gte: weekStart, lt: weekEnd },
      },
      include: { _count: { select: { messages: true } } },
      orderBy: { updatedAt: "asc" },
    }),
  ]);

  const activity: WeekActivity = {
    weekStartISO: weekStart.toISOString().slice(0, 10),
    weekEndISO: weekEnd.toISOString().slice(0, 10),
    authoredKnowledge: authoredKnowledge.map((k) => ({
      title: k.title,
      type: k.type,
      createdAt: k.createdAt.toISOString().slice(0, 10),
    })),
    conversations: conversations.map((c) => ({
      title: c.title,
      messageCount: c._count.messages,
    })),
  };

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const delta of streamWeeklyDraft(activity)) {
          controller.enqueue(
            encoder.encode(JSON.stringify({ type: "delta", text: delta }) + "\n"),
          );
        }
        controller.enqueue(encoder.encode(JSON.stringify({ type: "done" }) + "\n"));
      } catch (e) {
        controller.enqueue(
          encoder.encode(
            JSON.stringify({
              type: "error",
              message: e instanceof Error ? e.message : "Draft failed",
            }) + "\n",
          ),
        );
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
