status: NEW

# BRIEF-2026-07-24-50-glass-notification-card-slice

## Context

`DESIGN-GLASS-001` now has an approved visual target:

- `pm/design-references/glass-card-reference.png`;
- `pm/design-references/glass-card-reference-spec.md`.

The foundation brief `BRIEF-2026-07-23-42-glass-design-system-foundation.md`
must be `DONE` before this brief starts. Notification cards are the first
runtime proof because they are isolated and already covered by
`npm run smoke:back055`.

## Task

Migrate only the notification-card family to the shared glass primitives.

1. Keep notification data, filtering, expand/snooze/done/write actions and
   semantics unchanged.
2. Apply the shared surface, border, radius, shadow and state tokens to:
   - notification card;
   - empty notification panel;
   - compact type/status chip;
   - existing notification action controls where safe.
3. Preserve unread, warning, overdue and action hierarchy.
4. Do not migrate task detail, auth, payments, subscription, profile or chat.
5. Capture the same notification state at 390x844 in light and dark themes.

## Stop Points

- If foundation tokens are not committed and available, set
  `BLOCKED-DEPENDENCY`.
- No production deploy or merge into `main`.
- No CAL, price, payment, entitlement, auth-security or secret work.
- No new inline styles, inline handlers or behavior changes.
- Do not hide contrast problems with stronger glow or blur.

## Verification

- `node scripts/check-cp1251-mojibake.mjs`
- `npm run build:css`
- `npm run smoke:back055`
- `npm run check:portable-paths`
- `npm run check:ui-architecture`
- `git diff --check`
- 390x844 light/dark screenshots with the same fixture state

## Report

Write
`pm/outbox/REPORT-BRIEF-2026-07-24-50-glass-notification-card-slice.md`
with changed selectors/files, commit SHA, raw smoke output, screenshot paths,
visible differences from the reference and remaining manual tails.
