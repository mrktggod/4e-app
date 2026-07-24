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
| `index.html` | 8661 | Telegram Mini App: HTML-экраны, JS-логика; CSS подключён из `styles.min.css` | Через `FILE_MAP_UI.md`, только нужный диапазон |
| `vk.html` | 1921 | VK Mini App: отдельная версия без Telegram SDK | Через `FILE_MAP_UI.md`, только нужный диапазон |
| `privacy.html` | 240 | Политика конфиденциальности | Можно читать целиком при правовых правках |
| `worker-static.js` | 187 | Лёгкий фронтовый Worker: раздаёт whitelist-сборку из Static Assets и маршрутизирует VK launch на `vk.html` без внешнего редиректа | Можно читать целиком; точка входа инфраструктуры INFRA-001 |
| `wrangler.toml` | 15 | Конфиг фронтового Worker и Static Assets для `app.4-ai.site/*` | Можно читать целиком при infra/deploy правках |
| `AGENTS.md` | 237 | Правила для Codex и агентов | Читать перед задачей |
| `CLAUDE.md` | 130 | Контекст проекта для Claude/Cowork | Читать при координации |
| `COWORK_INSTRUCTIONS.md` | 149 | Инструкции наблюдателя/координатора | Читать при планировании |
| `DEVELOPMENT_LOG.md` | 2687 | Канонический технический лог | Обновлять после значимых правок |
| `shared/ROADMAP.md` | 217 | Единственный roadmap продукта: стратегия, горизонты, решения, Now / Next / Later | Читать при планировании |
| `shared/WORK_LOG.md` | 10179 | Общий журнал задач команды | Обновлять после выполненной задачи |
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
| `scripts/back-065-task-title-normalization-smoke.mjs` | 55 | Static smoke for BACK-065 task title normalization: extracts the inline task-title helpers and verifies dictated/AI-chat examples preserve short title, deadline, and `originalMsg` | Run with `npm run smoke:back065` before changing task-title normalization |
| `scripts/back-066-vk-task-intent-smoke.mjs` | 47 | Static smoke for BACK-066A VK chat task intent: extracts `vk.html` helpers and verifies Cyrillic task commands, normalized title, deadline, and `originalMsg` source path | Run with `npm run smoke:back066-vk` before changing VK chat task creation |
| `scripts/vk-task-detail-edit-smoke.mjs` | 186 | Static smoke for VK task-detail edit path: extracts `vk.html` detail helpers and verifies title/status/priority/deadline update payload plus local task state persistence | Run with `npm run smoke:vk-task-detail-edit` before changing VK task detail edit behavior |
| `scripts/vk-home-parity-smoke.mjs` | 69 | Static smoke for VK home parity: extracts `vk.html` home helpers and verifies focus summary, urgent/overdue/next-deadline chips and top task row from mocked local tasks | Run with `npm run smoke:vk-home-parity` before changing VK home focus metadata |
| `scripts/vk-profile-parity-smoke.mjs` | 68 | Static smoke for VK profile parity: verifies account summary, identity summary, privacy link and local-only notification entry without touching payment/subscription | Run with `npm run smoke:vk-profile-parity` before changing VK profile structure |
| `scripts/vk-calendar-date-key-smoke.mjs` | 55 | Static smoke for VK calendar date keys: verifies ISO datetime deadlines stay on intended local days, calendar task dots render, and selected-day task lists match normalized keys | Run with `npm run smoke:vk-calendar-date-key` before changing VK calendar date grouping |
| `scripts/back-067-task-detail-reminder-smoke.mjs` | 249 | Headless Chrome/CDP smoke for task-detail reminder trigger at 390x844: verifies no `button > select`, 44x44 trigger, popover open, option select, and form value persistence | Run with `npm run smoke:back067-reminder` before changing task-detail reminder picker |
| `scripts/back-068-task-detail-tag-popup-smoke.mjs` | 236 | Headless Chrome/CDP smoke for task-detail tag editor at 390x844: verifies no native datalist, controlled suggestions, add, cancel, outside and Escape close, and viewport fit | Run with `npm run smoke:back068-tag-popup` before changing task-detail tag editor |
| `scripts/back-069-task-detail-hero-overflow-smoke.mjs` | 194 | Headless Chrome/CDP smoke for task-detail hero at 390x844: verifies long tag ellipsis, no title/description overlap with meta cards, bounded hero growth, and no horizontal overflow | Run with `npm run smoke:back069-hero` before changing task-detail hero layout |
| `scripts/viral-share-card-smoke.mjs` | 126 | Static smoke for VIRAL-001/004/006 share-card runtime: validates canvas PNG builders, streak/weekly helpers, native share, download fallback and lite analytics hooks | Run with `npm run smoke:viral-share` before promoting share-card evidence beyond source-only |
| `.githooks/pre-commit` | 5 | Локальный hook для запуска path guard и UI architecture guard перед commit | Активировать через `git config core.hooksPath .githooks` |
| `.github/workflows/path-guard.yml` | 15 | GitHub Actions quality guard: переносимые пути + UI architecture debt | Срабатывает на push и PR |

