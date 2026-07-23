status: DONE

# REPORT-BRIEF-2026-07-22-32-task-tag-popup-ios

## Result

Fixed the task-detail tag editor as a narrow mobile-first UI change. The tag input no longer uses native `<datalist>` suggestions; it now renders app-owned suggestion buttons inside `div#detail-tag-options`, has a visible `Отмена` action, supports outside-click close, Escape close, and focus restoration to the tag toggle.

## Root Cause

- `index.html:464`: `input#detail-tag-input` used `list="detail-tag-options"` and a native `<datalist>`, which iOS/TMA renders outside app layout control.
- `index.html:5921`: the previous `toggleTagInput()` depended on inline `style.display`, so a CSS-hidden panel was fragile.
- `styles/screens/tasks.less:1449`: the absolute tag editor lacked controlled suggestion layout and explicit close affordance.

## Changed Files

- `index.html`
- `scripts/platform-adapter.js`
- `styles/screens/tasks.less`
- `styles.css`
- `styles.min.css`
- `package.json`
- `scripts/back-068-task-detail-tag-popup-smoke.mjs`
- `FILE_MAP.md`
- `pm/inbox/BRIEF-2026-07-22-32-task-tag-popup-ios.md`
- `pm/bugs.md`
- `pm/backlog.md`

## Raw Proof

```text
До правки: 111 совпадений
После правки: 111 совпадений

npm run smoke:back068-tag-popup
{
  "smoke": "back068-tag-popup",
  "ok": true,
  "failures": [],
  "viewport": { "width": 390, "height": 844 },
  "openRect": { "left": 25, "right": 389, "height": 226 },
  "tags": ["Дом"]
}
```

## Tests

- `npm run build:css`
- `node scripts/check-cp1251-mojibake.mjs`
- `git diff --check`
- `node --check scripts/back-068-task-detail-tag-popup-smoke.mjs`
- `npm run smoke:back068-tag-popup`

## Boundaries

No broad redesign or shared glass-system rewrite, no production deploy, no merge into `main`, no CAL, no payment or entitlement work, no auth-security changes, and no secrets touched.

## Commit

Pending in this task commit.

## Follow-Up

Run real iPhone/TMA keyboard smoke for tag add/cancel. `BUG-2026-07-22-003` remains a separate task-detail hero overflow fix.
