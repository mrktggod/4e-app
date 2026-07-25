# CODEX-044 — Ready task import approval pack

## Контекст

`CODEX-043` показал, что общий production KV→D1 import пока нужно держать на
паузе: 206 legacy records остаются в quarantine, 198 candidate records blocked.

Но внутри этого же статуса есть узкий безопасный scope: 83 task rows уже
механически готовы и прошли staging/local validation ранее. Перед любым
production write нужно отдельное approval-состояние, где явно сказано:

- что именно можно импортировать;
- что не входит в scope;
- какую фразу должен отправить владелец, чтобы разрешить следующий write-step.

## Сделано

- Добавлен approval pack builder:
  - `scripts/build-production-ready-task-import-approval-pack.mjs`.
- Добавлен verifier:
  - `scripts/verify-production-ready-task-import-approval-pack.mjs`.
- Выполнен read-only production D1 count check:
  - `users = 0`;
  - `tasks = 0`;
  - `auth_identities = 0`;
  - `sessions = 0`;
  - `rows_written = 0`;
  - `changed_db = false`.
- Создан отчёт:
  - `backups/production-ready-task-import-approval-20260620-142957.report.json`.

## Результат

- `decision.status = approval_required_ready_83_only`.
- Required approval phrase:
  `APPROVE_PRODUCTION_D1_IMPORT_READY_TASKS_83_ONLY`.
- Ready rows:
  - total `83`;
  - open `75`;
  - done `8`;
  - source `message`: `80`;
  - source `import`: `3`.
- Excluded:
  - quarantinedRecords `206`;
  - blockedConversationOwnerCandidates `198`;
  - quarantineDecisionRowsToWrite `0`.

## Проверка

- `node --check scripts/build-production-ready-task-import-approval-pack.mjs`
- `node --check scripts/verify-production-ready-task-import-approval-pack.mjs`
- `node scripts/verify-production-ready-task-import-approval-pack.mjs backups/production-ready-task-import-approval-20260620-142957.report.json`
- `git diff --check`

Verifier output:

```json
{
  "status": "approval_required_ready_83_only",
  "readyRows": 83,
  "quarantinedRecordsExcluded": 206,
  "productionD1Counts": {
    "users": 0,
    "tasks": 0,
    "auth_identities": 0,
    "sessions": 0
  }
}
```

## Важное ограничение

Этот шаг не импортирует данные. Он только готовит проверяемую точку approval.

До явной фразы `APPROVE_PRODUCTION_D1_IMPORT_READY_TASKS_83_ONLY` нельзя делать
production D1 writes.

## Следующий шаг

Если владелец выберет этот путь, следующий Codex-step должен быть отдельным:

1. fresh D1 export/rollback note;
2. production apply script в dry-run mode;
3. только затем, после подтверждения dry-run, controlled production write для
   83 rows;
4. post-apply verification.
