# CODEX-004 — KV task normalization before D1 import

## Статус

Dry-run готов. Production import заблокирован до owner reconciliation.

## Контекст

Первичный transform report показывал 295 legacy task records, но это число нельзя
напрямую использовать как количество D1 rows. Legacy Worker писал задачи в разные
KV buckets:

- `tasks:user_<userId>` для пользовательского списка;
- `tasks:user_<telegramId>` для Telegram-пользователя до/после mapping;
- `tasks:<chatId>` как mirror bucket для группового чата.

Из-за этого появились duplicate legacy ids и buckets без очевидного canonical owner.

## Что сделано

- Добавлен скрипт:
  - `scripts/plan-kv-task-normalization.ps1`
- Скрипт читает DPAPI snapshot, проверяет plaintext hash и пишет только sanitized report.
- Добавлен verifier:
  - `scripts/verify-task-normalization-report.mjs`
- Verifier проверяет:
  - action counts покрывают все source task records;
  - privacy notice присутствует;
  - report не содержит raw KV markers, email markers, session markers или task/message fields.

## Reconciliation rules

- Known user ids берутся из `user:*`.
- Telegram owner recovery берётся из `tg:*`, `tg_rev:*` и legacy `user.telegramId`.
- Conversation owner recovery берётся из `chats:*`, если chat bucket owner известен.
- Exact duplicates пропускаются.
- Unresolved owner records не импортируются, а попадают в quarantine.
- Invalid legacy deadline/date не теряются: в будущем остаются в `metadata_json`, `due_at = NULL`.

## Последний отчёт

- Report: `backups/kv-4e-tasks-20260619-011546.task-normalization-plan.json`

| Metric | Count |
|---|---:|
| task buckets | 26 |
| source task records | 295 |
| import | 83 |
| skip exact duplicate | 6 |
| quarantine owner missing | 200 |
| quarantine owner missing content conflict | 6 |
| duplicate legacy id groups | 132 |
| duplicate extra records | 136 |
| invalid deadline records | 41 |

## Проверки

- `powershell -ExecutionPolicy Bypass -File scripts/plan-kv-task-normalization.ps1`
- `node --check scripts/verify-task-normalization-report.mjs`
- `node scripts/verify-task-normalization-report.mjs`
- PowerShell syntax check for `scripts/plan-kv-task-normalization.ps1`

## Следующие шаги

1. Сгенерировать staging insert plan для 83 importable tasks. Done in `CODEX-005`.
2. Сделать отдельный owner reconciliation report для 206 quarantined records:
   - buckets resolvable через provider sync;
   - buckets that need manual decision;
   - buckets that should stay archived/quarantined.
3. Только после staging insert dry-run и ручного решения по quarantine готовить production D1 import.
