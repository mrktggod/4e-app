# CODEX-051 — VK mobile auth timeout retry

Done: published a targeted `vk.html` hotfix for mobile VK WebView email auth timeouts.

## Context

- User reported that mobile VK app login shows: “Сервер отвечает дольше обычного…”.
- Web/desktop entry points were reported as working.
- Previous frontend publish (`CODEX-050`) updated `index.html`; `vk.html` was unchanged at that time.

## Diagnosis

- The exact timeout text is emitted by `4e-app/vk.html` around legacy `/auth/login` and `/auth/register`.
- Production Worker auth endpoints were healthy in smoke checks:
  - synthetic `/auth/register` + `/auth/login` + `/auth/me` completed successfully;
  - observed synthetic timings were sub-second after cleanup;
  - CORS preflight for VK/GitHub origins was allowed.
- Conclusion: this was most likely a mobile VK WebView first-request/network/cache issue, not a backend outage.

## Changes

- Added a small auth fetch layer in `4e-app/vk.html`:
  - `AUTH_FIRST_ATTEMPT_TIMEOUT_MS = 12000`;
  - one hidden retry for email login up to `AUTH_TIMEOUT_MS = 30000`;
  - `cache: 'no-store'`;
  - `credentials: 'omit'`.
- Email login now uses:
  - `postLegacyAuth('/auth/login', ..., 1)`.
- Email registration avoids duplicate `/auth/register` retries:
  - first registration still runs once;
  - if the registration response times out, the client tries to recover by logging in with the same email/password.
- Added verifier:
  - `scripts/verify-vk-auth-retry-html.mjs`.
- Published to GitHub Pages repo:
  - repo: `mrktggod/4e-app`;
  - branch: `main`;
  - commit: `d38d0bd`;
  - message: `fix: retry VK auth requests`.

## Verification

- Local verifier passed:
  - `node scripts/verify-vk-auth-retry-html.mjs`.
- Publish clone verifier passed:
  - `node scripts/verify-vk-auth-retry-html.mjs .tmp-4e-app-publish/vk.html`.
- Privacy regressions passed:
  - `node scripts/verify-privacy-center-html.mjs`;
  - `node scripts/verify-v2-privacy.mjs`;
  - `node scripts/smoke-worker-v2-privacy-entrypoint.mjs`.
- Publish clone git check passed:
  - `git -c safe.directory=C:/Users/shelc/Documents/4/.tmp-4e-app-publish diff --check`.
- GitHub raw readback confirmed markers:
  - `fetchAuthWithRetry`;
  - `cache: 'no-store'`;
  - `postLegacyAuth('/auth/login'`;
  - `postLegacyAuth('/auth/register'`.
- GitHub Pages live readback confirmed the same markers at:
  - `https://mrktggod.github.io/4e-app/vk.html?v=d38d0bd-2`.

## Issues and fixes

- GitHub Pages initially served the old `vk.html` while raw GitHub already had the new commit.
  - Fix: polled live Pages with a cache-busting query until the new markers appeared.

## Limits

- This is a targeted mobile WebView resilience hotfix.
- It does not replace real device QA.
- Manual smoke is still required inside the VK mobile app.

## Manual smoke for user

1. Fully close the VK mobile app.
2. Open `https://vk.ru/app54636698`.
3. Try email login with one tap only.
4. If the old timeout appears once, close/reopen VK again to flush WebView cache and retry.
5. If it still repeats, capture the exact time and whether the second tap still logs in.

## Next

- If manual smoke passes, continue Gate 5/Gate 6 roadmap work.
- If manual smoke still fails, add a temporary visible auth diagnostics panel for VK WebView network timing.
