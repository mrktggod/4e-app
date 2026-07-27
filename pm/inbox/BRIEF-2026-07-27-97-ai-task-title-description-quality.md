status: DONE

# BRIEF-2026-07-27-97-ai-task-title-description-quality

## Context

Yuri/Product TASK-009: generated task titles/descriptions should be cleaner. `BACK-065` improved title normalization, but the fuller AI quality work remains.

## Task

Improve or scope AI-generated task title/description quality.

Expected:

- short natural title;
- details moved into description;
- raw user input preserved separately;
- examples with bad grammar, long input and assigned person are handled.

## Stop Points

- If this requires changing backend AI prompt/contracts outside this repo, stop with `NEED-CLAUDE` and write exact contract changes.

## Verification

- Add fixture smoke with several raw inputs.
- Existing `npm run smoke:back065` remains green.
- `node scripts/check-cp1251-mojibake.mjs`

## Report

Create `pm/outbox/REPORT-BRIEF-2026-07-27-97-ai-task-title-description-quality.md`.
