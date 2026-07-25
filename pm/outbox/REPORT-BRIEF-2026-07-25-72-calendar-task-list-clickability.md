# REPORT-BRIEF-2026-07-25-72-calendar-task-list-clickability

Status: DONE
Branch: `feat/admin-tariff-api`
Commit: this commit

## Task

Make calendar task rows/cards clickable and route to the existing task detail view.

## Root Cause

- `index.html:7094`: bottom `Все дедлайны` rows already had `data-cal-task-id`, but lacked explicit role/tabindex/visual affordance.
- `index.html:7121`: default upper calendar event rows looked the same but did not include `data-cal-task-id`, so the existing delegated calendar handler could not open task detail.
- `index.html:7140`: selected-day rows used inline `onclick` instead of the existing delegated calendar route, so calendar row behavior was inconsistent.
- `scripts/platform-adapter.js:575`: delegated click handler already knew how to open `[data-cal-task-id]`, but keyboard activation was missing.

## Changed Files

- `index.html`: all calendar deadline rows now carry `data-cal-task-id`, `role="button"`, and `tabindex="0"`.
- `scripts/platform-adapter.js`: calendar rows now support Enter/Space via the same delegated click route.
- `styles/screens/tasks.less`, `styles.css`, `styles.min.css`: added cursor, hover and focus-visible states for clickable calendar rows.
- `scripts/home-001-dashboard-smoke.mjs`: added proof that a calendar task row opens `task-detail`.
- `docs/tasks/assets/HOME-001-dashboard-smoke-2026-07-20-light.png`: refreshed by smoke.
- `FILE_MAP.md`: updated script counts and smoke description.
- PM/team logs and this report.

## Raw Evidence

```text
npm run smoke:home001
ok: true
metrics.calendarTaskRows: 6
calendar task row click reached task-detail
```

```text
Encoding ritual for index.html:
Before: 112 matches for Войти|Задачи|Сегодня
After: 112 matches for Войти|Задачи|Сегодня
```

## Scope Notes

- No production deploy.
- No merge into `main`.
- No CAL roadmap/product expansion.
- No new calendar model.
- No payment, entitlement, price, or secret work.

## Tail

NEEDS-REAL: staging/mobile QA should confirm the row hit area feels natural in the live Telegram container.
