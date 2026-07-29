# REPORT-BRIEF-2026-07-29-104-web-nav-contract-vs-bottom-menu

Status: DONE

## Decision

Kept the current runtime navigation shell and fixed the Web Playwright contract. The existing Telegram diagnostic proves the agreed behavior for redesigned inner screens: legacy `#global-nav` stays hidden while the home screen uses `#home .dash-bottom-nav`.

The contradiction was in the Web test expecting the hidden legacy nav to be visible on `calendar`; there was no evidence in this brief to justify a broad navigation IA/runtime change.

## Changed files

- `autotests/tests/web/navigation-safe-area.spec.ts`
- `pm/inbox/BRIEF-2026-07-29-104-web-nav-contract-vs-bottom-menu.md`
- `pm/outbox/REPORT-BRIEF-2026-07-29-104-web-nav-contract-vs-bottom-menu.md`

## Before

- `npx playwright test autotests/tests/web/navigation-safe-area.spec.ts --reporter=line --workers=1`
  - FAIL: 2 failed, 2 passed.
  - Failure: `#global-nav should be visible`; `boundingBox` was null.

## After

- `npx playwright test autotests/tests/web/navigation-safe-area.spec.ts --reporter=line --workers=1`
  - PASS: 4 passed.
- `npm run smoke:telegram-bottom-menu`
  - PASS: home `dash-bottom-nav` visible, legacy `#global-nav` hidden on profile/task-detail/subscription/statistics.
- `npm run smoke:iphone14-responsive`
  - PASS.
- `node scripts/check-cp1251-mojibake.mjs`
  - PASS: 0 suspicious tokens.
- `node scripts/check-js-syntax.mjs`
  - PASS: no staged JS or HTML files.
- PowerShell portable path guard
  - PASS.
- PowerShell UI architecture guard
  - PASS: inlineStyles=284/465, inlineHandlers=237/402, styleTags=0/0, inlineScripts=3/3, styles.min.css present, no mojibake markers.

## Review agent

PASS. The review agent confirmed this is a safe test-contract fix: current CSS explicitly hides `#global-nav` on `#calendar.active`, the home assertion still checks `#home .dash-bottom-nav`, and the Telegram diagnostic still covers hidden legacy nav on redesigned inner screens.

Nonblocking follow-up noted by review: JS still removes the `hidden` class for calendar while CSS forces `display:none`; that can be aligned later, but it is not part of this contract fix.

## Manual UX approval tail

No manual UX approval was required. This was a test-contract change only; runtime navigation behavior was intentionally left unchanged.

## Commit

This report is included in the task commit `test(nav): align hidden global nav contract`; the final pushed SHA was verified against `origin/feat/admin-tariff-api` after commit.
