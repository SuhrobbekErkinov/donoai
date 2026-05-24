import { listConversations } from "@/server/assistant";
import { getLocale } from "@/lib/i18n/server";
import { LOCALE_BCP47 } from "@/lib/i18n/config";
import { ConversationSidebar } from "@/components/app/conversation-sidebar";

export default async function AssistantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [conversations, locale] = await Promise.all([
    listConversations(),
    getLocale(),
  ]);
  // Format dates on the server (stable locale + UTC) so the client component
  // doesn't reformat them and cause a hydration mismatch.
  const fmt = new Intl.DateTimeFormat(LOCALE_BCP47[locale], {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  const summaries = conversations.map((c) => ({
    id: c.id,
    title: c.title,
    dateLabel: fmt.format(new Date(c.updatedAt)),
    _count: c._count,
  }));

  return (
    <div className="flex h-full min-h-[calc(100vh-60px)]">
      <div className="min-w-0 flex-1">{children}</div>
      <ConversationSidebar conversations={summaries} />
    </div>
  );
}
