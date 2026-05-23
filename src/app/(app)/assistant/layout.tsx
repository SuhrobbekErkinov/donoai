import { listConversations } from "@/server/assistant";
import { ConversationSidebar } from "@/components/app/conversation-sidebar";

export default async function AssistantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const conversations = await listConversations();
  return (
    <div className="flex h-full min-h-[calc(100vh-4rem)]">
      <ConversationSidebar conversations={conversations} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
