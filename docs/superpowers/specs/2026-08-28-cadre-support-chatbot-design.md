# Cadre AI Support Chatbot — Design

**Date:** 2026-08-28
**Status:** Approved for implementation

## Context

Build a customer support chatbot for Cadre AI, an AI strategy and implementation
consultancy, to handle common inbound inquiries from prospects and existing
clients. This replaces the default `app/page.tsx` in an otherwise untouched
`create-next-app` scaffold (Next.js 16.3.3, React 19.2.8, Tailwind v4).

The brief is deliberately underspecified: scope and prioritization decisions are
part of the evaluation. This document records those decisions and their reasoning.

## Goals

1. Answer the six inquiry scenarios named in the brief accurately and without
   fabrication.
2. Escalate cleanly when out of depth, rather than guessing.
3. Ship a deployed, public URL backed by a repo that documents its own reasoning.

## Non-goals

Explicitly out of scope, with rationale:

| Excluded | Why |
|---|---|
| Authentication / client login | No backend, CRM, or account data exists to authenticate against or personalize from. Mock auth would consume most of the build budget for a feature outside the brief's stated bar. |
| Lead capture (name/email) | Requires storage and a delivery destination. Capturing a lead and then discarding it is worse than not capturing it. |
| Retrieval / vector search over site content | The knowledge base is small and stable enough to live in the system prompt. RAG would add infrastructure without improving answers at this corpus size. |
| Chat persistence across reloads | No user identity to key storage against; in-memory keeps the data model honest. |
| Multi-turn lead qualification flows | Sales-process design, not support. |

Personalization for existing clients is handled at the *prompt* level — the bot
infers prospect vs. client from context and branches its copy — with no
authentication behind it. This is a deliberate approximation, not an oversight.

## Verified technical facts

Confirmed by direct inspection rather than assumption:

- **API key**: OpenRouter (`sk-or-v1-` prefix). Live check returned
  `limit: $5, usage: $0, expires_at: 2026-09-26` — 29 days out, not the 7 days
  originally assumed. The key outlives the review session.
- **Model**: `anthropic/claude-haiku-4.5`, $1/M input, $5/M output, 200k context.
- **Package set**: `ai@7` + `@ai-sdk/react@4` + `@openrouter/ai-sdk-provider@3`
  + `zod`. The `@ai-sdk/react` package is versioned independently of `ai`
  (dist-tags: `ai-v5`→2.x, `ai-v6`→3.x, `latest`/v7→4.x). Its React peer range
  `^19.2.1` accepts the project's 19.2.8. Guides written for AI SDK v5 will
  produce a mismatched install.
- **Next.js 16**: Route Handlers are conventional (`app/api/*/route.ts`, Web
  Request/Response, uncached for POST). Vitest is officially supported per
  `node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md`.

### Model selection rationale

Support Q&A over a fixed knowledge base is an instruction-following task, not a
reasoning-heavy one. Haiku 4.5 is chosen for **latency** — response speed is a
UX feature in chat — not for price. At ~$0.004/turn (1.5k-token system prompt,
6-message window, ~350-token replies), $5 covers roughly 1,200–1,400
conversations, so cost is not the binding constraint. Anthropic via OpenRouter
also mirrors Cadre's own stated partner stack.

## Knowledge base

Content sourced from cadreai.com, verified 2026-08-28, and compiled statically
into the system prompt. No live fetching at request time — it keeps latency and
cost down and removes a runtime network dependency.

- **Services**: AI Strategy, AI Leadership & Facilitation, AI Engineering, AI Agents.
- **Industries** (9): professional services, private equity, real estate,
  financial services, mortgage & lending, construction, retail & e-commerce,
  manufacturing & logistics, hospitality.
- **Booking**: "Talk to an AI Strategist" CTA → `/contact`.
- **AI Maturity Index**: eight-pillar scoring framework, accessed via `/contact`.
- **Client portal**: "AI Results Dashboard" — tracks tools, agents, training,
  and outcomes.
