// DonoAI's AI integration layer.
// All AI calls funnel through here so the underlying model is swappable
// (e.g. for self-hosted production deployments). Currently: Gemini 2.5 Flash.
//
// Strategy: render the full org knowledge corpus into the systemInstruction
// on every chat request. Gemini 2.5 Flash's 1M context comfortably holds
// hundreds of typical knowledge items. When the corpus grows past that,
// swap in vector retrieval — the public function signatures stay the same.

import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-2.5-flash";

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

// Stream an assistant reply given the user's question, conversation history,
// and the full org knowledge corpus. Yields text deltas as strings.
export async function* streamAssistantReply(args: {
  question: string;
  history: ChatTurn[];
  knowledge: KnowledgeChunk[];
}): AsyncGenerator<string> {
  const ai = new GoogleGenAI({ apiKey: getKey() });

  const systemInstruction =
    ASSISTANT_SYSTEM_PROMPT +
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
