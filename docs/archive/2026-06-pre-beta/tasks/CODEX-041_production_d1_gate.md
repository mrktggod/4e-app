# CODEX-041 — Production D1 gate

## Context

The user explicitly approved creating/connecting production D1. Before this
gate, production Worker had only KV; D1/v2 auth bridge was ready in code and
frontend had a legacy fallback.

## Changes

- Created production D1 database:
  - name: `4e-production`
  - id: `6107948c-6c67-4c37-baa1-efea6c5c2860`
  - region: `WEUR`
- Added production D1 binding to `4e-worker/wrangler.toml`:
  - `binding = "DB"`
  - `database_name = "4e-production"`
  - `database_id = "6107948c-6c67-4c37-baa1-efea6c5c2860"`
  - `migrations_dir = "migrations"`
- Applied migrations `0001` through `0005` to remote production D1.
- Deployed production Worker with KV + D1 bindings:
  - Worker: `restless-lab-d737`
  - URL: `https://restless-lab-d737.shelckograff.workers.dev`
  - version: `fc2df9b0-2f19-4bc3-8bb3-e3f05d9a25d6`
- Added controlled smoke script:
  - `scripts/smoke-production-legacy-d1-bridge.ps1`

## Verification

- `wrangler d1 list` initially showed only `4e-staging`.
- Migrations applied successfully to `4e-production`.
- Remote read-only D1 checks:
  - `tables = 23`
  - `PRAGMA foreign_key_check` returned no rows
- `node scripts/check-production-d1-cutover-readiness.js`:
  - `ok: true`
  - blockers: `0`
  - warnings: `1`
- Remaining warning:
  - production `ENABLE_D1_PROVIDER_SYNC` is not enabled. This is intentional.
- Wrangler production dry-run showed:
  - `env.KV`
  - `env.DB (4e-production)`
- Production no-write smoke:
  - `/v2/auth/legacy-session` without token returns `401`
  - invalid Bearer `/v2/auth/me` is rejected
  - D1 users count was `0`
- Controlled write+cleanup smoke:
  - synthetic legacy KV user/session created
  - `/v2/auth/legacy-session` returned `200 OK`
  - D1 Bearer token and web identity were created
  - cleanup removed synthetic D1/KV rows
- Final cleanup verification:
  - `smokeUsers = 0`
  - `totalUsers = 0`

## Issues and fixes

- First `d1 create` failed with transient Wrangler `fetch failed`.
  - Verified no duplicate through `d1 list`.
  - Retried successfully.
- First production dry-run was run from the wrong working directory.
  - Re-ran from `4e-worker`.
- Initial smoke script wrote malformed JSON through CLI argument quoting.
  - Switched KV writes to `--path`.
- Next smoke still failed because Windows PowerShell wrote UTF-8 BOM.
  - Switched temp JSON writes to `.NET UTF8Encoding(false)`.
- One successful smoke was treated as failed because `curl` returned a string
  array.
  - Joined response lines before regex checks.

## Limits

- Production D1 is empty; legacy KV data has not been migrated.
- Production provider sync flag remains disabled.
- Real VK mobile user smoke was not run in this step.

## Next

- Add defensive parsing around legacy `getSession()` so malformed KV sessions
  cannot crash the Worker with `1101`.
- Run manual VK mobile login check after GitHub Pages cache refresh.
- Continue with opt-in KV→D1 user/task migration plan.
