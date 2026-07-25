# CODEX-018 — Synthetic positive unlock branch

## Статус

Done: isolated synthetic positive planner branch проверен.

## Files

- `scripts/build-synthetic-positive-approved-mapping-report.mjs`
- `scripts/plan-quarantine-unlock-from-approved-mappings.mjs`
- `backups/staging-approved-mappings-synthetic-positive-branch-20260619-104514.report.json`
- `backups/staging-quarantine-unlock-plan-20260619-104528.report.json`

## Что сделано

- Создан synthetic approved mappings report, не связанный с production KV/D1,
  staging D1/KV или реальными Telegram данными.
- Planner обновлён: `syntheticTest = true` не подтягивает production-derived
  quarantine summary.
- Проверена позитивная ветка:
  - `ready_for_encrypted_full_hash_join`.

## Result

Synthetic approved report:

- `approvedProviderSyncMappings = 2`
- `seedRowsUnlockedByHashShort = 1`
- `candidateRecordsPotentiallyUnlockedByHashShort = 3`
- `unmatchedApprovedRows = 1`

Synthetic unlock plan:

- `syntheticTest = true`
- `status = ready_for_encrypted_full_hash_join`
- `safeToBuildImportPlanNow = false`
- `blockedSummary.blocker = encrypted_full_hash_join_not_run`

## Safety

- No Cloudflare writes.
- No production-derived data.
- No raw ids, task text, `metadata_json`, secrets or full hashes.
- Planner still refuses to build an import plan from sanitized short-hash data.

## Next

Done in `CODEX-019`: encrypted full-hash join planner works locally with DPAPI
artifacts and emits only sanitized aggregate decisions.
