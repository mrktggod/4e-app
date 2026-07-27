status: DONE

# BRIEF-2026-07-27-92-iphone14-responsive-regression-pass

## Context

Misha tested on iPhone 14 and found multiple right-edge/mobile adaptation issues. Some are likely improved by recent home/task-card work, but need one focused regression pass.

## Task

Run and extend mobile-width checks for iPhone 14-like viewport.

Cover:

- Today task rows;
- task detail;
- statistics;
- date/time popovers;
- bottom navigation;
- long task titles.

If one narrow bug is found, fix it. If multiple unrelated bugs are found, report exact follow-up briefs instead of doing broad changes.

## Verification

- Focused smoke at iPhone 14-like width.
- No horizontal overflow.
- screenshots if visual changes are made.
- `node scripts/check-cp1251-mojibake.mjs`

## Report

Create `pm/outbox/REPORT-BRIEF-2026-07-27-92-iphone14-responsive-regression-pass.md`.
