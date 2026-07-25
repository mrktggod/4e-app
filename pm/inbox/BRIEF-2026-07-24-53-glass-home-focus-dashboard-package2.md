status: DONE

# BRIEF-2026-07-24-53-glass-home-focus-dashboard-package2

## Context

This starts package 2 for `DESIGN-GLASS-001` after the package 1 handoff.
The goal is to carry the approved soft-glass reference from task detail into
the main working surface without a broad restyle.

Dependencies:

- briefs 42, 50, 51 and 52 should be `DONE`, or this brief should become
  `BLOCKED-DEPENDENCY`;
- use `pm/design-references/glass-card-reference.png`;
- use `pm/design-references/glass-card-reference-spec.md`;
- respect the current home/dashboard patterns already covered by
  `npm run smoke:home001`.

## Task

Apply the shared glass primitives to the Telegram Mini App home/focus dashboard
only.

In scope:

- home canvas and top-level dashboard rhythm;
- focus-of-the-day panel;
- metric cards and compact priority rows where currently shown on home;
- active/selected state treatment using the shared tokens;
- dark theme and reduced-transparency equivalents.

Out of scope:

- task-detail internals already covered by package 1;
- notification cards already covered by package 1;
- auth, payments, subscription, entitlement, CAL and secrets;
- new dashboard behavior, new AI summaries or changed task ranking;
- VK surfaces.

Preserve existing data, routes, event handlers and semantic structure. Do not
hardcode screenshot sample content.

## Stop Points

- No production deploy or merge into `main`.
- No CAL, price, payment, entitlement, auth-security or secret work.
- No new inline styles or inline handlers.
- If home smoke fixtures no longer represent the current UI, write
  `NEED-CLAUDE` with a proposed fixture update instead of weakening checks.

## Verification

- Mandatory index.html encoding check before and after any edit.
- `node scripts/check-cp1251-mojibake.mjs`
- `npm run build:css`
- `npm run smoke:home001`
- `npm run check:portable-paths`
- `npm run check:ui-architecture`
- `git diff --check`
- 390x844 light/dark screenshots of home with realistic local tasks

## Report

Write
`pm/outbox/REPORT-BRIEF-2026-07-24-53-glass-home-focus-dashboard-package2.md`
with changed selectors/files, commit SHA, raw smoke output, screenshot paths,
visible differences from the reference and any deferred manual tails.
