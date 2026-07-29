# REPORT-BRIEF-2026-07-29-108-web-profile-referral-link-empty

Outcome: `DONE`

## Root cause

- `index.html` rendered `#profile-ref-link` from `getProfileReferralLink()`.
- `getProfileReferralLink()` can return an empty string when `currentUser.referralCode`
  is missing from the user payload.
- That made the readonly referral-link input visually empty in the web profile.

## Fix

- `index.html`: keep real link generation when `currentUser.referralCode` exists.
- `index.html`: render visible fallback copy when the referral code is missing.
- `scripts/profile-referral-link-smoke.mjs`: added a focused profile smoke for
  both real-link and missing-code states.
- `package.json`: added `smoke:profile-referral-link`.

## Verification

- `npm run smoke:profile-referral-link` PASS:
  - with `referralCode`: `?ref=refcode123` is rendered.
  - without `referralCode`: visible fallback is rendered.
- `node scripts/check-cp1251-mojibake.mjs` PASS: `0 suspicious tokens`.
- `node --check scripts/profile-referral-link-smoke.mjs` PASS.
- `git diff --check` PASS.

## Manual tail

If the live web account still does not get a real `?ref=` link, check Worker
`publicUser()` / `/auth/me` for missing `referralCode`. Frontend must not invent
a referral code because that could create a link that displays correctly but
does not award bonuses.
