status: NEW

# BRIEF-2026-07-27-100-post-rollout-playwright-k6-audit

## Context

Yuri asked to run a Playwright and k6 check after tonight's task queue and production rollout, then write down the remaining improvements. This brief must run after `BRIEF-2026-07-27-99-production-rollout-after-green-queue.md`.

## Task

After production rollout is complete, run a post-release QA audit with Playwright and k6.

Required checks:

1. Confirm production URL is reachable:
   - `https://app.4-ai.site/`
2. Run Playwright suites:
   - `npm run test:e2e:web`
   - `npm run test:e2e:telegram`
   - `npm run test:e2e:vk`
   - if time allows, full `npm run test:e2e`
3. Run k6 smoke:
   - local/static if production target is not safe;
   - production read-only smoke only if it does not create users, payments, or destructive data;
   - use explicit env vars in the report.
4. Review failures and warnings.
5. Write a clear improvement list grouped by:
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
- prioritized follow-up improvements.

## Report

Create `pm/outbox/REPORT-BRIEF-2026-07-27-100-post-rollout-playwright-k6-audit.md`.
