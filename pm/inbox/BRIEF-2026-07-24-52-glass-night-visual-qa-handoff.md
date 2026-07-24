status: NEED-CLAUDE

# BRIEF-2026-07-24-52-glass-night-visual-qa-handoff

## Context

This is the closeout gate for the 2026-07-24 → 2026-07-25 design night. It must
not add another component family. Its purpose is to prove what the earlier
glass briefs changed and prepare a reviewable morning handoff.

The independent daytime audit observed one resource-sensitive run where
`qa:prebeta` finished 18/20 because two mobile auth/legal tests timed out; a
focused one-worker rerun passed 2/2. Do not hide a similar result.

## Task

1. Confirm briefs 42, 50 and 51 outcomes and their commit SHAs.
2. Capture a coherent evidence set:
   - reference image;
   - notification card light/dark;
   - task detail light/dark at 390x844;
   - task detail desktop overflow view.
3. Run the full prebeta gate once.
4. If only auth/legal mobile timeouts recur, rerun that exact file with one
   worker and report both results; do not rewrite tests merely to obtain green.
5. Update design inventory/backlog status with the exact completed families.
6. Produce a morning checklist of no more than five visual questions.

## Stop Points

- Documentation/evidence only; no new runtime design family in this brief.
- No production deploy or merge into `main`.
- No CAL, price, payment, entitlement, auth-security or secret work.
- Do not claim global DESIGN-GLASS-001 completion.
- A failing focused component smoke blocks the handoff from `DONE`.

## Verification

- `npm run qa:prebeta`
- If needed:
  `npx playwright test autotests/tests/web/auth-legal.spec.ts --project=mobile-chromium --workers=1`
- `node scripts/check-cp1251-mojibake.mjs`
- `npm run check:portable-paths`
- `git diff --check`

## Report

Write
`pm/outbox/REPORT-BRIEF-2026-07-24-52-glass-night-visual-qa-handoff.md`
with:

- brief/commit matrix;
- exact pass/fail counts and targeted reruns;
- screenshot paths;
- implemented versus deferred component families;
- no more than five morning review questions;
- explicit statement that production and `main` were untouched.
