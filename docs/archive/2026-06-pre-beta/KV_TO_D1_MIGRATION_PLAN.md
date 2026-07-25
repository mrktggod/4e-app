# KV → D1 Migration Plan

Обновлён: 2026-06-19. Основан на production KV snapshot `kv-4e-tasks-20260619-001346.json.dpapi` и sanitized report `kv-4e-tasks-20260619-001718.analysis.json`.

Важно: этот документ не содержит KV keys, пользовательские ID, email, тексты сообщений, задачи, токены или raw values.

## Текущая структура production KV

| Категория | Количество | Назначение |
|---|---:|---|
| `session:*` | 63 | Legacy bearer sessions |
| `user:*` | 10 | Legacy users: web, Telegram-linked, VK |
| `tasks:*` | 26 | Массивы задач, сгруппированные по owner/chat id |
| `messages:*` | 7 | Массивы сообщений, сгруппированные по chat id |
| `chats:*` | 3 | Массивы чатов пользователя |
| `tg:*` | 3 | Telegram id → user id |
| `tg_rev:*` | 5 | user id → Telegram id |
| `user_id:*` | 8 | user id → email mapping |
| `first_open:*` | 3 | Маркеры первого открытия |
| other | 1 | Legacy индекс/служебный массив |

## Целевая D1 схема

Используем уже созданные миграции:

- `users`
- `auth_identities`
- `sessions`
- `integrations`
- `contacts`
- `conversations`
- `conversation_members`
- `messages`
- `tasks`
- `message_task_links`
- `reminders`
- `ai_threads`
- `ai_messages`
- `password_credentials`
- `audit_events`

KV после миграции должен остаться только для cache/rate-limit/temporary challenges.

## Mapping v1

### Users

Источник: `user:*`, `tg:*`, `tg_rev:*`, `user_id:*`.

Правила:

- Создавать один canonical `users.id` из legacy `user.id`, если он есть.
- `display_name` брать из legacy `name`.
- `created_at` брать из `createdAt`, если есть; иначе использовать timestamp миграции.
- `status = active`.
- Telegram/VK/Web identities переносить в `auth_identities`.
- `profile_json` может хранить безопасный legacy profile snapshot без password/session/token fields.

Риски:

- В KV есть разные identity формы: web users с email, Telegram-linked users, VK users.
- `tg:*` и `tg_rev:*` могут расходиться по количеству, поэтому миграционный скрипт должен строить reconciliation report.

### Passwords

Источник: legacy `passwordHash`, `salt`, `hashVersion` внутри `user:*`.

Решение для beta:

- Не переносить legacy password hash в `password_credentials` автоматически, пока не подтверждён алгоритм legacy hashing.
- Варианты:
  1. добавить legacy verifier и делать rehash-on-login в новый PBKDF2 формат;
  2. или принудительно отправить web users через reset password flow при первом входе после D1 cutover.

Безопасный default: reset-on-first-login, если legacy algorithm не подтверждён.

### Sessions

Источник: `session:*`.

Правила:

- Production D1 sessions не должны хранить raw token.
- Legacy sessions можно не мигрировать и сделать planned logout при cutover.
- Если нужен бесшовный вход, миграционный скрипт должен хранить только hash старого token key, но raw token не выводить и не логировать.

Безопасный default: не мигрировать legacy sessions; пользователи перелогинятся после cutover.

### Tasks

Источник: `tasks:*`, массивы с полями:

- `id`
- `text`
- `done`
- `person`
- `date`
- `deadline`
- `direction`
- `type`
- `chatId`
- `chatName`
- `originalMsg`
- `assignedBy`
- `assignedByName`
- `source`
- `snoozed`
- `snoozeUntil`

Mapping:

- `tasks.id` ← legacy `id`, если уникален; иначе deterministic migration id.
- `tasks.user_id` ← owner из ключа `tasks:*` после reconciliation с users/mappings.
- `title` ← legacy `text`.
- `status` ← `done ? done : open`.
- `due_at` ← parsed `deadline` или `date`, если это валидный timestamp/date.
- `source` ← `message`, если есть `chatId/originalMsg`; иначе `manual`/`import`.
- Остальные legacy поля временно сохранять в `description` или future `metadata_json` миграцией схемы. Предпочтительно добавить `tasks.metadata_json` до production migration, чтобы не терять контекст.

Состояние схемы:

- `tasks.metadata_json` уже добавлен миграцией `0003_legacy_metadata.sql`, поэтому legacy context можно сохранить без расширения primary task columns.

### Chats and conversations

Источник: `chats:*`, массивы с полями:

- `id`
- `name`
- `type`
- `tgId`
- `preview`
- `ts`
- `addedAt`
- `updatedAt`

Mapping:

