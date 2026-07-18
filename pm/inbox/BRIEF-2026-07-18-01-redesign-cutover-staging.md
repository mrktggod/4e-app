status: NEED-YURI

# BRIEF-2026-07-18-01-redesign-cutover-staging

## Context

Днём Юрий с Кодексом согласовали новый дизайн (soft-glass слайсы: home/profile/chat/task-detail и др.) на тестовых доменах. Ночью — перенести СОГЛАСОВАННОЕ в рабочую ветку и на STAGING, подготовить прод-деплой. **Прод-деплой и merge в main НЕ делать — это утром Юрий по кнопке.** Приоритет ночи №1 (после брифа -00- с правилами).

## Предусловие
Первым шагом: `git checkout feat/admin-tariff-api` (рабочая копия могла остаться на redesign-ветке) + `git pull --ff-only origin feat/admin-tariff-api`. Если рабочее дерево грязное от дневной сессии — сначала убедись, что дневная redesign-работа закоммичена в свои ветки; не теряй незакоммиченное.

## Task

**СОГЛАСОВАНЫ 5 экранов/слайсов (первая часть редизайна, подтвердил Юрий 2026-07-18). Переноси АКТУАЛЬНЫЕ ГОЛОВЫ этих веток, а НЕ SHA из старого handoff-документа — старый handoff устарел (зафиксирован на checkpoint 17:22, после него страницы дорабатывались):**

| Страница | Ветка | Актуальная голова (origin на 2026-07-18 вечер) |
| --- | --- | --- |
| Profile | `codex/redesign-profile-soft-glass` | `328fdff29cb6f3c4940162a42def13d7c94f4f45` |
| Chat | `codex/redesign-chat-soft-glass` | `1b1ff0c437d3daa10217c04b89126c6460e3fbab` |
| Task-detail | `codex/redesign-task-detail-soft-glass` | `e2d861cc44938d63368245828b5a111cf7fea0f7` |
| Dashboard / Home empty state | `codex/redesign-dashboard-subscription-soft-glass` | `a5d40e3c...` |
| Subscription / pricing | `codex/redesign-dashboard-subscription-soft-glass` | `a5d40e3c...` |

1. Сначала `git fetch --all` и сверь: голова каждой ветки на origin ДОЛЖНА быть новее/равна указанной выше. Если origin-голова отличается — бери фактическую origin-голову ветки (это последняя согласованная версия), НЕ SHA из handoff (`e3a9f7c/cf4c6ba/25f605d` — устаревшие). Если ветка пропала/расходится необъяснимо — NEED-YURI, спроси.
2. Перенеси эти ветки/слайсы (их актуальные головы) в `feat/admin-tariff-api` (merge/cherry-pick). Один слайс = один понятный коммит. Для Dashboard и Subscription это одна ветка `codex/redesign-dashboard-subscription-soft-glass`; переносить текущую origin-голову ветки, не промежуточные SHA. Обнови handoff-документ и backlog REDESIGN-001 под фактически перенесённые SHA.
3. Задеплой результат на STAGING (обычным способом для staging Pages). НЕ прод.
4. Прогони проверки: `node scripts/check-cp1251-mojibake.mjs` = 0, `check-ui-architecture.sh` (inline baseline не растить), api-smoke если применимо.
5. Подготовь прод-деплой (НЕ выполняй): в отчёте — что именно поедет в прод (список слайсов/файлов), staging-URL для проверки Юрием, чек-лист cutover, чем откатывать. Пометь как **NEED-YURI: прод-деплой redesign — ждёт «выкатывай» Юрия утром**.

## Stop Points
- ❌ Prod-деплой, ❌ merge в main — только Юрий утром.
- ❌ Не переносить НЕсогласованные/сомнительные слайсы (NEED-YURI).
- ❌ Цены, платёжка, entitlement, секреты, CAL.
- Redesign — по HTML/LESS/BEM, без инлайн-стилей, accessibility baseline держать.

## Verification
- Staging реально обновился и открывается; ключевые экраны (home/dashboard empty state, subscription/pricing, profile, chat, task-detail) в новом дизайне не сломаны.
- mojibake = 0, UI-architecture guard прошёл.

## Дополнение 2026-07-18 поздний вечер

Dashboard/Home empty state и Subscription/Pricing согласованы Юрием после дополнительных правок:
- Dashboard: стартовый пустой аккаунт без demo-задач, `0 задач`, карточка `Первый AI-план за 60 секунд`, нижнее меню ровное.
- Subscription: карточки тарифов и бейдж выгоды согласованы; центральная нижняя кнопка/меню не перекрывает итоговую проверку.
- Preview для ручной сверки: `https://redesign-dashboard-subscript.4-ai-staging.pages.dev/?previewDemo=dashboard&v=a5d40e3`.
- Последний подтверждённый commit: `a5d40e3 fix: center dashboard nav orb in grid flow`.
- Следующий дизайн-проход Юрий отложил на завтра; сегодня не продолжать новые экраны из `X:\4\Новый дизайн\архивы`.

## Report
`pm/outbox/REPORT-BRIEF-2026-07-18-01-redesign-cutover-staging.md`: какие слайсы перенесены (SHA), staging-URL, результат проверок, ЧТО готово к прод-деплою (для утреннего «да» Юрия), что осталось NEED-YURI/NEED-CLAUDE.
