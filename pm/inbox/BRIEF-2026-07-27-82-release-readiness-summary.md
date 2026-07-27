status: NEW

# BRIEF-2026-07-27-82-release-readiness-summary

## Context

`feat/admin-tariff-api` is ~134+ commits ahead of `main` (last prod release 2026-07-21, `57ae1b4`). Yuri wants to release faster and stop losing fixes in the branch. This brief is preparation only — it does not merge or deploy anything.

## Task

Produce a plain-language list (per `AGENTS.md` → "Как писать отчёты для Юрия") of everything currently `Ready for QA` / `Done` in `pm/bugs.md` and `pm/backlog.md` (private repo `mrktggod/4pm`) on this branch, grouped by area (task cards, dashboard, calendar, voice, VK, auth, other). For each group, one short line: what changed, in plain terms. This is so Yuri can read it in a few minutes and give a one-word go/no-go for merging to `main` and releasing (both Pages and Worker now deploy together automatically once merged — see `deploy-worker-assets.yml`).

Flag anything in the Ready-for-QA list that is NOT actually safe to ship yet (e.g. depends on a Yuri decision still pending, like `VK-TASK-SWIPE-001`) — call those out separately as "not part of this release."

## Stop Points

- Do not merge to `main`. Do not deploy production. This is a summary document only, for Yuri to read and decide.

## Verification

- The summary is self-contained and grouped, not a raw dump of every backlog line.

## Report

`pm/outbox/REPORT-2026-07-27-82-release-readiness-summary.md` — the summary itself, plus one line at the top: "waiting on Yuri's go/no-go before merge."
