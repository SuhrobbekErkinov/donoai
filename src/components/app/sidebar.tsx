"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  MessageSquareText,
  FileText,
  ShieldCheck,
  Plus,
  Sparkles,
  Building2,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  badge?: string | number;
};

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/knowledge", label: "Knowledge Feed", icon: BookOpen },
  { href: "/assistant", label: "AI Assistant", icon: MessageSquareText },
  { href: "/reports", label: "Weekly Reports", icon: FileText },
];

export function AppSidebar({ orgName }: { orgName: string }) {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col border-r border-border bg-sidebar md:flex">
      {/* Brand block */}
      <div className="px-5 pb-2 pt-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-foreground to-brand text-white shadow-soft">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <div className="text-[15px] font-semibold tracking-tight">
              DonoAI
            </div>
            <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Institutional memory
            </div>
          </div>
        </Link>
      </div>

      {/* Org chip */}
      <div className="mx-3 mb-4 mt-3 rounded-lg border border-border bg-card px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-brand-soft text-accent-foreground">
            <Building2 className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium">{orgName}</div>
            <div className="text-[10px] text-muted-foreground">Workspace</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3">
        <div className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Workspace
        </div>
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13.5px] font-medium transition-all",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {active && (
                <span
                  aria-hidden
                  className="absolute -left-1 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-brand"
                />
              )}
              <Icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors",
                  active ? "text-brand" : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && (
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground tabular-nums">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer CTA */}
      <div className="space-y-2 border-t border-border p-3">
        <Link
          href="/knowledge/new"
          className="group flex items-center gap-2 rounded-lg bg-foreground px-3 py-2.5 text-[13px] font-medium text-background shadow-soft transition-transform hover:-translate-y-px"
        >
          <Plus className="h-4 w-4" />
          <span className="flex-1">Add knowledge</span>
        </Link>
        <Link
          href="/assistant"
          className="group flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-[12.5px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Sparkles className="h-3.5 w-3.5 text-brand" />
          <span className="flex-1">Ask DonoAI</span>
          <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground sm:inline">
            ⌘K
          </kbd>
        </Link>
      </div>
    </aside>
  );
}
