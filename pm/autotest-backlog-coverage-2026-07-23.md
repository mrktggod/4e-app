# Autotest Coverage Map — 2026-07-23

Цель: понять, какие задачи из roadmap/backlog теперь можно проверять инструментами теста, где это уменьшает ручные действия Алексея, и что всё ещё остаётся живым gate.

## Короткий вывод

Автотесты уже могут убрать значительную часть ручной рутины по UI, privacy, accessibility, home/task/notification surfaces, VK/TG startup и static-load sanity.

Они не убирают полностью ручную проверку для реальных Telegram/VK контейнеров, уведомлений, микрофона, OAuth, оплаты и продуктовых решений. Но даже там автотесты должны сокращать ручной хвост до одной живой проверки вместо полного повторного прогона.

## Уже можно проверять почти без Алексея

| Backlog / bug | Что проверяем авто | Команды | Что остаётся вручную |
| --- | --- | --- | --- |
| `BACK-061` privacy link | Страница privacy открывается; можно добавить Playwright click по legal link | `npm run test:e2e:web`, `npm run smoke:privacy-surface` | Live click на проде после deploy, если менялся hosting |
| `BACK-062` auth legal accessibility | 44px hit areas, labels, live-region, auth a11y baseline | `npm run smoke:back050`, `npm run test:e2e:web` | Субъективный dark/light визуальный просмотр можно оставить выборочным |
| `BACK-050` accessibility baseline | Auth labels/errors, toast status/alert, dialog focus/restore | `npm run smoke:back050` | Один реальный keyboard smoke перед beta |
| `BUG-2026-07-23-001` / `HOME-001` | Home rows, show-all button, dashboard shell | `npm run smoke:home001`, `npm run test:e2e:telegram` | Реальный аккаунт, где баг был замечен, только как финальный acceptance |
| `BACK-065` task title normalization | AI/voice/quick-add examples preserve title/deadline/originalMsg | `npm run smoke:back065` | Live voice диктовка на телефоне, если менялся voice path |
| `BACK-066A` VK task intent | Cyrillic VK chat task command, title/deadline/originalMsg | `npm run smoke:back066-vk`, `npm run test:e2e:vk` | Реальный VK контейнер для полного UX |
| `BACK-055` notification action cards | Filters, unread badge, expand, snooze, go-to-task, done/write actions | `npm run smoke:back055` | Реальная доставка уведомления не покрывается |
| `BACK-067/068/069` task-detail iOS regressions | Reminder trigger, tag popup, hero overflow at 390x844 | `npm run smoke:back067-reminder`, `npm run smoke:back068-tag-popup`, `npm run smoke:back069-hero` | Один real iPhone/TMA visual smoke |
| `VIRAL-001/004/006` share cards | PNG builders, native share/download fallback, analytics hooks | `npm run smoke:viral-share` | Реальный share в VK Stories/TG на телефоне |
| `SMART-007` AI memory UI | Safe render, XSS guard, delete, clear, reload, empty/error states | `npm run smoke:smart007` | Privacy/product review при изменении смысла памяти |
| `BACK-037` / quality guard | JS syntax, CSS build, portable paths, UI architecture | `npm run check:js-syntax`, `npm run build:css`, `npm run check:ui-architecture`, `bash scripts/check-portable-paths.sh` | Нет, если задача чисто техническая |
| `INFRA-001` static frontend sanity | `/index.html`, `/vk.html`, `/privacy.html` return 200 under local load | `npm run load:smoke` | РФ-сеть/VPN доступность остаётся ручной |

## Можно сильно сократить ручной хвост, но не закрыть полностью

| Backlog / bug | Что автоматизировать дальше | Почему не полностью |
| --- | --- | --- |
| `BACK-035` QA smoke before beta | Сделать `npm run qa:prebeta` aggregator: e2e + key smokes + guards | Остаются живые Telegram/bot/voice/payment gates |
| `BACK-036` web fallback Telegram login | Playwright проверяет fallback UI, pending token, opening `https://t.me/...` или copy-command fallback | Telegram сам по-разному ведёт себя при существующей истории чата; нужен live Telegram |
| `BACK-041` bot-side return | Можно API/browser-check callback URL и token one-time UI | Реальный bot `/start auth_*` остаётся live Telegram |
| `BACK-045` VK ID / Яндекс ID OAuth | Playwright может проверить кнопки, callback error states, no broken shell | Реальный OAuth требует провайдера и аккаунта |
| `NEW-006` safe-area | Playwright/Chrome viewport checks nav/content overlap | Реальный Telegram safe area отличается от обычного browser viewport |
| `NEW-008` AI chat keyboard | DONE 2026-07-24: `autotests/tests/web/chat-keyboard.spec.ts` эмулирует `--app-keyboard-offset=260px`, фокус `#ask-field`, reserve ниже поля и отсутствие horizontal overflow; `npm run test:e2e:web` прошёл 14/14 | Реальная mobile keyboard/TMA всё ещё нужна |
| `PLAT-002` PWA shell | Playwright может проверить manifest, service worker, static routes | Установка PWA/иконки/store wrapper — ручной device smoke |
| `BACK-012` BEM cleanup | Для каждого BEM island: UI guard + closest smoke + Playwright screenshot | Визуальный дизайн иногда требует human review |
| `BACK-066` VK parity | DONE 2026-07-24: `autotests/tests/vk-app/basic.spec.ts` covers mocked VK startup, saved token auth, tasks/identities, home/detail/ask/calendar/stats/profile navigation and no fatal console/page errors; `npm run test:e2e:vk` прошёл 4/4 | Полный VK Mini App container, auth/session gray-zone, AI-chat gray-zone and VK Pay не мокать как Done |
| `ONBOARD-001` first AI plan | Staging fixture/fresh account Playwright can verify empty-home CTA paths | Voice/AI semantic “wow” и fresh-user feel лучше проверить человеком |
| `BETA-001` closed beta readiness | Autotest gate can prevent inviting users into broken build | Сам beta-run и feedback не автоматизируются |

