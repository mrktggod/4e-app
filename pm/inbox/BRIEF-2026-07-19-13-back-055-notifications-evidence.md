status: NEW

# BRIEF-2026-07-19-13-back-055-notifications-evidence

## Context

EVIDENCE-AUDIT-2026-07-17: BACK-055 (уведомления как лента внимания с action cards) — Done, но SOURCE-ONLY. Аудит прямо указал: «reliable LIVE proof needs UI/headless interaction on notifications screen». Это whitelist-задача «evidence upgrade безопасным staging-тестом».

## Task

Headless staging smoke экрана notifications (свежий тестовый аккаунт, seed 2-3 задач с дедлайнами/просрочкой):

1. Открыть экран notifications, проверить: вкладка `Горит`, action cards с `К задаче / Готово / Отложить`, snooze-меню `15 мин / 1 час / 3 часа / Завтра`, спокойные empty states на пустом аккаунте.
2. Проверить реальный переход в task-detail по клику `К задаче` и эффект `Готово` (задача закрывается).
3. По результату обновить evidence-класс BACK-055 SOURCE-ONLY→LIVE в `docs/tasks/EVIDENCE-AUDIT-2026-07-17.md` (или новым supplement-блоком) + строку в `pm/backlog.md`.
4. Найденные дефекты — в `pm/bugs.md`, НЕ чинить молча в этом же прогоне, если фикс не тривиальный (≤5 строк UI).

## Stop Points

- Только чтение/UI-smoke + docs-правки; свежие тестовые аккаунты, не трогать аккаунты Юрия.
- No production deploy. No merge into `main`. No CAL. No price changes. No payment/entitlement refactors. No secrets.

## Verification

- Raw headless-вывод (DOM-проверки/скриншоты) в отчёте.
- `node scripts/check-cp1251-mojibake.mjs` → 0.

## Report

`pm/outbox/REPORT-BRIEF-2026-07-19-13-back-055-notifications-evidence.md`: pass/fail по каждому пункту, staging URL, commit SHA, honest tails.
