# DonoAI

**Institutional memory for banks — a secure, multilingual knowledge platform with a grounded AI assistant.**

Every bank's most valuable knowledge lives in the heads of its most experienced people, and it walks out the door when they leave. DonoAI captures that knowledge once and turns it into an always-available assistant that answers questions **with citations**, in **Uzbek, English, or Russian**, by **text or voice** — so a new analyst is productive on day two instead of week three.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture Highlights](#architecture-highlights)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Security](#security)
- [Deployment](#deployment)

---

## Features

### 1. Knowledge Feed
The single source of truth for a bank's documented practice.
- Capture **workflows, resolved cases, documents, best practices, and tips**, each tagged and categorized.
- **Upload documents (PDF, etc.)** — Gemini's native multimodal OCR extracts the text and turns it into a searchable knowledge item.
- Full‑text search across titles, content, and AI‑generated summaries.

### 2. AI Assistant
A grounded Q&A assistant that only answers from your bank's knowledge.
- **Cited answers** — every response references the source knowledge items (`[1] [2]`) so they can be verified.
- **Multilingual** — ask and receive answers in Uzbek, English, or Russian.
- **Three ways to ask:**
  - Type your question.
  - **Voice input** — record a question; it's transcribed by Gemini (with Uzbek support).
  - **Live voice‑to‑voice** — a real‑time spoken conversation with the assistant over the Gemini Live API.
- Persistent **conversation history** per user.

### 3. Reports
- **Auto‑drafted weekly reports** summarizing a user's activity, which they can edit and submit.
- **Calendar week picker** — choose any week (resolved to a Monday–Sunday range) and open or create that week's report.

### Platform
- **Authentication** — email/password **register** and **sign‑in**, with workspace‑scoped data isolation.
- **Internationalization** — UI in Uzbek / English / Russian (default **Uzbek**), switchable on the fly.
- **Dark mode** — system‑aware light/dark theme.
- **Polished, responsive UI** designed for a calm, professional banking context.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router, React 19, Turbopack) |
| **Language** | TypeScript |
| **Database** | PostgreSQL ([Neon](https://neon.tech) serverless) |
| **ORM** | [Prisma 5](https://www.prisma.io) (pooled + direct connections) |
| **Auth** | [Auth.js v5](https://authjs.dev) (Credentials provider, JWT sessions, bcrypt) |
| **AI** | Google **Gemini** via [`@google/genai`](https://www.npmjs.com/package/@google/genai) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com), [Base UI](https://base-ui.com), `next-themes` |
| **Validation** | [Zod](https://zod.dev) |
| **Email** | [Resend](https://resend.com) + React Email |
| **Deploy** | Vercel + Neon |

**Gemini models used:**
- `gemini-2.5-flash` — chat answers, document OCR, and audio transcription.
- `gemini-3.1-flash-live-preview` — real‑time live voice (Gemini Live API).

---

## Architecture Highlights

- **Grounded RAG via cached context.** Instead of a vector database, the curated knowledge base is injected into the model's **system instruction** as grounded context. The assistant answers *only* from that material and cites the source item IDs. This means **no fine‑tuning and instant updates** — add a knowledge item and the assistant knows it on the next question. (A vector store is the natural next step at enterprise scale; the citation contract stays the same.)

- **Secure live voice with ephemeral tokens.** The browser never receives the Gemini API key. The server mints a **short‑lived ephemeral token**, and the client opens a WebSocket directly to the Gemini Live API with that token. Audio streams as **16 kHz PCM in / 24 kHz PCM out** through an AudioWorklet.

- **Edge‑safe auth split.** An edge‑compatible config (`auth.config.ts`, used by `proxy.ts`) guards routes via an `authorized` callback, while the Node‑side config (`auth.ts`) handles Prisma + bcrypt. Unauthenticated users are redirected before any protected page code runs.

- **Multi‑tenant by construction.** Data model is **Organization → Users**. Knowledge items are **org‑scoped**; conversations and reports are **user‑scoped**. Every query filters by `orgId` / `userId`, so cross‑workspace leakage isn't possible.

- **Cookie‑based i18n.** The chosen locale is stored in a cookie and a language instruction is injected into the assistant's system prompt, so the AI (including live voice) replies in the user's language — no URL routing required.

---

## Project Structure

```
src/
├── app/
│   ├── (app)/          # Authenticated app (dashboard, knowledge, assistant, reports)
│   ├── (auth)/         # Login & register (shared brand layout)
│   ├── api/            # Route handlers (e.g. live-token)
│   └── layout.tsx      # Root layout (theme provider, toaster)
├── components/         # UI + app components
├── lib/
│   ├── ai.ts           # Gemini integration (chat, OCR, transcription, live)
│   ├── db.ts           # Prisma client
│   ├── i18n/           # uz / en / ru dictionaries + helpers
│   ├── use-live-voice.ts
│   └── use-audio-recorder.ts
├── server/             # Server actions (auth, knowledge, assistant, reports)
├── auth.ts             # Node-side Auth.js (Prisma + bcrypt)
├── auth.config.ts      # Edge-safe Auth.js config
└── proxy.ts            # Route protection (Next.js 16 middleware)
prisma/
└── schema.prisma       # Organization, User, KnowledgeItem, Conversation, Message, WeeklyReport
src/scripts/
├── seed.ts             # Demo org + users + banking knowledge
└── reset.ts            # Clear chat history + reports
```

---

## Getting Started

### Prerequisites
- **Node.js 20+**
- A **PostgreSQL** database (e.g. a free [Neon](https://neon.tech) project)
- A **Gemini API key** ([Google AI Studio](https://aistudio.google.com/apikey))

### 1. Install
```bash
npm install
```

### 2. Configure environment
Create a `.env` file (see [Environment Variables](#environment-variables)).

### 3. Set up the database
```bash
npm run db:push     # apply the Prisma schema
npm run db:seed     # (optional) load demo org + users + banking knowledge
```

### 4. Run
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000), then **register** an account to get started.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | Pooled (PgBouncer) Postgres connection — used by the app. |
| `DIRECT_URL` | ✅ | Direct (unpooled) Postgres connection — used for migrations / `db push`. |
| `AUTH_SECRET` | ✅ | Secret for Auth.js JWT signing (`npx auth secret`). |
| `AUTH_TRUST_HOST` | ✅ | Set to `true` for non‑Vercel / preview hosts. |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key (chat, OCR, transcription, live token). |
| `GEMINI_LIVE_MODEL` | ✅ | Live voice model, e.g. `gemini-3.1-flash-live-preview`. |
| `RESEND_API_KEY` | ➖ | Resend API key (transactional email). |
| `RESEND_FROM` | ➖ | From address for Resend email. |

> **Never commit `.env`** — it is gitignored. Rotate any key that has been shared.

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the dev server (Turbopack). |
| `npm run build` | `prisma generate` + production build. |
| `npm run start` | Start the production server. |
| `npm run lint` | Run ESLint. |
| `npm run db:push` | Push the Prisma schema to the database. |
| `npm run db:seed` | Seed demo data (org, users, knowledge). |
| `npm run db:clear` | Clear chat history + weekly reports (keeps knowledge & accounts). |
| `npm run db:studio` | Open Prisma Studio. |

---

## Security

- **Passwords** are hashed with **bcrypt**; plaintext is never stored.
- **Sessions** use signed **JWTs** (Auth.js).
- **Route protection** runs at the edge before protected pages render.
- The **Gemini API key stays server‑side** — the live‑voice client uses short‑lived ephemeral tokens.
- **Workspace isolation** — all data access is scoped by organization / user.

---

## Deployment

Deploys to **Vercel** with a **Neon** Postgres database:

1. Import the repository into Vercel.
2. Add all required [environment variables](#environment-variables) (including `DIRECT_URL` and `GEMINI_LIVE_MODEL`).
3. Build command `npm run build` runs `prisma generate` automatically.
4. Run `npm run db:push` against the production database (or use a migration step).

---

Built for a hackathon — designed, engineered, and demoed end‑to‑end.
