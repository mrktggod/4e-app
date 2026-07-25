# CODEX-055 — VK email login recovery

Дата: 2026-06-20
Статус: опубликовано в GitHub Pages

## Контекст

После `CODEX-054` пользователь проверил VK mobile WebView на реальном устройстве:

- форма входа уже открывается;
- diagnostics line показывает `ping:200/2901ms`, значит `edge.4-ai.site` доступен;
- `auth:TypeError/10295ms` остаётся для POST `/auth/login`;
- при первом нажатии “Войти” показывается “Ошибка соединения”;
- при втором нажатии “Войти” пользователь входит.

## Вывод

Проблема сузилась: это уже не общий DNS/домен/GET timeout. VK WebView достаётся до Worker, но иногда теряет первый POST response от `/auth/login`.

Live-проверка снаружи подтвердила, что Worker отвечает корректно:

- `GET https://edge.4-ai.site/` с `Origin: https://mrktggod.github.io` → `200 OK`;
- `POST https://edge.4-ai.site/auth/login` с `Content-Type: text/plain` и body `{}` → быстрый `400`;
- оба ответа содержат `Access-Control-Allow-Origin: https://mrktggod.github.io`.

## Решение

В `4e-app/vk.html` добавлен recovery для email login:

- новый marker: `vk-auth-login-recovery-20260620-6`;
- добавлен `AUTH_LOGIN_RECOVERY_DELAY_MS = 900`;
- добавлена функция `recoverLoginSession(email, password)`;
- если основной `postLegacyAuth('/auth/login', ..., 1)` падает с network/TypeError/timeout, UI не сразу показывает ошибку, а делает короткий recovery login;
- если recovery вернул token — пользователь входит без второго ручного клика;
- register recovery переиспользует `recoverLoginSession()`, но принимает только успешный token, чтобы не создавать дубли и не маскировать ошибку регистрации.

## Публикация

- Репозиторий: `mrktggod/4e-app`
- Commit: `54a17bf`
- Message: `fix: recover VK email login`
- Live URL: `https://mrktggod.github.io/4e-app/vk.html`

## Проверка

Пройдены проверки:

- `node scripts\verify-vk-auth-retry-html.mjs`
- `node scripts\verify-privacy-center-html.mjs`
- `node scripts\verify-v2-privacy.mjs`
- `node scripts\verify-vk-auth-retry-html.mjs .tmp-4e-app-publish\vk.html`
- `git -c safe.directory=C:/Users/shelc/Documents/4/.tmp-4e-app-publish diff --check`
- Raw GitHub readback: `marker=true`, `recovery=true`, `button=true`.
- Live GitHub Pages readback: `marker=True`, `recovery=True`, `button=True`.

## Ограничения

Этот шаг не меняет Worker и не трогает чистовой `4-ai.site`.

Если после этого первый клик всё ещё покажет ошибку, следующий шаг — собирать более точную диагностику первого real login attempt: отдельно записать duration/error для primary attempt и recovery attempt, чтобы понять, падает ли recovery тоже или ошибка показывается до него.

## Ручной smoke

1. Полностью закрыть VK.
2. Открыть `https://vk.ru/app54636698`.
3. Убедиться, что marker `vk-auth-login-recovery-20260620-6`.
4. Ввести email/password и нажать “Войти” один раз.
5. Ожидаемо: кнопка может смениться на “Проверяем вход...”, затем приложение должно войти без второго нажатия.
