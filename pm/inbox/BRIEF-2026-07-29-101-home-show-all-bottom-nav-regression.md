status: NEW

# BRIEF-2026-07-29-101-home-show-all-bottom-nav-regression

## Context

Big QA 2026-07-29 found a shared Web/Telegram dashboard regression: home hides `home-show-all-btn` when active tasks exceed visible top-3 rows. In dark theme the third task card is also partly hidden behind the fixed bottom nav.

Proof:

- `npm run smoke:home001` failed.
- `npm run smoke:telegram-dashboard-one-task` failed.
- Screenshots:
  - `docs/tasks/assets/HOME-001-dashboard-smoke-2026-07-20-light.png`
  - `docs/tasks/assets/HOME-001-dashboard-smoke-2026-07-20-dark.png`

## Task

Fix the home dashboard so Web/Telegram surfaces:

- show `home-show-all-btn` when active tasks exceed visible priority rows;
- keep the top-3 list clear of bottom navigation in light and dark themes;
- preserve the current dashboard visual style and existing task-card behavior.

Do not touch VK in this brief unless the shared CSS change would otherwise break VK.

## Stop Points

- No production deploy.
- No merge into `main`.
- No CAL tasks.
- No price changes.
- No payment or entitlement refactors.
- No secret rotation, secret removal, or secret disclosure.
- Do not redesign the whole home screen.

## Verification

- Before fix: capture failing `npm run smoke:home001` or cite current QA report.
- After fix:
  - `npm run smoke:home001`
  - `npm run smoke:telegram-dashboard-one-task`
  - `npm run smoke:iphone14-responsive`
  - `node scripts/check-cp1251-mojibake.mjs`
  - `node scripts/check-js-syntax.mjs`
  - portable path and UI architecture guards or their PowerShell equivalents.

## Review Agent Check

Another agent must inspect the screenshots and verify the button is visible only when needed, the dark list is not hidden by nav, and no unrelated surfaces changed.

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-29-101-home-show-all-bottom-nav-regression.md` with root cause, changed files, before/after command output, screenshot paths, commit SHA, and honest manual tails.
