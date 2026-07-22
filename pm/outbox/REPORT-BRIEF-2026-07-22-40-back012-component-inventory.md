# REPORT-BRIEF-2026-07-22-40-back012-component-inventory

status: DONE

## Task

Create a reproducible BACK-012 component inventory for high-frequency screens without code/CSS edits.

## Inventory Path

`docs/tasks/BACK-012-component-inventory-2026-07-22.md`

## Exact Counts

| Surface | Inline Style Attrs |
|---|---:|
| Auth/login/register/onboarding | 13 static |
| Home/dashboard | 6 static + 20 dynamic |
| Task card list item | 3 generated |
| Task detail | 0 static + 15 dynamic |
| AI-chat composer | 0 static + 10 dynamic |
| Profile/settings | 92 static aggregate |
| Notifications/action feed | 0 static + 8 generated checked renderer attrs |

Current guard baseline:

```text
UI architecture guard: inline style attributes = 309 / 465
UI architecture guard: inline event handlers = 400 / 402
UI architecture guard: style tags = 0 / 0
UI architecture guard: inline script tags = 3 / 3
```

## Ranked Next Islands

1. `notification-renderer-empty-actions` — low/medium risk, existing `npm run smoke:back055`.
2. `task-card-head-meta` — medium risk, existing `npm run smoke:back019`.
3. `ask-action-preview` — medium risk; add/extend focused ask composer smoke before cleanup.

Task-detail is intentionally excluded until BRIEF-31/32/33 and concurrent task-detail work are resolved.

## Verification

```text
node scripts/check-cp1251-mojibake.mjs
exit code 0

raw inventory commands:
screen range/style count Node snippets recorded in inventory doc
C:\Program Files\Git\bin\bash.exe scripts/check-ui-architecture.sh
exit code 0

git diff --check -- docs/tasks/BACK-012-component-inventory-2026-07-22.md pm/inbox/BRIEF-2026-07-22-40-back012-component-inventory.md pm/outbox/REPORT-BRIEF-2026-07-22-40-back012-component-inventory.md
exit code 0
```

## Stop Points

No runtime/CSS edits, broad refactor, production deploy, `main` merge, CAL, payment, entitlement, auth-security change, secret handling, or guard threshold changes were performed.

## Commit

This commit. The final pushed SHA is verified after commit/push because embedding a commit's own SHA in a tracked report changes that SHA.
