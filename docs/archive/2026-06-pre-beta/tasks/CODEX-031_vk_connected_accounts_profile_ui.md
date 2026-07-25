# CODEX-031 — VK connected accounts profile UI

Date: 2026-06-20

## Context

After CODEX-030, the Worker had a protected linked-identity read endpoint and a signed VK link endpoint:

- `GET /auth/identities`;
- `POST /auth/link-vk`.

The next Gate 2 product step was to make this visible to the user before the full redesign and before D1 production cutover.

## Design brief

- Product: VK Mini App profile screen.
- Purpose: show whether Email, VK and Telegram identities are connected to the same account.
- Visual source: current `4e-app/vk.html` styles and card patterns.
- Interactivity: functional status loading and VK relink/refresh; no unlink/relink management yet.

## Changes

Files:

- `4e-app/vk.html`;
- `.tmp-4e-app-publish/vk.html`.

Added:

- profile card “Подключённые аккаунты”;
- identity rows for Email, VK and Telegram;
- connected/not connected badges;
- loading/error states for identity status;
- `loadIdentities()` client call to `GET /auth/identities`;
- `refreshVKIdentity()` button that calls the existing signed VK link flow;
- automatic identity refresh after `linkCurrentVK()`.

## Verification

- JS syntax check passed for local `4e-app/vk.html`.
- JS syntax check passed for publish clone `.tmp-4e-app-publish/vk.html`.
- Marker check confirmed:
  - `Подключённые аккаунты`;
  - `identityList`;
  - `refreshVKIdentity`;
  - `loadIdentities`.

## Remaining work

- Add explicit Telegram link instructions/flow outside Telegram WebApp.
- Add unlink/relink UX after policy decisions.
- Move connected accounts screen into the future component-based redesign.
