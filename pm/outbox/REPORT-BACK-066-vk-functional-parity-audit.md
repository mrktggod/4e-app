# REPORT - BACK-066 VK functional parity audit

**Status:** DONE
**Date:** 2026-07-22
**Branch:** `feat/admin-tariff-api`

## Task

Complete the first safe BACK-066 step: source parity audit for `index.html` vs `vk.html`, without VK Pay/payment work or large ARCH-001 refactor.

## Result

Added `docs/tasks/BACK-066-vk-functional-parity-audit-2026-07-22.md` with a parity table, source anchors, P1 holes, and recommended narrow follow-up briefs.

## Changed Files

- `docs/tasks/BACK-066-vk-functional-parity-audit-2026-07-22.md`
- `docs/tasks/BACK-066-vk-stable-line-functional-parity.md`
- `pm/backlog.md`
- `pm/qa-checklist.md`
- `pm/team-sync.md`
- `shared/WORK_LOG.md`
- `DEVELOPMENT_LOG.md`
- `pm/outbox/REPORT-BACK-066-vk-functional-parity-audit.md`

## Raw Source Evidence

- `vk.html:1337` task intent detection and `vk.html:1355` deadline detection use JS word-boundary patterns around Cyrillic text; this is likely the same failure class found and fixed for main app BACK-065.
- `vk.html:1426` task detail renders title/meta/status/description and local discussion, but no server-backed edit fields.
- `vk.html:1508` AI chat uses local history and simple task command saving; main app `index.html:6358` and `index.html:6652` have richer normalized create-task/action handling.
- `vk.html:1562` calendar only marks exact ISO deadlines; main app `index.html:6871` has a richer deadline list path.

## Tails

`NEEDS-REAL`: mobile VK/browser shell smoke is still required. Recommended next work is separate small fix briefs `BACK-066A..E`, not a broad `vk.html` rewrite.
