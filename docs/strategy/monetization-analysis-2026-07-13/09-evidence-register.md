# 9. Реестр доказательств

## Метод

Использованы четыре уровня:

- **Verified now:** git/HTTP/code проверены 13 июля 2026 года.
- **Documented:** утверждение записано в текущих PM/roadmap/log документах.
- **Code-present:** найдено в ветке, но не означает shipped.
- **Inference:** рекомендация/вывод из доказательств.

## Репозитории и ветки — Verified now

| Факт | Доказательство |
|---|---|
| Канонический app checkout | `<app-repo-root>`, remote `mrktggod/4e-app` |
| App branch | `feat/admin-tariff-api`, HEAD `ca47430`, remote branch синхронен |
| App divergence | `origin/main` является ancestor; ветка на 142 коммита впереди |
| App dirty worktree | Изменены `docs/tasks/HOME-001-dashboard-redesign.md`, `shared/ROADMAP.md`; не тронуты этим анализом |
| Worker checkout | `<worker-repo-root>`, remote `mrktggod/4e-worker` |
| Worker branch | `feat/admin-tariff-api`, HEAD `12681a9`, 24 коммита впереди main |
| Worker untracked | `kv-backups/`; не тронут |
| Root git | Unborn `feat/task-detail-mvp`, всё содержимое untracked |
| `Documents\4\4e-app` | Нет собственного `.git` |

## Backlog/QA — Verified now

Источник: `../.tmp-4e-app-publish/pm/backlog.md`, `pm/qa-checklist.md`.

| Метрика | Значение |
|---|---:|
| Task rows | 122 |
| Todo | 41 |
| Done | 39 |
| Ready for QA | 33 |
| In Progress | 2 |
| QA unchecked | 50 |
| QA checked | 2 |
| Release checklist unchecked | 14 |

Ключевые строки backlog:

- payments: `pm/backlog.md:97-102`;
- tariff API: `pm/backlog.md:111`;
- VIRAL-001…006: `pm/backlog.md:124-129`;
- infra/canonical copy: `pm/backlog.md:139-143`;
- onboarding/beta/analytics/feedback: `pm/backlog.md:149-152`.

## Live HTTP probes — Verified now, сеть текущего компьютера

| URL | Результат |
|---|---|
| `https://app.4-ai.site/` | HTTP 200; Home v2 marker есть; referral и frontend tariff wiring отсутствуют |
| `https://mrktggod.github.io/4e-app/` | HTTP 200; referral/tariff wiring отсутствуют |
| `https://4-ai-staging.pages.dev/` | HTTP 200; Home v2, referral и tariff wiring присутствуют |
| VK production hosting | HTTP 200; отдельный `vk.html`-based UI, referral/tariff wiring отсутствуют |
| `https://edge.4-ai.site/` | HTTP 200 |
| `https://edge.4-ai.site/tariff-config` | HTTP 200; trial 30, month 990 ₽, year 9 504 ₽ |
| `/analytics/summary` prod/staging без admin auth | HTTP 401, endpoint защищён |
| Yandex API gateway root | HTTP 200 с текущей сети |

Эти проверки не доказывают доступность из РФ без VPN; для неё нужен manual sprint из двух точек.

## CI — Verified now

### App

- API smoke: success на feature branch.
- GitHub Pages workflow: success на feature branch, но production publication зависит от workflow semantics/main.
- Path guard: failure.
- Причина failure: `scripts/check-ui-architecture.sh` вызывает `rg`, которого нет на runner; последующие counters становятся ложными.

### Worker

- Последние 4 `Deploy Worker` на `main`: failure.
- Последний лог: non-interactive wrangler не получил `CLOUDFLARE_API_TOKEN`.
- Значение секрета в аудит не читалось и не записывалось.

## Monetization code — Code-present / Documented

- Public tariff config и admin API: app `docs/tasks/BACK-040-admin-tariff-map.md`, worker `worker.js`.
- Live tariff config уже публикует цену, хотя roadmap решение о цене отложено.
- CloudPayments test webhook: `pm/backlog.md:25`, WORK_LOG evidence.
- Telegram Stars: `pm/backlog.md:99`, app/worker code; live TG smoke не закрыт.
- VK Pay: `pm/backlog.md:97`, app/VK code; live/backend verified smoke не закрыт.
- YooKassa названа в task title/roadmap, но в критерии готовности фактического flow нет.

## Payment integrity — Code evidence

Проверить перед использованием отчёта против актуального SHA:

- CloudPayments webhook: `<worker-repo-root>\worker.js:2069-2113` — в текущем branch не видна обязательная provider signature и amount validation.
- Telegram Stars completion: `worker.js:2174-2216`, route около `3974-3975` — completion endpoint требует trusted-caller/charge validation.
- VK flow: app `index.html` payment section и `vk.html:1161-1183` — UI локально активирует Premium; server-side verification/update не доказаны.

Точные выводы собраны в `02-monetization.md`.

## Referral — Code-present

- app profile: `index.html:870-876`;
- adapter: `scripts/platform-adapter.js:95-145`;
- auth propagation: `scripts/auth-handlers.js`, `scripts/auth.js`;
- backend reward: `4e-worker/worker.js:696-712`;
- reward constant: `worker.js:34`;
- public user fields: `worker.js:1504-1518`.

Referral-коммиты присутствуют в feature branches, не в `origin/main`. Production frontend flow отсутствует.

## Analytics — Code-present, definition incorrect

`4e-worker/worker.js:888-915` считает users created за 1/7 дней и возвращает поле `retention`. Это не cohort return. `task-share` относится к передаче задачи исполнителю, а не social share.

## Product/activation — Documented / Code-present

- Vision/North Star: `shared/ROADMAP.md`.
- HOME before monetization decision: `shared/ROADMAP.md`, решение от 2026-07-12.
- ONBOARD-001: `pm/backlog.md:149`, `shared/ROADMAP.md`.
- Текущий onboarding: `index.html` первые четыре слайда; `obDone()` только открывает login.
- SMART-013 live staging evidence: `shared/WORK_LOG.md:1110-1116`.

## Promo — Verified file inventory

Канонический repo:

- `docs/marketing/СЦЕНАРИИ_РОЛИКОВ.md`;
- нет готовых видео/character assets/social exports.

Desktop source:

- `<legacy-desktop-copy>\roadmap_ai_bloger.md`;
- `<legacy-desktop-copy>\4-ai-blog\VK_CONTENT_PLAN.md`;
- старый blog package с placeholders и отсутствующими assets.

Эти desktop-файлы не переносились и не изменялись.

## Ограничения анализа

- Не использовались реальные секреты/admin credentials.
- Не создавались тестовые пользователи и платежи.
- Не проводился телефонный РФ-smoke.
- Не принимались юридические решения.
- Не менялись app/worker/PM файлы.
- Финансовые CAC/LTV выводы не делались из отсутствующих данных.
