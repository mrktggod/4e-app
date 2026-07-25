status: NEW

# BRIEF-2026-07-25-70-focus-counters-consistency

## Context

Linked bug: `BUG-2026-07-25-017`.

Home focus card and focus popup show inconsistent task counts.

## Task

Make focus card and focus popup counters derive from one consistent task summary. Fix contradictory copy such as `3 задачи требуют внимания` vs `4 выделил главное` when only 3 tasks are listed.

## Stop Points

- No production deploy.
- No merge into `main`.
- No broad dashboard redesign.
- No payment, entitlement, CAL, price, or secret work.

## Verification

- `node scripts/check-cp1251-mojibake.mjs`
- `npm run smoke:home001` or focused home/focus counter smoke.
- Shared guards before commit.

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-25-70-focus-counters-consistency.md`.

