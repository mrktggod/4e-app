# CODEX-032 — D1 v2 auth identities read endpoint

Date: 2026-06-20

## Context

After CODEX-030 and CODEX-031, production legacy KV has a protected
`GET /auth/identities` endpoint and the VK Mini App profile can show connected
Email/VK/Telegram accounts.

The next Gate 2 step is to prepare the same read shape for the future D1-backed
auth path, without switching production auth away from legacy KV yet.

## Scope

Small D1/v2-only backend slice:

- no production cutover;
- no new secrets;
- no unlink/relink policy yet;
- no frontend redesign work.

## Changes

Files:

- `4e-worker/src/worker/data/auth-repository.mjs`;
- `4e-worker/src/worker/auth/auth-service.mjs`;
- `4e-worker/src/worker/auth/auth-routes.mjs`;
- `scripts/verify-auth-repository.mjs`;
- `scripts/verify-v2-auth.mjs`.

Added:

- `repository.listIdentitiesByUser(userId)`;
- public identity mapping that hides raw `profile_json`;
- `service.listIdentities(token)`;
- protected `GET /v2/auth/identities`;
- local verification for authenticated read and revoked-session denial.

## Verification

- `node --check 4e-worker/worker.js`;
- `node --check 4e-worker/src/worker/data/auth-repository.mjs`;
- `node --check 4e-worker/src/worker/auth/auth-service.mjs`;
- `node --check 4e-worker/src/worker/auth/auth-routes.mjs`;
- `node --check scripts/verify-v2-auth.mjs`;
- `node --check scripts/verify-auth-repository.mjs`;
- `node scripts/verify-auth-repository.mjs`;
- `node scripts/verify-v2-auth.mjs`;
- `node scripts/verify-d1-schema.js`.
- `wrangler deploy --dry-run --no-bundle --config wrangler.staging.toml`;
- staging deploy:
  - Worker `restless-lab-d737-staging`;
  - version `913ef30c-0da1-4f93-8852-eb3e8380efb1`;
  - URL `https://restless-lab-d737-staging.shelckograff.workers.dev`.
- staging smoke:
  - initial request immediately after deploy briefly returned old `404`;
  - repeat `GET /v2/auth/identities` without bearer token returned expected `401`;
  - `GET /v2/auth/identities` with invalid bearer token returned route-level auth error, confirming the route is live.

## Remaining work

- D1 write/link routes for VK and Telegram identities.
- Unlink/relink policy and user-facing confirmation states.
- Production D1 auth cutover only after migration/smoke gates are green.
