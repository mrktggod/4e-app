# BACK-012 Component Inventory — 2026-07-22

Snapshot source: current working tree `index.html`, `scripts/task-ui-renderers.js`, `styles/**/*.less`, and existing smoke scripts. This is documentation-only evidence for planning narrow BEM islands; it does not change code, CSS, guard thresholds, payment, entitlement, auth-security, CAL, production, or `main`.

## Current Guard Baseline

```text
C:\Program Files\Git\bin\bash.exe scripts/check-ui-architecture.sh
UI architecture guard: inline style attributes = 309 / 465
UI architecture guard: inline event handlers = 400 / 402
UI architecture guard: style tags = 0 / 0
UI architecture guard: inline script tags = 3 / 3
```

## Inventory

| Surface | Primary Wrappers | Static Range / Dynamic Source | Inline Style Attrs | LESS Files / Tokens | Existing Smoke | Risk |
|---|---|---|---:|---|---|---|
| Auth/login/register/onboarding | `#onboarding`, `#login`, `.auth-*`, `.login-*`, `.ob-*` | `index.html:61-208`, `264-329` | 13 static | `styles/layout.less`, `styles/screens/voice.less`; tokens `--green`, `--text`, `--muted`, `--border`, `--card2` | `npm run smoke:back050` | Medium: beta entry path; already had auth cleanup islands |
| Home/dashboard | `#home`, `.dash-*`, `.home-*`, `#home-task-list` | static `index.html:330-378`; dynamic `index.html:4500-4830` | 6 static + 20 dynamic | `styles/screens/home.less`, `styles/screens/light-redesign.less`, `styles/variables.less`; tokens `--bg`, `--text`, `--green`, `--card`, `--border` | `npm run smoke:home001` | High: first screen, visual regressions obvious |
| Task card list item | `.task-card-shell`, `.task-row.task-card`, `.task-card-*` | `scripts/task-ui-renderers.js:26-42` | 0 generated in header/tag/deadline after 2026-07-23 BEM slice | `styles/screens/home.less`, `styles/variables.less`; tokens `--card`, `--border`, `--green`, priority classes | `npm run smoke:back019` | Medium: swipe/tap behavior and title clamp; header/meta slice cleaned |
| Task detail | `#task-detail`, `.detail-*`, `.task-detail-*` | static `index.html:444-503`; dynamic `index.html:5200-5900` | 0 static + 15 dynamic | `styles/screens/tasks.less`, `styles/screens/light-redesign.less`; tokens `--detail-*`, `--card2`, `--green`, `--muted` | `npm run smoke:back019` partially; no dedicated detail smoke | High: BRIEF-31/32/33 are currently blocked by concurrent task-detail work; do not pick as next cleanup island |
| AI-chat composer | `#ask`, `.ask-*`, `.ask-bar`, `.ask-field`, `.ask-send` | static `index.html:414-443`; dynamic `index.html:6150-6860` | 0 static + ask action/clarification preview generated styles cleaned after 2026-07-23 BEM slice; broader dynamic ask debt remains | `styles/screens/voice.less`, `styles/screens/light-redesign.less`; tokens `--bg`, `--text`, `--muted`, `--green`, `--border` | `npm run smoke:ask-action-preview` covers generated ask action/clarification previews; broader composer coverage remains indirect | Medium: keyboard/composer viewport risk |
| Profile/settings | `#profile`, `.profile-*`, `#*-settings`, support/settings subscreens | `index.html:633-695`, `853-1408` | 92 static aggregate | `styles/screens/profile.less`, `styles/layout.less`, `styles/screens/light-redesign.less`; tokens `--profile-*`, `--green`, `--text`, `--card`, `--border` | `npm run smoke:smart007` covers AI memory subset; no broad profile smoke | Medium/high: many subscreens, settings state, privacy text |
| Notifications/action feed | `#notifications`, `.notif-*` | static `index.html:613-632`; generated `scripts/task-ui-renderers.js:373-459`, `538-551` | 0 static + 0 generated in checked notification empty/action blocks after 2026-07-23 BEM slice; task-card renderer debt remains separate | `styles/screens/voice.less`, `styles/variables.less`; tokens `--card`, `--border`, `--green`, `--muted` | `npm run smoke:back055` | Low/medium: recent notifications island and generated empty/action blocks cleaned; remaining generated task-card header/meta is separate |

## Already Closed Islands

| Island | Evidence |
|---|---|
| Auth/password + auth/forgot/reset | `pm/outbox/REPORT-BACK-012-auth-inline-cleanup-2026-07-22.md`, `pm/outbox/REPORT-BRIEF-2026-07-20-20-back012-css-bem-cleanup.md` |
| Task move | `pm/outbox/REPORT-BACK-012-task-move-inline-cleanup-2026-07-22.md` |
| Calendar | `pm/outbox/REPORT-BACK-012-calendar-inline-cleanup-2026-07-22.md` |
| Statistics | `pm/outbox/REPORT-BACK-012-statistics-inline-cleanup-2026-07-22.md` |
| Notifications static shell | `pm/outbox/REPORT-BACK-012-notifications-inline-cleanup-2026-07-22.md` |
| Ask action preview | `pm/outbox/REPORT-BACK-012-ask-action-preview-bem-cleanup-2026-07-23.md` |

## Next Three Narrow Candidates

No remaining pre-reviewed narrow BEM candidate is safe enough for autonomous DONE without a fresh brief/smoke. Profile/settings is broader medium/high surface; task-detail remains excluded by this inventory; auth/payment/provider/CAL areas stay gated.

Do not pick task-detail until BRIEF-31/32/33 and the concurrent task-detail CSS/index work are resolved.

## Reproduction Commands

```powershell
@'
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split(/\r?\n/);
// enumerate screen ranges and count static style/on* attrs
'@ | node -

@'
const fs = require('fs');
for (const file of ['scripts/task-ui-renderers.js','index.html']) {
  const text = fs.readFileSync(file, 'utf8');
  console.log(file, (text.match(/style=/g) || []).length);
}
'@ | node -

& 'C:\Program Files\Git\bin\bash.exe' scripts/check-ui-architecture.sh
```
