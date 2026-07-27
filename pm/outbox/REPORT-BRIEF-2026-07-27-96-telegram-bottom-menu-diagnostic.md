status: DONE

# REPORT-BRIEF-2026-07-27-96-telegram-bottom-menu-diagnostic

## Result
- Diagnosed the old bottom menu path: the legacy `#global-nav` was still enabled by shell routing on redesigned inner pages.
- Applied a narrow frontend fix: `#global-nav` is now hidden on `profile`, `task-detail`, `subscription`, and `statistics`.
- Preserved the dashboard dark-theme `dash-bottom-nav` on `home`.
- Added `npm run smoke:telegram-bottom-menu`.

## Verification Output
- Dark dashboard: `dash-bottom-nav` visible, 3 buttons, legacy `#global-nav` hidden.
- Inner pages checked: `profile`, `task-detail`, `subscription`, `statistics`.
- On all checked inner pages: legacy `#global-nav` has `hidden` and is not visible.
- Source nav counts: one legacy `#global-nav`, one dashboard `.dash-bottom-nav`.

## Screenshot
- `docs/tasks/assets/BRIEF-2026-07-27-96-telegram-bottom-menu-dark.png`

## Files
- `scripts/task-ui-renderers.js`
- `index.html`
- `scripts/telegram-bottom-menu-diagnostic-smoke.mjs`
- `docs/tasks/assets/BRIEF-2026-07-27-96-telegram-bottom-menu-dark.png`
- `package.json`
- `FILE_MAP.md`
- `DEVELOPMENT_LOG.md`

## Verification
- `npm run smoke:telegram-bottom-menu`
- `node scripts/check-cp1251-mojibake.mjs`
- `npm run check:js-syntax`
- `git diff --check`
- Portable path check equivalent: passed
- UI architecture guard equivalent for `index.html`: passed

## Notes
- No production rollout or cache purge was performed.
- If the old menu still appears after this commit is deployed, the next step is to verify Telegram WebView is serving the latest `index.html` and `scripts/task-ui-renderers.js`, not a stale shell.
