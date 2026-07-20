status: DONE

# REPORT-BACK-019-task-card-mobile-smoke

## Task

Close `BACK-019` improved task cards with a safe mobile/narrow-viewport smoke.

## Root Cause

- `scripts/task-ui-renderers.js:39` rendered `.task-card-title` with inline `display:block; overflow:visible`, which overrode the existing CSS two-line clamp in `styles.css`.

## Changed Files

- `scripts/task-ui-renderers.js` - removed the conflicting inline title style.
- `scripts/back-019-task-card-smoke.mjs` - added dependency-free Chrome/CDP smoke for 390x844 task-card QA.
- `package.json` - added `npm run smoke:back019`.
- `docs/tasks/BACK-019-task-card-mobile-smoke.md` - recorded smoke results.
- `pm/backlog.md` - moved `BACK-019` to `Done`.
- `FILE_MAP.md`, `DEVELOPMENT_LOG.md`, `shared/WORK_LOG.md`, `pm/team-sync.md` - recorded the new smoke and closeout.

## Proof

```text
npm run smoke:back019
ok: true
viewportWidth: 390
documentScrollWidth: 390
longTitleHeight: 38
longTitleLineClamp: 2
lastCardBottom: 428
navTop: 764
swipeRightTransform: translateX(96px)
```

Additional checks:

```text
node scripts/check-js-syntax.mjs
node scripts/check-cp1251-mojibake.mjs
bash scripts/check-portable-paths.sh
git diff --check
```

## Notes

- No production deploy.
- No merge to `main`.
- No CAL, price, secret, payment, or entitlement work.
- `NEEDS-REAL`: a physical phone visual pass is still useful as polish, but the backlog Done rule allowed a narrow viewport/device smoke and the automated 390x844 path passed.
