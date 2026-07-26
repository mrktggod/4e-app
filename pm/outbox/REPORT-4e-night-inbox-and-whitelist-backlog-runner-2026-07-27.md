# REPORT-4e-night-inbox-and-whitelist-backlog-runner-2026-07-27

status: DONE

## Что сделано

1. Обязательный sync app выполнен на `feat/admin-tariff-api`; новых изменений в `pm/` для intake не было.
2. `docs-private` подтянут с `mrktggod/4pm` на `feat/admin-tariff-api`.
3. В `pm/inbox` не осталось `BRIEF-*.md` со статусом `NEW`.
4. Закрыты устаревшие backlog-расхождения по уже выполненным задачам:
   - `TASK-CHAT-ACTIONS-001` подтверждён app-коммитом `047a261` и `node scripts/task-chat-confirm-action-smoke.mjs`.
   - `VK-TASK-COMPLETE-001` подтверждён app-коммитом `c7c8dea` и `node scripts/vk-task-complete-smoke.mjs`.
   - `VK-HEADER-LOGO-001` подтверждён app-коммитом `66573cd` и `node scripts/vk-header-logo-smoke.mjs`.
5. Четыре небезопасных VK-пункта переведены в `NEED-YURI` с отдельными отчётами:
   - `REPORT-VK-DIVERGENCE-DASH-ARTBOARD-NEED-YURI.md`
   - `REPORT-VK-DIVERGENCE-TASK-DETAIL-SHELL-NEED-YURI.md`
   - `REPORT-VK-DIVERGENCE-PROFILE-HANDOFF-NEED-YURI.md`
   - `REPORT-VK-TASK-SWIPE-001-NEED-YURI.md`

## Что нужно Юрию

1. Решить, переносить ли dashboard/task-detail/profile redesign shell в VK или оставить VK отдельной поверхностью с записанной причиной.
2. Для VK task swipe утвердить набор действий и допустимость swipe рядом с системным жестом назад в VK.
3. Live QA tails остаются ручными: Telegram Mini App confirm tap, VK task completion reload, VK first-screen logo visual check.

## Где проверить

- App branch: `feat/admin-tariff-api`, pushed head `13827daa0e5ac2ad8d67c768c4bd683a39135a70`.
- Private docs branch: `feat/admin-tariff-api`, pushed head `c77a0979aac697c372694d415f36aaf9828d5ec7`.
- Focused checks passed:
  - `node scripts/task-chat-confirm-action-smoke.mjs`
  - `node scripts/vk-task-complete-smoke.mjs`
  - `node scripts/vk-header-logo-smoke.mjs`
  - `node scripts/check-cp1251-mojibake.mjs`

## Что не трогалось

Существующие локальные изменения в `AGENTS.md` и `index.html` оставлены вне коммитов.

## Почему остановка корректна

После обработки inbox и backlog-синхронизации не найдено новых явно безопасных whitelist-задач. Оставшиеся пункты требуют live QA, платежей, auth/bot/CAL/product decisions, production/main действий или уже находятся в `Auto evidence green / Ready for live QA`.
