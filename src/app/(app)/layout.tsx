import { db } from "@/lib/db";
import { requireUser } from "@/lib/require-auth";
import { AppSidebar } from "@/components/app/sidebar";
import { AppTopbar } from "@/components/app/topbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUser = await requireUser();
  // The session token doesn't carry `department` or org name — fetch for the chrome.
  const [user, org] = await Promise.all([
    db.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        name: true,
        email: true,
        role: true,
        department: true,
      },
    }),
    db.organization.findUnique({
      where: { id: sessionUser.orgId },
      select: { name: true },
    }),
  ]);
  return (
    <div className="flex min-h-screen flex-1 bg-background">
      <AppSidebar orgName={org?.name ?? "Workspace"} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar
          user={
            user ?? {
              role: "EMPLOYEE",
              name: null,
              email: null,
              department: null,
            }
          }
        />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
