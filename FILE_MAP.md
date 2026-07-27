> 🔴 КАНОН ПРИЛОЖЕНИЯ — папка `X:\Projects\4-ai-secretary\app`.
> Старый checkout `X:\4\.tmp-4e-app-publish` не трогать.
> Копии `4e-app`, `4e-bot-repo`, `src\bot`, `.tmp-4e-app-p0`,
> `.tmp-docs-monetization-i18n` каноном не являются — в них не работать.
> Файлы проекта на диске C: не хранятся (см. AGENTS.md, раздел «Диск»).
# FILE MAP — 4e-app

Главный индекс репозитория. Читай этот файл перед работой с кодом, затем переходи в карту нужной зоны.

## Статус checkout

| Зона | Статус | Карта |
| --- | --- | --- |
| Mini App UI | В этом репозитории | `FILE_MAP_UI.md` |
| Cloudflare Worker | Отдельный репозиторий, локально не подключён | `FILE_MAP_WORKER.md` |
| Telegram bot | Отдельный репозиторий `mrktggod/4e-bot`, локально не подключён | `FILE_MAP_BOT.md` |
| PM / QA документы | Приватный репозиторий `mrktggod/4pm`; здесь только `pm/inbox`, `pm/outbox`, `docs/tasks` | `https://github.com/mrktggod/4pm` |

## Основные файлы

