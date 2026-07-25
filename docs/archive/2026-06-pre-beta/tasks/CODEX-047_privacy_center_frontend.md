# CODEX-047 — frontend privacy center

Done: в основной frontend добавлен экран “Данные и память” и подключён к `/v2/privacy`.

## Контекст

- CODEX-045 добавил D1 schema/repository для privacy controls.
- CODEX-046 добавил локальные `/v2/privacy` routes.
- Следующий безопасный шаг — дать пользователю видимый экран управления данными до полного редизайна.

## Решение

- В `4e-app/index.html` добавлен пункт профиля “Данные и память”.
- Добавлен экран `#privacy-center`:
  - AI-обработка;
  - AI-память;
  - импорт переписок;
  - отправка сообщений;
  - срок хранения raw messages;
  - consent grant/revoke для персональных данных;
  - заявки на export/delete.
- Добавлен frontend D1 session bridge:
  - legacy `x-token` остаётся для старых routes;
  - `/v2/auth/legacy-session` получает Bearer token для `/v2/privacy`;
  - D1 token очищается при смене legacy token и logout.
- Профильная навигация стала менее хрупкой:
  - автопривязка больше не перетирает inline `onclick` пункты вроде “Чаты”;
  - новый screen добавлен в map как `privacy-center`.
- Добавлен verifier:
  `scripts/verify-privacy-center-html.mjs`.

## Проверка

- `node --check scripts/verify-privacy-center-html.mjs` прошёл.
- `node scripts/verify-privacy-center-html.mjs` прошёл:
  - privacy center screen `ok`;
  - profile navigation `ok`;
  - D1 session bridge `ok`;
  - v2 privacy client `ok`;
  - inline script syntax `ok`.
- Backend regression:
  - `node scripts/verify-v2-privacy.mjs` прошёл;
  - `node scripts/smoke-worker-v2-privacy-entrypoint.mjs` прошёл;
  - `node scripts/verify-v2-auth.mjs` прошёл;
  - `node scripts/verify-d1-schema.js` прошёл.

## Ограничения

- Remote migration `0006` не применялась.
- Frontend не публиковался на GitHub Pages.
- Пока production Worker не задеплоен с `/v2/privacy` + D1 migration `0006`,
  экран покажет мягкий статус “Privacy API пока недоступен”.
- Экран создаёт заявки на export/delete, но сами фоновые обработчики заявок ещё
  не реализованы.

## Следующий безопасный шаг

- Провести staging/deploy gate для migration `0006` и `/v2/privacy`.
- После этого опубликовать frontend и проверить экран в web/VK webview.
