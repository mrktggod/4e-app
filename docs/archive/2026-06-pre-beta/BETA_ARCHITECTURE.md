# Целевая архитектура beta

## Принцип

Один человек может войти через Web, Telegram и VK, но внутри системы существует один канонический `user`. Внешние аккаунты — это подтвержденные идентичности, привязанные к нему. Сообщения разных провайдеров приводятся к общей модели conversation/message. AI не «обучается» на пользователе в скрытом смысле: он получает управляемую память из истории, которую пользователь может посмотреть, исправить и удалить.

## Компоненты

```text
Web / Telegram Mini App / VK Mini App
                  |
                  v
Cloudflare Worker API
  |-- Auth and account linking
  |-- Tasks and reminders
  |-- Unified inbox
  |-- AI context builder
  |-- Provider adapters
  |
  +--> D1: users, identities, chats, messages, tasks, memory
  +--> KV: rate limits and short-lived cache only
  +--> R2: voice, files and large attachments
  +--> Queue: imports, summaries, extraction and notifications
  +--> Vectorize: optional after beta, only if D1 full-text search is insufficient

Telegram bot / provider webhooks
                  |
                  +--> signed internal endpoints or service bindings
```

## Хранилища

### D1 — источник истины

Рекомендуемые таблицы:

- `users`: канонический профиль пользователя.
- `auth_identities`: `provider`, `provider_user_id`, verified metadata, unique constraint.
- `sessions`: хэш refresh/session token, устройство, срок, revoke timestamp.
- `account_link_challenges`: одноразовые подтверждения объединения аккаунтов.
- `integrations`: подключение провайдера и статус синхронизации.
- `integration_credentials`: только зашифрованные OAuth/access/refresh tokens с `key_version`.
- `contacts`: единая карточка человека и provider-specific identifiers.
- `conversations`: общий диалог независимо от провайдера.
- `conversation_members`: участники и права пользователя на диалог.
- `messages`: неизменяемые сообщения с provider message ID и idempotency constraint.
- `attachments`: metadata и ссылка на R2.
- `tasks`: нормализованные задачи со статусом, сроком и владельцем.
- `message_task_links`: происхождение задачи из сообщения.
- `reminders`: расписание и состояние доставки.
- `ai_threads`: пользовательские AI-диалоги.
- `ai_memories`: факты, предпочтения, люди, проекты и рабочие правила.
- `conversation_summaries`: периодические резюме длинных диалогов.
- `audit_events`: чувствительные события — привязка аккаунта, вход, экспорт, удаление.

Все выборки обязаны начинаться с канонического `user_id`; входной `chatId` никогда не является доказательством доступа.

### KV — только быстрое и временное

- rate limits;
- одноразовые nonce/challenge с коротким TTL;
- короткий cache безопасных derived-ответов;
- feature flags.

KV не хранит канонические аккаунты, платежи, историю сообщений или массивы задач.

### R2

- голосовые сообщения;
- изображения и документы;
- экспорт пользователя;
- резервные миграционные snapshots.

Объекты имеют случайные ключи; доступ выдаётся только после проверки владельца, через ограниченные по времени signed URLs или Worker streaming.

### Queue

- импорт сообщений из провайдера;
- извлечение задач и обещаний;
- создание conversation summaries;
- обновление AI memory;
- отправка уведомлений;
- повторные попытки provider API с idempotency key.

## Единая авторизация и объединение аккаунтов

### Каноническая модель

`users.id` не зависит от Telegram/VK/email. Таблица `auth_identities` содержит несколько подтвержденных способов входа в один аккаунт.

### Вход

- Web: email/password или magic link; сессия — Secure, HttpOnly cookie на том же домене, либо короткий access token в памяти + rotating refresh cookie.
- Telegram Mini App: клиент передает полный `initData`; Worker проверяет HMAC-подпись, `auth_date` и replay, затем находит identity.
- VK Mini App: Worker проверяет подписанные launch params или завершенный OAuth flow; одному `vk_user_id` соответствует одна identity.

### Связывание

Нельзя связывать аккаунт только по присланному ID или совпавшему email.

