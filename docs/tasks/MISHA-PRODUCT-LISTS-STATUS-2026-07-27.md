# MISHA / PRODUCT LISTS STATUS - 2026-07-27

Status: triage, decisions accepted by Yuri, next briefs created.

## Yuri Decisions From 2026-07-27

1. VK remains a separate product surface, but should be brought as close as practical to the desktop/Telegram experience.
2. VK task rows should have task actions like desktop and Telegram. The implementation still needs to respect VK mobile gestures.
3. The landing should be built on the main domain. It can be implemented now and edited later.
4. The large Misha/product triage brief should be split into real work and launched as separate small briefs.

## What Is Already Done From Misha's List

| Item | Current status | What happened | Next step |
| --- | --- | --- | --- |
| Misha BUG-001: focus-day counters disagree | DONE / needs live check | Fixed by focus counter consistency work and re-accepted in `REPORT-BRIEF-2026-07-25-76-focus-panel-acceptance-restart.md`. | Yuri can verify on the real app screen: focus card and popup both show the same count. |
| Misha BUG-002: statistics active tasks look empty | DONE / needs live check | Fixed by `REPORT-BRIEF-2026-07-25-71-statistics-active-tasks-empty.md`. | Yuri can open Statistics and confirm the copy no longer says active tasks are empty when focus/incoming active items exist. |
| Misha BUG-003: unclear hold gesture for voice button | NEW | Not fixed yet. | New brief created: `BRIEF-2026-07-27-90-voice-hold-hint.md`. |
| Misha BUG-004: bell/reminder button does not work | PARTIAL | Task-detail reminder popup has previous smoke coverage (`smoke:back067-reminder`), but Misha's exact active-card bell scenario still needs a narrow check. | New brief created: `BRIEF-2026-07-27-89-task-reminder-bell-active-card.md`. |
| Misha BUG-005: time picker saves/closes while scrolling minutes | NEW | Not fixed yet. | New brief created: `BRIEF-2026-07-27-87-task-time-picker-explicit-confirm.md`. |
| Misha BUG-006: date/time popover overflows right edge | PARTIAL | General task-detail overflow work exists, but this exact date/time popover case is not closed. | New brief created: `BRIEF-2026-07-27-88-task-date-popover-viewport-fit.md`. |
| Misha BUG-007: "Saved" toast sticks while scrolling task page | NEW | Not fixed yet. | New brief created: `BRIEF-2026-07-27-91-task-toast-dismiss-on-scroll.md`. |
| Misha BUG-008: Today task row overflows right edge | PARTIAL / likely improved | Home dashboard edge guard and glass task-card work were added, including 390px checks. Need one focused check against Misha's exact iPhone 14 case. | Covered by `BRIEF-2026-07-27-92-iphone14-responsive-regression-pass.md`. |

## What Is Already Done From Yuri/Product List

| Item | Current status | What happened | Next step |
| --- | --- | --- | --- |
| IDEA-001: support bot intake | NEW / later | Not implemented. It needs bot/chat destination decisions and is bigger than a UI fix. | Keep as later product/backend brief after beta flow is clearer. |
| TASK-002: remove "Premium 14 days" profile banner | NEW | Not fixed yet. | New brief created: `BRIEF-2026-07-27-84-profile-premium-banner-remove.md`. |
| BUG-003: back from cards returns to dashboard instead of previous screen | NEW | Not fixed yet. | New brief created: `BRIEF-2026-07-27-85-return-to-previous-route.md`. |
| BUG-004: unclear completion feedback inside task card | PARTIAL | VK completion feedback was fixed in `REPORT-VK-TASK-COMPLETE-001.md`. Telegram/web task-card completion still needs a focused pass. | New brief created: `BRIEF-2026-07-27-86-task-completion-feedback-web-tg.md`. |
| TASK-005: haptics/click feedback on buttons | NEW | Not fixed yet. Broad cross-platform haptics should start with a small pilot. | New brief created: `BRIEF-2026-07-27-94-button-feedback-haptics-pilot.md`. |
| BUG-007: Telegram Apps dashboard shows only one task | NEW | Not fixed yet. Needs diagnostic first: data count, render count, filters, cache. | New brief created: `BRIEF-2026-07-27-95-telegram-dashboard-one-task-diagnostic.md`. |
| BUG-008: Telegram Apps bottom menu is wrong/dark/old on inner screens | NEW | Not fixed yet. Needs diagnostic before code because it may be cache or route-specific shell drift. | New brief created: `BRIEF-2026-07-27-96-telegram-bottom-menu-diagnostic.md`. |
| TASK-009: improve generated task title/description | PARTIAL | `BACK-065` already improved title normalization. The fuller "nice title + description" behavior is not done. | New brief created: `BRIEF-2026-07-27-97-ai-task-title-description-quality.md`. |
| TASK-010: stop auto-generating task advice on open | NEW | Not fixed yet. | New brief created: `BRIEF-2026-07-27-93-task-advice-manual-generate.md`. |

## Manual QA Explained Plainly

These are checks Yuri can do by opening the actual app, not developer tests.

### VK Mini App

Open the VK Mini App on a phone.

1. First screen: check that the logo/name is shown once, not twice.
2. Create or pick a safe test task.
3. Tap `Готово` or the completion action.
4. The task should disappear from active tasks.
5. Refresh/reopen the app.
6. The same task should not return as active.

### Telegram Mini App Task Chat

Open the Telegram Mini App, open any safe test task, then open the task chat/discussion.

1. Trigger or use an AI suggested action.
2. Tap confirm.
3. The suggested change should apply once.
4. If it fails, the app should show a clear error instead of silently doing nothing.

### Task Cards On Phone

Open the normal app on a phone-sized screen.

1. Check Today task rows: no right-edge clipping.
2. Check long task titles: text wraps or truncates cleanly.
3. Check light and dark themes.
4. Check overdue/urgent cards: accent is visible but not too loud.

### Focus Panel

Open Today.

1. Look at the Focus card count.
2. Open the Focus popup/sheet.
3. The popup count should match the card count.
4. Statistics should not falsely say there are no active tasks when focus/incoming active tasks exist.

## Next Execution Order

Recommended order for implementation:

1. Landing on main domain plan-to-code.
2. Profile premium banner removal.
3. Task advice manual generation.
4. Return-to-previous-route bug.
5. Web/TG task completion feedback.
6. Misha iPhone task-detail bugs: reminder bell, time picker, date popover, toast.
7. VK separate-surface parity: dashboard, task detail, profile, then swipe.
8. Diagnostics: Telegram one-task dashboard and bottom menu.
9. AI title/description quality and haptics pilot.
