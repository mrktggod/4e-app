# CODEX-010 — Legacy conversation mapping schema

## Статус

Done: schema/repository готовы, локально проверены и применены к staging D1.
Production D1/KV не трогались.

## Контекст

`CODEX-009` показал, что для `13` chat mirror buckets / `198` legacy task
records нельзя доказать owner по текущему legacy KV. Чтобы не импортировать
задачи к неверному пользователю, нужен отдельный mapping layer:

`legacy conversation ref hash → canonical user/conversation`.

## Что сделано

- Добавлена D1 migration:
  - `4e-worker/migrations/0004_legacy_conversation_mappings.sql`
- Добавлен repository:
  - `4e-worker/src/worker/data/conversation-mapping-repository.mjs`
- Добавлен verifier:
  - `scripts/verify-conversation-mapping-repository.mjs`
- Обновлён schema verifier:
  - `scripts/verify-d1-schema.js`

## D1 table

Новая таблица:

- `legacy_conversation_mappings`

Ключевые правила:

- `legacy_ref_hash` хранит только lowercase SHA-256 hex digest.
- Raw legacy chat ids/provider conversation ids в таблицу не пишутся.
- `owner_user_id` связан с `users`.
- `conversation_id` опционально связан с `conversations`.
- `status`: `proposed`, `approved`, `rejected`, `superseded`.
- `evidence_json` обязан быть валидным JSON.

## Staging apply

Команда:

- `wrangler d1 migrations apply DB --remote --config wrangler.staging.toml`

Результат:

- Applied migration: `0004_legacy_conversation_mappings.sql`
- Remote D1: `DB (8ac20719-2558-4142-b9b9-e1c710d0e0c5)`
- Executed commands: `6`

Post-check:

- `mapping_rows`: `0`
- `changed_db`: `false`

## Checks

- `node --check scripts/verify-conversation-mapping-repository.mjs`
- `node --check 4e-worker/src/worker/data/conversation-mapping-repository.mjs`
- `node --check scripts/verify-d1-schema.js`
- `node scripts/verify-d1-schema.js`
- `node scripts/verify-conversation-mapping-repository.mjs`
- `node scripts/verify-auth-repository.mjs`
- `node scripts/verify-v2-tasks.mjs`
- staging D1 read-only count check

## Safety notes

- Migration добавляет только schema.
- Staging table пока пустая.
- Full raw legacy refs не выводились в chat/docs.
- Repository принимает только `legacyRefHash`, а не raw legacy ref.

## Next steps

1. Добавить encrypted mapping seed plan для unresolved conversation buckets.
2. Сделать local/manual review workflow, который создаёт approved mapping rows
   только после явного решения.
3. После approved mappings построить encrypted import plan для разблокированных
   quarantined tasks.
