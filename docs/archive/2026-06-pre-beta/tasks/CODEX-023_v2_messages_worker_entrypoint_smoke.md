# CODEX-023 — `/v2/messages` Worker entrypoint smoke

## Статус

Done: controlled local smoke для реального Worker entrypoint готов и прошёл.

## Files

- `scripts/smoke-worker-v2-messages-entrypoint.mjs`
- `4e-worker/worker.js` используется как импортируемый Worker entrypoint

## Что сделано

- Добавлен synthetic smoke-test, который вызывает именно `worker.fetch(...)`, а не только `handleV2MessageRequest(...)`.
- Smoke поднимает in-memory SQLite/D1-shape fixture через реальные migrations.
- Fixture создаёт:
  - двух synthetic users;
  - две synthetic sessions;
  - две synthetic conversations с разными owners;
  - synthetic messages для pagination, ownership isolation и soft-delete default.
- Проверяется полный путь:
  - Worker route dispatch → `/v2/messages`;
  - Bearer auth;
  - D1 `message-repository`;
  - cursor pagination;
  - CORS header для allowed origin;
  - `Cache-Control: no-store`;
  - отсутствие public `providerMessageId` и `metadata`;
  - D1 unavailable → `503`.

## Проверки

- `node --check scripts/smoke-worker-v2-messages-entrypoint.mjs`
- `node scripts/smoke-worker-v2-messages-entrypoint.mjs`
- `node scripts/verify-v2-messages.mjs`
- `node scripts/verify-message-repository.mjs`

Smoke result:

- `unauthenticated = 401`
- `invalidQuery = 400`
- `firstPageRows = 2`
- `secondPageRows = 1`
- `cursor = ok`
- `cors = ok`
- `noStore = ok`
- `ownershipIsolation = ok`
- `softDeleteDefault = ok`
- `dbUnavailable = 503`

## Safety

- No production writes.
- No staging D1/KV writes.
- Synthetic in-memory SQLite only.
- Smoke output does not print raw provider ids, user ids, message text,
  `metadata_json` or secrets.
- Node prints a non-blocking `MODULE_TYPELESS_PACKAGE_JSON` warning when importing
  `4e-worker/worker.js` as ESM; package type was not changed to avoid breaking
  older CommonJS-style scripts.

## Next

- Either add provider ingest path behind a staging-only feature flag; or
- create a staging-only D1 message fixture if we explicitly approve staging writes.
