status: DONE

# BRIEF-2026-07-29-105-vk-mobile-tabs-bottom-reserve

## Context

VK Playwright mock is green, but screenshots from the 2026-07-29 QA run show mobile visual tails:

- top filter tabs overflow/crop to the right; `Неделя` is partly clipped;
- fixed bottom nav covers lower task-list content in full-page mobile screenshot.

Artifacts:

- `autotests/test-results/vk-app-basic-VK-Mini-App-opens-with-mocked-launch-params-mobile-chromium/vk-home.png`
- `autotests/test-results/vk-app-basic-VK-Mini-App-opens-with-mocked-launch-params-desktop-chromium/vk-home.png`

## Task

Fix VK mobile visual reserve:

- make top filter tabs fit or scroll cleanly without clipped text;
- add enough bottom content reserve so task rows are not hidden by fixed bottom nav;
- preserve green VK Playwright navigation behavior.

Do not touch VK Pay, auth/session, entitlement, or live VK host behavior.

## Stop Points

- No production deploy.
- No merge into `main`.
- No CAL tasks.
- No price changes.
- No payment or entitlement refactors.
- No secret rotation, secret removal, or secret disclosure.
- No live VK Mini Apps deploy or live device smoke.

## Verification

- `npx playwright test autotests/tests/vk-app --reporter=line --workers=1`
- `npm run smoke:vk-task-actions`
- `npm run smoke:vk-task-complete`
- capture/update VK mobile screenshot evidence if the test already saves it;
- `node scripts/check-cp1251-mojibake.mjs`
- `node scripts/check-js-syntax.mjs`
- portable path and UI architecture guards or their PowerShell equivalents.

## Review Agent Check

Another agent must inspect the VK mobile screenshot and confirm the tabs and lower task-list content are not clipped.

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-29-105-vk-mobile-tabs-bottom-reserve.md` with changed files, screenshot paths, test output, commit SHA, and live VK manual tail.
