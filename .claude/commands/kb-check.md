---
description: Audit lib/chat/system-prompt.ts for claims not traceable to the design spec
---

Read `lib/chat/system-prompt.ts` and the "Knowledge base" section of
`docs/superpowers/specs/2026-08-28-cadre-support-chatbot-design.md`. For every
factual claim in the system prompt (numbers, names, URLs, policy statements),
confirm it is traceable to that spec section. Flag any claim that is NOT
traceable, and any spec fact that is missing from the prompt. Report as a short
list: `TRACEABLE` / `UNTRACEABLE` / `MISSING FROM PROMPT`.
