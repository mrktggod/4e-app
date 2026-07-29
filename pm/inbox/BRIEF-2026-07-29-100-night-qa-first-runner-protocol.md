status: DONE

# BRIEF-2026-07-29-100-night-qa-first-runner-protocol

## Context

QA-прогон 2026-07-29 показал, что ночная сессия сначала берёт безопасный backlog cleanup, а полный Web/TG/VK/k6 QA запускается уже отдельно. Из-за этого свежие системные регрессии не становятся первым входом для ночных fix-сессий.

См.:

- `pm/outbox/REPORT-QA-2026-07-29-playwright-k6-surfaces.md`
- `pm/outbox/REPORT-NIGHT-QA-AGENT-CHECKS-2026-07-29.md`

## Task

Обновить ночной runner-протокол в PM-документах так, чтобы порядок был:

1. sync/intake;
2. mandatory QA suite до любых backlog-фиксов;
3. triage красных тестов в атомарные briefs;
4. fix briefs по одному;
5. review agent проверяет работу fix agent;
6. final QA re-run;
7. только после зелёного QA переходить к обычному whitelist backlog.

Не менять runtime-код приложения в этом brief.

## Stop Points

- No production deploy.
- No merge into `main`.
- No CAL tasks.
- No price changes.
- No payment or entitlement refactors.
- No secret rotation, secret removal, or secret disclosure.
- Do not rewrite broad process docs blindly; keep this as a narrow protocol addendum.

## Verification

- `node scripts/check-cp1251-mojibake.mjs`
- `git diff --check`
- Confirm the updated docs explicitly say QA runs before backlog fixes.
- Confirm the docs preserve the existing stop points.

## Review Agent Check

Another agent must verify that the new protocol does not allow prod deploy, `main`, live payments, CAL, secrets, or unreviewed auth/payment work at night.

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-29-100-night-qa-first-runner-protocol.md` with changed files, exact protocol wording, raw proof, and remaining manual/team decisions.
