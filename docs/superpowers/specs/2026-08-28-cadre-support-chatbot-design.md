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
- **Model**: `anthropic/claude-sonnet-4.5`, $3/M input, $15/M output.
  (Verified alternatives: Haiku 4.5 at $1/$5, Opus 4.5 at $5/$25.)
- **Package set**: `ai@7` + `@ai-sdk/react@4` + `@openrouter/ai-sdk-provider@3`
  + `zod`. The `@ai-sdk/react` package is versioned independently of `ai`
  (dist-tags: `ai-v5`→2.x, `ai-v6`→3.x, `latest`/v7→4.x). Its React peer range
  `^19.2.1` accepts the project's 19.2.8. Guides written for AI SDK v5 will
  produce a mismatched install.
- **Next.js 16**: Route Handlers are conventional (`app/api/*/route.ts`, Web
  Request/Response, uncached for POST). Vitest is officially supported per
  `node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md`.

### Model selection rationale

The model is selected by applying **Cadre's own published framework**
(`/articles/ai-model-selection`) rather than an external rubric. That framework
places customer service in the **Sonnet tier** and calls Sonnet "the practical
default for the majority of AI-enabled workflows," reserving Haiku for
classification, extraction, and templated responses, and Opus for high-stakes
analysis. A support bot that must judge intent, decide when it is out of depth,
and escalate deliberately is doing more than template-filling — so
`anthropic/claude-sonnet-4.5` is the tier-consistent choice.

At ~$0.020/turn (4k-token system prompt, 6-message window, ~350-token replies),
$5 covers roughly 250 conversations — ample for demo, eval runs, and the review
session. Haiku 4.5 was the initial pick and remains the documented fallback if
budget tightens: ~$0.007/turn, ~760 conversations, at some cost to nuance.

Serving Anthropic models via OpenRouter also mirrors Cadre's own stated stack —
they name OpenRouter for model access, and `/ai-engineering` describes multi-LLM
support across Claude, OpenAI, Gemini, and Mistral.

**Prompt caching** is the main cost lever available: the ~4k-token knowledge
base is static across every request, so caching it collapses the dominant input
cost on repeat turns. Worth enabling if usage climbs.

## Knowledge base

Content sourced from cadreai.com, verified 2026-08-28, and compiled statically
into the system prompt. No live fetching at request time — it keeps latency and
cost down and removes a runtime network dependency.

Source pages were enumerated from `sitemap.xml` (107 URLs; `robots.txt` permits
crawling) and the highest-value pages fetched individually rather than
summarizing the homepage alone.

> **Correction:** an initial homepage-only summary attributed a case study to a
> client named "iSupport." The actual `/case-studies` page shows eight
> engagements with **non-disclosed** clients. That name was removed. It is the
> reason the knowledge base is built from primary pages, not summaries — a
> fabricated client name in the KB would have been repeated as fact by the bot.

**Contact** (`/contact`): form fields Full Name, Email, Subject, Message.
Email `hello@gocadre.ai`, phone (619) 324-3223, office 3580 Carmel Mountain Rd
#150, San Diego, CA 92130. No public calendar link — "Talk to an AI Strategist"
routes to the form. Note the email domain is `gocadre.ai`, not `cadreai.com`.

**Services** (one page each):
- **AI Strategy** (`/strategy`) — four phases: Discover Use Cases, Survey the
  Landscape, Implement Solutions, Scale with Confidence. *"We don't deliver
  massive slide decks and walk away. We find quick wins that create measurable
  EBITDA impact."*
- **AI Leadership & Facilitation** (`/leadership-facilitation`) — formats:
  2-day intensive, 1-day workshop, half-day executive session, 1-hour virtual
  kickoff. Split 30% teaching / 30% interaction / 40% application on the
  client's real challenges; participants leave with 3–5 identified opportunities.
