status: DONE

# REPORT-BRIEF-2026-07-27-87-task-time-picker-explicit-confirm

## Summary

- Changed task detail date/time editing to use a pending value until explicit confirmation.
- Scrolling/changing the datetime input keeps the picker open and does not update `currentDetailTime`.
- Cancel and outside close restore the saved value; confirm applies the selected time and saves once.

## Files

- `index.html` - added date/time confirm/cancel controls, pending deadline state, confirm/cancel helpers, and guarded `focusout` autosave for the datetime input.
- `scripts/platform-adapter.js` - date input changes now update pending state; confirm/cancel actions are delegated from the popover.
- `scripts/back-068-task-detail-tag-popup-smoke.mjs` - extended 390px browser smoke to cover datetime change/cancel/outside/confirm behavior.
- `FILE_MAP.md`, `FILE_MAP_UI.md` - updated touched-file maps.

## Verification

- `npm run smoke:back068-tag-popup` - PASS at 390px.
- `node scripts/check-cp1251-mojibake.mjs` - PASS.

## Notes

- No destructive task semantics, payment, entitlement, pricing, CAL, prod, or main-merge changes.
