// DonoAI's AI integration layer.
// All AI calls funnel through here so the underlying model is swappable
// (e.g. for self-hosted production deployments). Currently: Gemini 2.5 Flash.
//
// Strategy: render the full org knowledge corpus into the systemInstruction
// on every chat request. Gemini 2.5 Flash's 1M context comfortably holds
// hundreds of typical knowledge items. When the corpus grows past that,
// swap in vector retrieval — the public function signatures stay the same.

import { GoogleGenAI, Modality } from "@google/genai";
import { LOCALE_AI_INSTRUCTION, type Locale } from "./i18n/config";

const MODEL = "gemini-2.5-flash";
// Live (bidirectional audio) model for the voice-to-voice assistant.
// Override with GEMINI_LIVE_MODEL — the Live WebSocket runs on v1main, so the
// model must be one served there for bidiGenerateContent.
export const LIVE_MODEL =
  process.env.GEMINI_LIVE_MODEL || "gemini-3.1-flash-live-preview";

export type KnowledgeChunk = {
  id: string;
  title: string;
  type: string;
  authorName: string;
  content: string;
};

export type ChatTurn = { role: "USER" | "ASSISTANT"; content: string };

const ASSISTANT_SYSTEM_PROMPT = `You are DonoAI, the institutional knowledge assistant for a bank. You answer questions using ONLY the bank's documented knowledge items provided below. Each item is tagged with [K<id>].

Rules:
- Cite specific knowledge items inline using their bracketed tag, like [K1] or [Kabc123]. Cite the SAME tag exactly as it appears in the knowledge items below — do not invent or modify IDs.
- When multiple items support a point, cite all of them: [K1][K3].
- If no knowledge item covers the question, say so directly: "The knowledge base doesn't cover this yet — consider documenting it." Do NOT speculate or fall back to general knowledge.
- Bank policy and procedure trump general best practice; if a knowledge item contradicts common sense, follow the item.
- Be concise. Banking work is busy; respect the reader's time.
- Use plain language. If you must use jargon, define it the first time.

Tone: professional, calm, helpful. You are a trusted colleague, not a hype-bot.`;

function renderKnowledgeContext(chunks: KnowledgeChunk[]): string {
  if (chunks.length === 0) return "No knowledge items have been added yet.";
  return chunks
    .map(
      (k) =>
        `[K${k.id}]\nTitle: ${k.title}\nType: ${k.type}\nBy: ${k.authorName}\n---\n${k.content}\n`,
    )
    .join("\n\n");
}

function getKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to .env and restart the dev server.",
    );
  }
  return key;
}

// --- Live voice assistant (Gemini Live API) ---------------------------------
// Voice-tuned, KB-grounded system instruction. Baked into the ephemeral token
// server-side so the knowledge base never reaches the browser and the session
// can't be re-pointed at generic Gemini.
function liveSystemInstruction(
  chunks: KnowledgeChunk[],
  locale?: Locale,
): string {
  const lang =
    locale === "uz"
      ? "Speak Uzbek by default (o‘zbek tilida), unless the user clearly speaks another language."
      : locale === "ru"
        ? "Speak Russian by default, unless the user clearly speaks another language."
        : "Reply in the same language the user speaks; default to English.";
  return [
    "You are DonoAI, a voice assistant for a bank's employees, having a SPOKEN conversation.",
    "Answer ONLY from the bank's documented knowledge below. If something isn't covered, say so plainly and suggest documenting it — do not guess.",
    "Because this is spoken: keep replies short and conversational (1–4 sentences). No markdown, no bullet characters, no bracketed citation tags.",
    "When you rely on a specific item, name it naturally in speech (e.g. \"per the SAR filing workflow\").",
    `${lang} Stay calm, professional, and warm.`,
    "",
    "# Knowledge base",
    renderKnowledgeContext(chunks),
  ].join("\n");
}

// Mint a short-lived token AND return the session config. The browser connects
// with this same config object. The real GEMINI_API_KEY stays server-side; the
// KB system instruction is the user's own org knowledge, so returning it to the
// authenticated client is fine.
export async function createLiveSession(
  knowledge: KnowledgeChunk[],
  locale?: Locale,
): Promise<{
  token: string;
  model: string;
  config: Record<string, unknown>;
}> {
  const ai = new GoogleGenAI({
    apiKey: getKey(),
    httpOptions: { apiVersion: "v1alpha" },
  });
  const config = {
    responseModalities: [Modality.AUDIO],
    systemInstruction: liveSystemInstruction(knowledge, locale),
    inputAudioTranscription: {},
    outputAudioTranscription: {},
    speechConfig: {
      voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
    },
  };
  // No liveConnectConstraints: the token authorizes a single live session and
  // the browser provides the model + config at connect time. This avoids
  // mint-time model validation against the wrong API version.
  const token = await ai.authTokens.create({
    config: {
      uses: 1,
      expireTime: new Date(Date.now() + 30 * 60_000).toISOString(),
      newSessionExpireTime: new Date(Date.now() + 2 * 60_000).toISOString(),
    },
  });
  if (!token.name) throw new Error("Failed to create live token");
  return { token: token.name, model: LIVE_MODEL, config };
}

