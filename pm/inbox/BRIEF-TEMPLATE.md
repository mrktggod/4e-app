status: NEW

# BRIEF-YYYY-MM-DD-slug

## Context

Short task context and links.

## Task

Describe the exact change requested.

## Stop Points

- No production deploy.
- No merge into `main`.
- No CAL tasks.
- No price changes.
- No payment or entitlement refactors.
- No secret rotation, secret removal, or secret disclosure.

## Verification

- `node scripts/check-cp1251-mojibake.mjs`
- Add any task-specific checks here.

## Report

Write `pm/outbox/REPORT-BRIEF-YYYY-MM-DD-slug.md` with root cause, changed files, commit SHA, raw proof, and honest tails.
