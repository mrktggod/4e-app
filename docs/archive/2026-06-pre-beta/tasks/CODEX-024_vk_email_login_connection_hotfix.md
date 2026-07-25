# CODEX-024 — VK/email login “Нет соединения” hotfix

## Статус

Done: backend CORS hotfix deployed, frontend fallback pushed to GitHub Pages repo and verified on GitHub Pages.

## Симптом

Пользователь открыл приложение: экран загружается, но:

- VK auto-login не авторизует;
- email login показывает “Нет соединения” / “Ошибка соединения”.

## Диагностика

- Browser-like Node fetch к production `/auth/login` с allowed origins (`https://mrktggod.github.io`, `https://vk.com`) возвращает нормальный JSON:
  - `400`
  - `{"ok":false,"error":"Неверный email или пароль"}`
- CORS preflight для `https://mrktggod.github.io` и `https://vk.com` проходит.
- Вероятная причина live VK webview: реальный Origin может быть `https://*.vk-apps.com`, которого не было в Worker CORS allowlist.
- Дополнительный риск: frontend брал VK launch params только из `window.location.search`; в VK Mini App params могут приходить через hash/Bridge.

## Backend fix

- `4e-worker/worker.js`:
  - добавлен allowed origin `https://app.vk.com`;
  - добавлена проверка `isVkMiniAppsOrigin(origin)` для `https://vk-apps.com` и `https://*.vk-apps.com`.
- Production Worker deployed:
  - `1e3a82b2-26a3-4fbb-84d5-244cdfda34d5`.

## Backend verification

- `node --check 4e-worker/worker.js`
- `wrangler deploy --dry-run --no-bundle`
- Production smoke:
  - health → `200`
  - hostile origin `https://evil.example` → `403`
  - preflight `https://prod-app123.vk-apps.com` → `204`
  - fake `/auth/login` from `https://prod-app123.vk-apps.com` → `400`, with `Access-Control-Allow-Origin: https://prod-app123.vk-apps.com`

## Frontend fix

- `4e-app/index.html`
- `4e-app/vk.html`

Changes:

- added `getVkLaunchParams()`;
- launch params are collected from:
  - `window.location.search`;
  - `window.location.hash`;
  - `vkBridge.send('VKWebAppGetLaunchParams')`;
- VK auto-login sends the best signed candidate instead of only `window.location.search`.

## Frontend publish

- Safe publish used temp clone `C:\Users\shelc\AppData\Local\Temp\4e-app-remote-audit`.
- Only `index.html` and `vk.html` were changed.
- Commit pushed to `mrktggod/4e-app main`:
  - `d157bd982f155ddaa52baf7dd0f98a47dfa54da8`
  - message: `fix: support VK Mini App launch params`
- Raw GitHub verification confirms both files contain `getVkLaunchParams` and `VKWebAppGetLaunchParams`.

## GitHub Pages verification

- GitHub Pages refreshed after CDN cache expiry.
- `https://mrktggod.github.io/4e-app/` contains `getVkLaunchParams` and `VKWebAppGetLaunchParams`.
- `https://mrktggod.github.io/4e-app/vk.html` contains `getVkLaunchParams` and `VKWebAppGetLaunchParams`.
- Both published pages no longer contain the old `launchParams: window.location.search` only path.

## Safety

- No secrets printed or read.
- No real user credentials used.
- Login smoke used only fake credentials.
- Production KV data was not read directly.

## Next

- User should hard-refresh/reopen VK Mini App and retry:
  - email login should show a real auth result instead of “Нет соединения”;
  - VK auto-login should use signed launch params from search/hash/Bridge.
