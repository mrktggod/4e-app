status: DONE

Done report: `pm/outbox/REPORT-BRIEF-2026-07-19-14-agents-stale-priorities.md`

# BRIEF-2026-07-19-14-agents-stale-priorities

## Context

В `AGENTS.md` блок «Приоритеты (открытые задачи)» (~строки 225-235) устарел и вводит ночные сессии в заблуждение: пункты 1-5 «Тех. долги» давно закрыты (Email Resend = BACK-001 Done, сброс пароля = BACK-002 Done, тестовый платёж = BACK-004 Done, единая модель = BACK-005 Done, KV→D1 = BACK-006 Done), а блок «Редизайн — фазы из redesign/patches» относится к старому редизайну, не к актуальному soft-glass cutover.

## Task

Только docs-правка блока «Приоритеты (открытые задачи)» в AGENTS.md:

1. Убрать/пометить закрытыми пункты 1-5, заменить указателем на актуальные источники: `pm/backlog.md` (Now) + `pm/inbox/` очередь.
2. Убрать устаревший подблок про `redesign/patches` (актуальный redesign идёт через soft-glass ветки и NEED-YURI cutover, не через patches).
3. НЕ трогать секции «Autonomous Pipeline Guardrails» и «Autonomous Night Backlog - Selection Rules» — они актуальны.

## Stop Points

- Правится только указанный блок AGENTS.md, ни одна другая секция.
- No production deploy. No merge into `main`. No CAL. No price changes. No payment/entitlement refactors. No secrets.

## Verification

- Diff содержит только блок «Приоритеты», guardrails-секции без изменений.
- `node scripts/check-cp1251-mojibake.mjs` → 0, без BOM.

## Report

`pm/outbox/REPORT-BRIEF-2026-07-19-14-agents-stale-priorities.md`: diff-summary, commit SHA.
