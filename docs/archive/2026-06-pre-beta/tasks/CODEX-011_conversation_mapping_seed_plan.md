# CODEX-011 — Conversation mapping seed plan

## Статус

Done: encrypted mapping seed plan готов. D1/KV/provider writes не выполнялись.

## Контекст

`CODEX-009` и `CODEX-010` подготовили безопасный путь для `13` unresolved
conversation buckets / `198` legacy task records:

1. owner нельзя доказать из legacy KV автоматически;
2. staging D1 уже имеет таблицу `legacy_conversation_mappings`;
3. нужен seed plan, который можно использовать для ручного/provider approval.

## Что сделано

- Добавлен generator:
  - `scripts/build-conversation-mapping-seed-plan.ps1`
- Добавлен verifier:
  - `scripts/verify-conversation-mapping-seed-report.mjs`
- Generator:
  - читает DPAPI KV snapshot;
  - читает sanitized conversation owner resolver report;
  - строит seed rows для unresolved legacy conversation refs;
  - пишет encrypted plan с raw legacy refs;
  - пишет sanitized report без raw refs/full hashes/user ids/chat ids/task text/message text.

## Артефакты

- Sanitized report:
  - `backups/kv-4e-tasks-20260619-113703.conversation-mapping-seed.report.json`
- Encrypted plan metadata:
  - `backups/kv-4e-tasks-20260619-113703.conversation-mapping-seed.plan.metadata.json`
- Encrypted plan:
  - `backups/kv-4e-tasks-20260619-113703.conversation-mapping-seed.plan.json.dpapi`

## Result

| Metric | Count |
|---|---:|
| candidateBuckets | 13 |
| candidateRecords | 198 |
| seedRefRows | 14 |

Provider hints:

| Provider hint | Rows |
|---|---:|
| telegram | 13 |

Resolver status counts:

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
- `powershell -ExecutionPolicy Bypass -File scripts/build-conversation-mapping-seed-plan.ps1`
- `node --check scripts/verify-conversation-mapping-seed-report.mjs`
- `node scripts/verify-conversation-mapping-seed-report.mjs`

## Safety notes

- Sanitized report contains only short hashes, counts, statuses, booleans and
  provider hints.
- Full raw legacy refs are only inside the DPAPI encrypted plan.
- Full legacy ref hashes are not included in the sanitized report.
- Seed plan does not approve mappings and does not write to staging D1.
- Only future `approved` rows in `legacy_conversation_mappings` may unlock
  quarantined task import.

## Next steps

1. Add local/manual approval tooling that reads encrypted seed plan and creates
   proposed/approved mapping SQL only after explicit owner decision.
2. Prefer provider sync for the 6 buckets with existing message evidence.
3. Keep the 7 low-confidence buckets manual-only until owner is proven.
