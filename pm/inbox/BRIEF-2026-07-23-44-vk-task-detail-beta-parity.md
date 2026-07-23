status: NEW

# BRIEF-2026-07-23-44 - VK-TASK-DETAIL-001 beta task detail parity

## Goal

Make VK task detail usable enough for beta by closing the read-only P1 gap without touching payment, entitlement, or backend auth.

## Context

`pm/vk-parity-plan-2026-07-23.md` marks VK task detail as `MISSING P1`: Telegram/browser task detail supports edit, deadline/time, priority, reminder, tags, checklist, discussion/history; VK currently has read-only title/meta/status, done, and local discussion/history.

For this night pass, keep the scope narrower than Telegram parity.

## Task

Implement or improve the smallest safe VK task-detail slice:

- server-backed title/status/priority/deadline edit if the existing worker task update API already supports it;
- visible save/cancel/error UX;
- no reminder delivery, no payment, no entitlement, no new backend auth contract;
- add or update a local VK smoke proving the edited fields persist through the mocked or local API path.

If source inspection shows this cannot be done narrowly, stop with `NEED-CLAUDE`.

## Required Report

Write `pm/outbox/REPORT-2026-07-23-44-vk-task-detail-beta-parity.md`.

Include changed files, file:line root cause, exact test command output, and honest manual tail for live VK Mini App smoke.

## Required Checks

- `node scripts/check-cp1251-mojibake.mjs`
- relevant VK smoke / Playwright command
- `git diff --check`

If `vk.html`, `index.html`, CSS, or LESS changes are made, run the relevant build/smoke guards and preserve UTF-8.

## Stop Points

No production deploy, no merge into `main`, no VK Pay, no prices, no payments, no entitlement changes, no secrets, no CAL, no live VK account/device actions.

## Expected Outcome

`DONE` for a narrow local beta parity slice with green evidence, or `NEED-CLAUDE` if the fix needs broader architecture or auth/security-adjacent changes.
