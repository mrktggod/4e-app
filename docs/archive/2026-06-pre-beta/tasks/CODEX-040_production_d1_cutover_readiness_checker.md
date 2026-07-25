# CODEX-040 — Production D1 cutover readiness checker

## Context

The D1/v2 auth bridge and VK frontend handshake are ready, but production
`wrangler.toml` still has no D1 `DB` binding. Creating or attaching production
D1 is a Cloudflare state change, so the next safe step is a repeatable local
preflight checker rather than a silent production cutover.

## Scope

- Add a local readiness checker.
- Do not create Cloudflare resources.
- Do not deploy production Worker.
- Keep provider sync disabled in production until a separate smoke gate.

## Changes

- Added `scripts/check-production-d1-cutover-readiness.js`.
- The checker reads local config/code and reports:
  - blockers;
  - warnings;
  - summary;
  - next safe step.
- It verifies:
  - production KV binding exists;
  - production D1 `DB` binding exists;
  - staging D1 binding exists;
  - challenge metadata migration exists;
  - Worker v2 auth entrypoint exists;
  - legacy session bridge is wired;
  - v2 link/challenge/merge service markers exist;
  - VK frontend has `state.d1Token`, `syncD1AuthSession`, and v2 link markers.

## Verification

- `node --check scripts/check-production-d1-cutover-readiness.js`
- `node scripts/check-production-d1-cutover-readiness.js`

Current expected result:

```json
{
  "ok": false,
  "blockers": 1,
  "warnings": 1
}
```

Current blocker:

- `4e-worker/wrangler.toml` has no production D1 `DB` binding.

Current warning:

- production `ENABLE_D1_PROVIDER_SYNC` is not enabled. This is intentional until
  production D1 smoke is approved.

## Next

After explicit approval:

1. Create or attach production D1 database.
2. Add production `[[d1_databases]]` binding to `4e-worker/wrangler.toml`.
3. Apply D1 migrations remotely.
4. Rerun this checker.
5. Run Wrangler production dry-run.
6. Run controlled production auth bridge smoke.