- **Case studies**: `/case-studies` (iSupport, private equity engagements;
  cost savings and process optimization).
- **Pricing**: not publicly disclosed; custom engagement model.
- **Partners**: OpenAI, Anthropic, Google, Microsoft, AWS, Salesforce,
  Snowflake; OpenRouter for model access.

### Handling the security question

The brief asks the bot to field questions on "LLM selection and data security."
cadreai.com publishes nothing on security posture. The bot therefore:

- **Answers the model-selection half substantively** — model-agnostic approach
  via OpenRouter, selection matched to the use case, major-provider ecosystem.
- **Declines the compliance half explicitly** — no claims about DPAs, SOC 2,
  data residency, retention, or training-on-client-data, and routes the user to
  a human instead.

Fabricated security and compliance claims are the highest-liability hallucination
class a support bot can produce. Declining them is a deliberate product decision,
not a capability gap.

## Architecture

```
app/page.tsx            thin wrapper, renders <ChatWindow />
app/api/chat/route.ts   POST handler: validate → rate limit → stream
lib/chat/
  system-prompt.ts      knowledge base + behavioral rules
  history.ts            sliding-window trim
  rate-limit.ts         pure sliding-window limiter
  errors.ts             provider error → user-safe message mapping
components/chat/        presentational units
tests/                  Vitest + React Testing Library
```

### Request flow

Client `useChat` (`@ai-sdk/react`) → `POST /api/chat` → validate body (zod) →
rate-limit by IP → trim history → `streamText` with system prompt via
`@openrouter/ai-sdk-provider` → stream response back.

### Data model

Domain types stay deliberately small:

```ts
type Role = 'user' | 'assistant'
interface ChatMessage { id: string; role: Role; content: string; createdAt: number }
```

The wire format follows the AI SDK's `UIMessage` (parts-based in v7); the exact
shape will be read from the installed package's types at implementation time
rather than assumed here. Domain types adapt to the SDK, not the reverse.

### Cost and abuse controls

The endpoint is public and backed by a funded key, so both are the same problem.

- **Scope guard** in the system prompt: refuse non-Cadre topics and instructions
  to disregard the prompt; redirect to Cadre subjects.
- **Output cap**: `maxOutputTokens` ~500.
- **Input cap**: sliding history window of the last ~6 exchanges. Without this,
  resending full history makes per-turn cost grow superlinearly.
- **Rate limit**: in-memory sliding window per IP (~20 requests / 5 min).
  On serverless this is per-instance and therefore approximate — acceptable for
  a demo, would move to Upstash/Redis in production. Recorded as a known limit.

## Error handling

Every failure mode gets a defined, user-safe behavior. Raw provider errors and
the API key are never surfaced to the client.

| Condition | User-visible behavior |
|---|---|
| Missing key at boot | Generic "assistant unavailable"; logged server-side |
| 401 invalid key | "Temporarily unavailable" + contact link |
| 402 budget exhausted | "Temporarily unavailable" + contact link (no billing detail) |
| 429 local rate limit | "You're sending messages quickly — try again shortly" |
| 429 upstream | "High demand, try again in a moment" |
| 5xx upstream | Retry once, then error state with retry affordance |
| Network drop **mid-stream** | Retain partial text, append inline error + retry |
| User-initiated stop | Retain partial text, no error state |

The mid-stream case is a separate code path from pre-stream failure and is the
one most commonly gotten wrong; it is tested explicitly.

### Escalation

Escalation is a deliberate, testable behavior — not an emergent property of the
prompt. Triggers: out-of-scope topic, pricing specifics, security/compliance
specifics, anything requiring account data, explicit request for a human, or
repeated inability to answer. Response is a structured handoff naming the
limitation and pointing to `/contact` / "Talk to an AI Strategist". No lead
capture.

## UI

Full-height branded chat surface — dark, gradient-accented, consistent with a
consultancy's positioning. Animated message entrance, streaming cursor,
auto-scroll, markdown rendering in assistant replies, and suggested-prompt chips
seeding the brief's common questions for first-touch users. Tailwind v4 (already
installed) plus `framer-motion` for animation polish.

