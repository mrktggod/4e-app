status: DONE

# REPORT-BRIEF-2026-07-27-82-vk-dashboard-separate-surface-parity

## Что сделано

Сделал узкое VK-only улучшение главного экрана: четыре метрики на VK dashboard теперь ближе к web/TG home и показывают не только число, но и короткую подпись:

- `Выполнено`: `нет закрытых` или сколько закрыто;
- `Задачи`: `спокойный день` или сколько задач в работе;
- `Обещания`: `без просрочек` или сколько обещаний;
- `Прогресс`: `нет данных` или `неделя`.

Это не копирование web/TG shell. VK остаётся отдельной поверхностью в `vk.html`.

## Что не трогалось

- VK auth/session не менялись.
- VK Pay, платежи и entitlement не менялись.
- Production и `main` не трогались.
- `index.html` не менялся для этой задачи.

## Изменённые файлы

- `vk.html`
- `scripts/vk-home-parity-smoke.mjs`
- `FILE_MAP.md`
- `FILE_MAP_UI.md`
- `pm/inbox/BRIEF-2026-07-27-82-vk-dashboard-separate-surface-parity.md`

## Проверка

- `npm run smoke:vk-home-parity`: PASS.
- `npm run smoke:vk-header-logo`: PASS.
- `npm run test:e2e:vk`: 4 passed.
- `node scripts/check-cp1251-mojibake.mjs`: PASS, 0 suspicious tokens.

## Хвосты

Живая проверка в VK Mini App на телефоне остаётся ручной. Эта задача закрывает только безопасный local/e2e dashboard parity slice.
