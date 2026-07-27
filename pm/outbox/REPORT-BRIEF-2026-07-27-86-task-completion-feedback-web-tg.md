status: DONE

# REPORT-BRIEF-2026-07-27-86-task-completion-feedback-web-tg

## Summary

- Improved web/Telegram task completion feedback for task-card swipe controls and shared complete controls.
- Completion buttons now show an inline loading label, keep visible success text, restore state on failure, and ignore duplicate fast taps.
- Existing `done-task` semantics remain unchanged.

## Files

- `index.html` - `quickDoneTask()` now owns button loading/success/failure state and duplicate protection.
- `scripts/task-ui-renderers.js` - `markDoneKV()` now uses the same feedback pattern for shared/detail completion controls.
- `scripts/back-019-task-card-smoke.mjs` - extended 390px Chrome smoke to execute the real `quickDoneTask()` from `index.html`, verify duplicate-tap protection, success text, failure restoration, and `markDoneKV()` behavior.
- `FILE_MAP.md`, `FILE_MAP_UI.md` - updated touched-file maps.

## Verification

- `npm run smoke:back019` - PASS at 390px.
- `node scripts/check-cp1251-mojibake.mjs` - PASS.

## Notes

- No payment, entitlement, pricing, CAL, prod, or main-merge changes.
