# REPORT-BRIEF-2026-07-22-32-task-tag-popup-ios

## Outcome

status: BLOCKED-CONCURRENT-WORK

## Root Cause

The fix requires editing the task-detail tag editor in `index.html`, but `index.html` already had pre-existing uncommitted changes at task start. The brief's stop point requires reporting `BLOCKED-CONCURRENT-WORK` instead of overwriting unrelated task-detail source work.

Known source anchors from the audit:

- `index.html:458-459` uses `list="detail-direction-options"` plus native `<datalist>`.
- `index.html:464` uses `list="detail-tag-options"` plus native `<datalist>` inside the tag input editor.
- `styles/screens/tasks.less:1449` and nearby rules control the absolute tag editor layout that can overflow on iOS/TMA.

No runtime code, CSS, broad redesign, production deploy, `main` merge, CAL, payment, entitlement, auth-security, or secrets work was touched.

## Changed Files

- `pm/inbox/BRIEF-2026-07-22-32-task-tag-popup-ios.md`
- `pm/outbox/REPORT-BRIEF-2026-07-22-32-task-tag-popup-ios.md`

## Verification

- `git status --short --branch` showed pre-existing modified `index.html`.
- `rg -n "detail-tag|detail-direction|datalist|detail-top-tag-input" index.html styles/screens/tasks.less scripts` confirmed the task-detail tag editor source area.

## Commit

Pending this task commit.

## Tails

NEEDS-REAL: Re-run after the concurrent task-detail source changes are resolved; replace native datalist behavior with a controlled mobile popup/list, add cancel/outside/Escape close and focus restore, then capture focused 390x844 keyboard/popup smoke proof.
