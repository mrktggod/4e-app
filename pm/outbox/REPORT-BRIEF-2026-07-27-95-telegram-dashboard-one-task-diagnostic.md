status: NEED-CLAUDE

# REPORT-BRIEF-2026-07-27-95-telegram-dashboard-one-task-diagnostic

## Result
- Added `npm run smoke:telegram-dashboard-one-task` diagnostic.
- The diagnostic compares web and mocked Telegram surfaces with four mocked active tasks.
- It records task API result count, local parsed task count, active count, rendered dashboard rows, row titles, show-all visibility, and focus count.

## Diagnostic Output
- Web mock: API count `4`, local count `4`, active count `4`, dashboard rows `3`, show-all `flex`.
- Telegram mock: API count `4`, local count `4`, active count `4`, dashboard rows `3`, show-all `flex`.
- The dashboard intentionally renders top-3 rows through `getHomeDashboardTasks(...).slice(0,3)` and shows the all-tasks entry when active tasks exceed visible rows.

## Conclusion
- I did not find or reproduce a small frontend one-task limit/filter bug in deterministic web or Telegram mocked surfaces.
- The next useful step is live Telegram account evidence: capture the real `/tasks` response count, parsed `allTasksCache.length`, and `#home-task-list .task-card-shell` count in the affected account.

## Files
- `scripts/telegram-dashboard-one-task-diagnostic.mjs`
- `package.json`
- `FILE_MAP.md`
- `DEVELOPMENT_LOG.md`

## Verification
- `npm run smoke:telegram-dashboard-one-task`
- `node scripts/check-cp1251-mojibake.mjs`
- `npm run check:js-syntax`
- `git diff --check`
- Portable path check equivalent: passed
- UI architecture guard equivalent for `index.html`: passed

## Stop Point
- `NEED-CLAUDE`: needs live Telegram account/API evidence or backend/cache investigation if the real account still renders one task.
