status: DONE

# REPORT-BRIEF-2026-07-22-31-task-reminder-time-ios

## Result

Fixed the task-detail reminder time picker as a narrow frontend/UI change. The reminder trigger is now a standalone button and the hidden `select#detail-reminder` is a sibling element, so iOS/TMA no longer has invalid nested interactive markup. The existing save/update path still reads and writes `#detail-reminder`.

## Root Cause

- `index.html:462`: hidden `<select id="detail-reminder">` was nested inside `button.detail-redesign-bell`, while the same button also opened a custom popover.
- `styles/screens/tasks.less:2561`: late QA CSS forced task-detail action buttons to `36x36`, below the 44px mobile target.

## Changed Files

- `index.html`
- `styles/screens/tasks.less`
- `styles.css`
- `styles.min.css`
- `package.json`
- `scripts/back-067-task-detail-reminder-smoke.mjs`
- `pm/inbox/BRIEF-2026-07-22-31-task-reminder-time-ios.md`
- `pm/bugs.md`
- `pm/backlog.md`
- `FILE_MAP.md`

## Raw Proof

```text
До правки: 111 совпадений
После правки: 111 совпадений

npm run smoke:back067-reminder
{
  "smoke": "back067-reminder",
  "ok": true,
  "failures": [],
  "viewport": { "width": 390, "height": 844 },
  "trigger": { "width": 44, "height": 44 },
  "selected": "1hour"
}
```

## Tests

- `npm run build:css`
- `node scripts/check-cp1251-mojibake.mjs`
- `git diff --check`
- `npm run smoke:back067-reminder`

## Boundaries

No production deploy, no merge into `main`, no notification delivery/backend refactor, no CAL, no payment or entitlement work, no auth-security changes, and no secrets touched.

## Commit

Pending in this task commit.

## Follow-Up

Run a real iPhone/TMA reminder selection smoke, then continue notification delivery/salience QA. `BUG-2026-07-22-002` and `BUG-2026-07-22-003` remain separate task-detail UI regressions.
