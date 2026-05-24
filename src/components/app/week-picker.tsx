"use client";

import { useState, useTransition } from "react";
import { startOfWeekMonday } from "@/lib/weeks";
import { openReportForWeek } from "@/server/reports";
import { Button } from "@/components/ui/button";
import { IconBadge } from "./icon-badge";
import { CalendarDays, ArrowRight, Loader2 } from "lucide-react";

export type WeekPickerLabels = {
  pickWeek: string;
  selectedWeek: string;
  open: string;
};

export function WeekPicker({
  labels,
  localeTag,
}: {
  labels: WeekPickerLabels;
  localeTag: string;
}) {
  const [date, setDate] = useState("");
  const [pending, start] = useTransition();

  // Resolve the picked date to its Monday→Sunday week (UTC, matches storage).
  const monday = date ? startOfWeekMonday(new Date(date + "T00:00:00Z")) : null;
  const sunday = monday ? new Date(monday.getTime() + 6 * 86_400_000) : null;
  const fmt = new Intl.DateTimeFormat(localeTag, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  const rangeLabel =
    monday && sunday ? `${fmt.format(monday)} – ${fmt.format(sunday)}` : null;

  const open = () => {
    if (!monday) return;
    start(() => openReportForWeek(monday.toISOString()));
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <IconBadge tone="brand">
          <CalendarDays />
        </IconBadge>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-semibold">{labels.pickWeek}</div>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-ring"
            />
            {rangeLabel && (
              <div className="text-[12.5px] text-muted-foreground">
                <span className="font-medium text-foreground">
                  {labels.selectedWeek}:
                </span>{" "}
                {rangeLabel}
              </div>
            )}
            <Button
              onClick={open}
              disabled={!monday || pending}
              className="ml-auto"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {labels.open}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
