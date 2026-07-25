status: DONE

# REPORT-BRIEF-2026-07-25-65-relative-time-copy

## Summary

Fixed old-task relative-time copy in the app home/focus metadata. A legacy task that is 47 days old now renders `поставлена 47 дней назад` instead of falling back to `поставлена недавно`.

## Root Cause

- `index.html:3951` built home priority metadata from `getTaskCreatedTimestamp(task)`.
- Before this fix, `getTaskCreatedTimestamp()` only used `createdAt`, `ts`, or `updatedAt`, so legacy tasks with only `date` had no created timestamp.
- The missing timestamp hit the `поставлена недавно` fallback even when another date path could show `47 дней назад`.

## Changed Files

- `index.html`
- `scripts/relative-time-copy-smoke.mjs`
- `package.json`
- `FILE_MAP.md`
- `FILE_MAP_UI.md`
- `pm/inbox/BRIEF-2026-07-25-65-relative-time-copy.md`
- `pm/bugs.md`
- `pm/backlog.md`
- `pm/team-sync.md`
- `shared/WORK_LOG.md`
- `DEVELOPMENT_LOG.md`

## What Changed

- Added broader created-time parsing in `getTaskCreatedTimestamp()` for `created_at`, `createdTs`, `created_timestamp`, `createAt`, `create_time`, `created`, `ts`, and legacy `date`.
- Added `formatTaskCreatedMeta()` as the shared home/focus wording helper.
- Replaced the ambiguous fallback with neutral `поставлена без даты`.
- Added `npm run smoke:relative-time-copy` to verify the 47-day-old wording.

## Raw Evidence

```text
Encoding markers before edit: 112
Encoding markers after edit: 112

> npm run smoke:relative-time-copy
relative time copy smoke: PASS

> node scripts/check-cp1251-mojibake.mjs
CP1251 mojibake check passed: 0 suspicious tokens
```

## Guards

- `npm run smoke:relative-time-copy` passed.
- `node scripts/check-cp1251-mojibake.mjs` passed.
- Shared portable/UI guard equivalents and staged syntax checks are run before commit because `bash` is not available in this Windows environment.

## Commit

- App branch: `feat/admin-tariff-api`
- App commit: this report's commit (`fix(copy): use exact old task relative time`)

## Tails

- NEEDS-REAL: quick visual QA on staging after deploy to confirm the final home/focus copy in real account data.
