status: DONE

# BRIEF-2026-07-25-72-calendar-task-list-clickability

## Context

Linked bug: `BUG-2026-07-25-019`.

In the calendar section, tasks are visible immediately at the bottom, but tapping them does not open anything.

## Task

Make calendar task rows/cards clickable and route to the existing task detail view. If a specific row is intentionally read-only, make that visual state explicit so it does not look tappable. Check for overlay/nav layers that may intercept taps.

## Stop Points

- No production deploy.
- No merge into `main`.
- No CAL roadmap/product expansion.
- No payment, entitlement, price, or secret work.
- Do not add a new calendar model; this is only task-list clickability/UX.

## Verification

- `node scripts/check-cp1251-mojibake.mjs`
- Existing calendar/statistics/home smoke or a new focused smoke proving a calendar task row opens task detail.
- Shared guards before commit.

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-25-72-calendar-task-list-clickability.md`.
