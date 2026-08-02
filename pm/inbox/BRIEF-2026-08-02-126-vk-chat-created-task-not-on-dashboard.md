status: NEW

# BRIEF-2026-08-02-126-vk-chat-created-task-not-on-dashboard

## Context

Manual QA 2026-08-02: VK chat now answers and appears to create a test task, but the created task does not appear on the dashboard.

This is positive progress for chat response, but task persistence/dashboard refresh is still broken or unclear.

## Task

Diagnose the VK chat-created task path:

- whether chat saves the task through the same task creation path as other VK task creation;
- whether the dashboard local task list refreshes after chat creation;
- whether ID/status/date normalization makes the new task eligible for dashboard display;
- whether the task is saved but filtered out.

Fix only narrow frontend state/refresh/normalization issues. If the cause is worker/API persistence or auth/session identity mismatch, stop with `NEED-CLAUDE` and write the scope report.

## Surface

- VK Mini App chat and dashboard.
- `vk.html` and existing VK chat/task smokes.

## Stop Points

- No production deploy.
- No merge into `main`.
- No CAL tasks.
- No price changes.
- No payment or entitlement refactors.
- No secret rotation, secret removal, or secret disclosure.

## Verification

- `npm run smoke:vk-ai-chat-parity`
- `npm run smoke:vk-home-parity`
- `npm run test:e2e:vk`
- `node scripts/check-cp1251-mojibake.mjs`
- `git diff --check`
- `npm run check:portable-paths`

## Report

Write `pm/outbox/REPORT-BRIEF-2026-08-02-126-vk-chat-created-task-not-on-dashboard.md` with root cause, changed files or NEED-CLAUDE scope, raw proof, and honest tails.
