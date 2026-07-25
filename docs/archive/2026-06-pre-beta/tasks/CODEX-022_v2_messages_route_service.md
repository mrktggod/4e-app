# CODEX-022 — `/v2/messages` route/service

## Статус

Done: thin read route/service для D1 messages готов и локально проверен.

## Files

- `4e-worker/src/worker/messages/message-service.mjs`
- `4e-worker/src/worker/messages/message-routes.mjs`
- `4e-worker/worker.js`
- `scripts/verify-v2-messages.mjs`

## Что сделано

- Добавлен `GET /v2/messages`.
- Query:
  - `conversationId`;
  - `limit`;
  - `cursor`.
- Auth:
  - Bearer session через существующий D1 auth service.
- Route использует `message-repository.listMessagesForOwner`, поэтому:
  - owner проверяется через `conversations.owner_user_id`;
  - cursor pagination работает по `sent_at DESC, id ASC`;
  - soft-deleted messages скрыты по умолчанию.
- Public response намеренно не отдаёт:
  - `provider_message_id`;
  - `metadata_json`.
- Provider ingest endpoint наружу не добавлялся.
- Legacy KV `/messages` routes не переключались.

## Проверки

- `node --check 4e-worker/src/worker/messages/message-service.mjs`
- `node --check 4e-worker/src/worker/messages/message-routes.mjs`
- `node --check scripts/verify-v2-messages.mjs`
- `node scripts/verify-v2-messages.mjs`
- `node scripts/verify-message-repository.mjs`
- `node scripts/verify-d1-schema.js`
- `node --check 4e-worker/worker.js`

Verifier result:

- `unauthenticated = 401`
- `invalidQuery = 400`
- `firstPageRows = 2`
- `secondPageRows = 1`
- `cursor = ok`
- `ownershipIsolation = ok`
- `softDeleteDefault = ok`
- `dbUnavailable = 503`

## Safety

- No production writes.
- No staging D1/KV writes.
- Synthetic in-memory SQLite only.
- Verifier does not print raw provider ids, user ids, message text,
  `metadata_json` or secrets.
- Provider ingest endpoint remains internal/data-layer only.

## Next

- Controlled local Worker entrypoint smoke is covered by CODEX-023; next add
  provider ingest path behind a staging-only feature flag.
