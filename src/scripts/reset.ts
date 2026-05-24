// Clears user activity (chat history + weekly reports) while keeping the
// organization, accounts, and knowledge base intact. Resets dashboard stats
// that derive from this data (e.g. "Your conversations" → 0).
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const messages = await db.message.deleteMany();
  const conversations = await db.conversation.deleteMany();
  const reports = await db.weeklyReport.deleteMany();

  console.log("✓ reset complete");
  console.log(`  messages:      ${messages.count}`);
  console.log(`  conversations: ${conversations.count}`);
  console.log(`  reports:       ${reports.count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
