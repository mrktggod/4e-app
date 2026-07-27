status: DONE

# BRIEF-2026-07-24-54-glass-task-list-card-family-package2

## Context

Package 2 continues with the repeated task-card family. The accepted reference
is a task-detail card, but the same visual language should make the list view
feel consistent without changing task behavior.

Dependencies:

- package 1 and brief 53 should be `DONE`, or this brief should become
  `BLOCKED-DEPENDENCY`;
- use the shared glass foundation rather than adding one-off styles;
- use `npm run smoke:back019` for the existing task-card regression surface.

## Task

Migrate only the Telegram task-list card family to the shared glass language.

In scope:

- repeated task cards in task lists;
- compact title/description/meta/chip hierarchy inside cards;
- overdue/priority/completed visual states;
- card action affordances already present in the UI;
- long Russian title handling and 2-line clamp behavior.

Out of scope:

- task creation logic, normalization or reminders;
- task-detail hero and metadata already handled by package 1;
- dashboard metric cards already handled by brief 53;
- chat, auth, payments, entitlement, subscription, CAL, secrets and VK;
- changing task sort, filters or persistence.

Preserve existing tap/swipe/done behavior and route targets.

## Stop Points

- No production deploy or merge into `main`.
- No CAL, price, payment, entitlement, auth-security or secret work.
- No inline styles, inline handlers or behavior rewrites.
- If a focused task-card smoke regresses, stop and report the exact visual or
  behavioral failure.

## Verification

- Mandatory index.html encoding check before and after any edit.
- `node scripts/check-cp1251-mojibake.mjs`
- `npm run build:css`
- `npm run smoke:back019`
- `npm run smoke:home001`
- `npm run check:portable-paths`
- `npm run check:ui-architecture`
- `git diff --check`
- 390x844 light/dark screenshots of a list with overdue, normal and completed
  task states

## Report

Write
`pm/outbox/REPORT-BRIEF-2026-07-24-54-glass-task-list-card-family-package2.md`
with changed selectors/files, commit SHA, raw smoke output, screenshot paths,
card-state coverage and any remaining visual misses.
