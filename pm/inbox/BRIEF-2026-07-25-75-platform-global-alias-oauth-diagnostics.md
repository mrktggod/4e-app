status: NEW

# BRIEF-2026-07-25-75-platform-global-alias-oauth-diagnostics

## Priority

Priority 1 for the next night run.

## Context

Based on `BRIEF-2026-07-21-morning-refine-03-platform-global-alias-investigate`, which has been untouched since 2026-07-21.

Production risk: `window.PLATFORM` is never installed as a global variable. This may leave 17+ dead code paths in `scripts/auth.js` and `scripts/auth-handlers.js`, including a hard throw in VK/Yandex OAuth without fallback.

## Task

Diagnostics only. Do not fix code in this run.

Required output:

1. A table of every `window.PLATFORM` access with `file:line` and what happens when the value is `undefined`.
2. Live staging check of VK login and Yandex login using real clicks, not source-only reasoning. Record exactly what breaks and at which step.
3. Conclusion: does VK/Yandex login work on production at all.

## Stop Points

- Do not fix this bug in this run.
- No production deploy.
- No merge into `main`.
- No payment, entitlement, CAL, price, or secret work.
- If required secrets, provider access, staging auth configuration, or live accounts are unavailable, do not bypass. Mark the result `NEED-YURI` and list the exact missing access.

## Verification

- Use staging for live clicks.
- Source inventory must include file paths and line numbers.
- If production behavior cannot be checked safely without credentials or live account access, report the limitation explicitly.

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-25-75-platform-global-alias-oauth-diagnostics.md` with facts, evidence, and a proposed fix plan.
