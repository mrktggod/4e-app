# REPORT - X-drive canon and path guard - 2026-07-25

## Outcome

DONE.

Project canon rule is now documented and automatically checked for tracked project files.

## Changed Files

| File | Lines | What changed |
| --- | ---: | --- |
| `AGENTS.md` | 1-5 | Added first-line canonical app warning: `.tmp-4e-app-publish` is the app canon, not a disposable tmp folder. |
| `AGENTS.md` | 255-261 | Added top-level disk rule after autonomous stop points: project files live only inside `X:\4`; C-drive project files are forbidden; violation stops the session with `NEED-YURI`. |
| `FILE_MAP.md` | 1-5 | Duplicated the canonical app warning before the table of contents. |
| `scripts/check-portable-paths.sh` | 1-24 | Reworked guard to scan tracked git files, ignore binary files, and fail on absolute C-drive project paths outside allowed historical/doc areas. |
| `.github/workflows/path-guard.yml` | 20-23 | Added an explicit workflow step for tracked C-drive path checking. |
| `shared/ROADMAP.md` | 199 | Replaced old rollback wording: old `Documents\4` copy was liquidated on 2026-07-25; canon is only `X:\4`. |
| `docs/ЗАДАЧИ_БЕТА_И_ВИРАЛЬНОСТЬ.md` | 19 | Replaced obsolete statement that `Documents\4` was current; canon is now `X:\4`. |
| `scripts/*smoke*.mjs`, `scripts/auth-avatar-login-diagnose.mjs` | top browser candidate blocks | Removed hardcoded browser executable paths from `Program Files`; scripts now use `CHROME_PATH` / `BROWSER_PATH` or browser commands resolved via PATH. |
| `scripts/run-bash-script.mjs` | 12-15 | Removed hardcoded Git Bash paths; script now uses `BASH_PATH` or `bash` from PATH. |

## Negative Path-Guard Test

Temporary staged fixture:

```text
scripts/path-guard-negative.fixture.txt: bad path C:\Users\test
```

Output:

```text
--- NEGATIVE RUN (expected failure) ---

> check:portable-paths
> node scripts/run-bash-script.mjs scripts/check-portable-paths.sh

scripts/path-guard-negative.fixture.txt:1:bad path C:\Users\test

Found forbidden absolute C-drive project paths in tracked files.
Use repo-relative paths or PATH-resolved tools instead.
NEGATIVE_EXIT=1
--- POSITIVE RUN (after cleanup) ---

> check:portable-paths
> node scripts/run-bash-script.mjs scripts/check-portable-paths.sh

Portable path check passed.
POSITIVE_EXIT=0
```

The fixture was unstaged and deleted after the negative test.

## Verification

```text
node scripts/check-cp1251-mojibake.mjs
CP1251 mojibake check passed: 0 suspicious tokens

npm run check:portable-paths
Portable path check passed.

git diff --check
passed
```

Local equivalent of `.github/workflows/path-guard.yml` passed:

```text
npm run check:portable-paths
node scripts/check-doc-encoding.mjs
npm run check:js-syntax
npm run build:css
npm run check:pages-script-assets
npm run check:ui-architecture
LOCAL_WORKFLOW_EQUIVALENT=PASS
```

## Worktree Prune

Ran `git worktree prune`. Four stale locked `initializing` registrations remained, so they were unlocked and pruned. Final `git worktree list`:

```text
X:/4/.tmp-4e-app-publish b4fe248 [feat/admin-tariff-api]
```

## CI Status

Local workflow-equivalent guard suite is green on the current tree. Remote GitHub Actions status is checked after push.

## Commit

This commit.