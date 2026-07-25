# CODEX-037 — VK identity conflict/merge UI layer

Date: 2026-06-20

## Context

CODEX-034, CODEX-035 and CODEX-036 prepared the D1/v2 backend flow:

1. create challenge on identity conflict;
2. complete challenge with signed provider proof;
3. merge after explicit `confirm: true`.

The VK Mini App profile already had a connected-accounts block, but no
user-facing state for this flow.

## Scope

Small frontend slice:

- existing `vk.html` only;
- no full redesign;
- no production Worker changes;
- no unlink/relink policy;
- forward-compatible UI for backend `requiresChallenge` responses.

## Changes

Files:

- `4e-app/vk.html`;
- `.tmp-4e-app-publish/vk.html`.

Added:

- hidden challenge panel inside "Подключённые аккаунты";
- state field `pendingLinkChallenge`;
- challenge URL/header helpers;
- handling for `requiresChallenge` from `/auth/link-vk`;
- `completePendingLinkChallenge()`;
- `mergePendingLinkChallenge()`;
- UI copy for:
  - needs provider confirmation;
  - ready to merge;
  - merge conflict/manual review;
  - post-merge refresh.

## UX behavior

- Normal users see no new panel.
- If backend returns `requiresChallenge`, the profile shows a calm warning card.
- First button confirms VK control with launch params.
- Second button merges only after completed challenge.
- Merge conflicts show a manual-review toast instead of pretending success.

## Important limitation

Current VK production frontend still uses legacy `/auth/*` + `x-token`.
The D1/v2 challenge endpoints are staged and use Bearer auth.

Therefore this UI is intentionally forward-compatible:

- it does not break current production;
- it can use backend-provided `completeUrl` / `mergeUrl` if exposed later;
- otherwise it falls back to `/v2/auth/link-challenges/:id/...`;
- the full live flow still needs production D1/v2 auth bridge or cutover.

## Verification

- JS syntax extracted from `4e-app/vk.html` and parsed successfully.
- JS syntax extracted from `.tmp-4e-app-publish/vk.html` and parsed
  successfully.
- Contract markers verified in both files:
  - `identityChallengePanel`;
  - `completePendingLinkChallenge`;
  - `mergePendingLinkChallenge`;
  - `requiresChallenge`;
  - `target_provider`.
- `git diff --check` passed.
- `git diff --no-index 4e-app/vk.html .tmp-4e-app-publish/vk.html` showed no
  content diff after patch.

## Remaining work

- Bridge production legacy auth to D1/v2 challenge routes, or cut VK frontend
  over to D1/v2 auth.
- Add real Telegram link UI outside Telegram WebApp.
- Add unlink/relink policy and UI.
- Run real mobile VK smoke after publish/cache refresh.
