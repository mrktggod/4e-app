status: NEW

# BRIEF-2026-07-25-64-voice-exit-controls

## Context

Linked bug: `BUG-2026-07-25-011`.

In voice mode, `Отменить` and the back arrow do not exit the mode.

## Task

Make both voice exit controls stop the current voice flow, clear transient listening state, and return to the previous safe screen. Keep existing consent and premium gates intact.

## Stop Points

- No production deploy.
- No merge into `main`.
- No payment or entitlement changes.
- No secret handling.
- If the issue depends on live Telegram WebView behavior only, write source fix plus `NEEDS-REAL` tail or `NEED-YURI` as appropriate.

## Verification

- `node scripts/check-cp1251-mojibake.mjs`
- Focused voice exit smoke or Playwright check for cancel/back behavior.
- Shared guards before commit.

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-25-64-voice-exit-controls.md`.

