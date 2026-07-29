status: DONE

# BRIEF-2026-07-29-104-web-nav-contract-vs-bottom-menu

## Context

Playwright Web expects `#global-nav` to be visible on `calendar`, but the Telegram bottom-menu diagnostic now expects global nav hidden on inner pages.

Proof:

- Web Playwright failure: `#global-nav should be visible`.
- `npm run smoke:telegram-bottom-menu` passed with `globalNavVisible=false` for profile/task-detail/subscription/statistics.

This may be a product/test-contract mismatch, not necessarily a runtime bug.

## Task

Resolve the navigation test contract:

- determine whether `#global-nav` should be visible on `calendar` and other inner screens in Web/TG;
- if current hidden-nav behavior is correct, update Playwright Web expectations to match it;
- if nav should be visible, make the narrow runtime fix and update Telegram bottom-menu diagnostic accordingly.

Prefer a test-contract fix if runtime behavior is already the agreed shell.

## Stop Points

- No production deploy.
- No merge into `main`.
- No CAL tasks.
- No price changes.
- No payment or entitlement refactors.
- No secret rotation, secret removal, or secret disclosure.
- Do not change navigation IA broadly without clear evidence.

## Verification

- `npx playwright test autotests/tests/web/navigation-safe-area.spec.ts --reporter=line --workers=1`
- `npm run smoke:telegram-bottom-menu`
- `npm run smoke:iphone14-responsive`
- `node scripts/check-cp1251-mojibake.mjs`
- `node scripts/check-js-syntax.mjs`
- portable path and UI architecture guards or their PowerShell equivalents.

## Review Agent Check

Another agent must confirm that Web Playwright and Telegram bottom-menu diagnostic no longer contradict each other.

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-29-104-web-nav-contract-vs-bottom-menu.md` with the decision, changed files, before/after test output, commit SHA, and any manual UX approval tail.
