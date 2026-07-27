status: DUPLICATE

# BRIEF-2026-07-27-87-telegram-bottom-nav-dark-theme-check

Superseded by `BRIEF-2026-07-27-96-telegram-bottom-menu-diagnostic.md`.

Do not process this duplicate brief in automation.

## Context

`pm/inbox/PRODUCT_IDEAS_TASKS.md` BUG-008: in Telegram Mini App dark theme, the bottom nav on the dashboard is unreadable/invisible, and an old nav variant still shows on other pages (profile, etc.).

## Task

1. **First check whether this is the stale service-worker cache issue** already fixed earlier (`PWA_VERSION` auto-versioning + automatic Worker deploy, see `deploy-worker-assets.yml` and `build-pages-whitelist.mjs`). Test against a build that has gone through the new cache-busting pipeline before concluding this is a fresh bug.
2. If it still reproduces on a fresh, correctly-cached build: fix the dark-theme nav styling on the dashboard, and remove the old nav variant from all non-dashboard pages (nav should only appear on dashboard per the intended design).
3. If it does NOT reproduce on a fresh build, report that clearly — do not implement a code fix for a cache artifact.

## Stop Points

- No production deploy, no `main` merge.

## Verification

- Screenshots: dashboard dark theme (nav visible/readable), profile and other pages (no stray old nav), before and after.

## Report

`pm/outbox/REPORT-2026-07-27-87-telegram-bottom-nav-dark-theme-check.md` — state clearly whether this was a cache artifact or a real bug.
