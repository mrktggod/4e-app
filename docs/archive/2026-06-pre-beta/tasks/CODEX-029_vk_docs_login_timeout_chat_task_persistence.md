# CODEX-029 — VK docs check, login timeout and chat task persistence

Дата: 2026-06-19

## Симптом

Пользователь повторно проверил VK Mini App:

- email/password login: первый клик показывает “Ошибка подключения”, после
  ожидания второй клик входит сразу;
- история AI-чата сохраняется в том же email-аккаунте;
- задача, добавленная через чат, в дашборде задач не появляется;
- Telegram-аккаунт и email-аккаунт пока не связаны.

## Проверка VK документации

Проверена официальная документация VK:

- `https://dev.vk.com/ru/mini-apps/development/launch-params`
- `https://github.com/VKCOM/vk-bridge`
- `https://www.npmjs.com/package/@vkontakte/vk-bridge`

Вывод:

- VK передаёт параметры запуска как URL-параметры на URL из настроек приложения.
- На клиенте параметры можно получать через `window.location` или событие
  `VKWebAppGetLaunchParams`.
- `vk_user_id` можно использовать для авторизации только после проверки подписи
  `sign`.
- Наш VK auto-login path уже соответствует этой модели: `vk.html` собирает
  launch params из `location.search`, `location.hash` и VK Bridge, а Worker
  проверяет подпись через `verifyVKLaunchParams`.
- Текущий симптом относится к email login и chat/task persistence, а не к
  нарушению VK launch params flow.

## Диагностика приложения

- `sendMessage()` в `4e-app/vk.html` вызывал только `/anthropic` и сохранял
  local chat history.
- `/tasks` дашборд читает задачи из Worker/KV.
- Worker сохраняет задачи только через `x-action: save-task`.
- До fix VK chat никогда не вызывал `save-task`, поэтому AI мог ответить “задача
  зафиксирована”, но дашборд оставался пустым.
- Login timeout в VK frontend был `10000` ms. При cold start/мобильной сети
  первый запрос мог не успеть, а второй проходил быстро уже после прогрева.

## Решение

В `4e-app/vk.html`:

- добавлен `AUTH_TIMEOUT_MS = 30000`;
- login/register кнопки получают busy state, чтобы пользователь не нажимал
  повторно во время ожидания;
- timeout message стал честнее: “Сервер отвечает дольше обычного...”;
- добавлен `maybeSaveTaskFromChat(text)`;
- команды в чате вида:
  - `добавь задачу ...`;
  - `создай задачу ...`;
  - `поставь задачу ...`;
  - `зафиксируй задачу ...`;
  - `напомни ...`;
  - `надо ...`;
  - `нужно ...`;
  - `сделать ...`;
  теперь создают реальную задачу через Worker `x-action: save-task`;
- после успешного сохранения выполняется `loadTasks()`, и задача должна появиться
  в дашборде;
- добавлено базовое HTML escaping для chat/task rendering.

Frontend publish:

- repo: `mrktggod/4e-app`;
- commit: `5120a36` — `fix: persist VK chat task commands`;
- `origin/main` verified:
  - `5120a3681791e07c0659a6eaa411165a3bec93f3`;
- GitHub API content verified:
  - file `vk.html`;
  - blob `2ae7465e402a43d2c71a0e96e803c089d8e79480`;
  - size `40314`.

## Проверка

- JS syntax check прошёл для:
  - `4e-app/vk.html`;
  - `.tmp-4e-app-publish/vk.html`.
- `git push origin main` прошёл:
  - `4792e2b..5120a36 main -> main`.
- GitHub Pages может отдавать старый HTML с edge-кэша до истечения CDN TTL, но
  репозиторий и GitHub API уже содержат новый файл.

## Оставшийся продуктовый долг

- Email и Telegram пока могут быть разными identities/users.
- Для единого дашборда через email/VK/TG нужен Gate 2:
  - безопасная привязка Telegram/VK/email к одному canonical user;
  - challenge flow;
  - controlled merge существующих user buckets.
