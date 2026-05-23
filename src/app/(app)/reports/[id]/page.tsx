import { notFound } from "next/navigation";
import { getReport } from "@/server/reports";
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
  const report = await getReport(id);
  if (!report) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 lg:py-12">
      <div className="mb-6">
        <LinkButton href="/reports" variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4" />
          All reports
        </LinkButton>
      </div>
      <PageHeader
        eyebrow={`Week of ${new Date(report.weekStart).toLocaleDateString(undefined, { month: "long", day: "numeric" })}`}
        title="Weekly report"
        description="Three sections to summarize your week. Use ‘Draft from my week’ to have DonoAI compile a draft from your activity."
      />
      <div className="mt-8">
        <ReportForm
          reportId={report.id}
          weekStart={report.weekStart.toISOString()}
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
