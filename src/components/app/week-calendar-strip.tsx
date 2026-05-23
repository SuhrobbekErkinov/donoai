"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Check, Plus, Pencil, Loader2 } from "lucide-react";
import { openReportForWeek } from "@/server/reports";

export type WeekCell = {
  weekStartISO: string;
  rangeLabel: string;
  isCurrent: boolean;
  report: { id: string; status: string } | null;
};

export type StripLabels = {
  recentWeeks: string;
  thisWeek: string;
  draft: string;
  submitted: string;
  notStarted: string;
};

export function WeekCalendarStrip({
  weeks,
  labels,
}: {
  weeks: WeekCell[];
  labels: StripLabels;
}) {
  const [openingISO, setOpeningISO] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const open = (iso: string) => {
    setOpeningISO(iso);
    startTransition(() => {
      void openReportForWeek(iso);
    });
  };

  return (
    <section>
      <div className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {labels.recentWeeks}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {weeks.map((w) => {
          const status = w.report?.status;
          const opening = openingISO === w.weekStartISO;

          const tone =
            status === "SUBMITTED"
              ? "border-emerald-200 bg-emerald-50 hover:border-emerald-300"
              : status === "DRAFT"
                ? "border-amber-200 bg-amber-50 hover:border-amber-300"
                : "border-dashed border-border bg-card hover:border-ring";

          const ring = w.isCurrent ? "ring-2 ring-brand ring-offset-1" : "";

          const inner = (
            <>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12px] font-medium tabular-nums">
                  {w.rangeLabel}
                </span>
                <StatusDot status={status} opening={opening} />
              </div>
              <div className="mt-1.5 text-[10.5px] font-medium">
                {w.isCurrent ? (
                  <span className="text-brand">{labels.thisWeek}</span>
                ) : status === "SUBMITTED" ? (
                  <span className="text-emerald-700">{labels.submitted}</span>
                ) : status === "DRAFT" ? (
                  <span className="text-amber-700">{labels.draft}</span>
                ) : (
                  <span className="text-muted-foreground">
                    {labels.notStarted}
                  </span>
                )}
              </div>
            </>
          );

          const cls = `flex min-w-[128px] shrink-0 flex-col rounded-xl border p-3 text-left transition-all ${tone} ${ring}`;

          return w.report ? (
            <Link key={w.weekStartISO} href={`/reports/${w.report.id}`} className={cls}>
              {inner}
            </Link>
          ) : (
            <button
              key={w.weekStartISO}
              type="button"
              onClick={() => open(w.weekStartISO)}
              disabled={opening}
              className={`${cls} disabled:opacity-60`}
            >
              {inner}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function StatusDot({
  status,
  opening,
}: {
  status: string | undefined;
  opening: boolean;
}) {
  if (opening)
    return <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />;
  if (status === "SUBMITTED")
    return <Check className="h-3.5 w-3.5 text-emerald-600" />;
  if (status === "DRAFT")
    return <Pencil className="h-3.5 w-3.5 text-amber-600" />;
  return <Plus className="h-3.5 w-3.5 text-muted-foreground" />;
}
