"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IconBadge } from "./icon-badge";
import {
  Sparkles,
  Loader2,
  Send,
  Save,
  CheckCircle2,
  AlertTriangle,
  ListChecks,
  Trash2,
  Lock,
} from "lucide-react";
import { saveReport, submitReport, deleteReport } from "@/server/reports";

type Props = {
  reportId: string;
  weekStart: string;
  weekLabel: string; // pre-formatted on the server (avoids hydration mismatch)
  initial: {
    tasksCompleted: string;
    challenges: string;
    keyActivities: string;
  };
  status: "DRAFT" | "SUBMITTED";
};

function parseDraft(md: string): {
  tasksCompleted: string;
  keyActivities: string;
  challenges: string;
} {
  const sections: Record<string, string[]> = {};
  let current: string | null = null;
  for (const raw of md.split("\n")) {
    const line = raw.trim();
    if (line.startsWith("## ")) {
      current = line.slice(3).trim().toLowerCase();
      sections[current] = [];
    } else if (current && line) {
      sections[current].push(raw);
    }
  }
  const pick = (matchers: string[]) => {
    for (const m of matchers) {
      for (const key of Object.keys(sections)) {
        if (key.includes(m)) return sections[key].join("\n").trim();
      }
    }
    return "";
  };
  return {
    tasksCompleted: pick(["task", "completed"]),
    keyActivities: pick(["key activit", "activit", "highlight"]),
    challenges: pick(["challenge", "blocker", "issue"]),
  };
}

const SECTIONS = [
  {
    key: "tasks" as const,
    icon: <CheckCircle2 className="h-4 w-4" />,
    tone: "emerald" as const,
    label: "Tasks completed",
    hint: "What you finished this week. One bullet per task.",
  },
  {
    key: "activities" as const,
    icon: <ListChecks className="h-4 w-4" />,
    tone: "brand" as const,
    label: "Key activities",
    hint: "Notable activities — meetings, customer interactions, projects.",
  },
  {
    key: "challenges" as const,
    icon: <AlertTriangle className="h-4 w-4" />,
    tone: "amber" as const,
    label: "Challenges",
    hint: "Blockers, learnings, things that didn't go to plan.",
  },
];

export function ReportForm({
  reportId,
  weekStart,
  weekLabel,
  initial,
  status,
}: Props) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initial.tasksCompleted);
  const [activities, setActivities] = useState(initial.keyActivities);
  const [challenges, setChallenges] = useState(initial.challenges);
  const [drafting, setDrafting] = useState(false);
  const [pending, start] = useTransition();
  const submitted = status === "SUBMITTED";

  async function draftFromWeek() {
    setDrafting(true);
    try {
      const res = await fetch("/api/reports/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId }),
      });
      if (!res.ok || !res.body) {
        const txt = await res.text().catch(() => "");
        toast.error(txt || `HTTP ${res.status}`);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (!line) continue;
          try {
            const evt = JSON.parse(line);
            if (evt.type === "delta") {
              acc += evt.text;
              const parsed = parseDraft(acc);
              setTasks(parsed.tasksCompleted);
              setActivities(parsed.keyActivities);
              setChallenges(parsed.challenges);
            } else if (evt.type === "error") {
              toast.error(evt.message);
            }
          } catch {
            // skip
          }
        }
      }
      toast.success("Draft generated — review and edit before submitting");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Draft failed");
    } finally {
      setDrafting(false);
    }
  }

  const onSave = () =>
    start(async () => {
      const r = await saveReport(reportId, {
        weekStart,
        tasksCompleted: tasks,
        challenges,
        keyActivities: activities,
      });
      if (r.ok) {
        toast.success("Saved");
        router.refresh();
      } else toast.error(r.error);
    });

  const onSubmitReport = () =>
    start(async () => {
      const saved = await saveReport(reportId, {
        weekStart,
        tasksCompleted: tasks,
        challenges,
        keyActivities: activities,
      });
      if (!saved.ok) {
        toast.error(saved.error);
        return;
      }
      const r = await submitReport(reportId);
      if (r.ok) {
        toast.success("Report submitted");
        router.refresh();
      } else toast.error(r.error);
    });

  const onDelete = () =>
    start(async () => {
      if (!confirm("Delete this report?")) return;
      const r = await deleteReport(reportId);
      if (r.ok) {
        toast.success("Deleted");
        router.push("/reports");
      } else toast.error(r.error);
    });

  return (
    <div className="space-y-5">
      {/* Status banner + AI assist */}
      <div
        className={`flex items-center justify-between gap-3 rounded-xl border p-4 ${submitted ? "border-emerald-200 bg-emerald-50" : "border-border bg-card"}`}
      >
        <div className="flex items-center gap-3">
          {submitted ? (
            <>
              <IconBadge tone="emerald" size="sm">
                <Lock className="h-3.5 w-3.5" />
              </IconBadge>
              <div>
                <div className="text-[13.5px] font-medium text-emerald-900">
                  Submitted — read only
                </div>
                <div className="text-[11.5px] text-emerald-800/70">
                  {weekLabel}
                </div>
              </div>
            </>
          ) : (
            <>
              <IconBadge tone="brand" size="sm">
                <Sparkles className="h-3.5 w-3.5" />
              </IconBadge>
              <div>
                <div className="text-[13.5px] font-medium">
                  Let DonoAI draft from your week
                </div>
                <div className="text-[11.5px] text-muted-foreground">
                  Compiled from your knowledge contributions + chats this week.
                </div>
              </div>
            </>
          )}
        </div>
        {!submitted && (
          <Button
            variant="default"
            onClick={draftFromWeek}
            disabled={drafting || pending}
            size="sm"
          >
            {drafting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Drafting…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Draft from my week
              </>
            )}
          </Button>
        )}
      </div>

      {/* Section cards */}
      {SECTIONS.map((s) => {
        const value =
          s.key === "tasks" ? tasks : s.key === "activities" ? activities : challenges;
        const setValue =
          s.key === "tasks"
            ? setTasks
            : s.key === "activities"
              ? setActivities
              : setChallenges;
        return (
          <div
            key={s.key}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="mb-3 flex items-center gap-2.5">
              <IconBadge tone={s.tone} size="sm">
                {s.icon}
              </IconBadge>
              <div>
                <Label className="text-[14px] font-semibold">{s.label}</Label>
                <p className="text-[11.5px] text-muted-foreground">{s.hint}</p>
              </div>
            </div>
            <Textarea
              rows={6}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={submitted}
              className="resize-y font-mono text-[13px] leading-relaxed"
              placeholder={submitted ? "(empty)" : "Start typing or use ‘Draft from my week’…"}
            />
          </div>
        );
      })}

      {/* Sticky action bar (draft mode only) */}
      {!submitted && (
        <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/95 px-4 py-3 shadow-lift backdrop-blur">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={pending}
            className="text-muted-foreground"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete draft
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onSave} disabled={pending}>
              <Save className="h-4 w-4" />
              Save draft
            </Button>
            <Button onClick={onSubmitReport} disabled={pending}>
              <Send className="h-4 w-4" />
              Save & submit
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
