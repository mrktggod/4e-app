# REPORT-BRIEF-2026-07-22-37-back037-ci-coverage-audit

status: DONE

## Task

Audit BACK-037 CI/smoke wiring and fix only obvious check wiring gaps.

## Matrix

| Surface | Command / workflow | Target | Status |
|---|---|---|---|
| Mojibake guard | `npm run check:cp1251-mojibake` / `.github/workflows/mojibake-check.yml` | `scripts/check-cp1251-mojibake.mjs` | wired |
| Portable paths | `.github/workflows/path-guard.yml` | `bash scripts/check-portable-paths.sh` | wired |
| Markdown encoding | `.github/workflows/path-guard.yml` | `node scripts/check-doc-encoding.mjs` | wired |
| Pages script assets | `npm run check:pages-script-assets` / `.github/workflows/path-guard.yml` | build whitelist + asset checker | wired |
| UI architecture | `npm run check:ui-architecture` / `.github/workflows/path-guard.yml` | `scripts/check-ui-architecture.sh` | wired |
| JS syntax | `npm run check:js-syntax` / `.github/workflows/path-guard.yml` | `scripts/check-js-syntax.mjs` | fixed: added to Quality guard |
| CSS build | `npm run build:css` / `.github/workflows/path-guard.yml` | `lessc styles/main.less styles.css && cleancss ...` | fixed: added to Quality guard |
| API smoke | `npm run api-smoke` / `.github/workflows/api-smoke.yml` | `scripts/api-smoke.mjs` | wired |
| Pages deploy artifact | `.github/workflows/deploy-pages.yml` | `scripts/build-pages-whitelist.mjs` + artifact assertions | wired |

## Root Cause

`.github/workflows/path-guard.yml:1` was the central Quality guard workflow, but it did not run the already existing `check:js-syntax` or `build:css` package scripts. This left BACK-037 JS syntax and CSS command coverage dependent on local/manual runs only.

## Changed Files

- `.github/workflows/path-guard.yml`
- `pm/inbox/BRIEF-2026-07-22-37-back037-ci-coverage-audit.md`
- `pm/outbox/REPORT-BRIEF-2026-07-22-37-back037-ci-coverage-audit.md`

## Raw Results

```text
package script target existence:
all node/bash script targets in package.json exist

node scripts/check-cp1251-mojibake.mjs
exit code 0

node scripts/check-js-syntax.mjs
JS syntax check: no staged JS or HTML files
exit code 0

bash scripts/check-portable-paths.sh
exit code 0

git diff --check -- .github/workflows/path-guard.yml pm/inbox/BRIEF-2026-07-22-37-back037-ci-coverage-audit.md pm/outbox/REPORT-BRIEF-2026-07-22-37-back037-ci-coverage-audit.md
exit code 0
```

`npm run build:css` was not run locally because `styles.css` and `styles.min.css` already had unrelated uncommitted changes before this task, and the build command rewrites those files. The workflow now runs the CSS build in a clean CI checkout after `npm ci`.

## Commit

This commit. The final pushed SHA is intentionally verified after commit/push, because embedding a commit's own SHA in a tracked report changes that SHA.