- `conversations.owner_user_id` ← owner из ключа `chats:*`.
- `provider = telegram`, если есть `tgId`; иначе `internal`.
- `provider_conversation_id` ← `tgId` или legacy `id`.
- `kind` ← `direct/group/channel` по legacy `type`, если можно определить; иначе `direct`.
- `title` ← `name`.
- `last_message_at` ← `ts` или `updatedAt`.
- Создать `contacts` и `conversation_members` только если есть достаточно данных; иначе оставить conversation без members до provider sync.

### Messages

Источник: `messages:*`, массивы с полями:

- `id`
- `chatId`
- `tgId`
- `from`
- `text`
- `ts`
- `isMe`
- `isBot`

Mapping:

- `messages.id` ← legacy `id`, если уникален.
- `conversation_id` ← conversation по legacy `chatId`/key.
- `provider_message_id` ← `tgId`, если есть.
- `direction`:
  - `outbound`, если `isMe = true` или `isBot = true`;
  - `inbound` иначе.
- `message_type = text`.
- `content_text` ← legacy `text`.
- `sent_at` ← `ts`, если валиден; иначе migration timestamp.
- `ingested_at` ← migration timestamp.

### AI history

Источник: `messages:ai_*` попадает в общую категорию `messages:*`, если есть.

Mapping:

- Если owner id начинается с AI chat convention, переносить в `ai_threads` + `ai_messages`.
- Иначе переносить в обычные `conversations/messages`.
- Перед production migration нужен dry-run report с количеством AI-like conversations.

### Telegram mappings

Источник: `tg:*`, `tg_rev:*`, legacy Telegram fields в `user:*`.

Mapping:

- `auth_identities.provider = telegram`.
- `provider_user_id` ← Telegram id.
- `username` ← `telegramUsername`, если есть.
- Reconciliation:
  - найти `tg:*`, для которых нет user;
  - найти `tg_rev:*`, для которых нет обратного `tg:*`;
  - найти users с `telegramId`, но без mapping.

### VK mappings

Источник: users с `vkId` и sessions с `vkId`.

Mapping:

- `auth_identities.provider = vk`.
- `provider_user_id` ← `vkId`.
- Не считать VK identity trusted до внедрения серверной проверки подписи launch params.

## Production migration gates

До записи в production D1:

1. Создать dry-run transform report без raw values:
   - source counts;
   - target row counts by table;
   - orphan counts;
   - duplicate ids;
   - invalid timestamps;
   - unknown task/message shapes.
2. Прогнать transform на staging D1.
3. Сравнить counts:
   - users/auth_identities;
   - tasks;
   - conversations/messages;
   - skipped legacy sessions/passwords.
4. Сделать выборочную ручную проверку через UI/staging test user без вывода приватных данных в docs.
5. Только затем создавать production D1 и выполнять controlled migration.

## Рекомендуемые следующие изменения схемы

Перед полноценной миграцией стоит добавить:

- `tasks.metadata_json TEXT` — для legacy `person`, `direction`, `chatName`, `assignedBy`, `snoozed`.
- `conversations.metadata_json TEXT` — для legacy provider/UI context.
- `messages.metadata_json TEXT` — для legacy `from`, `isMe`, `isBot`, migration notes.
- Возможно `users.legacy_json TEXT` или отдельную `migration_legacy_refs` таблицу, если нужно сохранить traceability без засорения бизнес-таблиц.

## Dry-run transform v1

Отчёт: `backups/kv-4e-tasks-20260619-002058.transform-plan.json`.

Планируемые target counts:

| Target | Count |
|---|---:|
| users | 10 |
| auth_identities | 14 |
| conversations | 24 |
| messages | 309 |
| tasks | 295 |

Сознательно skipped на первом cutover:

| Legacy data | Count | Причина |
|---|---:|---|
| sessions | 63 | raw token sessions безопаснее не мигрировать |
| password hashes | 7 | legacy algorithm ещё не подтверждён |

Предупреждения dry-run:

| Issue | Count | Решение |
|---|---:|---|
| duplicate task ids | 136 | использовать deterministic migration ids: owner bucket + legacy id + index/hash |
| task buckets without known owner | 22 | добавить owner reconciliation: bucket может быть не canonical user id, а chat/user wrapper |
| invalid/ambiguous task date fields | 41 | парсить best-effort, невалидные даты класть в `metadata_json`, `due_at = NULL` |

## Task normalization dry-run v2

Отчёт: `backups/kv-4e-tasks-20260619-011546.task-normalization-plan.json`.

Задача этого шага — не писать данные в D1, а понять, какие legacy `tasks:*`
можно безопасно превратить в canonical D1 tasks без риска привязать задачу к
не тому пользователю.

Новые правила reconciliation:

