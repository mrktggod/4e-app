status: NEW

# BRIEF-2026-07-27-95-telegram-dashboard-one-task-diagnostic

## Context

Yuri/Product BUG-007: Telegram Apps dashboard shows only one task even when the user has more tasks.

## Task

Diagnose first. Do not guess.

Check:

- task API result count;
- parsed local task count;
- rendered dashboard row count;
- filters/limits;
- Telegram-specific cache or surface differences.

If the cause is a small frontend limit/filter bug, fix it. If it needs live account evidence or backend/API work, stop with `NEED-CLAUDE` or `NEED-YURI`.

## Verification

- Add focused diagnostic output/smoke for multiple tasks.
- Compare web vs Telegram mocked surface.
- `node scripts/check-cp1251-mojibake.mjs`

## Report

Create `pm/outbox/REPORT-BRIEF-2026-07-27-95-telegram-dashboard-one-task-diagnostic.md`.