- **AI Engineering** (`/ai-engineering`) — automation and integration (data
  entry, document routing, email triage, report generation), multi-LLM support
  (Claude, OpenAI, Gemini, Mistral), n8n for orchestration.
- **AI Agents** (`/agents`) — three tiers: prompts & assistants, voice agents
  (conversational AI handling intake, qualification, and support), fully-fledged
  agents with planning, multi-tool integration, and guardrails.

**AI Maturity Index**: scores a company across an **eight-pillar framework**
(dedicated AI team, AI Command Center, AI-first culture, connected tech stack,
AI-healthy data, AI agent readiness, departmental deep dives, 3-year vision).
Delivers a grade per area with explanations plus improvement actions. Accessed
via the "Get Your AI Results" / "Get Your AI Maturity Index" CTA, which is
gated behind the same `/contact` inquiry form — no self-serve scoring link. It
is also Phase 2 of the **45-Day AI Transformation Intensive**
(`/ai-transformation-intensive`): Kickoff → AI Maturity Index → Full-Day
Workshop → Use Case Library → Three-Year Vision → Twelve-Month Roadmap.

**Client portal**: existing clients track tools, agents, training, and
outcomes in the **"AI Results Dashboard"** (mentioned on the homepage). It is
not self-signup — the homepage states it "requires contacting them to
access," i.e. provisioned through the account team, not a public login page.

**Industries** (9, each with its own page and positioning): professional
services, private equity, real estate, financial services, mortgage & lending,
construction, retail & e-commerce, manufacturing & logistics, hospitality.

**Case studies** (`/case-studies`) — eight engagements, clients non-disclosed,
with quantified outcomes. Representative: 8,000+ hours saved annually on
proposal automation; an AI-powered booking/occupancy-visibility system for a
hospitality client saving $420,000 annually by eliminating same-day "flip day"
incidents that had cost $1,000 per incident in expedited cleaning fees; a
mortgage Loan Intelligence Assistant saving 2,500 hours annually and cutting
loan processing from 1–2 days to under 15 minutes; and a real estate AI field
scheduling platform (automated route optimization, territory-based assignment)
lifting daily efficiency 57%.

**Company** (`/about`): founded by Grayson Lafrenz (CEO), Riley Stricklin
(Chief Strategy Officer), Chad Lohrli (Chief AI Officer); Keith Jensen
(President), Ben Shapiro (Head of AI Strategy). 100+ high-ROI use cases across
50+ companies. "The Cadre Way": growth mindset, extreme ownership, teamwork,
scrappiness.

**Pricing**: not publicly disclosed anywhere on the site; custom engagement model.

### Handling the security question

Scenario 5 ("LLM selection and data security") is answerable from real published
content on both halves:

- **Model selection** (`/articles/ai-model-selection`) — Cadre publishes a
  **tiered selection framework** driven by task type/complexity, cost
  efficiency, and performance requirements: Haiku for classification,
  extraction, templated responses; Sonnet for writing, multi-step analysis, and
  customer service ("the practical default for the majority of AI-enabled
  workflows"); Opus for due diligence and high-stakes work. Their position:
  using one model for every task is poor governance, and ~60–70% of business
  workflows belong in the Haiku or Sonnet tier.
- **Data security** — `/ai-engineering` states client **"data is never used to
  train other models"** and addresses preventing employees from sharing company
  secrets on personal LLMs. `/legal/privacy-policy` gives a **2-year standard
  retention** period, "appropriate technical and organisational measures," and
  data subject rights (access, correct, delete, restrict) via
  `privacy@gocadre.ai`.

**Still explicitly declined**, because the site genuinely does not address them:
SOC 2 / GDPR / CCPA certification status, subprocessor lists, and DPA terms.
The privacy policy names no compliance framework. The bot states what is
published, then routes these to a human rather than inferring.

Fabricated security and compliance claims are the highest-liability
hallucination class a support bot can produce. Declining the unpublished
specifics is a deliberate product decision, not a capability gap.

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
