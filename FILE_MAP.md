# FILE MAP — 4e-app

Главный индекс репозитория. Читай этот файл перед работой с кодом, затем переходи в карту нужной зоны.

## Статус checkout

| Зона | Статус | Карта |
| --- | --- | --- |
| Mini App UI | В этом репозитории | `FILE_MAP_UI.md` |
| Cloudflare Worker | Отдельный репозиторий, локально не подключён | `FILE_MAP_WORKER.md` |
| Telegram bot | Отдельный репозиторий `mrktggod/4e-bot`, локально не подключён | `FILE_MAP_BOT.md` |
| PM / QA документы | В этом репозитории, папка `pm/` | Этот файл + документы в `pm/` |

## Основные файлы

| Файл | Строк | Назначение | Как читать |
| --- | ---: | --- | --- |
| `index.html` | 8608 | Telegram Mini App: HTML-экраны, JS-логика; CSS подключён из `styles.min.css` | Через `FILE_MAP_UI.md`, только нужный диапазон |
| `vk.html` | 1622 | VK Mini App: отдельная версия без Telegram SDK | Через `FILE_MAP_UI.md`, только нужный диапазон |
| `privacy.html` | 240 | Политика конфиденциальности | Можно читать целиком при правовых правках |
| `worker-static.js` | 187 | Лёгкий фронтовый Worker: раздаёт whitelist-сборку из Static Assets и маршрутизирует VK launch на `vk.html` без внешнего редиректа | Можно читать целиком; точка входа инфраструктуры INFRA-001 |
| `wrangler.toml` | 15 | Конфиг фронтового Worker и Static Assets для `app.4-ai.site/*` | Можно читать целиком при infra/deploy правках |
| `AGENTS.md` | 237 | Правила для Codex и агентов | Читать перед задачей |
| `CLAUDE.md` | 130 | Контекст проекта для Claude/Cowork | Читать при координации |
| `COWORK_INSTRUCTIONS.md` | 149 | Инструкции наблюдателя/координатора | Читать при планировании |
| `DEVELOPMENT_LOG.md` | 1947 | Канонический технический лог | Обновлять после значимых правок |
| `shared/ROADMAP.md` | 159 | Единственный roadmap продукта: стратегия, горизонты, решения, Now / Next / Later | Читать при планировании |
| `shared/WORK_LOG.md` | 9615 | Общий журнал задач команды | Обновлять после выполненной задачи |
| `shared/COMMIT_CONVENTION.md` | 64 | Правила понятных заголовков коммитов | Читать перед коммитом |
| `docs/git-team-rules.md` | 104 | Git-процесс команды: ветки, commit, push/merge, согласование рисков | Читать при push/merge/ветках |
| `docs/team-sync-protocol.md` | 169 | Team Sync: ключевые фразы `Что там у Лехи?` / `Что там у Юры?`, commit/push и отчёты | Читать при синхронизации Алексея и Юрия |
| `docs/ui-architecture-rules.md` | 44 | UI-правило: HTML=структура, LESS=стили, JS=поведение, BEM и legacy policy | Читать перед UI-правками |
| `scripts/platform-adapter.js` | 1188 | Shared frontend platform adapter: app/environment helpers, event binding utilities, auth UI helpers, and inline-handler value escaping | Read narrow helper/export ranges before moving inline JS from `index.html` |
| `scripts/auth-handlers.js` | 696 | Auth and preview-demo handlers: login/register flows, dashboard preview routing, and preview-only state flags for visual QA | Read narrow preview/auth ranges before changing login or preview behavior |
| `scripts/check-portable-paths.sh` | 21 | Проверка, что в репозитории нет локальных абсолютных user-путей | Запускать перед коммитом |
| `scripts/check-ui-architecture.sh` | 78 | Guard против роста inline UI-долга в `index.html` | Запускать перед UI-коммитом |
| `scripts/back-019-task-card-smoke.mjs` | 330 | Headless Chrome/CDP smoke for BACK-019 task cards on 390x844 viewport: overflow, 2-line title clamp, tap and swipe actions | Run with `npm run smoke:back019` before changing task-card renderer |
| `scripts/back-055-notifications-smoke.mjs` | 340 | Headless Chrome/CDP smoke for BACK-055 notification action cards on 390x844 viewport: empty state, filters, unread badge, expand, snooze, go-to-task, done and write actions | Run with `npm run smoke:back055` before changing notification action-card renderer |
| `scripts/home-001-dashboard-smoke.mjs` | 496 | Headless Chrome/CDP smoke for HOME-001 dashboard at 390x844: top-3 rows, metrics, nav routes, dark/light screenshots | Run with `npm run smoke:home001` before changing dashboard/home routing or visual shell |
| `scripts/back-050-accessibility-smoke.mjs` | 349 | Headless Chrome/CDP smoke for BACK-050 accessibility baseline: auth labels/errors, toast status/alert live-region, dialog ARIA/focus/restore on 390x844 viewport | Run with `npm run smoke:back050` before changing auth accessibility, toast behavior, or quick-add/contact/focus dialogs |
| `scripts/smart-007-memory-fixture-smoke.mjs` | 450 | Staging-only SMART-007 AI-memory fixture smoke with fresh synthetic account: saves safe facts, verifies `/ai/facts`, renders `#ai-memory-list`, delete-one and clear-all | Run with `npm run smoke:smart007` before promoting SMART-007 evidence beyond source-only |
| `scripts/auth-avatar-login-diagnose.mjs` | 269 | Live staging Chrome/CDP diagnostic for auth wrong-password UI and profile avatar localStorage leak/persistence behavior on fresh accounts | Run with `npm run smoke:auth-avatar` before fixing auth field errors or profile avatar persistence |
| `scripts/viral-share-card-smoke.mjs` | 126 | Static smoke for VIRAL-001/004/006 share-card runtime: validates canvas PNG builders, streak/weekly helpers, native share, download fallback and lite analytics hooks | Run with `npm run smoke:viral-share` before promoting share-card evidence beyond source-only |
| `.githooks/pre-commit` | 5 | Локальный hook для запуска path guard и UI architecture guard перед commit | Активировать через `git config core.hooksPath .githooks` |
| `.github/workflows/path-guard.yml` | 15 | GitHub Actions quality guard: переносимые пути + UI architecture debt | Срабатывает на push и PR |

