status: DONE

# REPORT-HOME-001-dashboard-smoke-2026-07-20

## Task

Close the safe whitelist backlog item `HOME-001` by adding repeatable dashboard smoke evidence for the redesigned `Today` screen.

## Root cause

`pm/backlog.md:40` kept `HOME-001` in `Ready for QA` because the dashboard redesign still needed dark/light visual evidence and click-route coverage after the staging redesign cutover.

## Changed files

- `scripts/home-001-dashboard-smoke.mjs` - new headless Chrome/CDP smoke for the real local `index.html`.
- `package.json` - added `npm run smoke:home001`.
- `docs/tasks/HOME-001-dashboard-redesign.md` - added 2026-07-20 QA evidence and changed status to `Done`.
- `pm/backlog.md` - moved `HOME-001` to `Done`.
- `shared/ROADMAP.md` - recorded `HOME-001 Done` in the AI dashboard row.
- `docs/tasks/EVIDENCE-AUDIT-2026-07-17.md` - promoted `HOME-001` out of the manual-only list with headless evidence.
- `FILE_MAP.md` - added the new smoke script.
- `docs/tasks/assets/HOME-001-dashboard-smoke-2026-07-20-dark.png`
- `docs/tasks/assets/HOME-001-dashboard-smoke-2026-07-20-light.png`

## Raw proof

```text
npm run smoke:home001
ok=true
failures=[]
viewportWidth=390
documentScrollWidth=390
homeRows=3
metricCards=4
bottomNavButtons=3
focusCount=2
focusPanelRows=3
dark.theme=dark
dark.scrollWidth=390
light.theme=light
light.scrollWidth=390
```

Click routes verified: avatar -> profile, bell -> notifications, focus card -> focus overlay, done/active/promise/progress metrics -> statistics, center nav -> ask, calendar nav -> calendar.

Screenshots were saved under `docs/tasks/assets/HOME-001-dashboard-smoke-2026-07-20-*.png`.

## Guards

```text
node scripts/check-cp1251-mojibake.mjs
CP1251 mojibake check passed: 0 suspicious tokens

npm run check:js-syntax
JS syntax check: no staged JS or HTML files

node --check scripts/home-001-dashboard-smoke.mjs
exit 0

C:\Program Files\Git\bin\bash.exe scripts/check-ui-architecture.sh
UI architecture guard: inline style attributes = 366 / 465
UI architecture guard: inline event handlers = 387 / 402
UI architecture guard: style tags = 0 / 0
UI architecture guard: inline script tags = 3 / 3

C:\Program Files\Git\bin\bash.exe scripts/check-portable-paths.sh
Portable path check passed.
```

Note: plain `bash ...` is not available in this PowerShell PATH, so both shell guards were rerun through Git Bash absolute path.

## Commit

Pending before commit: `test(ui): add home dashboard smoke evidence`.

## Tails

`NEEDS-REAL`: none for `HOME-001` structure/routes after this smoke. This does not close separate TMA/device tasks such as `NEW-006`, `NEW-008`, `BACK-050`, Telegram auth fallback, OAuth provider checks, or any payment/provider gate.
