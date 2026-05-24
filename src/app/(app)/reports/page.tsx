import Link from "next/link";
import { listReports } from "@/server/reports";
import { getDictionary } from "@/lib/i18n/server";
import { LOCALE_BCP47 } from "@/lib/i18n/config";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { NewReportButton } from "@/components/app/new-report-button";
import { WeekPicker } from "@/components/app/week-picker";
import { FileText, Calendar, CheckCircle2, Clock } from "lucide-react";

export default async function ReportsPage() {
  const [reports, { locale, dict }] = await Promise.all([
    listReports(),
    getDictionary(),
  ]);
  const tr = dict.reports;
  const tag = LOCALE_BCP47[locale];

  const dateFmt = new Intl.DateTimeFormat(tag, {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 lg:py-12">
      <PageHeader
        title={tr.title}
        description={tr.subtitle}
        actions={<NewReportButton />}
      />

      {/* Calendar week picker */}
      <div className="mt-8">
        <WeekPicker
          localeTag={tag}
          labels={{
            pickWeek: tr.pickWeek,
            selectedWeek: tr.selectedWeek,
            open: tr.open,
          }}
        />
      </div>

      {/* Full history */}
      <div className="mt-8">
        {reports.length === 0 ? (
          <EmptyState
            icon={<FileText />}
            title={tr.emptyTitle}
            description={tr.subtitle}
            action={<NewReportButton />}
          />
        ) : (
          <>
            <div className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {tr.history}
            </div>
            <ul className="space-y-2.5">
              {reports.map((r) => {
                const submitted = r.status === "SUBMITTED";
                return (
                  <li key={r.id}>
                    <Link
                      href={`/reports/${r.id}`}
                      className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-ring hover:shadow-soft"
                    >
                      <div
                        className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${
                          submitted
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {submitted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <Calendar className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[14.5px] font-semibold">
                          {tr.weekOf} {dateFmt.format(new Date(r.weekStart))}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {submitted && r.submittedAt
                            ? `${tr.submitted} · ${new Date(r.submittedAt).toLocaleDateString(tag)}`
                            : new Date(r.updatedAt).toLocaleDateString(tag)}
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] ${
                          submitted
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {submitted ? tr.submitted : tr.draft}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
