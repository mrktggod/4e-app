# CODEX-027 — VK mobile WebView `X-Requested-With` auth hotfix

Дата: 2026-06-19

## Симптом

Пользователь повторно проверил VK Mini App после `vk.ru` CORS hotfix:

- web/desktop вход по ссылкам работает;
- мобильное приложение VK всё ещё показывает “Ошибка соединения”;
- ошибка воспроизводится и на входе, и на регистрации.

## Диагностика

- Живая страница `https://mrktggod.github.io/4e-app/vk.html` актуальна и отправляет
  `/auth/login` и `/auth/register` на production Worker.
- `Origin: https://mrktggod.github.io` и `Origin: https://m.vk.ru` preflight проходят.
- Мобильный WebView на Android может добавлять к cross-origin запросам заголовок
  `X-Requested-With`, например `com.vkontakte.android`.
- До hotfix production Worker отвечал на такой preflight без
  `X-Requested-With` в `Access-Control-Allow-Headers`, из-за чего браузерный
  fetch блокировался до чтения JSON-ответа и frontend показывал “Ошибка
  соединения”.
- Дополнительно найдено, что `/auth/register` всё ещё использовал прямой
  `request.json()` и мог превращать malformed body в Cloudflare `1101`, вместо
  контролируемого JSON `400`.

## Решение

В `4e-worker/worker.js`:

- добавлен `X-Requested-With` в `Access-Control-Allow-Headers`;
- `/auth/register` переведён на общий безопасный `readJsonObject(request)`, как
  `/auth/login` и `/auth/vk`.

Production Worker deployed:

- `31408d94-050f-417a-8d8a-a1ad7ade621b` — CORS headers hotfix;
- `c2f597c9-8828-4f4e-994f-e0a243fd2da5` — финальный hotfix с safe JSON для
  `/auth/register`.

## Проверка

- `node --check 4e-worker/worker.js` прошёл.
- `wrangler deploy --dry-run --no-bundle` прошёл.
- Live production preflight:
  - `Origin: https://mrktggod.github.io`;
  - `Access-Control-Request-Headers: content-type,x-requested-with`;
  - status `204`;
  - `Access-Control-Allow-Headers` содержит `X-Requested-With`.
- Live production preflight для `Origin: https://m.vk.ru` также вернул `204` и
  `X-Requested-With` в allow headers.
- Live Node fetch с заголовком `X-Requested-With: com.vkontakte.android`:
  - `/auth/login` fake credentials → JSON `400`, `Неверный email или пароль`;
  - `/auth/register` invalid short password → JSON `400`, `Пароль минимум 6
    символов`;
  - `Access-Control-Allow-Origin` соответствует `https://mrktggod.github.io`;
  - `Access-Control-Allow-Headers` содержит `X-Requested-With`.

## Вывод

Оставшаяся мобильная “Ошибка соединения” была вероятно связана не с `.ru`
origin, а с дополнительным WebView-заголовком `X-Requested-With`. После hotfix
мобильный login/register должен перейти из network/CORS error в нормальные
auth/validation ответы.

Если пользователь всё ещё видит “Ошибка соединения”, следующий безопасный шаг —
временно добавить в `vk.html` debug-панель без секретов: `location.origin`,
последний route, response status/type и sanitized error message.
