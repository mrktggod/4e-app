status: NEW

# BRIEF-2026-07-22-36-privacy-surface-regression-smoke

## Context

152-ФЗ/privacy входит в Горизонт 0.5. Backlog считает `BACK-007` закрытым, а roadmap всё ещё пишет `Частично Done`; нужен repeatable artifact/UI smoke.

## Task

1. Проверить production-like Pages artifact: `privacy.html` включён, содержит номер РКН `102299/77` и читаемый заголовок.
2. Проверить privacy links на login/register/onboarding: ссылка существует, имеет доступную область 44px и ведёт на `privacy.html`, а не app root.
3. Юридический текст не менять; content-вопрос классифицировать `NEED-YURI`.

## Stop Points

- No legal policy decisions, production/main, payment, entitlement, auth-security logic, CAL or secrets.
- Runtime fix только для очевидной сломанной ссылки/доступности.

## Verification

- `node scripts/check-cp1251-mojibake.mjs`
- `npm run build:worker-assets`
- New focused privacy artifact smoke.
- `git diff --check`

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-22-36-privacy-surface-regression-smoke.md` with artifact evidence, commit SHA and raw output.
