status: NEW

# BRIEF-2026-07-27-84-profile-premium-banner-remove

## Context

Yuri/Product TASK-002: remove the profile banner that says Premium / 14 days. Subscription information should stay available through the subscription area, but the misleading profile banner should be removed.

## Task

Find and remove the profile premium/trial banner from all relevant app surfaces/themes.

Do not change prices, plan rules, entitlement logic or payment logic.

## Verification

- Profile has no Premium 14 days banner.
- Subscription section/tab remains reachable.
- No empty gap remains in profile layout.
- Mobile 390px visual smoke or focused DOM check.
- `node scripts/check-cp1251-mojibake.mjs`
- relevant profile/home smoke.

## Report

Create `pm/outbox/REPORT-BRIEF-2026-07-27-84-profile-premium-banner-remove.md`.
