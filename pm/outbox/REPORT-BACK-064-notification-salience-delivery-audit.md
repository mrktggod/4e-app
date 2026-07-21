# REPORT - BACK-064 notification salience and delivery audit

**Status:** NEED-YURI
**Date:** 2026-07-22
**Branch:** `feat/admin-tariff-api`

## Task

Classify and advance `BACK-064`: notifications should reliably fire, be visible, and provide sound/vibration where the platform allows.

## Decision

No runtime code was changed in the autonomous runner. This task is Yuri-only for now because its Definition of Done requires:

- real Telegram / phone / TMA delivery smoke;
- proof that the notification reaches the intended user;
- sound and vibration result on an actual device;
- foreground salience proof: badge, unread state, and fresh notification card;
- raw staging evidence before choosing a narrow fix.

## Evidence Reviewed

- `docs/tasks/BACK-064-notification-salience-delivery-audit.md`: acceptance criteria require real staging smoke for reminder/deadline and morning briefing plus mobile sound/vibration.
- `pm/backlog.md`: `BACK-064` is P1 notification delivery/salience work tied to `BACK-017`.
- `pm/bugs.md`: `BUG-2026-07-21-006` is based on Alexey's report that notifications are hard to notice and sometimes do not fire.

## Changed Files

- `docs/tasks/BACK-064-notification-salience-delivery-audit.md`
- `pm/backlog.md`
- `pm/bugs.md`
- `pm/team-sync.md`
- `shared/WORK_LOG.md`
- `DEVELOPMENT_LOG.md`
- `pm/outbox/REPORT-BACK-064-notification-salience-delivery-audit.md`

## Raw Proof

Autonomous guardrail classification: live Telegram/TMA/device notification delivery, sound, and vibration are not source-verifiable in this runner. No production deploy, no `main` merge, no payment, no entitlement, no CAL, no secrets.

## Next Step

Yuri/Alexey should run a staging phone/TMA notification smoke window and capture raw evidence. If delivery fails, create a backend delivery bug with route/log evidence. If delivery works but the signal is not visible enough, create a narrow UI/haptic fix brief.
