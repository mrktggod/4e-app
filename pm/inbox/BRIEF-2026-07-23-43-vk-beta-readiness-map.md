status: NEW

# BRIEF-2026-07-23-43 - VK-BETA-READINESS-001 beta readiness map

## Goal

Make VK beta readiness explicit for the night runner: VK must be a working beta surface, not just a hosted shell.

## Context

Current source of truth:

- `pm/vk-parity-plan-2026-07-23.md`
- `pm/backlog.md` item `BACK-066`
- `shared/ROADMAP.md` Horizon 0.5 / 0.8

Known blockers and gaps:

- VK auth/session and VK AI-chat are gray-zone and need Claude/Yuri-reviewed scope before code changes.
- VK task detail, home parity, calendar parser, and profile IA are narrower safe frontend/test candidates if they avoid payments, entitlement, secrets, production deploy, and live VK accounts.
- Live VK Mini App/device smoke remains Yuri-only.

## Task

Produce a compact beta-readiness checklist and one report that tells the rest of the night session exactly what to do next.

Allowed autonomous work:

- Update docs/PM only if the current plan is ambiguous.
- Confirm which VK briefs are safe `DONE` candidates and which must be `NEED-CLAUDE` / `NEED-YURI`.
- Do not touch runtime code in this brief.

## Required Report

Write `pm/outbox/REPORT-2026-07-23-43-vk-beta-readiness-map.md` with:

- VK beta blockers in priority order.
- Which next brief filenames exist and why they are ordered that way.
- Manual tails that remain for Yuri.
- Raw evidence from local files and commands.

## Stop Points

No production deploy, no merge into `main`, no VK Pay, no prices, no payments, no entitlement changes, no secrets, no CAL, no live VK account/device actions.

## Expected Outcome

`DONE` if the beta-readiness queue is clear and actionable.
