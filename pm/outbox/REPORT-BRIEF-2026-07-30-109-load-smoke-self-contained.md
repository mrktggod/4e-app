# REPORT-BRIEF-2026-07-30-109-load-smoke-self-contained

Status: DONE

## Root cause

`autotests/load/smoke-load.js` defaults to `BASE_URL=http://127.0.0.1:4174`, but `npm run load:smoke` previously ran `k6 run autotests/load/smoke-load.js` directly. If no local static server was already listening, k6 failed every request with `connectex: No connection could be made because the target machine actively refused it`.

This was a repeatability defect in the test command, not an app route failure. A manual rerun with an explicit local static server returned `200` for `/index.html`, `/vk.html`, and `/privacy.html`.

## Changed files

- `package.json`
- `scripts/run-load-smoke.mjs`
- `pm/inbox/BRIEF-2026-07-30-109-load-smoke-self-contained.md`
- `pm/outbox/REPORT-BRIEF-2026-07-30-109-load-smoke-self-contained.md`

## Fix

Added `scripts/run-load-smoke.mjs`, a Node wrapper that starts a small static server from the current repo root, sets `BASE_URL` for k6, runs the existing `autotests/load/smoke-load.js`, then closes the server.

The k6 scenario, thresholds, endpoints, VU count, and duration remain in `autotests/load/smoke-load.js` unchanged.

## Verification

Before fix:

```text
npm run load:smoke
checks_failed: 100.00% 90 out of 90
http_req_failed: 100.00%
exit=99
```

Manual proof of root cause:

```text
BASE_URL=http://127.0.0.1:4174 k6 run autotests/load/smoke-load.js
checks_succeeded: 100.00% 90 out of 90
http_req_failed: 0.00%
```

After fix:

```text
npm run load:smoke
```

Result:

```text
load:smoke server listening on http://127.0.0.1:4174
checks_succeeded: 100.00% 90 out of 90
checks_failed: 0.00% 0 out of 90
http_req_failed: 0.00%
http_req_duration p95=21.49ms
```

Shared guard:

```text
node --check scripts/run-load-smoke.mjs
PASS

node scripts/check-cp1251-mojibake.mjs
CP1251 mojibake check passed: 0 suspicious tokens

git diff --check -- package.json scripts/run-load-smoke.mjs pm/inbox/BRIEF-2026-07-30-109-load-smoke-self-contained.md pm/outbox/REPORT-BRIEF-2026-07-30-109-load-smoke-self-contained.md
PASS
```

## Stop zones

No production deploy, no merge into `main`, no CAL work, no price changes, no payment/entitlement refactor, no secrets work, and no live Telegram/VK device action were performed.

## Commit

This report will be included in the task commit and the final pushed SHA will be verified against `origin/feat/admin-tariff-api`.
