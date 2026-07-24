# QA Lab и приём багов от клиентов — 2026-07-24

Этот документ фиксирует, как нам дальше уменьшать ручную проверку, не обманывая себя. Идея простая: всё, что машина может проверять надёжно, должна проверять машина. Человек остаётся там, где нужен реальный телефон, реальный Telegram/VK контейнер, платежи, звук, вибрация, OAuth или продуктовый вкус.

## Что уже есть

У нас уже сильная база:

- `npm run qa:prebeta` — общий пред-бета gate.
- Playwright для web, Telegram mock и VK mock.
- Узкие smoke-тесты для home, task cards, notifications, task detail reminder/tag/hero, privacy, accessibility baseline, VK parity, AI memory, viral/share.
- `k6` как лёгкий локальный static-load smoke.
- Guard'ы на JavaScript syntax, кодировку, portable paths и рост inline UI-долга.

Этого уже достаточно, чтобы Алексей не проверял руками “открылась ли страница” и “не уехала ли кнопка” после каждой правки.

## Что добавляем дальше

### 1. Axe-core accessibility

Что это: бесплатный accessibility engine для автоматической проверки HTML UI. Он не заменяет ручную проверку удобства, но ловит много формальных ошибок: отсутствующие labels, неправильные роли, плохие связи `aria-*`, часть проблем контраста.

Почему подходит нам:

- у нас уже есть Playwright;
- есть `BACK-050`, `BACK-061`, `BACK-062`;
- можно добавить как отдельный Playwright spec, без новых серверов и без секретов.

Первый шаг: `QA-LAB-001` — поставить `@axe-core/playwright`, сделать smoke для auth/home/task detail/ask/profile в mock-состоянии и включить в `qa:prebeta` сначала как строгий gate только для критичных violations.

Риск: axe может давать шум на старом legacy UI. Поэтому сначала проверяем 3-5 ключевых экранов, а не весь `index.html` разом.

