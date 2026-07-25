# REPORT - morning runner inbox status reconcile - 2026-07-25

## Outcome

DONE for automation prompt update.

Updated only the last morning automation:

- `4e-morning-inbox-and-safe-backlog-runner`

## Change

Added MAN-007 as the final prompt block.

The runner must always perform a final status reconciliation, even when no tasks were completed during the window:

- scan `pm/inbox/BRIEF-*.md`;
- ignore `BRIEF-TEMPLATE.md` and `README.md`;
- for each remaining `status: NEW` brief, check whether a matching `pm/outbox/REPORT-*` exists;
- check recent and all-branch git history for a commit that actually implemented the brief;
- if the work is already done, change the brief to the real status: `DONE`, `NEED-CLAUDE`, `NEED-YURI`, or `HOLD-MANUAL`;
- write the confirming SHA into the brief body;
- commit the reconciliation as `docs(pm): reconcile inbox statuses` and push;
- include a closeout table with NEW count before, NEW count after, changed briefs, and confirming SHA.

## Verification

Read back the local Codex automation config after update.

Raw verification:

- prompt still starts with `ДИСК:`
- final block index: `1546`
- prompt length after update: `2477`

## Reason

This records the MAN-007 decision: the local Cowork copy can lag behind git reality, and stale `status: NEW` briefs make the night board unreliable for planning.
