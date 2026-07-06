# Задача Юре / Claude — BACK-050 accessibility baseline

**Дата:** 2026-07-06
**От:** Codex
**Кому:** Юрий / Claude Юры
**Статус:** можно брать в работу по шагам
**Связанный backlog:** `BACK-050`
**Task-файл:** `docs/tasks/BACK-050-accessibility-baseline.md`

## Контекст

Алексей попросил применить идеи из курса HTML Academy по доступности веб-интерфейсов к нашему продукту. Решение: не делать большой абстрактный рефакторинг, а закрывать доступность критических сценариев перед закрытым тестом.

Важно: `main` связан с live, а `index.html` большой и с кириллицей. Работать только через отдельные ветки и с проверкой кодировки, если трогаешь `index.html`.

## ЗАДАЧА ДЛЯ ЮРЫ — шаг 1

```text
ЗАДАЧА ДЛЯ ЮРЫ

Контекст:
Нужно закрыть accessibility baseline для auth-сценариев: вход, регистрация, сброс пароля, новый пароль.

Что нужно сделать:
1. Ветка: fix/accessibility-auth-baseline.
2. Сначала прочитать FILE_MAP_UI.md и docs/tasks/BACK-050-accessibility-baseline.md.
3. Проверить login/registration/forgot/reset password: keyboard flow, видимый focus, Enter-submit.
4. Добавить явные label или accessible names для полей, не полагаться только на placeholder.
5. Связать ошибки с полями через aria-describedby/aria-invalid или эквивалент.
6. Не менять бизнес-логику auth, если задача решается HTML/JS/CSS.

Критерий готовности:
Пользователь проходит auth-сценарии клавиатурой, ошибки видны текстом и привязаны к полям, focus не теряется, визуал не ломается.

Куда вернуть результат:
Ветка fix/accessibility-auth-baseline, короткий отчёт в shared/WORK_LOG.md и DEVELOPMENT_LOG.md, скрины/описание smoke для mobile и keyboard.

Вопросы и риски:
Если index.html менялся, обязательно проверка кириллицы до/после. Не добавлять новые inline style/onclick.
```

## ЗАДАЧА ДЛЯ ЮРЫ — шаг 2

```text
ЗАДАЧА ДЛЯ ЮРЫ

Контекст:
Сейчас часть важных сообщений живёт как toast. Нужно, чтобы ошибки и статусы были доступными и не исчезали как единственный следующий шаг.

Что нужно сделать:
1. Ветка: fix/accessibility-status-dialogs.
2. Привести #toast к доступному status-сообщению: role="status"/aria-live для обычных уведомлений.
3. Для ошибок формы использовать role="alert" или полевые ошибки, а не только временный toast.
4. Проверить пустой login, невалидный forgot password, ошибку сети, успешную отправку письма, успешное сохранение задачи.

Критерий готовности:
Критические ошибки видны текстом и остаются понятными без исчезающего toast. Обычные статусы доступны как status/live region.

Куда вернуть результат:
Ветка fix/accessibility-status-dialogs, запись в логи, список проверенных сценариев.

Вопросы и риски:
Не ломать текущие toast-сценарии и не превращать каждое сообщение в модалку.
```

## ЗАДАЧА ДЛЯ ЮРЫ — шаг 3

```text
ЗАДАЧА ДЛЯ ЮРЫ

Контекст:
Нужно довести доступность bottom sheet/dialog и мобильных зон нажатия.

Что нужно сделать:
1. Ветка: fix/accessibility-focus-targets.
2. Проверить quick-add overlay, contact panel и biometric consent как dialog/bottom sheet.
3. Добавить role="dialog", aria-modal, связь с заголовком, понятный cancel/close.
4. При открытии переносить фокус внутрь, при закрытии возвращать фокус в исходную кнопку.
5. Проверить Escape/back/cancel.
6. Проверить touch-targets нижней навигации, tab-кнопок, мелких иконок и быстрых действий на 360/375/390px.
7. Декоративные SVG/анимации пометить aria-hidden, где они не несут смысла.

Критерий готовности:
Пользователь не застревает в bottom sheet, фокус не теряется, ключевые действия нажимаются пальцем без точного попадания в мелкий текст.

Куда вернуть результат:
Ветка fix/accessibility-focus-targets, запись в логи, mobile screenshots или короткое видео smoke.

Вопросы и риски:
Не делать большой рефакторинг всего index.html. Если prefers-reduced-motion для Home раздувает задачу, вынести отдельным follow-up.
```

## Минимальные проверки

- `npm run build:css`, если менялись LESS.
- `bash scripts/check-ui-architecture.sh`.
- `bash scripts/check-portable-paths.sh`.
- `git diff --check`.
- Keyboard smoke: Tab, Shift+Tab, Enter, Escape.
- Mobile smoke: 360/375/390px.
