# BUG-2026-07-04-002 — Telegram web fallback uses unsupported tg protocol

## Цель

Исправить вход через Telegram в обычной веб-версии: кнопка должна давать видимое действие и открывать Telegram через HTTPS-ссылку, а не через `tg://resolve`.

## Контекст

Алексей проверил веб-версию 2026-07-04. При нажатии "Войти через Telegram" визуально ничего не происходит. В консоли браузера:

- `[Telegram.WebApp] Url protocol is not supported tg://resolve?...`
- `Uncaught (in promise) Error: WebAppTgUrlInvalid`

Причина: код строил ссылку `tg://resolve?domain=Denzel89bot&start=...` и передавал её в Telegram WebApp SDK. В обычной веб-версии SDK загружен, но нет валидного Telegram `initData`, поэтому такой вызов не должен использоваться.

## Приоритет

- Severity: High
- Priority: P1
- Area: Auth / Telegram / Web fallback
- Backlog: BACK-036

## Что изменено

- `buildTelegramBotLoginUrl()` строит `https://t.me/Denzel89bot?start=...`.
- `openTelegramLoginUrl()` вызывает `Telegram.WebApp.openTelegramLink()` только если есть Telegram `initData`.
- В обычной веб-версии используется `window.location.href` на HTTPS-ссылку.
- При генерации start token фронт отправляет в Worker `returnUrl` и сохраняет pending token локально.
- После возврата на сайт фронт принимает токен из `startapp`, `tgWebAppStartParam`, `telegram_start`, `telegramStartToken`, `startToken`, `tgAuth`.
- Если пользователь возвращается назад в уже открытую вкладку, `pageshow/focus` пробует завершить pending Telegram-login.
- Исправлены битые русские сообщения в Telegram auth-ветке.

## Что нужно на стороне bot/worker

Для полноценного веб-входа бот после `/start auth_...` должен вернуть пользователя на сайт:

```text
https://app.4-ai.site/?telegram_start=<startToken>
```

или на `returnUrl`, если Worker хранит его вместе со start token. Без этой bot-side кнопки сайт может только открыть Telegram и ждать, что пользователь сам вернётся назад.

## Acceptance criteria

- В веб-версии клик по "Войти через Telegram" открывает `https://t.me/Denzel89bot?...`.
- В консоли нет `WebAppTgUrlInvalid` и ошибки про unsupported `tg://resolve`.
- В Telegram Mini App вход через Telegram продолжает работать.
- Если start token не получен, пользователь всё равно попадает на базовую ссылку `https://t.me/Denzel89bot`.
- После нажатия START в боте пользователь получает кнопку/ссылку назад на сайт.
- Возврат на сайт с `?telegram_start=<startToken>` завершает веб-авторизацию.
