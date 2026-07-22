status: NEW

# BRIEF-2026-07-22-31-task-reminder-time-ios

## Context

`BUG-2026-07-22-001`: в iPhone Telegram Mini App Алексей не смог нажать кнопку выбора времени уведомления в детальной карточке задачи. Из-за этого заблокирован ручной smoke доставки уведомлений. Source-аудит нашёл вложенный скрытый `<select>` внутри кнопки и финальный размер action-кнопок 36x36.

## Task

Сделать узкий фикс только UI выбора времени напоминания:

1. Убрать вложенную интерактивность `button > select`; trigger и popup/select должны быть соседними элементами с понятным focus/tap flow.
2. Дать trigger минимум 44x44 CSS px без inline-стилей.
3. Сохранить текущие варианты времени и существующий save/update path.
4. Добавить focused 390x844 smoke: trigger нажимается, список открывается, вариант выбирается, значение остаётся в форме.

## Acceptance

- На 390x844 trigger реально принимает tap/click и открывает выбор времени.
- После выбора значение отображается и сохраняется прежним API-путём.
- Не меняется логика доставки, звука, вибрации или backend уведомлений.

## Stop Points

- No production deploy or merge into `main`.
- No notification delivery/backend refactor.
- No CAL, payment, entitlement, auth-security or secrets work.
- If `index.html` has unrelated uncommitted changes at start, do not overwrite them; report `BLOCKED-CONCURRENT-WORK`.

## Verification

- Обязательный encoding ritual для `index.html`, до и после правки.
- `node scripts/check-cp1251-mojibake.mjs`
- `npm run build:css`
- New focused 390x844 smoke.
- `git diff --check`

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-22-31-task-reminder-time-ios.md` with root cause as `file:line`, changed files, commit SHA and raw smoke proof.
