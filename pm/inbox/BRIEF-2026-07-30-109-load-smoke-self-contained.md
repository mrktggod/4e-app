status: DONE

# BRIEF-2026-07-30-109-load-smoke-self-contained

## Context

Mandatory nightly QA found `npm run load:smoke` red when no static server was already listening on `127.0.0.1:4174`.

The load script itself defaults to `BASE_URL=http://127.0.0.1:4174`, but unlike Playwright it did not start a web server. A manual rerun with `python -m http.server 4174 --bind 127.0.0.1` and explicit `BASE_URL` passed 90/90 k6 checks.

## Task

Make `npm run load:smoke` self-contained for local/nightly runs:

- start a local static server from the app repo;
- pass the correct local `BASE_URL` to k6;
- keep the existing k6 scenario and thresholds unchanged;
- do not change app runtime behavior.

## Stop Points

- No production deploy.
- No merge into `main`.
- No CAL tasks.
- No price changes.
- No payment or entitlement refactors.
- No secret rotation, secret removal, or secret disclosure.

## Verification

- `npm run load:smoke`
- `node scripts/check-cp1251-mojibake.mjs`
- `git diff --check`

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-30-109-load-smoke-self-contained.md` with root cause, changed files, commit SHA, raw proof, and honest tails.
