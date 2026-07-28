# REPORT-2026-07-29-telegram-ui-qa-polish

status: DONE
branch: feat/admin-tariff-api

## Summary
- Исправлен мобильный Telegram UI по фактическому QA: тег-попап задачи влезает в iPhone viewport, статус получил активную зелёную точку без квадратных теней, кнопки уведомлений на карточках задач убраны.
- Добавлен голосовой ввод в чат задачи и общий чат, подсказка голосовой кнопки на дашборде скрывается через 5 секунд и по клику.
- Дашборд компактнее на iPhone: профиль меньше и показывает фото, колокольчик видим, статусбар скрыт, метрики сжаты, кнопка “Сегодня” переключает период задач.
- Скрыты лишние “смотреть все задачи” и старое меню в календаре.

## Verification
- npm run build:css
- npm run smoke:back068-tag-popup
- npm run smoke:telegram-bottom-menu
- npm run smoke:voice-hold-hint
- npm run smoke:iphone14-responsive
- npm run check:cp1251-mojibake
- npm run check:js-syntax
- npm run test:e2e:telegram
- git diff --check
