import { requireUser } from "@/lib/require-auth";
import { Chat } from "@/components/app/chat";

export default async function AssistantHome({
  searchParams,
}: {
  searchParams: Promise<{ ask?: string }>;
}) {
  const [sp, user] = await Promise.all([searchParams, requireUser()]);
  return (
    <Chat
      initialAsk={sp.ask}
      firstName={user.name?.split(" ")[0] ?? null}
    />
  );
}
