# QA tooling и 4e-qa-lab — 2026-07-23

Статус: PROPOSAL / инструмент не внедрялся

## Рекомендация

Не покупать «одну магическую QA-платформу». Для 4 нужны три слоя:

1. Детерминированный browser/visual слой в репозитории.
2. Облачные реальные устройства для iOS/Android и установки Telegram/VK.
3. Короткий обязательный manual smoke внутри настоящих Telegram/VK WebView.

## Сравнение инструментов

| Инструмент | Сильная сторона для 4 | Ограничение | Роль |
| --- | --- | --- | --- |
| Playwright | device/theme/locale/permission emulation и встроенные screenshot baselines | emulation не воспроизводит host WebView, клавиатуру и реальный iOS; baselines чувствительны к окружению | Основной локальный/CI browser harness |
| BrowserStack App Live/App Automate | real iOS/Android, App Store/Play Store, несколько приложений, Appium, logs/video/network | подписка; нужно отдельно доказать вход в Telegram/VK тестовыми аккаунтами | Предпочтительный pilot для messenger-in-app flows |
| TestMu AI, бывший LambdaTest | real-device cloud, multi-device, Appium/Maestro, install из stores | маркетинговый AI-слой не заменяет детерминированные fixtures; нужен trial на наших WebView | Альтернатива BrowserStack |
| Sauce Labs | real devices, mobile browser/hybrid Appium, сильные logs и manual/automation | real-device plan заметно дороже локального слоя | Надёжная enterprise-альтернатива |
| AWS Device Farm | pay-as-you-go real devices, manual remote access, Appium endpoint, screenshots/video/logs | регион us-west-2 и возможная latency; установка Telegram/VK/account workflow требует отдельного pilot | Самый дешёвый точечный real-device probe |
| Kobiton | real-device/Appium, private/device-lab сценарии, session explorer | избыточен без собственного device lab | Ideal-later / enterprise |
| Maestro | простой YAML и user-visible selectors; Android WebView может использовать DevTools hierarchy | Web desktop support beta/Chromium-only; WebView accessibility бывает неполной | Дополнение для будущей native wrapper, не замена Playwright/Appium |
| Appium | native + hybrid/mobile web, переключение NATIVE_APP/WEBVIEW | Telegram/VK — чужие host apps; доступ к WebView зависит от debug/driver/device policy | Надёжный real-device automation слой после pilot |

Проверенные первичные источники:

