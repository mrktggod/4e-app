# CODEX-036 — D1 link challenge merge confirmation route

Date: 2026-06-20

## Context

CODEX-035 added a safe completion route for identity conflict challenges. The
completed challenge proves that the current logged-in user controls the
conflicting provider account, but it still does not merge data.

The next Gate 2 step is a conservative merge confirmation contract. It must
require explicit confirmation, run a preflight before writes, and move only
D1-owned rows that have clear user ownership.

## Scope

Staging-safe backend slice:

- D1/v2 only;
- no schema migration;
- no production cutover;
- no frontend redesign work;
- no unlink/relink policy yet.

## Contract

`POST /v2/auth/link-challenges/:id/merge`

Body:

```json
{ "confirm": true }
```

Behavior:

- requires a valid Bearer session;
- challenge must belong to the current user;
- challenge must be `completed`;
- challenge type must be `identity_conflict`;
- target user must still be active;
- target identity must still belong to the target user;
- preflight must find no contact or AI-memory unique-key conflicts.

If `confirm !== true`, the route returns `400`.
If the challenge belongs to another user or is missing, the route returns `404`.
If preflight finds conflicts, the route returns `409` and does not write.

## Merge policy

The current session user becomes the canonical user.
The old target user is the source user.

Transferred to canonical user:

- `auth_identities.user_id`;
- `integrations.user_id`;
- `contacts.owner_user_id`;
- `conversations.owner_user_id`;
- `legacy_conversation_mappings.owner_user_id`;
- `tasks.user_id`;
- `reminders.user_id`;
- `ai_threads.user_id`;
- `ai_memories.user_id`;
- `audit_events.user_id`.

Also:

- source user sessions are revoked;
- source user is marked `deleted`;
- messages, attachments, conversation members, AI messages and summaries remain
  connected through moved conversations/tasks/threads.

## Safety rules

- The route does not delete rows.
- The route does not silently resolve contact or AI-memory conflicts.
- Existing source sessions are revoked instead of becoming canonical sessions.
- D1 writes are performed through one repository batch.
- Full remote write smoke is intentionally not run without real signed provider
  payloads/secrets.

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
- `node scripts/verify-v2-tasks.mjs`;
- `node scripts/verify-v2-messages.mjs`;
- `node scripts/verify-telegram-initdata.mjs`;
- `node scripts/verify-vk-launch-params.mjs`;
- `git diff --check`;
- `wrangler deploy --dry-run --no-bundle --config wrangler.staging.toml`;
- staging deploy:
  - Worker `restless-lab-d737-staging`;
  - version `b80be643-0fa6-402a-a314-888013f62998`;
  - URL `https://restless-lab-d737-staging.shelckograff.workers.dev`;
- no-write staging smoke:
  - `POST /v2/auth/link-challenges/smoke/merge` without bearer token returned
    `401`.

## Tested local flows

- merge without `confirm: true` returns `400`;
- another user cannot merge a challenge: `404`;
- completed challenge merges source user into canonical user;
- source user sessions are revoked;
- source user becomes `deleted`;
- source Telegram/VK/Web identities move to canonical user;
- source tasks, reminders, integrations, contacts, conversations, AI threads,
  AI memories and audit events move to canonical user;
- target email login now resolves to canonical user after merge;
- contact and AI-memory preflight conflicts are detected.

## Remaining work

- Add frontend UI for conflict/completion/merge states.
- Add unlink/relink policy.
- Add production cutover checklist for D1 auth.
- Decide how to present merged account history and audit trail in the product.
