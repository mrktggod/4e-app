status: NEW

# BRIEF-2026-07-19-15-pm-docs-hygiene

## Context

Три мелких docs-хвоста, собранных из аудитов:

1. `pm/backlog.md` BACK-044: текст критерия утверждает, что строка «Человек» скрыта из UI, но фактически `detail-person-row` видим и рабочий (нужен для BACK-030); скрыто только «Направление». Формулировка вводит в заблуждение.
2. В `pm/backlog.md` может висеть незакоммиченная строка ANALYTICS-002 (отчёт redesign-cutover 2026-07-18 сознательно не включил её в коммит как unrelated). Если она всё ещё uncommitted и содержимое соответствует плану «Аналитика v2» — закоммитить отдельным docs-коммитом.
3. `.gitattributes` (app-репо): на 1-й строке BOM (нит из отчёта 2026-07-17). Убрать BOM, не меняя правила.

## Task

Ровно эти три правки, ничего больше. Пункт 3: убедиться, что после удаления BOM guard-правила (`* text=auto eol=lf` + binary-паттерны) работают.

## Stop Points

- Только docs/config-гигиена; продуктовый код не трогать.
- No production deploy. No merge into `main`. No CAL. No price changes. No payment/entitlement refactors. No secrets.

## Verification

- `node scripts/check-cp1251-mojibake.mjs` → 0.
- `git diff` содержит только `pm/backlog.md` и `.gitattributes`.
- Hex-проверка первой строки `.gitattributes`: без `EF BB BF`.

## Report

`pm/outbox/REPORT-BRIEF-2026-07-19-15-pm-docs-hygiene.md`: что поправлено, commit SHA, raw-proof по BOM.
