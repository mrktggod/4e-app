# Tail closeout — 2026-07-17

Цель: закрыть ночные организационные хвосты без новых runtime-изменений. Всё, что требует браузера, секретов, платежей, Telegram/VK/Yandex или платформенных аккаунтов, остается на ручной QA/отдельный бриф.

## 1. Хвосты, закрытые подготовкой

| Хвост | Где зафиксировано | Статус |
| --- | --- | --- |
| Утренний маршрут QA | `pm/morning-command-center-2026-07-17.md` | Closed for docs |
| Единая pass/fail таблица | `pm/qa-results-2026-07-17.md` | Closed for docs |
| Матрица следующего цикла | `pm/next-cycle-matrix-2026-07-17.md` | Closed for docs |
| Beta runbook | `pm/beta-run-2026-07.md` | Closed for docs |
| Beta invite copy | `pm/beta-invite-pack-2026-07.md` | Closed for docs |
| Feedback loop | `pm/feedback-loop-2026-07.md` | Closed for docs |
| Post-beta decision tree | `pm/post-beta-decision-tree-2026-07.md` | Closed for docs |
| Product decision pack | `docs/tasks/PRODUCT-DECISIONS-2026-07-16.md` | Closed for docs |
| Release beta gates | `docs/tasks/RELEASE-BETA-GATES-2026-07-16.md` | Closed for docs |
| Monetization decisions | `docs/tasks/MONETIZATION-DECISIONS-2026-07-16.md` | Closed for docs |
| Native platform decisions | `docs/tasks/NATIVE-PLATFORM-DECISIONS-2026-07-16.md` | Closed for docs |
| Workspace unification plan | `pm/infra-006-workspace-unification.md` | Closed for docs |
| CSS architecture plan | `docs/tasks/BACK-012-css-architecture-plan.md` | Closed for docs |
| Adaptive reminders plan | `docs/tasks/SMART-012-adaptive-reminders-plan.md` | Closed for docs |
| Offline mode plan | `docs/tasks/BACK-057-offline-mode-plan.md` | Closed for docs |

## 2. Хвосты, которые нельзя честно закрыть без рук

| Хвост | Почему не закрыт | Следующий владелец |
| --- | --- | --- |
| Auth registration/login smoke | Требует браузерного staging QA и проверки CORS/edge | Yuri + Codex fix if fail |
| Task create/confirm/reload/move | Требует ручной проверки в UI | Yuri + Codex fix if fail |
| Chat composer/mobile keyboard | Требует реального viewport/device smoke | Yuri + Codex fix if fail |
| Entitlement/paywall | Требует живого сценария active/expired/free | Yuri + Codex fix if fail |
| Analytics events | Требует просмотра реальных событий после действий | Yuri + Codex fix if fail |
| Bot live message | Требует живой Telegram path/token/runtime | Yuri/Codex only with token/runtime context |
| VK/Yandex OAuth | VK partly ready, Yandex still secret/manual blocker | Yuri for secrets/setup |
| Production deploy / main merge | Release-risk action, не ночной хвост | Separate release window |

## 3. Хвосты, которые сознательно не трогаем

| Не трогать | Причина |
| --- | --- |
| CAL implementation | Уже был карантин, возвращать только отдельной веткой |
| Цена 990/999 | Бизнес-решение, не backlog cleanup |
| Native store launch | Требует аккаунтов и ручного platform QA |
| OAuth profile enrichment | Нужен consent/copy gate |
| `.pages-dist/privacy.html` | Dirty build artifact, не часть docs/product хвостов |
| `main` | Не merge без отдельного go/no-go |

## 4. Если утром есть 30 минут

| Минуты | Действие | Результат |
| --- | --- | --- |
| 0-5 | Открыть `pm/morning-command-center-2026-07-17.md` | Понятен маршрут |
| 5-25 | Заполнить `pm/qa-results-2026-07-17.md` по P0/P1 потокам | Есть факты pass/fail |
| 25-30 | Перенести P0/P1 в `pm/bugs.md` | Codex может чинить без догадок |

## 5. Definition of done для ночной подготовки

| Критерий | Статус |
| --- | --- |
| Ночные docs/product хвосты разложены | Done |
| Утренний QA имеет один вход | Done |
| Go/no-go beta правило есть | Done |
| Runtime не менялся без QA | Done |
| Dirty build artifact не тронут | Done |
| Остатки требуют ручной проверки, а не кодовой догадки | Done |