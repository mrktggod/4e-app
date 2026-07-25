# CODEX-049 — production privacy gate

Done: migration `0006_privacy_controls.sql` and live `/v2/privacy` routes were verified on production with synthetic-only data and cleanup.

## Context

- CODEX-048 closed the staging privacy gate.
- The frontend privacy center should not be published until production Worker and production D1 can serve `/v2/privacy`.
- Production D1 was empty before this step, and the only pending migration was `0006_privacy_controls.sql`.

## Preflight

- Local checks passed:
  - `node scripts/verify-d1-schema.js`;
  - `node scripts/verify-v2-privacy.mjs`;
  - PowerShell syntax checks for staging/production privacy smoke scripts.
- Production Worker dry-run saw:
  - `env.KV`;
  - `env.DB (4e-production)`.
- Production D1 read-only preflight:
  - pending migration: `0006_privacy_controls.sql` only;
  - users `0`;
  - sessions `0`;
  - tasks `0`;
  - identities `0`;
  - `PRAGMA foreign_key_check` returned no rows.

## Changes

- Applied remote production D1 migration:
  - database: `4e-production`;
  - migration: `0006_privacy_controls.sql`;
  - apply result: success, `9` commands executed.
- Deployed production Worker:
  - Worker: `restless-lab-d737`;
  - URL: `https://restless-lab-d737.shelckograff.workers.dev`;
  - version: `83a5df15-41cc-4edb-b8f9-0d455ac09236`.
- Added reusable production smoke wrapper:
  - `scripts/smoke-production-v2-privacy.ps1`.
- Made staging smoke parameterizable so staging and production use the same core flow:
  - `scripts/smoke-staging-v2-privacy.ps1`.

## Verification

- Live production smoke passed:
  - unauthenticated `/v2/privacy/settings` returned `401`;
  - authenticated settings defaults returned `200`;
  - settings update returned `200`;
  - consent grant returned `201`;
  - data subject request returned `201`;
  - synthetic rows before cleanup: users `1`, sessions `1`, settings `1`, consents `1`, dataRequests `1`;
  - synthetic rows after cleanup: all `0`.
- Final production checks:
  - no pending migrations;
  - users `0`, sessions `0`, settings `0`, consents `0`, dataRequests `0`;
  - `PRAGMA foreign_key_check` returned no rows.

## Limits

- GitHub Pages frontend was not published in this step.
- Retention processing/export/delete background workers are still future tasks.
- This is an engineering privacy-control gate, not legal text approval.

## Next

- Publish the frontend privacy center to GitHub Pages.
- Smoke test the “Данные и память” screen in web and VK webview.
- Then continue Gate 5/Gate 6 with AI memory UX and redesign work.
