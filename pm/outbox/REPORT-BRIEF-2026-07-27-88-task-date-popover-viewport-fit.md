status: DONE

# REPORT-BRIEF-2026-07-27-88-task-date-popover-viewport-fit

## Summary

- Constrained the task detail date/time popover to fit inside the mobile viewport.
- The popover now right-aligns inside the detail info stack with a viewport-based max width.
- Date/time input and confirm/cancel buttons remain tappable on a 390px viewport.

## Files

- `styles/screens/tasks.less` - added viewport-safe width/max-width rules for `#task-detail .detail-date-popover`.
- `styles.css`, `styles.min.css` - rebuilt from LESS via `npm run build:css`.
- `scripts/back-068-task-detail-tag-popup-smoke.mjs` - added date popover geometry assertions for scroll width, right edge, input size, and button tappability.
- `FILE_MAP.md` - updated CSS/smoke map entries.

## Verification

- `npm run build:css` - PASS.
- `npm run smoke:back068-tag-popup` - PASS at 390px; date popover rect was left 121, right 361, width 240.
- `node scripts/check-cp1251-mojibake.mjs` - PASS.

## Notes

- No payment, entitlement, pricing, CAL, prod, or main-merge changes.
