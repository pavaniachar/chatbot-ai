# Implementation Plan — Cadre AI Support Chatbot

Full design rationale: `docs/superpowers/specs/2026-08-28-cadre-support-chatbot-design.md`

## Phases

1. **Foundation** — dependencies (AI SDK v7 + OpenRouter provider + Vitest),
   env var wiring, test harness.
2. **Domain logic** (`lib/chat/`) — knowledge base, history trimming, rate
   limiting, client IP extraction, request validation, error mapping. Each is
   a pure function or constant, unit tested before anything is wired
   together.
3. **API route** — `app/api/chat/route.ts` composes the domain logic into a
   streaming endpoint, tested at its seams (validation, rate limit, error
   mapping) rather than against the live model.
4. **UI** — presentational chat components built bottom-up (`MessageBubble`,
   `ChatInput`, `SuggestedPrompts`, `ErrorNotice`, `ChatHeader`,
   `MessageList`), composed into `ChatWindow`, wired into `app/page.tsx`.
5. **Claude Code workflow artifacts** — `.claude/commands/` and this
   plan/spec pair, so the review can inspect the actual working process, not
   just the output.
6. **Verify & ship** — lint, typecheck, full test suite, then push to `main`
   for Vercel to deploy.

## Scope decisions

| In scope | Out of scope | Why |
|---|---|---|
| Static knowledge base (services, industries, AI Maturity Index, portal, pricing stance, model-selection & data-security stance, contact) | Client login / personalized portal links | No backend or account data exists to authenticate against; would consume most of the build budget on a feature outside "handle common inbound inquiries." |
| Escalation to a human via a consistent contact message | Lead capture (name/email) | No storage or delivery destination; capturing and discarding a lead is worse than not capturing it. |
| Streaming responses via the Vercel AI SDK | Retrieval/RAG over live site content | The knowledge base is small and stable enough for a static system prompt; RAG adds infrastructure without improving answers at this size. |
| Per-IP rate limiting + output/history caps (cost & abuse control) | Durable, cross-instance rate limiting | In-memory per-instance limiting is demo-appropriate; production would move to Upstash/Redis. |
| In-memory chat history for the session | Persistence across page reloads | No user identity to key storage against. |

See the design spec for the full reasoning, including why the model is Sonnet
4.5 (matches Cadre's own published model-selection framework) rather than a
cheaper tier, and how the knowledge base was sourced (a full `sitemap.xml`
crawl of cadreai.com, not a homepage summary — a homepage-only pass had
already produced one fabricated fact, a client name, that was caught before
it shipped).

## What I'd do with more time

1. Real auth + personalized "AI Results Dashboard" deep links for existing
   clients.
2. Durable rate limiting (Upstash/Redis) instead of the per-instance
   approximation.
3. Retrieval over live site content, to remove the static-snapshot
   staleness risk.
4. Conversation persistence + transcript handoff on escalation.
5. Automated answer-quality evals (today, `/chat-eval` is a manual
   spot-check).
