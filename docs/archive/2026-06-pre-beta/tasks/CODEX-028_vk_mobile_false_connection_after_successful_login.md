# CODEX-028 — VK mobile false “Ошибка соединения” after successful email login

Дата: 2026-06-19

## Симптом

Пользователь проверил VK Mini App на телефоне:

- при первом нажатии “Войти” всё ещё появлялась “Ошибка соединения”;
- при повторном нажатии вход проходил успешно;
- после email-входа список задач был пустым.

## Диагностика

- Раз второй клик впускает, auth-токен уже был получен и/или сохранён.
- В `vk.html` `doLogin()` и `doRegister()` держали в одном `try/catch`:
  - сетевой запрос `/auth/login` или `/auth/register`;
  - чтение JSON;
  - сохранение токена;
  - запуск `enterApp()`.
- Поэтому любая post-login ошибка в UI-инициализации могла быть ошибочно
  показана пользователю как “Ошибка соединения”, хотя соединение и auth уже
  сработали.
- Дополнительный риск: `enterApp()` напрямую парсил локальную историю чата через
  `JSON.parse(localStorage.getItem(...))`. Если мобильный WebView оставил
  повреждённое значение, первый вход мог падать после сохранения токена.

## Решение

В `4e-app/vk.html`:

- добавлен `completeAuth(token, user)`;
- добавлен безопасный `saveAuthToken(token)`;
- добавлен безопасный `readChatHistory(userId)` с fallback на пустой массив;
- `doLogin()` и `doRegister()` теперь ловят “Ошибка соединения” только вокруг
  network/JSON части;
- `enterApp()` больше не валит весь вход из-за ошибок `applyUser`, history parse,
  `loadTasks` или `buildCalendar`.

Frontend publish:

- repo: `mrktggod/4e-app`;
- commit: `4792e2b` — `fix: avoid false VK mobile login connection error`;
- GitHub Pages `vk.html` verified:
  - `Last-Modified: Fri, 19 Jun 2026 19:07:37 GMT`;
  - live HTML содержит `completeAuth`, `readChatHistory`.

## Проверка

- Локальный script syntax check прошёл для:
  - `4e-app/vk.html`;
  - publish clone `.tmp-4e-app-publish/vk.html`.
- `git push origin main` прошёл:
  - `3472233..4792e2b main -> main`.
- Live `https://mrktggod.github.io/4e-app/vk.html` обновился и содержит новый
  post-login guard.

## Отдельное наблюдение по пустым задачам

Пустой список после email-входа не доказывает потерю задач. В текущей архитектуре
email identity может быть отдельным user-контекстом от Telegram/VK/групповых
provider buckets. Для beta это закрывается Gate 2 задачей:

- challenge flow для привязки и merge аккаунтов;
- миграция существующих Web/TG/VK пользователей из KV;
- единый пользователь должен видеть одинаковые данные через любой связанный
  интерфейс.

До этого email-вход может показывать пустой `user_<id>` task bucket.

## Следующий шаг, если симптом останется

Если после обновления VK WebView всё ещё покажет “Ошибка соединения” именно до
перехода в приложение, добавить временную debug-панель в `vk.html` без секретов:

- build/commit marker;
- route name;
- response status/type;
- sanitized error code;
- `location.origin`.
