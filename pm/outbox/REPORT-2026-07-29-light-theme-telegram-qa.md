# REPORT-2026-07-29-light-theme-telegram-qa

status: DONE
branch: feat/admin-tariff-api

## Summary
- Исправлена светлая тема Telegram dashboard: центральная нижняя кнопка снова видима, внешние рамки строк задач убраны, кнопка "Смотреть все задачи" скрыта.
- Убраны квадратные артефакты/тени на лого и уведомлениях через круглую обрезку и отключение псевдоэлементов.
- Исправлен task detail в светлой теме: страница скроллится, длинный заголовок/описание читаются в нормальном потоке, reminder-попап стал компактным.
- Усилены элементы блока статуса в светлой теме, чтобы линия и круги не терялись на фоне.

## Verification
- npm run build:css
- light theme geometry smoke via Playwright
- npm run smoke:iphone14-responsive
- npm run smoke:back067-reminder
- npm run smoke:telegram-bottom-menu
- npm run check:cp1251-mojibake
- git diff --check
