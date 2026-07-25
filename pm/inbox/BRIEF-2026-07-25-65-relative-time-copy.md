status: NEW

# BRIEF-2026-07-25-65-relative-time-copy

## Context

Linked bug: `BUG-2026-07-25-012`.

UI/AI copy says `недавно` while also showing `47 дней назад`.

## Task

Fix relative-time wording so old tasks are not described as `недавно`. Keep copy consistent between task cards, focus summaries, and AI-generated task metadata if they share helpers.

## Stop Points

- No production deploy.
- No merge into `main`.
- No backend data migration.
- No payment, entitlement, CAL, price, or secret work.

## Verification

- `node scripts/check-cp1251-mojibake.mjs`
- Existing relevant task title/date smoke or a new narrow static test for 47-day-old task wording.
- Shared guards before commit.

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-25-65-relative-time-copy.md`.

