# CODEX-046 — `/v2/privacy` routes

Done: privacy controls foundation подключён к локальному Worker API.

## Контекст

- CODEX-045 добавил D1 schema/repository для consent, privacy settings и data subject requests.
- Следующий безопасный шаг — дать frontend стабильный `/v2/privacy` API до редизайна экрана “Данные и память”.
- Production D1 и remote Worker в этом шаге не менялись.

## Решение

- Добавлен service:
  `4e-worker/src/worker/privacy/privacy-service.mjs`.
- Добавлены routes:
  `4e-worker/src/worker/privacy/privacy-routes.mjs`.
- `4e-worker/worker.js` подключает `/v2/privacy/*`.
- CORS methods расширены с `GET, POST, PATCH, OPTIONS` до
  `GET, POST, PUT, PATCH, OPTIONS`, чтобы `PUT /v2/privacy/settings` проходил
  браузерный preflight.
- Добавлены verifier/smoke:
  - `scripts/verify-v2-privacy.mjs`;
  - `scripts/smoke-worker-v2-privacy-entrypoint.mjs`.

## API scope

- `GET /v2/privacy/settings`
  - возвращает текущие настройки и последние consent-события.
- `PUT /v2/privacy/settings`
  - обновляет retention и opt-in флаги.
  - Guard: `aiMemoryEnabled=true` требует `aiProcessingEnabled=true`.
- `POST /v2/privacy/consents`
  - пишет новое consent-событие, не перетирая историю.
- `POST /v2/privacy/data-requests`
  - создаёт pending-заявку пользователя на export/delete/revoke-сценарий.

## Проверка

- `node --check 4e-worker/src/worker/privacy/privacy-service.mjs` прошёл.
- `node --check 4e-worker/src/worker/privacy/privacy-routes.mjs` прошёл.
- `node --check scripts/verify-v2-privacy.mjs` прошёл.
- `node scripts/verify-v2-privacy.mjs` прошёл:
  - unauthenticated `401`;
  - DB unavailable `503`;
  - settings defaults `ok`;
  - settings update `ok`;
  - invalid AI memory guard `ok`;
  - consent grant/revoke `ok`;
  - data subject request `ok`;
  - no-store/CORS `ok`.
- `node --check scripts/smoke-worker-v2-privacy-entrypoint.mjs` прошёл.
- `node scripts/smoke-worker-v2-privacy-entrypoint.mjs` прошёл:
  - options preflight `204`;
  - `PUT` in CORS methods `ok`;
  - unauthenticated `401`;
  - settings/consent/request flows `ok`;
  - DB unavailable `503`.
- Regression:
  - `node --check 4e-worker/worker.js` прошёл;
  - `node scripts/verify-v2-auth.mjs` прошёл;
  - `node scripts/smoke-worker-v2-messages-entrypoint.mjs` прошёл;
  - `node scripts/verify-privacy-controls-repository.mjs` прошёл;
  - `node scripts/verify-d1-schema.js` прошёл.

## Ограничения

- Remote D1 migration `0006` не применялась.
- Production/staging Worker не деплоился.
- UI privacy center ещё не подключён.
- Retention worker/job ещё не реализован.

## Следующий безопасный шаг

- Если продолжаем локально: подключить экран “Данные и память” к `/v2/privacy`.
- Если идём в staging/production: применить migration `0006`, сделать dry-run/deploy
  gate и только потом включать UI на реальном Worker.
