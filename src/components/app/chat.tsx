"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ShieldCheck,
  Send,
  Loader2,
  AlertCircle,
  Square,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  ShieldAlert,
  Briefcase,
  Users,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { renderWithCitations } from "./citation";

export type ChatMessage = {
  role: "USER" | "ASSISTANT";
  content: string;
};

type Props = {
  conversationId?: string;
  initialMessages?: ChatMessage[];
  initialAsk?: string;
  firstName?: string | null;
};

export function Chat({
  conversationId,
  initialMessages = [],
  initialAsk,
  firstName,
}: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [pending, setPending] = useState(false);
  const [draft, setDraft] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoAsked = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, streamingText]);

  useEffect(() => {
    if (initialAsk && !autoAsked.current && !pending) {
      autoAsked.current = true;
      void send(initialAsk);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAsk]);

  async function send(question: string) {
    setError(null);
    setMessages((prev) => [...prev, { role: "USER", content: question }]);
    setStreamingText("");
    setPending(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, question }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        const txt = await res.text().catch(() => "");
        setError(txt || `HTTP ${res.status}`);
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
            const evt = JSON.parse(line) as
              | { type: "open"; conversationId: string }
              | { type: "delta"; text: string }
              | { type: "done"; citations: string[] }
              | { type: "error"; message: string };
            if (evt.type === "open") {
              if (!conversationId) {
                window.history.replaceState({}, "", `/assistant/${evt.conversationId}`);
              }
            } else if (evt.type === "delta") {
              acc += evt.text;
              setStreamingText(acc);
            } else if (evt.type === "done") {
              setMessages((prev) => [...prev, { role: "ASSISTANT", content: acc }]);
              setStreamingText("");
              router.refresh();
            } else if (evt.type === "error") {
              setError(evt.message);
              if (acc) {
                setMessages((prev) => [
                  ...prev,
                  { role: "ASSISTANT", content: acc + "\n\n_[truncated]_" },
                ]);
              }
              setStreamingText("");
            }
          } catch {
            // skip
          }
        }
      }
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        // User stopped — finalize whatever we have
        if (streamingText || draft) {
          // No-op — streamingText handler already set messages on done
        }
      } else {
        setError(e instanceof Error ? e.message : "Network error");
      }
    } finally {
      setPending(false);
      abortRef.current = null;
    }
  }

  const stop = () => {
    abortRef.current?.abort();
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = draft.trim();
    if (!q || pending) return;
    setDraft("");
    void send(q);
  };

  const isEmpty = messages.length === 0 && !streamingText && !pending;

  return (
    <div className="flex h-[calc(100vh-60px)] flex-col bg-background">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-8">
          {isEmpty ? (
            <EmptyState firstName={firstName} onPick={(q) => void send(q)} />
          ) : (
            <div className="space-y-8">
              {messages.map((m, i) => (
                <Bubble
                  key={i}
                  role={m.role}
                  content={m.content}
                  isLatest={i === messages.length - 1 && !pending && !streamingText}
                />
              ))}
              {streamingText && (
                <Bubble role="ASSISTANT" content={streamingText} streaming />
              )}
              {pending && !streamingText && <ThinkingIndicator />}
              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>{error}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Composer
        draft={draft}
        setDraft={setDraft}
        pending={pending}
        onSubmit={onSubmit}
        onStop={stop}
      />
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-foreground to-brand text-white">
        <ShieldCheck className="h-4 w-4" />
      </div>
      <div className="flex h-9 items-center gap-1">
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
      </div>
    </div>
  );
}

function Bubble({
  role,
  content,
  streaming,
  isLatest,
}: {
  role: "USER" | "ASSISTANT";
  content: string;
  streaming?: boolean;
  isLatest?: boolean;
}) {
  if (role === "USER") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-foreground px-4 py-2.5 text-[14px] leading-relaxed text-background">
          {content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-foreground to-brand text-white">
        <ShieldCheck className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2 text-[11.5px]">
          <span className="font-medium">DonoAI</span>
          {streaming && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <span className="typing-dot h-1 w-1 rounded-full bg-muted-foreground/60" />
              <span className="typing-dot h-1 w-1 rounded-full bg-muted-foreground/60" />
              <span className="typing-dot h-1 w-1 rounded-full bg-muted-foreground/60" />
            </span>
          )}
        </div>
        <div className="whitespace-pre-wrap text-[14.5px] leading-[1.65]">
          {renderWithCitations(content)}
        </div>
        {!streaming && content && (
          <MessageActions content={content} highlight={isLatest} />
        )}
      </div>
    </div>
  );
}

