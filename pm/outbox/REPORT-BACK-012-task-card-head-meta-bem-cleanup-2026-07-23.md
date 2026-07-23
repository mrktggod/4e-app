# REPORT-BACK-012-task-card-head-meta-bem-cleanup-2026-07-23

status: DONE

## Task

BACK-012 safe BEM-island cleanup: move generated task-card header/category/deadline inline layout styles into reusable classes.

## Root Cause

`scripts/task-ui-renderers.js:38` rendered `task-card-head`, category tag and deadline styles through inline `style` attributes. The LESS already had a task-card grid, but the inline flex layout overrode it and made the generated renderer carry avoidable style debt.

## Changed Files

- `scripts/task-ui-renderers.js`
- `styles/screens/home.less`
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

npm run smoke:back019
ok: true
viewportWidth: 390
documentScrollWidth: 390
longTitleHeight: 38
longTitleLineClamp: "2"
swipeRightTransform: "translateX(96px)"

node scripts/check-cp1251-mojibake.mjs
CP1251 mojibake check passed: 0 suspicious tokens

C:\Program Files\Git\bin\bash.exe scripts/check-ui-architecture.sh
inline style attributes = 309 / 465
inline event handlers = 401 / 402
style tags = 0 / 0
inline script tags = 3 / 3

C:\Program Files\Git\bin\bash.exe scripts/check-portable-paths.sh
Portable path check passed.

Select-String scripts\task-ui-renderers.js -Pattern 'style="'
no matches
```

## Boundaries

No `index.html` edits, production deploy, merge to `main`, CAL, price, payment, entitlement, auth-security, or secrets work.

## Next

The remaining inventory candidate is `ask-action-preview`, but it touches `index.html`; require the encoding ritual plus a focused ask composer smoke before changing code.
