import { notFound } from "next/navigation";
import { getReport } from "@/server/reports";
import { getDictionary } from "@/lib/i18n/server";
import { LOCALE_BCP47 } from "@/lib/i18n/config";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader } from "@/components/app/page-header";
import { ArrowLeft } from "lucide-react";
import { ReportForm } from "@/components/app/report-form";

export default async function ReportEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [report, { locale, dict }] = await Promise.all([
    getReport(id),
    getDictionary(),
  ]);
  if (!report) notFound();

  const dateStr = new Intl.DateTimeFormat(LOCALE_BCP47[locale], {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(report.weekStart));
  const weekLabel = `${dict.reports.weekOf} ${dateStr}`;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 lg:py-12">
      <div className="mb-6">
        <LinkButton href="/reports" variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4" />
          {dict.reports.history}
        </LinkButton>
      </div>
      <PageHeader
        eyebrow={weekLabel}
        title={dict.reports.title}
        description={dict.reports.subtitle}
      />
      <div className="mt-8">
        <ReportForm
          reportId={report.id}
          weekStart={report.weekStart.toISOString()}
          weekLabel={weekLabel}
          initial={{
            tasksCompleted: report.tasksCompleted,
            challenges: report.challenges,
            keyActivities: report.keyActivities,
          }}
          status={report.status as "DRAFT" | "SUBMITTED"}
        />
      </div>
    </div>
  );
}
