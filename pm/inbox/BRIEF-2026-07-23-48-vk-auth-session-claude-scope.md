status: NEED-CLAUDE

# BRIEF-2026-07-23-48 - VK-AUTH-SESSION-001 Claude scope

## Goal

Do not let VK beta lose valid saved sessions on transient network failure, but keep this as gray-zone work until Claude/Yuri review approves the exact auth scope.

## Context

`pm/vk-parity-plan-2026-07-23.md` marks VK saved web-session as `BROKEN web-VK`: `vk4_token` bootstrap gives `auth/me` 2.5 seconds and deletes token after any exception, not only confirmed 401/403.

This is auth-adjacent. Night automation must not silently change the auth contract.

## Task

Do not touch runtime code.

Write `pm/outbox/REPORT-2026-07-23-48-vk-auth-session-claude-scope.md` with:

- exact source locations for current token bootstrap and token removal behavior;
- proposed narrow fix plan: keep token on timeout/5xx/offline, clear only on confirmed 401/403 or explicit logout;
- regression checklist for direct web, VK web iframe, and VK mobile WebView;
- risks and why Claude/Yuri review is required.

## Stop Points

No code changes in this brief. No production deploy, no merge into `main`, no VK Pay, no prices, no payments, no entitlement changes, no secrets, no CAL, no live VK account/device actions.

## Expected Outcome

`NEED-CLAUDE`.
