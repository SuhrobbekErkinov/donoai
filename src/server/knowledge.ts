"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/require-auth";
import {
  KnowledgeInputSchema,
  type KnowledgeInput,
} from "@/lib/schemas";

type Result<T = void> = { ok: true; data?: T } | { ok: false; error: string };

export async function listKnowledge(filter?: {
  type?: string;
  q?: string;
}) {
  const user = await requireUser();
  return db.knowledgeItem.findMany({
    where: {
      orgId: user.orgId,
      ...(filter?.type ? { type: filter.type } : {}),
      ...(filter?.q
        ? {
            OR: [
              { title: { contains: filter.q } },
              { content: { contains: filter.q } },
              { summary: { contains: filter.q } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { id: true, name: true } } },
  });
}

export async function getKnowledge(id: string) {
  const user = await requireUser();
  return db.knowledgeItem.findFirst({
    where: { id, orgId: user.orgId },
    include: { author: { select: { id: true, name: true, department: true } } },
  });
}

export async function createKnowledge(
  raw: KnowledgeInput,
): Promise<never | Result> {
  const user = await requireUser();
  const parsed = KnowledgeInputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }
  const item = await db.knowledgeItem.create({
    data: {
      orgId: user.orgId,
      authorId: user.id,
      title: parsed.data.title,
      content: parsed.data.content,
      type: parsed.data.type,
      tags: JSON.stringify(parsed.data.tags),
      sourceFilename: parsed.data.sourceFilename ?? null,
    },
  });
  revalidatePath("/knowledge");
  revalidatePath("/dashboard");
  redirect(`/knowledge/${item.id}`);
}

export async function updateKnowledge(
  id: string,
  raw: KnowledgeInput,
): Promise<Result> {
  const user = await requireUser();
  const parsed = KnowledgeInputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }
  const found = await db.knowledgeItem.findFirst({
    where: { id, orgId: user.orgId },
    select: { authorId: true },
  });
  if (!found) return { ok: false, error: "Not found" };
  // Authors and admins can edit; everyone else cannot.
  if (found.authorId !== user.id && user.role !== "ADMIN") {
    return { ok: false, error: "You can only edit your own knowledge items" };
  }
  await db.knowledgeItem.update({
    where: { id },
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      type: parsed.data.type,
      tags: JSON.stringify(parsed.data.tags),
    },
  });
  revalidatePath("/knowledge");
  revalidatePath(`/knowledge/${id}`);
  return { ok: true };
}

export async function deleteKnowledge(id: string): Promise<Result> {
  const user = await requireUser();
  const found = await db.knowledgeItem.findFirst({
    where: { id, orgId: user.orgId },
    select: { authorId: true },
  });
  if (!found) return { ok: false, error: "Not found" };
  if (found.authorId !== user.id && user.role !== "ADMIN") {
    return { ok: false, error: "You can only delete your own knowledge items" };
  }
  await db.knowledgeItem.delete({ where: { id } });
  revalidatePath("/knowledge");
  return { ok: true };
}
