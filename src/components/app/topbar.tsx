import { getDictionary } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/config";
import { LanguageSwitcher } from "@/components/app/language-switcher";
import { NotificationMenu } from "@/components/app/notification-menu";
import { UserMenu } from "@/components/app/user-menu";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { Search } from "lucide-react";

export async function AppTopbar({
  user,
  locale,
}: {
  user: {
    name?: string | null;
    email?: string | null;
    role: string;
    department?: string | null;
  };
  locale: Locale;
}) {
  const { dict } = await getDictionary();
  const t = dict.topbar;

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
            placeholder={t.searchPlaceholder}
            className="h-9 w-full rounded-full border border-border bg-muted/40 pl-9 pr-16 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-ring focus:bg-card"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground sm:inline">
            /
          </kbd>
        </div>
      </form>

      <div className="ml-auto flex items-center gap-1.5">
        <ThemeToggle />
        <LanguageSwitcher current={locale} />
        <NotificationMenu
          labels={{
            notifications: t.notifications,
            noNotifications: t.noNotifications,
          }}
        />
        <UserMenu
          user={user}
          labels={{
            yourDashboard: t.yourDashboard,
            signOut: t.signOut,
            administrator: t.administrator,
            employee: t.employee,
          }}
        />
      </div>
    </header>
  );
}
