status: DONE

# BRIEF-2026-07-25-71-statistics-active-tasks-empty

## Context

Linked bug: `BUG-2026-07-25-018`.

Statistics says `Нет активных задач` while home shows active tasks for the same user.

## Task

Fix statistics active-task data source/filter mismatch or clarify the period filter so the empty state is not misleading. Keep the fix scoped to statistics/home task state synchronization.

## Stop Points

- No production deploy.
- No merge into `main`.
- No backend data migration unless reviewed.
- No payment, entitlement, CAL, price, or secret work.

## Verification

- `node scripts/check-cp1251-mojibake.mjs`
- Existing statistics/home smoke or a new focused fixture proving stats sees the same active tasks as home.
- Shared guards before commit.

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-25-71-statistics-active-tasks-empty.md`.
