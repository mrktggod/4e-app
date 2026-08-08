# REPORT-BRIEF-2026-08-02-121-web-oauth-route-and-test-link-popup

status: NEED-CLAUDE
lessons_read: 1

## Scope Decision

This brief is auth-sensitive and should be reviewed by Claude/Yuri before runtime changes.

## Findings

- Web VK/Yandex OAuth is wired through `index.html:326` and `index.html:7685`, which bind buttons to `window.startOAuthLogin(...)` from the platform adapter. The actual provider redirect/callback behavior depends on OAuth state and worker `/auth/*` endpoints.
- Telegram web auth is in `scripts/auth-handlers.js:528`. For a `startToken`, it posts to `WORKER + '/auth/telegram'`, stores the returned token, clears pending state, cleans the auth URL, and keeps the app on `showScreen('home')`.
- The visible manual command panel is created in `scripts/auth-handlers.js:462` and shown in `scripts/auth-handlers.js:513` / `scripts/auth-handlers.js:530` / `scripts/auth-handlers.js:594`. It is not obviously test-only; it is part of the Telegram bot start-token fallback.

## Why Not DONE

- Removing the panel could break the fallback path where Telegram opens the bot chat but does not send `/start auth_<token>` automatically.
- Fixing VK "Ошибка загрузки" or Telegram web-vs-TMA routing may require live OAuth credentials, worker auth behavior, bot return URL policy, or account-linking decisions.
- The brief explicitly says to stop with `NEED-CLAUDE` if the fix requires worker auth logic, live OAuth credentials, bot changes, account linking policy, or security-sensitive auth behavior.

## Proposed Next Step

- Claude should review whether the manual panel should be hidden only for Web/PWA, replaced with a non-popup inline state, or retained as a fallback.
- Claude should inspect `startOAuthLogin`, `processOAuthCallback`, worker `/auth/telegram`, `/auth/vk`, and provider redirect URL handling together, with live OAuth credentials available.

## Verification

- Source inspection only; no runtime auth changes made.
- `node scripts/check-cp1251-mojibake.mjs` - PASS before this report.
- `npm run check:portable-paths` - PASS before this report.
- `git diff --check` - PASS before this report.

## Commit

- App commit: a8f476cd58e54c9a6f5813ab3655845760ac3057

## Honest Tails

- No live OAuth flow was executed.
- No production deploy, no merge into `main`, no CAL, no prices, no secrets, no payment or entitlement changes.
- Pre-existing unrelated local modifications were left untouched.
