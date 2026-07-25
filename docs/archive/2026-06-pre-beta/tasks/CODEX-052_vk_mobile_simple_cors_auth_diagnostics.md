# CODEX-052 — VK mobile simple-CORS auth diagnostics

Done: published a second VK mobile auth hotfix after the first retry-only fix did not solve real-device login.

## Context

- User tested `CODEX-051` on a real phone several times.
- Result: mobile VK app still did not log in.
- The button changed to “Входим…”, so the app JavaScript was running, but auth still ended in the long-server-response message.

## Updated diagnosis

- Production Worker stayed healthy:
  - VK-like CORS preflight origins returned allowed `Access-Control-Allow-Origin`;
  - synthetic `POST /auth/login` with unique email returned quickly;
  - `text/plain` JSON body was accepted by Worker because legacy auth uses `request.json()` through `readJsonObject(request)`.
- The new likely failure mode is mobile VK WebView hanging on CORS preflight or on cross-origin `application/json` POST to `workers.dev`.

## Changes

- `4e-app/vk.html` now uses a simple CORS request for legacy email auth:
  - `Content-Type: text/plain`;
  - JSON body remains unchanged;
  - Worker still parses it via `request.json()`.
- Auth timeout budget was reduced because backend latency is not the problem:
  - first attempt `6000ms`;
  - retry attempt `12000ms`;
  - retry delay `600ms`.
- Added visible auth diagnostics:
  - build marker `vk-auth-simple-cors-20260620-2`;
  - auth form block `#authDiagnostics`;
  - button “Проверить связь”;
  - timeout diagnostics for `ping` and simple-CORS `auth`.
- Updated `scripts/verify-vk-auth-retry-html.mjs` to enforce:
  - simple-CORS `text/plain`;
  - visible diagnostics;
  - login/register timeout diagnostics.
- Published to GitHub Pages repo:
  - repo: `mrktggod/4e-app`;
  - branch: `main`;
  - commit: `0be7711`;
  - message: `fix: use simple CORS for VK auth`.

## Verification

- Local verifier passed:
  - `node scripts/verify-vk-auth-retry-html.mjs`.
- Publish clone verifier passed:
  - `node scripts/verify-vk-auth-retry-html.mjs .tmp-4e-app-publish/vk.html`.
- Privacy center regression passed:
  - `node scripts/verify-privacy-center-html.mjs`.
- Live Worker accepted simple-CORS body:
  - unique synthetic email with `Content-Type: text/plain` returned fast `400`, not timeout.
- Publish clone diff check passed:
  - `git -c safe.directory=C:/Users/shelc/Documents/4/.tmp-4e-app-publish diff --check`.
- GitHub raw readback confirmed markers:
  - `vk-auth-simple-cors-20260620-2`;
  - `'Content-Type': 'text/plain'`;
  - `authDiagnostics`;
  - `fetchAuthWithRetry`.
- GitHub Pages live readback confirmed markers at:
  - `https://mrktggod.github.io/4e-app/vk.html?v=0be7711-1`.

## Issues and fixes

- `CODEX-051` was insufficient: retrying the same `application/json` cross-origin request did not help real mobile VK WebView.
- New fix avoids preflight for legacy email auth instead of only retrying it.
- GitHub Pages again briefly served the old file; live URL was polled with cache busting until markers appeared.

## Manual smoke for user

1. Fully close the VK app.
2. Reopen `https://vk.ru/app54636698`.
3. Confirm the login form shows:
   - `Связь: vk-auth-simple-cors-20260620-2`.
4. Try email login once.
5. If login still fails, tap “Проверить связь” and send the whole diagnostics line.

## Next

- If simple-CORS auth works, continue the roadmap.
- If diagnostics shows `ping:timeout`, the mobile VK WebView likely cannot reach `workers.dev`; next fix should move API behind a custom domain or same-origin hosting.
- If diagnostics shows `ping:200` and `auth:timeout`, investigate mobile POST/fetch behavior further.
