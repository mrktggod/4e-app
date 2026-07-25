# CODEX-003 — D1 `/v2/tasks` foundation

## Статус

In progress: staging foundation готов, production migration не начата.

## Что сделано

- Добавлен D1 task repository: `4e-worker/src/worker/data/task-repository.mjs`.
- Добавлен service слой с валидацией: `4e-worker/src/worker/tasks/task-service.mjs`.
- Добавлены HTTP routes: `4e-worker/src/worker/tasks/task-routes.mjs`.
- Worker подключает:
  - `GET /v2/tasks`
  - `POST /v2/tasks`
  - `GET /v2/tasks/:id`
  - `PATCH /v2/tasks/:id`
- `/v2/tasks` использует D1 Bearer sessions из `/v2/auth`.
- Ownership enforced: пользователь получает только свои задачи.
- CORS обновлён для v2 browser requests:
  - `Authorization` в `Access-Control-Allow-Headers`.
  - `PATCH` в `Access-Control-Allow-Methods`.
- Исправлен auth-service bug: `authenticate()` теперь возвращает `user_id`, а не `session.id`.

## Проверки

- `node --check 4e-worker/worker.js`
- `node --check 4e-worker/src/worker/data/task-repository.mjs`
- `node --check 4e-worker/src/worker/tasks/task-service.mjs`
- `node --check 4e-worker/src/worker/tasks/task-routes.mjs`
- `node scripts/verify-auth-repository.mjs`
- `node scripts/verify-v2-tasks.mjs`
- `node scripts/verify-d1-schema.js`
- `wrangler deploy --dry-run --no-bundle --config wrangler.staging.toml`

## Staging deploy

- Worker: `restless-lab-d737-staging`
- Version ID: `92f678c8-da08-4932-a844-0834f4389d8d`
- URL: `https://restless-lab-d737-staging.shelckograff.workers.dev`

## Edge smoke-test

- `/v2/auth/register` test user: ok.
- CORS preflight `/v2/tasks` with `Authorization, Content-Type`: `204`.
- `POST /v2/tasks`: created `open` task.
- `GET /v2/tasks`: returned created task.
- `PATCH /v2/tasks/:id` with `status=done`: returned `done` and `completedAt`.

## Следующие шаги

1. Решить legacy task conflicts из `backups/kv-4e-tasks-20260619-002058.transform-plan.json`:
   - duplicateTaskIds: 136
   - taskBucketsWithoutKnownOwner: 22
   - invalidTaskDateFields: 41
2. Добавить idempotency/import metadata для KV→D1 migration.
3. Сделать dual-read/dual-write план для `/tasks` → `/v2/tasks`.
4. После ручного добавления `VK_SECRET_KEY` и `RESEND_KEY` повторить live auth/email smoke.
5. Только после этого проектировать production D1 cutover.
