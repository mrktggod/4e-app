status: BLOCKED-CONCURRENT-WORK

# BRIEF-2026-07-22-32-task-tag-popup-ios

## Context

`BUG-2026-07-22-002`: на iPhone/TMA ввод тега вызывает нативную подсказку `<datalist>` и клавиатуру, которые закрывают карточку задачи. Поле и кнопка частично выходят за экран, понятного закрытия нет. Скрин: `docs/tasks/assets/BUG-2026-07-22-task-detail-tag-popup-ios.png`.

## Task

Сделать узкий mobile-first фикс редактора тега:

1. Не использовать нативный `<datalist>` как всплывающую поверхность в TMA; использовать существующие данные тегов в управляемом popup/list UI.
2. Поле, кнопка добавления и действие закрытия должны помещаться в viewport 390x844 при открытой клавиатуре.
3. Добавить закрытие по cancel/outside/Escape и восстановление focus.
4. Сохранить текущую логику добавления тега и защиту от дублей.
5. Добавить focused smoke на открытие, ввод, выбор/добавление и закрытие.

## Acceptance

- Попап не закрывает весь hero и не выходит по горизонтали.
- Кнопка добавления полностью видна и нажимается.
- Нативная большая подсказка поверх карточки больше не появляется.

## Stop Points

- No broad redesign or shared glass-system rewrite.
- No production deploy or merge into `main`.
- No CAL, payment, entitlement, auth-security or secrets work.
- If task-detail source files contain unrelated uncommitted work, report `BLOCKED-CONCURRENT-WORK` without overwriting it.

## Verification

- Обязательный encoding ritual для `index.html`, до и после правки.
- `node scripts/check-cp1251-mojibake.mjs`
- `npm run build:css`
- Focused 390x844 keyboard/popup smoke and screenshot.
- `git diff --check`

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-22-32-task-tag-popup-ios.md` with root cause as `file:line`, changed files, commit SHA and raw visual/smoke proof.
