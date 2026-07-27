status: DONE

# REPORT-BRIEF-2026-07-27-97-ai-task-title-description-quality

## Result
- Improved frontend task draft normalization without changing backend endpoints.
- Created tasks now keep a short natural `text` title.
- Detail tails after comma/dash or words like `там`, `чтобы`, `не забудь` move into `description`.
- Full raw user input remains in `originalMsg`.
- Assigned person and deadline extraction still work, including punctuation after deadline phrases.
- Existing duplicate-merge path now preserves a new `description` when the existing task has none.

## Files
- `index.html`
- `scripts/task-title-description-quality-smoke.mjs`
- `package.json`
- `FILE_MAP.md`
- `DEVELOPMENT_LOG.md`

## Verification
- `npm run smoke:task-title-description`
- `npm run smoke:back065`
- `node scripts/check-cp1251-mojibake.mjs`
- `npm run check:js-syntax`
- `git diff --check`
- Portable path check equivalent: passed
- UI architecture guard equivalent for `index.html`: passed

## Notes
- No backend AI prompt outside this repo, billing, entitlement, production, or rollout code was touched.
