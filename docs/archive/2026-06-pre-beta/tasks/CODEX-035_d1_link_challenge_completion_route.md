# CODEX-035 — D1 link challenge completion route

Date: 2026-06-20

## Context

CODEX-034 added durable `account_link_challenges` records for identity
conflicts, but there was no route to safely complete such a challenge.

The next Gate 2 step is to prove that the current logged-in user still controls
the conflicting provider account, then mark the challenge as completed. This is
not the same as merging users: merge must remain disabled until the user-facing
confirmation and data policy exist.

## Scope

Small staging-safe backend slice:

- D1/v2 only;
- no schema migration;
- no production cutover;
- no automatic user merge;
- no unlink/relink policy;
- no frontend redesign work.

## Changes

Files:

- `4e-worker/src/worker/data/auth-repository.mjs`;
- `4e-worker/src/worker/auth/auth-service.mjs`;
- `4e-worker/src/worker/auth/auth-routes.mjs`;
- `scripts/verify-auth-repository.mjs`;
- `scripts/verify-v2-auth.mjs`.

Added repository behavior:

- `updateAccountLinkChallengeStatus(...)`.

Added service behavior:

- `AuthNotFoundError`;
- `getLinkChallengeCompletionTarget(userId, challengeId)`;
- `completeVerifiedLinkChallenge(userId, challengeId, identity)`.

Added route:

- `POST /v2/auth/link-challenges/:id/complete`.

## Security behavior

- The route requires a valid Bearer session.
- The challenge must belong to the current session user.
- The challenge must be `pending`, not expired, and type `identity_conflict`.
- The route chooses the provider verifier from the stored challenge provider.
- The submitted provider proof must match the stored `provider_user_id_hash`.
- The existing provider identity must still belong to the original target user.
- Completion marks the challenge as `completed` and returns:
  - `completed: true`;
  - `linked: false`;
  - `mergeReady: true`;
  - `nextAction: "merge_confirmation_required"`.
- Completion does not transfer identity ownership and does not merge user data.

## Verification

- `node --check 4e-worker/src/worker/data/auth-repository.mjs`;
- `node --check 4e-worker/src/worker/auth/auth-service.mjs`;
- `node --check 4e-worker/src/worker/auth/auth-routes.mjs`;
- `node --check scripts/verify-v2-auth.mjs`;
- `node --check scripts/verify-auth-repository.mjs`;
- `node --check 4e-worker/worker.js`;
- `node scripts/verify-auth-repository.mjs`;
- `node scripts/verify-v2-auth.mjs`;
- `node scripts/verify-d1-schema.js`;
- `node scripts/verify-telegram-initdata.mjs`;
- `node scripts/verify-vk-launch-params.mjs`;
- `git diff --check`;
- `wrangler deploy --dry-run --no-bundle --config wrangler.staging.toml`;
- staging deploy:
  - Worker `restless-lab-d737-staging`;
  - version `b4096eb1-e639-4baf-9d4c-935a0684f549`;
  - URL `https://restless-lab-d737-staging.shelckograff.workers.dev`;
- no-write staging smoke:
  - `POST /v2/auth/link-challenges/smoke/complete` without bearer token
    returned `401`.

## Tested local flows

- Bob cannot complete a missing challenge: `404`.
- Alice cannot complete Bob's challenge: `404`.
- Bob can complete his own challenge with matching Telegram `initData`.
- Completed challenge does not attach the Telegram identity to Bob.
- Existing Telegram identity remains owned by Alice.
- Wrong signed Telegram proof is rejected with `400`.
- Wrong-proof challenge remains `pending`.

## Remaining work

- Merge confirmation policy after completed challenge: implemented in CODEX-036
  for staging D1/v2.
- Add user-facing UI for "this Telegram/VK account is already linked".
- Add unlink/relink policy.
- Switch production auth to D1 only after migration and smoke gates are green.
