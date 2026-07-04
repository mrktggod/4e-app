# FILE MAP BOT

Telegram bot не находится в текущем checkout `4e-app`.

## Статус

| Пункт | Значение |
| --- | --- |
| GitHub repo | `mrktggod/4e-bot` |
| Локальная папка | Есть код в `<worker-repo-root>/src/bot/`, но не в текущем checkout `4e-app` |
| GitHub app access | Пока нет доступа |
| SSH access | Пока не настроен для этого репозитория |
| Деплой | Railway автодеплой после push |

## Что известно из документации

- Это отдельный Telegram-бот проекта.
- Исторически bot.js был разбит на модули `src/bot/`.
- Текущая npm entrypoint в локальном checkout: `src/bot/index.js`; подтверждения задач и callback-кнопки живут в `src/bot/handler.js`, сохранение задач — в `src/bot/tasks.js`.
- `src/bot/handler.js` теперь также обновляет roster участников (`msg.from`, `reply_to_message.from`, `new_chat_members`, `left_chat_member`), передаёт участников в Haiku и сохраняет `assigneeTgId` / `assigneeUsername` в задачу.
- Бот связан с Worker через задачи, напоминания и Telegram-сценарии.

## Перед задачей по bot

1. Проверить актуальность локального `<worker-repo-root>/src/bot/` или подключить отдельный clone `mrktggod/4e-bot`.
2. После подключения прочитать реальные `README.md`, `AGENTS.md` и карту файлов, если они есть.
3. Если карты нет, создать актуальный `FILE_MAP_BOT.md` уже в bot-репозитории.
4. Не менять bot-логику из `4e-app` без доступа к bot-репозиторию.
