status: DUPLICATE

# BRIEF-2026-07-27-85-remove-premium-banner-and-advice-button

Superseded by atomic briefs:

- `BRIEF-2026-07-27-84-profile-premium-banner-remove.md`
- `BRIEF-2026-07-27-93-task-advice-manual-generate.md`

Do not process this aggregate brief in automation.

## Context

Two small, unrelated product cleanups from `pm/inbox/PRODUCT_IDEAS_TASKS.md`. Fix and commit separately.

## Task

1. **TASK-002**: remove the "premium 14 days" banner from the profile screen — it always shows "14 дней" regardless of the real subscription state, while the Подписки tab already shows correct real data. Remove the banner entirely from all themes/versions. Check no empty gap/broken grid is left behind.
2. **TASK-010**: remove auto-generation of AI task advice when a task card is opened. Replace with an explicit "Сгенерировать совет" button; only generate on click, show loading state only after the click, handle generation errors with a retry option.

## Stop Points

- No production deploy, no `main` merge.
- No AI prompt/entitlement changes beyond the auto-trigger removal itself.

## Verification

- `node scripts/check-cp1251-mojibake.mjs`, `git diff --check`.
- Screenshot/smoke evidence: profile screen without the banner (light+dark), task card opening without triggering advice generation, button triggers it on click.

## Report

`pm/outbox/REPORT-2026-07-27-85-remove-premium-banner-and-advice-button.md`.