function MessageActions({
  content,
  highlight,
}: {
  content: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`mt-3 flex items-center gap-1 transition-opacity ${highlight ? "opacity-100" : "opacity-0 hover:opacity-100"}`}
    >
      <IconButton
        title="Copy answer"
        onClick={() => {
          navigator.clipboard.writeText(content).then(
            () => toast.success("Copied"),
            () => toast.error("Couldn't copy"),
          );
        }}
      >
        <Copy className="h-3.5 w-3.5" />
      </IconButton>
      <IconButton
        title="Good answer"
        onClick={() => toast.success("Thanks — feedback noted")}
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </IconButton>
      <IconButton
        title="Needs work"
        onClick={() => toast.success("Thanks — feedback noted")}
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </IconButton>
    </div>
  );
}

function IconButton({
  children,
  title,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
  );
}

function Composer({
  draft,
  setDraft,
  pending,
  onSubmit,
  onStop,
}: {
  draft: string;
  setDraft: (v: string) => void;
  pending: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onStop: () => void;
}) {
  return (
    <div className="border-t border-border bg-background/80 backdrop-blur">
      <form
        onSubmit={onSubmit}
        className="mx-auto max-w-3xl px-6 py-4"
      >
        <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-soft focus-within:border-ring">
          <textarea
            rows={1}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 200) + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit(e as unknown as React.FormEvent);
              }
            }}
            placeholder="Ask about a workflow, regulation, or tricky case…"
            disabled={pending}
            className="max-h-[200px] min-h-[36px] flex-1 resize-none bg-transparent px-3 py-2 text-[14px] leading-relaxed outline-none placeholder:text-muted-foreground"
          />
          {pending ? (
            <Button
              type="button"
              onClick={onStop}
              variant="outline"
              size="sm"
              className="h-9 shrink-0"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
              Stop
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={!draft.trim()}
              size="sm"
              className="h-9 shrink-0"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        <p className="mt-2 text-center text-[10.5px] text-muted-foreground">
          Answers cite knowledge items by{" "}
          <span className="font-mono">[1] [2]</span>. Always verify before
          acting.
        </p>
      </form>
    </div>
  );
}

function EmptyState({
  firstName,
  onPick,
}: {
  firstName?: string | null;
  onPick: (q: string) => void;
}) {
  const categories: {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    tone: "brand" | "violet" | "amber" | "emerald" | "sky";
    prompts: string[];
  }[] = [
    {
      label: "Compliance",
      icon: ShieldAlert,
      tone: "brand",
      prompts: [
        "How do I file a SAR?",
        "When is Enhanced Due Diligence required?",
      ],
    },
    {
      label: "Customer service",
      icon: Users,
      tone: "violet",
      prompts: [
        "What's the Reg E timeline for debit card fraud?",
        "How do I handle a large unusual withdrawal request?",
      ],
    },
    {
      label: "Lending",
      icon: Briefcase,
      tone: "amber",
      prompts: [
        "What docs are needed for a self-employed mortgage applicant?",
        "How do I phrase an adverse-action denial?",
      ],
    },
    {
      label: "Operations",
      icon: CreditCard,
      tone: "emerald",
      prompts: [
        "What's the recovery process for a misdirected wire?",
        "How do I triage an end-of-day cash variance?",
      ],
    },
  ];

  const tones: Record<string, string> = {
    brand: "bg-brand-soft text-accent-foreground",
    violet: "bg-violet-100 text-violet-800",
    amber: "bg-amber-100 text-amber-800",
    emerald: "bg-emerald-100 text-emerald-800",
    sky: "bg-sky-100 text-sky-800",
  };

  return (
    <div className="flex flex-col items-center py-12">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-foreground to-brand text-white shadow-lift">
        <ShieldCheck className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-[26px] font-semibold tracking-tight">
        How can I help{firstName ? `, ${firstName}` : ""}?
      </h2>
      <p className="mx-auto mt-2 max-w-md text-center text-[14px] leading-relaxed text-muted-foreground">
        Ask anything covered by your bank's knowledge base. Every answer cites
        its source so you can verify.
      </p>

      <div className="mt-10 w-full">
        <div className="mb-3 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          <Sparkles className="h-3 w-3 text-brand" />
          Try asking
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.label}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="mb-3 flex items-center gap-2">
                  <div
                    className={`grid h-7 w-7 place-items-center rounded-md ${tones[cat.tone]}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[12.5px] font-semibold">
                    {cat.label}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {cat.prompts.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => onPick(p)}
                      className="block w-full rounded-md px-2.5 py-1.5 text-left text-[13px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
