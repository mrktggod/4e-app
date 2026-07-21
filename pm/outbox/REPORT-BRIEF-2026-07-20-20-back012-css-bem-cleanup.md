# REPORT-BRIEF-2026-07-20-20-back012-css-bem-cleanup

## Status
DONE

## Scope
Small BACK-012 CSS/BEM cleanup island on auth/password screens only. No product logic, payment, entitlement, CAL, main merge, production deploy, or secret changes.

## Root cause / debt
Legacy auth markup still carried simple layout-only inline styles in `index.html`, while equivalent reusable auth primitives belong in LESS.

## Changed files
- `index.html`
- `styles/layout.less`
- `styles.css`
- `styles.min.css`
- `pm/backlog.md`
- `shared/WORK_LOG.md`
- `DEVELOPMENT_LOG.md`
- `pm/inbox/BRIEF-2026-07-20-20-back012-css-bem-cleanup.md`

## What moved inline -> LESS
- `auth-center-panel`: forgot/reset center panel flex layout.
- `auth-icon-card`: forgot/reset icon shell.
- `auth-password-field`: password input relative wrapper for eye button.
- `auth-inline-action`, `auth-inline-action--tight`, `auth-inline-action--spaced`: small auth action alignment/margins.

## Guard evidence
- Before this cleanup: `check-ui-architecture.sh` reported inline style attributes `366 / 465`, inline event handlers `395 / 402`, style tags `0 / 0`, inline script tags `3 / 3`.
- After this cleanup: `check-ui-architecture.sh` reported inline style attributes `356 / 465`, inline event handlers `395 / 402`, style tags `0 / 0`, inline script tags `3 / 3`.
- Net: inline style debt reduced by 10 attributes, no handler/script/style growth.

## Verification
- `npm run build:css` passed.
- Encoding guard: `Войти|Задачи|Сегодня` stayed `106 -> 106`.
- `node scripts/check-cp1251-mojibake.mjs` passed with `0 suspicious tokens`.
- `git diff --check` passed.
- `bash scripts/check-ui-architecture.sh` passed and showed lower inline style baseline.
- `bash scripts/check-portable-paths.sh` passed.
- `npm run smoke:back050` passed with `ok: true`, no failures, auth field ARIA metrics green, `documentScrollWidth=390`, `viewportWidth=390`.

## SHA
Pending until commit.
