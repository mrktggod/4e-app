status: NEW

# BRIEF-2026-07-27-94-button-feedback-haptics-pilot

## Context

Yuri/Product TASK-005: button clicks should give clearer tactile/visual feedback. This is broad, so start with a small pilot instead of changing every button.

## Task

Create a narrow haptics/click-feedback pilot for the main task actions.

Expected:

- use available platform haptics where safe;
- add visible pressed/loading feedback;
- do not fire feedback on disabled buttons;
- no duplicate feedback on rapid taps.

## Stop Points

- Do not apply broad global behavior to every button without review.
- If platform differences are unclear, write a scope report instead.

## Verification

- Focused smoke or source test for feedback helper.
- Manual-tail note for real device haptics.
- `node scripts/check-cp1251-mojibake.mjs`

## Report

Create `pm/outbox/REPORT-BRIEF-2026-07-27-94-button-feedback-haptics-pilot.md`.
