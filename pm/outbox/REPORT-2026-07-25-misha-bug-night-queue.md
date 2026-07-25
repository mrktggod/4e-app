status: DONE

# Misha Bug Intake Night Queue - 2026-07-25

## Result

Converted 13 team/user bug reports into PM bug records and night-session briefs.

## Added Bugs

- `BUG-2026-07-25-008` - expired Premium task action shows generic save error.
- `BUG-2026-07-25-009` - expired Premium voice mode lacks clear paid gate.
- `BUG-2026-07-25-010` - voice consent checkbox is too subtle.
- `BUG-2026-07-25-011` - voice cancel/back cannot exit mode.
- `BUG-2026-07-25-012` - `недавно` contradicts `47 дней назад`.
- `BUG-2026-07-25-013` - home dashboard right edge is clipped.
- `BUG-2026-07-25-014` - AI chat lacks clear voice input entrypoint.
- `BUG-2026-07-25-015` - delete request mass-completed tasks.
- `BUG-2026-07-25-016` - Telegram group bot does not answer/capture tasks.
- `BUG-2026-07-25-017` - focus counters are inconsistent.
- `BUG-2026-07-25-018` - statistics empty state conflicts with home tasks.
- `BUG-2026-07-25-019` - calendar bottom task rows are visible but not clickable.
- `BUG-2026-07-25-020` - task detail glass layout regressed from agreed reference.

## Added Night Briefs

- `pm/inbox/BRIEF-2026-07-25-61-expired-premium-task-actions.md`
- `pm/inbox/BRIEF-2026-07-25-62-expired-premium-voice-gate.md`
- `pm/inbox/BRIEF-2026-07-25-63-voice-consent-checkbox-accessibility.md`
- `pm/inbox/BRIEF-2026-07-25-64-voice-exit-controls.md`
- `pm/inbox/BRIEF-2026-07-25-65-relative-time-copy.md`
- `pm/inbox/BRIEF-2026-07-25-66-dashboard-right-edge-overflow.md`
- `pm/inbox/BRIEF-2026-07-25-67-chat-voice-entrypoint.md`
- `pm/inbox/BRIEF-2026-07-25-68-ai-delete-intent-safety.md`
- `pm/inbox/BRIEF-2026-07-25-69-telegram-group-bot-capture.md`
- `pm/inbox/BRIEF-2026-07-25-70-focus-counters-consistency.md`
- `pm/inbox/BRIEF-2026-07-25-71-statistics-active-tasks-empty.md`
- `pm/inbox/BRIEF-2026-07-25-72-calendar-task-list-clickability.md`
- `pm/inbox/BRIEF-2026-07-25-73-task-detail-glass-layout-restore.md`

## Boundaries

No runtime code changed. No production deploy, `main` merge, CAL, price, payment, entitlement refactor, or secret action was performed.

Telegram group bot work is explicitly gated: if the local bot repo or live Telegram evidence is unavailable, the executor must report `NEED-CLAUDE` or `NEED-YURI`.