## Всё ещё ручной или Yuri-only gate

| Area | Почему |
| --- | --- |
| `BACK-064` notification delivery/salience | Нужны real Telegram/device delivery, правильный пользователь, звук/вибрация |
| `NEW-001` morning briefing delivery | Нужна реальная доставка ботом в Telegram |
| `SMART-004` group task capture | Нужна реальная Telegram group, mapping участников и no-spam |
| `SMART-011` waiting-on-people ping | Нужна реальная группа/получатель/копирайт/no-spam |
| `BACK-009` VK Pay | Деньги/платёжный провайдер/entitlement — только отдельный approval |
| `BACK-010` Telegram Stars / ЮKassa / CloudPayments | Реальные платежи и price/business policy не автоматизировать ночью |
| `BACK-045` final OAuth Done | Live VK/Yandex account flow |
| `BACK-057` Offline Free Mode | До решения Юрия не расширять runtime; smoke можно написать только после keep/quarantine decision |
| `CAL-001/002/003` | Product/privacy decisions, не задача тестового инструмента |
| `BACK-063` desktop shell | Нужен продуктовый выбор: mobile-only guidance или desktop shell |

## Что стоит добавить следующим, чтобы снять ручную работу

1. `qa:prebeta` npm script.
   - Status: added as `npm run qa:prebeta`.
   - Состав: `check:js-syntax`, `check:cp1251-mojibake`, portable paths, `check:ui-architecture`, `test:e2e`, `smoke:home001`, `smoke:back050`, `smoke:back055`, `smoke:privacy-surface`, `smoke:viral-share`.
   - Польза: единая команда перед preview/beta вместо ручного списка.

2. Playwright auth/legal spec.
   - Status: added 2026-07-24 as `autotests/tests/web/auth-legal.spec.ts`.
   - Покрывает `BACK-061/062`: onboarding/login privacy link presence, login/register privacy opening, tab hit targets, password-eye 44px, forgot-link 44px, legal-link 44px and legal copy font size.
   - Польза: почти убирает ручной legal/auth UI smoke; остаётся live click после deploy/hosting changes.

3. Playwright navigation/safe-area spec.
   - Status: added 2026-07-24 as `autotests/tests/web/navigation-safe-area.spec.ts`.
   - Проверяет desktop 1366 and mobile 390: home bottom nav and global nav stay inside viewport, with no HTML/body horizontal overflow.
   - Польза: закрывает repeatable part of `NEW-006`, `BACK-046`, and part of glass redesign shell risk.

4. Playwright chat keyboard spec.
   - DONE 2026-07-24: добавлен `autotests/tests/web/chat-keyboard.spec.ts`; тест эмулирует `--app-keyboard-offset`, focus ask input, reserve под keyboard и no horizontal overflow на mobile/desktop.
   - Польза: `NEW-008` сокращён до финального real-device/TMA acceptance.

5. Playwright VK parity smoke.
   - DONE 2026-07-24: `autotests/tests/vk-app/basic.spec.ts` мокает VK launch, saved token, Worker auth/tasks/identities and checks home/list/detail/ask/calendar/stats/profile navigation with no fatal console/page errors.
   - Польза: `BACK-066` получает repeatable mocked guard без реального VK при каждом кодовом изменении.

6. Visual screenshot discipline for glass redesign.
   - Не включать жёсткие full-page baselines сразу.
   - Сначала сохранять screenshots as evidence in reports; затем стабилизировать component-level screenshot checks.

7. Local k6 stays canary only.
   - `load:smoke` полезен для static routes.
   - Staging load only after explicit brief; production load only after explicit human approval.

## Рекомендация по ночным сессиям

Включить автотесты в ночи обязательно, но дозированно:

- every night task: relevant narrow smoke + common guards;
- every UI/night design task: `npm run test:e2e`;
- every release/prebeta preparation: `npm run qa:prebeta`;
- local k6 only when touched hosting/static assets or before preview report;
- never use k6 production at night.

Это не уберёт Алексея из финальной проверки полностью, но должно убрать 60-80% повторяемой рутины: Алексей смотрит только живые платформенные вещи и продуктовый вкус, а не “открывается ли страница и не заехала ли кнопка”.
