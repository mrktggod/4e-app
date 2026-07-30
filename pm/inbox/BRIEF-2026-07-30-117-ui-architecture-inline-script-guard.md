status: DONE
priority: P2

# BRIEF-2026-07-30-117 - UI architecture inline script guard

Source: nightly QA gate after inbox processing.

## Context

`npm run check:ui-architecture` is red on `inline script tags = 4, allowed max = 3`.
The failure blocks the private backlog/roadmap whitelist phase, even though the
extra inline block is pre-existing debt.

## Task

Reduce `index.html` inline script tags from 4 to 3 by moving one small safe
inline helper into an external script.

## Stop Points

- No product behavior changes.
- No production deploy.
- No merge to `main`.
- No payment, entitlement, CAL, secret, or auth-security changes.

## Expected Result

`npm run check:ui-architecture` passes and the moved runtime script remains
included in Pages/PWA asset lists.
