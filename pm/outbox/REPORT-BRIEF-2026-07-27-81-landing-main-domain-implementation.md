status: DONE

# REPORT-BRIEF-2026-07-27-81-landing-main-domain-implementation

## Что сделано

Собрана первая preview-страница продаж для `4 AI-секретарь` внутри app-репозитория:

- добавлен отдельный вход `landing.html`;
- добавлены отдельные стили `landing.css`;
- текущий вход приложения `index.html` не менялся;
- цены, выдуманные цифры, выдуманные отзывы, продакшн-публикация и роутинг главного домена не тронуты.

## Где проверять

- Локально: `http://127.0.0.1:8791/landing.html` при раздаче корня репозитория.
- Файлы: `landing.html`, `landing.css`.

## Проверка

- Playwright через локальный Node HTTP server:
  - 390x844: H1 `4 AI-секретарь`, Telegram CTA есть, horizontal overflow `390/390`;
  - 1366x900: H1 `4 AI-секретарь`, Telegram CTA есть, horizontal overflow `1366/1366`.
- Скриншоты локально сохранены:
  - `tmp/landing-81/mobile-390.png`;
  - `tmp/landing-81/desktop-1366.png`.
- `node scripts/check-cp1251-mojibake.mjs`: passed, 0 suspicious tokens.

## Изменённые файлы

- `landing.html`
- `landing.css`
- `FILE_MAP.md`
- `DEVELOPMENT_LOG.md`
- `pm/inbox/BRIEF-2026-07-27-81-landing-main-domain-implementation.md`

## Хвосты

- Нужен отдельный ручной просмотр Юрием перед любыми изменениями главного маршрута, домена или публичной публикацией.
