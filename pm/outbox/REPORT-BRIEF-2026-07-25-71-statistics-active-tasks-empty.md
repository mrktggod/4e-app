# REPORT-BRIEF-2026-07-25-71-statistics-active-tasks-empty

Status: DONE
Branch: `feat/admin-tariff-api`
Commit: this commit

## Task

Fix or clarify the statistics active-task empty state when home still shows active work.

## Root Cause

- `index.html:3861-3862`: statistics splits active work into outgoing active tasks and incoming promises.
- `index.html:3888`: the active-task list rendered generic `Сейчас нет активных задач` whenever `activeOutgoing.length === 0`, even if `activeIncoming.length > 0` and home/focus still had active rows.
- This made the period look empty for users whose current active work was represented as incoming promises.

## Changed Files

- `index.html`: active-task empty state now clarifies the filter when incoming promises exist, e.g. `Активных задач без обещаний нет. 1 обещание показано выше.`
- `scripts/home-001-dashboard-smoke.mjs`: added statistics assertions for normal seeded active tasks and incoming-only active data.
- `docs/tasks/assets/HOME-001-dashboard-smoke-2026-07-20-dark.png` and `...-light.png`: refreshed by smoke.
- `FILE_MAP.md`, `FILE_MAP_UI.md`: updated line counts/ranges.
- PM/team logs and this report.

## Raw Evidence

```text
npm run smoke:home001
ok: true
metrics.statsActiveText: "Alex — Prepare beta dashboard acceptance pass..."
metrics.statsIncomingOnlyText: "Активных задач без обещаний нет. 1 обещание показано выше."
```

```text
Encoding ritual for index.html:
Before: 112 matches for Войти|Задачи|Сегодня
After: 112 matches for Войти|Задачи|Сегодня
```

## Scope Notes

- No production deploy.
- No merge into `main`.
- No backend data migration.
- No payment, entitlement, CAL, price, or secret work.

## Tail

NEEDS-REAL: staging/manual QA should confirm whether the product wants incoming promises duplicated into the active-task list later; this fix keeps the current split and removes the misleading empty state.
