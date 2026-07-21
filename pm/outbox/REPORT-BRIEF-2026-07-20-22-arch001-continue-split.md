status: DONE

# REPORT-BRIEF-2026-07-20-22-arch001-continue-split

## Result
Moved one low-risk inline utility helper from `index.html` into the platform adapter without changing escaping behavior.

## Root Cause / Scope
- Inline debt source: `index.html:6002` previously owned the `esc()` helper inside the main inline script.
- New shared home: `scripts/platform-adapter.js:279` exposes `escapeInlineHandlerValue(value)`.
- Runtime bridge: `index.html:6002` now keeps the same `esc` local alias, but resolves it from `PLATFORM.escapeInlineHandlerValue` with the old implementation as fallback.
- Export: `scripts/platform-adapter.js:1167`.

## Changed Files
- `index.html`
- `scripts/platform-adapter.js`
- `FILE_MAP.md`
- `pm/inbox/BRIEF-2026-07-20-22-arch001-continue-split.md`
- `pm/outbox/REPORT-BRIEF-2026-07-20-22-arch001-continue-split.md`
- `shared/WORK_LOG.md`
- `DEVELOPMENT_LOG.md`
- `pm/team-sync.md`

## Verification
- Encoding ritual before edit: `Select-String -Path "index.html" -Pattern 'Войти|Задачи|Сегодня'` returned `106`.
- Backup created before edit: `index.backup_20260721_2311.html`; removed before staging because it was a local safety copy.
- Encoding ritual after edit: `Select-String -Path "index.html" -Pattern 'Войти|Задачи|Сегодня'` returned `106`.
- `node scripts/check-cp1251-mojibake.mjs`: passed, `0 suspicious tokens`.
- `bash scripts/check-ui-architecture.sh`: passed, inline handlers `397 / 402`, inline script tags `3 / 3`.
- `bash scripts/check-portable-paths.sh`: passed.
- `npm run smoke:back050`: passed, `"ok": true`, `failures: []`.
- `node scripts/check-js-syntax.mjs` after staging: passed for `scripts/platform-adapter.js` and `index.html` inline scripts `#1..#3`.
- `git diff --cached --check`: passed.

## NEED-CLAUDE Tail
No NEED-CLAUDE tail for this task. Broader extractions from global-heavy inline script sections remain intentionally untouched and should continue as separate reviewed ARCH-001 slices.

## Commit
This commit; exact pushed SHA is recorded in the automation final summary.
