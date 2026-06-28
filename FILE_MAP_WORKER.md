# FILE MAP WORKER

Cloudflare Worker не находится в текущем checkout `4e-app`.

## Статус

| Пункт | Значение |
| --- | --- |
| Локальная папка | Не подключена |
| Ожидаемая зона | `4e-worker/worker.js`, `4e-worker/src/bot/`, migrations |
| Live Worker | `https://restless-lab-d737.shelckograff.workers.dev` |
| Деплой | `npx wrangler deploy` из отдельного worker-репозитория |

## Что известно из документации

- `/anthropic` — прокси к Claude, требует `x-token`.
- `/tasks` — задачи по токену без `chatId`.
- `/auth/vk` — VK авто-логин.
- `/payments/telegram-stars/invoice` — создаёт Telegram Stars invoice link для Mini App.
- `/payments/telegram-stars/complete` — подтверждает `successful_payment` от Telegram bot и активирует Premium.
- D1/privacy endpoints используются из `index.html` и `vk.html`.
- Реальные секреты не должны попадать в код; использовать placeholders и Secrets.

## Перед задачей по Worker

1. Подключить локальный worker-репозиторий или дать GitHub-доступ.
2. Создать/обновить карту `FILE_MAP_WORKER.md` уже по реальным файлам.
3. Проверить, что в `worker.js` нет реальных ключей.
4. Для деплоя использовать только настроенный wrangler-процесс.
