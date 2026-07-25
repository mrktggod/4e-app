# CODEX-042 — Defensive legacy session parsing

## Context

During the production D1 bridge smoke, malformed synthetic `session:*` values in
legacy KV caused the Worker to return Cloudflare `1101`. The crash happened
before v2 auth route error handling because `getSession()` parsed raw KV JSON
without a guard.

## Changes

- Updated `4e-worker/worker.js` `getSession()`:
  - wraps `JSON.parse(raw)` in `try/catch`;
  - logs `legacy_session_parse_error`;
  - deletes malformed `session:*` best-effort;
  - returns `null` so protected routes answer `401`;
  - validates parsed session shape;
  - validates `expiresAt` as a finite number;
  - logs `legacy_session_shape_error` for bad shapes;
  - keeps old expiry cleanup behavior.

## Verification

- `node --check 4e-worker/worker.js`
- `node scripts/verify-v2-auth.mjs`
- `node scripts/check-production-d1-cutover-readiness.js`
- `git diff --check`

Staging:

- dry-run passed;
- deployed Worker version `03a605a3-7239-48be-abfd-2774bdee48ad`;
- malformed `session:* = not-json` smoke returned `401`;
- malformed KV key was deleted by Worker.

Production:

- dry-run passed;
- deployed Worker version `3892efae-de1a-4d0c-8bd7-822b7835894c`;
- malformed `session:* = not-json` smoke returned `401`;
- malformed KV key was deleted by Worker;
- legacy→D1 bridge regression smoke passed;
- final D1 cleanup verification:
  - `smokeUsers = 0`;
  - `totalUsers = 0`.

## Notes

- This prevents malformed legacy session KV values from crashing the Worker.
- It does not migrate legacy KV users/tasks into D1.
- Production provider sync remains disabled intentionally.

## Next

- Run manual VK mobile smoke after cache refresh.
- Continue with opt-in real-user bridge smoke or KV→D1 migration planning.
