# REPORT-BACK-050-accessibility-smoke-2026-07-20

Status: DONE
Branch: `feat/admin-tariff-api`
Automation: `4e-morning-inbox-and-safe-backlog-runner`

## Task

Add a safe repeatable evidence upgrade for `BACK-050` accessibility baseline without promoting the manual keyboard/mobile gate to Done.

## Root Cause

`index.html:6659` used `\b` word boundaries around Cyrillic critical-toast phrases. In the browser regex engine this did not reliably match phrases such as `Нет соединения`, so the toast stayed `role="status"` / `aria-live="polite"` instead of switching to `role="alert"` / `aria-live="assertive"`.

## Changed Files

- `index.html` - removed Cyrillic-hostile word boundaries from `isCriticalToastMessage()`.
- `scripts/back-050-accessibility-smoke.mjs` - added local Chrome/CDP smoke for auth fields, toast live-region behavior, and dialog focus management at 390x844.
- `package.json` - added `npm run smoke:back050`.
- `FILE_MAP.md`, `docs/tasks/EVIDENCE-AUDIT-2026-07-17.md`, `pm/backlog.md`, `pm/team-sync.md`, `DEVELOPMENT_LOG.md`, `shared/WORK_LOG.md` - recorded evidence and status without marking `BACK-050` Done.

## Raw Proof

```text
npm run smoke:back050
ok: true
failures: []
authFields: login-email, login-pass, reg-name, reg-email, reg-pass, forgot-email, reset-pass, reset-pass2
criticalToastText: Нет соединения
dialogs: quick-add-overlay, contact-panel-overlay, focus-panel-overlay
documentScrollWidth: 390
viewportWidth: 390
```

Encoding:

```text
index.html markers before edit: 106
index.html markers after edit: 106
```

## Honest Tails

- `NEEDS-REAL`: `BACK-050` still needs the planned manual keyboard/mobile smoke before the backlog item can move from `Ready for QA` to `Done`.
- No production deploy, `main` merge, CAL, price, payment, entitlement, secret, or live Telegram/device action was performed.
- App commit SHA: NEEDS-REAL until this report commit is created.
