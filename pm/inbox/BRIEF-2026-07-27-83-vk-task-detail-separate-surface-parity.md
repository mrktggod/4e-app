status: NEW

# BRIEF-2026-07-27-83-vk-task-detail-separate-surface-parity

## Context

Yuri decided VK remains a separate surface, but should be close to desktop/Telegram. Task detail parity should be adapted in VK, not blindly copied.

## Task

Improve VK task-detail parity as one narrow `vk.html` slice.

Focus on visible task-detail UX:

- title/status/priority/deadline remain editable;
- layout should feel close to current product card/detail direction;
- completion and back behavior must remain understandable;
- no auth/payment/entitlement changes.

## Stop Points

- No broad shell migration.
- No VK Pay or entitlement work.
- If parity requires a larger shared shell plan, stop with `NEED-CLAUDE`.

## Verification

- `npm run smoke:vk-task-detail-edit`
- `npm run smoke:vk-task-complete`
- `npm run test:e2e:vk`

## Report

Create `pm/outbox/REPORT-BRIEF-2026-07-27-83-vk-task-detail-separate-surface-parity.md`.
