# CODEX-026 — `vk.ru/app54636698` CORS hotfix

## Статус

Done: production Worker CORS allowlist updated for the actual VK app URL family.

## Симптом

Пользователь открыл приложение по ссылке:

- `https://vk.ru/app54636698`

и сообщил, что после предыдущих fixes всё ещё видит “Ошибка соединения”.

## Диагностика

- `https://vk.ru/app54636698` redirects to:
  - `https://m.vk.ru/app54636698`
- Before fix:
  - preflight `Origin: https://vk.ru` → `403`
  - preflight `Origin: https://m.vk.ru` → `403`
  - preflight `Origin: https://app.vk.ru` → `403`
- This explains the browser-side connection error: request was blocked by CORS
  before the frontend could read a JSON response.

## Решение

- `4e-worker/worker.js` CORS allowlist extended:
  - `https://vk.ru`
  - `https://m.vk.ru`
  - `https://app.vk.ru`
- Existing allowed origins remain:
  - `https://vk.com`
  - `https://m.vk.com`
  - `https://app.vk.com`
  - `https://*.vk-apps.com`

## Deploy

- Production Worker deployed:
  - `95dcb053-0dfb-48f6-91b4-465ed2a5b766`

## Проверка после deploy

- `node --check 4e-worker/worker.js`
- `wrangler deploy --dry-run --no-bundle`
- Production smoke:
  - health → `200`
  - `Origin: https://vk.ru` preflight → `204`, login fake credentials → JSON `400`
  - `Origin: https://m.vk.ru` preflight → `204`, login fake credentials → JSON `400`
  - `Origin: https://app.vk.ru` preflight → `204`, login fake credentials → JSON `400`
  - `Origin: https://vk.com` preflight → `204`, login fake credentials → JSON `400`
  - `Origin: https://prod-app123.vk-apps.com` preflight → `204`, login fake credentials → JSON `400`

## Safety

- No real credentials used.
- No secret values read or printed.
- Production KV records were not read directly.

## Next

- User should fully close/reopen VK app at `https://vk.ru/app54636698`.
- If the UI now shows “Неверный email или пароль” or “Слишком много попыток”,
  the network/CORS bug is fixed and the remaining issue is account/password
  state or rate-limit.
