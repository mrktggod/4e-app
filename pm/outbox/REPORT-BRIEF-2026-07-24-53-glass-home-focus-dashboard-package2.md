# REPORT — BRIEF-2026-07-24-53 glass home/focus dashboard package 2

Status: DONE

## Root Cause

`styles/screens/home.less:1160` and late dashboard overrides in `styles/screens/light-redesign.less:2971` kept the home/focus dashboard on older bespoke glass gradients, dark image-handoff nav rules and an empty-state task-list height. After package 1 established shared `--glass-*` tokens, home still did not consistently consume them.

## Changed Files

- `styles/screens/home.less` — package-2 home/focus dashboard glass token mapping, reduced-transparency fallback, focus-visible and active surface states.
- `styles/screens/light-redesign.less` — final cascade overrides for late light/dark handoff rules, visible dark nav controls, task-list height and show-all placement.
- `styles.css`, `styles.min.css` — rebuilt from LESS.
- `scripts/home-001-dashboard-smoke.mjs` — Windows Chrome/Edge candidates and bounded Chrome cleanup wait; assertions unchanged.
- `docs/tasks/assets/HOME-001-dashboard-smoke-2026-07-20-dark.png`
- `docs/tasks/assets/HOME-001-dashboard-smoke-2026-07-20-light.png`

## Raw Proof

```text
Before index encoding check: 111 matches for Войти|Задачи|Сегодня
After index encoding check: 111 matches for Войти|Задачи|Сегодня

node scripts/check-cp1251-mojibake.mjs
CP1251 mojibake check passed: 0 suspicious tokens

npm run build:css
lessc styles/main.less styles.css && cleancss styles.css -o styles.min.css

npm run smoke:home001
ok: true
failures: []
viewportWidth: 390
documentScrollWidth: 390
homeRows: 3
showAllDisplay: flex
metricCards: 4
bottomNavButtons: 3
focusCount: 2
focusText: требуют внимания
home-task-list: 18,416,372,664
dark.rowCount: 3
dark.scrollWidth: 390
light.rows: 3
light.showAllDisplay: flex
light.scrollWidth: 390

Git Bash scripts/check-portable-paths.sh
Portable path check passed.

Git Bash scripts/check-ui-architecture.sh
inline style attributes = 299 / 465
inline event handlers = 401 / 402
style tags = 0 / 0
inline script tags = 3 / 3

git diff --check
PASS
```

## Screenshots

- `docs/tasks/assets/HOME-001-dashboard-smoke-2026-07-20-dark.png`
- `docs/tasks/assets/HOME-001-dashboard-smoke-2026-07-20-light.png`

## Visual Differences From Reference

- Applied milky glass fill, quiet white/green edges, warmer light canvas, active green emphasis and reduced-transparency fallbacks to home/focus surfaces.
- Preserved existing data, routes, event handlers and Russian copy.
- Deferred broader typography/layout redesign; this slice is home/focus only and does not claim global design-system completion.

## Commit

Pending in this task commit on `feat/admin-tariff-api`.

## Deferred Manual Tails

- Real phone/TMA visual check after deployment remains manual.
- Package 2 follow-up briefs `54-56` should be re-evaluated after this DONE status.
