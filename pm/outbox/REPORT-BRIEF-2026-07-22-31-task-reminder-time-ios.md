# REPORT-BRIEF-2026-07-22-31-task-reminder-time-ios

## Outcome

status: BLOCKED-CONCURRENT-WORK

## Root Cause

The brief requires a narrow UI fix in `index.html` around the task-detail reminder control. At the start of this task, `index.html` already had pre-existing uncommitted changes from another session. The brief's stop point says not to overwrite unrelated uncommitted `index.html` changes and to report `BLOCKED-CONCURRENT-WORK`.

Known source risk from the existing audit remains:

- `index.html:462` has nested `button > select` in the reminder trigger area.
- `styles/screens/tasks.less` has task-detail action sizing rules that can leave the trigger below the 44x44 mobile target.

No runtime code, notification backend, delivery logic, payment, entitlement, auth-security, secrets, production deploy, or `main` merge was touched.

## Changed Files

- `pm/inbox/BRIEF-2026-07-22-31-task-reminder-time-ios.md`
- `pm/outbox/REPORT-BRIEF-2026-07-22-31-task-reminder-time-ios.md`

## Verification

- `git status --short --branch` showed pre-existing modified `index.html`.
- `rg -n "detail-reminder|toggleDetailReminderPopover|setDetailReminderFromBell" index.html styles/screens/tasks.less scripts` confirmed the reminder-control source area.
- Encoding/runtime checks will be required after the owner commits or clears the concurrent `index.html` work.

## Commit

Pending this task commit.

## Tails

NEEDS-REAL: Re-run after the concurrent `index.html` diff is resolved; then remove nested interactive markup, make the trigger at least 44x44 CSS px, preserve the existing save/update path, and add 390x844 smoke proof.
