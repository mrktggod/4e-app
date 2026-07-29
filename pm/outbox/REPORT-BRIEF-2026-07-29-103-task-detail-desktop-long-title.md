# REPORT-BRIEF-2026-07-29-103-task-detail-desktop-long-title

Status: DONE

## Root cause

The late light task-detail cascade removed `max-height` and `-webkit-line-clamp` from `.detail-redesign-title` for all viewport sizes. That mobile-friendly override also affected desktop/tablet, so the long title could expand to `200px` height and look like a tall narrow column.

## Changed files

- `styles/screens/light-redesign.less`
- `styles.css`
- `styles.min.css`
- `docs/tasks/assets/BRIEF-2026-07-29-103-task-detail-after-light.png`
- `docs/tasks/assets/BRIEF-2026-07-29-103-task-detail-after-dark.png`
- `docs/tasks/assets/BRIEF-2026-07-29-103-task-detail-after-desktop-light.png`
- `pm/inbox/BRIEF-2026-07-29-103-task-detail-desktop-long-title.md`
- `pm/outbox/REPORT-BRIEF-2026-07-29-103-task-detail-desktop-long-title.md`

## What changed

Added a desktop/tablet-only light-theme override:

- `@media (min-width: 768px)`
- target: `html[data-theme="light"] #task-detail .detail-redesign-title`
- restores 3-line clamp, `max-height: 3.3em`, and hidden overflow.

Mobile remains on the existing readable flow. No JS, data, payment, entitlement, auth, or `/anthropic` behavior changed.

## Before proof

Command:

```text
CHROME_PATH=<Playwright Chromium> npm run smoke:back069-hero
```

Before result:

```text
Error: desktop title appears vertically wrapped: 200px
```

## After proof

Commands:

```text
npm run build:css
CHROME_PATH=<Playwright Chromium 1228> npm run smoke:back069-hero
CHROME_PATH=<Playwright Chromium 1228> npm run smoke:back067-reminder
CHROME_PATH=<Playwright Chromium 1228> npm run smoke:back068-tag-popup
npm run smoke:iphone14-responsive
node scripts/check-cp1251-mojibake.mjs
node scripts/check-js-syntax.mjs
PowerShell equivalent for scripts/check-portable-paths.sh
PowerShell equivalent for scripts/check-ui-architecture.sh
git diff --check -- changed 103 files
```

Results:

- `npm run smoke:back069-hero`: PASS.
- `back069` desktop metrics: `titleWidth: 372`, `titleHeight: 99`, `scrollWidth: 1024`, `viewportWidth: 1024`.
- `npm run smoke:back067-reminder`: PASS.
- `npm run smoke:back068-tag-popup`: PASS.
- `npm run smoke:iphone14-responsive`: PASS.
- `node scripts/check-cp1251-mojibake.mjs`: PASS, exit code 0.
- `node scripts/check-js-syntax.mjs`: PASS; no staged JS or HTML files.
- PowerShell portable-path equivalent: PASS.
- PowerShell UI-architecture equivalent: PASS, inline style attributes `284 / 465`, inline event handlers `401 / 402`, style tags `0 / 0`, inline script tags `3 / 3`.
- `git diff --check`: PASS for changed 103 files.

Notes:

- Chromium `1234` hit a transient `CDP timeout: Page.captureScreenshot`.
- Chromium `1228` completed the same smoke successfully.

## Screenshots

- `docs/tasks/assets/BRIEF-2026-07-29-103-task-detail-after-light.png`
- `docs/tasks/assets/BRIEF-2026-07-29-103-task-detail-after-dark.png`
- `docs/tasks/assets/BRIEF-2026-07-29-103-task-detail-after-desktop-light.png`

The existing dirty `BACK-069-task-detail-glass-2026-07-24-*.png` files were restored after smoke runs and were not included in this task.

## Review-agent result

PASS. The review agent inspected mobile light, mobile dark, and desktop light screenshots. It confirmed title, description, tags, date/priority, and action card are separated with no overlap; desktop title uses a normal readable width and is no longer a tall narrow vertical column.

## Honest tails

No live device QA was run. Evidence is local Chrome/Playwright geometry plus screenshots.
