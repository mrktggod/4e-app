# CODEX-050 — frontend privacy center publish

Done: the frontend privacy center was published to GitHub Pages and live HTML markers were verified.

## Context

- CODEX-049 closed the production privacy gate:
  - production D1 migration `0006_privacy_controls.sql` applied;
  - production Worker serves `/v2/privacy`;
  - production synthetic smoke passed with cleanup.
- The next safe step was publishing the local `4e-app/index.html` privacy center to the GitHub Pages repository.

## Changes

- Synchronized `4e-app/index.html` into publish clone:
  - `.tmp-4e-app-publish/index.html`.
- Published commit:
  - repo: `mrktggod/4e-app`;
  - branch: `main`;
  - commit: `1bdcb76`;
  - message: `feat: publish privacy center`.
- No changes were needed for `vk.html`; local and publish hashes already matched.
- `scripts/verify-privacy-center-html.mjs` now accepts an optional HTML path argument, so the same verifier can check both local app and publish clone.

## Verification

- Local app verifier:
  - `node scripts/verify-privacy-center-html.mjs` passed.
- Publish clone verifier:
  - `node scripts/verify-privacy-center-html.mjs .tmp-4e-app-publish/index.html` passed.
- Backend regressions before publish:
  - `node scripts/verify-v2-privacy.mjs` passed;
  - `node scripts/smoke-worker-v2-privacy-entrypoint.mjs` passed;
  - `node scripts/verify-v2-auth.mjs` passed.
- GitHub raw readback:
  - `privacy-center` marker present;
  - `syncD1AuthSession` marker present;
  - `/v2/privacy/settings` marker present.
- GitHub Pages live readback:
  - URL: `https://mrktggod.github.io/4e-app/?v=1bdcb76-1`;
  - `privacy-center` marker present;
  - `syncD1AuthSession` marker present;
  - `/v2/privacy/settings` marker present.

## Issues and fixes

- Git from the sandbox saw `.tmp-4e-app-publish` as dubious ownership.
  - Fix: used one-shot `git -c safe.directory=C:/Users/shelc/Documents/4/.tmp-4e-app-publish ...` without changing global git config.
- GitHub Pages initially served the old HTML while raw GitHub was already updated.
  - Fix: polled the live Pages URL with a cache-busting query until markers appeared.

## Limits

- This step verifies HTML publication and static markers.
- Manual user-flow QA inside real Web/VK webview is still needed:
  - open app;
  - login;
  - open profile -> “Данные и память”;
  - load/save privacy settings;
  - create consent/request actions.

## Next

- Run manual Web/VK smoke of the privacy center UI.
- Then continue Gate 5/Gate 6: AI memory UX, retention/export-delete processing, and redesign preparation.
