# CODEX-021 — D1 message repository pagination/idempotency

## Статус

Done: первый data-layer слой для D1 messages готов и локально проверен.

## Files

- `4e-worker/src/worker/data/message-repository.mjs`
- `scripts/verify-message-repository.mjs`

## Что сделано

- Добавлен D1-compatible `message-repository`.
- Реализовано:
  - `createMessage`;
  - `upsertProviderMessage`;
  - `findMessageById`;
  - `findMessageByProviderMessageId`;
  - `listMessagesForOwner`.
- Provider idempotency:
  - duplicate `(conversation_id, provider_message_id)` не создаёт дубль;
  - existing row обновляется и возвращается как `inserted = false`;
  - `UNIQUE` race fallback перечитывает существующую строку.
- Pagination:
  - cursor = base64url JSON `{ v, sentAt, id }`;
  - order = `sent_at DESC, id ASC`;
  - `nextCursor` строится от последней строки страницы.
- Ownership isolation:
  - list query join-ит `conversations`;
  - owner должен совпадать с `conversations.owner_user_id`.
- Soft delete:
  - по умолчанию исключает `deleted_at IS NOT NULL`;
  - `includeDeleted` оставлен для будущих admin/sync сценариев.

## Проверки

- `node --check 4e-worker/src/worker/data/message-repository.mjs`
- `node --check scripts/verify-message-repository.mjs`
- `node scripts/verify-message-repository.mjs`
- `node scripts/verify-d1-schema.js`

Verifier result:

- `idempotentProviderIngest = ok`
- `duplicateRows = 0`
- `totalRows = 5`
- `firstPageRows = 2`
- `secondPageRows = 1`
- `cursor = ok`
- `ownershipIsolation = ok`
- `softDeleteDefault = ok`

Schema result:

- `tables = 21`
- `indexes = 25`
- `foreignKeys = ok`

## Safety

- No production writes.
- No staging D1/KV writes.
- Synthetic in-memory SQLite only.
- Verifier does not print raw provider ids, user ids, message text,
  `metadata_json` or secrets.
- Existing production KV `/messages` routes were not switched.

## Next

Done in `CODEX-022`: thin `GET /v2/messages` route/service added on top of the
repository.
