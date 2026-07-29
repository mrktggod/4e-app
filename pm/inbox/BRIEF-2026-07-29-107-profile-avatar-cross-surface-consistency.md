status: NEW

# BRIEF-2026-07-29-107-profile-avatar-cross-surface-consistency

## Context

Yuri reported a live product bug: profile photo attaches in one app version/surface
but does not appear consistently in other interfaces. The account is definitely
the same account, because tasks are shared across the surfaces, but profile
photos differ.

Prior related work:

- `pm/outbox/REPORT-BRIEF-2026-07-20-morning-refine-01-auth-avatar-login-diagnose.md`
  diagnosed that web avatar data was local-only and not persisted/read back from
  a shared profile/avatar source.
- `pm/outbox/REPORT-BRIEF-2026-07-21-morning-refine-02-avatar-draft-scope-privacy-fix.md`
  fixed cross-account local avatar leakage by scoping drafts to the current user.

This is not the same as the old cross-account leak. This is a same-account
cross-surface consistency issue: one user should have one profile photo across
Telegram, VK and web surfaces when those surfaces are linked to the same account.

## Task

Diagnose why the same account can show different profile photos across app
surfaces, then choose the safest allowed outcome:

1. Confirm which surfaces show different photos: Telegram Mini App, VK Mini App,
   web/PWA, profile screen, home avatar and any header avatar.
2. Trace the source of avatar data per surface:
   - local scoped draft/localStorage;
   - `currentUser` / `/auth/me` payload;
   - Telegram/VK platform profile photo;
   - any profile/avatar persistence endpoint if present.
3. Determine whether the fix is a narrow frontend read/write consistency bug or
   requires a shared app/worker profile-avatar persistence contract.
4. If it is a narrow frontend-only bug outside auth/session merge logic, fix it
   and add/extend a smoke proving one same synthetic user renders the same avatar
   across the safe local surfaces.
5. If it requires backend profile/avatar persistence, auth/session merge changes,
   platform OAuth/profile-source decisions, or new storage/API contract, do not
   patch at night. Write `NEED-CLAUDE` with exact file:line findings and the
   proposed contract.

## Expected Result

For one linked account, profile photo should be one consistent value across all
safe app surfaces. Tasks already proving the account is unified must not be
affected.

## Stop Points

- No production deploy or merge into `main`.
- No real Telegram/VK device actions as a Done gate; mark live platform visual
  confirmation as manual QA.
- No secrets, payment, entitlement, price or CAL work.
- Do not weaken the previous cross-account avatar privacy fix. A missing avatar
  is safer than showing another user's avatar.
- If the fix touches auth/session merge, backend persistence, OAuth profile
  source priority, or a new profile/avatar endpoint, classify as `NEED-CLAUDE`.

## Verification

- `node scripts/check-cp1251-mojibake.mjs`
- Existing or extended avatar smoke, preferably based on
  `npm run smoke:auth-avatar`, using synthetic accounts only.
- If code changes are frontend-only: `npm run check:portable-paths`,
  `npm run check:ui-architecture`, `git diff --check`.
- Raw evidence must show same-account surfaces and redacted avatar data, not
  Yuri's personal photo.

## Report

Write
`pm/outbox/REPORT-BRIEF-2026-07-29-107-profile-avatar-cross-surface-consistency.md`
with root cause file:line, changed files or `NEED-CLAUDE` scope, proof, and the
manual live QA tail.
