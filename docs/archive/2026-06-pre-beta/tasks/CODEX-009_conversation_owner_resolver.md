# CODEX-009 — Conversation/provider owner resolver

## Статус

Done: sanitized resolver report готов. D1/KV/provider writes не выполнялись.

## Контекст

После quarantine reconciliation осталось `13` chat mirror buckets / `198`
legacy task records с рекомендацией
`resolve_conversation_owner_via_provider_sync_or_legacy_chat_mapping`.

Цель этого шага — проверить, можно ли доказать владельца этих buckets по
существующим legacy identity/conversation/message связям без эвристик по тексту.

## Что сделано

- Добавлен generator:
  - `scripts/plan-kv-task-conversation-owner-resolver.ps1`
- Добавлен verifier:
  - `scripts/verify-conversation-owner-resolver-report.mjs`
- Generator:
  - читает DPAPI KV snapshot;
  - читает sanitized quarantine report;
  - анализирует только buckets с conversation/provider recommendation;
  - ищет owner evidence только через trusted identities и known owned conversations;
  - игнорирует task text, message text, names и chat titles;
  - пишет sanitized report.

## Артефакт

- Sanitized report:
  - `backups/kv-4e-tasks-20260619-081054.conversation-owner-resolver.report.json`

## Result

| Metric | Count |
|---|---:|
| candidateBuckets | 13 |
| candidateRecords | 198 |
| eligibleForEncryptedImportPlanBuckets | 0 |
| eligibleForEncryptedImportPlanRecords | 0 |
| providerSyncOrManualMappingBuckets | 13 |
| providerSyncOrManualMappingRecords | 198 |
| blockedConflictingOwnerBuckets | 0 |

Status counts:

| Status | Buckets |
|---|---:|
| provider_conversation_exists_without_owner_mapping | 6 |
| legacy_conversation_ref_without_message_or_owner_mapping | 7 |

Recommended actions:

| Action | Buckets |
|---|---:|
| run_provider_sync_or_manual_conversation_owner_mapping | 6 |
| manual_conversation_owner_mapping_required | 7 |

## Checks

- `powershell -NoProfile -Command "[void][scriptblock]::Create(...)"`
- `powershell -ExecutionPolicy Bypass -File scripts/plan-kv-task-conversation-owner-resolver.ps1`
- `node --check scripts/verify-conversation-owner-resolver-report.mjs`
- `node scripts/verify-conversation-owner-resolver-report.mjs`

## Safety notes

- Report содержит только counts, statuses, booleans и short SHA-256 hashes.
- Report не содержит raw KV keys, user ids, chat ids, provider ids, emails,
  task text, message text, tokens, raw bucket ids, `metadata_json` или
  decrypted payloads.
- Автоматический импорт этих `198` records запрещён до provider sync или
  явного manual mapping.

## Вывод

Из текущего legacy KV нельзя безопасно доказать owner для этих `13` buckets.
Следующий безопасный шаг — не импорт, а схема manual/provider mapping:

1. построить staging-only mapping table/report для legacy conversation refs;
2. подключить Telegram provider sync так, чтобы он создавал conversations с
   проверенным owner;
3. только после этого строить encrypted import plan для разблокированных tasks.
