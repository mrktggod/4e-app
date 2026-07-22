status: DONE

# BRIEF-2026-07-22-41-horizon05-status-consistency

## Context

Roadmap/backlog Горизонта 0.5 содержат расхождения: например, РКН/privacy фактически закрыт в backlog, а roadmap говорит `Частично Done`; `ARCH-001` имеет разные статусы. После runtime/evidence очереди нужен узкий status audit без переоценки продукта.

## Task

1. Сверить только строки Горизонта 0.5 между `shared/ROADMAP.md`, `pm/backlog.md`, task docs и существующими reports.
2. Исправить только доказуемые stale statuses, не объявляя `Done` по source-only там, где нужен live/manual smoke.
3. Для каждого оставшегося хвоста указать один из классов: autonomous-safe, NEED-CLAUDE, NEED-YURI/manual.
4. Не менять приоритеты, цены, scope или продуктовые решения.

## Acceptance

- Нет противоречий `Done` vs `Partial/In Progress` для одной доказанной работы.
- Manual/device/provider tails остаются честно открытыми.
- В report есть таблица before/after и ссылки на evidence.

## Stop Points

- Documentation only; no runtime code.
- No reprioritization, production deploy, `main` merge, CAL, payment, entitlement, auth-security, product decisions or secrets.

## Verification

- `node scripts/check-cp1251-mojibake.mjs`
- `git diff --check`
- Cross-file `rg` evidence for every changed status.

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-22-41-horizon05-status-consistency.md` with before/after statuses, evidence links and unresolved manual tails.