Источник: [axe-core GitHub](https://github.com/dequelabs/axe-core), [axe-core npm packages](https://github.com/dequelabs/axe-core-npm).

### 2. Playwright visual screenshots

Что это: Playwright умеет сохранять эталонные screenshots и сравнивать новые снимки с ними через `expect(page).toHaveScreenshot()`.

Почему подходит нам:

- сейчас идёт glass-дизайн, где важны не только DOM-состояния, но и внешний вид;
- можно начать не с жёсткого full-page сравнения, а с маленьких стабильных компонентов: notification card, task card, reminder popup, auth legal block;
- это бесплатно, потому что Playwright уже установлен.

Первый шаг: `QA-LAB-002` — завести screenshot evidence режим для glass-срезов. Сначала сохранять screenshots в отчёты и assets, потом включать строгие baseline checks только для стабильных компонентных блоков.

Риск: full-page screenshots часто flaky из-за шрифтов, дат, времени, анимаций и разной ОС. Поэтому не делаем сразу “весь экран должен совпасть пиксель в пиксель”.

Источник: [Playwright Visual comparisons](https://playwright.dev/docs/test-snapshots).

### 3. Lighthouse CI

Что это: бесплатный CI-инструмент для Lighthouse-аудитов. Проверяет performance, accessibility, best practices, SEO/PWA-сигналы и может хранить отчёты.

Почему подходит нам:

- полезен перед preview/beta, чтобы видеть, не выросла ли тяжесть фронта;
- можно запускать на локальной статике и на staging preview;
- сначала можно сделать non-blocking report, чтобы не стопорить разработку ложными бюджетами.

Первый шаг: `QA-LAB-003` — добавить Lighthouse CI config для `/index.html`, `/vk.html`, `/privacy.html`; первое время только report, потом мягкие thresholds.

Риск: Telegram/VK Mini App shell в обычном браузере не равен реальному контейнеру. Lighthouse помогает по веб-слою, но не доказывает TMA/VK UX.

Источник: [Lighthouse CI getting started](https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/getting-started.md).

### 4. OWASP ZAP baseline

Что это: бесплатный passive security scan. Baseline scan не делает активных атак; он spider'ит target и ждёт passive scanning.

Почему подходит нам:

- полезно для публичных preview/staging страниц;
- можно запускать на static/app-shell, privacy и login surface;
- хорошо ловит часть security headers и очевидные web-слабости.

Первый шаг: `QA-LAB-004` — подготовить non-blocking ZAP baseline для staging preview без auth, без payload attacks, без production. Результаты сначала идут как report для triage.

Риск: security-шум и false positives. Любой результат рядом с auth/security/payment должен идти через Claude/Yuri review, а не чиниться ночью импульсно.

Источник: [OWASP ZAP Baseline Scan](https://www.zaproxy.org/docs/docker/baseline-scan/), [ZAP baseline GitHub Action](https://github.com/marketplace/actions/zap-baseline-scan).

### 5. Наблюдаемость без платного SaaS

Что это: минимальный runtime trace/log контур, чтобы понять, где пользователь застрял.

Что можно бесплатно:

- lite-events, которые у нас уже есть;
- Playwright trace/video на CI failures;
- OpenTelemetry browser позже, если понадобится общий формат событий.

Что не делаем сейчас:

- не подключаем платный monitoring SaaS ради красивой панели;
- не пишем персональные данные в логи;
- не собираем полные скриншоты/DOM без явного согласия.

Источник: [OpenTelemetry JavaScript browser docs](https://opentelemetry.io/docs/languages/js/getting-started/browser/).

## Как меняется рабочий процесс

### Быстрый локальный gate

Для маленькой UI-правки:

```bash
npm run check:js-syntax
npm run check:cp1251-mojibake
npm run check:portable-paths
npm run check:ui-architecture
npm run test:e2e:web
```

Плюс один узкий smoke по зоне.

### Preview / pre-beta gate

Перед preview или beta:

```bash
npm run qa:prebeta
```

После внедрения QA Lab туда добавятся:

- `npm run test:a11y` на axe-core;
- выбранные visual checks для стабильных компонентов;
- Lighthouse CI report;
- ZAP baseline только по отдельному brief и только на staging/preview.

### Ночной режим

Ночь должна брать такие задачи:

1. есть clear brief;
2. есть узкий тест;
3. нет production/main/payment/entitlement/CAL/secrets;
4. можно честно написать raw proof.

Если задача требует реального телефона или пользователя, ночь закрывает только автоматическую часть и оставляет `manual tail`.

## Система приёма багов от клиентов

Нам нужен простой канал, чтобы клиент мог отправить баг без знания GitHub, backlog и IT-слов.

### MVP-путь

Клиент пишет боту:

```text
/bug
```

Бот задаёт короткие вопросы:

1. Где было? Например: Telegram, VK, сайт, оплата, профиль, задачи, чат.
2. Что ты сделал?
3. Что произошло?
4. Как должно было быть?
5. Можешь прислать скриншот или видео?
6. Насколько мешает: блокирует / сильно / терпимо / косметика?

После этого бот отвечает:

```text
Спасибо, баг принят. Номер: CLIENT-BUG-2026-07-24-001.
Мы проверим актуальность на свежей версии и вернёмся, если нужны детали.
```

### Что сохраняем

Минимальный формат:

```yaml
id: CLIENT-BUG-YYYY-MM-DD-NNN
source: client
reported_at: ISO date
reporter_ref: telegram user id hash или internal id
surface: telegram | vk | web | payment | profile | tasks | ai-chat | other
app_url_or_build: если есть
environment: device / OS / app container, если известно
steps: ...
actual: ...
expected: ...
severity_hint: blocker | strong | tolerable | cosmetic
attachments: telegram file_id или R2 key
status: NEW | NEEDS-REPRO | CONFIRMED | DUPLICATE | STALE | CLOSED
privacy_note: user consent captured
```

### Где хранить скриншоты

MVP:

- Telegram `file_id` в bot-side хранилище или GitHub issue body без публичной картинки;
- в PM-файлах пишем только ссылку/референс, без личных данных.

Если нужно хранить файлы самим:

- Cloudflare R2 подходит как дешёвое/free-tier object storage;
- хранить только после согласия;
- retention 30-90 дней;
- публичные ссылки не делать по умолчанию.

Источник: [Telegram Bot API](https://core.telegram.org/bots/api), [Cloudflare R2 pricing](https://developers.cloudflare.com/r2/pricing/).

### Как баг попадает в план

1. Bot принимает заявку и даёт `CLIENT-BUG-*`.
2. Bot создаёт GitHub issue или отправляет запись в командный канал.
3. Codex/Claude триажит: это баг, вопрос, идея, дубль или старая версия.
4. Если баг актуален, он получает обычный `BUG-YYYY-MM-DD-NNN` и ссылку на client source.
5. В `pm/bugs.md` обязательно пишем `source: client`.
6. Если баг не воспроизводится на свежей версии, статус `STALE` или `NEEDS-REPRO`, а не “закрыто молча”.

Источник: [GitHub Issues REST API](https://docs.github.com/en/rest/issues).

### Проверка актуальности

Баг от клиента нельзя сразу брать в разработку. Сначала:

- проверить, на какой версии/ссылке он был;
- сравнить с текущим staging/prod;
- поискать дубли в `pm/bugs.md`;
- если есть скрин, проверить, не относится ли он к старому дизайну;
- если воспроизводится, поднять до обычного bug/backlog item;
- если не воспроизводится, оставить `NEEDS-REPRO` и попросить клиента повторить на свежей ссылке.

## Что нельзя честно заменить автоматикой

Автоматика не заменит:

- реальную доставку Telegram/VK уведомлений;
- звук и вибрацию;
- live OAuth VK ID / Яндекс ID;
- live payment;
- субъективное “понятно ли клиенту”;
- доверие к privacy/copy;
- проверку на реальном телефоне внутри Telegram/VK контейнера.

Но автоматика должна убрать подготовительную часть: к ручной проверке должен доходить только уже зелёный preview.

## Очередь внедрения

1. `QA-LAB-001`: axe-core Playwright accessibility smoke.
2. `QA-LAB-002`: visual screenshot discipline для glass/design правок.
3. `QA-LAB-003`: Lighthouse CI report для preview/prebeta.
4. `QA-LAB-004`: OWASP ZAP baseline для staging preview, non-blocking.
5. `FEEDBACK-002`: клиентский `/bug` intake через Telegram bot + GitHub/PM triage.

## Решение на сейчас

Рекомендация: начать с `QA-LAB-001`, потому что это самый дешёвый и быстрый прирост качества. После него идти в visual screenshots для glass-работы. Клиентский intake проектировать параллельно, но runtime делать только после доступа/brief по bot repo `mrktggod/4e-bot`.

