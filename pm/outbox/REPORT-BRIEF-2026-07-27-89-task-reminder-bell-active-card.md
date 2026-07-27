status: DONE

# REPORT-BRIEF-2026-07-27-89-task-reminder-bell-active-card

## Summary

- Added a working reminder bell entrypoint to active task cards.
- Tapping the bell opens the task detail and expands the existing reminder settings instead of silently doing nothing.
- If the task/settings path cannot be opened, the user gets an explicit toast.

## Files

- `scripts/task-ui-renderers.js` - added card reminder button markup and `openTaskReminderFromCard()`.
- `index.html` - added the reminder bell to home priority cards without adding inline handler debt.
- `scripts/platform-adapter.js` - delegated home-card reminder clicks through a capture listener.
- `styles/screens/tasks.less`, `styles.css`, `styles.min.css` - styled the bell button and rebuilt CSS.
- `scripts/back-019-task-card-smoke.mjs` - extended active-card smoke to verify the bell opens reminder settings.
- `scripts/back-067-task-detail-reminder-smoke.mjs` - hardened Chrome discovery and kept reminder detail smoke green.
- `FILE_MAP.md`, `FILE_MAP_UI.md` - updated touched-file maps.

## Verification

- `npm run build:css` - PASS.
- `npm run smoke:back019` - PASS at 390px; reminder button measured 34x34.
- `npm run smoke:back067-reminder` - PASS at 390px.
- `node scripts/check-cp1251-mojibake.mjs` - PASS.

## Notes

- No payment, entitlement, pricing, CAL, prod, or main-merge changes.
