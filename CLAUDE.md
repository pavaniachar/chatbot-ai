@AGENTS.md

# Cadre AI Support Chatbot

Customer-support chatbot for Cadre AI (an AI strategy consultancy), built for
the Cadre AI take-home challenge. Answers common inbound questions (services,
industries, booking, the AI Maturity Index, LLM/security posture) from a
static knowledge base, and escalates to a human for anything outside it.

**Design rationale:** `docs/superpowers/specs/2026-08-28-cadre-support-chatbot-design.md`
**Scope decisions & phases:** `plan.md` (repo root)

## Architecture

- `app/api/chat/route.ts` — POST handler. Validates the request, checks a
  per-IP rate limit, trims history, then streams a response from
  `anthropic/claude-sonnet-4.5` via OpenRouter using the Vercel AI SDK.
- `lib/chat/` — all business logic, framework-independent and unit tested:
  `system-prompt.ts` (the knowledge base), `history.ts`, `rate-limit.ts`,
  `client-ip.ts`, `validate-request.ts`, `errors.ts`.
- `components/chat/` — presentational chat UI, composed by `ChatWindow.tsx`
  (owns the `useChat` hook; every other component is a plain props-in
  function).
- `app/page.tsx` — thin wrapper rendering `<ChatWindow />`.

## Working in this repo

- **Knowledge base changes go in `lib/chat/system-prompt.ts` only** — it's a
  single exported string. Don't scatter Cadre facts elsewhere. Every fact in
  it should be traceable to the spec's "Knowledge base" section; run
  `/kb-check` after editing it.
- **Never invent Cadre facts** (pricing, certifications, URLs, client names).
  If it's not in `system-prompt.ts`, the bot is instructed to say so and hand
  off — that's intentional, not a gap to patch with a guess.
- **The route handler is tested at its seams**, not against the live model —
  validation, rate-limiting, and error-mapping are unit tested; the model call
  itself is mocked, so tests don't spend the OpenRouter budget. Use
  `/chat-eval` (dev server running) to manually sanity-check real model
  answers.
- **Run `/verify` before committing** — lint, typecheck, and the test suite.
- **`OPENROUTER_API_KEY`** lives in `.env.local` (gitignored) locally, and
  must be set in the Vercel project's environment variables for deploys to
  work. Check remaining budget with `/cost-check`.
- Small, frequent commits — one per task, following `plan.md`.

## Testing

Two layers, kept separate:

**Unit** — Vitest + React Testing Library, config in `vitest.config.mts`. Run
`npm test` for a single run or `npm run test:watch` while developing. Tests
live in `tests/`, mirroring the `lib/` and `components/` structure.

**End-to-end** — Playwright, config in `playwright.config.ts`, specs in `e2e/`.
Run `npm run test:e2e` (or `npm run test:e2e:ui`). The suite builds the app and
serves it on port 3100, so it never collides with a `npm run dev` on 3000, and
it route-intercepts `/api/chat` in the browser — the real handler never runs, no
`OPENROUTER_API_KEY` is needed, and no OpenRouter budget is spent. Scripted
replies are built with the AI SDK stream helpers in `e2e/helpers/`.

Every e2e test carries a page-error guard (`e2e/helpers/fixtures.ts`) that fails
on any uncaught exception or console error. That guard is the point of the
suite: a throw during render unmounts the whole client tree and blanks the
page, and nothing in the unit tests would notice. When adding an e2e test,
assert `expectStillAlive()` after anything that could go wrong.

## Deployment

Vercel, auto-deploying from `main` via GitHub integration
(`pavaniachar/chatbot-ai`). Push to `main` to deploy — there is no separate
deploy step.
