status: DONE

# BRIEF-2026-07-27-88-task-date-popover-viewport-fit

## Context

Misha BUG-006: task date/time popover overflows past the right edge on iPhone 14 width.

## Task

Make the task date/time popover fit within the viewport.

Expected:

- popover shifts left or shrinks within safe margins;
- no horizontal clipping on 390px and iPhone 14-like viewport;
- fields/buttons remain tappable.

## Verification

- Add or extend focused popover geometry smoke.
- `document.documentElement.scrollWidth <= viewportWidth`
- popover right edge <= viewport right edge.
- `node scripts/check-cp1251-mojibake.mjs`

## Report

Create `pm/outbox/REPORT-BRIEF-2026-07-27-88-task-date-popover-viewport-fit.md`.
