status: DONE

# BRIEF-2026-07-25-77-branch-inventory-no-delete

## Context

Yuri needs a branch cleanup inventory by morning. This task is inventory only.

## Task

Produce a remote branch inventory without deleting any branch.

Run:

```powershell
git fetch --all --prune
git branch -r --format='%(refname:short) %(committerdate:short) %(authorname)'
git branch -r --merged origin/main
git branch -r --no-merged origin/main
```

For each remote branch, report:

- Branch name.
- Last commit date.
- Author.
- Whether it is merged into `origin/main`.
- Whether it is merged into `feat/admin-tariff-api`.
- Verdict: `can delete` or `keep`, with reason.

## Stop Points

- Do not delete any branch.
- No production deploy.
- No merge into `main`.
- No force push.
- No payment, entitlement, CAL, price, or secret work.

## Verification

- Include raw command evidence or enough summarized evidence to audit the verdicts.
- Cross-check both `origin/main` and `feat/admin-tariff-api` merge status.

## Report

Write `pm/outbox/REPORT-branch-inventory-2026-07-25.md`, then commit and push the report so Yuri can review the deletion list in the morning.