- `tasks:user_<knownUserId>` → canonical user bucket.
- `tasks:user_<telegramId>` → user через доверенный `tg:*` / `tg_rev:*`, только если canonical user найден.
- `tasks:<chatId>` → user через `chats:*`, если chat принадлежит known user.
- Неразрешённые chat/user buckets не импортируются автоматически.
- Дубликаты с одинаковым logical key пропускаются как exact duplicate.
- Legacy date/deadline, которые не удалось разобрать, сохраняются в `metadata_json`, а `due_at` остаётся `NULL`.

Sanitized result:

| Action | Count | Meaning |
|---|---:|---|
| import | 83 | Можно импортировать в D1 после staging insert dry-run |
| skip_exact_duplicate | 6 | Полные дубликаты, не нужны как отдельные rows |
| quarantine_owner_missing | 200 | Нет доказуемого owner mapping |
| quarantine_owner_missing_content_conflict | 6 | Есть конфликт по legacy id/content без доказуемого owner |

Классификация:

| Metric | Count |
|---|---:|
| task buckets | 26 |
| source task records | 295 |
| duplicate legacy id groups | 132 |
| duplicate extra records | 136 |
| content conflict groups | 125 |
| records with invalid deadline | 41 |
| records with parsed due date | 294 |

Вывод: production import пока нельзя делать “в лоб”. Следующий безопасный шаг —
сгенерировать staging insert plan только для 83 importable tasks и отдельно
сделать owner reconciliation report по 206 quarantined records без вывода raw
task text/user ids.

## Encrypted task import plan v1

Артефакты:

- Metadata: `backups/kv-4e-tasks-20260619-012046.task-import-plan.metadata.json`
- Encrypted plan: `backups/kv-4e-tasks-20260619-012046.task-import-plan.json.dpapi`

Важно:

- Full import plan зашифрован через DPAPI CurrentUser.
- Decrypted plan содержит production task text и user ids.
- Нельзя коммитить, логировать или вставлять decrypted rows в docs/chat.
- D1 writes не выполнялись.

Проверенный target:

| Metric | Count |
|---|---:|
| import rows | 83 |
| unique task ids | 83 |
| open tasks | 75 |
| done tasks | 8 |
| message-source tasks | 80 |
| import-source tasks | 3 |
| metadataTooLarge | 0 |
| titleTruncated | 0 |
| descriptionTruncated | 0 |

Проверки:

- `powershell -ExecutionPolicy Bypass -File scripts/build-kv-task-import-plan.ps1`
- `powershell -ExecutionPolicy Bypass -File scripts/verify-task-import-plan.ps1`

## Local SQLite validation for encrypted task import plan

Скрипты:

- `scripts/validate-task-import-plan-sqlite.ps1`
- `scripts/validate-task-import-plan-sqlite.mjs`

Проверка:

- DPAPI plan расшифровывается только в памяти.
- Plaintext plan не пишется на диск.
- Node получает plan через stdin.
- SQLite `:memory:` применяет реальные D1 migrations.
- Для FK создаются stub users.
- 83 rows вставляются в local `tasks`.
- `PRAGMA foreign_key_check` проходит.

Результат:

| Metric | Count |
|---|---:|
| inserted tasks | 83 |
| stub users | 6 |
| distinct task users | 6 |
| open tasks | 75 |
| done tasks | 8 |
| message-source tasks | 80 |
| import-source tasks | 3 |

Additional checks:

- `metadata_json = valid`
- `foreignKeys = ok`
- raw task text/user ids/metadata_json не печатаются

## Staging D1 import for verified task rows

Артефакт:

- Task card: `docs/tasks/CODEX-007_staging_task_import.md`

Состояние:

- 83 verified task rows applied to staging D1.
- 6 minimal stub users inserted with `INSERT OR IGNORE` to satisfy FK.
- Production D1/KV не трогались.

Перед import:

| Table | Count |
|---|---:|
| users | 2 |
| tasks | 2 |

После import:

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

Operational notes:

- Elevated Wrangler process could not decrypt DPAPI CurrentUser plan, so the safe path was: prepare temp SQL in normal user context, execute it with Wrangler, then delete temp SQL in `finally`.
- First D1 execute failed because explicit `BEGIN TRANSACTION` is not accepted by remote D1 execute; generated SQL now omits explicit transaction statements.

## Quarantine owner reconciliation report

Артефакты:

- Sanitized report: `backups/kv-4e-tasks-20260619-080314.quarantine-reconciliation.report.json`
- Encrypted detail metadata: `backups/kv-4e-tasks-20260619-080314.quarantine-reconciliation.detail.metadata.json`
- Encrypted detail: `backups/kv-4e-tasks-20260619-080314.quarantine-reconciliation.detail.json.dpapi`

Итог:

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

Recommendation counts:

