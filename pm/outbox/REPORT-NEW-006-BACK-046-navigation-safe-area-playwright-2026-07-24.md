status: DONE

# REPORT — NEW-006 / BACK-046 navigation safe-area Playwright smoke — 2026-07-24

## Task

Add the safe Playwright navigation/safe-area coverage proposed in `pm/autotest-backlog-coverage-2026-07-23.md`.

## Scope

Autonomous whitelist category: tests / QA automation / documentation. No runtime code, production deploy, `main` merge, payment, entitlement, auth-security logic, CAL, secrets, OAuth, real Telegram/VK device actions or TMA live QA.

## Root cause / coverage gap

`NEW-006` and `BACK-046` had local/headless evidence, but the shared Playwright web suite did not guard app-shell navigation width or horizontal overflow on both mobile and desktop projects.

## Changed files

- `autotests/tests/web/navigation-safe-area.spec.ts`
- `FILE_MAP.md`
- `pm/autotest-backlog-coverage-2026-07-23.md`
- `pm/backlog.md`
- `pm/outbox/REPORT-NEW-006-BACK-046-navigation-safe-area-playwright-2026-07-24.md`
- `shared/WORK_LOG.md`
- `DEVELOPMENT_LOG.md`
- `pm/team-sync.md`

## Raw proof

```text
npm run test:e2e:web
Running 12 tests using 2 workers
12 passed (46.6s)
```

The new smoke uses a synthetic local auth shell and mocked `/auth/me` + `/tasks` responses. It checks:

- home bottom nav inside viewport;
- global nav inside viewport;
- no `documentElement` or `body` horizontal overflow;
- mobile Chromium 390x844 and desktop Chromium 1366x900 Playwright projects.

Shared guards:

```text
node scripts/check-cp1251-mojibake.mjs -> CP1251 mojibake check passed: 0 suspicious tokens
npm run check:js-syntax -> JS syntax check: no staged JS or HTML files
npm run check:portable-paths -> Portable path check passed.
git diff --check -> passed with no output
```

## Result

`BACK-046` remains `Done`. `NEW-006` is updated to `Auto evidence green / Ready for live QA`: repeatable browser geometry is covered; real Telegram Mini App safe-area still requires a live device smoke.

## Remaining manual tail

Run `docs/tasks/NEW-006-tma-safe-area-live-smoke.md` in real Telegram Mini App before marking `NEW-006` fully Done.

## Commit

This commit: `test(ui): add navigation safe-area e2e smoke`.
