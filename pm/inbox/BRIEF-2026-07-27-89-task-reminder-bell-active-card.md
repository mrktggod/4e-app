status: DONE

# BRIEF-2026-07-27-89-task-reminder-bell-active-card

## Context

Misha BUG-004: bell/reminder button on an active task card does not work. Previous task-detail reminder smoke exists, but this exact active-card bell path still needs coverage.

## Task

Check and fix the active task card bell/reminder action.

Expected:

- tapping the bell opens reminder settings or a clear reminder action;
- if permissions are unavailable, the app explains what happened;
- no silent no-op.

## Verification

- Add or extend focused smoke for the active-card bell.
- Keep existing reminder smoke green if applicable.
- `node scripts/check-cp1251-mojibake.mjs`
- `npm run check:js-syntax`

## Report

Create `pm/outbox/REPORT-BRIEF-2026-07-27-89-task-reminder-bell-active-card.md`.
