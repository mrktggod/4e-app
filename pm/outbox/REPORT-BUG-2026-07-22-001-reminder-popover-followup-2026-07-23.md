# REPORT-BUG-2026-07-22-001-reminder-popover-followup-2026-07-23

status: DONE

## User Evidence

Alexey tested exact isolated preview source `5b9714c` on iPhone:

- Focus panel: PASS, `Фокус ок`.
- Reminder: FAIL. The trigger worked only in light theme; the popup showed roughly two characters per line and taps on the second option passed through to content underneath.

## Root Cause

- `styles/screens/tasks.less`: the late `.detail-redesign-tags button` selector applied the circular 44x44 action-button rule to every nested reminder option, collapsing each option from the 140px popup content width to 44px.
- `styles/screens/tasks.less`: `.detail-redesign-tags` kept `overflow:hidden`; the absolutely positioned popup extended below the 44px tag row but was not eligible for hit-testing there.
- `styles/screens/light-redesign.less`: a theme override reduced `.detail-redesign-bell` to 38x38.
- The original smoke used programmatic `.click()` in one theme and therefore did not inspect coordinate hit ownership or the collapsed option geometry.

## Changed Files

- `styles/screens/tasks.less`
- `styles/screens/light-redesign.less`
- `styles.css`
- `styles.min.css`
- `scripts/back-067-task-detail-reminder-smoke.mjs`
- `FILE_MAP.md`
- `pm/bugs.md`
- `pm/backlog.md`
- `pm/qa-results-2026-07-17.md`
- `shared/ROADMAP.md`
- `pm/team-sync.md`
- `shared/WORK_LOG.md`
- `DEVELOPMENT_LOG.md`
- this report

## Fix

- Circular action sizing now targets direct tag-row action buttons only.
- Reminder options explicitly keep full popup width, 44px height, horizontal text and touch manipulation.
- The open reminder state raises the tag row and enables visible overflow so options own their hit area above hero content.
- Light theme reminder trigger is restored to 44x44.
- The regression smoke runs dark and light passes and verifies trigger size, option geometry, horizontal text, `elementFromPoint` ownership, selection and close behavior.

## Raw Proof

```text
npm run smoke:back067-reminder

dark:
trigger = 44x44
options = 4 x 140x44
all option hit checks = true
selected = 1hour

light:
trigger = 44x44
options = 4 x 140x44
all option hit checks = true
selected = 15min
```

## Re-QA

Stable isolated preview:

`https://qa-reminder-popover.4-ai-staging.pages.dev/`

1. Test dark theme first.
2. Open a task and tap the bell.
3. Select `За 1 час`.
4. Confirm text stays horizontal and the task underneath does not react.
5. Repeat in light theme.
6. Reopen the task and verify the selected reminder remains.

## Acceptance

Alexey, 2026-07-23:

- desktop: PASS;
- iPhone: PASS;
- dark theme: PASS;
- light theme: PASS;
- popup displays normally and options are tappable;
- the selected reminder persists and remains highlighted when the popup is reopened.

The P1 interaction bug is closed. A separate non-blocking UX tail was registered as `BUG-2026-07-23-001` / `BACK-070`: the closed bell does not visibly show that a reminder is active.

## Boundaries

No Worker, notification delivery, payment, entitlement, auth-security, production, shared staging alias, or `main` change. Real Telegram delivery/sound/vibration remains a separate NEED-YURI/manual gate after this UI control passes.

## Commit

This task commit on `fix/reminder-popover-mobile`.
