"use client";

import { Dropdown } from "./dropdown";
import { BellDot, BellOff } from "lucide-react";

export function NotificationMenu({
  labels,
}: {
  labels: { notifications: string; noNotifications: string };
}) {
  return (
    <Dropdown
      align="end"
      panelClassName="w-72"
      trigger={({ toggle, open }) => (
        <button
          type="button"
          onClick={toggle}
          aria-label={labels.notifications}
          aria-expanded={open}
          className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground"
        >
          <BellDot className="h-[18px] w-[18px]" />
        </button>
      )}
    >
      {() => (
        <div>
          <div className="px-3 py-2 text-sm font-semibold">
            {labels.notifications}
          </div>
          <div className="-mx-1 border-t border-border" />
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-muted text-muted-foreground">
              <BellOff className="h-4 w-4" />
            </div>
            <p className="text-[12.5px] text-muted-foreground">
              {labels.noNotifications}
            </p>
          </div>
        </div>
      )}
    </Dropdown>
  );
}
