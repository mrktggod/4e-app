status: DONE

## ⚠️ Delivery note (read first)
This file is written by Cowork directly to disk and is **untracked** (Cowork has no git push credentials in this sandbox — confirmed via `git push --dry-run`). If you are a human/interactive Codex session reading this from disk: please `git add pm/inbox/BRIEF-2026-07-21-morning-refine-01-auth-password-error-narrow-fix.md pm/inbox/BRIEF-2026-07-21-morning-refine-02-avatar-draft-scope-privacy-fix.md pm/inbox/BRIEF-2026-07-21-morning-refine-03-platform-global-alias-investigate.md && git commit && git push` first, so a future Codex Automation cycle can see these too (same root-cause bug flagged for several cycles — see `pm/team-sync.md` / ask Yuri about the (a)/(b) decision).

# BRIEF-2026-07-21-morning-refine-01-auth-password-error-narrow-fix

## Context
Follow-up to `pm/outbox/REPORT-BRIEF-2026-07-20-morning-refine-01-auth-avatar-login-diagnose.md` (commit `3829712`). Bug 1 of 3 from Yuri's manual QA 2026-07-19: login with a correct password shows a toast "Неверный email или пароль" (backend behavior may be separate) but **the inline field error under the password input stays empty**, live-confirmed on staging (`wrongPasswordUi.passError=""`).

## Root cause (confirmed at current HEAD by Cowork, file:line still accurate)
- `scripts/auth.js:170-186` `setAuthFieldError(fieldId, message)`: tries `window.PLATFORM?.setFormFieldError` first (line 171), else falls back to `input?.parentElement?.querySelector('.form-error')` (line 180).
- For `login-pass`, `index.html:262-267` wraps the input in `<div style="position:relative">` together with the show/hide-password toggle button; `#login-pass-error` (`index.html:269`) is a **sibling of that wrapper div**, not inside `input.parentElement`. So the querySelector on line 180 finds nothing, and the fallback path always fails silently for this field.
- The `window.PLATFORM?.setFormFieldError` branch (line 171) never actually fires — see brief `-03-platform-global-alias-investigate` for why; do not fix that in this brief, it's a separate, higher-risk change.

## Task (narrow, safe fix — this alone is autonomous/DONE-able)
In `scripts/auth.js`, change the fallback error-lookup in `setAuthFieldError` (and check `clearAuthFieldError`/anywhere else using the same `parentElement.querySelector('.form-error')` pattern in this file) to look up the error element directly by id first:
```js
const err = document.getElementById(fieldId + '-error') || input?.parentElement?.querySelector('.form-error');
```
Do not change `setAuthFieldError`'s call sites, do not touch `auth-handlers.js` logic, do not touch backend/password/session code.

## Stop points
- ❌ prod, merge to `main`, CAL, prices, secrets, payment/entitlement.
- ❌ do not touch `window.PLATFORM`/`window.FourPlatform` wiring (separate brief `-03`).
- ❌ do not touch backend login/password logic — this is a client-side error-display bug only.

## Verification (required, live not just code-read)
- Re-run `npm run smoke:auth-avatar` (or extend it) on staging: wrong-password login attempt must show non-empty `#login-pass-error` text matching the API error message.
- `node scripts/check-cp1251-mojibake.mjs` = 0.
- `npm run check:js-syntax`, `git diff --check`.

## Report
`pm/outbox/REPORT-BRIEF-2026-07-21-morning-refine-01-auth-password-error-narrow-fix.md`: before/after live evidence of `#login-pass-error` text, commit SHA, status DONE.