## Autotests

| File | Lines | Purpose | How to use |
| --- | ---: | --- | --- |
| `package.json` | 50 | npm scripts and dev dependencies, including Playwright e2e, k6 smoke and `qa:prebeta` commands | Read whole file when changing project tooling |
| `playwright.config.ts` | 45 | Playwright config for local static server, mobile/desktop Chromium projects and reports | Read whole file before changing e2e behavior |
| `autotests/README.md` | 28 | Autotest runbook for web, Telegram Mini App, VK Mini App and k6 load smoke | Read whole file when using or extending autotests |
| `autotests/tests/web/basic.spec.ts` | 12 | Playwright web smoke: app shell and privacy page | Run with `npm run test:e2e:web` |
| `autotests/tests/web/auth-legal.spec.ts` | 61 | Playwright auth/legal smoke: onboarding/login privacy links, login/register privacy opening, auth legal/tabs/password/forgot 44px targets | Run with `npm run test:e2e:web` before changing auth legal/accessibility UI |
| `autotests/tests/web/navigation-safe-area.spec.ts` | 76 | Playwright nav/safe-area smoke: synthetic auth shell, home/global nav inside viewport, no horizontal overflow on mobile and desktop projects | Run with `npm run test:e2e:web` before changing navigation, safe-area, or app shell layout |
| `autotests/tests/web/chat-keyboard.spec.ts` | 81 | Playwright chat keyboard smoke: synthetic auth shell, emulated `--app-keyboard-offset`, ask input focus, keyboard reserve, no horizontal overflow | Run with `npm run test:e2e:web` before changing AI chat input, keyboard offset, or ask layout |
| `autotests/tests/telegram-app/basic.spec.ts` | 34 | Playwright Telegram Mini App smoke with mocked `window.Telegram.WebApp` | Run with `npm run test:e2e:telegram` |
| `autotests/tests/vk-app/basic.spec.ts` | 38 | Playwright VK Mini App smoke with mocked `window.vkBridge` | Run with `npm run test:e2e:vk` |
| `autotests/load/smoke-load.js` | 20 | k6 local/static load smoke for `/index.html`, `/vk.html`, `/privacy.html` | Run with `npm run load:smoke`; set `BASE_URL`, `K6_VUS`, `K6_DURATION` explicitly for staging |
| `docs/qa/autotest-agent-playbook.md` | 101 | Agent-facing rules for when and how to use Playwright, k6, `qa:prebeta` and existing smoke tests | Read before UI/QA/night automation work |
| `pm/autotest-backlog-coverage-2026-07-23.md` | 102 | Backlog coverage map: what autotests can replace, reduce, or cannot cover | Read when choosing QA/night/autonomous tasks |
| `scripts/run-bash-script.mjs` | 29 | Cross-Windows npm wrapper for Git Bash based shell guards | Used by `npm run check:portable-paths` and `npm run check:ui-architecture` |

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
