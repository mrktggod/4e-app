status: NEW

# BRIEF-2026-07-25-61-expired-premium-task-actions

## Context

Linked bug: `BUG-2026-07-25-008`.

User with expired Premium tried to complete a task and saw only generic `Ошибка сохранения`.

## Task

Make task action failures caused by expired/missing Premium explicit in the app UI. Do not change entitlement rules. Handle the existing backend denial by showing clear Premium-required copy and a route/button to the subscription/benefits screen.

## Stop Points

- No production deploy.
- No merge into `main`.
- No price changes.
- No payment or entitlement refactor.
- No secret handling.
- If the fix requires backend entitlement policy changes, write `NEED-CLAUDE` report instead.

## Verification

- `node scripts/check-cp1251-mojibake.mjs`
- Relevant task action smoke or a focused static/Playwright test proving expired-premium response does not show generic save error.
- Shared guards before commit.

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-25-61-expired-premium-task-actions.md`.

