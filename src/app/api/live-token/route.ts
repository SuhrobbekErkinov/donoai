import { requireUser } from "@/lib/require-auth";
import { getLocale } from "@/lib/i18n/server";
import { db } from "@/lib/db";
import { createLiveSession, type KnowledgeChunk } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Mints an ephemeral Gemini Live token + the session config (KB-grounded).
export async function POST() {
  const user = await requireUser();
  const locale = await getLocale();

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

  try {
    const { token, model, config } = await createLiveSession(knowledge, locale);
    return Response.json({ token, model, config });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to start live session";
    return Response.json({ error: msg }, { status: 500 });
  }
}
