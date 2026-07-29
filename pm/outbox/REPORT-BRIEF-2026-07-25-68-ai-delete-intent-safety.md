# REPORT-BRIEF-2026-07-25-68-ai-delete-intent-safety

Status: NEED-CLAUDE
Branch: `feat/admin-tariff-api`
Commit: this commit

## Task

Prevent delete intent from being executed as `done` / complete in AI chat.

## Classification

This is not safe autonomous DONE under the night-runner whitelist:

- Severity is P0.
- The behavior is destructive/bulk task mutation.
- The brief explicitly says to write `NEED-CLAUDE` if the root cause is in prompt/tool contract and the safe fix is not narrow.

## Evidence

- `pm/bugs.md:87`: bug says a user asked to delete tasks and the AI mass-completed active tasks instead.
- `index.html:6881`: AI chat prompt/tool contract allows task actions with `type:"complete|reschedule|edit|remind|show"`, but there is no supported delete/refuse action contract for destructive delete intent.
- `index.html:6784-6785`: accepted chat action `complete` executes `postTaskChatMutation('done-task', ...)`.
- `index.html:6582`: action normalization accepts `complete` when a task id is present.
- `index.html:3146` and `scripts/task-ui-renderers.js:178`: `done-task` maps to completing tasks in local/offline paths as well.

## Why No Runtime Change

A safe fix likely needs a reviewed AI action contract decision:

- Detect delete intent before model/tool execution and refuse or require confirmation.
- Decide whether bulk delete is supported at all.
- Ensure prompt, parser, action renderer, execution path and focused smoke all agree.

Changing only one branch risks leaving another path where `delete` is still interpreted as `complete`, or accidentally introducing real destructive delete behavior without a product decision.

## Proposed Next Step

Claude should produce a narrow implementation plan for one of these safe outcomes:

1. Refuse destructive delete intent in AI chat before any task mutation.
2. Add a non-mutating confirmation proposal for delete intent, with no execution until a separate confirmed action exists.

## Scope Notes

- No production deploy.
- No merge into `main`.
- No broad task backend refactor.
- No payment, entitlement, CAL, price, or secret work.
- No runtime files changed for this brief.

## Raw Evidence

```text
rg -n "complete|done-task|delete|createTaskFromChat|sendAsk" index.html scripts/task-ui-renderers.js
index.html:6881 prompt contract lists complete/reschedule/edit/remind/show
index.html:6784-6785 complete executes done-task
scripts/task-ui-renderers.js:178 markDoneKV sends done-task
```

## 2026-07-29 User-Requested Safe Fix Addendum

Status: DONE for the narrow safety fix.

Alexey explicitly requested the safe path: if AI chat recognizes intent similar
to `удалить`, it must ask for explicit confirmation instead of executing or
quietly marking tasks done.

Implemented:

- `index.html`: added local delete-intent detection for AI chat task requests;
- `index.html`: `sendAsk()` now stops before `/anthropic` for destructive task
  delete/remove/clear intent and shows explicit confirmation text;
- `index.html`: `parseAskActionsFromText()` strips suggested actions when the
  source user text is destructive;
- `index.html`: `confirmAskActions()` blocks old saved suggested-action cards
  tied to a destructive delete request before `done-task` can run;
- `scripts/ai-delete-intent-safety-smoke.mjs`: added focused Playwright smoke
  for the new guard.

Out of scope:

- no real task deletion was implemented;
- no notification action history / undo feature was implemented in this pass;
- no backend task model, payment, entitlement, auth, CAL, secrets, production
  deploy or merge work.

Next separate feature brief:

- Add notification action history entries such as `Задача "..." отмечена
  выполненной` / `Задача "..." удалена`, plus an undo path from notifications.

Raw evidence:

```text
node scripts/ai-delete-intent-safety-smoke.mjs
{
  "smoke": "ai-delete-intent-safety",
  "viewport": "390x844",
  "ok": true,
  "destructiveResult": {
    "anthropicCalls": 0,
    "mutations": [],
    "taskDone": false
  },
  "oldActionMutations": []
}

npm run smoke:task-chat-confirm
"ok": true,
"actionName": "update-task",
"previewStillVisible": false

node --check scripts/ai-delete-intent-safety-smoke.mjs
exit 0

node scripts/check-cp1251-mojibake.mjs
CP1251 mojibake check passed: 0 suspicious tokens

git diff --check
exit 0

npm run check:portable-paths
Unable to run scripts/check-portable-paths.sh: spawnSync bash ENOENT

npm run check:ui-architecture
Unable to run scripts/check-ui-architecture.sh: spawnSync bash ENOENT

C:\Program Files\Git\bin\bash.exe scripts/check-portable-paths.sh
Portable path check passed.

C:\Program Files\Git\bin\bash.exe scripts/check-ui-architecture.sh
UI architecture guard: inline style attributes = 284 / 465
UI architecture guard: inline event handlers = 398 / 402
UI architecture guard: style tags = 0 / 0
UI architecture guard: inline script tags = 3 / 3
```

Commit status:

- not committed in this pass because the worktree already contains unrelated
  dirty runtime/docs/screenshot changes;
- no production deploy or merge was attempted.
