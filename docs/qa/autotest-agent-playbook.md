# Autotest Agent Playbook

Этот файл для Codex, Claude и других ИИ-агентов проекта. Перед UI/QA/ночной работой проверяй здесь, какие автотесты уже можно использовать вместо ручного просмотра.

## Главная идея

Автотесты не заменяют живой Telegram/VK/iPhone/payment smoke, но должны снимать с Алексея повторяемую рутину:

- открывается ли app shell;
- не сломались ли web/TMA/VK entrypoints;
- не поехала ли базовая мобильная верстка;
- не вырос ли inline/UI-долг;
- работают ли уже покрытые сценарии задач, уведомлений, accessibility, privacy, share-card и VK task intent;
- отдаётся ли статика под лёгкой локальной нагрузкой.

Если задачу можно доказать автотестом, агент обязан сначала написать или запустить автотест, а не просить ручной smoke.

## Базовый набор команд

Минимум перед любым app-коммитом:

```bash
npm run check:js-syntax
node scripts/check-cp1251-mojibake.mjs
bash scripts/check-portable-paths.sh
git diff --check
```

Общий frontend canary:

```bash
npm run test:e2e
```

Пред-бета/preview gate:

```bash
npm run qa:prebeta
```

Поверхности отдельно:

```bash
npm run test:e2e:web
npm run test:e2e:telegram
npm run test:e2e:vk
```

Лёгкая локальная нагрузка:

```bash
npm run load:smoke
```

Для staging/preview Playwright можно запускать так:

```bash
BASE_URL=https://example-preview.pages.dev npm run test:e2e
```

Для k6 staging нужен отдельный осознанный запуск:

```bash
BASE_URL=https://example-preview.pages.dev K6_VUS=5 K6_DURATION=20s npm run load:smoke
```

Production k6 запрещён без отдельного явного решения человека.

## Что запускать по типу задачи

| Зона | Команды |
| --- | --- |
| Любая UI-правка | `npm run test:e2e:web` + релевантный smoke + guards |
| Home/dashboard | `npm run smoke:home001`, затем `npm run test:e2e:web` |
| Task cards/list | `npm run smoke:back019` |
| Task detail reminder/tag/hero | `npm run smoke:back067-reminder`, `npm run smoke:back068-tag-popup`, `npm run smoke:back069-hero` |
| Notifications action feed | `npm run smoke:back055` |
| Auth/accessibility/legal | `npm run smoke:back050`, `npm run smoke:privacy-surface`, `npm run test:e2e:web` |
| Telegram shell/startup | `npm run test:e2e:telegram` |
| VK shell/intent | `npm run test:e2e:vk`, `npm run smoke:back066-vk` |
| AI memory | `npm run smoke:smart007` |
| Chat history window | `npm run smoke:chat-history40` |
| Share cards / viral | `npm run smoke:viral-share` |
| BEM/inline cleanup | `npm run check:ui-architecture` + closest visual/runtime smoke |
| Static hosting/load sanity | `npm run load:smoke` |
| Pre-beta or preview readiness | `npm run qa:prebeta` |

## Ночные сессии

Ночной агент должен запускать автотесты в три шага:

1. До правки: выбрать релевантный smoke по задаче, если он уже есть.
2. После правки: запустить этот smoke, `npm run test:e2e` и общий guard-набор. Для preview/beta подготовки запускать `npm run qa:prebeta`.
3. В отчёте: указать raw evidence: команда, passed/failed, важные числа (`8/8`, `81/81`, `p95`, `0 suspicious tokens`).

Для ночей разрешено:

- local Playwright;
- local k6 smoke;
- staging Playwright на preview URL, если brief явно даёт preview или просит evidence upgrade;
- существующие staging fixture smoke только там, где они уже безопасны и описаны в задаче.

Для ночей запрещено:

- production k6;
- payment/entitlement live smoke;
- real Telegram/VK device QA вместо Юрия/Алексея;
- OAuth live smoke без отдельного brief;
- секреты в отчётах;
- merge в `main` или production deploy.

## Когда всё равно нужен человек

Ручной gate остаётся, если критерий зависит от:

- реального Telegram iOS/Android WebView;
- системного разрешения микрофона;
- звука, вибрации и доставки уведомлений;
- настоящего VK Mini App контейнера;
- VK Pay, Telegram Stars, CloudPayments/ЮKassa с деньгами;
- OAuth VK ID / Яндекс ID на реальном аккаунте;
- субъективного UX-решения: “понятно ли”, “приятно ли”, “достаточно ли заметно”.

Но даже в этих случаях агент должен сначала закрыть автоматизируемую часть, чтобы человек проверял только последний живой хвост.

## Как писать новые тесты

Правило: один баг или одна backlog-задача получает один узкий smoke.

Хороший smoke:

- создаёт synthetic fixture сам;
- не использует личные данные Юрия/Алексея;
- не требует real money;
- проверяет DOM/геометрию/состояние, а не только “страница открылась”;
- пишет понятный итог в stdout;
- добавляется в `package.json`;
- упоминается в `FILE_MAP.md`, `DEVELOPMENT_LOG.md`, `shared/WORK_LOG.md` и отчёте задачи.

Если тест требует staging secret, секрет не пишется в код или отчёт. В отчёте писать `<redacted>`.
