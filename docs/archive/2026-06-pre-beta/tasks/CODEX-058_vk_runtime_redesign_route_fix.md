# CODEX-058 — VK runtime redesign route fix

Дата: 2026-06-20
Статус: опубликовано в GitHub Pages

## Контекст

После `CODEX-057` пользователь проверил `https://vk.ru/app54636698` на телефоне и прислал скрины:

- VK Mini App показывал старый интерфейс `vk.html`, а не новый redesign из `index.html`;
- карточка задачи не открывалась;
- кнопки смены темы не было.

## Причина

`CODEX-057` исправил `index.html`, но текущая архитектура проекта явно разделяет:

- `index.html` — основной / Telegram Mini App контур;
- `vk.html` — отдельный VK Mini App.

VK реально грузит `https://mrktggod.github.io/4e-app/vk.html`, где находилась рабочая VK/email auth и identity-linking логика, но визуальный слой оставался legacy.

Прямая замена VK URL на `index.html` была рискованной: `index.html` использует другой token key / worker-контур, а `vk.html` уже содержит стабильные `edge.4-ai.site`, `vk4_token`, `linkCurrentVK`, `/auth/identities`, challenge/merge и auth warm-up.

## Решение

В `vk.html` перенесён runtime UX-слой без замены auth/identity логики:

- home-экран получил redesign-структуру:
  - chips `Сегодня / Горит / Люди / Неделя`;
  - focus card;
  - mini planet visual;
  - stat cards;
  - обновлённые task rows;
- добавлена light theme:
  - `THEME_K = 'vk4_theme'`;
  - `toggleTheme()`;
  - `applyTheme()`;
  - guarded `applyHostThemeScheme()`;
- добавлена кнопка темы в topbar и пункт `Тема оформления` в профиле;
- task rows теперь открывают `screen-task-detail`;
- checkbox выполнения задачи теперь вызывает `event.stopPropagation()` и не мешает проваливанию в карточку;
- task detail получил вкладки `Описание`, `Обсудить задачу`, `История`;
- во вкладке `Обсудить задачу` добавлен мини-чат по конкретной задаче с `/anthropic` и локальным fallback-сохранением заметки.

Изменения внесены в:

- `4e-app/vk.html`;
- `.tmp-4e-app-publish/vk.html`.

## Публикация

- Репозиторий: `mrktggod/4e-app`
- Commit: `af531ee`
- Message: `fix: apply VK redesign runtime`
- Push: `f3dc86a..af531ee main -> main`
- Live URL: `https://mrktggod.github.io/4e-app/vk.html`

## Проверка

Пройдены проверки:

- `node scripts\verify-vk-auth-retry-html.mjs 4e-app\vk.html`
- `node scripts\verify-vk-auth-retry-html.mjs .tmp-4e-app-publish\vk.html`
- `node scripts\verify-vk-redesign-runtime-html.mjs`
- `node scripts\verify-vk-redesign-runtime-html.mjs .tmp-4e-app-publish\vk.html`
- `git -c safe.directory=C:/Users/shelc/Documents/4/.tmp-4e-app-publish diff --check`
- Raw GitHub readback:
  - `home-redesign=true`;
  - `screen-task-detail=true`;
  - `themeToggleTop=true`;
  - `openTaskDetail=true`;
  - `sendTaskDiscussion=true`;
  - `vk4_theme=true`.
- GitHub Pages cache-busted readback:
  - `ok=true`;
  - `home=true`;
  - `detail=true`;
  - `theme=true`.

## Ограничения

- Worker, D1, auth endpoints и Cloudflare routes не менялись.
- `4-ai.site` не трогался.
- Это runtime-патч `vk.html`, а не полноценная компонентная пересборка frontend.
- Planet visual в `vk.html` сделан лёгким CSS-слоем, без переноса всей SVG/Lottie-анимации из `index.html`.

## Ручной smoke

1. Полностью закрыть VK.
2. Открыть `https://vk.ru/app54636698`.
3. Ожидаемо: главный экран больше не старый `1 дел ждут`, а обновлённый home с chips, focus card и stat cards.
4. Нажать на строку задачи.
5. Ожидаемо: открывается карточка задачи.
6. Открыть `Обсудить задачу`, написать сообщение.
7. Ожидаемо: сообщение появляется, AI отвечает или сохраняется fallback-заметка.
8. Нажать кнопку темы сверху или пункт `Тема оформления` в профиле.
9. Ожидаемо: тема переключается и выбор сохраняется.