- [Playwright visual comparisons](https://playwright.dev/docs/test-snapshots) и [device/theme emulation](https://playwright.dev/docs/next/emulation).
- [Telegram Mini Apps debug mode](https://core.telegram.org/bots/webapps): iOS через Safari на Mac, Android через chrome://inspect, Desktop beta через Inspect.
- [VK official starter](https://github.com/VKCOM/create-vk-mini-app): VK Tunnel и Eruda входят в рекомендуемый debug toolchain; [VK hosting deploy](https://github.com/VKCOM/vk-miniapps-deploy).
- [BrowserStack Appium real devices](https://www.browserstack.com/docs/app-automate/appium), [multi-app/App Store/Play Store support](https://www.browserstack.com/docs/app-live/app-management/test-dependent-apps).
- [TestMu AI rebrand/status](https://www.testmuai.com/lambdatest-is-now-testmuai/) и [real-device workflow](https://www.testmuai.com/support/docs/app-testing-on-real-devices/).
- [Sauce Labs real-device Appium](https://docs.saucelabs.com/mobile-apps/automated-testing/appium/real-devices/index.html).
- [AWS Device Farm real-device/manual/Appium](https://docs.aws.amazon.com/devicefarm/latest/developerguide/welcome.html) и [pricing](https://aws.amazon.com/device-farm/pricing/).
- [Kobiton Appium capabilities](https://docs.kobiton.com/automation-testing/capabilities/available-capabilities).
- [Maestro WebView known issue/workaround](https://docs.maestro.dev/extra-materials/troubleshooting/known-issues).

## Cheap-now

- Сохранить текущие Chrome/CDP smokes как functional layer.
- Добавить отдельный Playwright visual project только после согласования браузера и baseline environment: Chromium desktop, Chromium mobile emulation, WebKit emulation; dark/light; 360×800, 390×844, 430×932, 768×1024, 1366×768.
- Запускать один deterministic fixture без network-dependent user state.
- На Windows использовать Android Emulator/Chrome для дополнительного WebView-like smoke; iOS Simulator доступен как часть Xcode и потому локально требует Mac.
- Для P1 брать разовые AWS Device Farm минуты либо trial BrowserStack/TestMu; сначала проверить возможность установки Telegram/VK и входа fresh QA account.

## Reliable-next

- Playwright visual regression в CI на одном pinned container/OS.
- BrowserStack App Live pilot как основной ручной real-device lab; если account/install policy не подходит — TestMu AI, затем Sauce.
- Appium suite только для 5 критических flows: launch/auth, home, task-detail reminder/tag, AI-chat, notification permission/delivery.
- Telegram Android Debug WebView + реальный iPhone/Safari inspection для P1.
- VK Tunnel/Eruda для dev surface, плюс отдельный production VK smoke без deploy в рамках nightly audit.

## Ideal-later

- 4e-qa-lab как единый orchestrator.
- Cloud real-device contract с API export screenshots/video/network.
- Appium/Maestro flows для Android/iOS wrapper после появления TWA/Capacitor.
- Собственная небольшая device shelf или Kobiton private-device layer только при стабильной beta usage и регулярной потребности.

## Архитектура 4e-qa-lab

### 1. Scenario manifest

Каждый сценарий хранит:

- id, owner, priority, screen;
- surface: browser, pwa, telegram, vk, vk-web;
- build URL и expected API environment;
- viewport/device, theme, locale, timezone;
- fixture id и storage reset policy;
- steps/assertions;
- evidence required: screenshot, DOM metrics, console, network, manual note.

### 2. Fixture service

- Только fresh QA accounts и synthetic tasks.
- Stable IDs для short/long title, long tag, overdue, reminder, 41+ messages, empty/error/loading.
- Reset endpoint или local intercept должен быть staging-only и не затрагивать Yuri personal data.
- Token values никогда не попадают в artifact; только tokenPresent/tokenHashPrefix при отдельном security approval.

### 3. Environment reset

Перед каждым run:

- очистить cookies, localStorage, IndexedDB и Cache Storage по выбранному origin;
- unregister service worker либо явно выбрать warm-cache сценарий;
- дождаться controller и записать PWA_VERSION;
- сбросить theme, onboarding, offline queue и notification dedup;
- для VK сохранить launch surface/API base, для Telegram — только наличие initData, не его значение.

### 4. Capture и diff

- Full screen + component crops.
- DOM geometry: bounding boxes, overlap, scroll width, safe-area reserve.
- Pixel diff с mask для dynamic clock/avatar.
- Console/page errors и redacted network status.
- Baseline меняется только отдельным review; автопринятия нет.

### 5. Evidence exporter

Создаёт pm/outbox/REPORT-QA-LAB-<run>.md:

- commit/preview/surface/matrix cell;
- PASS/FAIL/NEEDS-REAL;
- actual vs baseline images;
- raw metrics;
- artifacts links;
- taxonomy и suggested owner;
- manual tail для Telegram/VK.

### Fail taxonomy

- VISUAL-OVERLAP
- VISUAL-CLIP
- SAFE-AREA
- KEYBOARD
- NAV-CONTRACT
- THEME-CONTRAST
- AUTH-SESSION
- API-CORS
- API-AUTH
- API-ENTITLEMENT
- CACHE-MIXED-VERSION
- HOST-WEBVIEW
- NEEDS-REAL

## Матрица первой версии

Screens: auth, home, focus, ask, task-detail, notifications, profile.

States: empty, nominal, long-content, keyboard-open, offline/reload, error.

Surfaces:

- local/staging browser: automated;
- PWA installed/warm cache: automated browser + manual iOS;
- Telegram Desktop/Android/iOS: manual at first, selective Appium later;
- VK web/mobile: manual at first, selective Appium later;
- standalone vk.html: browser automated.

## Первые пять atomic задач

1. QA-LAB-001 — manifest schema + 12 deterministic fixtures; docs/tests only.
2. QA-LAB-002 — browser capture runner for auth/home/ask/task-detail in dark/light at 360/390/430; baseline review required.
3. QA-LAB-003 — reset storage/SW/cache helper + warm/cold/mixed-version assertions.
4. QA-LAB-004 — PM exporter with redaction, raw metrics and NEEDS-REAL tails.
5. QA-LAB-005 — one-week provider pilot: BrowserStack App Live first, AWS Device Farm pay-as-you-go control; test Telegram/VK install, fresh account login, WebView inspectability, screenshots, keyboard and notification permission.

Дополнительный P2 brief: QA-ENC-001 — расширить mojibake guard на Unicode box-drawing U+2500–257F и U+2300 symbols. Текущий guard возвращает 0, хотя index.html содержит 823 фрагмента «в”Ђ» в комментариях и один пользовательский «вЊ„» вместо стрелки.

## Desktop notifications feasibility

Текущая база уже есть: in-app /notifications feed, settings API и service worker. Но service worker не содержит push/notificationclick handlers и нет push-subscription backend contract.

### Foreground MVP

NOTIF-DESKTOP-001 — NEED-CLAUDE:

- explicit user action запрашивает permission только на HTTPS;
- пока вкладка открыта, новый item из существующего /notifications feed вызывает system notification один раз;
- in-app feed остаётся fallback;
- denied/unsupported не ломает UI;
- Telegram/VK WebView получают capability check и остаются на host/bot/in-app delivery;
- никаких новых entitlement gates.

### Background Web Push

NOTIF-WEBPUSH-002 — NEED-YURI + security review:

- PushManager subscription, service-worker push и notificationclick;
- backend endpoints, VAPID/public key, per-user subscription lifecycle и unsubscribe;
- privacy/copy/rate limits;
- production secret deployment.

[MDN Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API) требует HTTPS и разрешение пользователя; [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API.) будит service worker через subscription. На iOS background Web Push доступен для добавленного на Home Screen web app и permission должен следовать прямому действию пользователя — [WebKit](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/). Поэтому browser/PWA support нельзя автоматически переносить на Telegram/VK WebView.

## Постоянный ручной хвост

Навсегда ручными остаются:

- iOS Telegram Mini App keyboard/safe-area/host toolbar;
- Android Telegram WebView permission and back behavior;
- VK mobile/web launch params, host theme и restore lifecycle;
- реальная доставка Telegram/VK notifications правильному пользователю;
- sound/vibration/background delivery;
- OAuth provider pages и store/payment surfaces.
