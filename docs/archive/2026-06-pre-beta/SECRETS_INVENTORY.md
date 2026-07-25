# Инвентарь ключей и конфигурации

Полные значения ключей намеренно не записаны в этот документ.

## Обнаружено

| Имя | Тип | Где находится | Статус | Действие |
|---|---|---|---|---|
| `ANTHROPIC_KEY` | Секретный API key | Cloudflare Worker Secret binding | Новый secret настроен; старое значение удалено из рабочих копий Worker | Отозвать старый ключ в Anthropic Console и проверить новый после безопасного deploy |
| `RESEND_KEY` | Секретный API key | Cloudflare Worker Secret binding | Удалён из `4e-worker/worker.js` и `worker.js`; production secret настроен, reset email smoke вернул `200` / `{"ok":true}`, inbox delivery подтверждён скриншотом Gmail | Не выводить значение; держать ключ только в Cloudflare Secrets |
| `CP_PUBLIC_ID` | Публичный ID CloudPayments widget | `4e-app/index.html:2643` и резервные копии | Клиентская тестовая конфигурация; не является секретом | Можно оставить для тестовой среды, вынести в public config |
| CloudPayments API secret | Серверный секрет для проверки webhook | Не найден | Не настроен | Добавить отдельным Cloudflare Secret до включения платежей |
| `BOT_TOKEN` | Telegram bot secret | Node bot читает из `process.env` | Значение в source не найдено | Сохранить в runtime secret хостинга бота |
| `BOT_API_TOKEN` | Telegram bot secret для Worker | Cloudflare Worker Secret binding | Настроен как `secret_text`; используется для HMAC bot→Worker и Telegram initData verification | Не выводить значение; держать синхронным с bot token |
| `VK_SECRET_KEY` | VK Mini App secret key | Cloudflare Worker Secret binding | Настроен как `secret_text`; значения не читаем и не записываем; invalid/legacy VK auth payloads возвращают контролируемый `400` после hotfix `97eddb50-0b09-4b4c-9184-d802a65aaa30` | Проверить valid login вручную из VK Mini App |
| `CF_API_TOKEN` | Cloudflare deploy token | Только ссылка на GitHub Secret в workflow | Значение в source не найдено | Оставить в GitHub Actions Secret с минимальными правами |
| `FROM_EMAIL` | Публичная конфигурация отправителя | Worker и workflow | Не секрет | Хранить в `vars`, не в Secrets |

## Cloudflare сейчас

- Worker Secrets: `ANTHROPIC_KEY`, `BOT_API_TOKEN` и `VK_SECRET_KEY` настроены как `secret_text`; значения недоступны для чтения.
- VK auth verifier задеплоен и блокирует неподписанный/legacy login; после hotfix `97eddb50-0b09-4b4c-9184-d802a65aaa30` старый payload `{ vk_user_id }` возвращает `400`, а не Worker exception.
- Текущий VK auth hardening deploy: `97eddb50-0b09-4b4c-9184-d802a65aaa30`; health `200`, hostile CORS `403`, invalid/legacy `/auth/vk` payloads `400`.
- `RESEND_KEY` настроен в production Cloudflare Worker Secrets; hardcoded ключ удалён из Worker, reset email production smoke вернул `200` / `{"ok":true}` для временного KV smoke user.
- Исправленный Worker опубликован 17 июня 2026, version `47597c26-ddc7-4d70-9fab-9ccbce791186`.
- Проверка после deploy: health endpoint — `200 OK`; `/anthropic` без сессии — `401`.
- Resend credential больше не встроен в Worker JavaScript; production deploy `3facaff2-b4d9-4a7f-ae72-eca11c02d6ea`.
- CI выполняет строковую подстановку секретов в bundle. Этот механизм необходимо удалить.

## CloudPayments

`CP_PUBLIC_ID` обязан быть доступен браузеру для запуска платежного widget и не защищает webhook.

Текущий `/payment/webhook`:

- не проверяет HMAC/подпись CloudPayments;
- доверяет `Status`, `AccountId`, `Amount`, `InvoiceId` и `Description` из запроса;
- может активировать тариф без подтвержденного уведомления провайдера.

До появления серверной проверки webhook платежный flow должен считаться тестовым и не выдавать реальные entitlements.

## Порядок исправления

1. Временно закрыть `/anthropic` и `/payment/webhook` строгой проверкой.
2. Создать новые Anthropic и Resend keys у провайдеров.
3. Записать их через `wrangler secret put`, не через GitHub string replacement.
4. Перевести Worker на bindings `env.ANTHROPIC_KEY`, `env.RESEND_KEY`, `env.BOT_API_TOKEN`.
5. Удалить значения из всех source/bundle/backup-файлов и проверить Git history перед публикацией.
6. Добавить secret scanning в CI.
7. Для CloudPayments добавить server secret и официальную проверку webhook; test/public ID оставить отдельной переменной окружения.
