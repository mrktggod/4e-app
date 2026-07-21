status: DONE

# REPORT-BRIEF-2026-07-20-23-preview-state-flags-for-qa

## Result
Added preview-only query flags for GPT visual QA on dashboard preview hosts. The flags are active only when `previewDemo=dashboard` is present and the runtime is on localhost or a direct `*.4-ai-staging.pages.dev` preview host, not on the shared `4-ai-staging.pages.dev` alias and not in production.

## Flags
- `previewUser=trial|paid|expired|free` controls only the mock user/subscription labels and currentUser preview fixture.
- `previewTasks=empty|mixed|done-failed` controls only mock dashboard task data rendered by the preview layer.
- `previewApi=ok|error` controls only a mocked dashboard API error visual state.
- `previewTheme=light|dark` applies only visual theme state for the preview session.

## Root Cause / Scope
- Gate and parser: `scripts/auth-handlers.js:84` and `scripts/auth-handlers.js:92`.
- Mock user fixture: `scripts/auth-handlers.js:112`.
- Mock task fixtures: `scripts/auth-handlers.js:128`.
- Mock API error state: `scripts/auth-handlers.js:186`.
- Mock dashboard renderer: `scripts/auth-handlers.js:211`.
- Theme/subscription visual labels: `scripts/auth-handlers.js:151` and `scripts/auth-handlers.js:165`.
- Preview login remains synthetic: `scripts/auth-handlers.js:336`.

## Demo URLs
Use a direct Pages preview host after the branch deploy exists. Do not use the shared alias for this matrix.

- `https://<direct-preview>.4-ai-staging.pages.dev/index.html?previewDemo=dashboard&previewScreen=home&previewUser=trial&previewTasks=empty&previewApi=ok&previewTheme=dark`
- `https://<direct-preview>.4-ai-staging.pages.dev/index.html?previewDemo=dashboard&previewScreen=home&previewUser=paid&previewTasks=mixed&previewApi=ok&previewTheme=light`
- `https://<direct-preview>.4-ai-staging.pages.dev/index.html?previewDemo=dashboard&previewScreen=home&previewUser=expired&previewTasks=done-failed&previewApi=error&previewTheme=dark`
- `https://<direct-preview>.4-ai-staging.pages.dev/index.html?previewDemo=dashboard&previewScreen=subscription&previewUser=free&previewTasks=mixed&previewTheme=light&previewScroll=plans`
- `https://<direct-preview>.4-ai-staging.pages.dev/index.html?previewDemo=dashboard&previewScreen=task-detail&previewUser=paid&previewTasks=mixed&previewTheme=dark`

## Real Runtime Safety
- No Worker, KV, D1, payment, entitlement, production, CAL, price, secret, or auth-security logic was changed.
- Shared staging alias `4-ai-staging.pages.dev` is explicitly excluded by the existing preview host gate.
- Production host does not satisfy the preview host gate, so these flags are ignored outside preview.

## Verification
- `node --check scripts/auth-handlers.js`: passed.
- `npm run smoke:home001`: passed, `"ok": true`, `failures: []`.
- `node scripts/check-cp1251-mojibake.mjs`: passed, `0 suspicious tokens`.
- `bash scripts/check-ui-architecture.sh`: passed, inline handlers `397 / 402`, inline script tags `3 / 3`.
- Staged `node scripts/check-js-syntax.mjs`: passed for `scripts/auth-handlers.js`.
- `git diff --cached --check`: passed.
- `bash scripts/check-portable-paths.sh`: passed.

## NEED-CLAUDE Tail
No NEED-CLAUDE tail for this task. A real direct Pages deployment URL was not created in this automation run; GPT QA should replace `<direct-preview>` with the branch-specific Pages deployment host after CI publishes it.

## Commit
This commit; exact pushed SHA is recorded in the automation final summary.
