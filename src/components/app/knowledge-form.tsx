"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  X,
  GitBranch,
  FileText,
  Briefcase,
  Sparkles,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import { KNOWLEDGE_TYPES, type KnowledgeType } from "@/lib/enums";
import { createKnowledge, updateKnowledge } from "@/server/knowledge";

type Props = {
  initial?: {
    id: string;
    title: string;
    content: string;
    type: KnowledgeType;
    tags: string[];
  };
};

const TYPE_META: Record<
  KnowledgeType,
  {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    description: string;
  }
> = {
  WORKFLOW: {
    icon: GitBranch,
    label: "Workflow",
    description: "A step-by-step procedure your team follows.",
  },
  DOCUMENT: {
    icon: FileText,
    label: "Document",
    description: "A policy, checklist, or reference document.",
  },
  CASE: {
    icon: Briefcase,
    label: "Case",
    description: "A real situation and how it was resolved.",
  },
  BEST_PRACTICE: {
    icon: Sparkles,
    label: "Best practice",
    description: "The right way to do something, distilled.",
  },
  TIP: {
    icon: Lightbulb,
    label: "Tip",
    description: "A small piece of hard-won wisdom.",
  },
};

export function KnowledgeForm({ initial }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [type, setType] = useState<KnowledgeType>(initial?.type ?? "DOCUMENT");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [tagDraft, setTagDraft] = useState("");
  const [pending, start] = useTransition();

  const addTag = () => {
    const t = tagDraft.trim().toLowerCase();
    if (!t) return;
    if (tags.includes(t)) return;
    if (tags.length >= 10) {
      toast.error("Max 10 tags");
      return;
    }
    setTags([...tags, t]);
    setTagDraft("");
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  const submit = () =>
    start(async () => {
      const payload = { title, content, type, tags };
      if (initial) {
        const r = await updateKnowledge(initial.id, payload);
        if (r.ok) {
          toast.success("Saved");
          router.refresh();
        } else toast.error(r.error);
      } else {
        try {
          const r = await createKnowledge(payload);
          if (r && !r.ok) toast.error(r.error);
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Create failed";
          if (!msg.includes("NEXT_REDIRECT")) toast.error(msg);
        }
      }
    });

  return (
    <div className="space-y-7">
      {/* Type picker */}
      <div className="space-y-2">
        <Label className="text-[13px]">Type</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {KNOWLEDGE_TYPES.map((t) => {
            const meta = TYPE_META[t];
            const Icon = meta.icon;
            const active = type === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`relative flex flex-col items-start rounded-xl border p-3.5 text-left transition-all ${
                  active
                    ? "border-foreground bg-foreground/5 shadow-soft"
                    : "border-border bg-card hover:border-ring/40 hover:bg-muted/30"
                }`}
              >
                {active && (
                  <CheckCircle2 className="absolute right-2 top-2 h-4 w-4 text-brand" />
                )}
                <div
                  className={`mb-2 grid h-8 w-8 place-items-center rounded-lg ${
                    active
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-[13px] font-medium">{meta.label}</div>
                <div className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                  {meta.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title" className="text-[13px]">
          Title
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Wire transfer dispute resolution"
          className="h-11 text-[15px]"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="tags" className="text-[13px]">
            Tags
          </Label>
          <span className="text-[11px] text-muted-foreground">
            {tags.length}/10
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-2 focus-within:border-ring">
          {tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[12px] font-medium"
            >
              {t}
              <button
                type="button"
                onClick={() => setTags(tags.filter((x) => x !== t))}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Remove tag"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            id="tags"
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
              if (e.key === "Backspace" && !tagDraft && tags.length > 0) {
                setTags(tags.slice(0, -1));
              }
            }}
            placeholder={tags.length === 0 ? "Add tags…" : ""}
            className="min-w-[120px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="content" className="text-[13px]">
            Content
          </Label>
          <span className="text-[11px] text-muted-foreground">
            {wordCount.toLocaleString()} words · markdown supported
          </span>
        </div>
        <Textarea
          id="content"
          rows={16}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Describe the workflow, document the case, or share the best practice. Be specific — concrete examples beat abstractions. Markdown headings, lists, and code blocks all render."
          className="resize-y font-mono text-[13.5px] leading-relaxed"
        />
      </div>

      <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-xl border border-border bg-card/95 px-4 py-3 shadow-lift backdrop-blur">
        <div className="text-[12px] text-muted-foreground">
          {initial ? "Editing" : "New knowledge item"} — visible to anyone in
          your workspace.
        </div>
        <Button onClick={submit} disabled={pending || !title || !content}>
          {pending
            ? initial
              ? "Saving…"
              : "Publishing…"
            : initial
              ? "Save changes"
              : "Publish"}
        </Button>
      </div>
    </div>
  );
}
