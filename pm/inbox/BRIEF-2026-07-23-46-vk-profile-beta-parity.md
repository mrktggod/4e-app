status: NEW

# BRIEF-2026-07-23-46 - VK-PROFILE-001 beta profile parity

## Goal

Make VK profile usable for beta by aligning information architecture with the main app, while leaving subscription/payment surfaces untouched.

## Context

`pm/vk-parity-plan-2026-07-23.md` marks VK profile as `LAGGING`: Telegram/browser has expanded profile, notification/privacy/subscription screens; VK has identity panel and theme, while notifications/subscription rows show "soon".

This task can only cover safe profile structure and privacy/navigation clarity.

## Task

Implement or document the smallest safe VK profile parity slice:

- identity/account information grouping;
- privacy/legal navigation if already available;
- notification settings entry only if it does not require backend or push changes;
- no subscription/paywall/payment/VK Pay changes;
- add or update local VK smoke evidence.

If the profile change would touch monetization, entitlement, OAuth scopes, secrets, or product promises, stop with `NEED-YURI`.

## Required Report

Write `pm/outbox/REPORT-2026-07-23-46-vk-profile-beta-parity.md`.

Include changed files, file:line root cause, test output, and manual tail.

## Required Checks

- `node scripts/check-cp1251-mojibake.mjs`
- relevant VK smoke / Playwright command
- `git diff --check`

If CSS/LESS or app HTML changes are made, run build/smoke guards and preserve UTF-8.

## Stop Points

No production deploy, no merge into `main`, no VK Pay, no prices, no payments, no entitlement changes, no secrets, no CAL, no live VK account/device actions.

## Expected Outcome

`DONE` for a narrow local profile/navigation parity slice with green evidence, or `NEED-YURI` if monetization/legal/product decisions block it.
