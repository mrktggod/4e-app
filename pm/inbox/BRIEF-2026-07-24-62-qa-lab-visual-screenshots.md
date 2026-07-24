status: NEW
# BRIEF-2026-07-24-62-qa-lab-visual-screenshots

## Goal

Implement `QA-LAB-002`: add a conservative Playwright visual screenshot discipline for glass/design work.

## Scope

- Do not start with full-page baselines.
- Choose 1-2 stable components from current glass/design flow.
- Produce screenshot evidence and, if stable, one component-level `toHaveScreenshot()` check.
- Mask dynamic text/dates where needed.
- Document update-baseline procedure.
- Update reports and QA playbook.

## Stop points

No broad redesign, no production, no `main`, no payment/entitlement/CAL/secrets.

If snapshots are flaky on Windows/CI, keep screenshots as evidence only and mark strict baseline as deferred.

## Required proof

```bash
npm run test:e2e:web
npm run check:cp1251-mojibake
npm run check:portable-paths
git diff --check
```