| Файл | Строк | Назначение | Как читать |
| --- | ---: | --- | --- |
| `index.html` | 9003 | Telegram Mini App: HTML-экраны, JS-логика; CSS подключён из `styles.min.css` | Через `FILE_MAP_UI.md`, только нужный диапазон |
| `vk.html` | 2022 | VK Mini App: отдельная версия без Telegram SDK | Через `FILE_MAP_UI.md`, только нужный диапазон |
| `landing.html` | 195 | Static sales landing preview for the main-domain path decision; does not replace app routing | Можно читать целиком при правках landing preview |
| `landing.css` | 535 | Green-glass landing styles and responsive product preview layout | Можно читать целиком при правках landing preview |
| `styles/screens/tasks.less` | 2988 | Source LESS for main task, home, task-detail, popover and chat/task UI surfaces | Edit source task UI styles here, then run `npm run build:css` |
| `styles.css` | 16096 | Built readable CSS from `styles/main.less`; consumed by local visual/smoke tooling | Regenerate with `npm run build:css`, do not hand-edit |
| `styles.min.css` | 1 | Minified CSS loaded by `index.html` in production/static app shell | Regenerate with `npm run build:css`, do not hand-edit |
| `privacy.html` | 240 | Политика конфиденциальности | Можно читать целиком при правовых правках |
| `worker-static.js` | 187 | Лёгкий фронтовый Worker: раздаёт whitelist-сборку из Static Assets и маршрутизирует VK launch на `vk.html` без внешнего редиректа | Можно читать целиком; точка входа инфраструктуры INFRA-001 |
| `wrangler.toml` | 15 | Конфиг фронтового Worker и Static Assets для `app.4-ai.site/*` | Можно читать целиком при infra/deploy правках |
| `AGENTS.md` | 312 | Правила для Codex и агентов | Читать перед задачей |
| `CLAUDE.md` | 130 | Контекст проекта для Claude/Cowork | Читать при координации |
| `COWORK_INSTRUCTIONS.md` | 149 | Инструкции наблюдателя/координатора | Читать при планировании |
| `DEVELOPMENT_LOG.md` | 3143 | Канонический технический лог | Обновлять после значимых правок |
| `https://github.com/mrktggod/4pm` | n/a | Приватные roadmap, work log, commit convention, PM/QA, team sync и бизнес-документация | Читать при планировании и PM/QA задачах |
| `scripts/platform-adapter.js` | 1235 | Shared frontend platform adapter: app/environment helpers, event binding utilities, auth UI helpers, calendar/statistics/home delegated actions, task-detail return/date confirm/reminder-card dispatch, and inline-handler value escaping | Read narrow helper/export ranges before moving inline JS from `index.html` or changing delegated screen actions |
| `scripts/task-ui-renderers.js` | 775 | Shared task/notification renderers and task card helpers, including swipe actions, inline completion feedback, active-card reminder entrypoint, calendar/task row click-through, and task-detail return-screen fallback helpers | Read narrow task renderer ranges before changing task cards, task completion controls, notification cards, calendar rows, reminders, or task-detail return behavior |
| `scripts/auth-handlers.js` | 696 | Auth and preview-demo handlers: login/register flows, dashboard preview routing, and preview-only state flags for visual QA | Read narrow preview/auth ranges before changing login or preview behavior |
| `scripts/check-portable-paths.sh` | 24 | Проверка, что в репозитории нет локальных абсолютных user-путей | Запускать перед коммитом |
| `scripts/check-ui-architecture.sh` | 78 | Guard против роста inline UI-долга в `index.html` | Запускать перед UI-коммитом |
| `scripts/back-019-task-card-smoke.mjs` | 526 | Headless Chrome/CDP smoke for BACK-019 task cards on 390x844 viewport: overflow, 2-line title clamp, tap/swipe actions, active-card reminder entrypoint, inline completion loading/success/failure state and duplicate-tap protection | Run with `npm run smoke:back019` before changing task-card renderer, card reminder action, or task completion controls |
| `scripts/back-055-notifications-smoke.mjs` | 340 | Headless Chrome/CDP smoke for BACK-055 notification action cards on 390x844 viewport: empty state, filters, unread badge, expand, snooze, go-to-task, done and write actions | Run with `npm run smoke:back055` before changing notification action-card renderer |
| `scripts/home-001-dashboard-smoke.mjs` | 630 | Headless Chrome/CDP smoke for HOME-001 dashboard: top-3 rows, metrics, nav routes, home/statistics/calendar task-detail return routes, focus card/popup counter consistency, statistics active-task empty-state clarity, dark/light screenshots, and 390/360/320 viewport edge geometry | Run with `npm run smoke:home001` before changing dashboard/home routing, task-detail return routing, calendar task rows, focus counters, statistics active-task copy, or visual shell |
| `scripts/iphone14-responsive-regression-smoke.mjs` | 179 | Playwright iPhone 14 width smoke for home task rows, task detail, statistics, date/time popover, bottom nav and long task titles without horizontal overflow | Run with `npm run smoke:iphone14-responsive` for focused mobile regression evidence |
| `scripts/back-050-accessibility-smoke.mjs` | 349 | Headless Chrome/CDP smoke for BACK-050 accessibility baseline: auth labels/errors, toast status/alert live-region, dialog ARIA/focus/restore on 390x844 viewport | Run with `npm run smoke:back050` before changing auth accessibility, toast behavior, or quick-add/contact/focus dialogs |
| `scripts/smart-007-memory-fixture-smoke.mjs` | 450 | Staging-only SMART-007 AI-memory fixture smoke with fresh synthetic account: saves safe facts, verifies `/ai/facts`, renders `#ai-memory-list`, delete-one and clear-all | Run with `npm run smoke:smart007` before promoting SMART-007 evidence beyond source-only |
| `scripts/auth-avatar-login-diagnose.mjs` | 269 | Live staging Chrome/CDP diagnostic for auth wrong-password UI and profile avatar localStorage leak/persistence behavior on fresh accounts | Run with `npm run smoke:auth-avatar` before fixing auth field errors or profile avatar persistence |
| `scripts/back-065-task-title-normalization-smoke.mjs` | 55 | Static smoke for BACK-065 task title normalization: extracts the inline task-title helpers and verifies dictated/AI-chat examples preserve short title, deadline, and `originalMsg` | Run with `npm run smoke:back065` before changing task-title normalization |
| `scripts/back-066-vk-task-intent-smoke.mjs` | 47 | Static smoke for BACK-066A VK chat task intent: extracts `vk.html` helpers and verifies Cyrillic task commands, normalized title, deadline, and `originalMsg` source path | Run with `npm run smoke:back066-vk` before changing VK chat task creation |
| `scripts/vk-task-detail-edit-smoke.mjs` | 199 | Static smoke for VK task-detail edit path: extracts `vk.html` detail helpers and verifies visible detail summary, return hint, title/status/priority/deadline update payload plus local task state persistence | Run with `npm run smoke:vk-task-detail-edit` before changing VK task detail edit behavior |
| `scripts/vk-home-parity-smoke.mjs` | 74 | Static smoke for VK home parity: extracts `vk.html` home helpers and verifies focus summary, metric notes, urgent/overdue/next-deadline chips and top task row from mocked local tasks | Run with `npm run smoke:vk-home-parity` before changing VK home focus metadata |
| `scripts/vk-profile-parity-smoke.mjs` | 68 | Static smoke for VK profile parity: verifies account summary, identity summary, privacy link and local-only notification entry without touching payment/subscription | Run with `npm run smoke:vk-profile-parity` before changing VK profile structure |
| `scripts/vk-calendar-date-key-smoke.mjs` | 55 | Static smoke for VK calendar date keys: verifies ISO datetime deadlines stay on intended local days, calendar task dots render, and selected-day task lists match normalized keys | Run with `npm run smoke:vk-calendar-date-key` before changing VK calendar date grouping |
| `scripts/vk-header-logo-smoke.mjs` | 22 | Static smoke for VK header identity: verifies the VK shell has one header logo and no duplicate home logo | Run with `npm run smoke:vk-header-logo` before changing VK header/home identity |
| `scripts/vk-task-complete-smoke.mjs` | 60 | Static smoke for VK task completion: verifies done-task payload, success refresh/local state and explicit failure toast | Run with `npm run smoke:vk-task-complete` before changing VK task completion |
| `scripts/profile-premium-banner-smoke.mjs` | 33 | Static smoke for profile premium/trial banner removal: verifies web/VK profile banners are gone and subscription entry points remain | Run with `npm run smoke:profile-premium-banner` before changing profile subscription/banner surfaces |
| `scripts/premium-task-action-denial-smoke.mjs` | 70 | Static smoke for Premium-required task action denials: verifies backend 402/403 task failures show explicit subscription UI before generic task error toasts | Run with `npm run smoke:premium-task-denial` before changing task action failure handling |
| `scripts/task-advice-manual-smoke.mjs` | 74 | Playwright smoke for task-detail advice generation: verifies opening a task does not call `/anthropic`, the placeholder stays visible, and the manual `Совет 4` click triggers one advice request with loading state | Run with `npm run smoke:task-advice-manual` before changing task-detail advice behavior |
| `scripts/task-chat-confirm-action-smoke.mjs` | 86 | Browser smoke for task-detail chat suggested-action confirm at 390x844: verifies fallback message id, one update mutation, hidden preview after confirm and updated description | Run with `npm run smoke:task-chat-confirm` before changing task-detail chat suggested actions |
| `scripts/task-toast-lifecycle-smoke.mjs` | 53 | Playwright smoke for task-detail toast lifecycle at 390x844: verifies success auto-hide, success dismiss-on-scroll and longer error readability | Run with `npm run smoke:task-toast-lifecycle` before changing toast behavior or task-detail success feedback |
| `scripts/premium-voice-gate-smoke.mjs` | 81 | Static smoke for expired-Premium voice gate: verifies voice opens subscription before listening and handles premium Worker-style errors | Run with `npm run smoke:premium-voice-gate` before changing voice Premium gate behavior |
| `scripts/voice-consent-checkbox-smoke.mjs` | 52 | Static smoke for biometric voice-consent checkbox visibility, 44px target, checked/focus state and unchanged legal copy | Run with `npm run smoke:voice-consent-checkbox` before changing voice consent checkbox behavior |
| `scripts/voice-exit-controls-smoke.mjs` | 77 | Static smoke for voice cancel/back behavior: verifies both controls call `closeVoice`, timers clear, recognition stops, and safe return screen is used | Run with `npm run smoke:voice-exit-controls` before changing voice close/cancel behavior |
| `scripts/voice-hold-hint-smoke.mjs` | 59 | Playwright DOM/visual smoke for the main-screen voice hold hint at 390x844: verifies text, button association, viewport bounds and no overlap with the center voice button | Run with `npm run smoke:voice-hold-hint` before changing the home voice affordance |
| `scripts/relative-time-copy-smoke.mjs` | 66 | Static smoke for task relative-time copy: verifies a 47-day-old legacy task shows exact age and never `недавно` | Run with `npm run smoke:relative-time-copy` before changing task created/date helpers |
| `scripts/back-067-task-detail-reminder-smoke.mjs` | 297 | Headless Chrome/CDP smoke for task-detail reminder trigger at 390x844: verifies no `button > select`, 44x44 trigger, popover open, option select, form value persistence, and robust Chrome discovery on Windows | Run with `npm run smoke:back067-reminder` before changing task-detail reminder picker |
| `scripts/back-068-task-detail-tag-popup-smoke.mjs` | 367 | Headless Chrome/CDP smoke for task-detail tag editor and date/time picker at 390x844: verifies tag popup behavior, datetime pending/cancel/outside/confirm save semantics, and date popover viewport geometry | Run with `npm run smoke:back068-tag-popup` before changing task-detail tag editor or date/time picker |
| `scripts/back-069-task-detail-hero-overflow-smoke.mjs` | 194 | Headless Chrome/CDP smoke for task-detail hero at 390x844: verifies long tag ellipsis, no title/description overlap with meta cards, bounded hero growth, and no horizontal overflow | Run with `npm run smoke:back069-hero` before changing task-detail hero layout |
| `scripts/viral-share-card-smoke.mjs` | 126 | Static smoke for VIRAL-001/004/006 share-card runtime: validates canvas PNG builders, streak/weekly helpers, native share, download fallback and lite analytics hooks | Run with `npm run smoke:viral-share` before promoting share-card evidence beyond source-only |
| `.githooks/pre-commit` | 5 | Локальный hook для запуска path guard и UI architecture guard перед commit | Активировать через `git config core.hooksPath .githooks` |
| `.github/workflows/path-guard.yml` | 34 | GitHub Actions quality guard: переносимые пути + UI architecture debt | Срабатывает на push и PR |

