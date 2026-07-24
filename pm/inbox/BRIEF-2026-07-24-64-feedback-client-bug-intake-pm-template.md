status: NEW
# BRIEF-2026-07-24-64-feedback-client-bug-intake-pm-template

## Goal

Implement the app-repo side of `FEEDBACK-002`: PM templates and triage rules for client bug reports.

## Scope

- Add a client bug intake template under `pm/` or `docs/tasks/`.
- Update `pm/bugs.md` with `CLIENT-BUG-*`, `source: client`, `NEEDS-REPRO`, `CONFIRMED`, `STALE`, `DUPLICATE` rules.
- Add backlog/roadmap status for bot runtime implementation being separate because `mrktggod/4e-bot` is not locally connected.
- Do not implement bot runtime in this repo.

## Stop points

No bot token, no raw personal data, no production, no `main`, no secrets.

## Required proof

```bash
npm run check:cp1251-mojibake
npm run check:portable-paths
git diff --check
```

