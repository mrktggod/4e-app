# CODEX-033 — D1 v2 signed identity link routes

Date: 2026-06-20

## Context

CODEX-032 added the D1/v2 read contract for connected accounts:

- `GET /v2/auth/identities`.

The next Gate 2 step is the write/link foundation. This must not become a
generic “send providerUserId and create identity” endpoint, because that would
let an external client claim arbitrary Telegram/VK identities.

## Scope

Small staging-safe backend slice:

- D1/v2 only;
- signed Telegram/VK provider proof required;
- no production cutover;
- no automatic D1 user merge;
- no unlink/relink policy yet;
- no frontend redesign work.

## Changes

Files:

- `4e-worker/src/worker/auth/provider-verifiers.mjs`;
- `4e-worker/src/worker/auth/auth-service.mjs`;
- `4e-worker/src/worker/auth/auth-routes.mjs`;
- `4e-worker/worker.js`;
- `scripts/verify-v2-auth.mjs`.

Added:

- `verifyTelegramInitData(initData, BOT_API_TOKEN)`;
- `verifyVKLaunchParams(launchParams, VK_SECRET_KEY)`;
- `ProviderVerificationError`;
- `service.linkVerifiedIdentity(userId, identity)`;
- protected `POST /v2/auth/link-telegram`;
- protected `POST /v2/auth/link-vk`;
- v2 auth tests for:
  - valid Telegram link;
  - repeated Telegram link without duplicate;
  - tampered Telegram payload rejection;
  - valid VK link;
  - conflict when another user tries to claim an already linked provider identity.

## Security behavior

- Routes authenticate the Bearer session before verifying provider payloads.
- Provider identity writes happen only after signed provider proof.
- If the provider identity already belongs to the same user, the route returns
  `linked: false` without duplicating rows.
- If the provider identity belongs to another user, the route returns `409`.
- Automatic D1 user merge is intentionally deferred to a later challenge/merge
  policy.
- Raw `profile_json` is not exposed by public read responses.

## Verification

- `node --check 4e-worker/src/worker/auth/provider-verifiers.mjs`;
- `node --check 4e-worker/src/worker/auth/auth-service.mjs`;
- `node --check 4e-worker/src/worker/auth/auth-routes.mjs`;
- `node --check scripts/verify-v2-auth.mjs`;
- `node --check 4e-worker/worker.js`;
- `node scripts/verify-v2-auth.mjs`;
- `node scripts/verify-auth-repository.mjs`;
- `node scripts/verify-telegram-initdata.mjs`;
- `node scripts/verify-vk-launch-params.mjs`;
- `node scripts/verify-d1-schema.js`;
- `wrangler deploy --dry-run --no-bundle --config wrangler.staging.toml`;
- staging deploy:
  - Worker `restless-lab-d737-staging`;
  - version `5b145762-4e19-402e-bba2-c815f6a1b0ee`;
  - URL `https://restless-lab-d737-staging.shelckograff.workers.dev`.
- no-write staging smoke:
  - `GET /v2/auth/identities` without bearer token returned `401`;
  - `POST /v2/auth/link-telegram` without bearer token returned `401`;
  - `POST /v2/auth/link-vk` without bearer token returned `401`.

## Notes

- Staging currently has `BOT_API_TOKEN` configured.
- Staging does not currently list `VK_SECRET_KEY`, so full VK signed write smoke
  requires adding that staging secret first.
- Full remote Telegram write smoke was not run because Codex does not read the
  staging bot token value to sign a real `initData`; local signed tests cover
  the write behavior.

## Remaining work

- Add staging `VK_SECRET_KEY` if full VK staging smoke is needed.
- Add explicit challenge/merge policy for identities already linked to another
  D1 user.
- Add unlink/relink policy and user-facing confirmation states.
- Switch production auth to D1 only after migration/smoke gates are green.
