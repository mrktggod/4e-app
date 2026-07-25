# CODEX-016 — Quarantine unlock planner

## Статус

Done: local sanitized unlock planner и verifier готовы.

## Files

- `scripts/plan-quarantine-unlock-from-approved-mappings.mjs`
- `scripts/verify-quarantine-unlock-plan.mjs`
- `backups/staging-quarantine-unlock-plan-20260619-103152.report.json`

## Что делает planner

- Потребляет staging approved mappings report.
- Сопоставляет его с sanitized seed/quarantine summaries.
- Возвращает безопасное planning decision.
- Не расшифровывает DPAPI artifacts.
- Не создаёт import plan.
- Не использует short hashes для actual import decisions.

## Result

- `status = blocked_waiting_for_approved_provider_mappings`
- `safeToBuildImportPlanNow = false`
- `seedRowsUnlockedByHashShort = 0`
- `candidateRecordsPotentiallyUnlockedByHashShort = 0`
- `seedRowsStillBlockedByHashShort = 14`
- `candidateRecordsStillBlockedByHashShort = 198`
- `blockedCandidateRecords = 198`
- `requiresFullHashImportJoin = true`

## Privacy

No raw Telegram ids, chat ids, user ids, task text, `metadata_json`, secrets or
full legacy hashes are printed.

## Вывод

Сейчас quarantine unlock равен 0. Это ожидаемо: staging smoke удаляет synthetic
mappings после проверки, а real approved provider-sync mappings ещё не
накоплены.

## Next

Choose how to create real approved provider mappings in staging:

1. controlled persistent test mapping; or
2. real Telegram account sync flow.

After that, regenerate CODEX-015 report and run this planner again. Only then
build encrypted full-hash join tooling.

Update: controlled persistent test mapping is now covered by CODEX-017. It
proved the safety branch: approved rows can exist while quarantine unlock stays
at 0 when seed refs do not match.
