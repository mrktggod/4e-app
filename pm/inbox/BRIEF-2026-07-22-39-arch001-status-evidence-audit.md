status: NEW

# BRIEF-2026-07-22-39-arch001-status-evidence-audit

## Context

`ARCH-001` относится к Горизонту 0.5 и имеет конфликт: backlog пишет `Done`, roadmap — `In Progress`, а критерий backlog всё ещё говорит «дальше выносить auth helpers». Это status/evidence задача, не разрешение продолжать архитектуру.

## Task

1. Сверить task docs, FILE_MAP, commits/reports и фактические boundaries platform adapter.
2. Выбрать честный единый статус: Done по согласованному MVP либо Partial/In Progress с точным остатком.
3. Синхронизировать только документы; новые helpers не выносить.

## Stop Points

- Documentation/evidence only; no architecture/runtime refactor.
- No production/main, CAL, payment, entitlement, auth-security changes or secrets.

## Verification

- `node scripts/check-cp1251-mojibake.mjs`
- Cross-file `rg` evidence.
- `git diff --check`

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-22-39-arch001-status-evidence-audit.md` with chosen status, MVP boundary and evidence.
