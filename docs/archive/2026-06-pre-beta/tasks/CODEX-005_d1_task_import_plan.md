# CODEX-005 — Encrypted D1 task import plan

## Статус

Done: локальный DPAPI-encrypted import plan готов и проверен. D1 writes не выполнялись.

## Контекст

После CODEX-004 стало понятно, что из 295 legacy task records безопасно
импортируемы только 83. Этот шаг подготовил реальные rows для будущего staging
insert dry-run, но не раскрывает task text/user ids в docs или stdout.

## Что сделано

- Добавлен генератор:
  - `scripts/build-kv-task-import-plan.ps1`
- Добавлен verifier:
  - `scripts/verify-task-import-plan.ps1`
- Генератор:
  - читает DPAPI snapshot production KV;
  - проверяет snapshot plaintext hash;
  - повторяет owner normalization/reconciliation;
  - строит rows для D1 `tasks`;
  - шифрует полный import plan через DPAPI CurrentUser;
  - пишет только sanitized metadata с counts/hash.
- Verifier:
  - расшифровывает план локально;
  - проверяет plaintext hash;
  - проверяет target table/columns;
  - проверяет row count, unique ids, enums, timestamps;
  - парсит `metadata_json`;
  - печатает только counts.

## Артефакты

- Metadata:
  - `backups/kv-4e-tasks-20260619-012046.task-import-plan.metadata.json`
- Encrypted plan:
  - `backups/kv-4e-tasks-20260619-012046.task-import-plan.json.dpapi`

## Результат проверки

| Metric | Count |
|---|---:|
| rowCount | 83 |
| unique task ids | 83 |
| unique content hashes | 82 |
| open tasks | 75 |
| done tasks | 8 |
| message-source tasks | 80 |
| import-source tasks | 3 |
| metadataTooLarge | 0 |
| titleTruncated | 0 |
| descriptionTruncated | 0 |

## Checks

- `powershell -ExecutionPolicy Bypass -File scripts/build-kv-task-import-plan.ps1`
- `powershell -ExecutionPolicy Bypass -File scripts/verify-task-import-plan.ps1`
- PowerShell syntax check for both scripts

## Safety notes

- Decrypted import plan contains production task text and user ids.
- Do not commit decrypted content.
- Do not paste decrypted content into chat/docs.
- Do not apply to staging D1 until user explicitly approves using production-derived task data in staging.

## Next steps

1. Create a separate dry-run applier that can validate this encrypted plan against local SQLite/D1 schema without logging rows. Done in `CODEX-006`.
2. After explicit approval, apply only these 83 rows to staging D1.
3. Continue owner reconciliation for 206 quarantined records.
