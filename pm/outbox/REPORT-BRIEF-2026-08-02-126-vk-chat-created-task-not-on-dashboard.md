# REPORT-BRIEF-2026-08-02-126-vk-chat-created-task-not-on-dashboard

status: NEED-CLAUDE
lessons_read: 1

## Scope Decision

No narrow local frontend refresh/normalization bug was found. The remaining manual symptom likely needs worker/API persistence or auth/session identity review.

## Findings

- Direct VK chat task creation is in `vk.html:1816`. It requires `state.token`, builds a task with `done: false`, `type: 'task'`, `date`, `createdAt`, `source: 'vk_chat'`, and optional `deadline`, then posts `x-action: save-task`.
- After successful direct chat save, `vk.html:1841` calls `await loadTasks()`.
- AI structured task creation is in `vk.html:1863` / `vk.html:1885`. It builds a task with `done: false`, `type: 'task'`, `date`, `createdAt`, `source: 'vk_ai_chat'`, and posts through the same `x-action: save-task` path.
- After successful AI-created task save, `vk.html:1896` calls `await loadTasks()`.
- Dashboard loading uses `vk.html:1574`; it fetches `/tasks`, stores the returned list in `state.tasks`, then calls `renderTasks()` and `buildStats()`.
- Existing `npm run smoke:vk-ai-chat-parity` verifies direct chat creation and `<create_task>` structured creation both preserve task fields and use `x-action: save-task`.

## Why Not DONE

- The local frontend path saves through the expected task creation boundary and refreshes tasks after success.
- The manual report that the created task does not appear on dashboard may mean the worker did not persist the task, persisted it under another identity/session, or `/tasks` returns a list filtered differently for the VK user.
- The brief says to stop with `NEED-CLAUDE` if the cause is worker/API persistence or auth/session identity mismatch.

## Verification

- `npm run smoke:vk-ai-chat-parity` - PASS.
- `npm run smoke:vk-home-parity` - PASS.
- `$env:AUTOTEST_PORT='4187'; npm run test:e2e:vk` - PASS, 4/4 tests. Default port `4174` is occupied on this workstation, so a free port was required.
- `node scripts/check-cp1251-mojibake.mjs` - PASS, `0 suspicious tokens`.
- `npm run check:portable-paths` - PASS.
- `git diff --check` - PASS.

## Proposed Next Step

- Claude should inspect live/staging Worker logs for VK `x-action: save-task`, the returned task payload, and the following `/tasks` response under the same token/user.
- If `/tasks` returns the saved task but VK filters it out, create a narrow frontend brief with the exact saved task sample.
- If save succeeds under one identity and load uses another, handle it in the auth/session identity track, not as a dashboard UI fix.

## Commit

- App commit: ef2436cd0eba724e26961b4591d90fd2e4bde108

## Honest Tails

- No live VK chat/API flow was executed.
- No runtime code was changed.
- No production deploy, no merge into `main`, no CAL, no prices, no secrets, no payment or entitlement changes.
- Pre-existing unrelated local modifications were left untouched.
