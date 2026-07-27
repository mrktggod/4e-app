status: DONE

# REPORT-BRIEF-2026-07-27-85-return-to-previous-route

## Summary

- Added narrow task-detail return routing for task/card openings without a broad router rewrite.
- Task detail now remembers the source screen before `openTaskById` and the detail back action returns to that screen.
- Direct `openTask` paths keep the safe dashboard fallback.

## Files

- `scripts/task-ui-renderers.js` - shared return-screen state and `returnFromTaskDetail()` fallback helper.
- `scripts/platform-adapter.js` - detail back button dispatch uses `returnFromTaskDetail()`.
- `index.html` - filtered statistics task rows open detail with `statistics` as the explicit return target.
- `scripts/home-001-dashboard-smoke.mjs` - smoke covers home -> detail -> home, statistics -> detail -> statistics, and calendar -> detail -> calendar at mobile width.
- `FILE_MAP.md`, `FILE_MAP_UI.md` - updated maps for the touched frontend/smoke files.

## Verification

- `npm run smoke:home001` - PASS, including 390/360/320 viewport geometry.
- `node scripts/check-cp1251-mojibake.mjs` - PASS.

## Notes

- No prod, main merge, CAL, price, secret, payment, or entitlement changes.
