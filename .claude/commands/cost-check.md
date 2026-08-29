---
description: Check remaining OpenRouter budget on the chatbot's API key
---

Read the `OPENROUTER_API_KEY` value from `.env.local` (do not print the key
itself) and run:

`curl -s https://openrouter.ai/api/v1/key -H "Authorization: Bearer $OPENROUTER_API_KEY"`

Report the `limit`, `usage`, and `limit_remaining` fields in plain language
(e.g. "$X of $Y used, $Z remaining, expires <date>"). Warn if less than $1
remains.
