# CODEX-039 — VK frontend D1 auth bridge handshake

## Context

CODEX-038 added a staging-ready backend bridge:

- `POST /v2/auth/legacy-session`
- input: server-validated legacy `x-token` session
- output: D1 Bearer token for v2 auth routes

The VK frontend still uses legacy production auth. This step connects the
frontend to the bridge without breaking the current production path.

## Scope

- Keep legacy `x-token` for current production tasks/chat/auth routes.
- Add a separate runtime-only D1 Bearer token.
- Prefer v2 identity link when D1 token is available.
- Fall back to legacy `/auth/link-vk` when v2 is unavailable.
- Do not change production Worker or D1 bindings.

## Changes

- Added `state.d1Token` in `vk.html`.
- Added `syncD1AuthSession()`:
  - calls `/v2/auth/legacy-session` with current legacy `x-token`;
  - stores returned Bearer token only in runtime state;
  - updates identities from D1 response when present;
  - silently ignores unavailable v2 path so production UX stays stable.
- Updated `linkChallengeHeaders()`:
  - `Authorization: Bearer <state.d1Token>` for v2;
  - legacy `x-token` remains separate.
- Updated `linkCurrentVK()`:
  - tries `/v2/auth/link-vk` first when D1 Bearer token is available;
  - shows existing challenge panel on `requiresChallenge`;
  - falls back to legacy `/auth/link-vk` on `401/404/503`.
- Updated challenge complete/merge buttons to request D1 token before calling
  v2 challenge endpoints.
- Logout clears both legacy and D1 runtime auth state.

## Verification

- Inline JS syntax check passed for `4e-app/vk.html`.
- Inline JS syntax check passed for `.tmp-4e-app-publish/vk.html`.
- Local and publish copies have no content diff.
- `docs/MIMO_ACTIVITY.jsonl` parses as JSONL.
- Local publish-clone commit created:
  - `fcd2b79` — `feat: add VK D1 auth bridge handshake`.
- Publish push completed from escalated Windows environment:
  - `bb9bdce..fcd2b79 main -> main`.
- GitHub connector readback confirmed `vk.html` on `main` contains:
  - `state.d1Token`;
  - `syncD1AuthSession()`;
  - `/v2/auth/legacy-session`;
  - `/v2/auth/link-vk`.

## Limits

- Production Worker was not deployed.
- Production D1 binding still does not exist.
- Published production frontend will use legacy fallback until production D1
  cutover or staging frontend config is introduced.
- First sandbox `git push origin main` failed with local Windows/Git credentials
  error `SEC_E_NO_CREDENTIALS`; escalated push succeeded.
- Direct `github.io` cache/readback was not separately confirmed in this step.
- Full mobile VK smoke was not run in this step.

## Next

- Prepare production D1 binding/cutover checklist.
- After production D1 gate, smoke:
  1. legacy login;
  2. D1 token exchange;
  3. `/v2/auth/link-vk`;
  4. challenge complete;
  5. merge confirmation.
