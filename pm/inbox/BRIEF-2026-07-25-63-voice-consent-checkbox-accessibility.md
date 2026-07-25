status: DONE

# BRIEF-2026-07-25-63-voice-consent-checkbox-accessibility

## Context

Linked bug: `BUG-2026-07-25-010`.

The checkbox on the voice biometric consent screen is too small/subtle.

## Task

Improve checkbox visibility and touch target on the voice consent screen without changing legal copy. Keep the checkbox state clear in dark theme and target at least 44px.

## Stop Points

- No production deploy.
- No merge into `main`.
- No legal text changes.
- No CAL, payment, entitlement, price, or secret work.

## Verification

- `node scripts/check-cp1251-mojibake.mjs`
- `npm run smoke:back050` or a more focused consent/accessibility smoke.
- Shared guards before commit.

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-25-63-voice-consent-checkbox-accessibility.md`.
