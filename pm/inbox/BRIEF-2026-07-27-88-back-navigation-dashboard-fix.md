status: DUPLICATE

# BRIEF-2026-07-27-88-back-navigation-dashboard-fix

Superseded by `BRIEF-2026-07-27-85-return-to-previous-route.md`.

Do not process this duplicate brief in automation.

## Context

`pm/inbox/PRODUCT_IDEAS_TASKS.md` BUG-003: exiting/going back from a task card or other entity always lands on the dashboard instead of the screen the user actually came from (e.g. open a task from "Задачи" list, hit back, land on dashboard instead of "Задачи").

## Task

Replace the hard-coded "always go to dashboard" back behavior with a return to the actual previous screen/route (history-based), with a fallback to dashboard only when there is no previous route (e.g. deep link opened directly). Cover: tasks list, calendar, statistics, profile — anywhere there's an enter-then-back flow.

## Stop Points

- No production deploy, no `main` merge.
- This touches navigation broadly — after fixing, run an extended regression smoke covering enter/exit across tasks, calendar, statistics, profile, deep-link-direct-open, and post-reload state. Do not consider this done on a single-screen test.

## Verification

- Smoke evidence for each of: tasks→task→back, calendar→task→back, statistics→task→back, profile→(sub-screen)→back, direct deep-link open→back (dashboard fallback expected here).

## Report

`pm/outbox/REPORT-2026-07-27-88-back-navigation-dashboard-fix.md`.
