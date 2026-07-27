status: DONE

# BRIEF-2026-07-27-91-task-toast-dismiss-on-scroll

## Context

Misha BUG-007: the `Saved` toast can stay visible while scrolling the task page.

## Task

Make success toasts dismiss reliably after a short time and/or when task context changes/scrolls.

Expected:

- `Saved` toast auto-hides;
- scrolling the task detail page does not leave stale success UI stuck over content;
- error toasts remain readable long enough.

## Verification

- Add focused toast lifecycle smoke.
- Check task-detail mobile viewport.
- `node scripts/check-cp1251-mojibake.mjs`
- `npm run check:js-syntax`

## Report

Create `pm/outbox/REPORT-BRIEF-2026-07-27-91-task-toast-dismiss-on-scroll.md`.
