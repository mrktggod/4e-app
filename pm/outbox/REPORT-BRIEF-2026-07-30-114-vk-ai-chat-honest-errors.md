status: DONE
brief: pm/inbox/BRIEF-2026-07-30-114-vk-ai-chat-honest-errors.md

# REPORT - BRIEF-2026-07-30-114 VK AI chat honest errors

## Result

VK AI chat and task discussion now show specific user-facing failure classes
instead of one generic fallback.

## Changed Files

- `vk.html`
- `scripts/vk-ai-chat-errors-smoke.mjs`
- `package.json`
- `FILE_MAP.md`
- `DEVELOPMENT_LOG.md`

## Behavior

- Success payload returns the assistant text.
- 401: prompts the user to sign in again.
- 402/403: explains AI access is limited by subscription/rights.
- 429: explains rate limit.
- 5xx: retries once, then reports temporary AI/server unavailability.
- Network failure: retries once, then reports network failure.
- Malformed successful payload: reports invalid AI response format.
- `x-token` remains present whenever `state.token` exists.
- Diagnostics store only `status`, `requestId`, and `type`; no token, secret, or
  full prompt is logged.

## Raw Evidence

```text
npm run smoke:vk-ai-chat-errors
> node scripts/vk-ai-chat-errors-smoke.mjs
VK AI chat errors smoke: PASS
```

```text
npm run test:e2e:vk
4 passed
```

```text
node --check scripts/vk-ai-chat-errors-smoke.mjs
exit 0
```

```text
node scripts/check-cp1251-mojibake.mjs
CP1251 mojibake check passed: 0 suspicious tokens
```

## Tails

No backend auth contract, entitlement/payment gate, CAL/VK Pay, production
deploy, main merge, secret, or live VK account/device work was performed.
