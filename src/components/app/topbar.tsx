import Link from "next/link";
import { signOut } from "@/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, BellDot, LogOut, User as UserIcon } from "lucide-react";

export function AppTopbar({
  user,
}: {
  user: {
    name?: string | null;
    email?: string | null;
    role: string;
    department?: string | null;
  };
}) {
  const initials =
    user.name
      ?.split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "??";

  return (
    <header className="sticky top-0 z-30 flex h-[60px] items-center gap-4 border-b border-border bg-background/80 px-6 backdrop-blur-md">
      {/* Universal search */}
      <form
        action="/knowledge"
        method="GET"
        className="hidden max-w-md flex-1 sm:block"
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            type="search"
            placeholder="Search knowledge — workflows, cases, policies"
            className="h-9 w-full rounded-full border border-border bg-muted/40 pl-9 pr-16 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-ring focus:bg-card"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground sm:inline">
            /
          </kbd>
        </div>
      </form>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          aria-label="Notifications"
          className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <BellDot className="h-[18px] w-[18px]" />
        </button>

        <DropdownMenu>
          {/* Trigger renders its own native <button>; wrap Avatar as child. */}
          <DropdownMenuTrigger
            aria-label="Open profile menu"
            className="grid h-9 w-9 place-items-center rounded-full outline-none ring-2 ring-transparent transition-all hover:ring-brand-soft focus-visible:ring-ring"
          >
            <Avatar className="h-9 w-9 cursor-pointer">
              <AvatarFallback className="bg-gradient-to-br from-foreground to-brand text-[11px] font-semibold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} className="w-64 p-1">
            <DropdownMenuLabel className="px-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-gradient-to-br from-foreground to-brand text-[11px] font-semibold text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{user.name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </div>
                </div>
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-medium text-accent-foreground">
                  {user.role === "ADMIN" ? "Administrator" : "Employee"}
                </span>
                {user.department && (
                  <span className="text-[10px] text-muted-foreground">
                    {user.department}
                  </span>
                )}
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* Render nav and sign-out as plain elements (NOT inside MenuItem)
                so Base UI's click interception doesn't swallow navigation or
                form submission. We trade keyboard nav for guaranteed behavior. */}
            <Link
              href="/dashboard"
              className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
            >
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              Your dashboard
            </Link>

            <DropdownMenuSeparator />

            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
              >
                <LogOut className="h-4 w-4 text-muted-foreground" />
                Sign out
              </button>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
