status: DONE

# REPORT-BRIEF-2026-07-19-14-agents-stale-priorities

## Result

Updated only the `AGENTS.md` priorities block so future autonomous runs use `pm/inbox/`, `pm/backlog.md`, and `shared/ROADMAP.md` instead of stale closed tech-debt items and old redesign patch folders.

## Changed Files

- `AGENTS.md` - replaced stale open priorities with current source-of-truth pointers.
- `pm/inbox/BRIEF-2026-07-19-14-agents-stale-priorities.md` - marked DONE.
- `pm/outbox/REPORT-BRIEF-2026-07-19-14-agents-stale-priorities.md` - this report.

## Guardrail Check

The edit was limited to the `## Приоритеты (открытые задачи)` block. The `Autonomous Pipeline Guardrails` and `Autonomous Night Backlog - Selection Rules` sections were not edited.

## Verification

```text
node scripts/check-cp1251-mojibake.mjs
CP1251 mojibake check passed: 0 suspicious tokens

git diff --check
```

## Honest Tails

- No product code changed.
- No production deploy.
- No merge into `main`.
- No CAL, price, secret, payment, or entitlement work.
