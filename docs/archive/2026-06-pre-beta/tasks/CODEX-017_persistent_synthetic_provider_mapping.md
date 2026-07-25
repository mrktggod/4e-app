# CODEX-017 — Persistent synthetic provider mapping

## Статус

Done: fixed synthetic provider-sync mapping создан в staging и проверен.

## Files

- `scripts/smoke-staging-telegram-provider-sync.ps1`
- `backups/staging-approved-mappings-20260619-104005.report.json`
- `backups/staging-quarantine-unlock-plan-20260619-104017.report.json`

## Что изменено

`scripts/smoke-staging-telegram-provider-sync.ps1` получил режимы:

- `-PersistSynthetic`
- `-CleanupPersistentSynthetic`

Persistent mode создаёт fixed synthetic provider-sync state в staging и
оставляет его для повторных report/planner проверок.

Cleanup command:

```powershell
scripts/smoke-staging-telegram-provider-sync.ps1 -CleanupPersistentSynthetic
```

## Result

Persistent synthetic state:

- `signedRegisterChat = ok`
- `d1ProviderSync = ok`
- `integrations = 1`
- `conversations = 1`
- `mappings = 2`
- `approvedProviderMappings = 2`

Approved mappings report:

- `approvedProviderSyncMappings = 2`
- `unmatchedApprovedRows = 2`
- `seedRowsUnlockedByHashShort = 0`
- `candidateRecordsPotentiallyUnlockedByHashShort = 0`

Unlock planner:

- `status = blocked_approved_mappings_do_not_match_seed_refs`
- `safeToBuildImportPlanNow = false`
- `blockedCandidateRecords = 198`

## Вывод

Safety branch работает: наличие approved provider mappings в staging не
разблокирует quarantine import, если mappings не совпадают с seed refs.

## Next

Choose one of two paths:

1. real Telegram account sync flow that can create provider mappings matching
   real seed refs; or
2. isolated synthetic seed/report test that does not use production-derived
   artifacts, to test the positive unlock branch.

Update: isolated synthetic positive branch is now covered by CODEX-018.
