# REPORT-BACK-012-notification-renderer-bem-cleanup-2026-07-23

status: DONE

## Task

BACK-012 safe BEM-island cleanup: move generated notification renderer empty/action/menu inline layout styles into reusable classes.

## Root Cause

`scripts/task-ui-renderers.js:373-551` still generated notification empty state, kind chips, preview text, action wrapping and snooze menu layout through inline `style` attributes. The static notification shell had already been moved to LESS, but generated renderer fragments kept style debt in HTML strings.

## Changed Files

- `scripts/task-ui-renderers.js`
- `styles/screens/voice.less`
- `styles.css`
- `styles.min.css`
- `docs/tasks/BACK-012-component-inventory-2026-07-22.md`
- `pm/backlog.md`
- `pm/team-sync.md`
- `shared/WORK_LOG.md`
- `DEVELOPMENT_LOG.md`

## Proof

```text
npm run build:css
PASS

node --check scripts/task-ui-renderers.js
PASS

npm run smoke:back055
ok: true
cardCount: 4
documentScrollWidth: 390
snoozeDisplay: grid
snoozeOptionCount: 4
deadlineActions: ["К задаче","Отложить","Готово"]
waitingActions: ["Написать","Открыть задачу"]

node scripts/check-cp1251-mojibake.mjs
CP1251 mojibake check passed: 0 suspicious tokens

C:\Program Files\Git\bin\bash.exe scripts/check-ui-architecture.sh
inline style attributes = 309 / 465
inline event handlers = 401 / 402
style tags = 0 / 0
inline script tags = 3 / 3

C:\Program Files\Git\bin\bash.exe scripts/check-portable-paths.sh
Portable path check passed.
```

## Boundaries

No `index.html` edits, production deploy, merge to `main`, CAL, price, payment, entitlement, auth-security, or secrets work.

## Next

The next safe BACK-012 candidate is `task-card-head-meta` from `docs/tasks/BACK-012-component-inventory-2026-07-22.md`; it needs its own commit and `npm run smoke:back019`.
