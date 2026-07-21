status: NEW

## ⚠️ Delivery note
Same untracked-file delivery risk as `-01` — see that brief's note. Commit+push all three morning-refine-* briefs together if you pick this up from disk.

# BRIEF-2026-07-21-morning-refine-02-avatar-draft-scope-privacy-fix

## Context
Bug 2 of 3 from `pm/outbox/REPORT-BRIEF-2026-07-20-morning-refine-01-auth-avatar-login-diagnose.md` (commit `3829712`), the most important one: **privacy leak** — a Telegram user's avatar was visible on a freshly-registered second account (Yuri's manual QA 2026-07-19). Live-confirmed on staging with two fresh accounts in the same browser: account B's home avatar rendered account A's photo after A logged out and B logged in.

## Root cause (confirmed by Codex, RAW evidence in the report above)
- `index.html:2032` defines a single **global, unscoped** localStorage key `EXT_PROFILE_K='extendedProfileDraft'`.
- `index.html:2033-2036` reads this global draft on load and applies `draft.photoDataUrl` to `#user-avatar-small` / `#profile-avatar` for whoever is currently logged in.
- `scripts/auth-handlers.js:466-475` (`doLogout` / logout handler) clears token/session state but does **not** clear or scope `extendedProfileDraft`.
- Result: any locally-cached avatar draft survives logout and gets shown to the next user who logs into the same browser — a real cross-account data leak, not just a display bug.

## Task
Scope the local avatar/profile draft to the current user instead of a single global key:
1. Change the storage key to include a stable per-user identifier, e.g. `extendedProfileDraft:<userId or email>` (pick whichever stable identifier is already available on `currentUser` right after login — check what `/auth/me` or `currentUser` object exposes; do not invent a new backend field).
2. On login, only read/apply the draft for the identifier matching the just-logged-in user; do not fall back to a legacy unscoped key that could belong to someone else.
3. On logout, clear the in-memory avatar/profile state shown in the UI (`#user-avatar-small`, `#profile-avatar`) so nothing lingers visually even before the next login.
4. One-time migration: if the old global `extendedProfileDraft` key exists, it must NOT be silently reassigned to whichever user happens to log in next — either drop it or migrate it only to the account that actually owns it if that can be determined safely; when in doubt, drop it (a false-empty avatar is safe, a leaked avatar is not).

## Stop points
- ❌ prod, merge to `main`, CAL, prices, secrets, payment/entitlement.
- ❌ do not touch auth token/session/password/merge backend logic — this is a client-side localStorage-scoping fix only.
- ❌ do not add a new backend endpoint for this (that's bug 3, avatar-web-persistence, separate NEED-YURI product decision — out of scope here).
- If scoping this turns out to require touching account-merge logic (e.g. Telegram-linked accounts sharing a device), stop and mark NEED-CLAUDE with a plan instead of guessing.

## Verification (required, live — this is a privacy bug, treat evidence bar as high)
- Repeat the exact two-fresh-account-same-browser repro from the diagnosis report; after the fix, account B must NOT see account A's avatar after A logs out.
- Also verify: account A logging back in on the same browser still sees its own avatar (no regression / no accidental full wipe).
- `node scripts/check-cp1251-mojibake.mjs` = 0.

## Report
`pm/outbox/REPORT-BRIEF-2026-07-21-morning-refine-02-avatar-draft-scope-privacy-fix.md`: root cause confirmation, exact fix (file:line diff summary), before/after live repro evidence (RAW), commit SHA, status DONE or NEED-CLAUDE if it turns out to touch merge logic.
