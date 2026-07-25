# CODEX-015 — Staging approved mapping report

## Статус

Done: read-only staging report generator и privacy verifier готовы.

## Files

- `scripts/report-staging-approved-mappings.ps1`
- `scripts/verify-staging-approved-mapping-report.mjs`
- `backups/staging-approved-mappings-20260619-102455.report.json`

## Что проверяется

- Approved mappings в staging D1.
- Provider-verified/provider-sync subset.
- Coverage against latest sanitized conversation mapping seed report.
- Потенциально разблокируемые seed refs и candidate records.

## Privacy policy

- В отчёт не попадают raw Telegram ids, chat ids, user ids, task text,
  `metadata_json`, secrets или full legacy hashes.
- Для operator visibility используется только `legacyRefHashShort`.
- Import tooling обязан использовать full hashes из encrypted artifacts, а не
  short hash из отчёта.

## Result

- `seedRefRows = 14`
- `candidateRecords = 198`
- `approvedProviderSyncMappings = 0`
- `seedRowsUnlockedByHashShort = 0`
- `candidateRecordsPotentiallyUnlockedByHashShort = 0`
- `requiresFullHashImportJoin = true`

## Вывод

Отчётный контур готов. Сейчас ничего из quarantine не разблокировано, потому
что staging smoke удаляет synthetic mappings после проверки, а реальные
provider-sync mappings в staging пока отсутствуют.

## Next

Unlock planner is now covered by CODEX-016. Next, decide how to produce
real approved provider mappings in staging before encrypted full-hash join.
