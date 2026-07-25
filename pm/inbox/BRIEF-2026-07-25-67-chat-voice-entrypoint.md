status: DONE

# BRIEF-2026-07-25-67-chat-voice-entrypoint

## Context

Linked bug: `BUG-2026-07-25-014`.

AI chat lacks an obvious voice input button in the composer.

## Task

Add or restore a clear voice entrypoint inside the AI chat composer. It should be reachable, visually understandable, and route into the existing voice flow with the same consent/premium gates.

## Stop Points

- No production deploy.
- No merge into `main`.
- No new voice backend.
- No payment or entitlement refactor.
- No secret handling.

## Verification

- `node scripts/check-cp1251-mojibake.mjs`
- `npm run test:e2e:web` or focused chat/voice smoke proving the entrypoint is visible and wired.
- Shared guards before commit.

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-25-67-chat-voice-entrypoint.md`.
