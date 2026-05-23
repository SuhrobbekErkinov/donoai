import { LinkButton } from "@/components/ui/link-button";
import { PageHeader } from "@/components/app/page-header";
import { ArrowLeft } from "lucide-react";
import { KnowledgeForm } from "@/components/app/knowledge-form";

export default function NewKnowledgePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10 lg:py-12">
      <div className="mb-6">
        <LinkButton href="/knowledge" variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4" />
          Back to Knowledge Feed
        </LinkButton>
      </div>
      <PageHeader
        eyebrow="New contribution"
        title="Capture a piece of institutional knowledge"
        description="Documenting a workflow, a resolved case, or a hard-won tip takes a few minutes — and saves everyone time later. The AI will be able to cite this item by name."
      />
      <div className="mt-8">
        <KnowledgeForm />
      </div>
    </div>
  );
}
