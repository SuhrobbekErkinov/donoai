import { notFound } from "next/navigation";
import { requireUser } from "@/lib/require-auth";
import { getConversation } from "@/server/assistant";
import { Chat, type ChatMessage } from "@/components/app/chat";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, conv] = await Promise.all([requireUser(), getConversation(id)]);
  if (!conv) notFound();

  const initial: ChatMessage[] = conv.messages.map((m) => ({
    role: m.role as ChatMessage["role"],
    content: m.content,
  }));

  return (
    <Chat
      conversationId={conv.id}
      initialMessages={initial}
      firstName={user.name?.split(" ")[0] ?? null}
    />
  );
}
