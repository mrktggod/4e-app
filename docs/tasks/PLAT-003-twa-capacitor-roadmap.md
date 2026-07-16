# PLAT-003 — Google Play TWA → App Store Capacitor

Статус документа: draft, подготовлено 2026-07-16.

Цель: вывести 4 в mobile stores без преждевременной тяжёлой нативной разработки.

## Принцип

Сначала использовать PWA/TWA как тонкую обёртку вокруг существующего web-app. Нативные возможности добавлять только там, где они дают реальную пользу:

- push actions;
- widgets;
- share sheet;
- voice shortcuts;
- calendar integration.

## Phase 0 — PWA readiness

Зависимость: `PLAT-002`.

Готово частично:

- `manifest.webmanifest`;
- service worker;
- standalone shell;
- basic offline shell.

Нужно перед переходом дальше:

- PNG/maskable icons нужных размеров;
- installed-PWA smoke на Android;
- проверка, что service worker не мешает свежим деплоям;
- production domain smoke без staging-only assumptions.

## Phase 1 — Google Play через TWA

Цель: минимальная Android-публикация с сохранением web runtime.

Подготовить:

- Android package name;
- Digital Asset Links для домена `app.4-ai.site`;
- TWA wrapper;
- app icon/splash;
- privacy policy URL;
- screenshots;
- test track.

Риски:

- auth через Telegram/VK/Yandex должен работать внутри TWA;
- внешние OAuth redirect должны возвращаться в app;
- payment flow должен соответствовать правилам Google Play;
- если продаются цифровые функции внутри Android app, нужно отдельно проверить Play Billing requirements.

DoD Phase 1:

- app открывает production home;
- signup/login проходят;
- task create/done проходят;
- AI-chat проходит один smoke;
- external auth не застревает;
- privacy policy открывается;
- internal test track загружен.

## Phase 2 — App Store через Capacitor

Apple, вероятно, потребует больше нативности и внимания к платежам.

Подготовить:

- Capacitor shell;
- iOS bundle id;
- app icon/splash;
- privacy nutrition labels;
- Sign in / account deletion review;
- IAP/payment policy decision;
- push permissions copy;
- review notes explaining AI/task assistant value.

Риски:

- Apple может отклонить слишком тонкую webview-обёртку;
- цифровая подписка внутри iOS может требовать In-App Purchase;
- внешние оплаты и ссылки должны быть проверены юридически/продуктово;
- Telegram/VK-specific flows могут быть неуместны как основной iOS path.

DoD Phase 2:

- app работает без Telegram/VK SDK как standalone;
- signup/login через email проходит;
- account deletion/help/privacy доступны;
- payment/paywall copy соответствует выбранной iOS policy;
- TestFlight smoke пройден.

## Что не делать сейчас

- Не начинать App Store до закрытого beta-run.
- Не менять цены/платёжные правила внутри этой задачи.
- Не переносить весь UI в native.
- Не добавлять native calendar/push/widgets до отдельных `NATIVE-*` задач.

## Связанные задачи

- `PLAT-002`: PWA/RuStore groundwork.
- `NATIVE-002`: push actions.
- `NATIVE-004`: widgets/share sheet.
- `NATIVE-003`: voice shortcuts.
- `BACK-058`: profile/OAuth data and consent boundaries.

## Definition of Done

`PLAT-003` можно закрывать только после:

- Google Play internal test build установлен и проходит smoke;
- решение по iOS payment policy зафиксировано;
- TestFlight или documented App Store path подготовлен;
- все manual smoke results записаны в `shared/WORK_LOG.md`.
