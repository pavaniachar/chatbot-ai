# Cadre AI Support Chatbot

A streaming support chatbot for [Cadre AI](https://cadreai.com), built as a
take-home challenge. It answers common inbound questions about Cadre's
services, industries, and AI Maturity Index using a static knowledge base as
the system prompt, served through a Next.js API route backed by the Vercel AI
SDK and OpenRouter.

This README is intentionally brief. For the full architecture, scope
decisions, and rationale, see [`CLAUDE.md`](./CLAUDE.md) and
[`plan.md`](./plan.md) at the repo root.

## Setup

```bash
npm install
cp .env.example .env.local
```

Then fill in `OPENROUTER_API_KEY` in `.env.local` with an
[OpenRouter](https://openrouter.ai) API key.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the chatbot.

## Tests

```bash
npm test
```
