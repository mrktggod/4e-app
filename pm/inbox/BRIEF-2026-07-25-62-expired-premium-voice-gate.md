status: DONE

# BRIEF-2026-07-25-62-expired-premium-voice-gate

## Context

Linked bug: `BUG-2026-07-25-009`.

Voice mode for an expired Premium user looks like a broken listening pipeline instead of a paid-access state.

## Task

Add clear expired-Premium handling for voice entry/start failures. The user should understand that voice requires Premium and have a visible route to subscription/benefits. Do not alter payment, entitlement, or pricing logic.

## Stop Points

- No production deploy.
- No merge into `main`.
- No price changes.
- No payment or entitlement refactor.
- No secret handling.
- If voice access state cannot be determined safely from current frontend/backend responses, write `NEED-CLAUDE` report.

## Verification

- `node scripts/check-cp1251-mojibake.mjs`
- Focused voice smoke or Playwright/static test for expired-premium denial copy.
- Shared guards before commit.

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-25-62-expired-premium-voice-gate.md`.