// Extract text from an uploaded document (PDF / image) with Gemini 2.5 Flash.
// Gemini is multimodal — it reads native-text PDFs AND performs OCR on scanned
// pages or photos, so no separate OCR engine is needed. Returns Markdown.
export async function extractDocumentText(args: {
  base64: string;
  mimeType: string;
}): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: getKey() });
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: [
              "Extract ALL text from this document into clean, well-structured Markdown.",
              "Preserve headings, lists, and tables. Transcribe everything verbatim — do NOT summarize or omit content.",
              "If the document is scanned or a photo, perform OCR.",
              "Keep the original language of the document.",
              "Output ONLY the Markdown content — no commentary, no surrounding code fences.",
            ].join(" "),
          },
          { inlineData: { mimeType: args.mimeType, data: args.base64 } },
        ],
      },
    ],
  });
  return (res.text ?? "").trim();
}

// Transcribe recorded mic audio with Gemini 2.5 Flash. Unlike the browser's
// Web Speech API, Gemini handles Uzbek well. We pass a language hint based on
// the chosen locale to improve accuracy.
export async function transcribeAudio(args: {
  base64: string;
  mimeType: string;
  locale?: Locale;
}): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: getKey() });

  const langHint =
    args.locale === "uz"
      ? "The speaker is most likely speaking Uzbek (o‘zbek tili). Transcribe in Uzbek Latin script."
      : args.locale === "ru"
        ? "The speaker is most likely speaking Russian."
        : "The speaker is most likely speaking English.";

  const res = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Transcribe this voice recording to text, verbatim. ${langHint} Output ONLY the transcription — no quotes, no commentary, no preamble. If the audio is empty or unintelligible, output an empty string.`,
          },
          { inlineData: { mimeType: args.mimeType, data: args.base64 } },
        ],
      },
    ],
  });

  return (res.text ?? "").trim();
}

// Stream an assistant reply given the user's question, conversation history,
// and the full org knowledge corpus. Yields text deltas as strings.
export async function* streamAssistantReply(args: {
  question: string;
  history: ChatTurn[];
  knowledge: KnowledgeChunk[];
  locale?: Locale;
}): AsyncGenerator<string> {
  const ai = new GoogleGenAI({ apiKey: getKey() });

  const languageRule = args.locale
    ? `\n\n# Language\n${LOCALE_AI_INSTRUCTION[args.locale]} Keep all citation tags like [Kxxxx] exactly as-is regardless of language.`
    : "";

  const systemInstruction =
    ASSISTANT_SYSTEM_PROMPT +
    languageRule +
    `\n\n# Knowledge base\n\n${renderKnowledgeContext(args.knowledge)}`;

  // Gemini uses role: "user" | "model". Map our ASSISTANT → "model".
  const contents = [
    ...args.history.map((t) => ({
      role: t.role === "USER" ? "user" : "model",
      parts: [{ text: t.content }],
    })),
    { role: "user", parts: [{ text: args.question }] },
  ];

  const stream = await ai.models.generateContentStream({
    model: MODEL,
    contents,
    config: {
      systemInstruction,
      maxOutputTokens: 4000,
    },
  });

  for await (const chunk of stream) {
    const t = chunk.text;
    if (t) yield t;
  }
}

// Quick one-shot: generate a conversation title (~6 words) from the first
// user message. Non-streaming.
export async function generateConversationTitle(
  question: string,
): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    // Graceful fallback so dev without a key still gets sensible titles.
    return question.length > 60 ? question.slice(0, 60) + "…" : question;
  }
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text: question }] }],
    config: {
      systemInstruction:
        "Write a short, neutral 3–6 word title for this question. No quotes, no trailing punctuation.",
      maxOutputTokens: 30,
    },
  });
  const title = (res.text ?? "").trim() || question;
  return title.length > 70 ? title.slice(0, 70) : title;
}

// Stream a weekly-report draft built from the user's recent activity.
export type WeekActivity = {
  weekStartISO: string;
  weekEndISO: string;
  authoredKnowledge: { title: string; type: string; createdAt: string }[];
  conversations: { title: string; messageCount: number }[];
};

const WEEK_DRAFT_SYSTEM_PROMPT = `You are drafting a structured weekly report for a bank employee based on their recent activity. Output EXACTLY this format (no preamble, no closing remarks):

## Tasks completed
- ...

## Key activities
- ...

## Challenges
- ...

Rules:
- Each section: 2–5 bullet points. Plain, specific, no fluff.
- Pull from the actual activity supplied; do not invent work.
- If a section has no real material, write "- (nothing notable this week)".
- Banking-professional tone. No emoji.`;

export async function* streamWeeklyDraft(
  activity: WeekActivity,
): AsyncGenerator<string> {
  const ai = new GoogleGenAI({ apiKey: getKey() });

  const userPrompt = [
    `Week of ${activity.weekStartISO} through ${activity.weekEndISO}.`,
    "",
    `Knowledge items I authored this week (${activity.authoredKnowledge.length}):`,
    ...activity.authoredKnowledge.map(
      (k) => `- [${k.type}] ${k.title} (${k.createdAt})`,
    ),
    "",
    `Conversations I had with the assistant this week (${activity.conversations.length}):`,
    ...activity.conversations.map(
      (c) => `- "${c.title}" — ${c.messageCount} message(s)`,
    ),
    "",
    "Draft my weekly report.",
  ].join("\n");

  const stream = await ai.models.generateContentStream({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    config: {
      systemInstruction: WEEK_DRAFT_SYSTEM_PROMPT,
      maxOutputTokens: 1500,
    },
  });

  for await (const chunk of stream) {
    const t = chunk.text;
    if (t) yield t;
  }
}
