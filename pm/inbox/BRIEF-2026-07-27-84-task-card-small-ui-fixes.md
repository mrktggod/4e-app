status: DUPLICATE

# BRIEF-2026-07-27-84-task-card-small-ui-fixes

Superseded by atomic briefs:

- `BRIEF-2026-07-27-87-task-time-picker-explicit-confirm.md`
- `BRIEF-2026-07-27-88-task-date-popover-viewport-fit.md`
- `BRIEF-2026-07-27-89-task-reminder-bell-active-card.md`
- `BRIEF-2026-07-27-91-task-toast-dismiss-on-scroll.md`
- `BRIEF-2026-07-27-92-iphone14-responsive-regression-pass.md`

Do not process this aggregate brief in automation.

## Context

Five small, isolated UI bugs from Misha's iPhone 14 web testing (`pm/inbox/MISHA_BUGS.md`). Each is independent — fix and commit each one separately (one commit per bug), do not bundle into a single commit.

## Task

1. **BUG-004**: bell/reminder button on the task card does nothing when tapped. Wire it to open reminder/notification settings for that task, or give clear feedback if there's a real reason it's disabled.
2. **BUG-005**: time picker auto-saves and closes while the user is still scrolling the minutes wheel, before the checkmark/confirm button is tapped. Fix so the value only commits on explicit confirm; scrolling minutes must not auto-close the picker.
3. **BUG-006**: date/time popover overflows the right edge of the viewport on iPhone-width screens. Keep it fully within the visible viewport (shift left / shrink / safe padding).
4. **BUG-007**: the "Сохранено" toast never dismisses if the user scrolls the task page while it's showing. Fix so it auto-dismisses after its normal timeout regardless of scroll, or dismisses on scroll/navigation.
5. **BUG-008**: task row on "Сегодня" overflows the right edge of the screen at iPhone 14 width. Keep it within viewport bounds (text wrap/truncate, no cut-off interactive elements).

## Stop Points

- No production deploy, no `main` merge.
- No payment/entitlement/CAL/secret work.

## Verification

- `node scripts/check-cp1251-mojibake.mjs`, `bash scripts/check-ui-architecture.sh` (or PowerShell equivalent), `git diff --check` after each fix.
- Targeted smoke/screenshot evidence per fix at iPhone-width viewport (390px and 320px).

## Report

`pm/outbox/REPORT-2026-07-27-84-task-card-small-ui-fixes.md` — one section per bug with commit SHA and before/after evidence.
