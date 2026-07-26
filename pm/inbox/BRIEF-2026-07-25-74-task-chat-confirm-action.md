status: DONE

# BRIEF-2026-07-25-74-task-chat-confirm-action

## Context

Linked bug: `BUG-2026-07-25-021`.

In Telegram Mini App task detail chat, the AI response can render a suggested-actions card with actions such as changing the task description and opening task history. Alexey reported that the green `Confirm` / `Подтвердить` button does not work in this TMA screen.

Evidence: Telegram Apps screenshot from 2026-07-25 around 21:50, task-detail chat card with suggested actions and inactive `Подтвердить`.

## Task

Fix the suggested-actions confirm control inside task-detail chat so tapping `Confirm` applies the proposed action exactly once, updates UI state, and gives clear failure feedback if the action cannot be applied.

Keep the fix scoped to the existing task-detail/chat suggested-action flow. Do not introduce new action types unless the current data contract already supports them.

## Stop Points

- No production deploy.
- No merge into `main`.
- No payment, entitlement, CAL, price, or secret work.
- If confirming suggested actions touches broad AI intent execution or destructive task mutation, stop and write `NEED-CLAUDE` with the exact call path and risk.
- If verification requires live Telegram/device-only actions, use local/staging browser evidence where possible and mark remaining live TMA proof as `NEEDS-REAL`.

## Verification

- Step 0 encoding check if `index.html` is edited.
- `node scripts/check-cp1251-mojibake.mjs`
- Focused browser/TMA-width check that the suggested action card `Confirm` button is clickable and changes state.
- Shared guards before commit.

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-25-74-task-chat-confirm-action.md`.
