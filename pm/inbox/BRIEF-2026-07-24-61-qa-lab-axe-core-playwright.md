status: NEW
# BRIEF-2026-07-24-61-qa-lab-axe-core-playwright

## Goal

Implement `QA-LAB-001`: add a free axe-core accessibility smoke on top of Playwright.

## Context

Alexey approved expanding free testing tools. Current project already has `BACK-050`, Playwright and `qa:prebeta`; axe-core should complement existing checks, not replace manual mobile/TMA QA.

## Scope

- Add `@axe-core/playwright` as a dev dependency.
- Add a narrow Playwright accessibility spec for stable auth/home/task/detail or mock states.
- Add `npm run test:a11y`.
- Decide whether `qa:prebeta` should include it immediately or keep it as separate command for one run.
- Update `docs/qa/autotest-agent-playbook.md`, `pm/backlog.md`, `shared/ROADMAP.md`, `DEVELOPMENT_LOG.md`, `shared/WORK_LOG.md`, `FILE_MAP.md`.
- Write `pm/outbox/REPORT-BRIEF-2026-07-24-61-qa-lab-axe-core-playwright.md`.

## Stop points

No production, no `main`, no payment, no entitlement, no auth-security logic, no OAuth live flow, no CAL, no secrets.

If axe reports many legacy warnings, do not mass-refactor. Fail only serious/critical scoped issues or document a follow-up.

## Required proof

```bash
npm run test:a11y
npm run test:e2e:web
npm run check:cp1251-mojibake
npm run check:portable-paths
git diff --check
```