## Autotests

| File | Lines | Purpose | How to use |
| --- | ---: | --- | --- |
| `package.json` | 59 | npm scripts and dev dependencies, including Playwright e2e, k6 smoke and `qa:prebeta` commands | Read whole file when changing project tooling |
| `playwright.config.ts` | 45 | Playwright config for local static server, mobile/desktop Chromium projects and reports | Read whole file before changing e2e behavior |
| `autotests/README.md` | 28 | Autotest runbook for web, Telegram Mini App, VK Mini App and k6 load smoke | Read whole file when using or extending autotests |
| `autotests/tests/web/basic.spec.ts` | 12 | Playwright web smoke: app shell and privacy page | Run with `npm run test:e2e:web` |
| `autotests/tests/web/auth-legal.spec.ts` | 61 | Playwright auth/legal smoke: onboarding/login privacy links, login/register privacy opening, auth legal/tabs/password/forgot 44px targets | Run with `npm run test:e2e:web` before changing auth legal/accessibility UI |
| `autotests/tests/web/navigation-safe-area.spec.ts` | 76 | Playwright nav/safe-area smoke: synthetic auth shell, home/global nav inside viewport, no horizontal overflow on mobile and desktop projects | Run with `npm run test:e2e:web` before changing navigation, safe-area, or app shell layout |
| `autotests/tests/web/chat-keyboard.spec.ts` | 111 | Playwright chat keyboard smoke: synthetic auth shell, visible AI chat voice entrypoint wired to `openVoice()`, emulated `--app-keyboard-offset`, ask input focus, keyboard reserve, no horizontal overflow | Run with `npm run test:e2e:web` or focused `npx playwright test autotests/tests/web/chat-keyboard.spec.ts` before changing AI chat input, voice entrypoint, keyboard offset, or ask layout |
| `autotests/tests/telegram-app/basic.spec.ts` | 34 | Playwright Telegram Mini App smoke with mocked `window.Telegram.WebApp` | Run with `npm run test:e2e:telegram` |
| `autotests/tests/vk-app/basic.spec.ts` | 168 | Playwright VK Mini App smoke with mocked `window.vkBridge`, saved token, mocked Worker auth/tasks/identities, and home/detail/ask/calendar/stats/profile navigation parity | Run with `npm run test:e2e:vk` before changing VK shell, task rendering, or safe VK navigation |
| `autotests/load/smoke-load.js` | 20 | k6 local/static load smoke for `/index.html`, `/vk.html`, `/privacy.html` | Run with `npm run load:smoke`; set `BASE_URL`, `K6_VUS`, `K6_DURATION` explicitly for staging |
| `https://github.com/mrktggod/4pm` | n/a | Приватные QA playbook и backlog coverage docs | Read before UI/QA/night automation work |
| `scripts/run-bash-script.mjs` | 29 | Cross-Windows npm wrapper for Git Bash based shell guards | Used by `npm run check:portable-paths` and `npm run check:ui-architecture` |

## PM / QA

| Файл | Назначение |
| --- | --- |
| `https://github.com/mrktggod/4pm` | Приватные bugs, backlog, QA checklist, release checklist, assistant evaluation, agent inbox, next actions |
| `pm/inbox/` | Входящие операционные BRIEF-файлы |
| `pm/outbox/` | Операционные REPORT-файлы |
| `docs/tasks/` | Архив атомарных задач |

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
