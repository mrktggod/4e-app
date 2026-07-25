# CODEX-008 — Quarantine owner reconciliation report

## Статус

Done: sanitized reconciliation report готов. D1/KV writes не выполнялись.

## Контекст

После staging import осталось `206` quarantined legacy task records. Их нельзя
автоматически импортировать, потому что owner не доказан.

## Что сделано

- Добавлен generator:
  - `scripts/plan-kv-task-quarantine-reconciliation.ps1`
- Добавлен verifier:
  - `scripts/verify-quarantine-reconciliation-report.mjs`
- Generator:
  - читает DPAPI KV snapshot;
  - повторяет normalization/action rules;
  - группирует quarantine records по hashed bucket owner;
  - пишет sanitized report;
  - пишет encrypted detail artifact для будущей ручной/локальной ревизии.

## Артефакты

- Sanitized report:
  - `backups/kv-4e-tasks-20260619-080314.quarantine-reconciliation.report.json`
- Encrypted detail metadata:
  - `backups/kv-4e-tasks-20260619-080314.quarantine-reconciliation.detail.metadata.json`
- Encrypted detail:
  - `backups/kv-4e-tasks-20260619-080314.quarantine-reconciliation.detail.json.dpapi`

## Result

| Metric | Count |
|---|---:|
| quarantinedRecords | 206 |
| quarantineBuckets | 16 |
| quarantine_owner_missing | 200 |
| quarantine_owner_missing_content_conflict | 6 |

Bucket kind counts:

| Bucket kind | Count |
|---|---:|
| chat_mirror_candidate | 5 |
| chat_mirror_exact | 9 |
| unknown_owner_bucket | 2 |

Owner status counts:

| Owner status | Count |
|---|---:|
| unresolved_global | 1 |
| unresolved_non_user_bucket | 6 |
| unresolved_user_wrapper | 9 |

Recommendations:

| Recommendation | Buckets |
|---|---:|
| resolve_conversation_owner_via_provider_sync_or_legacy_chat_mapping | 13 |
| archive_or_manual_review_global_bucket | 1 |
| resolve_wrapped_user_or_telegram_mapping | 1 |
| manual_owner_reconciliation_required | 1 |

## Checks

- `powershell -NoProfile -Command "[void][scriptblock]::Create(...)"` for generator syntax
- `powershell -ExecutionPolicy Bypass -File scripts/plan-kv-task-quarantine-reconciliation.ps1`
- `node --check scripts/verify-quarantine-reconciliation-report.mjs`
- `node scripts/verify-quarantine-reconciliation-report.mjs`

## Safety notes

- Sanitized report contains only short hashes, counts, field names, bucket kinds, owner statuses and recommendations.
- Encrypted detail contains raw bucket ids and task payloads.
- Do not commit decrypted detail.
- Do not paste decrypted detail into docs/chat.

## Next steps

1. Build a provider/conversation owner resolver for the 13 chat mirror buckets.
2. Build a narrow wrapped-user resolver for the 1 unresolved wrapper bucket.
3. Leave global/manual-only buckets archived unless explicit manual review is needed.
