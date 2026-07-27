# REPORT - BRIEF-2026-07-27-83 misha product list dedupe

Status: DONE

## Scope

Bookkeeping only. I cross-checked every item in `pm/inbox/MISHA_BUGS.md` and `pm/inbox/PRODUCT_IDEAS_TASKS.md` against private `pm/bugs.md` and `pm/backlog.md`, then added missing private tracking rows without changing runtime code.

Docs-private was readable and updated on `feat/admin-tariff-api`.

Private docs commit: `711d94e` (`docs(pm): dedupe Misha product intake`).

## Disposition table

| Source item | Disposition |
| --- | --- |
| `MISHA_BUGS.md` BUG-001 focus counters mismatch | Duplicate of `BUG-2026-07-25-017` / `HOME-FOCUS-COUNTERS-001`; already Ready for QA / home001 green. |
| `MISHA_BUGS.md` BUG-002 statistics active empty state | Duplicate of `BUG-2026-07-25-018` / `STATS-ACTIVE-001`; already Ready for QA / home001 green. |
| `MISHA_BUGS.md` BUG-003 voice hold gesture unclear | New private bug assigned: `BUG-2026-07-27-001` / `VOICE-HOLD-001`. |
| `MISHA_BUGS.md` BUG-004 bell button on active task card | Duplicate/covered by `BUG-2026-07-25-006`, `BUG-2026-07-22-001`, and notification tail `BACK-064`. |
| `MISHA_BUGS.md` BUG-005 time picker auto-saves while scrolling minutes | New private bug assigned: `BUG-2026-07-27-002` / `TASK-TIME-PICKER-001`. |
| `MISHA_BUGS.md` BUG-006 date/time popover overflows right edge | New private bug assigned: `BUG-2026-07-27-003` / `TASK-DATE-POPOVER-001`. |
| `MISHA_BUGS.md` BUG-007 saved toast sticks while scrolling task detail | New private bug assigned: `BUG-2026-07-27-004` / `TASK-TOAST-001`. |
| `MISHA_BUGS.md` BUG-008 Today task row overflows right edge | Duplicate/covered by `BUG-2026-07-25-013` / `HOME-OVERFLOW-001`; already geometry-smoke green. |
| `PRODUCT_IDEAS_TASKS.md` IDEA-001 Telegram bot support intake | New private backlog item assigned: `SUPPORT-BOT-001`; status `NEED-YURI` because canonical bot token/chat and beta support flow are product/live Telegram decisions. |
| `PRODUCT_IDEAS_TASKS.md` TASK-002 remove Premium 14 days banner | New private bug assigned: `BUG-2026-07-27-005` / `PROFILE-PREMIUM-BANNER-001`; explicitly display-only, no prices/payment/entitlement changes. |
| `PRODUCT_IDEAS_TASKS.md` BUG-003 return to previous route | New private bug assigned: `BUG-2026-07-27-006` / `ROUTE-BACK-001`. |
| `PRODUCT_IDEAS_TASKS.md` BUG-004 unclear completion feedback in task card | New private bug assigned: `BUG-2026-07-27-007` / `TASK-COMPLETE-FEEDBACK-001`; distinct from VK-only `VK-TASK-COMPLETE-001`. |
| `PRODUCT_IDEAS_TASKS.md` TASK-005 button haptics/click feedback | New private backlog item assigned: `BUTTON-FEEDBACK-001`. |
| `PRODUCT_IDEAS_TASKS.md` TASK-006 notification system improvements | Duplicate/covered by `BACK-064` for real delivery/salience and `BACK-055` for action-feed UI. No new item added. |
| `PRODUCT_IDEAS_TASKS.md` BUG-007 Telegram Apps dashboard shows one task | Duplicate of `BUG-2026-07-23-001` / `HOME-001`; already Ready for QA / local smoke green. |
| `PRODUCT_IDEAS_TASKS.md` BUG-008 Telegram Apps bottom menu wrong | Duplicate/covered by `BUG-2026-07-25-002`, `NEW-006`, and `NEW-008`; remains manual staging/TMA tail. |
| `PRODUCT_IDEAS_TASKS.md` TASK-009 improve AI title/description generation | New private backlog item assigned: `TASK-AI-COPY-001`; related but not identical to `BACK-065`. |
| `PRODUCT_IDEAS_TASKS.md` TASK-010 manual task advice generation | New private backlog item assigned: `TASK-ADVICE-MANUAL-001`. |

## Verification

- Every item from both source files has a disposition.
- Runtime code unchanged.
- Docs-private commit pushed and remote branch verified at `711d94ef3283efade09c67c1629337841abc6511`.
