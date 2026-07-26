# REPORT-BRIEF-2026-07-25-73-task-detail-glass-layout-restore

Status: DONE

## What Was Done

Restored the task-detail screen order so the status and participants panels render above the main task card, then the main card shows date and priority controls in a normal row before the title and description.

The title and description now use the card width instead of being squeezed into the old narrow right-meta layout.

## Where To Check

- Open task detail on a 390x844 viewport.
- Check that participants/status panels are above the main task card.
- Check that the task title and description do not overlap the date/priority cards.

## Changed Files

- `styles/screens/tasks.less`
- `styles.css`
- `styles.min.css`
- `pm/inbox/BRIEF-2026-07-25-73-task-detail-glass-layout-restore.md`
- `pm/outbox/REPORT-BRIEF-2026-07-25-73-task-detail-glass-layout-restore.md`

## Evidence

- `node scripts/check-cp1251-mojibake.mjs` passed: `CP1251 mojibake check passed: 0 suspicious tokens`.
- `npm run smoke:back069-hero` passed with an explicit local `CHROME_PATH`.
- 390x844 metrics from smoke: `statusGrid.top=82`, `heroTop=249`, `hero.height=416`, `title.width=332`, `document overflow ok`.
- Desktop metrics from smoke: `viewportWidth=1024`, `scrollWidth=1024`, `titleWidth=396`, `statusTop=82`, `heroTop=249`.
- Screenshots refreshed by smoke:
  - `docs/tasks/assets/BACK-069-task-detail-glass-2026-07-24-light.png`
  - `docs/tasks/assets/BACK-069-task-detail-glass-2026-07-24-dark.png`
- `npm run check:js-syntax` passed.
- `npm run check:portable-paths` passed after adding Git Bash to PATH for the command.
- `npm run check:ui-architecture` passed after adding Git Bash to PATH for the command.

## Notes

The first smoke attempt failed before opening the app because Chrome was not available in PATH for this PowerShell session. Re-running with explicit local `CHROME_PATH` passed.
