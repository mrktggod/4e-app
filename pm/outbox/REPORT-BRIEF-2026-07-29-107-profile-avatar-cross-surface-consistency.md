# REPORT-BRIEF-2026-07-29-107-profile-avatar-cross-surface-consistency

Status: NEED-CLAUDE

## Decision

Do not patch autonomously at night. This is not a narrow frontend-only bug: same-account cross-surface avatar consistency requires a shared app/worker profile-avatar persistence contract and source-priority decision across web/PWA, Telegram and VK.

A missing avatar is safer than showing another user's avatar, so the previous scoped local draft privacy fix must stay intact until the backend/shared profile contract is designed.

## Root cause

- `index.html:2179-2193` stores and reads profile photo from a per-user localStorage draft key (`extendedProfileDraft:<user>`), then applies `draft.photoDataUrl` to `#user-avatar-small` and `#profile-avatar`.
- `index.html:2272` handles selected profile photos by writing `draft.photoDataUrl` locally and showing the local-save path. There is no upload/write to a shared profile/avatar endpoint.
- `index.html:2273-2285` saves extended profile fields only to the local draft and mutates `currentUser.name`; it does not persist avatar/profile fields to the worker.
- `vk.html:1053-1059` restores the VK app from `/auth/me`, but `vk.html:1112-1119` renders only name/email/initials into `userInitial` and `profileAvatar`; it does not read a shared avatar/photo field.
- `scripts/platform-adapter.js:1041-1051` stores `vk_user_photo` in `sessionStorage`, but then still renders `#user-avatar-small` as the first initial. This is platform-local data, not a linked-account shared avatar source.
- `worker-static.js` has no `avatar`, `photo`, `profile`, or `/auth/me` persistence route match in this app repo scan, so there is no safe frontend-only endpoint contract to call from all surfaces.

## Surface diagnosis

- Web/PWA profile avatar and home avatar are consistent only inside the same browser/user localStorage scope.
- Fresh browser for the same synthetic account has no avatar because the draft is local-only.
- VK profile/header avatar currently renders initials from `state.user.name`.
- Telegram/VK platform photo data, where present, is separate host-profile data and is not merged into a shared app account avatar.

## Evidence

`npm run smoke:auth-avatar` initially failed on this Windows host because the diagnostic still tries `chrome` when `CHROME_PATH` is not set:

```text
Error: spawn chrome ENOENT
```

Rerun with Playwright Chromium via `CHROME_PATH` passed and reproduced the same local-only behavior with redacted synthetic data:

```text
wrongPasswordUi passError="Неверный email или пароль"
avatarA.localDraft draft contains photoDataUrl, home/profile avatar backgrounds set
logoutA clears visible avatar and legacy draft
loginB.sameBrowser draft={}
loginA.sameBrowserAgain draft contains photoDataUrl, avatar background set
loginA.freshBrowser draft={}, avatar background empty
```

This proves the privacy leak remains closed, but same-account fresh-surface persistence is still absent by design.

## Proposed contract for Claude

1. Add a reviewed worker-backed profile endpoint or extend the existing user/profile contract with an avatar field, e.g. `avatarUrl` or `avatarAssetId`.
2. Define source priority: explicit app account avatar should win across surfaces; platform Telegram/VK photos may be import suggestions only unless the user chooses them.
3. Store avatar media safely, likely as an asset/R2 object plus a user-profile pointer, not raw long data URLs in auth payloads.
4. Return the same avatar reference from `/auth/me`, `/auth/vk`, Telegram auth and linked-account restore paths.
5. Update web/PWA, Telegram and VK renderers to read the shared field while preserving the scoped local draft as a temporary unsaved preview only.
6. Add synthetic local smoke proving one linked account renders the same redacted avatar reference across web home/profile and VK safe surfaces.

## Verification

- `node scripts/check-cp1251-mojibake.mjs`
  - PASS: 0 suspicious tokens.
- `npm run smoke:auth-avatar`
  - FAIL without `CHROME_PATH`: `spawn chrome ENOENT`.
- `CHROME_PATH=<Playwright Chromium> npm run smoke:auth-avatar`
  - PASS; evidence above.

## Manual live QA tail

Live Telegram/VK device confirmation was not run and remains human-gated. Yuri's personal photo was not used; only synthetic smoke accounts and redacted avatar data were used.

## Commit

This report is included in the task commit `docs(pm): scope shared avatar contract`; the final pushed SHA was verified against `origin/feat/admin-tariff-api` after commit.
