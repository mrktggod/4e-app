status: NEW

# BRIEF-2026-08-02-125-vk-dashboard-profile-parity-audit

## Context

Manual QA 2026-08-02 found VK is far behind the current web/Telegram surface:

- dashboard still has old centered logo;
- "Фокус дня", "выполнено", "задачи", "обещания", "сегодня", "горит" are not clickable;
- profile buttons do not work;
- visual design does not match the current web/Telegram version;
- Alexey suspects VK has not been checked by enough Playwright/k6 parity tests.

## Task

Run a VK parity audit before doing broad runtime changes.

Create a concrete gap matrix comparing VK to current web/Telegram for:

- dashboard visual shell;
- dashboard cards and clickable actions;
- focus/day chips;
- profile buttons;
- task navigation;
- existing Playwright coverage and missing coverage.

Add or update focused Playwright/static checks only where safe. Do not attempt a full VK redesign in one brief. End with a proposed ordered set of small follow-up briefs.

## Surface

- VK Mini App / `vk.html`.
- Tests under `autotests/tests/vk-app` and existing `scripts/vk-*.mjs`.

## Stop Points

- No production deploy.
- No merge into `main`.
- No CAL tasks.
- No price changes.
- No payment or entitlement refactors.
- No secret rotation, secret removal, or secret disclosure.
- Do not port the full Telegram/web design blindly; report the gap matrix first.

## Verification

- `npm run test:e2e:vk`
- relevant `npm run smoke:vk-*` commands if available.
- `npm run load:smoke` may cover `/vk.html` locally, but do not claim live VK host coverage from it.
- `node scripts/check-cp1251-mojibake.mjs`
- `git diff --check`

## Report

Write `pm/outbox/REPORT-BRIEF-2026-08-02-125-vk-dashboard-profile-parity-audit.md` with the gap matrix, raw test output, and follow-up briefs.
