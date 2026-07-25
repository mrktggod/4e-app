# CODEX-013 — Telegram provider sync mapping foundation

## Статус

Done: feature-flagged Telegram provider sync foundation готов, локально проверен
и включён только в staging config.

Staging deploy выполнен. Production flag/deploy не выполнялись.

## Контекст

Мы выбрали второй путь для conversation mapping decisions: сначала использовать
Telegram provider evidence для medium-confidence refs, а manual mapping оставить
для low-confidence refs.

Existing bot уже отправляет signed `register-chat` события в Worker. Новый слой
использует эти события для D1:

- найти canonical user через `auth_identities(provider='telegram')`;
- создать/обновить `integrations`;
- создать/обновить `conversations`;
- создать `approved` row в `legacy_conversation_mappings`.

## Что сделано

- Добавлен provider sync module:
  - `4e-worker/src/worker/providers/telegram-provider-sync.mjs`
- Добавлен verifier:
  - `scripts/verify-telegram-provider-sync.mjs`
- `4e-worker/worker.js` подключает sync к legacy `register-chat`, но только если:
  - `DB` существует;
  - `ENABLE_D1_PROVIDER_SYNC === "1"`.

## Feature flag

По умолчанию D1 provider sync выключен.

Staging opt-in выполнен:

- `4e-worker/wrangler.staging.toml` содержит
  `ENABLE_D1_PROVIDER_SYNC = "1"`;
- `wrangler deploy --dry-run --no-bundle --config wrangler.staging.toml`
  подтвердил staging bindings;
- `wrangler deploy --config wrangler.staging.toml` задеплоил
  `restless-lab-d737-staging`;
- Version ID: `8c781424-032e-4e4d-8588-cce888a819ba`.

Production включать нельзя до staging validation.

## Behavior

Если Telegram identity найдена:

- upsert `integrations`;
- upsert `conversations`;
- upsert `legacy_conversation_mappings`;
- mapping получает:
  - `status = approved`;
  - `confidence = provider_verified`;
  - `source = provider_sync`;
  - `approved_by = telegram_provider_sync`.

Если Telegram identity не найдена:

- sync возвращает `telegram_identity_not_found`;
- D1 conversation/mapping не создаётся.

## Checks

- `node --check 4e-worker/src/worker/providers/telegram-provider-sync.mjs`
- `node --check scripts/verify-telegram-provider-sync.mjs`
- `node --check 4e-worker/worker.js`
- `node scripts/verify-d1-schema.js`
- `node scripts/verify-telegram-provider-sync.mjs`
- `wrangler deploy --dry-run --no-bundle --config wrangler.staging.toml`
- `wrangler deploy --config wrangler.staging.toml`
- HTTP smoke staging root: `200`
- Read-only staging D1 check: `legacy_conversation_mappings = 0`,
  `changed_db = false`, `rows_written = 0`
- `node --check scripts/smoke-staging-register-chat-signature.mjs`
- Staging secret name check: `BOT_API_TOKEN`
- No-write HMAC smoke:
  - `ok = true`
  - `status = 200`
  - `botSignatureAccepted = true`
  - `expectedNoWriteReason = user not linked`
- Post-smoke read-only D1 check: `legacy_conversation_mappings = 0`,
  `changed_db = false`, `rows_written = 0`
- Controlled full staging provider-sync smoke:
  - script: `scripts/smoke-staging-telegram-provider-sync.ps1`
  - `signedRegisterChat = ok`
  - `d1ProviderSync = ok`
  - before cleanup: `integrations = 1`, `conversations = 1`,
    `mappings = 2`, `approvedProviderMappings = 2`
  - after cleanup: synthetic D1 counts all `0`
  - synthetic KV cleanup: `initial = 12`, `final = 0`

Verifier result:

| Check | Result |
|---|---|
| missingIdentity | ok |
| conversationSynced | ok |
| mappingRows | 1 |
| mappingStatus | approved |
| confidence | provider_verified |
| foreignKeys | ok |

## Safety notes

- Verifier uses synthetic IDs only.
- No raw Telegram ids, chat ids, user ids, titles, previews or full hashes are
  printed.
- Runtime logs contain only event status/counts, not raw provider identifiers.
- Feature flag prevents accidental D1 writes before staging opt-in.
- `scripts/smoke-staging-register-chat-signature.mjs` is a no-write smoke:
  it expects `user not linked` and prints only sanitized status.
- Staging `BOT_API_TOKEN` is configured as a Cloudflare secret; the value is not
  stored in docs and was not printed.
- Controlled full smoke uses synthetic data only and removes synthetic D1/KV
  state after verification.

## Next steps

1. Build a staging-safe approved mapping verification/report that prints only
   aggregate counts and short non-reversible hashes.
2. Use approved mappings to plan unlocked quarantined task import.
3. Keep production provider sync flag off until staging verification/report is
   accepted.
