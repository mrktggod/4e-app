# REPORT: продление подписки Лёхе — 2026-08-03

Status: DONE

## Запрос

Алексей попросил продлить подписку Лёхе на 1 год.

Telegram ID: `208649935`

## Что проверено

- App checkout: `X:\Projects\4-ai-secretary\app`, ветка `feat/admin-tariff-api`, рабочее дерево чистое.
- Worker checkout найден: `X:\Projects\4-ai-secretary\worker`.
- Worker checkout не трогался: он на ветке `codex/support-endpoint-api-worker` и содержит незакоммиченные изменения:
  - `worker.js`
  - `scripts/support-endpoint-smoke.mjs`
- В worker уже есть штатный admin API:
  - `GET /admin/users?q=...`
  - `PUT /admin/users/{userId}/plan`
- Авторизация admin API идёт через `ADMIN_SECRET` в `Authorization: Bearer ...` или `x-admin-secret`.
- В текущем окружении `ADMIN_SECRET`, `PROD_ADMIN_SECRET`, `WORKER_ADMIN_SECRET`, `STAGING_ADMIN_SECRET` не заданы.

## Почему сначала не было выполнено автоматически

Это реальное изменение доступа конкретного пользователя. Без `ADMIN_SECRET` admin API вернёт отказ. Обходить admin API прямой правкой базы нельзя: worker сохраняет пользователя через KV и синхронизацию D1, поэтому ручной SQL может сделать рассинхрон.

## Выполнено 2026-08-03

Алексей сохранил `ADMIN_SECRET` в Windows user-level environment. Codex подтянул значение только в память текущей команды, не выводил секрет и не записывал его в файлы.

Через штатный admin API выполнено:

1. `GET https://edge.4-ai.site/admin/users?q=208649935`
2. `PUT https://edge.4-ai.site/admin/users/{userId}/plan` с телом `{"plan":"paid","days":365}`

Результат API:

| Поле | Значение |
| --- | --- |
| ok | `true` |
| user id | `553d16e8-ba3e-47ce-a8c8-d35f084fb8eb` |
| email | `tg_208649935@telegram.local` |
| telegramId | `208649935` |
| plan | `paid` |
| daysLeft | `365` |
| entitlement.status | `active` |
| accessUntil / trialEndsAt | `1817310677598` |

## Безопасная команда для владельца секрета

Выполнить в PowerShell, где уже задан `ADMIN_SECRET`. Секрет не писать в чат и не коммитить.

```powershell
$tg = '208649935'
$base = 'https://edge.4-ai.site'
$headers = @{ Authorization = "Bearer $env:ADMIN_SECRET" }

$users = Invoke-RestMethod -Method GET -Uri "$base/admin/users?q=$tg" -Headers $headers
$user = @($users | Where-Object { "$($_.telegramId)" -eq $tg })[0]

if (-not $user) {
  throw "User with telegramId $tg not found"
}

$body = @{ plan = 'paid'; days = 365 } | ConvertTo-Json -Compress
$updated = Invoke-RestMethod -Method PUT -Uri "$base/admin/users/$($user.id)/plan" -Headers $headers -ContentType 'application/json' -Body $body

$updated.user | Select-Object id,email,telegramId,plan,daysLeft,trialEndsAt,entitlement
```

## Что должно получиться

- `plan` должен стать `paid`.
- `daysLeft` должен увеличиться примерно на 365 дней от текущей даты или от текущего активного срока, если он уже был больше сегодняшнего.
- `telegramId` в ответе должен быть `208649935`.

Фактически это получилось.

## Что сказать Codex, если не получилось

- Если user not found: "Лёха не найден по Telegram ID 208649935".
- Если 401/403: "Нет или неверный ADMIN_SECRET".
- Если plan не стал paid: прислать только статус ошибки и безопасные поля ответа без секрета.

## Guardrails

Runtime-код, production deploy, `main`, цены, платежи, entitlement-логика и секреты не менялись.
