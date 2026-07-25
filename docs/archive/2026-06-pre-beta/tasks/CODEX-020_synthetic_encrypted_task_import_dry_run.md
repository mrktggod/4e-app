# CODEX-020 — Synthetic encrypted task import dry-run

## Статус

Done: synthetic positive encrypted task import dry-run branch создана и
проверена без production-derived данных.

## Files

- `scripts/build-synthetic-encrypted-task-import-dry-run.ps1`
- `scripts/verify-synthetic-encrypted-task-import-dry-run-report.mjs`
- `scripts/apply-task-import-plan-staging.ps1`
- `backups/synthetic-encrypted-task-import-dry-run-20260619-114243.report.json`
- `backups/encrypted-full-hash-join-synthetic-positive-20260619-114243.report.json`
- `backups/synthetic-encrypted-task-import-dry-run-20260619-114243.metadata.json`
- `backups/synthetic-encrypted-task-import-dry-run-20260619-114243.plan.json.dpapi`

## Что сделано

- Создана synthetic full-hash join positive fixture:
  - `ready_for_encrypted_task_import_dry_run`;
  - `safeToWriteD1 = false`.
- Создан DPAPI-encrypted synthetic task import plan в том же shape, что и real
  task import plan.
- Создан sanitized dry-run report.
- Staging apply script усилен guard-ом:
  - synthetic metadata/plan с `syntheticTest = true` или `dryRunOnly = true`
    не принимается даже с `-DryRun`.
- Synthetic metadata намеренно не совпадает с default pattern
  `*.task-import-plan.metadata.json`.

## Result

- `rowsPlanned = 3`
- `distinctSyntheticUsers = 2`
- `status = ready_for_local_sqlite_validation`
- `safeToWriteD1 = false`
- `safeToApplyStaging = false`
- `privacy = ok`

## Проверки

- PowerShell syntax check:
  - `scripts/build-synthetic-encrypted-task-import-dry-run.ps1`
  - `scripts/apply-task-import-plan-staging.ps1`
- Node syntax check:
  - `scripts/verify-synthetic-encrypted-task-import-dry-run-report.mjs`
  - `scripts/validate-task-import-plan-sqlite.mjs`
- Synthetic report verifier:
  - `node scripts/verify-synthetic-encrypted-task-import-dry-run-report.mjs backups/synthetic-encrypted-task-import-dry-run-20260619-114243.report.json`
- Existing encrypted import plan verifier:
  - `.\scripts\verify-task-import-plan.ps1 -MetadataPath 'backups\synthetic-encrypted-task-import-dry-run-20260619-114243.metadata.json'`
- SQLite/D1-shape validator:
  - `.\scripts\validate-task-import-plan-sqlite.ps1 -MetadataPath 'backups\synthetic-encrypted-task-import-dry-run-20260619-114243.metadata.json'`
- Staging apply guard:
  - `.\scripts\apply-task-import-plan-staging.ps1 -MetadataPath 'backups\synthetic-encrypted-task-import-dry-run-20260619-114243.metadata.json' -DryRun`
  - expected refusal: synthetic dry-run import plan metadata is not accepted by
    staging apply.

## Safety

- No Cloudflare writes.
- No D1/KV writes.
- No production-derived data.
- DPAPI plaintext was not printed.
- Synthetic encrypted plan cannot be accidentally picked by default staging
  apply lookup and is explicitly rejected by apply guard.

## Ошибки и решения

- Initial verifier regex falsely detected `task-import` as an `sk-...` token.
  Fixed by requiring token-like length and boundary while preserving real secret
  pattern checks.

## Next

По Gate 3 остаются два практичных пути:

- когда появятся matching provider-approved mappings для real quarantine seed
  refs, построить real encrypted task import dry-run;
- либо перейти к следующему backend-блоку Gate 3: pagination/idempotency for
  history and provider message IDs.
