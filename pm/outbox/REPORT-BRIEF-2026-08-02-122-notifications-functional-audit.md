# REPORT — BRIEF-2026-08-02-122-notifications-functional-audit

## Capability map

| Capability | Source evidence | Proof level / gap |
| --- | --- | --- |
| In-app notification center | Home bell opens `notifications`; renderer loads `/notifications`, renders filters, unread count and action cards | Local UI smoke PASS; uses fixture data, not live API. |
| Task reminders | Task-detail bell stores reminder through `setReminderOnWorker`; chat reminder actions use the same helper | Source-only; no real reminder scheduled or delivered. |
| User settings | `notif-settings` loads/saves `/notifications/settings`; Worker persists normalized settings through D1 or KV | Source/API-contract only; no authenticated runtime check. |
| Server-side notification feed | Worker `pushNotif` persists feed entries; `GET /notifications` invokes reminder check before returning the feed | Source-only; Worker checkout was not modified or run live. |
| Telegram delivery | Worker has briefing/deadline/reminder code and a Telegram `sendMessage` boundary; bot has command/task-message sends | Not proven. The cross-repo contract smoke assumes sibling `worktrees/worker`, which is absent; using the dirty canonical worker would break this task's isolation. |
| Browser permission / OS notification | No `Notification.requestPermission` or `Notification.permission` usage found in the app surface | Missing product/runtime capability, not an implementation guess for this audit. |

## Local evidence

`npm run smoke:back055` PASS at 390px:

- 4 notification cards and 3 unread;
- deadline/reminder/waiting/system filters and no horizontal overflow;
- deadline task action, snooze menu (4 options), done action and waiting-message action;
- light/dark evidence files referenced by the smoke.

The smoke uses local fixtures and stubs fetches. It proves interaction structure, not live
delivery, sound, Telegram, browser permission or Worker persistence.

## BLOCKED / NEED-YURI tails

1. `NEED-YURI — notification delivery runner`: use a disposable test account and a clean
   worker+bot checkout to run the Telegram delivery contract and one real end-to-end reminder.
   This app automation must not send it.
2. `NEED-YURI — product decision`: decide whether browser/OS notification permission is a
   supported product channel. There is currently no permission request path.
3. `NEED-YURI — portable contract runner`: assign a cross-repo runner or approve a
   worktree-safe worker-source parameter for the existing contract smoke; this brief does not
   alter test infrastructure across repos.

## Verification

- `npm run smoke:back055` — PASS.
- `npm run smoke:telegram-notification-contract` — not run to completion: its fixed sibling
  worker path resolves to `worktrees/worker`, which does not exist. This is recorded above,
  not treated as delivery evidence.
- No live notification, Telegram, bot, production, deploy or merge action was performed.
