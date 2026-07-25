status: DONE

# Docs Tree Consolidation - 2026-07-25

## Result

Consolidated the legacy documentation tree into the canonical app checkout under `docs/archive/2026-06-pre-beta/`.

No legacy source files were deleted.

## Scope

- Source file count before copy: 69 files.
- Archived file count after copy, before archive README: 69 files.
- Added archive README: `docs/archive/2026-06-pre-beta/README.md`.
- Updated index: `FILE_MAP.md`.

## Current vs Archived Decisions

| File | Decision | Reason |
| --- | --- | --- |
| `PRODUCT_ROADMAP.md` | Archived only | It is dated 2026-06-18 and duplicates the current canonical roadmap rule in `shared/ROADMAP.md`: there must be one product roadmap. The archive README points readers to `shared/ROADMAP.md`. |
| `SECRETS_INVENTORY.md` | Archived only; `NEED-YURI` for current replacement decision | It is dated June 2026 and contains operational statuses that appear stale after July payment/security work. Because secrets/payment status is sensitive, I did not promote or rewrite it without Yuri. |
| `DEVELOPMENT_HISTORY.md` | Archived only | Current canonical development history lives in `shared/DEVELOPMENT_HISTORY.md`; legacy file is historical context. |
| `MIMO_*` | Archived only | June-era integration/activity notes; no evidence that these are current operating docs. |
| `BETA_ROADMAP.md`, `TECHNICAL_AUDIT.md`, `KV_TO_D1_MIGRATION_PLAN.md`, `BETA_ARCHITECTURE.md` | Archived only | Legacy pre-beta planning/audit docs; current work is tracked in `shared/ROADMAP.md`, `pm/backlog.md`, `pm/bugs.md`, and `docs/tasks/`. |
| `tasks/CODEX-001..058` | Archived only | Legacy task namespace. Current canonical tasks use `docs/tasks/`, `pm/inbox/`, and BACK/brief identifiers. |

## Link/Map Updates

- `FILE_MAP.md` now includes `docs/archive/2026-06-pre-beta/` as the preserved June pre-beta archive.
- No current script or workflow references to the legacy docs path were found.

## Required Checks

Before copy:

```text
CP1251 mojibake check passed: 0 suspicious tokens
```

After copy:

```text
CP1251 mojibake check passed: 0 suspicious tokens
```

Path reference check:

```text
rg -n "legacy docs absolute path patterns" scripts .github FILE_MAP.md
exit code: 1, no matches
```

## NEED-YURI

- Decide whether to create a new current secrets/config inventory. The archived June `SECRETS_INVENTORY.md` should not be treated as current without Yuri review.
