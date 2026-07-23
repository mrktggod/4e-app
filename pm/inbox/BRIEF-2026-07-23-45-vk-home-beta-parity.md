status: NEW

# BRIEF-2026-07-23-45 - VK-HOME-PARITY-001 beta home parity

## Goal

Make the VK home/dashboard feel like the same beta product as Telegram/browser without starting a broad redesign.

## Context

`pm/vk-parity-plan-2026-07-23.md` marks VK home/dashboard as `LAGGING`: Telegram/browser has richer focus, metrics, top-3, and summary overlay; VK has a simplified focus card, metrics, and task list.

This is a beta-readiness parity task, not the global glass redesign.

## Task

Implement the smallest safe VK home parity slice:

- focus summary / "what matters today" metadata if the data already exists;
- top-priority task metadata parity where it is already available locally;
- no new backend endpoints unless already implemented and documented;
- no broad visual redesign and no copy/promise changes that need product approval;
- add or update local VK smoke evidence.

If the task conflicts with `DESIGN-GLASS-001`, keep VK home stable and report the dependency instead of inventing the final glass style.

## Required Report

Write `pm/outbox/REPORT-2026-07-23-45-vk-home-beta-parity.md`.

Include changed files, file:line root cause, screenshots or DOM evidence if available, and manual tail for real VK Mini App smoke.

## Required Checks

- `node scripts/check-cp1251-mojibake.mjs`
- relevant VK smoke / Playwright command
- `git diff --check`

If CSS/LESS or app HTML changes are made, run build/smoke guards and preserve UTF-8.

## Stop Points

No production deploy, no merge into `main`, no VK Pay, no prices, no payments, no entitlement changes, no secrets, no CAL, no live VK account/device actions, no broad cross-screen redesign.

## Expected Outcome

`DONE` for a narrow local VK home beta parity improvement with green evidence.
