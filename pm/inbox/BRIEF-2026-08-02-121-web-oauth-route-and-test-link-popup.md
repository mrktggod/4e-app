status: NEW

# BRIEF-2026-08-02-121-web-oauth-route-and-test-link-popup

## Context

Manual QA 2026-08-02:

- Web login through Yandex works and opens a new web account.
- Web login through VK shows "Ошибка загрузки".
- Web login through Telegram redirects the already-authorized user into bot / Telegram Mini App, but Alexey expected web authorization to keep working in the web version.
- A test/manual link insertion popup is visible again and should be removed from the user-facing interface.

## Task

Diagnose web OAuth routing for VK, Yandex and Telegram. Fix only the safe frontend route/popup part if the cause is clearly in app code.

Telegram web auth must authenticate the web session and keep the user in web/PWA when the flow starts from web/PWA. It must not force a transition into Telegram Mini App.

Remove the user-facing manual link insertion popup if it is test-only frontend UI.

If the fix requires worker auth logic, live OAuth credentials, bot changes, account linking policy, or security-sensitive auth behavior, stop with `NEED-CLAUDE` and write the scope report instead of changing runtime auth logic.

## Surface

- Web/PWA auth only.
- Do not change Telegram Mini App auth behavior unless the report proves it is the same bug and safe.

## Stop Points

- No production deploy.
- No merge into `main`.
- No CAL tasks.
- No price changes.
- No payment or entitlement refactors.
- No secret rotation, secret removal, or secret disclosure.

## Verification

- Focused local/source test for hiding/removing the test popup.
- Focused auth route smoke if available.
- `node scripts/check-cp1251-mojibake.mjs`
- `git diff --check`
- `npm run check:portable-paths`
- Honest live OAuth tail if credentials/real browser flow cannot be automated.

## Report

Write `pm/outbox/REPORT-BRIEF-2026-08-02-121-web-oauth-route-and-test-link-popup.md` with root cause, changed files or NEED-CLAUDE scope, raw proof, and honest tails.
