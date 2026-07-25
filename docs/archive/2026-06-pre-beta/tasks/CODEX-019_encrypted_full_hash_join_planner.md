# CODEX-019 — Encrypted full-hash join planner

## Статус

Done: read-only full-hash join planner создан, запущен и privacy-verified.

## Files

- `scripts/plan-encrypted-full-hash-join.ps1`
- `scripts/verify-encrypted-full-hash-join-report.mjs`
- `backups/encrypted-full-hash-join-20260619-105639.report.json`

## Что сделано

- Planner локально расшифровывает DPAPI seed plan и проверяет plaintext hash по
  metadata.
- Approved mappings читаются из staging D1 только read-only `SELECT`.
- Full hashes используются только in-process для join.
- Output report содержит только sanitized aggregate/match decisions.
- Verifier проверяет consistency, privacy markers и отсутствие full hashes в
  report.

## Result

- `status = blocked_approved_mappings_do_not_match_seed_full_hashes`
- `approvedRowsFromD1 = 2`
- `matchedSeedRows = 0`
- `candidateRecordsMatched = 0`
- `candidateRecordsStillBlocked = 198`
- `safeToWriteD1 = false`
- `safeToBuildEncryptedTaskImportDryRun = false`
- `privacy = ok`

## Проверки

- PowerShell syntax check:
  - `PS_SYNTAX_OK`
- Node syntax check:
  - `node --check scripts/verify-encrypted-full-hash-join-report.mjs`
- Report verifier:
  - `node scripts/verify-encrypted-full-hash-join-report.mjs backups/encrypted-full-hash-join-20260619-105639.report.json`

## Ошибки и решения

- Старый approved mapping report не содержал optional `syntheticTest`, а
  PowerShell `StrictMode` падал на прямом доступе к отсутствующему полю.
  Добавлен `Get-JsonValue`.
- Отдельный `powershell.exe` процесс не смог открыть DPAPI artifact
  (`Key not valid for use in specified state`). В текущем PowerShell-контексте
  Codex artifact расшифровался без вывода plaintext.
- Рабочий запуск planner-а:
  - `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`
  - `.\scripts\plan-encrypted-full-hash-join.ps1`

## Safety

- Production не затрагивался.
- Staging D1 только читался.
- DPAPI plaintext, raw legacy refs, Telegram/chat/user ids, task text,
  `metadata_json`, secrets и full hashes не печатались.
- Persistent synthetic staging mapping остаётся: он нужен для safety branch и
  может быть очищен командой
  `scripts/smoke-staging-telegram-provider-sync.ps1 -CleanupPersistentSynthetic`.

## Next

Done in `CODEX-020`: synthetic encrypted dry-run fixture построена без
production-derived artifacts.
