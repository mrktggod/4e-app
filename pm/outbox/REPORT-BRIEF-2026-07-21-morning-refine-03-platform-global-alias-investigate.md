# REPORT-BRIEF-2026-07-21-morning-refine-03-platform-global-alias-investigate

## Outcome

DONE after Claude/Cowork review.

The original stop point was valid: exporting `PLATFORM` activates multiple previously-fallback auth paths. Alexey passed Claude's source review on 2026-07-25. The review approved both client changes:

- `window.PLATFORM=PLATFORM` and `window.WORKER=WORKER` in `index.html`;
- removing `authHeaders()` from the OAuth start `GET` in `scripts/auth.js`.

No Worker auth, merge, entitlement, payment, secret, production deploy or `main` merge was changed.

## Root Cause

`scripts/auth.js` is loaded from `<head>`, while `const PLATFORM` and `const WORKER` were lexical constants in the later inline app script. Lexical `const` values are not exported as `window` properties. Therefore external auth scripts could not see `window.PLATFORM` / `window.WORKER`.

Impact:

- VK ID / Yandex OAuth start could fail before the Worker request because `window.WORKER` was undefined.
- `window.PLATFORM` helpers in auth code stayed on fallback paths instead of using `FourPlatform`.

## Changed Files

- `index.html`
- `scripts/auth.js`

## Verification

Passed:

- index encoding marker check: `Войти|Задачи|Сегодня` = 111 matches before commit checks.
- `npm run qa:prebeta`: passed.
- Playwright: 20/20 passed.
- Smokes inside prebeta: `home001`, `back050`, `back055`, `privacy-surface`, `viral-share` passed.
- Local auth smoke against staging Worker: register, login and wrong-password UI paths passed; wrong password inline error was visible.
- Local OAuth-start smoke:
  - `window.PLATFORM === window.FourPlatform`;
  - `window.WORKER` points to staging Worker on local/staging host;
  - PKCE verifier/challenge generated;
  - `/auth/vk-id/start` returned `200` with `authUrl`;
  - `/auth/yandex-id/start` returned `200` with `authUrl`;
  - no browser console errors.

## Remaining Manual Gate

`BACK-045` is still not `Done`: the start URL is green, but real provider callback/login requires a live browser OAuth flow with VK/Yandex accounts after deploy.
