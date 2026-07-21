status: DONE

# BRIEF-2026-07-20-27-back049-ui-guard-evidence-upgrade

## Context

EVIDENCE-AUDIT-2026-07-17: BACK-049 (UI-архитектурный guard: LESS + BEM без роста inline-долга) — Done, но SOURCE-ONLY: «Architecture guard is process/tooling evidence, not staging runtime behavior». Это safe whitelist evidence-upgrade задача (docs + один живой прогон инструмента, без изменения продуктового кода).

⚠️ Предохранитель: в рабочем дереве могут быть незакоммиченные redesign-правки Юрия (index.html/styles/*.less/sw.js). Если так — эта задача их не касается (только читает + запускает существующий скрипт), но если `git status` показывает конфликт с этим брифом (например скрипт сам требует правки в файлах с чужими изменениями) — остановиться и пометить NEED-CLAUDE, не мержить/не резолвить чужие правки.

## Task

1. Прочитать `scripts/check-ui-architecture.sh` и `docs/ui-architecture-rules.md`, зафиксировать (file:line) какие именно паттерны он ловит (новые `style=""`, `onclick=""`/`oninput=""`/`onchange=""`, inline `<script>`/`<style>` рост).
2. Реальный прогон: `bash scripts/check-ui-architecture.sh` на текущем HEAD, зафиксировать сырой вывод (pass/baseline count) в отчёт.
3. Негативный тест БЕЗ коммита: создать временный scratch-файл вне `index.html`/`vk.html` (например `/tmp` или git-ignored scratch), добавить туда заведомо новый `onclick=""`, прогнать guard-логику (или её regex-часть) на этом scratch-файле, чтобы доказать, что паттерн реально детектится, а не просто «скрипт существует». Если guard жёстко привязан только к `index.html`/`vk.html` и нельзя протестировать на scratch без правки реальных файлов — не трогать реальные файлы, вместо этого проверить детект через `grep -nE` тем же regex, что в скрипте, и явно написать в отчёте, что full script assumes real files.
4. Обновить `docs/tasks/EVIDENCE-AUDIT-2026-07-17.md` новым supplement-блоком (по аналогии с существующими) с этим фактическим прогоном; BACK-049 остаётся Done, но evidence class может обновиться на LIVE/PARTIAL с честной пометкой что именно проверено.

## Stop Points

- Только чтение + один docs-файл (`EVIDENCE-AUDIT-2026-07-17.md`) + временный scratch вне git tree. `index.html`/`vk.html`/`styles/**` не менять.
- No production deploy. No merge into `main`. No CAL. No price changes. No payment/entitlement refactors. No secrets.
- Если рабочее дерево содержит незакоммиченные редизайн-правки, конфликтующие с этой проверкой — остановиться, статус NEED-CLAUDE.

## Verification

- `node scripts/check-cp1251-mojibake.mjs` → 0.
- Сырой вывод `bash scripts/check-ui-architecture.sh` приложен к отчёту.

## Report

`pm/outbox/REPORT-BRIEF-2026-07-20-27-back049-ui-guard-evidence-upgrade.md`: file:line цитаты guard-паттернов, сырой вывод прогона, результат негативного теста, commit SHA (docs-only).
