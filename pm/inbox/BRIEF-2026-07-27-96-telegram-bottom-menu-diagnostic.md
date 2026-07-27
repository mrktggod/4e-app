status: NEW

# BRIEF-2026-07-27-96-telegram-bottom-menu-diagnostic

## Context

Yuri/Product BUG-008: Telegram Apps bottom menu is wrong in dark theme and old menu appears on inner pages.

## Task

Diagnose bottom menu behavior before changing code.

Check:

- dashboard dark theme menu visibility;
- profile/task/subscription/statistics inner pages;
- whether old menu is still in source or coming from cache/stale shell;
- whether Telegram WebView is serving older assets.

If the fix is a narrow frontend shell/style correction, implement it. If the issue is deployment/cache drift, write the exact manual next step.

## Verification

- Add or extend Telegram/web smoke for bottom nav visibility and old-menu absence.
- Capture dark-theme screenshot if visual fix is made.
- `node scripts/check-cp1251-mojibake.mjs`

## Report

Create `pm/outbox/REPORT-BRIEF-2026-07-27-96-telegram-bottom-menu-diagnostic.md`.
