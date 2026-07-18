# PERF-2026-07-18 task create/list latency re-check

Date: 2026-07-18
Branch: `feat/admin-tariff-api`
Target: staging worker `https://restless-lab-d737-staging.shelckograff.workers.dev`
Worker staging version: `6cf4e558-9681-46a7-ae60-20f51375d505`

## Why this was checked

`docs/tasks/EVIDENCE-AUDIT-2026-07-17.md` recorded a partial smoke where `tasks.create` took about 12s and `tasks.list.after` took about 10s. The suspected cause was D1 shadow sync in `saveUser()` or a cold-start / staging storage spike.

## Fresh RAW timing

Fresh isolated account: `codex-perf-correct-1784375182473@example.com`.

```text
register fresh perf user
STATUS: 200
MS: 558

tasks.list.before
STATUS: 200
MS: 163
BODY: []

tasks.create save-task
STATUS: 200
MS: 283
BODY: {"ok":true}

tasks.list.after
STATUS: 200
MS: 148
BODY: [{"direction":"incoming", ... "text":"Codex perf correct task 1784375182473", "id":"task-1784375186504-482915", ...}]
```

## Code-path finding

`worker.js` task create/list path does not call `saveUser()`:

| Code area | Finding |
| --- | --- |
| `handleGetTasks()` | Reads `getTasksForChat(chatId)` and returns JSON. |
| `handleSaveTask()` | Resolves entitlement/user capability, loads tasks, mutates the task array, then calls `saveTasksForChat(chatId, tasks)`. |
| `saveUser()` | Has D1 shadow sync (`syncUserProfileToD1(user)`), but it is not on the observed `tasks.create` / `tasks.list` path. |

## Conclusion

The 10-12s task latency from 2026-07-17 did not reproduce on 2026-07-18. Current staging timing is beta-acceptable for this narrow path: create ~283 ms, list ~148-163 ms.

Most likely explanation: transient staging/edge/KV latency or cold-path anomaly during the earlier partial smoke, not persistent blocking D1 `saveUser()` work in task create/list.

## Recommendation

Do not add a runtime fix without a reproducible slow request. Keep this as a watch item for beta QA: if task create/list again exceeds 2s on staging or production, add narrow request-stage timing instrumentation around `getSession`, `resolvePremiumCapabilityUser`, `getTasksForChat`, `saveTasksForChat`, and response serialization.
