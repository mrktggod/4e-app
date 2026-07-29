# REPORT-BRIEF-2026-07-29-101-home-show-all-bottom-nav-regression

Status: DONE

## Root cause

`styles/screens/home.less` forced `#home-show-all-btn` to `display: none !important`, so the JS inline `style.display = 'flex'` could not reveal the button when active tasks exceeded the visible dashboard rows.

The light dashboard cascade also hid the same button with `display: none !important`, `visibility: hidden !important`, and `pointer-events: none !important`. The task list used the smaller light bottom reserve, which left the third top row visually crowded near the fixed dashboard controls.

## Changed files

- `styles/screens/home.less`
- `styles/screens/light-redesign.less`
- `styles.css`
- `styles.min.css`
- `docs/tasks/assets/BRIEF-2026-07-29-101-home-dashboard-after-dark.png`
- `docs/tasks/assets/BRIEF-2026-07-29-101-home-dashboard-after-light.png`
- `pm/inbox/BRIEF-2026-07-29-101-home-show-all-bottom-nav-regression.md`
- `pm/outbox/REPORT-BRIEF-2026-07-29-101-home-show-all-bottom-nav-regression.md`

## What changed

- Removed the forced `display: none !important` rule from the base home styles so JS controls show-all visibility.
- Removed the light-theme forced hide for `#home-show-all-btn`; the light override now only sets readable text color.
- Matched the light task-list bottom reserve to the shared dashboard reserve above the show-all button.
- Reduced only dashboard priority-row height from 78px to 72px and list gap from 14px to 8px so all three top rows fit above the show-all button and bottom navigation.
- Preserved existing task-card click/swipe behavior and did not touch VK.

## Before proof

Used the current QA report referenced by the brief:

- `pm/outbox/REPORT-QA-2026-07-29-playwright-k6-surfaces.md`

The report/brief recorded failing `npm run smoke:home001` and `npm run smoke:telegram-dashboard-one-task`, with `home-show-all-btn` hidden and dark dashboard rows crowded behind fixed controls.

## After proof

Commands:

```text
npm run build:css
npm run smoke:home001
npm run smoke:telegram-dashboard-one-task
npm run smoke:iphone14-responsive
node scripts/check-cp1251-mojibake.mjs
node scripts/check-js-syntax.mjs
npm run check:portable-paths
npm run check:ui-architecture
PowerShell equivalent for scripts/check-portable-paths.sh
PowerShell equivalent for scripts/check-ui-architecture.sh
git diff --check -- changed 101 files
```

Results:

- `npm run smoke:home001`: PASS.
- `npm run smoke:telegram-dashboard-one-task`: PASS for both `web` and `telegram`; both surfaces returned `dashboardRows: 3` and `showAllDisplay: "flex"`.
- `npm run smoke:iphone14-responsive`: PASS.
- `node scripts/check-cp1251-mojibake.mjs`: PASS, exit code 0.
- `node scripts/check-js-syntax.mjs`: PASS; no staged JS or HTML files.
- `npm run check:portable-paths`: environment fail, `spawnSync bash ENOENT`.
- `npm run check:ui-architecture`: environment fail, `spawnSync bash ENOENT`.
- PowerShell portable-path equivalent: PASS.
- PowerShell UI-architecture equivalent: PASS, inline style attributes `284 / 465`, inline event handlers `401 / 402`, style tags `0 / 0`, inline script tags `3 / 3`.
- `git diff --check`: PASS for changed 101 files.

Key raw `smoke:home001` metrics:

```json
{
  "homeRows": 3,
  "showAllDisplay": "flex",
  "bottomNavButtons": 3,
  "homeTaskList": { "top": 416, "bottom": 664, "height": 248 },
  "bottomNav": { "top": 724, "bottom": 836, "height": 112 },
  "firstRow": { "height": 72 },
  "light": { "rows": 3, "showAllDisplay": "flex" }
}
```

Screenshots:

- `docs/tasks/assets/BRIEF-2026-07-29-101-home-dashboard-after-dark.png`
- `docs/tasks/assets/BRIEF-2026-07-29-101-home-dashboard-after-light.png`

## Review-agent result

PASS. The review agent verified:

- show-all visible only when the fixture has more active tasks than three visible dashboard rows;
- all top-3 rows clear of the bottom navigation;
- no unrelated surface changes.

Raw review summary: both dark and light after screenshots show `Смотреть все задачи` below the third row; all three rows sit above the show-all button and bottom navigation; no obvious unrelated surface changed.

## Honest tails

No live Telegram Mini App/device QA was run. The Telegram evidence is mocked local Playwright diagnostics only.
