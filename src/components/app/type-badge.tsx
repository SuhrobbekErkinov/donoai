import { IconBadge } from "./icon-badge";
import {
  GitBranch,
  FileText,
  Briefcase,
  Sparkles,
  Lightbulb,
} from "lucide-react";
import { KNOWLEDGE_TYPE_LABELS, type KnowledgeType } from "@/lib/enums";

// Maps a knowledge type to a (label, icon, tone) triple — one source of truth.
const META: Record<
  KnowledgeType,
  {
    icon: React.ComponentType<{ className?: string }>;
    tone: "brand" | "amber" | "rose" | "violet" | "emerald" | "sky";
  }
> = {
  WORKFLOW: { icon: GitBranch, tone: "brand" },
  DOCUMENT: { icon: FileText, tone: "sky" },
  CASE: { icon: Briefcase, tone: "violet" },
  BEST_PRACTICE: { icon: Sparkles, tone: "emerald" },
  TIP: { icon: Lightbulb, tone: "amber" },
};

export function getTypeMeta(type: KnowledgeType | string) {
  const t = (type as KnowledgeType) in META
    ? (type as KnowledgeType)
    : "DOCUMENT";
  return { ...META[t], label: KNOWLEDGE_TYPE_LABELS[t] };
}

export function TypeIcon({
  type,
  size = "md",
}: {
  type: KnowledgeType | string;
  size?: "sm" | "md" | "lg";
}) {
  const meta = getTypeMeta(type);
  const Icon = meta.icon;
  return (
    <IconBadge tone={meta.tone} size={size}>
      <Icon />
    </IconBadge>
  );
}

export function TypeChip({ type }: { type: KnowledgeType | string }) {
  const meta = getTypeMeta(type);
  const Icon = meta.icon;
  const toneText: Record<typeof meta.tone, string> = {
    brand: "text-accent-foreground bg-brand-soft",
    amber: "text-amber-800 bg-amber-100",
    rose: "text-rose-800 bg-rose-100",
    violet: "text-violet-800 bg-violet-100",
    emerald: "text-emerald-800 bg-emerald-100",
    sky: "text-sky-800 bg-sky-100",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${toneText[meta.tone]}`}
    >
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}
