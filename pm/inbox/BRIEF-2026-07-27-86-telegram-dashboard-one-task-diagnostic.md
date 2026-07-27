status: DUPLICATE

# BRIEF-2026-07-27-86-telegram-dashboard-one-task-diagnostic

Superseded by `BRIEF-2026-07-27-95-telegram-dashboard-one-task-diagnostic.md`.

Do not process this duplicate brief in automation.

## Context

`pm/inbox/PRODUCT_IDEAS_TASKS.md` BUG-007: on the Telegram Mini App dashboard, only 1 task shows even when the user has many more. Possible hardcoded `limit: 1` or pagination/filter bug.

## Task

1. Trace the API call/query that feeds the dashboard task list specifically in the Telegram Mini App context — check for a hardcoded limit, wrong pagination cursor, or a filter that differs from other platforms.
2. Compare behavior against the web version for the same seeded multi-task account — confirm whether this is Telegram-specific or global.
3. If found, fix it. If root cause is unclear, stop and report findings with raw evidence rather than guessing.

## Stop Points

- No production deploy, no `main` merge.
- No entitlement/payment changes.

## Verification

- Raw before/after evidence: exact task count returned for a seeded account with 5+ tasks, before and after the fix, specifically on Telegram Mini App context (not just web).

## Report

`pm/outbox/REPORT-2026-07-27-86-telegram-dashboard-one-task-diagnostic.md`.
