# CODEX-006 — Local SQLite validation for encrypted task import plan

## Статус

Done: encrypted task import plan проходит локальную D1-shape проверку. Staging/production D1 writes не выполнялись.

## Что сделано

- Добавлен Node validator:
  - `scripts/validate-task-import-plan-sqlite.mjs`
- Добавлен PowerShell DPAPI wrapper:
  - `scripts/validate-task-import-plan-sqlite.ps1`

## Как работает

1. PowerShell wrapper расшифровывает `*.task-import-plan.json.dpapi` через DPAPI CurrentUser.
2. Plaintext plan не пишется во временный файл.
3. JSON передаётся в Node через stdin.
4. Node поднимает SQLite `:memory:`.
5. Node применяет все D1 migrations из `4e-worker/migrations`.
6. Для FK-проверки создаются stub users с теми же ids, что в import plan.
7. 83 task rows вставляются в таблицу `tasks`.
8. Проверяются:
   - target columns;
   - `tasks.metadata_json`;
   - task ids uniqueness;
   - status/source counts;
   - JSON validity for `metadata_json`;
   - `PRAGMA foreign_key_check`.

## Результат

| Metric | Count |
|---|---:|
| insertedTasks | 83 |
| stubUsers | 6 |
| distinctTaskUsers | 6 |
| open tasks | 75 |
| done tasks | 8 |
| message-source tasks | 80 |
| import-source tasks | 3 |

Additional checks:

- `metadata_json`: valid
- foreign keys: ok
- plaintext hash: `532c948c5feb6d934494616ae7fe6e0d4ab720695ee98aa28118623895b25a23`

## Checks

- `node --check scripts/validate-task-import-plan-sqlite.mjs`
- PowerShell syntax check for `scripts/validate-task-import-plan-sqlite.ps1`
- `powershell -ExecutionPolicy Bypass -File scripts/validate-task-import-plan-sqlite.ps1`

## Safety notes

- Validator does not print task titles, user ids, `metadata_json`, or raw values.
- Validator does not write decrypted plan to disk.
- Validator does not write to staging or production D1.

## Next steps

1. Ask for explicit approval before applying production-derived task rows to staging D1. Done.
2. Build a staging applier that reads the same encrypted plan, inserts rows, and prints only counts. Done in `CODEX-007`.
3. Continue quarantine reconciliation for the remaining 206 task records.
