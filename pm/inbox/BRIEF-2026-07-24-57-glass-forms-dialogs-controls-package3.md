status: NEW

# BRIEF-2026-07-24-57-glass-forms-dialogs-controls-package3

## Context

Package 3 moves from static surfaces to interactive UI layers. This brief
covers shared buttons, fields and safe dialogs/popups where the new test tools
can prove keyboard, focus and 44px target behavior.

Dependencies:

- package 1 and package 2 should be `DONE`, or this brief should become
  `BLOCKED-DEPENDENCY`;
- use shared glass primitives only;
- rely on existing accessibility, reminder and tag popup smoke tests.

## Task

Apply the glass system to non-sensitive controls and safe interactive layers.

In scope:

- generic button and icon-button visual states where used outside sensitive
  auth/payment/subscription areas;
- textarea/input/select-like surfaces used in safe task/chat UI;
- quick-add and safe task-related dialogs;
- reminder/tag popup visual treatment if their accepted behavior is already in
  the implementation base;
- hover/focus/active/disabled/loading states where the component already has
  those states.

Out of scope:

- login/register/password reset controls;
- payment, subscription, entitlement and price surfaces;
- new form validation rules;
- new dialog behavior or persistence;
- replacing accepted reminder/tag behavior.

## Stop Points

- No production deploy or merge into `main`.
- No CAL, price, payment, entitlement, auth-security or secret work.
- If a control belongs to auth/payment/subscription, do not restyle it in this
  brief; document the exclusion.
- If reminder/tag dependency is absent, block only those popup parts and finish
  other safe controls when possible.

## Verification

- Mandatory index.html encoding check before and after any edit.
- `node scripts/check-cp1251-mojibake.mjs`
- `npm run build:css`
- `npm run smoke:back050`
- `npm run smoke:back067-reminder`
- `npm run smoke:back068-tag-popup`
- `npm run check:portable-paths`
- `npm run check:ui-architecture`
- `git diff --check`
- 390x844 light/dark screenshots of representative controls and popups

## Report

Write
`pm/outbox/REPORT-BRIEF-2026-07-24-57-glass-forms-dialogs-controls-package3.md`
with changed selectors/files, commit SHA, raw smoke output, screenshot paths,
excluded sensitive controls and remaining manual tails.
