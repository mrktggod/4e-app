# REPORT-2026-07-29-public-docs-cleanup

Outcome: `DONE`

## Scope

Checked public `4e-app` for old project documentation outside `pm/inbox` and
`pm/outbox`, then compared candidates with private `4pm`
(`X:\Projects\4-ai-secretary\docs-private`) on branch `feat/admin-tariff-api`.

No git history rewrite was performed. Removing files in this commit only removes
them from the current public tree; old commits can still contain them.

## Removed From Public

Removed 68 tracked `docs/tasks/*.md` files from public `4e-app`.

Verification before removal:

- each removed file had an exact tracked counterpart at the same path in
  private `4pm`;
- each removed file had the same `git hash-object` value in public and private;
- files under `pm/inbox` and `pm/outbox` were intentionally left in public.

## Not Removed

No public `pm/backlog.md` or `shared/ROADMAP.md` is currently tracked in
`4e-app`.

Left these public files in place because no tracked private counterpart was
found at the same path:

- `docs/tasks/LANDING-001-sales-site-plan.md`
- `docs/tasks/MISHA-PRODUCT-LISTS-STATUS-2026-07-27.md`
- `docs/tasks/NIGHT-QUEUE-READINESS-2026-07-27.md`
- `docs/tasks/NIGHT-SESSION-ANALYSIS-2026-07-27.md`
- `pm/design-system-glass-inventory-2026-07-27.md`

Also left root/project operational files in place because they are not exact
duplicates in `4pm` and some already had unrelated local modifications:

- `AGENTS.md`, `CLAUDE.md`, `CODEX_INSTRUCTIONS.md`, `COWORK_INSTRUCTIONS.md`
- `DEVELOPMENT_LOG.md`
- `FILE_MAP*.md`
- `README.md`
- `autotests/README.md`

## Verification

- `git ls-files "*.md" "*.txt" "*.rst" "*.adoc" ":!pm/inbox/**" ":!pm/outbox/**"`
- `git hash-object` comparison for public/private `docs/tasks/*.md`
- `node scripts/check-cp1251-mojibake.mjs`
- `git diff --check`
