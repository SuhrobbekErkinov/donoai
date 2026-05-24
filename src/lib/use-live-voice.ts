"use client";

import { useCallback, useRef, useState } from "react";
import {
  GoogleGenAI,
  type LiveServerMessage,
  type Session,
} from "@google/genai";

export type LiveStatus = "idle" | "connecting" | "active" | "error" | "ended";

function abToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

function base64ToInt16(b64: string): Int16Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Int16Array(bytes.buffer);
}

export function useLiveVoice() {
  const [status, setStatus] = useState<LiveStatus>("idle");
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userCaption, setUserCaption] = useState("");
  const [aiCaption, setAiCaption] = useState("");

  const sessionRef = useRef<Session | null>(null);
  const activeRef = useRef(false); // true only while the socket is open
  const endedByUserRef = useRef(false);
  const micCtxRef = useRef<AudioContext | null>(null);
  const playCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const workletRef = useRef<AudioWorkletNode | null>(null);
  const nextStartRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const stopMic = useCallback(() => {
    activeRef.current = false;
    workletRef.current?.disconnect();
    workletRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    micCtxRef.current?.close().catch(() => {});
    micCtxRef.current = null;
  }, []);

  const stopPlayback = useCallback(() => {
    sourcesRef.current.forEach((s) => {
      try {
        s.stop();
      } catch {
        /* ignore */
      }
    });
    sourcesRef.current.clear();
    nextStartRef.current = 0;
    setSpeaking(false);
  }, []);

  const cleanup = useCallback(() => {
    activeRef.current = false;
    try {
      sessionRef.current?.close();
    } catch {
      /* ignore */
    }
    sessionRef.current = null;
    stopMic();
    stopPlayback();
    playCtxRef.current?.close().catch(() => {});
    playCtxRef.current = null;
  }, [stopMic, stopPlayback]);

  const playChunk = useCallback((b64: string) => {
    const ctx = playCtxRef.current;
    if (!ctx) return;
    const i16 = base64ToInt16(b64);
    const f32 = new Float32Array(i16.length);
    for (let i = 0; i < i16.length; i++) f32[i] = i16[i] / 0x8000;
    const buffer = ctx.createBuffer(1, f32.length, 24000);
    buffer.copyToChannel(f32, 0);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(ctx.destination);
    const now = ctx.currentTime;
    if (nextStartRef.current < now) nextStartRef.current = now;
    src.start(nextStartRef.current);
    nextStartRef.current += buffer.duration;
    sourcesRef.current.add(src);
    setSpeaking(true);
    src.onended = () => {
      sourcesRef.current.delete(src);
      if (sourcesRef.current.size === 0) setSpeaking(false);
    };
  }, []);

  const end = useCallback(() => {
    endedByUserRef.current = true;
    cleanup();
    setStatus("ended");
    setSpeaking(false);
  }, [cleanup]);

  const startMic = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
    });
    streamRef.current = stream;
    const micCtx = new AudioContext({ sampleRate: 16000 });
    micCtxRef.current = micCtx;
    await micCtx.audioWorklet.addModule("/pcm-recorder-worklet.js");
    const sourceNode = micCtx.createMediaStreamSource(stream);
    const worklet = new AudioWorkletNode(micCtx, "pcm-recorder");
    worklet.port.onmessage = (e: MessageEvent<ArrayBuffer>) => {
      // Only send while the socket is genuinely open — prevents flooding a
      // closing/closed WebSocket (the "already CLOSED" error spam).
      if (!activeRef.current || !sessionRef.current) return;
      try {
        sessionRef.current.sendRealtimeInput({
          audio: { data: abToBase64(e.data), mimeType: "audio/pcm;rate=16000" },
        });
      } catch {
        activeRef.current = false;
      }
    };
    sourceNode.connect(worklet);
    worklet.connect(micCtx.destination);
    workletRef.current = worklet;
  }, []);

  const start = useCallback(async () => {
    setError(null);
    setUserCaption("");
    setAiCaption("");
    setStatus("connecting");
    endedByUserRef.current = false;
    try {
      const res = await fetch("/api/live-token", { method: "POST" });
      const data = (await res.json()) as {
        token?: string;
        model?: string;
        config?: Record<string, unknown>;
        error?: string;
      };
      if (!res.ok || !data.token || !data.model || !data.config) {
        throw new Error(data.error || "Couldn't start the live session");
      }

      playCtxRef.current = new AudioContext({ sampleRate: 24000 });

      const ai = new GoogleGenAI({
        apiKey: data.token,
        httpOptions: { apiVersion: "v1alpha" },
      });

      const session = await ai.live.connect({
        model: data.model,
        // Same config object the token was constrained with → no mismatch.
        config: data.config,
        callbacks: {
          onopen: () => {
            activeRef.current = true;
            setStatus("active");
            // Start mic only once the socket is actually open.
            void startMic().catch(() => {
              setError("Microphone access denied");
              setStatus("error");
              cleanup();
            });
          },
          onmessage: (msg: LiveServerMessage) => {
            if (msg.data) playChunk(msg.data);
            const sc = msg.serverContent;
            if (sc?.interrupted) stopPlayback();
            if (sc?.inputTranscription?.text) {
              setUserCaption((p) => p + sc.inputTranscription!.text);
            }
            if (sc?.outputTranscription?.text) {
              setAiCaption((p) => p + sc.outputTranscription!.text);
            }
            if (sc?.turnComplete) {
              setUserCaption("");
              setAiCaption("");
            }
          },
          onerror: (e: ErrorEvent) => {
            activeRef.current = false;
            stopMic();
            setError(e?.message || "Live connection error");
            setStatus("error");
          },
          onclose: (e: CloseEvent) => {
            activeRef.current = false;
            stopMic();
            if (endedByUserRef.current) return;
            // Surface the server's reason so we can diagnose unexpected closes.
            const reason = e?.reason?.trim();
            if (reason || (e?.code && e.code !== 1000)) {
              setError(reason ? reason : `Session closed (code ${e.code})`);
              setStatus("error");
            } else {
              setStatus("ended");
            }
          },
        },
      });
      sessionRef.current = session;
    } catch (e) {
      const name = e instanceof DOMException ? e.name : "";
      setError(
        name === "NotAllowedError"
          ? "Microphone access denied"
          : e instanceof Error
            ? e.message
            : "Couldn't start the live session",
      );
      setStatus("error");
      cleanup();
    }
  }, [cleanup, playChunk, startMic, stopMic, stopPlayback]);

  return { status, speaking, error, userCaption, aiCaption, start, end };
}
