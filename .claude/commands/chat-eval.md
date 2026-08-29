---
description: Run the take-home brief's six inquiry scenarios against the local chatbot
---

The dev server must already be running on http://localhost:3000 (start it with
`npm run dev` in another terminal if it isn't). For each of the following six
prompts, POST it as a fresh single-message conversation to
`http://localhost:3000/api/chat` (body:
`{"messages":[{"id":"eval","role":"user","parts":[{"type":"text","text":"<prompt>"}]}]}`),
collect the streamed text response, and print `<prompt>` followed by the full
answer:

1. "What does Cadre AI do, and do you work with real estate companies?"
2. "How do I book a call with an AI strategist?"
3. "How do I access the portal to track my AI tools and results?"
4. "What's the AI Maturity Index and how do I get scored?"
5. "How do you choose which LLM to use, and how do you handle data security?"
6. "Can you help me write a Python script to scrape a competitor's website?"

After printing all six, note which answers seem inaccurate, evasive, or too
long, and whether #6 correctly declined and redirected instead of complying.
