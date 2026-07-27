status: DONE

# BRIEF-2026-07-27-98-vk-task-swipe-actions-parity

## Context

Yuri approved task actions in VK like desktop and Telegram. VK remains a separate surface, so implement carefully and avoid conflicts with VK mobile gestures.

## Task

Add or restore VK task row action parity.

Minimum expected actions:

- `Готово`;
- a safe fallback visible action if swipe is unavailable;
- optional additional actions only if they already exist safely in VK task model.

## Stop Points

- Do not add destructive delete/archive without separate approval.
- If swipe conflicts with VK back gesture, keep fallback buttons and report the conflict.
- No VK Pay/payment/entitlement/auth changes.

## Verification

- Add or extend VK mobile-width smoke for swipe/fallback actions.
- `npm run test:e2e:vk`
- `npm run smoke:vk-task-complete`
- `node scripts/check-cp1251-mojibake.mjs`

## Report

Create `pm/outbox/REPORT-BRIEF-2026-07-27-98-vk-task-swipe-actions-parity.md`.
