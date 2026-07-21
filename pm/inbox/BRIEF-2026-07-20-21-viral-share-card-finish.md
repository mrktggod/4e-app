status: DONE

# BRIEF-2026-07-20-21-viral-share-card-finish

# Context
Юрий 2026-07-20 разблокировал VIRAL для автономной ночи. VIRAL-001 (план дня), VIRAL-004 (streak+достижения), VIRAL-006 (итоги недели) — Partial Done, runtime MVP есть (`shareDailyCard`, `shareWeeklySummaryCard`, streak). Довести Partial→готово.

## Предохранитель
Если правки затрагивают `index.html` и там есть НЕзакоммиченный redesign (проверь `git status`) — вынеси логику в существующий `scripts/*.js` или помечай `NEED-CLAUDE`, index.html с незакоммиченным redesign НЕ трогай.

## Task
1. Проверь текущее состояние share-card функций (генерация PNG canvas, streak-расчёт, weekly summary, lite-analytics события `share-card`/`share-weekly-card`).
2. Доведи недостающее из Partial: элементы карточки, корректный streak, fallback при отсутствии native share, события аналитики. Один под-таск = коммит.
3. Живой визуальный smoke карточек на телефоне (VK Stories/TG) — НЕ делай, это NEED-YURI; ограничься кодом + headless/статик проверкой.

## Stop Points
- ❌ Не трогать незакоммиченный redesign в index.html (см. Предохранитель).
- ❌ prod, merge в main, CAL, цены, секреты, платёжка/entitlement.
- ❌ Не ломать HOME layout; canvas — генерация, не постинг в соцсети.

## Verification
- Функции вызываются без ошибок (headless/статик), lite-analytics события пишутся.
- `node scripts/check-cp1251-mojibake.mjs` = 0; UI-guard не вырос.

## Report
`pm/outbox/REPORT-BRIEF-2026-07-20-21-viral-share-card-finish.md`: что доведено, SHA, что осталось NEED-YURI (live smoke карточек).
