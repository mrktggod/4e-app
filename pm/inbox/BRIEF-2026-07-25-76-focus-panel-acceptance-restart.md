status: DONE

# BRIEF-2026-07-25-76-focus-panel-acceptance-restart

## Context

`BRIEF-2026-07-22-30-focus-panel` was closed as `BLOCKED-CONCURRENT-WORK`, but commit `91a483a` (`feat(home): add focus panel daily summary`) implemented the feature from another session. Acceptance was never completed.

## Task

Restart acceptance for the focus panel.

Required output:

1. Preview URL for the home page with the focus panel.
2. Evidence at `390x844`: screenshot and/or measured layout proof.
3. Run the existing `home-001-dashboard-smoke.mjs`.
4. Verify the focus panel does not break the empty dashboard state.
5. Update brief `BRIEF-2026-07-22-30-focus-panel` with the acceptance SHA/status note.

## Stop Points

- No production deploy.
- No merge into `main`.
- No payment, entitlement, CAL, price, or secret work.
- If a preview cannot be created without production deployment, write the limitation in the report and use the safest available local/staging preview evidence.

## Verification

- `node scripts/check-cp1251-mojibake.mjs`
- `npm run smoke:home-001-dashboard` or the repository's exact existing command for `home-001-dashboard-smoke.mjs`.
- 390x844 screenshot or measured viewport evidence.
- Empty dashboard state check.

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-25-76-focus-panel-acceptance-restart.md` with preview URL and verdict: `ready for Yuri acceptance` or a defect list.
