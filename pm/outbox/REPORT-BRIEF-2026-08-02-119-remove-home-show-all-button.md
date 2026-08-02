# REPORT: BRIEF-2026-08-02-119-remove-home-show-all-button

lessons_read: 0

## Что сделано

Из домашнего экрана удалено устаревшее действие «Смотреть все задачи». Список
приоритетных задач остался на месте; переход к полному списку по-прежнему есть
через карточку метрики «Задачи».

## Причина

Ручная QA 2026-08-02 подтвердила работоспособность кнопки, но владелец продукта
отменил это поведение. Ранее smoke защищал уже неактуальный контракт.

## Изменённые файлы

- `index.html` — удалены разметка, показ и неиспользуемая функция действия.
- `scripts/platform-adapter.js` — удалён неиспользуемый delegated action.
- `scripts/home-001-dashboard-smoke.mjs` — проверяет отсутствие действия и
  сохранность списка задач на 390/360/320 px.
- `scripts/telegram-dashboard-one-task-diagnostic.mjs` — web и Telegram mock
  проверяют отсутствие действия при четырёх активных задачах.
- `styles/screens/home.less`, `styles/screens/light-redesign.less` и собранные
  CSS — удалены стили кнопки и освобождён её вертикальный резерв.

## Проверки

- `npm run build:css` — PASS.
- `npm run smoke:home001` — PASS: 3 приоритетные строки, кнопки нет, overflow
  отсутствует на 390/360/320 px, светлая и тёмная темы зелёные.
- `npm run smoke:telegram-dashboard-one-task` — PASS: web и Telegram mock,
  4 активные задачи в кэше, 3 строки dashboard, действия нет.
- `node scripts/check-cp1251-mojibake.mjs` — PASS, 0 suspicious tokens.
- `npm run check:portable-paths` — PASS.
- `npm run check:js-syntax -- --all` — PASS, 101 scripts.
- `git diff --check` — PASS.

## Delivery

- Код: `ac59acc` (`fix(home): remove retired show-all action`).
- PR #53 в `feat/admin-tariff-api`.
- `release_state: PR_READY` записан в `pm/release-queue.md`.

## Уровень доказательства и ручной хвост

Доказательство: локальный browser smoke и Telegram/Web mock; это не живая
проверка Telegram Mini App. До merge и deployment человеку нужно просмотреть
PR #53, выполнить ручную проверку в Telegram Mini App и только затем решить
вопрос merge. Production deploy и merge не выполнялись.
