status: DONE

# REPORT-BRIEF-2026-07-27-93-task-advice-manual-generate

## Result
- Task detail no longer calls `loadTaskAdvice()` automatically when a task is opened.
- The advice card resets to the manual placeholder: `Нажми «Совет 4», чтобы получить первый совет по задаче.`
- The existing `Совет 4` action remains visible in the task chat header and is the only path that triggers the advice request.
- Added `npm run smoke:task-advice-manual` to guard against accidental auto-generation regressions.

## Files
- `index.html`
- `styles/screens/tasks.less`
- `styles.css`
- `styles.min.css`
- `scripts/task-advice-manual-smoke.mjs`
- `package.json`
- `FILE_MAP.md`
- `DEVELOPMENT_LOG.md`

## Verification
- `npm run build:css`
- `npm run smoke:task-advice-manual`
- `node scripts/check-cp1251-mojibake.mjs`
- `npm run check:js-syntax`
- `git diff --check`
- Portable path check equivalent: passed
- UI architecture guard equivalent for `index.html`: passed

## Notes
- No backend AI billing, tariff, entitlement, or quota code was changed.
