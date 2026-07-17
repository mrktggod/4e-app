# BACK-048 — runbook для dev/test аккаунтов

Используем только staging, пока Алексей отдельно не попросит production.

## Что умеет backend

В `4e-worker` добавлен закрытый admin-контур:

- `POST /admin/dev-accounts/seed`
- `DELETE /admin/dev-accounts/{email}`

Доступ только через `ADMIN_SECRET` в `Authorization: Bearer ...` или `x-admin-secret`.

`seed`:

- создаёт или обновляет dev/test пользователя по email;
- ставит `plan=paid`;
- продлевает доступ на долгий срок;
- помечает аккаунт как `devTestAccount=true`;
- по умолчанию заменяет задачи на стабильный seed-набор для smoke.

`delete`:

- удаляет только аккаунты с признаком `devTestAccount=true`;
- очищает их список задач.

## Пример payload для staging

Файл `dev-accounts.seed.json` держать локально, не коммитить.

```json
{
  "accessDays": 3650,
  "replaceTasks": true,
  "accounts": [
    {
      "email": "alexey.dev+4e@example.com",
      "name": "Алексей dev",
      "password": "<LOCAL_PASSWORD>",
      "role": "alexey-dev"
    },
    {
      "email": "yuriy.dev+4e@example.com",
      "name": "Юрий dev",
      "password": "<LOCAL_PASSWORD>",
      "role": "yuriy-dev"
    },
    {
      "email": "qa.dev+4e@example.com",
      "name": "QA dev",
      "password": "<LOCAL_PASSWORD>",
      "role": "qa-dev"
    }
  ]
}
```

## Фактически засеяно на staging

2026-07-07 Codex засеял и проверил через API smoke три dev/test аккаунта:

- `dev1.4e@example.com` — `plan=paid`, 5 seed-задач.
- `dev2.4e@example.com` — `plan=paid`, 5 seed-задач.
- `dev3.4e@example.com` — `plan=paid`, 5 seed-задач.

Пароли сохранены только локально вне git: `<project-root>\_local-secrets\back-048-staging-dev-accounts.json`.

## Seed-команда

```bash
curl -X POST "https://<STAGING_WORKER_HOST>/admin/dev-accounts/seed" \
  -H "Authorization: Bearer <ADMIN_SECRET>" \
  -H "Content-Type: application/json" \
  --data @dev-accounts.seed.json
```

## Удаление одного dev/test аккаунта

```bash
curl -X DELETE "https://<STAGING_WORKER_HOST>/admin/dev-accounts/alexey.dev%2B4e%40example.com" \
  -H "Authorization: Bearer <ADMIN_SECRET>"
```

## Что проверить после seed

1. Вход по email/password.
2. На Home видны seed-задачи.
3. Работает quick-add и редактирование задачи.
4. Открывается AI-чат.
5. Открывается голосовой сценарий.
6. Экран подписки не уводит в истёкший trial.

## Чего не делать

- Не хранить реальные пароли и `ADMIN_SECRET` в репозитории.
- Не seed-ить существующие реальные аккаунты без явного `allowExistingUser=true`.
- Не использовать production без отдельного подтверждения Алексея.
