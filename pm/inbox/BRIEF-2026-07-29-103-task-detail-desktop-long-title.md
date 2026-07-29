status: DONE

# BRIEF-2026-07-29-103-task-detail-desktop-long-title

## Context

Task-detail responsive smoke fails on desktop long-title layout after `CHROME_PATH` is set to Playwright Chromium.

Proof:

- `npm run smoke:back069-hero`
- Error: `desktop title appears vertically wrapped: 200px`.
- Mobile screenshots remain readable, so the bug is primarily desktop/tablet task-detail geometry.

## Task

Fix task-detail desktop layout for long titles so the title does not become a tall narrow vertical column and remains readable without overlapping meta cards or description.

Keep mobile task-detail layout readable and preserve the existing glass visual direction.

## Stop Points

- No production deploy.
- No merge into `main`.
- No CAL tasks.
- No price changes.
- No payment or entitlement refactors.
- No secret rotation, secret removal, or secret disclosure.
- Do not redesign task detail broadly.

## Verification

- Set `CHROME_PATH` to Playwright Chromium if `chrome` is not in PATH.
- After fix:
  - `npm run smoke:back069-hero`
  - `npm run smoke:back067-reminder`
  - `npm run smoke:back068-tag-popup`
  - `npm run smoke:iphone14-responsive`
  - `node scripts/check-cp1251-mojibake.mjs`
  - `node scripts/check-js-syntax.mjs`
  - portable path and UI architecture guards or their PowerShell equivalents.

## Review Agent Check

Another agent must visually inspect mobile and desktop task-detail screenshots and confirm title, description, tags, date/priority, and action card do not overlap.

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-29-103-task-detail-desktop-long-title.md` with root cause, changed files, smoke output, screenshot paths, commit SHA, and remaining manual visual tails.
