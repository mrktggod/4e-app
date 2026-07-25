status: NEED-CLAUDE

# BRIEF-2026-07-25-68-ai-delete-intent-safety

## Context

Linked bug: `BUG-2026-07-25-015`.

The AI chat interpreted a delete request as mass-completing active tasks.

## Task

Prevent `удали` / delete intent from being executed as `done` / complete. Add a safe confirmation path for destructive bulk delete if supported; otherwise refuse clearly without performing another destructive action.

## Stop Points

- No production deploy.
- No merge into `main`.
- No broad task backend refactor.
- No payment, entitlement, CAL, price, or secret work.
- If the root cause is in prompt/tool contract and the safe fix is not narrow, write `NEED-CLAUDE` report before runtime changes.

## Verification

- `node scripts/check-cp1251-mojibake.mjs`
- Focused AI chat/task-intent smoke proving `удали все задачи` does not mark tasks done.
- Existing task smoke as relevant.
- Shared guards before commit.

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-25-68-ai-delete-intent-safety.md`.
