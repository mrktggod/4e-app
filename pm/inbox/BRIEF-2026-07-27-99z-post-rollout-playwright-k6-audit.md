status: NEED-YURI

# BRIEF-2026-07-27-99z-post-rollout-playwright-k6-audit

## Context

Yuri asked to run a Playwright and k6 check after tonight's task queue and production rollout, then write down the remaining improvements. This brief must run after `BRIEF-2026-07-27-99-production-rollout-after-green-queue.md`.

The main quality bar is not only "tests passed". The audit must check that the Web, Telegram Mini App and VK Mini App surfaces are visually and functionally converged into one product view where differences are only platform-specific shell constraints.

## Task

After production rollout is complete, run a post-release QA audit with Playwright and k6.

Required checks:

1. Confirm production URL is reachable:
   - `https://app.4-ai.site/`
2. Run Playwright suites for all three surfaces:
   - `npm run test:e2e:web`
   - `npm run test:e2e:telegram`
   - `npm run test:e2e:vk`
   - if time allows, full `npm run test:e2e`
3. Build one Playwright visual/parity view across Web, Telegram and VK:
   - capture the same key screens for all three surfaces: dashboard/today, task detail, task completion flow, profile, navigation/menu, date/time/reminder controls;
   - use the same seed/test data where possible;
   - compare screenshots side by side in one report section or artifact;
   - mark every difference as `expected platform shell difference`, `bug`, or `needs product decision`;
   - explicitly check that visual fixes from tonight's queue are visible in the relevant surfaces.
4. Run k6 smoke:
   - local/static if production target is not safe;
   - production read-only smoke only if it does not create users, payments, or destructive data;
   - use explicit env vars in the report.
5. Review failures and warnings.
6. Write a clear improvement list grouped by:
   - P0 blockers;
   - P1 user-facing issues;
   - P2 polish/performance;
   - test coverage gaps;
   - manual QA needed from Yuri.

## Stop Points

- Do not run destructive load tests against production.
- Do not create real payments.
- Do not change prices, payment, entitlement, secrets or CAL.
- Do not fix multiple findings inside this audit brief. If one tiny test-only correction is required to make the audit runnable, it may be done with a clear note; otherwise create follow-up briefs.

## Verification

Report must include:

- production URL checked;
- release SHA tested;
- exact Playwright commands and pass/fail counts;
- exact k6 command and summary;
- list of failures with reproduction notes;
- Web/Telegram/VK parity matrix;
- link/path to the combined Playwright visual comparison artifact, if generated;
- prioritized follow-up improvements.

## Report

Create `pm/outbox/REPORT-BRIEF-2026-07-27-99z-post-rollout-playwright-k6-audit.md`.
