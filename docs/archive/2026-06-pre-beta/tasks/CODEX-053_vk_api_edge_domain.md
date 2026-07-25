# CODEX-053 — VK API edge domain

Done: created and verified a custom Worker domain for VK mobile WebView and switched `vk.html` to it.

## Context

- User sent a real-device screenshot after `CODEX-052`.
- Diagnostics line showed:
  - origin: `https://mrktggod.github.io`;
  - `ping:timeout/5002ms`;
  - `auth:timeout/7002ms`.
- This means the mobile VK WebView could not reach the Worker at `*.workers.dev` at all, even for a simple GET.

## Diagnosis

- This was not an email/password issue.
- This was not a legacy auth JSON/CORS-preflight issue anymore.
- Production Worker remained healthy from desktop/network checks.
- `api.4-ai.site` already existed but was not the same Worker:
  - `/` returned `4 API v2`;
  - `/v2/privacy/settings` returned `200` with `4 API v2` instead of the expected unauthenticated `401`.
- Therefore `api.4-ai.site` was not safe to reuse for this app.

## Changes

- Added a new Worker custom domain:
  - `edge.4-ai.site`.
- Updated `4e-worker/wrangler.toml`:
  - `workers_dev = true`;
  - `routes = [{ pattern = "edge.4-ai.site", custom_domain = true }]`.
- Deployed production Worker twice:
  - first deploy created `edge.4-ai.site` but Wrangler disabled `workers.dev` by default;
  - second deploy added `workers_dev = true`, keeping both old and new Worker URLs active.
- Updated `4e-worker/worker.js` CORS allowlist with:
  - `https://4-ai.site`;
  - `https://www.4-ai.site`;
  - `https://4-ai.pages.dev`;
  - `https://edge.4-ai.site`.
- Updated `4e-app/vk.html`:
  - `WORKER = 'https://edge.4-ai.site'`;
  - `AUTH_BUILD = 'vk-auth-edge-domain-20260620-4'`.
  - edge-domain auth timeouts tuned for first cold DNS/TLS connection:
    - first attempt `10000ms`;
    - retry `25000ms`;
    - diagnostics `15000ms`.
- Updated verifier:
  - `scripts/verify-vk-auth-retry-html.mjs`.
- Published frontend to GitHub Pages:
  - repo: `mrktggod/4e-app`;
  - branch: `main`;
  - commits:
    - `c8acb96` — `fix: use edge domain for VK API`;
    - `3d61b57` — `fix: tune VK edge auth timeout`.

## Verification

- `edge.4-ai.site` was free before deploy:
  - DNS did not exist.
- Worker deploys:
  - `030e50a4-6300-47ff-8890-be28e43019a5` created custom domain;
  - `8f21fb79-8645-4c73-bc4d-d0867c7da315` restored `workers_dev = true` and kept `edge.4-ai.site`.
- Live endpoint checks passed:
  - `https://edge.4-ai.site/` → `200 OK`;
  - `https://edge.4-ai.site/v2/privacy/settings` without token → `401`;
  - `https://edge.4-ai.site/auth/login` with synthetic invalid email → fast `400`;
  - old `https://restless-lab-d737.shelckograff.workers.dev/` still → `200 OK`.
- Local verification passed:
  - `node --check 4e-worker/worker.js`;
  - `node scripts/verify-vk-auth-retry-html.mjs`;
  - `node scripts/verify-privacy-center-html.mjs`;
  - `node scripts/verify-v2-privacy.mjs`;
  - `node scripts/smoke-worker-v2-privacy-entrypoint.mjs`.
- Publish clone verification passed:
  - `node scripts/verify-vk-auth-retry-html.mjs .tmp-4e-app-publish/vk.html`;
  - `git -c safe.directory=C:/Users/shelc/Documents/4/.tmp-4e-app-publish diff --check`.
- GitHub raw readback confirmed:
  - `const WORKER = 'https://edge.4-ai.site'`;
  - `vk-auth-edge-domain-20260620-4`;
  - `AUTH_DIAG_TIMEOUT_MS = 15000`;
  - old `workers.dev` constant absent.
- GitHub Pages live readback confirmed the same markers:
  - `https://mrktggod.github.io/4e-app/vk.html?v=3d61b57-1`.

## Issues and fixes

- Wrangler disables `workers.dev` by default when routes are configured and `workers_dev` is omitted.
  - Fix: explicitly added `workers_dev = true` and redeployed.
- Existing `api.4-ai.site` looked tempting but was a different API.
  - Fix: did not touch it; created `edge.4-ai.site` instead.

## Manual smoke for user

1. Fully close the VK mobile app.
2. Open `https://vk.ru/app54636698`.
3. Confirm auth diagnostics show:
   - `vk-auth-edge-domain-20260620-4`.
4. Tap “Проверить связь”.
5. Expected:
   - `ping:200/...`;
   - `auth:400/...` or another fast non-timeout status.
6. Try email login.

## Next

- If VK mobile can reach `edge.4-ai.site`, continue roadmap.
- If `edge.4-ai.site` still times out in VK mobile, the next step is moving the frontend itself from GitHub Pages to Cloudflare Pages/custom domain or adding a same-origin `/api/*` Worker route.
