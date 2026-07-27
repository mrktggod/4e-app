# REPORT-BRIEF-2026-07-24-54-glass-task-list-card-family-package2

Outcome: `DONE`

## What Changed

The repeated Telegram task-card family now uses the shared glass primitives from package 1/2 instead of the older flat card fill.

Changed files:

- `styles/screens/home.less`
  - `.task-card-shell` now uses `--glass-surface`, `--glass-stroke`, `--glass-shadow`, `--glass-inset-shadow`, `--glass-blur`, `--glass-saturate` and `--glass-radius-card`;
  - overdue/P0 cards keep a clear danger accent without changing task data or actions;
  - hover/focus treatment uses the shared active glow;
  - reduced-transparency fallback keeps the surface readable when backdrop blur is unavailable.
- `scripts/back-019-task-card-smoke.mjs`
  - saves 390x844 light/dark screenshots for the task-card fixture;
  - asserts glass radius/shadow in computed styles;
  - keeps existing long-title, viewport, bottom-nav, swipe-left, swipe-right and tap routing checks.
- `styles.css`, `styles.min.css`
  - rebuilt from LESS.

No task creation, sorting, persistence, reminder, payment, entitlement, auth, CAL, VK, production deploy or `main` work was changed.

## Proof

Commands run before commit:

```text
node scripts/check-cp1251-mojibake.mjs
CP1251 mojibake check passed: 0 suspicious tokens

npm run build:css
exit 0

npm run smoke:back019
ok: true
viewportWidth: 390
documentScrollWidth: 390
firstCardBorderRadius: 30px
firstCardBackdropFilter: blur(26px) saturate(1.28)
longTitleLineClamp: 2
lastCardBottom: 463
navTop: 764
screenshots:
- docs/tasks/assets/BACK-019-task-card-glass-2026-07-27-light.png
- docs/tasks/assets/BACK-019-task-card-glass-2026-07-27-dark.png

npm run smoke:home001
ok: true
viewportWidth: 390
documentScrollWidth: 390
homeRows: 3
dark.scrollWidth: 390
360px and 320px viewport bounds: ok

PowerShell equivalent of scripts/check-portable-paths.sh
Portable path check passed.

PowerShell equivalent of scripts/check-ui-architecture.sh
inline style attributes = 292 / 465
inline event handlers = 399 / 402
style tags = 0 / 0
inline script tags = 3 / 3

git diff --check
exit 0
```

Note: `npm run check:portable-paths` and `npm run check:ui-architecture`
could not run through `scripts/run-bash-script.mjs` because `bash` is not
available in PATH in this session. I did not call bash through an absolute
Windows drive path; the same guard logic was run directly inside PowerShell.

Expected smoke coverage:

- 4 task cards render inside a 390px viewport with no horizontal overflow.
- Long Russian-style task titles stay clamped to 2 lines.
- Last card stays above the bottom navigation reserve.
- Left swipe still opens move/cancel actions.
- Right swipe still opens done action.
- Tap still opens the expected task.
- The first task-card shell exposes glass radius and shadow in computed styles.

## Screenshots

- `docs/tasks/assets/BACK-019-task-card-glass-2026-07-27-light.png`
- `docs/tasks/assets/BACK-019-task-card-glass-2026-07-27-dark.png`

## Remaining Manual Tail

Real Telegram Mini App visual QA on a phone remains manual-only. This report covers the repeatable local/browser proof.

## Commit

Included in this task commit on `feat/admin-tariff-api`. The final SHA is
recorded in the runner report after commit creation.
