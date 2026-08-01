# REPORT: BRIEF-2026-08-01-118-home-show-all-visible

Status: DONE

## What changed

- Restored the home show-all action when active tasks exceed visible dashboard rows.
- Removed the QA rollout rule that forced `#home-show-all-btn` to stay hidden with `!important`.
- Updated the home visibility count to use current `.home-ai-row` rows, with the older `.task-card-shell` selector as fallback.

## Root cause

- `styles/screens/qa-rollout.less` forced `#home-show-all-btn` to `display: none !important`, overriding the runtime `display: flex`.
- `index.html` still counted only `.task-card-shell`, while the active dashboard renderer asserts visible `.home-ai-row` rows.

## Checks

- `npm run build:css` passed.
- `npm run smoke:home001` passed: `ok: true`, `showAllDisplay: "flex"` in dark and light themes, 320/360px viewport checks green.
- Refreshed evidence screenshots:
  - `docs/tasks/assets/HOME-001-dashboard-smoke-2026-07-20-dark.png`
  - `docs/tasks/assets/HOME-001-dashboard-smoke-2026-07-20-light.png`
- Final shared guards passed before commit:
  - `npm run qa:prebeta` passed, including Playwright 22/22 and `smoke:home001`.
  - `npm run load:smoke` passed: 90/90 checks, p95 11.06ms, failed rate 0.00%.
  - `node scripts/check-cp1251-mojibake.mjs` passed: 0 suspicious tokens.
  - `git diff --check` passed.

## Guardrails

No production deploy, no merge to `main`, no CAL, prices, secrets, payment, or entitlement changes.
