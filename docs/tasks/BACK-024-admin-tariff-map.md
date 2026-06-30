# BACK-024 — Карта управления тарифами (основа админ-кабинета)

**Приоритет:** P2  
**Ответственный:** Codex  
**Ветка:** `feat/admin-tariff-api`  
**Одна задача за сессию**

## Контекст

Сейчас изменение плана пользователя делается вручную через wrangler KV команды в терминале. Нужен API-слой, на котором позже построим веб-интерфейс админ-кабинета.

## Что нужно сделать

### 1. Эндпоинт GET `/admin/users`

Возвращает список всех пользователей из KV (`user:*` ключи):

```json
[
  {
    "id": "1efd3fc2-...",
    "email": "shelckograff@gmail.com",
    "name": "Юрий",
    "telegramId": "267468814",
    "vkId": "109496030",
    "plan": "paid",
    "trialEndsAt": 1785440551959,
    "trialActive": true,
    "daysLeft": 28,
    "createdAt": 1780085958432
  }
]
```

### 2. Эндпоинт GET `/admin/users/:id`

Возвращает одного пользователя по id + количество задач из `app_task_lists`.

### 3. Эндпоинт PUT `/admin/users/:id/plan`

Тело запроса:
```json
{ "plan": "paid", "days": 30 }
```

Логика:
- Читает объект пользователя из KV
- Если `plan === "paid"` — продлевает от текущего `trialEndsAt` (или от now если уже истёк)
- Если `plan === "trial"` — сбрасывает к trial + days дней от now
- Сохраняет обратно в KV
- Возвращает обновлённый объект

### 4. Защита

Все `/admin/*` эндпоинты требуют заголовок:
```
Authorization: Bearer <ADMIN_SECRET>
```

`ADMIN_SECRET` читать из `env.ADMIN_SECRET` (добавить в wrangler.toml как secret и через `wrangler secret put ADMIN_SECRET`).

При неверном токене → 401.

### 5. Формат ошибок

```json
{ "error": "Unauthorized" }
{ "error": "User not found" }
```

## Файлы для чтения

1. `worker.js` — найти роутер запросов и паттерн добавления эндпоинтов
2. `wrangler.toml` — добавить `ADMIN_SECRET` в vars/secrets секцию
3. `AGENTS.md` — правила

## Критерий готовности

- `GET /admin/users` с верным `ADMIN_SECRET` возвращает список пользователей
- `PUT /admin/users/:id/plan` с `{plan:"paid", days:30}` обновляет KV и возвращает обновлённый объект
- Без `ADMIN_SECRET` → 401
- Тест через curl или Postman задокументирован в WORK_LOG

## После выполнения

Обновить `pm/backlog.md` (BACK-024 → Ready for QA) и добавить запись в `shared/WORK_LOG.md`.
