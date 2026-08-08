# REPORT-BRIEF-2026-08-02-122-notifications-functional-audit

status: DONE
lessons_read: 1

## Current Capability Map

### Permission Request

- I did not find a browser `Notification.requestPermission()` or equivalent Mini App permission request in the app checkout.
- `index.html:855` has a notification settings screen and `index.html:865` has a push toggle, but this is preference UI, not a system permission prompt.

### Reminder Save Path

- Task detail reminder UI exists at `index.html:466` and the late helper `setDetailReminderFromBell(...)` at `index.html:9099`.
- Saving a detail task includes `reminder: currentDetailReminder` at `index.html:6272`.
- Worker reminder scheduling is called through `setReminderOnWorker(...)` at `index.html:6305`; it posts `x-action: set-reminder` with task id, task text, deadline, and reminder type.
- AI task actions can set reminders from task-detail chat at `index.html:5878` / `index.html:5879` and from general AI task actions at `index.html:7084` / `index.html:7085`.

### Local Notification UI

- Home bell entry exists at `index.html:345`.
- Notifications screen exists at `index.html:618`, with filters at `index.html:625`.
- Notification settings live at `index.html:855`, with local preference persistence and `/notifications/settings` sync around `index.html:7877` through `index.html:8024`.
- Render/action logic is in `scripts/task-ui-renderers.js`; FILE_MAP points to `scripts/back-055-notifications-smoke.mjs` for coverage.

### Delivery Contract Evidence

- `scripts/telegram-notification-delivery-contract-smoke.mjs` reads the sibling worker checkout and verifies the notification/briefing send boundary without live Telegram calls.
- The contract smoke currently reaches the worker source and fails because the worker sends `parse_mode: Markdown`, while the smoke expects `MarkdownV2`.
- This is a real delivery-contract mismatch to handle separately; it is outside this audit brief and outside app-only UI.

### Existing Test Coverage

- `npm run smoke:back055` covers local notification cards: empty state, filters, unread badge, expand, snooze, go-to-task, done, and write actions.
- `npm run smoke:back067-reminder` is the mapped focused smoke for task-detail reminder picker behavior.
- `npm run smoke:telegram-notification-contract` is intended to cover worker Telegram delivery preflight, but currently fails on parse mode.

## Gaps

- No app-side system permission request was found.
- No live notification delivery was verified in this automation run.
- No sound/vibration delivery behavior was proven.
- Browser/PWA, Telegram Mini App, bot fallback, and worker scheduled delivery are not tied together by one green end-to-end proof.
- The worker delivery contract mismatch (`Markdown` vs `MarkdownV2`) should be triaged before claiming Telegram briefing delivery green.

## Next Safe Briefs

1. Create a narrow worker/delivery contract brief for `scripts/telegram-notification-delivery-contract-smoke.mjs` failure: decide whether worker should send `MarkdownV2` or the smoke should expect `Markdown`, then update worker/test with mock-only proof.
2. Create a frontend-only permission UX brief: add a contextual "enable notifications" state if the product decision is confirmed, without touching worker delivery.
3. Create a reminder E2E preflight brief: mock `set-reminder` and verify task-detail reminder save path from UI to request payload, no live notifications.

## Verification

- `npm run smoke:back055` - PASS. Raw proof: `cardCount: 4`, unread badge `3 новых`, deadline actions `К задаче / Отложить / Готово`, snooze menu `grid` with 4 options, light/dark screenshots refreshed.
- `npm run smoke:telegram-notification-contract` - FAIL. Raw proof: assertion expected `MarkdownV2`, actual `Markdown`; live Telegram was not called.
- `node scripts/check-cp1251-mojibake.mjs` - PASS, `0 suspicious tokens`.
- `npm run check:portable-paths` - PASS.
- `git diff --check` - PASS.

## Commit

- App commit: 074a0fbdec31543d672de8352f1b1da61f64e436

## Honest Tails

- No live notifications were sent.
- Worker/bot runtime was not changed.
- No production deploy, no merge into `main`, no CAL, no prices, no secrets, no payment or entitlement changes.
- Pre-existing unrelated local modifications were left untouched.
