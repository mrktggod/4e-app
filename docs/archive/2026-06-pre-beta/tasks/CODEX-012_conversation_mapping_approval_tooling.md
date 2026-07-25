# CODEX-012 — Conversation mapping approval tooling

## Статус

Done: local/manual approval tooling готов. D1/KV/provider writes не выполнялись.

## Контекст

`CODEX-011` создал encrypted seed plan для `14` legacy conversation refs,
которые покрывают `13` unresolved buckets / `198` legacy task records.

Этот шаг добавляет безопасный local workflow:

1. создать sanitized approval template;
2. заполнить решения локально;
3. сгенерировать encrypted decision/write plan;
4. применять к D1 только отдельным будущим шагом после явного approval.

## Что сделано

- Добавлен generator approval template:
  - `scripts/build-conversation-mapping-approval-template.ps1`
- Добавлен verifier approval template:
  - `scripts/verify-conversation-mapping-approval-template.mjs`
- Добавлен decision plan builder:
  - `scripts/build-conversation-mapping-decision-plan.ps1`
- Добавлен verifier decision report:
  - `scripts/verify-conversation-mapping-decision-report.mjs`

## Артефакты

- Approval template:
  - `backups/kv-4e-tasks-20260619-114153.conversation-mapping-approval-template.json`
- No-op encrypted decision plan report:
  - `backups/kv-4e-tasks-20260619-114211.conversation-mapping-decision-plan.report.json`
- No-op encrypted decision plan metadata:
  - `backups/kv-4e-tasks-20260619-114211.conversation-mapping-decision-plan.metadata.json`
- No-op encrypted decision plan:
  - `backups/kv-4e-tasks-20260619-114211.conversation-mapping-decision-plan.json.dpapi`

## Result

Approval template:

| Metric | Count |
|---|---:|
| seedRefRows | 14 |
| pending | 14 |
| propose | 0 |
| approve | 0 |
| skip | 0 |

Decision plan:

| Metric | Count |
|---|---:|
| templateRows | 14 |
| rowsToWrite | 0 |

`rowsToWrite = 0` ожидаемо: template пока не содержит ручных решений.

## Checks

- `powershell -NoProfile -Command "[void][scriptblock]::Create(...approval-template...)"`
- `powershell -NoProfile -Command "[void][scriptblock]::Create(...decision-plan...)"`
- `node --check scripts/verify-conversation-mapping-approval-template.mjs`
- `node --check scripts/verify-conversation-mapping-decision-report.mjs`
- `powershell -ExecutionPolicy Bypass -File scripts/build-conversation-mapping-approval-template.ps1`
- `node scripts/verify-conversation-mapping-approval-template.mjs`
- `powershell -ExecutionPolicy Bypass -File scripts/build-conversation-mapping-decision-plan.ps1`
- `node scripts/verify-conversation-mapping-decision-report.mjs`

## Safety notes

- Approval template excludes raw legacy refs and full hashes.
- Template can contain `ownerUserId` / `conversationId` only after local manual fill.
- Decision plan output is DPAPI encrypted because it may contain owner IDs,
  conversation IDs and full `legacy_ref_hash`.
- This tooling does not apply SQL to staging or production.
- Applying a decision plan to D1 requires a separate explicit step.

## Next steps

1. Decide whether to fill template manually or first implement Telegram provider
   sync for the 6 medium-confidence refs.
2. If manual decisions are filled, run decision plan builder again and verify
   `rowsToWrite > 0`.
3. Only after explicit approval add a staging apply script for encrypted
   decision plans.
