# REPORT-BRIEF-2026-07-25-74-task-chat-confirm-action

Status: DONE

## What Was Done

Fixed the task-detail chat confirmation button for suggested actions.

Two narrow issues were fixed:

- Chat messages without an `id` now get a stable fallback key, so the confirm button can find the message it belongs to.
- Suggested edit actions now keep the supported `originalMsg` field name instead of lowercasing it to `originalmsg`, so description updates are accepted.

The action card also reuses the existing action-card button classes instead of inline styles.

## Where To Check

- Open a task detail chat with a suggested action to update the description.
- Tap `Подтвердить`.
- The action should apply once, the suggestion card should disappear, and failures should show a toast instead of doing nothing.

## Changed Files

- `index.html`
- `package.json`
- `scripts/task-chat-confirm-action-smoke.mjs`
- `FILE_MAP.md`
- `DEVELOPMENT_LOG.md`
- `pm/inbox/BRIEF-2026-07-25-74-task-chat-confirm-action.md`
- `pm/outbox/REPORT-BRIEF-2026-07-25-74-task-chat-confirm-action.md`

## Evidence

- `npm run smoke:task-chat-confirm` passed at `390x844`.
- Smoke result: one `update-task` mutation with `updates.originalMsg="Updated by task chat confirm"`, preview hidden after confirm, detail description updated.
- `npm run smoke:ask-action-preview` passed.
- `npm run smoke:premium-task-denial` passed.
- `node scripts/check-cp1251-mojibake.mjs` passed: `CP1251 mojibake check passed: 0 suspicious tokens`.
- `npm run check:js-syntax` passed.
- `npm run check:portable-paths` passed after adding Git Bash to PATH for the command.
- `npm run check:ui-architecture` passed after adding Git Bash to PATH for the command.

## Remaining Manual Proof

NEEDS-REAL: live Telegram Mini App tap on Yuri/Alexey device is still manual-only under the automation stop points.
