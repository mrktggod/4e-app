# REPORT-2026-07-23-48 - VK auth session Claude scope

## Outcome

NEED-CLAUDE.

No runtime code was changed. This is auth-adjacent work and needs Claude/Yuri review before implementation.

## Current Source Locations

- `vk.html:570` defines the saved VK session key as `TOKEN_K = 'vk4_token'`.
- `vk.html:947` and `vk.html:954` start `bootstrapAuth()` from DOM ready and fallback paths.
- `vk.html:1000` starts `bootstrapAuth()`.
- `vk.html:1006` reads `localStorage.getItem(TOKEN_K)`.
- `vk.html:1008` calls `fetch(WORKER + '/auth/me', { headers: { 'x-token': savedToken } })` with a 2500 ms timeout.
- `vk.html:1009` parses JSON without first branching on HTTP status.
- `vk.html:1010-1016` restores app state only when `d.ok` is truthy.
- `vk.html:1017` catches all failures silently.
- `vk.html:1018` removes the saved token if it still equals `savedToken`, regardless of timeout, offline, DNS/CORS, 5xx, malformed JSON, or confirmed 401/403.
- `vk.html:1329-1331` explicit logout removes `TOKEN_K`, which should remain allowed.

## Proposed Narrow Fix Plan

1. Keep `vk4_token` on transient failures: timeout, offline, DNS/CORS exception, 429, 5xx, and invalid/empty response.
2. Clear `vk4_token` only on confirmed auth failure: HTTP 401/403 or a reviewed worker response shape that explicitly means invalid token.
3. Preserve explicit logout behavior.
4. Show a recoverable auth state for transient failures instead of silently discarding the saved session.
5. Add a local/static smoke around `bootstrapAuth()` with mocked `/auth/me` outcomes: success, 401, 403, 500, timeout/rejection.

## Regression Checklist

- Direct web `vk.html`: saved token survives simulated timeout/5xx/offline and still restores after the next successful `/auth/me`.
- VK web iframe: signed launch params still trigger VK autologin when no valid saved session exists.
- VK mobile WebView: bridge init/autologin still works and does not block on stale direct-web state.
- Explicit logout always removes `vk4_token`.
- Redacted evidence only: token value in logs/reports must be `<redacted>`.

## Why Review Is Required

This changes session persistence behavior near auth boundaries. A too-broad fix could keep truly invalid tokens, confuse VK autologin, or hide backend auth failures. Claude/Yuri should approve the exact response-shape contract before code changes.

## Checks

Docs/scope-only task.

`node scripts/check-cp1251-mojibake.mjs`

```text
CP1251 mojibake check passed: 0 suspicious tokens
```

`npm run check:portable-paths`

```text
Portable path check passed.
```

`git diff --check`

```text
exit code 0
```
