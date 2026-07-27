status: NEW

# BRIEF-2026-07-27-87-task-time-picker-explicit-confirm

## Context

Misha BUG-005: while scrolling the minute wheel in task date/time selection, the value saves and closes without pressing the confirm button.

## Task

Make task date/time picker apply changes only after explicit confirm.

Expected:

- scrolling minute/hour controls does not save;
- picker remains open while scrolling;
- confirm button applies the selected time;
- cancel/outside close does not accidentally save a partially scrolled value.

## Verification

- Add or extend task date/time picker smoke.
- Mobile 390px/iPhone 14 width.
- `node scripts/check-cp1251-mojibake.mjs`
- `npm run check:js-syntax`

## Report

Create `pm/outbox/REPORT-BRIEF-2026-07-27-87-task-time-picker-explicit-confirm.md`.
