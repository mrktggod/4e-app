status: DONE

# BRIEF-2026-07-29-108-web-profile-referral-link-empty

## Context

Yuri reported that in the web version the profile referral-link field is empty:
nothing is visible in the field.

## Task

Fix the safe frontend display issue so the referral-link field is never visually
blank. Do not fake a referral code if the Worker/current user payload does not
provide one.

## Result

Done in this task:

- When `currentUser.referralCode` exists, profile renders the real
  `?ref=<code>` link.
- When `currentUser.referralCode` is missing, profile renders a visible fallback:
  `Ссылка появится после синхронизации профиля`.
- Added `npm run smoke:profile-referral-link` to prove both states.

Remaining tail:

- If Yuri's live account still has no real referral link after refresh, the
  root cause is outside this frontend display fix: `/auth/me` or the Worker
  `publicUser()` payload is not returning `referralCode` for that account. That
  should be handled as a Worker/profile payload task, not by inventing a code in
  the frontend.

## Verification

- `npm run smoke:profile-referral-link`
- `node scripts/check-cp1251-mojibake.mjs`
- `node --check scripts/profile-referral-link-smoke.mjs`
- `git diff --check`

## Report

See `pm/outbox/REPORT-BRIEF-2026-07-29-108-web-profile-referral-link-empty.md`.
