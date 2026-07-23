status: DONE

# REPORT-BRIEF-2026-07-22-33-task-detail-hero-overflow-ios

## Result

Fixed the task-detail hero overflow as a narrow CSS/layout change. The final mobile hero guard removes the effective fixed-height/absolute-coordinate conflict for title and description, returns them to normal flow, keeps right-side date/priority cards reserved by padding, and forces long top tags into one compact ellipsis line.

## Root Cause

- `styles/screens/tasks.less:2513`: late QA override made `.detail-redesign-title` absolute at fixed coordinates.
- `styles/screens/tasks.less:2561`: later override capped `.detail-redesign-hero` at fixed `330px` height.
- `styles/screens/tasks.less:2102`: earlier tag overflow rules still allowed aggressive wrapping through descendant word-break overrides.

## Changed Files

- `styles/screens/tasks.less`
- `styles.css`
- `styles.min.css`
- `package.json`
- `scripts/back-069-task-detail-hero-overflow-smoke.mjs`
- `FILE_MAP.md`
- `pm/inbox/BRIEF-2026-07-22-33-task-detail-hero-overflow-ios.md`
- `pm/bugs.md`
- `pm/backlog.md`

## Raw Proof

```text
До правки: 111 совпадений
После правки: 111 совпадений

npm run smoke:back069-hero
{
  "smoke": "back069-hero-overflow",
  "ok": true,
  "failures": [],
  "viewport": { "width": 390, "height": 844 },
  "hero": { "height": 330, "bottom": 412 },
  "tag": { "width": 136, "height": 30, "whiteSpace": "nowrap" },
  "title": { "position": "static", "height": 87 }
}
```

## Tests

- `npm run build:css`
- `node scripts/check-cp1251-mojibake.mjs`
- `node --check scripts/back-069-task-detail-hero-overflow-smoke.mjs`
- `npm run smoke:back069-hero`
- `git diff --check`

## Boundaries

No broad redesign architecture or liquid-glass migration, no production deploy, no merge into `main`, no CAL, no payment or entitlement work, no auth-security changes, and no secrets touched.

## Commit

Pending in this task commit.

## Follow-Up

Run real iPhone/TMA visual smoke for task detail with a long tag/title and keyboard closed/open as applicable.
