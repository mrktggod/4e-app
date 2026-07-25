# REPORT-BRIEF-2026-07-25-61-expired-premium-task-actions

Status: DONE
Branch: `feat/admin-tariff-api`
Commit: this commit

## Summary

Task action denials caused by expired or missing Premium now surface as explicit Premium-required UI instead of falling through to generic save/action errors.

No entitlement, payment, price, production, `main`, CAL, secret, or backend policy logic was changed.

## Root Cause

- `index.html:5614` / `postTaskChatMutation()` converted Worker denials into a plain `Error`, losing HTTP status and denial payload context.
- `index.html:8581` / `quickDoneTask()` did not inspect the Worker response at all before showing success.
- Task action catches at `index.html:3473`, `index.html:3531`, `index.html:5588`, `index.html:6014`, and `index.html:6468` fell back to generic task toasts such as save/action failure.

## Changed Files

- `index.html`
- `scripts/premium-task-action-denial-smoke.mjs`
- `package.json`
- `FILE_MAP.md`
- `pm/inbox/BRIEF-2026-07-25-61-expired-premium-task-actions.md`
- `pm/outbox/REPORT-BRIEF-2026-07-25-61-expired-premium-task-actions.md`
- `pm/bugs.md`
- `pm/backlog.md`
- `pm/team-sync.md`
- `shared/WORK_LOG.md`
- `DEVELOPMENT_LOG.md`
- `pm/outbox/REPORT-4e-pm-inbox-daily-runner-2026-07-25.md`

## Implementation

- Added `createWorkerActionError()` to preserve Worker HTTP status and payload.
- Added Premium-denial detection for 402/403 responses mentioning Premium, subscription, entitlement, access, or payment terms.
- Added a common task-action Premium handler that shows explicit Premium-required copy and routes to the subscription screen.
- Wired the handler before generic fallback toasts in quick-add/save, task detail edit/save, task chat suggested actions, and quick done.
- Changed `quickDoneTask()` to inspect the Worker response before showing success.

## Verification

Raw evidence:

```text
Before index.html encoding guard: 111 matches
After index.html encoding guard: 112 matches
node scripts/check-cp1251-mojibake.mjs
CP1251 mojibake check passed: 0 suspicious tokens

npm run smoke:premium-task-denial
premium-task-action-denial-smoke: ok
```

Shared guards before commit:

```text
node --check scripts/premium-task-action-denial-smoke.mjs
npm run smoke:premium-task-denial
npm run check:js-syntax
node scripts/check-cp1251-mojibake.mjs
Git Bash scripts/check-portable-paths.sh
Git Bash scripts/check-ui-architecture.sh
git diff --check
```

## Tails

- NEEDS-REAL: one manual expired-Premium account check after deploy should confirm the exact Worker denial copy and route in the live host.
- Voice expired-Premium behavior is intentionally not closed here; it remains in `BRIEF-2026-07-25-62-expired-premium-voice-gate`.
