status: DONE

# BRIEF-2026-07-26-78-ai-delete-intent-refuse-fix

## Context

Follow-up to `BRIEF-2026-07-25-68-ai-delete-intent-safety` (status NEED-CLAUDE, see `pm/outbox/REPORT-BRIEF-2026-07-25-68-ai-delete-intent-safety.md`) and `BUG-2026-07-25-015` (P0, Critical): AI chat mapped a delete request onto mass-completing active tasks.

Root cause confirmed by Claude review: the AI action contract has no `delete` action at all.

- `index.html:5758-5759` — system prompt instructs the model to pick actions "только из списка: complete, reschedule, edit, remind, show." There is no `delete`/`refuse` option.
- `index.html:6595-6619` (`normalizeAskActions`) and `index.html:6797-6820` (`applyAskAction`) only recognize `show|complete|reschedule|edit|remind`. Any delete-shaped request the model tries to express has no matching type, so it (or the parser) falls back to the closest available action, `complete`, which then executes `done-task`.
- Mirror path at `index.html:5582-5606` / `5694` (task-detail-scoped mini chat) uses the same closed action set — check whether it shares `SYS_BASE`/the same instruction line or has its own copy before editing.

## Decision (Claude, this brief)

Implement **option 1 from the original NEED-CLAUDE report: refuse, do not execute.** Do not build a bulk-delete feature or a confirmation-flow UI in this brief — that is a separate product decision. This brief only has to stop the destructive misfire.

## Task

1. Update the system prompt instruction (`index.html:5758-5759` and the task-detail mirror if it exists) so the model is explicitly told: deletion/removal requests are **not** in the allowed action list, and it must reply in plain text explaining it cannot delete tasks via chat yet (suggest the task menu instead) — with **no** `actions` entry for that turn.
2. As a defense-in-depth backstop (in case the model still emits something delete-shaped despite the prompt change): in `normalizeAskActions()` / the task-detail equivalent, explicitly detect and drop any `type` that is not in the exact known allow-list (`show|complete|reschedule|edit|remind`) rather than silently coercing anything close to `complete`. Do not add a new `delete` type — absence of a match must mean "no action", never "closest action".
3. Do not touch `done-task` / `postTaskChatMutation` execution semantics themselves — the fix is at the prompt + normalization layer, before any mutation call.

## Stop Points

- No production deploy.
- No merge into `main`.
- No new bulk-delete or confirmation-flow feature — refuse only.
- No broad task backend refactor.
- No payment, entitlement, CAL, price, or secret work.
- If the shared system-prompt string turns out to be reused in a way that a narrow fix can't isolate cleanly, stop and write `NEED-CLAUDE` again with what was found — do not improvise a broader prompt rewrite.

## Verification

- `node scripts/check-cp1251-mojibake.mjs`
- Focused AI chat smoke: send `удали все задачи` (and a single-task `удали задачу X`) against a seeded chat with active tasks — assert no task's `done`/`status` changes, and the AI reply is a plain refusal/redirect with `actions` empty or absent.
- Regression: existing `complete`/`reschedule`/`edit`/`remind`/`show` smokes still pass unchanged.

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-26-78-ai-delete-intent-refuse-fix.md` with root cause confirmation, exact changed lines, commit SHA, raw proof (before/after chat transcript or smoke output), and honest tails (e.g. if the task-detail mirror path turned out to be a separate prompt needing its own fix).
