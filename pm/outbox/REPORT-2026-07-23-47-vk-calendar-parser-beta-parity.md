# REPORT-2026-07-23-47 - VK calendar parser beta parity

## Outcome

DONE.

Implemented a narrow frontend-only VK calendar date-key fix and fixture. VK task deadlines are normalized to local `YYYY-MM-DD` keys before home sorting, overdue checks, detail date input, calendar day dots, and selected-day task lists. No external calendar, CAL product work, provider integration, payment, entitlement, secrets, production deploy, or live VK actions were touched.

## Root Cause

- `vk.html:1861` built calendar cell keys with `toISOString()`, which shifted dates under local timezones.
- `vk.html:1869` previously matched selected-day tasks with exact `deadline === dateStr`, so ISO datetime deadlines such as `2026-08-15T23:30:00-05:00` missed the intended day.

## Changed Files

- `vk.html` - added `localDateKey()` and `taskDeadlineDateKey()`, then routed task display, parser output, detail date input and calendar grouping through normalized local date keys.
- `scripts/vk-calendar-date-key-smoke.mjs` - added ISO datetime/local date fixture for calendar day dots and selected-day task list.
- `package.json` - added `npm run smoke:vk-calendar-date-key`.
- `FILE_MAP.md`, `FILE_MAP_UI.md` - updated line counts and VK calendar/date-key ranges.
- `pm/inbox/BRIEF-2026-07-23-47-vk-calendar-parser-beta-parity.md` - marked `DONE`.
- `pm/backlog.md` - marked `VK-CALENDAR-001` `Done` and narrowed remaining VK parity gaps.
- `shared/WORK_LOG.md`, `DEVELOPMENT_LOG.md` - recorded the task.

## Evidence

`npm run smoke:vk-calendar-date-key`

```text
VK calendar date-key smoke: PASS
```

Fixture evidence:

```text
taskDeadlineDateKey('2026-08-15T23:30:00-05:00') = 2026-08-15
taskDeadlineDateKey('2026-08-16T00:30:00+03:00') = 2026-08-16
calendar marks 2026-08-15, 2026-08-16 and 2026-08-20 with has-task
showDayTasks('2026-08-15') includes only the 2026-08-15 task
showDayTasks('2026-08-16') includes the 2026-08-16 task
```

`npm run test:e2e:vk`

```text
2 passed
```

`node scripts/check-cp1251-mojibake.mjs`

```text
CP1251 mojibake check passed: 0 suspicious tokens
```

`npm run check:ui-architecture`

```text
inline style attributes = 299 / 465
inline event handlers = 401 / 402
style tags = 0 / 0
inline script tags = 3 / 3
```

`npm run check:portable-paths`

```text
Portable path check passed.
```

`git diff --check`

```text
exit code 0
```

## Manual Tail

NEEDS-REAL: live VK Mini App calendar smoke remains Yuri-only. This was a local frontend parser/grouping fixture, not CAL work or provider integration.
