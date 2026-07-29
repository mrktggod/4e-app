status: NEW

# BRIEF-2026-07-29-106-night-test-infra-windows-fallbacks

## Context

Night QA on Windows repeatedly hits tooling gaps:

- `npm run check:portable-paths` exits 127 because wrapper cannot spawn `bash`;
- `npm run check:ui-architecture` exits 127 for the same reason;
- CDP smoke scripts need `CHROME_PATH` because `chrome`/`msedge` are not in PATH;
- using Playwright Chromium fixed `back055`, and allowed `back069` to reach a real layout assertion.

## Task

Make test infrastructure more reliable on Windows:

- either make guard scripts runnable without `bash`, or add npm scripts/wrappers that perform equivalent checks on Windows;
- update CDP smoke scripts or a shared helper so they can default to Playwright Chromium when `chrome`/`msedge` are unavailable;
- keep Linux/GitHub Actions behavior intact.

Do not change app runtime behavior in this brief.

## Stop Points

- No production deploy.
- No merge into `main`.
- No CAL tasks.
- No price changes.
- No payment or entitlement refactors.
- No secret rotation, secret removal, or secret disclosure.
- Do not weaken guard thresholds.

## Verification

- `npm run check:portable-paths`
- `npm run check:ui-architecture`
- `npm run smoke:back055`
- `npm run smoke:back069-hero`
- `node scripts/check-cp1251-mojibake.mjs`
- `node scripts/check-js-syntax.mjs`

If `back069` still fails on layout, that is acceptable only if it reaches the real layout assertion instead of failing to find Chrome.

## Review Agent Check

Another agent must verify thresholds were not weakened and the fallback does not depend on absolute C-drive project paths.

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-29-106-night-test-infra-windows-fallbacks.md` with changed files, before/after command output, commit SHA, and any remaining environment tails.
