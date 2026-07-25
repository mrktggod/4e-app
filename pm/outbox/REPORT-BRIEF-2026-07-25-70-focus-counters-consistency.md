# REPORT-BRIEF-2026-07-25-70-focus-counters-consistency

Status: DONE
Branch: `feat/admin-tariff-api`
Commit: this commit

## Task

Make home focus card and focus popup counters derive from one consistent task summary.

## Root Cause

- `index.html:3258`: home focus card used its own `attentionCount` logic based on hot/outgoing/incoming task totals.
- `index.html:4051`: focus popup subtitle used `plannerSectionsCache.hot` / `plannerSectionsCache.people` and the phrase `4 выделил главное`, which looked like a fourth task count while the popup list showed only 3 rows.
- `index.html:4031`: focus popup task metric could display a day-task count rather than the visible focus row count.

## Changed Files

- `index.html`: added `getFocusTaskSummary()`, `getFocusTaskWord()`, and `getFocusPanelSubtitle()`; home focus count, popup subtitle and popup task metric now use the visible focus-task summary.
- `scripts/home-001-dashboard-smoke.mjs`: added assertions that focus card count, popup row count, popup task metric and popup subtitle use the same visible focus count.
- `docs/tasks/assets/HOME-001-dashboard-smoke-2026-07-20-dark.png` and `...-light.png`: refreshed by the smoke run.
- `FILE_MAP.md`, `FILE_MAP_UI.md`: updated line counts/ranges.
- PM/team logs and this report.

## Raw Evidence

```text
npm run smoke:home001
ok: true
metrics.focusCount: "3"
metrics.focusPanelRows: 3
metrics.focusPanelTasksMetric: 3
metrics.focusPanelSubtitle: "2 горят, 3 задачи в фокусе"
```

```text
Encoding ritual for index.html:
Before: 112 matches for Войти|Задачи|Сегодня
After: 112 matches for Войти|Задачи|Сегодня
```

## Scope Notes

- No production deploy.
- No merge into `main`.
- No broad dashboard redesign.
- No payment, entitlement, CAL, price, or secret work.

## Tail

NEEDS-REAL: manual/staging visual QA can confirm the Russian copy reads clearly in the live mobile container.