1. Пользователь уже авторизован в основном аккаунте.
2. Запускается provider-specific challenge.
3. Пользователь подтверждает владение вторым аккаунтом у провайдера.
4. Сервер проверяет подпись/код и показывает, какие данные будут объединены.
5. Одноразовая транзакция связывает identity или запускает контролируемое merge двух users.
6. Merge имеет audit event и не удаляет исходные данные до завершения проверки.

## Messenger Hub

### Общий контракт provider adapter

```text
connect()
disconnect()
verifyWebhook()
syncConversations(cursor)
syncMessages(conversation, cursor)
sendMessage(conversation, content)
normalizeConversation()
normalizeMessage()
refreshCredentials()
```

Каждый provider реализуется отдельно, но UI работает с едиными `conversations` и `messages`.

### Реалистичный scope beta

1. Telegram bot conversations — первый полноценный provider. Бот видит только чаты, где он присутствует; это нужно ясно сообщить пользователю.
2. VK community messages — второй provider после серверной OAuth/launch signature проверки.
3. WhatsApp — отдельный этап через официальный Business/Cloud API, не как чтение произвольного личного аккаунта.
4. Email — отдельный OAuth-коннектор; не хранить пароль от почты.
5. Instagram/MAX — показывать как unavailable/waitlist, пока не подтвержден доступный официальный API-сценарий.

Demo fallback в production должен быть удален. Для пустого или неподключенного inbox отображается честный empty state.

## AI memory без скрытого «обучения»

Для beta не требуется дообучать модель на каждом пользователе. Более безопасная и экономная схема — retrieval memory:

1. Хранить недавнюю переписку построчно в D1.
2. Каждые N сообщений создавать компактное summary в Queue.
3. Извлекать только полезные структурированные memories:
   - предпочтения общения;
   - активные проекты и цели;
   - важные люди и роли;
   - договоренности и повторяющиеся процессы;
   - пользовательские инструкции ассистенту.
4. Каждая memory содержит тип, значение, confidence, источник, created/updated/expiry и статус подтверждения.
5. При запросе собирать контекст из:
   - системных правил;
   - подтвержденного профиля;
   - summary текущего диалога;
   - последних сообщений;
   - нескольких релевантных memories.
6. Сначала использовать D1 indexes/FTS и структурированные фильтры. Vectorize подключать только после измерения качества поиска.
7. Дать пользователю экран «Что помнит 4»: просмотр, исправление, отключение и удаление памяти.

### Экономия

- не отправлять модели всю историю;
- summary строить асинхронно и пакетно;
- дедуплицировать сообщения и memories;
- дешёвая модель для классификации/извлечения, более сильная — только для сложного ответа;
- кешировать безопасные неизменяемые результаты;
- ограничивать длину контекста по бюджету пользователя;
- хранить raw messages по настраиваемой retention policy, summaries — дольше.

## Приватность и безопасность данных

- Явное согласие на импорт и AI-анализ переписки.
- Раздельные permissions для чтения, отправки и AI-обработки.
- OAuth/provider tokens шифруются AES-GCM прикладным ключом из Cloudflare Secret; в D1 лежит только ciphertext, IV и версия ключа.
- Секреты приложения никогда не попадают в Git, CI replacement или frontend.
- Пользователь может экспортировать и удалить аккаунт, сообщения и AI memory.
- Retention по умолчанию должна быть ограниченной; пользователь может выбрать более короткий срок.
- Логи не содержат текст сообщений, токены, пароли и provider payload целиком.
- Все webhook-и проверяют подпись и idempotency.
- Для staging и production используются разные базы, KV, secrets и provider apps.

## Предлагаемая структура репозитория

```text
apps/
  web/                  # Web + Telegram/VK shell
  telegram-bot/         # Bot adapter/runtime
workers/
  api/                  # Public API and auth
  jobs/                 # Queue consumers and scheduled work, optional split
packages/
  db/                   # D1 schema, migrations, repositories
  domain/               # users, tasks, messages, memory
  providers/            # Telegram/VK/etc adapters
  contracts/            # API schemas and shared types
  ui/                   # shared design tokens/components
docs/
```

TypeScript, schema validation, migrations и тесты должны стать обязательной частью CI. Deploy выполняется из исходников; скомпилированные bundles и секреты не являются source of truth.
