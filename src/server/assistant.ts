"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/require-auth";

type Result<T = void> = { ok: true; data?: T } | { ok: false; error: string };

export async function listConversations() {
  const user = await requireUser();
  return db.conversation.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { messages: true } } },
  });
}

export async function getConversation(id: string) {
  const user = await requireUser();
  return db.conversation.findFirst({
    where: { id, userId: user.id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function deleteConversation(id: string): Promise<Result> {
  const user = await requireUser();
  const conv = await db.conversation.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });
  if (!conv) return { ok: false, error: "Not found" };
  await db.conversation.delete({ where: { id } });
  revalidatePath("/assistant");
  return { ok: true };
}
