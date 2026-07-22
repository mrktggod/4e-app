status: DONE

# REPORT-BACK-012-notifications-inline-cleanup-2026-07-22

## Task

Continue `BACK-012` as one safe BEM-island cleanup slice after the statistics cleanup commit.

## Outcome

Moved notifications screen layout-only inline styles from `index.html` into `styles/screens/tasks.less` and rebuilt `styles.css` / `styles.min.css`.

`BACK-012` remains `Partial Done`; this is one narrow notifications island, not broad CSS architecture cleanup.

## Root Cause / Location

- `index.html:616` notifications header title wrapper used inline `flex:1`.
- `index.html:617` unread badge used inline visual styles and initial hidden state.
- `index.html:620` notification filters used inline padding.
- `index.html:627` notification list wrapper used inline padding.

## Changed Files

- `index.html`
- `styles/screens/tasks.less`
- `styles.css`
- `styles.min.css`
- `pm/backlog.md`
- `pm/team-sync.md`
- `shared/WORK_LOG.md`
- `DEVELOPMENT_LOG.md`
- `pm/outbox/REPORT-BACK-012-notifications-inline-cleanup-2026-07-22.md`

## Evidence

Raw checks:

```text
Before index.html edit encoding marker check: До правки: 106 совпадений
After index.html edit encoding marker check: После правки: 106 совпадений
npm run build:css: passed
node scripts/check-cp1251-mojibake.mjs: CP1251 mojibake check passed: 0 suspicious tokens
npm run smoke:back055: {"ok":true,"failures":[]}
git diff --check: passed
node scripts/check-js-syntax.mjs: JS syntax check: no staged JS or HTML files
C:\Program Files\Git\bin\bash.exe scripts/check-portable-paths.sh: Portable path check passed.
C:\Program Files\Git\bin\bash.exe scripts/check-ui-architecture.sh:
  UI architecture guard: inline style attributes = 309 / 465
  UI architecture guard: inline event handlers = 397 / 402
  UI architecture guard: style tags = 0 / 0
  UI architecture guard: inline script tags = 3 / 3
```

## Guardrails

No production deploy, no merge into `main`, no CAL work, no prices, no secrets, no payment or entitlement changes.

## Commit

This commit.
