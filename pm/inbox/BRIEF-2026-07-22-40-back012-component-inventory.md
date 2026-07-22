status: DONE

# BRIEF-2026-07-22-40-back012-component-inventory

## Context

`BACK-012` остаётся `Partial Done`. Его утверждённый план требует сначала inventory высокочастотных экранов, а уже затем маленькие BEM-islands. Несколько islands уже очищены, но единая актуальная таблица wrapper/count/tokens/risk отсутствует.

## Task

1. Создать или обновить component inventory для auth, home, task card, task detail, AI-chat composer, profile/settings и notifications.
2. Для каждого экрана записать primary wrappers, количество inline style attrs, основные LESS-файлы/tokens, существующий smoke и regression risk.
3. Отметить уже закрытые islands и предложить следующие три узких кандидата.
4. Код/CSS не менять; не снижать guard threshold.

## Acceptance

- Инвентаризация воспроизводима командами/поиском, а не оценкой на глаз.
- Следующие candidates не затрагивают одновременно несколько экранов.
- Task-detail до закрытия briefs `31-33` не предлагается как cleanup island.

## Stop Points

- Documentation/evidence only.
- No runtime/CSS edits, broad refactor, production deploy, `main` merge, CAL, payment, entitlement, auth-security or secrets.

## Verification

- `node scripts/check-cp1251-mojibake.mjs`
- Raw inventory commands/counts in report.
- `git diff --check`

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-22-40-back012-component-inventory.md` with the inventory path, exact counts and ranked next islands.
