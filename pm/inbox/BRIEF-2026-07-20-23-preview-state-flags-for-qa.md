status: NEW

# BRIEF-2026-07-20-23-preview-state-flags-for-qa

## Context
Подключаем GPT как внешний визуальный QA по preview-ссылкам (без логина). Нужна матрица состояний экранов через безопасные query-флаги ТОЛЬКО для preview-хоста (никакой реальной auth/оплаты). Идея согласована с Юрием и Кодексом.

## Предохранитель
Если правки затрагивают `index.html` с НЕзакоммиченным redesign Юрия (`git status`) — не трогай его, пометь NEED-CLAUDE. Флаги можно вынести в `scripts/*.js` preview-рендерер, если так чище.

## Task
Добавь безопасные preview-only query-флаги (действуют ТОЛЬКО в preview-demo режиме, никогда в реальном рантайме/проде, никакой реальной оплаты/auth):
- `previewUser=trial|paid|expired|free` — состояние подписки/доступа (только визуал paywall/бейджей, БЕЗ реального entitlement).
- `previewTasks=empty|mixed|done-failed` — набор демо-задач.
- `previewApi=ok|error` — имитация ошибки API (показать error-state экрана).
- `previewTheme=light|dark` — тема.
Флаги комбинируются с существующими `previewDemo=dashboard&previewScreen=...`. Значения — только моковые данные в preview-слое; реальные KV/D1/entitlement/платёжка НЕ затрагиваются.

## Stop Points
- ❌ Флаги НЕ должны влиять на реальный рантайм/прод/entitlement/оплату — только preview-моки.
- ❌ prod, merge в main, CAL, цены, секреты, платёжка/entitlement-логика.
- ❌ Не трогать незакоммиченный redesign (см. Предохранитель).

## Verification
- Каждый флаг на preview-хосте меняет только визуал/моки; без флага и вне preview — поведение не изменилось.
- `check-cp1251-mojibake` = 0; UI-guard не вырос.
- Приложи готовые demo-URL с флагами для QA-пакета GPT.

## Report
`pm/outbox/REPORT-BRIEF-2026-07-20-23-preview-state-flags-for-qa.md`: какие флаги, file:line, примеры URL, SHA, подтверждение что реальный рантайм не затронут.
