status: DONE

# REPORT: BACK-012 task-move inline cleanup island

Date: 2026-07-22
Branch: `feat/admin-tariff-api`
Outcome: DONE

## Task

Continue `BACK-012` with one narrow BEM island: remove layout-only inline styles from the task move preset screen.

## Root Cause

Task move markup still carried repeated inline layout styles:

- `index.html:1667` back title wrapper flex style.
- `index.html:1669` task-move scroll content layout.
- `index.html:1670` glass panel radius/overflow/margin.
- `index.html:1671` / `index.html:1672` / `index.html:1673` preset title/subtitle styles.
- `index.html:1674` custom-date last-row border and text styles.
- `index.html:1676` confirm button styles.

## Changed Files

- `index.html`
- `styles/screens/tasks.less`
- `styles.css`
- `styles.min.css`
- `pm/backlog.md`
- `shared/WORK_LOG.md`
- `DEVELOPMENT_LOG.md`
- `pm/team-sync.md`
- `pm/outbox/REPORT-BACK-012-task-move-inline-cleanup-2026-07-22.md`

## Implementation

- Added `task-move-title-wrap`, `task-move-content`, `task-move-panel`, `move-option--last`, `move-option-title`, `move-option-sub`, and `task-move-confirm`.
- Replaced the matching inline `style` attributes in `index.html`.
- Rebuilt `styles.css` and `styles.min.css`.

## Evidence

```text
Encoding pre-check:
До правки: 106 совпадений

Encoding post-check:
После правки: 106 совпадений

npm run build:css
lessc styles/main.less styles.css && cleancss styles.css -o styles.min.css

npm run smoke:back019
ok=true; failures=[]; documentScrollWidth=390; longTitleLineClamp=2

node scripts/check-cp1251-mojibake.mjs
CP1251 mojibake check passed: 0 suspicious tokens

C:\Program Files\Git\bin\bash.exe scripts/check-ui-architecture.sh
UI architecture guard: inline style attributes = 328 / 465
UI architecture guard: inline event handlers = 397 / 402
UI architecture guard: style tags = 0 / 0
UI architecture guard: inline script tags = 3 / 3

C:\Program Files\Git\bin\bash.exe scripts/check-portable-paths.sh
Portable path check passed.

git diff --check
<no output>
```

## App / Worker SHA

No worker code changed. App commit SHA is filled by the git commit for this report.

## Guardrails

No production deploy, no merge to `main`, no CAL work, no price changes, no payment or entitlement refactor, no secret access/disclosure.
