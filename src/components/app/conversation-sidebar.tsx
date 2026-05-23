"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LinkButton } from "@/components/ui/link-button";
import { useI18n } from "@/lib/i18n/client";
import { Plus, MessageSquareText, Sparkles } from "lucide-react";

export type ConversationSummary = {
  id: string;
  title: string;
  updatedAt: Date;
  _count: { messages: number };
};

export function ConversationSidebar({
  conversations,
}: {
  conversations: ConversationSummary[];
}) {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <aside className="hidden h-[calc(100vh-60px)] w-72 shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
      <div className="border-b border-border p-3">
        <LinkButton
          href="/assistant"
          variant="outline"
          className="w-full justify-start gap-2"
        >
          <Plus className="h-4 w-4" />
          {t.assistant.newConversation}
        </LinkButton>
      </div>

      <div className="px-4 pb-1 pt-4 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {t.assistant.history}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-3">
        {conversations.length === 0 ? (
          <div className="mx-2 mt-3 flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card/40 p-6 text-center">
            <Sparkles className="h-4 w-4 text-brand" />
            <p className="text-[12px] text-muted-foreground">
              Your conversations land here.
            </p>
          </div>
        ) : (
          conversations.map((c) => {
            const active = pathname === `/assistant/${c.id}`;
            return (
              <Link
                key={c.id}
                href={`/assistant/${c.id}`}
                className={`group relative block rounded-md px-2.5 py-2 transition-colors ${
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {active && (
                  <span
                    aria-hidden
                    className="absolute -left-1 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-brand"
                  />
                )}
                <div className="flex items-start gap-2">
                  <MessageSquareText
                    className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${active ? "text-brand" : "text-muted-foreground"}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-2 text-[12.5px] font-medium leading-snug">
                      {c.title}
                    </div>
                    <div
                      className={`mt-0.5 text-[10.5px] ${active ? "text-accent-foreground/70" : "text-muted-foreground"}`}
                    >
                      {c._count.messages} msg ·{" "}
                      {new Date(c.updatedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </nav>
    </aside>
  );
}
