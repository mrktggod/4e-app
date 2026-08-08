# REPORT-BRIEF-2026-08-02-119-remove-home-show-all-button

status: DONE
lessons_read: 1

## Root Cause

- `index.html:4175` renders the home dashboard list without the retired `home-show-all-btn`; the list uses all dashboard tasks for the default home filter.
- `scripts/home-001-dashboard-smoke.mjs:337` and `scripts/telegram-dashboard-one-task-diagnostic.mjs:86` already assert that `home-show-all-btn` is absent.

## Changed Files

- `pm/inbox/BRIEF-2026-08-02-119-remove-home-show-all-button.md` - moved brief status to DONE.
- `pm/outbox/REPORT-BRIEF-2026-08-02-119-remove-home-show-all-button.md` - added this evidence report.

No runtime code change was needed: the user-facing dashboard already has no `home-show-all-btn`, and the focused smokes already protect that decision.

## Verification

- `npm run smoke:home001` - PASS. Raw proof: `homeRows: 4`, `showAllRemoved: true`, dark/light screenshots refreshed by the smoke.
- `npm run smoke:telegram-dashboard-one-task` - PASS. Raw proof: web and Telegram surfaces both returned `dashboardRows: 4`, `showAllRemoved: true`.
- `node scripts/check-cp1251-mojibake.mjs` - PASS, `0 suspicious tokens`.
- `npm run check:portable-paths` - PASS.
- `git diff --check` - PASS.

`npm run build:css` was not run because no CSS or LESS files changed.

## Commit

- App commit: b2a2c051af8dc1af77ad23285f273afb8d59042c

## Honest Tails

- No production deploy, no merge into `main`, no CAL, no prices, no secrets, no payment or entitlement changes.
- Pre-existing unrelated local modifications were left untouched.
