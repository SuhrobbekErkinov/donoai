"use client";

import Link from "next/link";
import { Dropdown } from "./dropdown";
import { signOutAction } from "@/server/auth-actions";
import { LogOut, User as UserIcon } from "lucide-react";

export function UserMenu({
  user,
  labels,
}: {
  user: {
    name?: string | null;
    email?: string | null;
    role: string;
    department?: string | null;
  };
  labels: {
    yourDashboard: string;
    signOut: string;
    administrator: string;
    employee: string;
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
    <Dropdown
      align="end"
      panelClassName="w-64"
      trigger={({ toggle, open }) => (
        <button
          type="button"
          onClick={toggle}
          aria-label="Open profile menu"
          aria-expanded={open}
          className="grid h-9 w-9 place-items-center rounded-full outline-none ring-2 ring-transparent transition-all hover:ring-brand-soft focus-visible:ring-ring aria-expanded:ring-brand-soft"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-foreground to-brand text-[11px] font-semibold text-white">
            {initials}
          </span>
        </button>
      )}
    >
      {(close) => (
        <div>
          <div className="px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-foreground to-brand text-[11px] font-semibold text-white">
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{user.name}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {user.email}
                </div>
              </div>
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-medium text-accent-foreground">
                {user.role === "ADMIN" ? labels.administrator : labels.employee}
              </span>
              {user.department && (
                <span className="text-[10px] text-muted-foreground">
                  {user.department}
                </span>
              )}
            </div>
          </div>

          <div className="-mx-1 border-t border-border" />

          <Link
            href="/dashboard"
            onClick={close}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
          >
            <UserIcon className="h-4 w-4 text-muted-foreground" />
            {labels.yourDashboard}
          </Link>

          <div className="-mx-1 border-t border-border" />

          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
            >
              <LogOut className="h-4 w-4 text-muted-foreground" />
              {labels.signOut}
            </button>
          </form>
        </div>
      )}
    </Dropdown>
  );
}
