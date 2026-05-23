"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Records mic audio with MediaRecorder, then POSTs the clip to /api/transcribe
// (Gemini 2.5 Flash) and returns the transcript via onTranscript.
// Replaces the browser Web Speech API, which has poor Uzbek support.

// Prefer container/codecs the Gemini API accepts; webm/opus is the Chrome
// default and works in practice.
function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = [
    "audio/ogg;codecs=opus",
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
  ];
  for (const c of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(c)) return c;
    } catch {
      // ignore
    }
  }
  return undefined;
}

export function useAudioRecorder({
  onTranscript,
  onError,
}: {
  onTranscript: (text: string) => void;
  onError?: (message: string) => void;
}) {
  const [supported, setSupported] = useState(false);
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const cbRef = useRef({ onTranscript, onError });
  cbRef.current = { onTranscript, onError };

  useEffect(() => {
    setSupported(
      typeof navigator !== "undefined" &&
        !!navigator.mediaDevices?.getUserMedia &&
        typeof MediaRecorder !== "undefined",
    );
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const stop = useCallback(() => {
    recorderRef.current?.state !== "inactive" && recorderRef.current?.stop();
  }, []);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickMimeType();
      const rec = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );
      chunksRef.current = [];

      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setRecording(false);

        const blob = new Blob(chunksRef.current, {
          type: rec.mimeType || mimeType || "audio/webm",
        });
        if (blob.size === 0) {
          cbRef.current.onError?.("Nothing recorded");
          return;
        }

        setProcessing(true);
        try {
          const fd = new FormData();
          fd.append("audio", blob, "recording");
          const res = await fetch("/api/transcribe", {
            method: "POST",
            body: fd,
          });
          const data = (await res.json()) as { text?: string; error?: string };
          if (res.ok && typeof data.text === "string") {
            if (data.text.trim()) cbRef.current.onTranscript(data.text.trim());
            else cbRef.current.onError?.("Didn't catch that — try again");
          } else {
            cbRef.current.onError?.(data.error || "Transcription failed");
          }
        } catch {
          cbRef.current.onError?.("Transcription failed");
        } finally {
          setProcessing(false);
        }
      };

      rec.start();
      recorderRef.current = rec;
      setRecording(true);
    } catch {
      cbRef.current.onError?.("Microphone access denied");
      setRecording(false);
    }
  }, []);

  const toggle = useCallback(() => {
    if (recording) stop();
    else if (!processing) void start();
  }, [recording, processing, start, stop]);

  return { supported, recording, processing, start, stop, toggle };
}
