status: DONE

# BRIEF-2026-07-27-93-task-advice-manual-generate

## Context

Yuri/Product TASK-010: task advice should not auto-generate when a task card opens. Generation should start only after explicit user action.

## Task

Disable auto-generation of task advice on task open and add/keep a manual `Generate advice` action.

Expected:

- opening a task does not call AI advice generation;
- user can explicitly request advice;
- loading state appears only after the click;
- errors are understandable;
- no AI usage is spent on normal task views.

## Stop Points

- If this touches backend AI billing/entitlement logic, stop with `NEED-CLAUDE`.

## Verification

- Add or extend smoke that opens task detail and asserts no advice request until click.
- `node scripts/check-cp1251-mojibake.mjs`
- `npm run check:js-syntax`

## Report

Create `pm/outbox/REPORT-BRIEF-2026-07-27-93-task-advice-manual-generate.md`.