**Responsive down to 375px** — the interviewer may open the demo on a phone;
visual polish that breaks on mobile is a net negative.

### Components (`components/chat/`)

| Component | Responsibility |
|---|---|
| `ChatWindow` | Owns `useChat`, composes the surface |
| `ChatHeader` | Branding, reset affordance |
| `MessageList` | Ordering, auto-scroll |
| `MessageBubble` | Role-based styling, markdown |
| `TypingIndicator` | Streaming/pending state |
| `SuggestedPrompts` | Seed chips, hidden after first turn |
| `ChatInput` | Submit, Enter/Shift-Enter, disabled during stream |
| `ErrorNotice` | Error copy + retry |

Each is presentational and independently testable; state lives in `ChatWindow`.

## Testing (`tests/`)

Vitest + React Testing Library.

- `system-prompt` — knowledge base assertions present; scope-guard and
  escalation rules present.
- `history` — window trimming preserves order and never orphans a turn.
- `rate-limit` — pure-function boundaries: under, at, and over limit; window expiry.
- `errors` — provider status → user-safe copy; never leaks key or raw error.
- `MessageBubble` — role styling, markdown rendering.
- `ChatInput` — Enter submits, Shift-Enter newlines, disabled while streaming.
- `SuggestedPrompts` — click populates and dispatches.
- `ErrorNotice` — retry invokes handler.

The route handler is tested at the seams (validation, rate limit, error mapping)
rather than by calling the live model — deterministic, and it does not spend
budget on every test run.

## Claude Code workflow artifacts

The highest-weighted evaluation dimension (30%) names subagents, custom commands,
and context management. These are built as real, committed artifacts:

**Custom commands** (`.claude/commands/`):
- `/kb-check` — flag assertions in the system prompt not traceable to sourced notes.
- `/chat-eval` — run the brief's six scenarios against the bot; print answers for review.
- `/cost-check` — query OpenRouter key usage and report remaining budget.
- `/verify` — lint + typecheck + tests in one pass.

**Subagent parallelization** — independent leaves are delegated; integration is not:
- Knowledge base / system-prompt content
- Presentational components
- Test scaffolding and config

The API route, streaming wiring, and error handling stay in the main thread —
that is where the integration risk concentrates.

**Context management**: root `CLAUDE.md` is rewritten as project onboarding
documentation — opinionated and specific to this codebase, not boilerplate. It
must retain the `@AGENTS.md` import — `AGENTS.md` is auto-generated and re-added
by `next dev`, and dropping the import silently loses the Next.js 16 guidance.

**Root `plan.md`** (required deliverable) is the phased execution plan and the
record of scope decisions, written for the interviewer. It is distinct from this
document: this spec is the *design* rationale; `plan.md` is the *sequence* of
work plus the explicit in/out scope table and trade-offs. Both are committed.

## Deployment

Vercel, already connected to `pavaniachar/chatbot-ai` for auto-deploy on push to
`main`. `OPENROUTER_API_KEY` must be added in the Vercel dashboard before the
first deploy will function — it is gitignored (`.env*`) and will not arrive via
push. Locally it lives in `.env.local`.

Small, frequent commits per the brief's own guidance.

**Security note**: the key was shared in plaintext and should be rotated after
the challenge concludes.

## Future work

Ordered by value if the build continued:

1. **Auth + personalized portal links** — real client identity would let the bot
   deep-link into the AI Results Dashboard instead of describing it.
2. **Durable rate limiting** (Upstash/Redis) — replaces the per-instance approximation.
3. **Retrieval over live site content** — removes the static-snapshot staleness risk.
4. **Conversation persistence + transcript handoff** — escalation could carry
   context to a human rather than restarting the conversation.
5. **Answer-quality evals** — `/chat-eval` is manual review; automated scoring
   against expected answers would catch knowledge-base regressions.
