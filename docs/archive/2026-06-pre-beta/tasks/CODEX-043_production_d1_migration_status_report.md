# CODEX-043 — Production D1 migration status report

## Контекст

После production D1 gate база `4e-production` создана и Worker имеет `DB`
binding, но это ещё не означает, что legacy KV данные можно массово писать в
production D1.

Перед следующим шагом нужен один короткий read-only ответ:

- что уже механически готово к импорту;
- что всё ещё заблокировано;
- почему production import нельзя запускать без отдельного approval.

## Сделано

- Добавлен read-only sanitized report builder:
  - `scripts/report-production-d1-migration-status.mjs`.
- Добавлен verifier:
  - `scripts/verify-production-d1-migration-status.mjs`.
- Сгенерирован отчёт:
  - `backups/production-d1-migration-status-20260620-141754.report.json`.

## Результат

Отчёт вернул:

- `decision.status = hold_production_import`;
- blockers: `5`;
- mechanically importable task rows: `83`;
- quarantined legacy task records: `206`;
- conversation-owner candidate records: `198`;
- manual decision rows: `0`;
- encrypted full-hash matches: `0`;
- candidate records still blocked: `198`;
- `safeToBuildImportPlanNow = false`.

## Почему это важно

Это защищает production D1 от преждевременного импорта:

- 83 задачи уже можно проверить технически, но нельзя безопасно переносить весь
  пользовательский контекст без owner policy;
- 206 legacy records нельзя угадывать по owner;
- staging provider-sync mappings существуют, но не совпали с текущими
  quarantine seed refs;
- production provider sync остаётся выключенным.

## Проверка

- `node --check scripts/report-production-d1-migration-status.mjs`
- `node --check scripts/verify-production-d1-migration-status.mjs`
- `node scripts/verify-production-d1-migration-status.mjs backups/production-d1-migration-status-20260620-141754.report.json`
- `git diff --check`

Verifier output:

```json
{
  "status": "hold_production_import",
  "blockers": 5,
  "importableTaskRows": 83,
  "quarantinedRecords": 206,
  "candidateRecordsStillBlocked": 198
}
```

## Privacy

Report and verifier do not print raw KV keys, user ids, chat ids, emails, task
text, message text, tokens, full legacy hashes, `metadata_json` values or
decrypted payloads.

## Следующий шаг

Выбрать explicit quarantine/owner policy:

1. продолжить provider/manual mapping для 198 blocked records;
2. или импортировать только 83 ready rows after explicit approval, оставив
   quarantine records вне production D1;
3. или сделать opt-in real-user bridge smoke для конкретного пользователя перед
   массовой миграцией.
