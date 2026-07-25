# CODEX-025 — Login legacy password and frontend failure hardening

## Статус

Done: production Worker hardened, frontend pushed and verified on GitHub Pages.

## Симптом

Пользователь сообщил:

- приложение долго грузит до страницы входа;
- после ввода email/password кнопка долго ждёт;
- затем появляется “Ошибка соединения”.

## Гипотеза

Fake email login возвращал нормальный JSON, поэтому проблема могла проявляться
только на существующей legacy user-записи:

- user найден в KV;
- password credential имеет старый/неполный shape;
- `verifyPassword()` мог получить missing `storedHash`/`salt` и уронить Worker;
- frontend пытался `res.json()` из Cloudflare error page и показывал
  “Ошибка соединения”.

## Backend fix

- `4e-worker/worker.js`:
  - `verifyPassword()` возвращает `false`, если `salt`/`storedHash` отсутствуют
    или не строки;
  - legacy SHA-256 password migration запускается только если `passwordHash`
    похож на hex SHA-256;
  - login verification обёрнут в sanitized `try/catch`;
  - `/auth/login` теперь читает body через `readJsonObject(request)`, чтобы
    malformed JSON не превращался в Worker exception.
- Production Worker deployed:
  - `a1075c52-a9a5-43eb-b50f-3cf2536ae78e`.

## Backend verification

- `node --check 4e-worker/worker.js`
- synthetic Worker fetch с legacy users:
  - no user → `400`
  - missing pbkdf2 fields → `400`
  - invalid legacy password hash → `400`
  - null stored hash → `400`
- `wrangler deploy --dry-run --no-bundle`
- Production smoke:
  - malformed JSON `/auth/login` from `https://prod-app123.vk-apps.com` → `400`
  - fake `/auth/login` from `https://prod-app123.vk-apps.com` → `400`
  - health → `200`
  - hostile CORS origin → `403`
  - invalid VK launch payload → `400`

## Frontend fix

- `4e-app/index.html`
- `4e-app/vk.html`

Changes:

- added `withTimeout()`;
- added `readJsonSafe()`;
- VK Bridge init/user-info and auth fetches now have timeouts;
- email login/register no longer treats non-JSON server responses as generic
  connection errors.

## Frontend publish

- Safe temp clone:
  - `C:\Users\shelc\AppData\Local\Temp\4e-app-remote-audit`
- Commit pushed to `mrktggod/4e-app main`:
  - `34722335a56bf5831ec1d2dc038fd05a7bafbed4`
  - `fix: harden frontend login failures`

## GitHub Pages verification

- `https://mrktggod.github.io/4e-app/` contains `withTimeout`,
  `readJsonSafe`, `VKWebAppGetLaunchParams`.
- `https://mrktggod.github.io/4e-app/vk.html` contains `withTimeout`,
  `readJsonSafe`, `VKWebAppGetLaunchParams`.
- Pages `vk.html` Last-Modified: `Fri, 19 Jun 2026 17:36:23 GMT`.

## Safety

- No real user credentials used.
- No secret values read or printed.
- Production KV records were not read directly.

## Next

- User should fully close/reopen VK Mini App or hard-refresh the page.
- If the message changes from “Ошибка соединения” to “Неверный email или пароль”,
  the transport bug is fixed and the remaining issue is account/password state.
- If it still says “Ошибка соединения”, capture exact platform/screen:
  `vk.html` dedicated VK page vs main `index.html`, VK app vs browser.
