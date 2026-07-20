# REPORT-BRIEF-2026-07-20-morning-refine-01-auth-avatar-login-diagnose

Status: NEED-CLAUDE

## Scope

Requested brief file `pm/inbox/BRIEF-2026-07-20-morning-refine-01-auth-avatar-login-diagnose.md` was not present after `git fetch origin` and `git pull --ff-only` on `feat/admin-tariff-api`. `pm/inbox` had no task NEW briefs except `BRIEF-TEMPLATE.md`, which is not a task. I proceeded from the user-provided brief text and did not change auth, password, merge, payment, entitlement, production, or `main`.

## Changed Files

- `scripts/auth-avatar-login-diagnose.mjs` - repeatable live staging Chrome/CDP diagnostic for the three requested bugs.
- `package.json` - added `npm run smoke:auth-avatar`.
- `FILE_MAP.md` - documented the new diagnostic script.
- `pm/bugs.md` - added three NEED-CLAUDE bug rows.
- `pm/team-sync.md`, `shared/WORK_LOG.md`, `DEVELOPMENT_LOG.md` - recorded the diagnosis and stop reason.
- `pm/outbox/REPORT-BRIEF-2026-07-20-morning-refine-01-auth-avatar-login-diagnose.md` - this report.

## Root Cause

### 1. Wrong password: inline password error is empty

Live staging behavior:

- Fresh account: `auth-avatar-a-1784569048038-770670@example.org`.
- API: `POST /auth/login` with wrong password returned `400 {"ok":false,"error":"Неверный email или пароль"}`.
- UI: stayed on `login`, token stayed empty, toast showed `Неверный email или пароль`, but `#login-pass-error` was empty.

Root cause candidate:

- `scripts/auth-handlers.js:243-245` calls `setAuthFieldError('login-pass', message)` when login fails.
- `scripts/auth.js:170-180` finds the error element using `input?.parentElement?.querySelector('.form-error')`.
- `index.html:260-267` wraps the password input in `.password-field`, while `#login-pass-error` is a sibling after that wrapper, not a child of the input parent.

Proposed fix:

- Change the form-error helper to target `document.getElementById(fieldId + '-error')` first, then fall back to the current traversal. This is a UI error-rendering fix, not a password/auth logic change.

### 2. Avatar leaks into a new account in the same browser

Live staging behavior:

- Fresh account A logged in and got a local avatar draft.
- After `doLogout()`, `localStorage.extendedProfileDraft` still contained `photoDataUrl`.
- Fresh account B logged in in the same browser and `#user-avatar-small` used the same data-url avatar.

Root cause candidate:

- `index.html:2032` defines a single global key: `EXT_PROFILE_K='extendedProfileDraft'`.
- `index.html:2033-2036` reads this global draft and applies `draft.photoDataUrl` to `#user-avatar-small` and `#profile-avatar`.
- `scripts/auth-handlers.js:466-475` clears token/session state on logout, but does not clear or scope `extendedProfileDraft`.
- `index.html:2016-2020` calls `setProfileAvatarElement()` for the current user, so the next user inherits the previous draft.

Proposed fix:

- Scope profile drafts by stable user id/email, for example `extendedProfileDraft:<currentUser.id>`, and migrate/clear the legacy global key on login/logout. Claude should review because this touches profile/auth lifecycle boundaries.

### 3. Avatar does not persist in web/fresh browser

Live staging behavior:

- Same-browser account A showed the data-url avatar after local draft write.
- Fresh browser login for the same account returned `draft:""` and no avatar background.

Root cause candidate:

- `index.html:2100` handles image changes by writing `draft.photoDataUrl` to localStorage and showing `Фото сохранено локально`.
- `index.html:2101-2113` `saveExtendedProfile()` writes name/phone/email/birthdate/about only to localStorage draft and mutates `currentUser.name`; it does not call a profile/avatar endpoint.
- `/auth/me` user payload in the live run had no persisted avatar/photo field.

Proposed fix:

- Either make the UI honest that web avatars are local-only, or add a server-backed profile/avatar persistence path. A production fix should likely introduce a profile update/avatar upload endpoint and a small client adapter; Claude should own the design because it crosses app and worker persistence.

## Raw Staging Proof

```text
npm run smoke:auth-avatar

app=https://4-ai-staging.pages.dev/
worker=https://restless-lab-d737-staging.shelckograff.workers.dev
freshAccountA=auth-avatar-a-1784569048038-770670@example.org
freshAccountB=auth-avatar-b-1784569049006-435586@example.org
wrongPasswordApi.status=400
wrongPasswordApi.body={"ok":false,"error":"Неверный email или пароль"}
wrongPasswordUi={"active":"login","token":"","passError":"","toast":"Неверный email или пароль"}
loginA={"active":"home","token":"<redacted>","profileName":"Auth Avatar a","homeAvatarText":"A","homeAvatarBg":"","draft":""}
avatarA.localDraft={"draft":"{\"photoDataUrl\":\"data:image/png;base64,<redacted>\"}","homeAvatarBg":"url(\"data:image/png;base64,<redacted>\")","profileAvatarBg":"url(\"data:image/png;base64,<redacted>\")"}
logoutA={"token":"","draft":"{\"photoDataUrl\":\"data:image/png;base64,<redacted>\"}"}
loginB.sameBrowser={"active":"home","token":"<redacted>","profileName":"Auth Avatar b","homeAvatarText":"","homeAvatarBg":"url(\"data:image/png;base64,<redacted>\")","draft":"{\"photoDataUrl\":\"data:image/png;base64,<redacted>\"}"}
loginA.freshBrowser={"active":"home","token":"<redacted>","profileName":"Auth Avatar a","homeAvatarText":"A","homeAvatarBg":"","draft":""}
```

## Verification

```text
node --check scripts/auth-avatar-login-diagnose.mjs
node scripts/check-cp1251-mojibake.mjs
npm run check:js-syntax
Git Bash scripts/check-portable-paths.sh
git diff --check
```

## Honest Tails

- NEED-CLAUDE: auth/password/merge logic was intentionally not changed.
- NEED-CLAUDE: profile/avatar persistence needs a reviewed app/worker design, not an autonomous patch.
- NEEDS-REAL: this is headless web staging evidence, not Telegram Mini App device QA.
