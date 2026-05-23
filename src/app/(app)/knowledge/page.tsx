import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/require-auth";
import { listKnowledge } from "@/server/knowledge";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { KnowledgeCard } from "@/components/app/knowledge-card";
import { Plus, BookOpen, Search } from "lucide-react";
import {
  KNOWLEDGE_TYPES,
  KNOWLEDGE_TYPE_LABELS,
  type KnowledgeType,
} from "@/lib/enums";

export default async function KnowledgeListPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const user = await requireUser();

  const [items, counts] = await Promise.all([
    listKnowledge({ type: sp.type, q: sp.q }),
    db.knowledgeItem.groupBy({
      by: ["type"],
      where: { orgId: user.orgId },
      _count: { _all: true },
    }),
  ]);
  const totalCount = counts.reduce((a, c) => a + c._count._all, 0);
  const countByType = (t: KnowledgeType): number =>
    counts.find((c) => c.type === t)?._count._all ?? 0;

  const hasFilter = !!(sp.type || sp.q);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 lg:py-12">
      <PageHeader
        eyebrow="Workspace"
        title="Knowledge Feed"
        description="Workflows, cases, and best practices documented by your team. Every item the AI cites lives here."
        actions={
          <LinkButton href="/knowledge/new">
            <Plus className="h-4 w-4" />
            Add knowledge
          </LinkButton>
        }
      />

      {/* Filter row */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            type="search"
            defaultValue={sp.q ?? ""}
            placeholder="Search title, content, or summary…"
            className="h-10 w-full rounded-full border border-border bg-card pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
          />
          {sp.type && <input type="hidden" name="type" value={sp.type} />}
        </form>
        <div className="flex flex-wrap gap-1.5 overflow-x-auto">
          <FilterPill
            href={sp.q ? `/knowledge?q=${encodeURIComponent(sp.q)}` : "/knowledge"}
            label="All"
            count={totalCount}
            active={!sp.type}
          />
          {KNOWLEDGE_TYPES.map((t) => (
            <FilterPill
              key={t}
              href={`/knowledge?type=${t}${sp.q ? `&q=${encodeURIComponent(sp.q)}` : ""}`}
              label={KNOWLEDGE_TYPE_LABELS[t]}
              count={countByType(t)}
              active={sp.type === t}
            />
          ))}
        </div>
      </div>

      <div className="mt-6">
        {items.length === 0 ? (
          <EmptyState
            icon={<BookOpen />}
            title={hasFilter ? "No matches" : "Your knowledge base is empty"}
            description={
              hasFilter
                ? "Try removing filters, or contribute the first matching item."
                : "The first contribution is the start of your institutional memory. Document a workflow, a resolved case, or a best practice."
            }
            action={
              <LinkButton href="/knowledge/new">
                <Plus className="h-4 w-4" />
                Add knowledge
              </LinkButton>
            }
          />
        ) : (
          <ul className="space-y-3">
            {items.map((k) => (
              <li key={k.id}>
                <KnowledgeCard
                  item={{
                    id: k.id,
                    title: k.title,
                    type: k.type,
                    summary: k.summary,
                    tags: JSON.parse(k.tags) as string[],
                    author: k.author,
                    createdAt: k.createdAt,
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function FilterPill({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {label}
      <span
        className={`tabular-nums ${active ? "text-background/70" : "text-muted-foreground"}`}
      >
        {count}
      </span>
    </Link>
  );
}
