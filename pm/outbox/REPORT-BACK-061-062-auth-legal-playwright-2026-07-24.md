status: DONE

# REPORT — BACK-061/062 auth legal Playwright smoke — 2026-07-24

## Task

Add the safe Playwright auth/legal coverage proposed in `pm/autotest-backlog-coverage-2026-07-23.md` for `BACK-061` and `BACK-062`.

## Scope

Autonomous whitelist category: tests / QA automation / documentation. No runtime code, production deploy, `main` merge, payment, entitlement, auth-security logic, CAL, secrets, OAuth or real Telegram/VK actions.

## Root cause / coverage gap

`autotests/tests/web/basic.spec.ts` only verified the app shell and direct `/privacy.html`; it did not click auth legal links or assert mobile touch-target geometry for the auth legal surface.

## Changed files

- `autotests/tests/web/auth-legal.spec.ts`
- `FILE_MAP.md`
- `pm/autotest-backlog-coverage-2026-07-23.md`
- `pm/backlog.md`
- `pm/outbox/REPORT-BACK-061-062-auth-legal-playwright-2026-07-24.md`
- `shared/WORK_LOG.md`
- `DEVELOPMENT_LOG.md`
- `pm/team-sync.md`

## Raw proof

```text
npm run test:e2e:web
Running 8 tests using 2 workers
8 passed (34.6s)
```

Shared guards:

```text
node scripts/check-cp1251-mojibake.mjs -> CP1251 mojibake check passed: 0 suspicious tokens
npm run check:js-syntax -> JS syntax check: no staged JS or HTML files
npm run check:portable-paths -> Portable path check passed.
git diff --check -> passed with no output
```

## Result

`BACK-061/062` stay `Auto evidence green / Ready for live QA`, but the automated part is stronger: Playwright now covers onboarding/login privacy link presence, login/register privacy opening, auth tab/password/forgot/legal 44px touch targets and legal copy font size.

## Remaining manual tail

One live click / dark-light / keyboard-mobile spot check after deploy or hosting changes. No live platform action was performed by this automation.

## Commit

This commit: `test(auth): add legal accessibility e2e smoke`.
