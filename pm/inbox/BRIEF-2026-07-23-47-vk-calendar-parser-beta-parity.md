status: DONE

# BRIEF-2026-07-23-47 - VK-CALENDAR-001 beta calendar parser parity

## Goal

Reduce VK calendar beta risk by aligning date parsing/timezone behavior with the main app where this can be done locally.

## Context

`pm/vk-parity-plan-2026-07-23.md` marks VK calendar as `LAGGING`: Telegram/browser has a shared parser and richer lists; VK has a simpler month grid and exact-date equality.

This is not CAL work. It must not start calendar product expansion.

## Task

Add or improve a safe VK calendar parser/date fixture:

- shared or equivalent date parsing for task due dates if already present in frontend code;
- timezone/local-date regression fixture for VK task grouping;
- local smoke evidence that tasks land on the expected day;
- no external calendar, no CAL-002/CAL-003, no new provider integration.

If the task starts to become calendar architecture/product work, stop with `NEED-YURI`.

## Required Report

Write `pm/outbox/REPORT-2026-07-23-47-vk-calendar-parser-beta-parity.md`.

Include changed files, file:line root cause, test output, and manual tail.

## Required Checks

- `node scripts/check-cp1251-mojibake.mjs`
- relevant VK/calendar smoke command
- `git diff --check`

If CSS/LESS or app HTML changes are made, run build/smoke guards and preserve UTF-8.

## Stop Points

No production deploy, no merge into `main`, no CAL product work, no external calendar provider, no VK Pay, no prices, no payments, no entitlement changes, no secrets, no live VK account/device actions.

## Expected Outcome

`DONE` for local date/parser evidence or a narrow frontend parser fix.
