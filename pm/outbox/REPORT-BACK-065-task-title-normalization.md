# REPORT - BACK-065 task title normalization

**Status:** DONE
**Date:** 2026-07-22
**Branch:** `feat/admin-tariff-api`

## Task

Normalize task titles created from dictated intent, AI-chat, and quick-add so `task.text` is short and readable while `originalMsg` keeps the full source phrase.

## Root Cause

`index.html:6184` previously only capitalized the cleaned string through `formatTaskIntentTitle()`, while `fallbackTaskFromText()` removed only a few command words. Live speech phrases such as `мне надо`, `тебе надо`, `я`, and `поставь Маше задачу` could therefore remain in `task.text`.

## Changed Files

- `index.html`
- `package.json`
- `scripts/back-065-task-title-normalization-smoke.mjs`
- `FILE_MAP.md`
- `FILE_MAP_UI.md`
- `docs/tasks/BACK-065-task-title-normalization.md`
- `pm/backlog.md`
- `pm/qa-checklist.md`
- `pm/team-sync.md`
- `shared/WORK_LOG.md`
- `DEVELOPMENT_LOG.md`
- `pm/outbox/REPORT-BACK-065-task-title-normalization.md`

## What Changed

- Added `normalizeTaskTitle(rawText, context)` and Cyrillic-safe deadline phrase matching.
- `fallbackTaskFromText()` now strips common dictated-intent preambles, extracts simple assignee patterns like `поставь Маше задачу`, removes recognized deadline words from the title, and preserves `originalMsg`.
- `createTaskFromChat()` normalizes model-provided titles and keeps the full original phrase in `originalMsg`.
- `submitQuickAdd()` uses the same title helper and stores the raw input when it differs from the normalized title.
- AI-chat system prompt now asks `<create_task>` to return short `text` plus full `originalMsg`.
- Added repeatable smoke `npm run smoke:back065`.

## Raw Proof

```text
Before index marker check: 106
After index marker check: 106
npm run smoke:back065 -> BACK-065 task title normalization smoke: PASS
node scripts/check-cp1251-mojibake.mjs -> CP1251 mojibake check passed: 0 suspicious tokens
git diff --check -> pass
```

## Tails

`NEEDS-REAL`: staging QA should create tasks through AI-chat, voice, and quick-add and confirm the visible title, original text in the detail/edit flow, and no semantic loss for assignee/deadline.
