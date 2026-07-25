status: DONE

# REPORT-BRIEF-2026-07-25-66-dashboard-right-edge-overflow

## Summary

Current `feat/admin-tariff-api` home runtime does not reproduce the reported right-edge clipping. I hardened `smoke:home001` so the guard now checks actual viewport edges at 390px, 360px and 320px, not only document `scrollWidth`.

## Root Cause

- `scripts/home-001-dashboard-smoke.mjs:340` previously asserted only `documentElement.scrollWidth <= viewport`.
- The old per-element `overflowChecks` only verified elements existed and had non-zero size, so a clipped element inside `overflow:hidden` could pass.
- Current CSS/runtime geometry is green; the actionable gap was missing edge evidence for the exact clipping class.

## Changed Files

- `scripts/home-001-dashboard-smoke.mjs`
- `docs/tasks/assets/HOME-001-dashboard-smoke-2026-07-20-dark.png`
- `docs/tasks/assets/HOME-001-dashboard-smoke-2026-07-20-light.png`
- `FILE_MAP.md`
- `pm/inbox/BRIEF-2026-07-25-66-dashboard-right-edge-overflow.md`
- `pm/bugs.md`
- `pm/backlog.md`
- `pm/team-sync.md`
- `shared/WORK_LOG.md`
- `DEVELOPMENT_LOG.md`

## What Changed

- Added viewport edge assertions for home header, hero, metrics, task list, show-all button, bottom nav and first visible task row.
- Added narrow viewport geometry passes at 360px and 320px.
- Refreshed dark/light `home001` evidence screenshots.

## Raw Evidence

```text
> npm run smoke:home001
ok: true

390px:
documentScrollWidth=390 viewportWidth=390
dash-bottom-nav right=376/390
home-task-list right=372/390

360px:
scrollWidth=360 viewportWidth=360
dash-bottom-nav right=346/360
home-task-list right=342/360
first child right=342/360

320px:
scrollWidth=320 viewportWidth=320
dash-bottom-nav right=306/320
home-task-list right=302/320
first child right=302/320
```

## Guards

- `npm run smoke:home001` passed.
- `node scripts/check-cp1251-mojibake.mjs` passed.
- `npm run check:js-syntax` and shared guard equivalents are run before commit.

## Commit

- App branch: `feat/admin-tariff-api`
- App commit: this report's commit (`test(home): guard dashboard viewport edges`)

## Tails

- NEEDS-REAL: staging/mobile visual check after deploy if the original user's phone had a nonstandard in-app viewport or browser zoom.
