# REPORT — BRIEF-2026-08-02-126-vk-chat-created-task-not-on-dashboard

## Итог

`PR_READY`: PR #63 в `feat/admin-tariff-api`, code commit `e82dad9`.

## Причина и правка

`save-task` в Worker возвращает подтверждённую задачу, но VK-клиент отбрасывал её и
показывал только результат немедленного `GET /tasks`. Если этот список запаздывал,
dashboard оставался без только что созданной задачи.

После refresh `vk.html` теперь добавляет или обновляет подтверждённую задачу в локальном
`state.tasks`, затем перерисовывает dashboard и статистику. Это не меняет Worker, auth,
платёжные или live VK-пути.

## Проверки

- `npm run smoke:vk-ai-chat-parity` — PASS; включает stale-refresh regression.
- `npm run smoke:vk-home-parity` — PASS.
- `npm run test:e2e:vk` — PASS, 4/4 (mocked VK/Worker).
- `node scripts/check-cp1251-mojibake.mjs` — PASS, 0 suspicious tokens.
- `npm run check:portable-paths`, `node scripts/check-js-syntax.mjs`, `git diff --check` — PASS.

## Уровень доказательства и ручной хвост

Доказательство локальное: source smoke и Playwright с mocked VK/Worker. Оно не
подтверждает live VK WebView, реальный session identity или deployment. Юрию/QA нужно
создать задачу в живом VK-чате, перейти на dashboard и убедиться, что задача видна до и
после повторного открытия приложения; после этого отдельно решить merge и deployment.

## Попытки

Одна продуктовая диагностика; две корректировки test harness, затем все целевые проверки
зелёные. Причина остановки: live VK проверка запрещена для этой automation.
