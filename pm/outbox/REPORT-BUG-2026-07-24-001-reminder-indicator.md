# REPORT — BUG-2026-07-24-001 reminder indicator

**Date:** 2026-07-24  
**Branch:** `fix/reminder-indicator-unified`  
**App commit:** `85cb141`
**Status:** DONE / accepted on iPhone TMA

## Problem

После выбора времени напоминания значение сохранялось, но закрытая карточка показывала только обычный колокольчик. Пользователь мог узнать выбранный вариант только после повторного открытия popup.

## Root cause

- `index.html:5260` — `setDetailReminder()` синхронизировал скрытый select, но не видимый trigger.
- `index.html:8579` — popup active-state существовал только внутри открытого списка вариантов.
- `styles/screens/tasks.less:1911` — popup имел мобильные размеры, но закрытый trigger не имел selected-state.

## Changed behavior

- Колокольчик показывает компактную метку `15 мин`, `1 час` или `1 день`.
- При значении `none` метка удаляется.
- `aria-label` содержит полный выбранный вариант.
- Строка тегов переключается в `overflow: visible`, когда индикатор активен, поэтому метка не обрезается родительским контейнером.
- Popup-варианты имеют высоту не менее 44 px, не переносятся по два символа и получают корректный tap target.
- Light и dark темы имеют читаемый индикатор.

## Changed files

- `index.html`
- `styles/screens/tasks.less`
- `styles/screens/light-redesign.less`
- `styles.css`
- `styles.min.css`
- `scripts/back-067-task-detail-reminder-smoke.mjs`
- `scripts/check-portable-paths.sh`
- `autotests/tests/web/chat-keyboard.spec.ts`
- `pm/bugs.md`
- `pm/backlog.md`
- `pm/qa-results-2026-07-17.md`
- `pm/team-sync.md`
- `shared/ROADMAP.md`
- `FILE_MAP.md`
- `FILE_MAP_UI.md`

## Raw proof

`npm run smoke:back067-reminder`:

- viewport `390x844`;
- dark trigger `44x44`, all four options `140x44`, all hit checks `true`;
- dark selected `1hour`, indicator `1 час`, opacity `1`;
- light trigger `44x44`, all four options `140x44`, all hit checks `true`;
- light selected `15min`, indicator `15 мин`, opacity `1`;
- failures `[]`.

Encoding markers: `111 -> 111`.

`qa:prebeta` в отдельном Git worktree сначала выявил ложное срабатывание portable-path guard на служебном файле `.git`. Guard теперь исключает только сам `.git`-файл вместе с уже исключённым `.git/**`; проверка проектных файлов остаётся прежней.

Финальный `npm run qa:prebeta` прошёл полностью: Playwright 20/20, home, accessibility, notification action cards, privacy и viral/share smoke зелёные. Соседние `smoke:back068-tag-popup` и `smoke:back069-hero` также прошли.

Повторный прогон обнаружил flaky-ожидание в новом chat-keyboard guard: тест иногда читал `padding-bottom` в середине CSS transition. Проверка стабилизирована через `expect.poll()` до финального значения; runtime AI-чата не менялся.

Staging preview:

```text
wrangler pages deploy .pages-dist --project-name 4-ai-staging --branch qa-reminder-indicator
Deployment: https://09e6cd2b.4-ai-staging.pages.dev
Alias: https://qa-reminder-indicator.4-ai-staging.pages.dev

GET direct preview -> 200, length 475290
syncDetailReminderIndicator=True
staging worker marker=True

GET alias -> 200, length 475290
syncDetailReminderIndicator=True
staging worker marker=True
```

## Manual acceptance

2026-07-24 Алексей проверил exact preview на телефоне в Telegram Mini App и прислал скрин: после выбора `За 15 минут` закрытый trigger показывает компактную метку `15 мин`; карточка не ломается, заголовок и соседние элементы не перекрываются. `BUG-2026-07-24-001` / `BACK-070` можно считать закрытым.

Реальная доставка, звук и вибрация не входят в этот баг и остаются `BACK-064`.
