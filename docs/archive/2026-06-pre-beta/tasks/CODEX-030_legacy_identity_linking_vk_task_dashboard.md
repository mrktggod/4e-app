# CODEX-030 — Legacy identity linking and VK task dashboard read compatibility

Date: 2026-06-19

## Context

After the VK mobile login fixes, the user confirmed two related symptoms:

- email login in VK Mini App entered an account where Telegram/VK data could still be separate;
- chat task commands could be saved, but the dashboard still showed no tasks.

This matched Gate 2: Web/TG/VK identities must converge into one canonical user.

## Diagnosis

- Production `/auth/login`, `/auth/vk`, `/auth/telegram`, `/tasks` still use the legacy KV auth/task path.
- D1 v2 auth already has `users`, `auth_identities`, and `sessions`, but production frontend is not switched to it yet.
- Legacy VK auth created `vk_<id>` users and sessions without `email`, so `/auth/me` and task ownership could drift from email accounts.
- Legacy `/tasks` returns an array, while `4e-app/vk.html` expected `{ tasks: [...] }`; this could hide saved tasks on the VK dashboard.

## Changes

### Worker

File: `4e-worker/worker.js`

- Added legacy identity helpers:
  - `getUserById`;
  - `getSessionUser`;
  - `recordLinkedIdentity`;
  - `linkProviderIdentity`;
  - `copyLegacyUserBuckets`.
- Added safe copy-only merge of legacy buckets:
  - `tasks:user_<source>` → `tasks:user_<target>`;
  - `notifs:<source>` → `notifs:<target>`;
  - `messages:ai_<source>` → `messages:ai_<target>`;
  - `chats:user_<source>` → `chats:user_<target>`.
- Added `POST /auth/link-vk`:
  - requires active `x-token`;
  - verifies signed VK launch params;
  - links VK ID to current user;
  - copies old VK buckets into the current user bucket without deleting source data.
- Improved `POST /auth/link-telegram`:
  - verifies Telegram `initData`;
  - links Telegram ID to current user;
  - copies old Telegram/raw Telegram buckets into the current user bucket.
- Improved `/auth/vk`:
  - checks existing `vk:<id>` mapping first;
  - if VK is linked to an email user, VK auto-login returns that email user.
- Added `GET /auth/identities` for a protected linked-identity read path.

Production Worker deployed:

- version `233ba462-ffb4-467d-8a9e-f04b01df9f41`.

### VK frontend

Files:

- `4e-app/vk.html`;
- `.tmp-4e-app-publish/vk.html`.

Changes:

- Added `linkCurrentVK()` after successful email login/register in VK Mini App.
- If legacy VK tasks are merged, frontend reloads tasks and shows a small toast.
- `loadTasks()` now accepts both legacy array response and `{ tasks: [...] }`.

Frontend pushed:

- commit `16e4ef3` — `fix: link VK identity after email auth`;
- full commit `16e4ef34bab16f7635348b268f54463ab5d392c4`.

## Verification

Local:

- `node --check 4e-worker/worker.js`;
- JS syntax check for both `4e-app/vk.html` and `.tmp-4e-app-publish/vk.html`;
- `node scripts/verify-legacy-identity-linking.mjs`.

Verified scenario:

1. create VK-only account through signed `/auth/vk`;
2. save a task under that VK account;
3. register email account;
4. call `/auth/link-vk` with email token and signed VK launch params;
5. email `/tasks` contains the old VK task;
6. next `/auth/vk` returns the email user.

Production smoke:

- `OPTIONS /auth/link-vk` from `https://m.vk.ru` returns `204` with CORS headers;
- unauthenticated `GET /auth/identities` returns `401` JSON with CORS headers;
- GitHub Pages `vk.html` contains both `linkCurrentVK` and `Array.isArray(data) ? data`.

## Remaining work

- Add a visible profile screen for connected accounts.
- Add explicit unlink/relink UX.
- Move this bridge from legacy KV into D1 `auth_identities` after production D1 cutover.
- Add manual Telegram link flow for users who are not inside Telegram WebApp.
