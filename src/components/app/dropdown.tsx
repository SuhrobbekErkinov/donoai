"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Dependency-light dropdown: useState open + click-outside + Escape.
// Reliable replacement for the Base UI Menu in the topbar chrome.
export function Dropdown({
  trigger,
  children,
  align = "end",
  panelClassName,
}: {
  trigger: (state: { open: boolean; toggle: () => void }) => React.ReactNode;
  children: (close: () => void) => React.ReactNode;
  align?: "start" | "end";
  panelClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open && (
        <div
          role="menu"
          className={cn(
            "absolute top-[calc(100%+0.5rem)] z-50 rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lift",
            "duration-100 animate-in fade-in-0 zoom-in-95",
            align === "end" ? "right-0" : "left-0",
            panelClassName,
          )}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}
