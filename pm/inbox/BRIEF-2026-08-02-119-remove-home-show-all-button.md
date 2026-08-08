status: DONE

# BRIEF-2026-08-02-119-remove-home-show-all-button

## Context

Manual QA 2026-08-02 confirmed the home "Смотреть все задачи" button exists and works, but Alexey clarified that the product decision is to remove this button.

Previous related brief: `BRIEF-2026-08-01-118-home-show-all-visible.md`.

## Task

Remove the "Смотреть все задачи" home action from the user-facing dashboard without breaking the task list itself.

Update tests/smokes so they no longer require the show-all button to be visible.

## Surface

- Telegram Mini App / main `index.html` dashboard.
- Do not change VK or web navigation unless the same code path is proven shared and the report explains it.

## Stop Points

- No production deploy.
- No merge into `main`.
- No CAL tasks.
- No price changes.
- No payment or entitlement refactors.
- No secret rotation, secret removal, or secret disclosure.

## Verification

- `npm run build:css` if LESS/CSS changes.
- Focused dashboard smoke updated for the new product decision.
- `node scripts/check-cp1251-mojibake.mjs`
- `git diff --check`
- `npm run check:portable-paths`

## Report

Write `pm/outbox/REPORT-BRIEF-2026-08-02-119-remove-home-show-all-button.md` with root cause, changed files, commit SHA, raw proof, and honest tails.
