status: DONE
brief: pm/inbox/BRIEF-2026-07-30-110-vk-auth-session-network-failure.md

# REPORT - BRIEF-2026-07-30-110 VK auth session network failure

## Result

Fixed the VK saved-session bootstrap so a temporary `/auth/me` failure no longer
deletes `vk4_token`.

## Root Cause

`vk.html` `bootstrapAuth()` parsed `/auth/me` with `r.json()` and then removed
the saved token after any non-success path. That collapsed different cases into
the same destructive action: real invalid token, timeout, offline/network
failure, 429, 5xx, and invalid JSON.

## Changed Files

- `vk.html`
- `scripts/vk-auth-session-smoke.mjs`
- `package.json`
- `FILE_MAP.md`
- `DEVELOPMENT_LOG.md`

## Behavior

- Success `/auth/me`: keeps `vk4_token`, restores `state.token`, enters the app.
- 401/403: removes `vk4_token`.
- Explicit invalid-token Worker response: removes `vk4_token`.
- 500, 429, invalid JSON, network rejection, timeout rejection: keeps
  `vk4_token`, shows recoverable session text, and continues the VK recovery
  path.
- Explicit logout still removes `vk4_token`; that path was not changed.

## Raw Evidence

```text
npm run smoke:vk-auth-session
> node scripts/vk-auth-session-smoke.mjs
VK auth session smoke: PASS
```

```text
node --check scripts/vk-auth-session-smoke.mjs
exit 0
```

```text
node scripts/check-cp1251-mojibake.mjs
CP1251 mojibake check passed: 0 suspicious tokens
```

```text
npm run test:e2e:vk
4 passed
```

```text
npm run check:portable-paths
Portable path check passed.
```

```text
git diff --check
exit 0
```

## Tails

No live VK account/device check was run. This is covered by local static/mocked
evidence only, per brief stop points.

`npm run check:ui-architecture` remains red on existing `index.html` state:
`inline script tags = 4`, allowed max `3`. This task did not edit `index.html`
and did not add any `<script>` tag.
