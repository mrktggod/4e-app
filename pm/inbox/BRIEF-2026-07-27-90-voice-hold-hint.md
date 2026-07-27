status: DONE

# BRIEF-2026-07-27-90-voice-hold-hint

## Context

Misha BUG-003: it is not clear that the central voice button should be held to start the voice assistant.

## Task

Add a small, non-intrusive hint for the hold gesture.

Expected:

- the hint is visible enough for first use;
- it does not clutter the main screen;
- it works on mobile;
- no change to voice recording permissions or Premium gates.

## Verification

- Focused DOM/visual smoke for hint presence at 390px.
- Existing voice smokes stay green.
- `node scripts/check-cp1251-mojibake.mjs`

## Report

Create `pm/outbox/REPORT-BRIEF-2026-07-27-90-voice-hold-hint.md`.
