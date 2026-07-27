status: NEW

# BRIEF-2026-07-27-86-task-completion-feedback-web-tg

## Context

Yuri/Product BUG-004: task completion inside a task card does not give clear feedback. VK completion feedback was improved separately in `REPORT-VK-TASK-COMPLETE-001.md`; this brief covers web/Telegram surfaces.

## Task

Make task completion feedback clear on web/Telegram task cards.

Expected:

- loading state stays inside the action control;
- success is visible and does not look broken;
- failure shows a clear error state/toast;
- no duplicate completion requests on fast taps.

## Stop Points

- No payment/entitlement changes.
- Do not change destructive task semantics beyond existing complete/done behavior.

## Verification

- Extend existing task-card smoke or add focused smoke.
- Check mobile 390px.
- `node scripts/check-cp1251-mojibake.mjs`
- `npm run check:js-syntax`

## Report

Create `pm/outbox/REPORT-BRIEF-2026-07-27-86-task-completion-feedback-web-tg.md`.
