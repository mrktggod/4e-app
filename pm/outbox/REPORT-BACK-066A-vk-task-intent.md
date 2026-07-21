# REPORT - BACK-066A VK task intent parsing

**Status:** DONE
**Date:** 2026-07-22
**Branch:** `feat/admin-tariff-api`

## Task

Fix the first safe P1 hole from the BACK-066 source audit: VK chat task creation used Cyrillic-unsafe JS word-boundary regex for Russian task commands and deadlines.

## Root Cause

`vk.html:1337` and `vk.html:1355` used `\b` around Russian words. In JavaScript, `\b` is based on ASCII word characters, so Cyrillic phrases can fail intent/deadline detection. This was the same class of bug caught in BACK-065 for the main app task flow.

## Changed Files

- `vk.html`
- `package.json`
- `scripts/back-066-vk-task-intent-smoke.mjs`
- `FILE_MAP.md`
- `FILE_MAP_UI.md`
- `docs/tasks/BACK-066-vk-stable-line-functional-parity.md`
- `docs/tasks/BACK-066-vk-functional-parity-audit-2026-07-22.md`
- `pm/backlog.md`
- `pm/team-sync.md`
- `shared/WORK_LOG.md`
- `DEVELOPMENT_LOG.md`
- `pm/outbox/REPORT-BACK-066A-vk-task-intent.md`

## What Changed

- VK task command detection now uses whitespace boundaries and includes common Russian task verbs.
- VK task title cleanup handles `поставь Маше задачу ...`, removes recognized deadline phrases, and keeps the title shorter/cleaner.
- VK chat-created tasks now preserve the full raw phrase in `originalMsg`.
- Added `npm run smoke:back066-vk`.

## Raw Proof

```text
VK before marker check: 13
VK after marker check: 14
npm run smoke:back066-vk -> BACK-066 VK task intent smoke: PASS
node scripts/check-cp1251-mojibake.mjs -> CP1251 mojibake check passed: 0 suspicious tokens
git diff --check -> pass
```

## Tails

`NEEDS-REAL`: mobile VK/browser shell smoke still needs to verify login -> AI chat task creation -> task list/detail on a real VK surface. VK Pay/payment remains out of scope.
