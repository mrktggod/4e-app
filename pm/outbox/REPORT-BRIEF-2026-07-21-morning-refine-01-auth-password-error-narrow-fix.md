# REPORT-BRIEF-2026-07-21-morning-refine-01-auth-password-error-narrow-fix

Status: DONE

## Root Cause

`scripts/auth.js:180` only searched `input.parentElement.querySelector('.form-error')`. For `login-pass`, the input is inside the password-toggle wrapper while `#login-pass-error` is a sibling after that wrapper, so the fallback lookup missed the inline error element.

## Changed

`setAuthFieldError()` now looks up `document.getElementById(fieldId + '-error')` first, then falls back to the old parent lookup. No login/password/session/backend logic was changed.

## Evidence

Before live staging evidence from `npm run smoke:auth-avatar` before deployment of this fix:

```text
wrongPasswordUi={"active":"login","token":"","passError":"","toast":"Неверный email или пароль"}
```

After local checkout smoke against staging worker:

```text
app=http://127.0.0.1:8765/
worker=https://restless-lab-d737-staging.shelckograff.workers.dev
wrongPasswordApi.status=400
wrongPasswordApi.body={"ok":false,"error":"Неверный email или пароль"}
wrongPasswordUi={"active":"login","token":"","passError":"Неверный email или пароль","toast":"Неверный email или пароль"}
```

The same smoke still reproduced avatar draft leakage, which is intentionally left for `BRIEF-2026-07-21-morning-refine-02-avatar-draft-scope-privacy-fix`.

## Checks

- `npm run smoke:auth-avatar` against local checkout + staging worker
- `node scripts/check-cp1251-mojibake.mjs`
- `npm run check:js-syntax`
- `git diff --check`
- `C:\Program Files\Git\bin\bash.exe scripts/check-portable-paths.sh`
- `C:\Program Files\Git\bin\bash.exe scripts/check-ui-architecture.sh`

## Commit

`885e3a30baff45a5532ef32926340bf9ea89942c`

## Guardrails

No production deploy, no merge to `main`, no CAL work, no price changes, no secrets, no payment/entitlement changes, and no auth/password/session logic changes.
