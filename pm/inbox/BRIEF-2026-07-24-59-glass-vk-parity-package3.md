status: DONE

# BRIEF-2026-07-24-59-glass-vk-parity-package3

## Context

Package 3 finishes the safe visual pass by checking VK Mini App parity against
the Telegram glass surfaces completed in packages 1 and 2. This is a visual
and layout parity pass only.

Dependencies:

- packages 1 and 2 should be `DONE`, or this brief should become
  `BLOCKED-DEPENDENCY`;
- VK beta safe parity tasks 44, 45, 46 and 47 should remain green;
- VK auth/session and VK AI-chat runtime fixes remain Claude-reviewed
  gray-zone work.

## Task

Apply the shared glass primitives to safe VK surfaces that already have local
parity and smoke coverage.

In scope:

- VK home focus/top-task metadata surfaces;
- VK task-detail edit surfaces, without changing save/cancel payloads;
- VK profile summary/privacy surfaces, excluding subscription/payment;
- VK calendar selected-day/task-list surfaces where safe;
- dark/light readable equivalents when supported by the current VK shell.

Out of scope:

- VK auth/session bootstrap;
- VK AI chat backend behavior;
- VK Pay, subscription, entitlement, pricing and live platform actions;
- live VK Mini App/device smoke;
- production deploy.

Keep VK data flow and existing endpoints untouched.

## Stop Points

- No production deploy or merge into `main`.
- No CAL, price, payment, entitlement, auth-security or secret work.
- If a VK surface touches auth/session or AI-chat backend behavior, mark that
  part `NEED-CLAUDE` and continue only with clearly safe visual surfaces.
- Do not weaken VK smoke tests.

## Verification

- `node scripts/check-cp1251-mojibake.mjs`
- `npm run build:css`
- `npm run smoke:vk-home-parity`
- `npm run smoke:vk-profile-parity`
- `npm run smoke:vk-task-detail-edit`
- `npm run smoke:vk-calendar-date-key`
- `npm run test:e2e:vk`
- `npm run check:portable-paths`
- `git diff --check`
- 390x844 screenshots of covered VK surfaces

## Report

Write
`pm/outbox/REPORT-BRIEF-2026-07-24-59-glass-vk-parity-package3.md`
with changed files/selectors, commit SHA, raw VK smoke output, screenshot
paths, explicit excluded auth/AI/payment areas and manual live tails.
