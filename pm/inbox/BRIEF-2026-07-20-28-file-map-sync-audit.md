status: NEW

# BRIEF-2026-07-20-28-file-map-sync-audit

## Context

`AGENTS.md` требует держать `FILE_MAP.md`/`FILE_MAP_UI.md` актуальными (номера строк по секциям index.html/vk.html/privacy.html), но за последние недели было много движения: HOME-001 редизайн, BACK-055 notifications action-cards, part1/2/3 design-переносы, новые docs/tasks/*, новая папка `assets/design/part3/**`, новые pm/inbox|outbox. Это чистая doc-hygiene/FILE_MAP-sync задача из whitelist — риск, что карта устарела и уводит следующую сессию Кодекса не в те строки.

⚠️ Предохранитель: если `index.html`/`styles.css`/`sw.js` содержат незакоммиченные редизайн-правки Юрия — номера строк в них сейчас нестабильны. В этом случае зафиксировать несоответствие как факт (не гнаться за точным number-matching для файлов с активной незакоммиченной правкой), пометить эти секции "verify after redesign commit", и не пытаться сверять построчно живой рабочий hunk.

## Task

1. Прочитать `FILE_MAP.md` и `FILE_MAP_UI.md` целиком (они компактные по замыслу).
2. Для 5-8 ключевых секций (например: bottom-nav-v2, global-nav, home dashboard, notifications action-feed, task-detail, calendar) сверить заявленный диапазон строк в `FILE_MAP_UI.md` с реальным текущим `index.html` (через `grep -n` на характерный якорь секции, не читать файл целиком).
3. Если расхождение — обновить только номера строк (не менять описания/семантику) в `FILE_MAP_UI.md`/`FILE_MAP.md`.
4. Если секция не находится вообще (переименована/удалена) — не гадать, зафиксировать как открытый вопрос в отчёте, не удалять из карты самостоятельно.
5. Проверить, упоминается ли где-то в `FILE_MAP.md` устаревший путь (например старый `CODEX_INSTRUCTIONS.md`, которого по правилам проекта может не быть) — если да, поправить формулировку по аналогии с уже принятым в CLAUDE.md правилом "не искать как обязательный файл".

## Stop Points

- Только `FILE_MAP.md`/`FILE_MAP_UI.md` (и, при необходимости, аналогичные `FILE_MAP_WORKER.md`/`FILE_MAP_BOT.md`, если расхождение найдено там). Продуктовый код (`index.html`, `vk.html`, `styles/**`, `scripts/**` кроме самих FILE_MAP-файлов) не трогать.
- No production deploy. No merge into `main`. No CAL. No price changes. No payment/entitlement refactors. No secrets.
- Если правка секции упирается в незакоммиченный редизайн — не трогать номера строк этой секции, пометить как "verify after redesign commit" вместо угадывания.

## Verification

- `node scripts/check-cp1251-mojibake.mjs` → 0.
- Для каждой исправленной строки — конкретный `grep -n` вывод, подтверждающий новый номер.

## Report

`pm/outbox/REPORT-BRIEF-2026-07-20-28-file-map-sync-audit.md`: список сверенных секций, что исправлено, что осталось открытым (particularly redesign-затронутые), commit SHA.
