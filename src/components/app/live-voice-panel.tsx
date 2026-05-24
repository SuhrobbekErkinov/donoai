"use client";

import { useEffect } from "react";
import { useLiveVoice } from "@/lib/use-live-voice";
import { Button } from "@/components/ui/button";
import { Mic, PhoneOff, Loader2, AlertCircle, AudioLines } from "lucide-react";

export type LiveLabels = {
  title: string;
  connecting: string;
  listening: string;
  speaking: string;
  end: string;
  you: string;
  hint: string;
};

export function LiveVoicePanel({
  open,
  onClose,
  labels,
}: {
  open: boolean;
  onClose: () => void;
  labels: LiveLabels;
}) {
  const { status, speaking, error, userCaption, aiCaption, start, end } =
    useLiveVoice();

  // Start the session when opened; tear down when closed.
  useEffect(() => {
    if (open) void start();
    return () => end();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        end();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, end, onClose]);

  if (!open) return null;

  const close = () => {
    end();
    onClose();
  };

  const statusText =
    status === "connecting"
      ? labels.connecting
      : status === "error"
        ? (error ?? "Error")
        : speaking
          ? labels.speaking
          : labels.listening;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
      <div className="relative flex w-full max-w-md flex-col items-center rounded-3xl border border-border bg-card p-8 shadow-lift">
        <div className="mb-1 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          <AudioLines className="h-3.5 w-3.5 text-brand" />
          {labels.title}
        </div>

        {/* Orb */}
        <div className="relative my-8 grid h-36 w-36 place-items-center">
          {status !== "error" && (
            <>
              <span
                className={`absolute inset-0 rounded-full bg-brand/20 ${
                  speaking ? "animate-ping" : "animate-pulse"
                }`}
              />
              <span
                className={`absolute inset-3 rounded-full bg-brand/25 ${
                  speaking ? "animate-pulse" : ""
                }`}
              />
            </>
          )}
          <div
            className={`relative grid h-24 w-24 place-items-center rounded-full text-white shadow-lift ${
              status === "error"
                ? "bg-destructive"
                : "bg-gradient-to-br from-foreground to-brand"
            }`}
          >
            {status === "connecting" ? (
              <Loader2 className="h-9 w-9 animate-spin" />
            ) : status === "error" ? (
              <AlertCircle className="h-9 w-9" />
            ) : speaking ? (
              <AudioLines className="h-9 w-9" />
            ) : (
              <Mic className="h-9 w-9" />
            )}
          </div>
        </div>

        <div className="text-center">
          <div className="text-[15px] font-semibold">{statusText}</div>
          {status !== "error" && (
            <p className="mx-auto mt-1 max-w-xs text-[12.5px] text-muted-foreground">
              {labels.hint}
            </p>
          )}
        </div>

        {/* Live captions */}
        {(userCaption || aiCaption) && (
          <div className="mt-5 w-full space-y-2">
            {userCaption && (
              <div className="rounded-xl bg-muted px-3 py-2 text-right text-[13px]">
                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {labels.you}
                </span>
                <div>{userCaption}</div>
              </div>
            )}
            {aiCaption && (
              <div className="rounded-xl bg-brand-soft/50 px-3 py-2 text-[13px]">
                <span className="text-[10px] font-medium uppercase tracking-wide text-accent-foreground">
                  DonoAI
                </span>
                <div>{aiCaption}</div>
              </div>
            )}
          </div>
        )}

        <Button
          onClick={close}
          variant="destructive"
          size="lg"
          className="mt-8 h-12 w-full"
        >
          <PhoneOff className="h-5 w-5" />
          {labels.end}
        </Button>
      </div>
    </div>
  );
}
