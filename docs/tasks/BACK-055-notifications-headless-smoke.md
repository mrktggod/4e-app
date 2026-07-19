# BACK-055 - notification action-card headless smoke

Date: 2026-07-20
Status: PASS
Scope: local headless Chrome/CDP smoke for `scripts/task-ui-renderers.js` notification action-card renderer.

## Why

`docs/tasks/EVIDENCE-AUDIT-2026-07-17.md` marked `BACK-055` as `SOURCE-ONLY` because the notification action feed had source/docs evidence but no UI/headless interaction proof. This smoke adds repeatable evidence without touching live Telegram, production, payments, entitlement, secrets, prices, or CAL.

## Command

```text
npm run smoke:back055
```

## Result

```json
{
  "ok": true,
  "failures": [],
  "metrics": {
    "cardCount": 4,
    "documentScrollWidth": 390,
    "viewportWidth": 390,
    "initialUnreadBadge": "3 новых",
    "deadlineActions": [
      "К задаче",
      "Отложить",
      "Готово"
    ],
    "snoozeDisplay": "grid",
    "snoozeOptionCount": 4,
    "waitingActions": [
      "Написать",
      "Открыть задачу"
    ],
    "deadlineFilteredCount": 1,
    "systemFilteredCount": 1,
    "taskEmptyText": "•Пока нет событийКогда появится важное действие, 4 покажет его здесь."
  }
}
```

## Covered

- Four notification cards render at 390x844 without horizontal overflow.
- Unread badge shows the expected unread count.
- Deadline card expands.
- Deadline card top-level actions are exactly `К задаче`, `Отложить`, `Готово`.
- Snooze menu opens as a compact grid with four options.
- Snooze action updates the linked task id.
- `К задаче` opens the linked task id and index.
- Reminder `Готово` calls the task done path with the linked task id.
- Waiting notification exposes `Написать` and opens the write flow.
- Deadline/system filters show one card each.
- Empty filtered state renders user-facing text.

## Tails

- `NEEDS-REAL`: physical phone visual QA is still useful for polish, but this removes the `SOURCE-ONLY` evidence gap requested by the audit.
