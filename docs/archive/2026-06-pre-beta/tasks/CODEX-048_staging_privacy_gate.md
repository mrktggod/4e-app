# CODEX-048 — staging privacy gate

Done: migration `0006_privacy_controls.sql` and live `/v2/privacy` routes were verified on staging with synthetic-only data and cleanup.

## Context

- CODEX-045 added D1 privacy tables/repository.
- CODEX-046 added `/v2/privacy` Worker routes.
- CODEX-047 added the frontend privacy center locally.
- Before publishing the frontend or touching production, staging needed a real D1/Worker gate.

## Changes

- Applied remote staging D1 migration:
  - database: `4e-staging`;
  - pending migration before apply: `0006_privacy_controls.sql`;
  - apply result: success, `9` commands executed.
- Deployed staging Worker:
  - Worker: `restless-lab-d737-staging`;
  - URL: `https://restless-lab-d737-staging.shelckograff.workers.dev`;
  - version: `1a89a880-069d-4d74-835b-94831831ac33`.
- Added reproducible controlled smoke script:
  - `scripts/smoke-staging-v2-privacy.ps1`.

## Verification

- Local preflight passed:
  - `node scripts/verify-d1-schema.js`;
  - `node scripts/verify-v2-privacy.mjs`;
  - `node scripts/smoke-worker-v2-privacy-entrypoint.mjs`;
  - `node scripts/verify-privacy-center-html.mjs`.
- Wrangler staging dry-run saw:
  - `env.KV`;
  - `env.DB (4e-staging)`;
  - `env.ENABLE_D1_PROVIDER_SYNC`.
- Live staging smoke passed:
  - unauthenticated `/v2/privacy/settings` returned `401`;
  - authenticated settings defaults returned `200`;
  - settings update returned `200`;
  - consent grant returned `201`;
  - data subject request returned `201`;
  - synthetic rows before cleanup: users `1`, sessions `1`, settings `1`, consents `1`, dataRequests `1`;
  - synthetic rows after cleanup: all `0`.

## Limits

- Production D1 was not migrated.
- Production Worker was not deployed.
- GitHub Pages frontend was not published.
- The privacy screen can now be safely published only after the production privacy gate or behind an environment-aware frontend URL decision.

## Next

- Prepare production privacy gate: fresh production dry-run, migration list, explicit apply of `0006`, production Worker deploy, controlled production smoke with synthetic D1 session and cleanup.
- After production gate passes, publish the frontend privacy center and test it in web/VK webview.
