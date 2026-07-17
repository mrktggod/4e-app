# BACK-057 — offline runtime scope audit

Дата: 2026-07-17

Цель: отдельно зафиксировать вопрос по runtime-части Offline Free Mode. На 2026-07-14 в брифах был явный no-touch guard для некоторых направлений, поэтому перед дальнейшим расширением offline runtime нужно подтвердить, был ли на уже сделанный runtime MVP отдельный бриф/разрешение.

## 1. Current known state

| Area | State |
| --- | --- |
| Backlog item | `BACK-057` Offline Free Mode |
| Current backlog status | `Partial Done` |
| Runtime currently described | localStorage task cache + offline mutation queue for save/update/done/delete, cached plan fallback, queued status and online sync |
| Product/tech plan | `docs/tasks/BACK-057-offline-mode-plan.md` |
| Open scope question | Was the runtime MVP explicitly briefed/approved after the 2026-07-14 no-touch guard? |

## 2. Guardrail until answered

| Rule | Decision |
| --- | --- |
| Do not expand offline runtime | Required until scope question is answered |
| Do not revert runtime blindly | Required; first identify whether it was authorized and whether users depend on it |
| Keep docs/product plan | Allowed |
| Manual offline smoke | Allowed only as QA, not as new implementation |
| If unauthorized | Prepare separate quarantine/revert plan with backup and diff |
| If authorized | Keep `Partial Done` until manual offline smoke passes |

## 3. Question to resolve

> Был ли на runtime-код `BACK-057` отдельный бриф/разрешение после no-touch guard 2026-07-14, или это нужно считать scope drift и выносить в карантин/отдельную ветку?

## 4. Possible outcomes

| Answer | Action |
| --- | --- |
| Yes, runtime was authorized | Keep code, continue only with manual offline smoke and small bugfixes |
| No, runtime was not authorized | Create emergency backup/patch and revert/quarantine runtime from this branch |
| Unclear | Do not touch runtime; keep `BACK-057` blocked for scope decision |

## 5. What this audit does not do

| Not done | Reason |
| --- | --- |
| No runtime changes | This is a scope audit only |
| No deploy | Offline behavior needs deliberate QA window |
| No revert | Avoid losing potentially valid work before authorization is clarified |
| No status promotion to Done | Manual offline smoke still required even if authorized |