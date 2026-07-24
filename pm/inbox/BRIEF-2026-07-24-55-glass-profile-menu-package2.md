status: NEW

# BRIEF-2026-07-24-55-glass-profile-menu-package2

## Context

Package 2 finishes the primary Telegram surfaces by aligning profile/menu
blocks with the approved soft-glass direction. This is a visual IA pass, not a
profile, auth or subscription refactor.

Dependencies:

- briefs 53 and 54 should be `DONE`, or this brief should become
  `BLOCKED-DEPENDENCY`;
- use the shared glass foundation and package 1/2 completed surfaces as the
  local pattern source.

## Task

Apply the shared glass primitives to safe Telegram profile/menu surfaces.

In scope:

- profile summary surfaces;
- non-sensitive menu groups;
- local notification/settings rows that do not change server state;
- privacy link presentation without changing policy content;
- dark theme and reduced-transparency equivalents.

Out of scope:

- login/register/auth flow;
- password reset;
- payments, subscription, entitlement and price display;
- profile persistence or identity logic;
- legal text changes;
- VK profile parity, which belongs to package 3.

Keep existing routes and controls. Do not add new settings or remove existing
items.

## Stop Points

- No production deploy or merge into `main`.
- No CAL, price, payment, entitlement, auth-security or secret work.
- If a profile/menu row is tied to subscription/payment/auth, leave it visually
  unchanged and document the exclusion.
- No new inline styles or inline handlers.

## Verification

- Mandatory index.html encoding check before and after any edit.
- `node scripts/check-cp1251-mojibake.mjs`
- `npm run build:css`
- `npm run test:e2e:web`
- `npm run smoke:back050`
- `npm run check:portable-paths`
- `npm run check:ui-architecture`
- `git diff --check`
- 390x844 light/dark screenshots of profile/menu

## Report

Write
`pm/outbox/REPORT-BRIEF-2026-07-24-55-glass-profile-menu-package2.md`
with changed selectors/files, commit SHA, raw test output, screenshot paths,
explicit excluded sensitive rows and remaining manual tails.
