# CODEX-007 — Staging D1 import for 83 verified legacy tasks

## Статус

Done: 83 verified task rows applied to staging D1. Production D1/KV не трогались.

## Scope

- Target: `restless-lab-d737-staging`
- D1 binding: `DB`
- D1 database id: `8ac20719-2558-4142-b9b9-e1c710d0e0c5`
- Source: encrypted task import plan
  - `backups/kv-4e-tasks-20260619-012046.task-import-plan.json.dpapi`

## Что сделано

- Добавлен applier:
  - `scripts/apply-task-import-plan-staging.ps1`
- Applier:
  - читает encrypted plan через DPAPI CurrentUser;
  - строит SQL только локально;
  - dry-run печатает только counts/hash;
  - умеет `-PrepareSqlOnly` для elevated Wrangler flow;
  - temp SQL создаётся вне repo и удаляется сразу после execution.

## Почему появился `-PrepareSqlOnly`

Elevated Wrangler process не смог расшифровать DPAPI CurrentUser plan:

- error: `Key not valid for use in specified state`

Решение:

1. В обычном user context подготовить temp SQL.
2. Elevated Wrangler читает temp SQL.
3. Temp SQL очищается и удаляется в `finally`.

## Ошибка и исправление

Первая попытка remote D1 execute упала из-за явного:

- `BEGIN TRANSACTION`
- `COMMIT`

D1 remote execute отклонил explicit transaction statements. По сообщению Wrangler, база возвращается в исходное состояние при неуспешном import.

Исправление:

- удалить explicit transaction statements из generated SQL;
- оставить `INSERT OR IGNORE`;
- повторить import.

## Pre-count

Перед import:

| Table | Count |
|---|---:|
| users | 2 |
| tasks | 2 |

## Applied

Wrangler result:

- processed queries: 90
- rows written: 261
- final bookmark: `0000000a-0000002c-0000508e-74a50f0441db1870ca762f3ecd0e24d1`

Generated rows:

- stub users: 6
- task rows: 83

## Post-count

| Metric | Count |
|---|---:|
| users | 8 |
| tasks | 85 |
| imported_tasks | 83 |
| imported_open | 75 |
| imported_done | 8 |
| imported_message_source | 80 |
| imported_import_source | 3 |
| invalid_import_metadata | 0 |

Integrity:

| Check | Count |
|---|---:|
| foreign_key_violations | 0 |
| missing_migration_metadata | 0 |
| missing_legacy_metadata | 0 |

## Safety notes

- Raw SQL contained production-derived task text/user ids.
- Temp SQL was removed.
- No `4e-task-import-*.sql` files remain in `%TEMP%`.
- No raw task text/user ids were printed to chat/docs.

## Next steps

1. Add a staging-only API smoke path to list imported task counts by authenticated stub/test user without exposing raw production data.
2. Continue owner reconciliation for 206 quarantined task records.
3. Do not import anything into production D1 until quarantine is resolved and cutover plan is approved.
