status: NEW

# BRIEF-2026-08-02-124-vk-auth-session-persistence

## Context

Manual QA 2026-08-02:

- In VK web app, there is no clear VK authorization path.
- Login through email works, but the app does not remember previous authorization and asks to enter credentials again.

## Task

Diagnose VK auth/session persistence in `vk.html` and related frontend code. Fix only if the issue is clearly local frontend token/session handling and does not change auth security rules.

If the cause touches worker auth, account linking, VK credentials, token validation policy, or security-sensitive behavior, stop with `NEED-CLAUDE` and write the scope report.

## Surface

- VK Mini App / `vk.html`.
- Do not change web/PWA or Telegram auth unless proven shared.

## Stop Points

- No production deploy.
- No merge into `main`.
- No CAL tasks.
- No payment or entitlement refactors.
- No secret rotation, secret removal, or secret disclosure.

## Verification

- `npm run smoke:vk-auth-session`
- `npm run test:e2e:vk`
- `node scripts/check-cp1251-mojibake.mjs`
- `git diff --check`
- `npm run check:portable-paths`

## Report

Write `pm/outbox/REPORT-BRIEF-2026-08-02-124-vk-auth-session-persistence.md` with root cause, changed files or NEED-CLAUDE scope, raw proof, and honest tails.
