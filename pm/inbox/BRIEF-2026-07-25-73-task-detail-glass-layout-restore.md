status: DONE

# BRIEF-2026-07-25-73-task-detail-glass-layout-restore

## Context

Linked bug: `BUG-2026-07-25-020`.

The current light glass task-detail layout regressed: right-side meta cards overlap the task title. Alexey provided a reference screenshot of the agreed target layout: status and participants panels above, then one wide hero card with actions/date/priority/status aligned in the top row, title and description below, and chat card underneath.

## Task

Restore task detail to the agreed glass layout without title/meta overlap. Keep changes scoped to task-detail structure/styles and reuse existing glass tokens/classes where possible.

## Stop Points

- No production deploy.
- No merge into `main`.
- No broad redesign across unrelated screens.
- No payment, entitlement, CAL, price, or secret work.
- If this conflicts with the active glass package sequencing, write a `NEED-CLAUDE` report with the exact conflict.

## Verification

- Step 0 encoding check if `index.html` is edited.
- `node scripts/check-cp1251-mojibake.mjs`
- `npm run smoke:back069-hero`
- `npm run smoke:back067-reminder` if reminder controls move.
- Shared guards before commit.

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-25-73-task-detail-glass-layout-restore.md`.
