# CODEX-034 — D1 identity conflict challenge foundation

Date: 2026-06-20

## Context

CODEX-033 added signed D1/v2 provider link routes:

- `POST /v2/auth/link-telegram`;
- `POST /v2/auth/link-vk`.

Those routes already rejected a provider identity that belongs to another D1
user. The missing Gate 2 foundation was a durable, safe challenge record for
that conflict, without automatically merging users.

## Scope

Small staging-safe backend slice:

- D1/v2 only;
- no production cutover;
- no automatic user merge;
- no unlink/relink policy yet;
- no frontend redesign work.

## Changes

Files:

- `4e-worker/migrations/0005_account_link_challenge_metadata.sql`;
- `4e-worker/src/worker/data/auth-repository.mjs`;
- `4e-worker/src/worker/auth/auth-service.mjs`;
- `4e-worker/src/worker/auth/auth-routes.mjs`;
- `scripts/verify-v2-auth.mjs`;
- `scripts/verify-d1-schema.js`.

Added D1 metadata fields for `account_link_challenges`:

- `target_identity_id`;
- `target_user_id`;
- `provider_user_id_hash`;
- `challenge_type`;
- `metadata_json`;
- `updated_at`.

Added repository/service behavior:

- `createAccountLinkChallenge(...)`;
- `findAccountLinkChallengeById(id)`;
- safe `AuthConflictError.details`;
- conflict challenge creation when a signed provider identity already belongs to
  another user;
- public conflict response shape:
  - `409`;
  - `requiresChallenge: true`;
  - `challenge.id`;
  - `challenge.type`;
  - `challenge.targetProvider`;
  - `challenge.status`;
  - `challenge.expiresAt`;
  - `challenge.createdAt`.

Public challenge responses intentionally do not expose `targetUserId`,
`providerUserId`, raw provider profile data, or challenge secret/code hashes.

## Security behavior

- The route still requires a valid Bearer session before provider verification.
- Provider identity proof is still provider-specific and signed.
- Existing identity conflicts do not mutate ownership.
- A conflict creates a short-lived pending challenge record.
- Automatic merge remains disabled until an explicit user-facing confirmation
  and merge policy exists.
- Provider user IDs are stored in the challenge only as SHA-256 hashes.

## Verification

- `node --check 4e-worker/src/worker/data/auth-repository.mjs`;
- `node --check 4e-worker/src/worker/auth/auth-service.mjs`;
- `node --check 4e-worker/src/worker/auth/auth-routes.mjs`;
- `node --check scripts/verify-v2-auth.mjs`;
- `node --check scripts/verify-d1-schema.js`;
- `node --check 4e-worker/worker.js`;
- `node scripts/verify-d1-schema.js`;
- `node scripts/verify-auth-repository.mjs`;
- `node scripts/verify-v2-auth.mjs`;
- `node scripts/verify-telegram-initdata.mjs`;
- `node scripts/verify-vk-launch-params.mjs`;
- `git diff --check`;
- `wrangler deploy --dry-run --no-bundle --config wrangler.staging.toml`;
- `wrangler d1 migrations apply DB --remote --config wrangler.staging.toml`;
- staging deploy:
  - Worker `restless-lab-d737-staging`;
  - version `9bf77231-9535-4b3b-8bc7-d5a8f043d05f`;
  - URL `https://restless-lab-d737-staging.shelckograff.workers.dev`;
- no-write staging smoke:
  - `POST /v2/auth/link-telegram` without bearer token returned `401`;
- read-only staging D1 query confirmed the six new columns exist and wrote `0`
  rows.

## Notes

- One PowerShell read-only D1 query failed because of nested quoting, then was
  rerun successfully without nested PowerShell.
- Full remote Telegram/VK challenge creation smoke was not run because Codex
  does not read secret values needed to sign real provider payloads.

## Remaining work

- Add explicit challenge completion route and merge confirmation policy.
- Add user-facing UI for "this Telegram/VK account is already linked".
- Add unlink/relink policy.
- Switch production auth to D1 only after migration and smoke gates are green.
