status: NEW

# BRIEF-2026-07-27-99-production-rollout-after-green-queue

## Context

Yuri explicitly requested on 2026-07-27 that the completed batch be released to production tonight, so he can check all changes together and give one feedback pass.

Production for this app is tied to `main`:

- push to `main` runs `.github/workflows/deploy-pages.yml`;
- push to `main` runs `.github/workflows/deploy-worker-assets.yml`;
- Pages artifact and Worker Static Assets must point to `https://edge.4-ai.site`.

## Task

Run this brief last, after the `81..98` queue is closed.

1. Confirm no earlier executable `BRIEF-2026-07-27-*.md` remains `status: NEW`, except duplicate/superseded files.
2. Confirm every completed task has a matching `pm/outbox/REPORT-*.md`.
3. Run release checks:
   - `node scripts/check-cp1251-mojibake.mjs`
   - `npm run check:js-syntax`
   - `npm run check:portable-paths`
   - `npm run check:ui-architecture`
   - `npm run build:css`
   - `npm run build:worker-assets`
   - `npm run test:e2e`
   - relevant smokes from the completed briefs
4. Use a clean release worktree if the main app checkout still has unrelated local dirty files (`AGENTS.md`, `index.html`, or similar). Do not include unrelated local dirty changes in production.
5. Fast-forward or merge the finalized `origin/feat/admin-tariff-api` into `main` only if checks are green and the release branch state is clean.
6. Push `main`.
7. Monitor GitHub Actions for:
   - `Deploy GitHub Pages`
   - `Deploy Worker Assets`
   - `API smoke`
8. Verify production after deploy:
   - `https://app.4-ai.site/` opens;
   - served app includes the new release SHA or a fresh cache-busted asset marker;
   - no staging/worker.dev URLs appear in the production artifact;
   - core app shell loads on mobile-width smoke.

## Stop Points

- If any release check fails, do not deploy production. Write `NEED-CLAUDE` or `NEED-YURI` report with the failing command and reason.
- If `main` cannot be updated without a non-trivial merge conflict, do not force it. Stop and report.
- Do not touch prices, payment, entitlement, secrets or CAL as part of release.
- Do not include unrelated local dirty files in production.

## Verification

Report must include:

- final `feat/admin-tariff-api` SHA;
- final `main` SHA after push;
- GitHub Actions run URLs or IDs;
- production URL checked;
- list of any items not included in release and why.

## Report

Create `pm/outbox/REPORT-BRIEF-2026-07-27-99-production-rollout-after-green-queue.md`.
