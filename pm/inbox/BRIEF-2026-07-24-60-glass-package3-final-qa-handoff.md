status: NEW

# BRIEF-2026-07-24-60-glass-package3-final-qa-handoff

## Context

This is the package 3 and overall night-design queue closeout. It must not add
new runtime design work. Its job is to make the morning review fast and honest:
what is implemented, what is still blocked, and which screenshots prove the
result.

## Task

1. Confirm outcomes and commit SHAs for briefs 42, 50-59.
2. Build a compact visual evidence index for:
   - reference image;
   - task detail;
   - notifications;
   - home/focus;
   - task lists;
   - profile/menu;
   - controls/popups;
   - chat;
   - VK covered surfaces.
3. Run the full prebeta gate once.
4. If only known auth/legal mobile timeouts recur, rerun the exact auth/legal
   file with one worker and report both results; do not change tests merely to
   obtain green.
5. Update `pm/design-system-glass-inventory-2026-07-24.md`,
   `pm/backlog.md`, `shared/WORK_LOG.md` and `DEVELOPMENT_LOG.md` with the
   actual completed scope.
6. Produce no more than seven morning review questions, grouped by product
   surface.

## Stop Points

- Documentation/evidence only; no new runtime design family in this brief.
- No production deploy or merge into `main`.
- No CAL, price, payment, entitlement, auth-security or secret work.
- Do not claim completion for surfaces that were blocked, skipped or only
  source-inspected.
- A failing focused component smoke blocks the overall handoff from `DONE`.

## Verification

- `npm run qa:prebeta`
- If needed:
  `npx playwright test autotests/tests/web/auth-legal.spec.ts --project=mobile-chromium --workers=1`
- `node scripts/check-cp1251-mojibake.mjs`
- `npm run check:portable-paths`
- `git diff --check`

## Report

Write
`pm/outbox/REPORT-BRIEF-2026-07-24-60-glass-package3-final-qa-handoff.md`
with the full brief/commit matrix, exact pass/fail counts, screenshot evidence
index, implemented/deferred table, production/main untouched statement and
morning review questions.
