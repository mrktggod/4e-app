# CODEX-054 — VK auth screen fast boot

Дата: 2026-06-20
Статус: опубликовано в GitHub Pages

## Контекст

После перевода VK frontend на `https://edge.4-ai.site` реальный VK mobile smoke всё ещё показывал:

- приложение долго загружается до страницы входа;
- после ввода email/password появляется “Ошибка соединения”;
- diagnostics line в VK WebView показывал `ping:timeout` / `auth:TypeError` на `edge.4-ai.site`.

Отдельно зафиксировано важное ограничение: `4-ai.site` — чистовая версия под будущий накат после технических фиксов. Этот hotfix не должен трогать `4-ai.site` и не должен добавлять route `4-ai.site/api/*`.

## Причина

В `4e-app/vk.html` экран входа показывался только после цепочки ожиданий:

1. `window.load`;
2. `VKWebAppInit`;
3. проверка сохранённой сессии через `/auth/me`;
4. `VKWebAppGetUserInfo`;
5. VK auto-login.

Если VK WebView, внешний bridge script или API-запрос подвисали, пользователь слишком долго видел loader до формы входа. Это ухудшало UX и маскировало настоящую проблему сетевого доступа к `edge.4-ai.site`.

## Решение

- `vk-bridge` подключён как `async`, чтобы он не блокировал первичный HTML render.
- Bootstrap переведён с `window.load` на ранний `DOMContentLoaded`/immediate path.
- Форма входа показывается сразу, до потенциально долгой проверки сохранённого токена.
- Проверка `/auth/me` ограничена коротким timeout `2500ms`.
- Очистка старого токена теперь безопасная: не удаляет новый token, если пользователь успел вручную войти.
- VK auto-login переведён в background и больше не держит экран на loader.
- Build marker обновлён до `vk-auth-fast-boot-20260620-5`.

## Публикация

- Репозиторий: `mrktggod/4e-app`
- Commit: `ac7fe3c`
- Message: `fix: speed up VK auth screen`
- Live URL: `https://mrktggod.github.io/4e-app/vk.html`

## Проверка

Пройдены проверки:

- `node scripts\verify-vk-auth-retry-html.mjs`
- `node scripts\verify-privacy-center-html.mjs`
- `node scripts\verify-v2-privacy.mjs`
- `node scripts\verify-vk-auth-retry-html.mjs .tmp-4e-app-publish\vk.html`
- `git -c safe.directory=C:/Users/shelc/Documents/4/.tmp-4e-app-publish diff --check`
- Raw GitHub readback: новый marker и `async vk-bridge` есть.
- Live GitHub Pages readback: `fastBoot=True`, `asyncBridge=True`, `bootstrap=True`.

## Ограничения

Этот шаг ускоряет появление страницы входа и убирает лишние frontend wait-блокировки. Он не доказывает, что VK mobile WebView теперь может достучаться до `edge.4-ai.site`.

Если после этого diagnostics всё ещё показывает timeout/TypeError на `edge.4-ai.site`, следующий безопасный шаг:

1. проверить в кабинете VK Mini Apps список разрешённых/доверенных доменов;
2. добавить/подтвердить `mrktggod.github.io` и `edge.4-ai.site`, если такой whitelist есть;
3. если whitelist не решит проблему — завести отдельный технический same-origin контур, но не использовать для этого чистовой `4-ai.site` без явного решения.
