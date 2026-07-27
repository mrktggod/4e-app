status: NEW

# BRIEF-2026-07-27-85-return-to-previous-route

## Context

Yuri/Product BUG-003: when a user opens a task/card/entity from a section, the back/exit action often returns to dashboard instead of the previous screen.

## Task

Fix or narrow-diagnose return navigation for task/detail flows.

Expected:

- opening a task from Tasks returns to Tasks;
- opening from Today returns to Today;
- direct/deep-link fallback can still return to dashboard;
- behavior is covered by a focused smoke.

## Stop Points

- If this touches broad routing architecture across many screens, stop with `NEED-CLAUDE` and write exact findings.

## Verification

- Add or extend smoke for previous-route behavior.
- Check mobile width.
- `node scripts/check-cp1251-mojibake.mjs`
- `npm run check:js-syntax`

## Report

Create `pm/outbox/REPORT-BRIEF-2026-07-27-85-return-to-previous-route.md`.
