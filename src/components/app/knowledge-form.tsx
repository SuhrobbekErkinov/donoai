"use client";

import { useRef, useState, useTransition } from "react";
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
  Upload,
  Loader2,
  FileUp,
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
    sourceFilename?: string | null;
  };
};

const ACCEPT =
  ".pdf,.png,.jpg,.jpeg,.webp,.txt,.md,.csv,application/pdf,image/png,image/jpeg,image/webp,text/plain,text/markdown,text/csv";

function stripExt(name: string): string {
  return name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
}
function firstHeading(md: string): string | null {
  const m = md.match(/^#{1,3}\s+(.+)$/m);
  return m ? m[1].trim() : null;
}

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
  const [sourceFilename, setSourceFilename] = useState<string | null>(
    initial?.sourceFilename ?? null,
  );
  const [extracting, setExtracting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();

  async function handleFile(file: File) {
    setExtracting(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/extract-document", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as { content?: string; error?: string };
      if (!res.ok || !data.content) {
        toast.error(data.error || "Couldn't read that document");
        return;
      }
      const extracted = data.content;
      // Append if the editor already has content, else replace.
      setContent((prev) =>
        prev.trim() ? `${prev.trim()}\n\n${extracted}` : extracted,
      );
      setSourceFilename(file.name);
      setType("DOCUMENT");
      if (!title.trim()) {
        setTitle(firstHeading(extracted) ?? stripExt(file.name));
      }
      toast.success(`Extracted text from ${file.name}`);
    } catch {
      toast.error("Upload failed");
    } finally {
      setExtracting(false);
    }
  }

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
      const payload = { title, content, type, tags, sourceFilename };
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
      {/* Document upload + AI extraction */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) void handleFile(f);
        }}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
          dragOver
            ? "border-brand bg-brand-soft/40"
            : "border-border bg-card hover:border-ring/50"
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
            e.currentTarget.value = "";
          }}
        />
        {extracting ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-brand" />
            Extracting text with AI…
          </div>
        ) : sourceFilename ? (
          <div className="flex flex-col items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-[12.5px] font-medium text-accent-foreground">
              <FileText className="h-3.5 w-3.5" />
              {sourceFilename}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="h-3.5 w-3.5" />
                Replace
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSourceFilename(null)}
              >
                <X className="h-3.5 w-3.5" />
                Clear source
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-2 grid h-10 w-10 place-items-center rounded-lg bg-muted text-muted-foreground">
              <FileUp className="h-5 w-5" />
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-sm font-medium text-foreground hover:underline"
            >
              Upload a document
            </button>
            <p className="mt-1 max-w-sm text-[12px] text-muted-foreground">
              Drag &amp; drop or click. PDF, image, or text — DonoAI reads it
              (OCR included) and fills the content below.
            </p>
            <p className="mt-1 text-[10.5px] text-muted-foreground">
              PDF · PNG · JPG · WEBP · TXT · MD · CSV — up to 10 MB
            </p>
          </>
        )}
      </div>

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
            {wordCount.toLocaleString("en-US")} words · markdown supported
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
