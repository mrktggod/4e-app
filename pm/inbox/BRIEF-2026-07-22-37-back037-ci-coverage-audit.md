status: DONE

# BRIEF-2026-07-22-37-back037-ci-coverage-audit

## Context

`BACK-037` — CI/smoke Горизонта 0.5. После новых checks нужно подтвердить воспроизводимость команд и отсутствие stale/missing script wiring.

## Task

1. Составить матрицу package scripts и GitHub Actions для существующих checks/smokes.
2. Проверить portable paths, CSS/mojibake/JS syntax команды и существование referenced scripts.
3. Исправлять только очевидные wiring gaps; guard thresholds не ослаблять.

## Stop Points

- No production/main, secrets, payment, entitlement, auth-security, CAL or broad workflow redesign.
- Documentation/wiring only; runtime product code не менять.

## Verification

- `node scripts/check-cp1251-mojibake.mjs`
- `node scripts/check-js-syntax.mjs`
- Portable-path guard through Git Bash.
- `git diff --check`

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-22-37-back037-ci-coverage-audit.md` with matrix, commit SHA and raw results.
