# FILE MAP WORKER

Cloudflare Worker не находится в текущем checkout `4e-app`.

## Статус

| Пункт | Значение |
| --- | --- |
| Локальная папка | Есть отдельный checkout вне `4e-app`: `<worker-repo-root>` |
| Ожидаемая зона | `4e-worker/worker.js`, `4e-worker/src/bot/`, migrations |
| Live Worker | `https://restless-lab-d737.shelckograff.workers.dev` |
| Деплой | `npx wrangler deploy` из отдельного worker-репозитория |

## Что известно из документации

- `/anthropic` — прокси к Claude, требует `x-token`.
- `/transcribe` — принимает multipart audio с `x-token`, отправляет в OpenAI Whisper через `OPENAI_KEY`, возвращает `{ text }`.
- `/tasks` — задачи по токену без `chatId`.
- `/auth/vk` — VK авто-логин.
- `/auth/request-email-verification` — шлёт Resend-письмо для подтверждения email профиля и хранит token в D1/KV.
- `/auth/verify-email` — проверяет token, привязывает email к текущему `user.id` и возвращает `Этот email уже используется` при конфликте.
- `/v2/auth/legacy-session` — обменивает legacy `x-token` на D1-сессию; используется Telegram/VK/web фронтом перед privacy/identities.
- `/v2/auth/identities` — читает D1 identity graph по Bearer session.
- `/auth/identities` — временный legacy-алиас: по `x-token` поднимает D1-сессию и возвращает те же identities; нужен для совместимости старого `vk.html`.
- `/v2/privacy/settings` / `/v2/privacy/consents` / `/v2/privacy/data-requests` — privacy API поверх D1 Bearer session.
- `/payments/telegram-stars/invoice` — создаёт Telegram Stars invoice link для Mini App.
- `/payments/telegram-stars/complete` — подтверждает `successful_payment` от Telegram bot и активирует Premium.
- `/notifications/settings` — читает/сохраняет настройки уведомлений пользователя в D1 с KV fallback.
- `/briefings/check` — выдаёт bot scheduler список утренних брифингов по времени пользователя.
- `x-action: delete-task` — удаляет задачу по `taskId` из user/group KV-ключей; используется inline-кнопкой `✕` и перед пересохранением при `✏️`.
- `x-action: upsert-chat-members` / `get-chat-members` / `mark-chat-members-left` — D1-ростер участников чата для `SMART-001`; таблица `chat_members`, источник для резолва `assigneeTgId`.
- `migrations/0007_chat_members.sql` — создаёт D1-таблицу `chat_members` и индексы по `chat_id/last_seen` и `username`.
- D1/privacy endpoints используются из `index.html` и `vk.html`.
- Реальные секреты не должны попадать в код; использовать placeholders и Secrets.

## Перед задачей по Worker

1. Подключить локальный worker-репозиторий или дать GitHub-доступ.
2. Создать/обновить карту `FILE_MAP_WORKER.md` уже по реальным файлам.
3. Проверить, что в `worker.js` нет реальных ключей.
4. Для деплоя использовать только настроенный wrangler-процесс.
