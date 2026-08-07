# REPORT: BRIEF-2026-08-02-120-telegram-web-menu-and-voice-buttons-regression

lessons_read: 0

## Результат

`NEED-YURI`, код не менялся. Канонические классы и источники оформления есть:
`styles/screens/home.less`, `styles/screens/voice.less` и
`styles/screens/light-redesign.less`; отсутствие исходных assets не является
причиной остановки.

## Что проверено

- `npm run smoke:telegram-bottom-menu` — PASS: Telegram mock в dark theme,
  dashboard navigation видима, legacy global nav скрыта; screenshot сохранён
  локально тестом.
- `npm run test:e2e:web` — PASS: 16/16, включая mobile и desktop navigation
  safe-area и видимый voice entrypoint.
- В canonical CSS присутствуют theme-specific rules для `.dash-bottom-nav`,
  `.dash-center-button` и `.ask-voice`.

## Почему остановка

Последний ручной QA сообщает разные визуальные симптомы на живом Telegram и
web/PWA, но безопасные mock поверхности их не подтвердили. Без screenshot,
устройства/viewport и точной поверхности нельзя выбрать платформенный CSS
контракт: общий фикс может сдвинуть web и Telegram в противоположные стороны.
Живая Telegram/device проверка относится к ручному хвосту.

## Что нужно Юрию

Приложить по одному dark-theme screenshot или короткой записи для Telegram Mini
App и web/PWA с названием устройства, viewport и видимой проблемой нижнего
меню/кнопок чата и голоса. После этого нужен отдельный атомарный brief с
измеримым target; production deploy и merge не выполнялись.
