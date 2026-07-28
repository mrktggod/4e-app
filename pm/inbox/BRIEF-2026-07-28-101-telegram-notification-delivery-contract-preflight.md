status: NEW

# BRIEF-2026-07-28-101-telegram-notification-delivery-contract-preflight

## Context

The product backlog still marks `BACK-017` as QA partial: settings and the
briefing endpoint are covered, but the Telegram delivery path is not proven.
The live Telegram/device smoke is a manual gate. This brief is only the safe
local preflight that can expose a broken contract before that gate.

## Task

1. Map the available notification/briefing path in the app checkout: settings,
   recipient resolution, message construction, and the worker-side send boundary.
2. Check for a narrow local/mock failure that would prevent a valid notification
   from reaching the send boundary. Fix only a clear bug outside secrets,
   auth-security, payment, entitlement, and production deployment.
3. Add or update a deterministic local/mock smoke proving that a representative
   notification reaches the send boundary with the intended recipient and copy.
4. Leave the existing `BACK-017` and `BACK-064` manual delivery requirements
   explicit; do not claim real Telegram delivery from local evidence.

## Stop Points

- No production deploy or merge into `main`.
- No live Telegram API calls, webhook changes, bot tokens, or secrets.
- No payment, entitlement, CAL, or auth-security changes.
- If the canonical worker/bot source needed for the path is unavailable, report
  `NEED-YURI` with the missing repo/path instead of guessing.
- Work only under `X:\Projects\4-ai-secretary`.

## Verification

- `node scripts/check-cp1251-mojibake.mjs`
- Notification-specific local/mock smoke with raw output.
- Relevant existing worker/API tests, if available in this checkout.
- `npm run check:portable-paths` or the exact guard logic if bash is unavailable.
- `git diff --check`

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-28-101-telegram-notification-delivery-contract-preflight.md`
with the path map, root cause or clean result, changed files, commit SHA, raw
local proof, and the remaining live Telegram/device gate.
