status: DONE

# REPORT: BACK-012 auth inline cleanup island

Date: 2026-07-22
Branch: `feat/admin-tariff-api`
Outcome: DONE

## Task

Continue `BACK-012` with one narrow BEM island: remove layout-only inline styles from auth/onboarding/forgot/reset markup without changing auth behavior.

## Root Cause

Auth screens still carried layout styling inline:

- `index.html:201` onboarding legal note and privacy link styles.
- `index.html:214` / `index.html:215` forgot-password title and hint styles.
- `index.html:225` forgot-success card and child text styles.
- `index.html:239` / `index.html:240` reset-password title and hint styles.
- `index.html:265` login inner layout styles.
- `index.html:325` login legal note and privacy link styles.

## Changed Files

- `index.html`
- `styles/layout.less`
- `styles.css`
- `styles.min.css`
- `pm/backlog.md`
- `shared/WORK_LOG.md`
- `DEVELOPMENT_LOG.md`
- `pm/team-sync.md`
- `pm/outbox/REPORT-BACK-012-auth-inline-cleanup-2026-07-22.md`

## Implementation

- Added `auth-screen-title`, `auth-screen-hint`, `auth-form`, `auth-success-*`, and `legal-note--*` classes in `styles/layout.less`.
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

npm run smoke:back050
ok=true; failures=[]; documentScrollWidth=390; viewportWidth=390

npm run check:js-syntax
JS syntax check: no staged JS or HTML files

node scripts/check-cp1251-mojibake.mjs
CP1251 mojibake check passed: 0 suspicious tokens

C:\Program Files\Git\bin\bash.exe scripts/check-ui-architecture.sh
UI architecture guard: inline style attributes = 341 / 465
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
