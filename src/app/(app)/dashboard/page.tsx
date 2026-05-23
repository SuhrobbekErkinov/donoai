import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/require-auth";
import { getDictionary } from "@/lib/i18n/server";
import { PageHeader } from "@/components/app/page-header";
import { IconBadge } from "@/components/app/icon-badge";
import { TypeIcon } from "@/components/app/type-badge";
import {
  BookOpen,
  MessageSquareText,
  FileText,
  ArrowRight,
  Sparkles,
  Plus,
  Clock,
  TrendingUp,
  Users,
  Library,
} from "lucide-react";

function greetingKey(): "greetingLate" | "greetingMorning" | "greetingAfternoon" | "greetingEvening" {
  const h = new Date().getHours();
  if (h < 5) return "greetingLate";
  if (h < 12) return "greetingMorning";
  if (h < 18) return "greetingAfternoon";
  return "greetingEvening";
}

export default async function DashboardPage() {
  const user = await requireUser();
  const { dict } = await getDictionary();
  const t = dict.dashboard;
  const since7d = new Date(Date.now() - 7 * 86400_000);

  const [
    knowledgeCount,
    peopleCount,
    weekKnowledgeCount,
    myConvCount,
    recent,
    myConvs,
  ] = await Promise.all([
    db.knowledgeItem.count({ where: { orgId: user.orgId } }),
    db.user.count({ where: { orgId: user.orgId } }),
    db.knowledgeItem.count({
      where: { orgId: user.orgId, createdAt: { gte: since7d } },
    }),
    db.conversation.count({ where: { userId: user.id } }),
    db.knowledgeItem.findMany({
      where: { orgId: user.orgId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { author: { select: { name: true } } },
    }),
    db.conversation.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 4,
      include: { _count: { select: { messages: true } } },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 lg:py-12">
      <PageHeader
        eyebrow={new Date().toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
        title={
          <>
            {t[greetingKey()]},{" "}
            <span className="text-muted-foreground">
              {user.name?.split(" ")[0]}.
            </span>
          </>
        }
        description={t.subtitle}
      />

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          icon={<Library className="h-4 w-4" />}
          tone="brand"
          label={t.statKnowledge}
          value={knowledgeCount}
          delta={
            weekKnowledgeCount > 0
              ? `+${weekKnowledgeCount} ${t.thisWeek}`
              : "—"
          }
        />
        <StatTile
          icon={<Users className="h-4 w-4" />}
          tone="sky"
          label={t.statPeople}
          value={peopleCount}
        />
        <StatTile
          icon={<MessageSquareText className="h-4 w-4" />}
          tone="violet"
          label={t.statConversations}
          value={myConvCount}
        />
        <StatTile
          icon={<TrendingUp className="h-4 w-4" />}
          tone="emerald"
          label={t.statCitation}
          value="100%"
          hint={t.citationHint}
        />
      </div>

      {/* Action cards */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <ActionCard
          href="/knowledge"
          icon={<BookOpen className="h-5 w-5" />}
          tone="brand"
          title={t.browseKnowledge}
          body={t.browseKnowledgeBody}
        />
        <ActionCard
          href="/assistant"
          icon={<MessageSquareText className="h-5 w-5" />}
          tone="violet"
          title={t.askAssistant}
          body={t.askAssistantBody}
        />
        <ActionCard
          href="/reports"
          icon={<FileText className="h-5 w-5" />}
          tone="amber"
          title={t.weeklyReport}
          body={t.weeklyReportBody}
        />
      </div>

      {/* Activity columns */}
      <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Recent knowledge */}
        <section>
          <SectionTitle
            title={t.recentKnowledge}
            action={
              <Link
                href="/knowledge/new"
                className="inline-flex items-center gap-1 text-[12px] font-medium text-brand hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                {t.add}
              </Link>
            }
          />
          {recent.length === 0 ? (
            <EmptyPanel
              icon={<BookOpen className="h-5 w-5" />}
              text={t.noKnowledge}
            />
          ) : (
            <ul className="space-y-2">
              {recent.map((k) => (
                <li key={k.id}>
                  <Link
                    href={`/knowledge/${k.id}`}
                    className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-ring hover:shadow-soft"
                  >
                    <TypeIcon type={k.type} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14px] font-medium">
                        {k.title}
                      </div>
                      {k.summary && (
                        <p className="mt-1 line-clamp-2 text-[12.5px] leading-snug text-muted-foreground">
                          {k.summary}
                        </p>
                      )}
                      <div className="mt-1.5 text-[11px] text-muted-foreground">
                        {k.author.name} ·{" "}
                        {new Date(k.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent conversations */}
        <section>
          <SectionTitle
            title={t.yourChats}
            action={
              <Link
                href="/assistant"
                className="inline-flex items-center gap-1 text-[12px] font-medium text-brand hover:underline"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {t.new}
              </Link>
            }
          />
          {myConvs.length === 0 ? (
            <EmptyPanel
              icon={<MessageSquareText className="h-5 w-5" />}
              text={t.noChats}
            />
          ) : (
            <ul className="space-y-2">
              {myConvs.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/assistant/${c.id}`}
                    className="group block rounded-xl border border-border bg-card p-3.5 transition-all hover:border-ring hover:shadow-soft"
                  >
                    <div className="line-clamp-2 text-[13.5px] font-medium leading-snug">
                      {c.title}
                    </div>
                    <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(c.updatedAt).toLocaleDateString()}
                      </span>
                      <span>
                        {c._count.messages} message
                        {c._count.messages === 1 ? "" : "s"}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function StatTile({
  icon,
  tone,
  label,
  value,
  delta,
  hint,
}: {
  icon: React.ReactNode;
  tone: "brand" | "violet" | "amber" | "emerald" | "sky";
  label: string;
  value: number | string;
  delta?: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <IconBadge tone={tone} size="sm">
          {icon}
        </IconBadge>
        {delta && (
          <span className="text-[10.5px] font-medium text-emerald-700">
            {delta}
          </span>
        )}
      </div>
      <div className="mt-3 text-[26px] font-semibold tracking-tight tabular-nums">
        {value}
      </div>
      <div className="mt-0.5 text-[12px] text-muted-foreground">
        {label}
        {hint && <span className="ml-1 opacity-70">· {hint}</span>}
      </div>
    </div>
  );
}

function ActionCard({
  href,
  icon,
  tone,
  title,
  body,
}: {
  href: string;
  icon: React.ReactNode;
  tone: "brand" | "violet" | "amber";
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-px hover:border-ring hover:shadow-soft"
    >
      <IconBadge tone={tone}>{icon}</IconBadge>
      <h3 className="mt-4 text-[15px] font-semibold tracking-tight">
        {title}
      </h3>
      <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
        {body}
      </p>
      <span className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium text-brand">
        Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {title}
      </h2>
      {action}
    </div>
  );
}

function EmptyPanel({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/40 p-8 text-center">
      <div className="mx-auto mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
