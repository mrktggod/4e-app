# REPORT-BRIEF-2026-07-21-morning-refine-02-avatar-draft-scope-privacy-fix

Status: DONE

## Root Cause

- `index.html:2108` used one global localStorage key, `extendedProfileDraft`, for local profile/avatar draft data.
- `scripts/auth-handlers.js:471` logout cleared auth/session state but did not clear visible avatar UI.
- The next account in the same browser could read the same global draft and render the previous account's local avatar.

## Changed

- Replaced the global draft key with a per-user key: `extendedProfileDraft:<currentUser.id/email/...>`.
- `getExtendedProfileDraft()` and `saveExtendedProfileDraft()` now drop the legacy unscoped key instead of migrating it to a random next login.
- Added `clearExtendedProfileUi()` and call it from `doLogout()` before clearing `currentUser`.
- Updated `scripts/auth-avatar-login-diagnose.mjs` to write/read scoped drafts through app functions and to verify account A re-login in the same browser.

No backend auth token/session/password/merge logic was changed.

## Evidence

Local checkout smoke against staging worker:

```text
wrongPasswordUi={"active":"login","token":"","passError":"Неверный email или пароль","toast":"Неверный email или пароль"}
avatarA.localDraft={"draft":"{\"photoDataUrl\":\"data:image/png;base64,...\"}","legacyDraft":"","homeAvatarBg":"url(\"data:image/png;base64,...\")","profileAvatarBg":"url(\"data:image/png;base64,...\")"}
logoutA={"token":"","legacyDraft":"","homeAvatarBg":"","profileAvatarBg":""}
loginB.sameBrowser={"active":"home","profileName":"Auth Avatar b","homeAvatarBg":"","draft":"{}","legacyDraft":""}
loginA.sameBrowserAgain={"active":"home","profileName":"Auth Avatar a","homeAvatarBg":"url(\"data:image/png;base64,...\")","draft":"{\"photoDataUrl\":\"data:image/png;base64,...\"}","legacyDraft":""}
```

This proves the privacy leak is closed for same-browser account switch, while account A's own scoped local draft still survives same-browser re-login. Fresh-browser persistence remains empty by design and is outside this brief.

Encoding check for `index.html`: `Войти|Задачи|Сегодня` marker count before edit `106`, after edit `106`.

## Checks

- `npm run smoke:auth-avatar` against local checkout + staging worker
- `node scripts/check-cp1251-mojibake.mjs`
- `npm run check:js-syntax`
- `git diff --check`
- `C:\Program Files\Git\bin\bash.exe scripts/check-portable-paths.sh`
- `C:\Program Files\Git\bin\bash.exe scripts/check-ui-architecture.sh`

## Commit

Pending

## Guardrails

No production deploy, no merge to `main`, no CAL work, no price changes, no secrets, no payment/entitlement changes, and no auth token/session/password/merge backend changes.