| Recommendation | Buckets |
|---|---:|
| resolve_conversation_owner_via_provider_sync_or_legacy_chat_mapping | 13 |
| archive_or_manual_review_global_bucket | 1 |
| resolve_wrapped_user_or_telegram_mapping | 1 |
| manual_owner_reconciliation_required | 1 |

Вывод: большая часть quarantine — это не “плохие задачи”, а chat mirror buckets
без доказанного owner. Следующий технический шаг — owner resolver по
conversation/provider mapping, а не эвристики по тексту задач.

## Conversation/provider owner resolver

Артефакт:

- Sanitized report: `backups/kv-4e-tasks-20260619-081054.conversation-owner-resolver.report.json`

Итог:

| Metric | Count |
|---|---:|
| candidate buckets | 13 |
| candidate records | 198 |
| eligible for encrypted import plan | 0 |
| provider sync or manual mapping required | 13 buckets / 198 records |
| conflicting owner buckets | 0 |

Status counts:

| Status | Buckets |
|---|---:|
| provider_conversation_exists_without_owner_mapping | 6 |
| legacy_conversation_ref_without_message_or_owner_mapping | 7 |

Вывод: по текущему legacy KV нельзя доказать owner для этих chat mirror buckets
без provider sync или явного manual mapping. Автоматический import этих записей
пока запрещён: задача не в SQL-transform, а в создании доверенной связи
`legacy conversation ref → canonical user/conversation`.

## Legacy conversation mapping schema

Добавлена migration:

- `4e-worker/migrations/0004_legacy_conversation_mappings.sql`

Новая таблица:

- `legacy_conversation_mappings`

Назначение:

- хранить staging-first approval bridge для unresolved legacy conversation refs;
- связывать `legacy_ref_hash` с `owner_user_id` и опционально `conversation_id`;
- не хранить raw legacy chat ids/provider conversation ids;
- давать будущему import generator безопасный способ проверить, какие
  quarantined records можно разблокировать.

Staging status:

- migration применена к staging D1 `DB`;
- новая таблица пустая: `mapping_rows = 0`;
- production D1/KV не трогались.

## Conversation mapping seed plan

Артефакты:

- Sanitized report: `backups/kv-4e-tasks-20260619-113703.conversation-mapping-seed.report.json`
- Encrypted plan metadata: `backups/kv-4e-tasks-20260619-113703.conversation-mapping-seed.plan.metadata.json`
- Encrypted plan: `backups/kv-4e-tasks-20260619-113703.conversation-mapping-seed.plan.json.dpapi`

Итог:

| Metric | Count |
|---|---:|
| candidate buckets | 13 |
| candidate records | 198 |
| seed ref rows | 14 |

Seed plan не назначает owner и не пишет rows в D1. Он готовит encrypted набор
legacy refs для будущего approval flow. Sanitized report содержит только short
hashes/counts/statuses; raw refs и full hashes остаются внутри DPAPI artifact.

## Conversation mapping approval tooling

Артефакты:

- Approval template: `backups/kv-4e-tasks-20260619-114153.conversation-mapping-approval-template.json`
- Decision plan report: `backups/kv-4e-tasks-20260619-114211.conversation-mapping-decision-plan.report.json`
- Decision plan metadata: `backups/kv-4e-tasks-20260619-114211.conversation-mapping-decision-plan.metadata.json`
- Encrypted decision plan: `backups/kv-4e-tasks-20260619-114211.conversation-mapping-decision-plan.json.dpapi`

Итог:

| Metric | Count |
|---|---:|
| approval template rows | 14 |
| pending decisions | 14 |
| rowsToWrite | 0 |

`rowsToWrite = 0` ожидаемо: decisions ещё не заполнены. Tooling уже готово
принять ручные/provider decisions и сформировать encrypted write plan без
печати owner ids/full hashes/raw refs.

## Telegram provider sync mapping foundation

Добавлено:

- `4e-worker/src/worker/providers/telegram-provider-sync.mjs`
- `scripts/verify-telegram-provider-sync.mjs`

Назначение:

- использовать signed bot `register-chat` events как provider evidence;
- находить user через `auth_identities(provider='telegram')`;
- создавать/обновлять `integrations` и `conversations`;
- создавать approved `legacy_conversation_mappings` rows с
  `confidence = provider_verified`.

Safety:

- sync выключен по умолчанию;
- включается только при `ENABLE_D1_PROVIDER_SYNC === "1"`;
- production не трогался;
- deploy не выполнялся.

## Следующий технический шаг

`scripts/plan-kv-to-d1-transform.ps1` и `scripts/plan-kv-task-normalization.ps1` уже созданы. Следующий шаг:

- включить Telegram provider sync только в staging и провести signed bot smoke;
- добавить staging API/UI-safe verification path for imported rows без raw production data;
- не писать production D1 до ручного решения по quarantined legacy buckets.
