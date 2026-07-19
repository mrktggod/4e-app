# REPORT-BRIEF-2026-07-18-00-agents-autonomy-rules

Status: DONE

## Summary

Added `Autonomous Night Backlog - Selection Rules` to `AGENTS.md` for the app repo.

## Root Cause / Entry Point

This was a docs/process brief, not a defect fix. The autonomous runner needed explicit task-selection rules and the three allowed outcomes before taking backlog work.

- `AGENTS.md:270` - new autonomous night backlog section.

## Changed Files

- `AGENTS.md`
- `pm/inbox/BRIEF-2026-07-18-00-agents-autonomy-rules.md`
- `pm/outbox/REPORT-BRIEF-2026-07-18-00-agents-autonomy-rules.md`

## Raw Evidence

Checks before commit:

```text
node scripts/check-cp1251-mojibake.mjs
CP1251 mojibake check passed: 0 suspicious tokens

C:\Program Files\Git\bin\bash.exe scripts/check-portable-paths.sh
Portable path check passed.
```

## Notes

No production deploy, merge into `main`, CAL work, price change, payment/entitlement refactor, or secret action was performed.

App commit SHA: NEEDS-REAL until commit is created.
