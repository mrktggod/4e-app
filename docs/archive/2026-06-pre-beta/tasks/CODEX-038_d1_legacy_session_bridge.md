# CODEX-038 — D1 legacy session bridge

## Context

CODEX-037 added a forward-compatible VK identity conflict UI, but the live VK
frontend still authenticates through legacy `/auth/*` routes and stores a legacy
`x-token`. The D1/v2 identity challenge routes require a Bearer token.

Production Worker currently has KV only in `wrangler.toml`; staging has both KV
and D1 in `wrangler.staging.toml`. So the safe next step was a staging-ready
bridge, not a production cutover.

## Scope

- Add a protected v2 auth bridge from legacy KV session to D1 session.
- Do not trust client-supplied user ids.
- Do not deploy production.
- Keep `/v2/auth/*` behavior safe when D1 is unavailable.

## Changes

- Added `POST /v2/auth/legacy-session`.
- `worker.js` now resolves the legacy user server-side through:
  - `getSession(request)`;
  - `getSessionUser(session)`.
- Added `exchangeLegacySession()` to D1 auth service:
  - creates or finds a D1 `users` row using the legacy user id;
  - creates a `web` identity for the legacy email when present;
  - refuses to attach an email identity already owned by another D1 user;
  - creates a hashed D1 session and returns a Bearer token;
  - returns public user and identities.
- Extended `scripts/verify-v2-auth.mjs` with the bridge contract.

## Verification

- `node --check 4e-worker/worker.js`
- `node --check 4e-worker/src/worker/auth/auth-service.mjs`
- `node --check 4e-worker/src/worker/auth/auth-routes.mjs`
- `node scripts/verify-v2-auth.mjs`
- `wrangler deploy --dry-run --no-bundle --config wrangler.staging.toml`
- `wrangler deploy --config wrangler.staging.toml`
- Live no-write smoke:
  - `POST /v2/auth/legacy-session` without `x-token` returns `401`;
  - response includes `Cache-Control: no-store`.

## Deployment

- Staging Worker: `restless-lab-d737-staging`
- URL: `https://restless-lab-d737-staging.shelckograff.workers.dev`
- Version: `0b771399-3713-47c7-a95e-2cf09fa9d717`

## Limits

- Production Worker was not changed.
- Production D1 binding was not created.
- Full staging success-smoke with synthetic KV/D1 writes was not run yet; the
  successful path is covered by local D1-shape verifier.
- VK frontend does not call the bridge yet.

## Next

- Add frontend handshake after legacy login:
  1. call `/v2/auth/legacy-session` with current `x-token`;
  2. store the returned Bearer token in runtime state;
  3. use Bearer token for `/v2/auth/link-vk` and challenge complete/merge routes.
- Prepare production D1 binding/migration/cutover checklist.
