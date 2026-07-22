status: DONE

# BRIEF-2026-07-22-35-smart007-memory-ui-regression-smoke

## Context

AI-память v1 — Горизонт 0.5. `SMART-007` имеет staging fixture для сохранения, рендера, удаления и очистки фактов; усиливаем UI/privacy regression без реального AI.

## Task

1. Расширить deterministic `smart007` fixture проверками длинного текста и HTML-like payload.
2. Доказать, что текст не исполняется и не ломает layout.
3. Проверить reload после удаления одного факта и после `Очистить всё`.
4. Проверить честные empty/error states без технических утечек.
5. Runtime менять только при узком подтверждённом UI/privacy дефекте.

## Stop Points

- Run only after briefs `30-34` are completed or honestly classified.
- No AI-memory v2/v3, production/main, payment, entitlement, auth-security, CAL, personal data or secrets.
- Do not overwrite unrelated uncommitted changes.

## Verification

- `node scripts/check-cp1251-mojibake.mjs`
- `npm run smoke:smart007`
- `git diff --check`

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-22-35-smart007-memory-ui-regression-smoke.md` with cases, commit SHA and raw output.
