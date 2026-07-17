# SMART-012 — adaptive reminders plan

Status: product/tech decision, 2026-07-16.

## Current state

Already implemented:

- adaptive briefing time based on local user activity;
- activity signals: task create, AI chat, task done, notifications;
- suggested briefing window saved as `briefingTime`;
- current status remains `Partial Done` because ordinary task reminders do not yet use adaptive scheduling.

## Decision

Do not expand adaptive scheduling before beta.

Reason:

- reminder timing can be annoying if wrong;
- beta should first prove users value daily focus and reminders at all;
- bad notification timing damages trust faster than missing smartness.

## What adaptive reminders should mean

Adaptive reminders should not be "AI randomly chooses a time".

They should use explicit signals:

- user's active hours;
- history of completed tasks;
- snooze/ignore patterns;
- task urgency/deadline;
- quiet hours;
- channel constraints.

## MVP after beta

Phase 1:

- keep user-selected reminder time as primary;
- suggest a better time only after enough local evidence;
- show copy: `4 заметил, что ты чаще закрываешь задачи около 10:00. Перенести напоминания?`;
- require user confirmation.

Phase 2:

- per-task adaptive suggestions;
- avoid quiet hours;
- use `+1 hour` / snooze history.

Phase 3:

- channel-aware delivery: Telegram, web/PWA push, native push later.

## Non-goals

- hidden automatic rescheduling;
- changing reminders without user confirmation;
- using sensitive calendar/location data before consent;
- sending more notifications just because model is confident.

## Definition of Done

`SMART-012` can become `Done` when:

- adaptive briefing remains stable;
- task reminders have an adaptive suggestion path;
- user confirms suggested reminder changes;
- quiet hours are respected;
- manual smoke proves reminders are helpful, not noisy.
