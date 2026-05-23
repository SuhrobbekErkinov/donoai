import Link from "next/link";
import { listReports } from "@/server/reports";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { NewReportButton } from "@/components/app/new-report-button";
import { FileText, Calendar, CheckCircle2, Clock } from "lucide-react";

export default async function ReportsPage() {
  const reports = await listReports();

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 lg:py-12">
      <PageHeader
        eyebrow="Personal"
        title="Weekly Reports"
        description="Personal weekly summaries — auto-drafted by DonoAI from what you actually did this week."
        actions={<NewReportButton />}
      />

      <div className="mt-8">
        {reports.length === 0 ? (
          <EmptyState
            icon={<FileText />}
            title="No reports yet"
            description='Click "Open this week’s report" to get started. DonoAI can draft from your week’s activity in a few seconds.'
            action={<NewReportButton />}
          />
        ) : (
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
                        Week of{" "}
                        {new Date(r.weekStart).toLocaleDateString(undefined, {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {submitted && r.submittedAt
                          ? `Submitted ${new Date(r.submittedAt).toLocaleDateString()}`
                          : `Updated ${new Date(r.updatedAt).toLocaleDateString()}`}
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] ${
                        submitted
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {submitted ? "Submitted" : "Draft"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
