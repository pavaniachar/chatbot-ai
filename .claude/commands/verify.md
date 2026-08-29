---
description: Run lint, typecheck, and the full test suite in one pass
---

Run, in order, stopping at the first failure and reporting its output in full:

1. `npm run lint`
2. `npm run typecheck`
3. `npm test`

If all three pass, report "All checks passed." If any fails, do not attempt
fixes automatically — report the failure and wait for direction.
