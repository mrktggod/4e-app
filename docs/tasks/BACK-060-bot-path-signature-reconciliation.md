# BACK-060 / BUG-2026-07-15-005 — bot-path signature reconciliation

Дата: 2026-07-17

Цель: сверить старый бриф `codex-2026-07-15-bug005-fix-and-sync-correction.md` с текущим состоянием репозиториев. Новый worker-fix не требуется: текущий `4e-worker/worker.js` уже содержит route-level guard для bot-path, а backlog фиксирует staging smoke по `BACK-060`.

## 1. Current conclusion

| Field | Current state |
| --- | --- |
| Original bug | `BUG-2026-07-15-005`: unsigned bot-path accepted `x-action=save-task` with `telegramUserId` |
| Current owning backlog item | `BACK-060` |
| Current status | Done |
| Worker code state | `readVerifiedActionBody()` verifies signed bot actions before routing |
| Staging evidence recorded in backlog | unsigned `get-chat-members` -> `403 {"ok":false,"error":"bot signature invalid"}`; signed `get-chat-members` -> `200 {"ok":true,"members":[]}` |
| New code change needed now | No |

## 2. Current signature scope in worker

Source: `X:\4\4e-worker\worker.js` current `BOT_ONLY_SIGNED_ACTIONS`, `BOT_SHARED_SIGNED_ACTIONS`, `shouldRequireBotSignature()` and `readVerifiedActionBody()`.

| Action | Signature required when sessionless? | Scope / data touched | Risk if unsigned |
| --- | --- | --- | --- |
| `save-message` | Yes | Saves bot-origin message/chat content | Private/chat data injection |
| `register-chat` | Yes | Registers Telegram chat mapping | Chat/user mapping corruption |
| `upsert-chat-members` | Yes | Updates chat members | Group membership corruption/privacy |
| `get-chat-members` | Yes | Reads chat member list | Private/group data read |
| `mark-chat-members-left` | Yes | Updates member status | Group membership corruption |
| `telegram-auth` | Yes | Bot auth action | Auth/session risk |
| `save-task` | Yes only for bot-scoped body (`telegramUserId`, `assigneeTgId`, `task.assigneeTgId`, `chatId=user_*`, `chatId=group_*`) | Creates/updates task in user/group context | Foreign task injection |
| `done-task` | Yes under same bot-scoped rule | Marks task done in user/group context | Foreign task mutation |
| `delete-task` | Yes under same bot-scoped rule | Deletes task in user/group context | Foreign task deletion |
| `update-task` | Not in signed set; still routed via `readVerifiedActionBody()` but `shouldRequireBotSignature()` returns false unless added later | Session path / regular update path | Review separately before making bot-scoped |
| `set-reminder` | Not in signed set; still routed via `readVerifiedActionBody()` but not bot-signature-required by current scope | Reminder path | Review separately before making bot-scoped |

## 3. Why no new worker change was made

| Reason | Evidence |
| --- | --- |
| Fix already exists | `verifyBotActionSignature()`, `shouldRequireBotSignature()`, `readVerifiedActionBody()` are present in `worker.js` |
| Route-level guard is used | `save-task`, `done-task`, `delete-task`, `save-message`, `register-chat`, `upsert-chat-members`, `get-chat-members`, `mark-chat-members-left`, `telegram-auth` all call `readVerifiedActionBody()` before handlers |
| Backlog already records live smoke | `BACK-060` says second-pass fix was deployed and unsigned/signed `get-chat-members` passed expected 403/200 behavior |
| Worker working tree should stay stable | Current worker only has untracked `kv-backups/`; no tracked code changes are needed for this reconciliation |

## 4. Documentation correction made

`pm/bugs.md` previously had `BUG-2026-07-15-005` marked `Done`, but the description still only described the original vulnerable state. This reconciliation updates the bug row so the final fix path points to `BACK-060`, the route-level guard, and the recorded staging smoke.

## 5. Old brief items not re-applied

| Brief item | Decision |
| --- | --- |
| Re-run worker fix | Not applied; fix already present and recorded as `BACK-060` |
| Re-open payment security as fully unverified | Not applied blindly; later backlog currently contains newer payment smoke evidence than the old brief |
| Change price / mark `BACK-015` Done | Not applied in this reconciliation; price/business status needs fresh explicit decision because other project guardrails said not to touch price |
| Prod deploy / main merge | Not touched |