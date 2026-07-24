status: NEW
# BRIEF-2026-07-24-63-qa-lab-lighthouse-ci-report

## Goal

Prepare a non-blocking Lighthouse CI report for local/prebeta frontend quality.

## Scope

- Add Lighthouse CI config for `/index.html`, `/vk.html`, `/privacy.html`.
- Start as report-only or soft thresholds.
- Do not block beta on first run unless there is a clear severe regression.
- Document how to run locally and on preview.

## Stop points

No production load, no production deploy, no `main`, no secrets, no payment/entitlement/CAL.

## Required proof

```bash
npm run build:css
npm run test:e2e:web
LHCI command or report command
npm run check:portable-paths
git diff --check
```