## PM / QA

| Файл | Назначение |
| --- | --- |
| `pm/bugs.md` | Сбор багов, входящие, активные, отчёт для разработки |
| `pm/backlog.md` | Фичи, улучшения, техзадачи |
| `pm/qa-checklist.md` | Smoke, regression areas, acceptance criteria |
| `pm/release-checklist.md` | Проверки до/после релиза |
| `pm/assistant-evaluation.md` | Рубрика оценки качества AI-ассистента |
| `pm/agent-inbox/` | Короткие запросы между Codex, Claude Юры и командой до утверждения решений |
| `pm/next-actions.md` | Ближайший рабочий план: Git-процесс, QA, legal/infra blockers, закрытый тест, монетизация |

## Правила чтения больших файлов

1. Не читать `index.html` целиком без необходимости.
2. Для UI сначала открыть `FILE_MAP_UI.md`.
3. Найти экран, функцию или диапазон строк.
4. Читать только нужный диапазон через `sed -n 'start,endp' file`.
5. После изменения экранов, функций, эндпоинтов или крупных блоков обновить соответствующий `FILE_MAP*.md`.

## Проверки перед разработкой

| Проверка | Команда |
| --- | --- |
| Старт работы | Проверить ветку и статус; рискованные `pull --rebase`, push/merge согласовывать отдельно |
| Git-статус | `git status --short` |
| Текущая ветка | `git branch --show-current` |
| Remote | `git remote -v` |
| UI-архитектура | `bash scripts/check-ui-architecture.sh` |
| Локальная раздача | `python3 -m http.server 8000` |
| Smoke URL | `http://127.0.0.1:8000/index.html`, `/vk.html`, `/privacy.html` |

## Кодировка

При правках `index.html` и других файлов с кириллицей не использовать PowerShell `Set-Content`, `Out-File`, `-replace`. Проверять кириллицу до и после правки по маркерам `Войти|Задачи|Сегодня`.
