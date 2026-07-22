status: BLOCKED-CONCURRENT-WORK

# BRIEF-2026-07-22-33-task-detail-hero-overflow-ios

## Context

`BUG-2026-07-22-003`: длинный тег складывается вертикально, заголовок и описание пересекаются с карточками срока/приоритета и обрезаются. Скрин: `docs/tasks/assets/BUG-2026-07-22-task-detail-hero-overflow-ios.png`. В task-detail накоплено несколько поздних CSS override-слоёв.

## Task

Исправить только layout hero детальной карточки задачи на mobile viewport:

1. Длинный тег остаётся одной компактной строкой с безопасным ellipsis.
2. Заголовок и описание не пересекаются с блоками срока и приоритета.
3. Hero может увеличиться по высоте в заданных пределах; контент не должен скрываться fixed-height/absolute-координатами.
4. Консолидировать только конфликтующие правила task-detail hero, не начинать общий CSS-рефакторинг.
5. Добавить regression fixture с длинным тегом, длинным заголовком, описанием, сроком и приоритетом.

## Acceptance

- На 390x844 нет горизонтального overflow, вертикальных букв тега и наложений текста.
- Все данные остаются читаемыми и элементы ниже hero не перекрыты.
- Короткие данные не дают заметного пустого пространства или скачка layout.

## Stop Points

- No broad redesign architecture or liquid-glass migration.
- If the fix requires rewriting several screens/shared primitives, set `status: NEED-CLAUDE` and report a narrow plan instead.
- No production deploy, merge into `main`, CAL, payment, entitlement, auth-security or secrets work.
- Do not overwrite unrelated uncommitted changes.

## Verification

- Обязательный encoding ritual для `index.html`, если он меняется.
- `node scripts/check-cp1251-mojibake.mjs`
- `npm run build:css`
- Focused 390x844 fixture/screenshot comparison.
- `git diff --check`

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-22-33-task-detail-hero-overflow-ios.md` with root cause as `file:line`, changed files, commit SHA and raw visual proof.
