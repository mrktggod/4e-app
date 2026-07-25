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
