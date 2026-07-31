status: DONE
task: BACK-012 Telegram manual start BEM island cleanup
date: 2026-07-31
branch: feat/admin-tariff-api

# REPORT - BACK-012 Telegram manual start BEM island cleanup

## What changed

- Moved the Telegram manual `/start auth_*` fallback panel from generated inline layout styles to reusable CSS classes.
- Added `.telegram-manual-start-panel*` classes in `styles/layout.less`.
- Rebuilt `styles.css` and `styles.min.css`.

## Scope guard

- No production deploy.
- No merge to `main`.
- No prices, payment, entitlement, secrets, CAL, or auth-security logic changes.
- The auth behavior is unchanged: only presentation styles moved out of inline HTML.

## Changed files

- `scripts/auth-handlers.js`
- `styles/layout.less`
- `styles.css`
- `styles.min.css`
- `DEVELOPMENT_LOG.md`

## Verification

- `npm run build:css` - passed.
- `npm run check:ui-architecture` - passed, inline style attributes `283 / 465`, inline event handlers `402 / 402`, style tags `0 / 0`, inline script tags `3 / 3`.
- `npm run test:e2e:web -- --grep auth` - passed 4/4.
- `node scripts/check-cp1251-mojibake.mjs` - passed with 0 suspicious tokens.

## Result

DONE. This is a safe BACK-012 tech-debt slice; no manual Yuri action is needed for this cleanup.
