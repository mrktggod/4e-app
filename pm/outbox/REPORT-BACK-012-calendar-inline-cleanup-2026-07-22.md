status: DONE

# REPORT-BACK-012-calendar-inline-cleanup-2026-07-22

## Task

Continue `BACK-012` as one safe BEM-island cleanup slice after inbox had no executable `status: NEW` briefs.

## Outcome

Moved calendar screen layout-only inline styles from `index.html` into `styles/screens/tasks.less` and rebuilt `styles.css` / `styles.min.css`.

`BACK-012` remains `Partial Done`; this is one narrow calendar island, not broad CSS architecture cleanup.

## Root Cause / Location

- `index.html:507` calendar title wrapper used inline `flex:1`.
- `index.html:513` month nav actions used inline flex layout.
- `index.html:524-532` deadlines section used inline spacing, heading, icon, and empty-state styles.
- `index.html:537` calendar footer used inline padding/flex-shrink.

## Changed Files

- `index.html`
- `styles/screens/tasks.less`
- `styles.css`
- `styles.min.css`
- `pm/backlog.md`
- `pm/team-sync.md`
- `shared/WORK_LOG.md`
- `DEVELOPMENT_LOG.md`
- `pm/outbox/REPORT-BACK-012-calendar-inline-cleanup-2026-07-22.md`

## Evidence

Raw checks:

```text
Before index.html edit encoding marker check: До правки: 106 совпадений
After index.html edit encoding marker check: После правки: 106 совпадений
npm run build:css: passed
node scripts/check-cp1251-mojibake.mjs: CP1251 mojibake check passed: 0 suspicious tokens
git diff --check: passed
node scripts/check-js-syntax.mjs: JS syntax check: no staged JS or HTML files
C:\Program Files\Git\bin\bash.exe scripts/check-portable-paths.sh: Portable path check passed.
C:\Program Files\Git\bin\bash.exe scripts/check-ui-architecture.sh:
  UI architecture guard: inline style attributes = 320 / 465
  UI architecture guard: inline event handlers = 397 / 402
  UI architecture guard: style tags = 0 / 0
  UI architecture guard: inline script tags = 3 / 3
```

Note: plain `bash` was not available in this PowerShell PATH, so shell guards were run through Git Bash at `C:\Program Files\Git\bin\bash.exe`.

## Guardrails

No production deploy, no merge into `main`, no CAL work, no prices, no secrets, no payment or entitlement changes.

## Commit

This commit.
