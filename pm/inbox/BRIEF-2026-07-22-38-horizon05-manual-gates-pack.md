status: DONE

# BRIEF-2026-07-22-38-horizon05-manual-gates-pack

## Context

SMART-004, SMART-011, BACK-045 и BACK-008 относятся к Горизонту 0.5, но закрываются только реальным Telegram/group/OAuth/infrastructure действием. Ночью их не выполняем; готовим единый утренний пакет.

## Task

1. Свести существующие task/checklist docs в одну таблицу manual gates.
2. Для каждого указать owner, поверхность, безопасные шаги, ожидаемый результат и raw evidence.
3. Разделить `может Алексей`, `только Юрий`, `нужен provider/secret`.
4. Старые checklists не переписывать, а ссылаться на них.

## Stop Points

- Documentation only.
- No live Telegram/OAuth/provider actions, production/main, CAL, payment, entitlement, auth-security changes or secrets.

## Verification

- `node scripts/check-cp1251-mojibake.mjs`
- Cross-link check for referenced files.
- `git diff --check`

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-22-38-horizon05-manual-gates-pack.md` with pack path and unresolved owners.
