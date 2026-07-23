# REPORT-2026-07-23-49 - VK AI chat Claude scope

## Outcome

NEED-CLAUDE.

No runtime code was changed. VK AI-chat diagnosis is auth/entitlement-adjacent and must be reviewed before implementation.

## Current Source Locations

- `vk.html:440-441` wires the AI chat input to `sendMessage()`.
- `vk.html:581` keeps `state.chatHistory` in memory.
- `vk.html:1055` reloads chat history using `state.user?.id`.
- `vk.html:1807` starts `sendMessage()`.
- `vk.html:1814` appends the user message to `state.chatHistory` before the AI request.
- `vk.html:1824-1828` posts to `WORKER + '/anthropic'` with JSON body and optional `x-token`.
- `vk.html:1829` parses `res.json()` without checking `res.ok`.
- `vk.html:1831` falls back to generic "could not get answer" text when response shape is missing.
- `vk.html:1832` stores the assistant reply in local chat history.
- `vk.html:1833` catches network/parser failures and shows a generic connection error.
- Related task-discussion AI path: `vk.html:1769-1783` also posts to `/anthropic` and parses JSON without `res.ok`.

## Safest Diagnostic Plan

Use a fresh synthetic test account only. Capture and redact:

1. Surface: direct `vk.html`, VK web iframe, or VK mobile WebView.
2. Origin/build hash/API base, no secrets.
3. `/auth/me` HTTP status and response shape with token as `<redacted>`.
4. Current entitlement/plan status only if the existing API already exposes it safely; no payment or entitlement changes.
5. One short `/anthropic` prompt with request payload redacted except model/max_tokens/message count.
6. HTTP status, CORS/preflight status, response shape, and any request-id header.
7. Console/network tail with token and personal content redacted.

## Proposed Allowed Fix After Review

- Check `res.ok` before parsing success payload.
- Show honest error classes: unauthenticated, forbidden/entitlement, rate-limited, transient/server, malformed response.
- Add request-id/status diagnostics to local debug output without secrets.
- Retry only transient failures, not auth/entitlement denials.
- Keep `x-token` required where the worker requires it.

## Explicit Prohibitions

- Do not weaken or remove `x-token`.
- Do not bypass entitlement or payment gates.
- Do not change backend auth contracts.
- Do not log tokens, secrets, personal payloads, or full prompts in reports.
- Do not perform production deploy, merge to `main`, CAL work, VK Pay, prices, payments, entitlement refactors, secret rotation/removal/disclosure, or live VK device actions in this autonomous task.

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
