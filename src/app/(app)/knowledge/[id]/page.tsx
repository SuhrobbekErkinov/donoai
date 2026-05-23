import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getKnowledge } from "@/server/knowledge";
import { requireUser } from "@/lib/require-auth";
import { LinkButton } from "@/components/ui/link-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Markdown } from "@/components/app/markdown";
import { TypeIcon, TypeChip } from "@/components/app/type-badge";
import { DeleteKnowledgeButton } from "@/components/app/delete-knowledge-button";
import {
  ArrowLeft,
  MessageSquareText,
  Clock,
  Calendar,
  Sparkles,
  Paperclip,
} from "lucide-react";
import { isAdminRole, KNOWLEDGE_TYPE_LABELS, type KnowledgeType } from "@/lib/enums";

function readingTime(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 220));
  return `${minutes} min read`;
}

export default async function KnowledgeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, k] = await Promise.all([requireUser(), getKnowledge(id)]);
  if (!k) notFound();

  const canEdit = k.authorId === user.id || isAdminRole(user.role);
  const tags = JSON.parse(k.tags) as string[];

  // Related — same type, plus any sharing a tag, excluding self.
  const related = await db.knowledgeItem.findMany({
    where: {
      orgId: user.orgId,
      id: { not: k.id },
      OR: [
        { type: k.type },
        ...tags.map((t) => ({ tags: { contains: `"${t}"` } })),
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 4,
    select: { id: true, title: true, type: true, summary: true },
  });

  const initials = k.author.name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 lg:py-12">
      {/* Back nav + actions */}
      <div className="mb-6 flex items-center justify-between">
        <LinkButton href="/knowledge" variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4" />
          Knowledge Feed
        </LinkButton>
        <div className="flex gap-2">
          <LinkButton
            href={`/assistant?ask=${encodeURIComponent(`Tell me about: ${k.title}`)}`}
            variant="outline"
            size="sm"
          >
            <Sparkles className="h-4 w-4 text-brand" />
            Ask DonoAI
          </LinkButton>
          {canEdit && <DeleteKnowledgeButton id={k.id} />}
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
        {/* Main article */}
        <article className="min-w-0">
          {/* Hero header */}
          <header className="flex items-start gap-5">
            <TypeIcon type={k.type} size="lg" />
            <div className="min-w-0 flex-1">
              <TypeChip type={k.type} />
              <h1 className="mt-2.5 text-[32px] font-semibold leading-tight tracking-[-0.015em]">
                {k.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px] text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="bg-gradient-to-br from-foreground to-brand text-[8px] text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground/80">
                    {k.author.name}
                  </span>
                  {k.author.department && <span>· {k.author.department}</span>}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(k.createdAt).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {readingTime(k.content)}
                </span>
                {k.sourceFilename && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium">
                    <Paperclip className="h-3 w-3" />
                    {k.sourceFilename}
                  </span>
                )}
              </div>
              {tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </header>

          {/* Summary callout */}
          {k.summary && (
            <div className="mt-8 rounded-xl border border-brand-soft bg-brand-soft/40 p-5">
              <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-accent-foreground">
                Summary
              </div>
              <p className="text-[14.5px] leading-relaxed text-foreground/90">
                {k.summary}
              </p>
            </div>
          )}

          {/* Body */}
          <div className="mt-8">
            <Markdown>{k.content}</Markdown>
          </div>
        </article>

        {/* Right rail */}
        <aside className="hidden space-y-6 lg:block">
          {/* Ask AI callout */}
          <div className="rounded-2xl border border-border bg-gradient-to-br from-foreground to-brand p-5 text-background">
            <Sparkles className="h-5 w-5" />
            <div className="mt-2.5 text-[14px] font-semibold leading-snug">
              Have a question about this?
            </div>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-background/75">
              Ask DonoAI — it'll answer using this item and any related
              knowledge.
            </p>
            <LinkButton
              href={`/assistant?ask=${encodeURIComponent(`Tell me about: ${k.title}`)}`}
              variant="secondary"
              size="sm"
              className="mt-4 w-full bg-white text-foreground hover:bg-white/90"
            >
              Start a chat
              <MessageSquareText className="ml-1 h-3.5 w-3.5" />
            </LinkButton>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div>
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Related items
              </div>
              <ul className="space-y-2">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/knowledge/${r.id}`}
                      className="group block rounded-xl border border-border bg-card p-3.5 transition-all hover:border-ring hover:shadow-soft"
                    >
                      <div className="text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                        {KNOWLEDGE_TYPE_LABELS[r.type as KnowledgeType] ?? r.type}
                      </div>
                      <div className="mt-1 line-clamp-2 text-[13px] font-medium leading-snug">
                        {r.title}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
