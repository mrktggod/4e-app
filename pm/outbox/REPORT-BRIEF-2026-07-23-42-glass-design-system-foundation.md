# REPORT-BRIEF-2026-07-23-42-glass-design-system-foundation

## Outcome

NEED-REFERENCE.

Reference gate remains active on the 2026-07-24 automation run. `pm/design-references/` contains only `README.md`; no `glass-card-reference.png`, `.jpg`, `.jpeg`, `.webp`, or other clearly named visual target was present at runtime. The brief and `pm/design-references/README.md` both say not to invent pixel details when the image is missing.

No runtime, CSS, production, `main`, payment, entitlement, CAL, secret, or broad redesign work was touched.

Inventory artifact produced: `pm/design-system-glass-inventory-2026-07-24.md`.

## Current Glass Inventory

Existing token layer:

- `styles/variables.less`: generic `.glass`, `.glass-green`, `.glass-nav` and light theme overrides.
- `styles/screens/voice.less`: older generic glass helpers plus notification card, privacy/security/settings surfaces, chat conversation glass variables.
- `styles/screens/home.less`: strongest current implementation, including `--sg-*` soft-glass variables, Focus/home surfaces and `#home .dash-glass` with layered highlights, inset shadows, blur and saturation.

Existing component families already using or approximating glass:

- Focus/day panels and dashboard cards: `styles/screens/home.less` around `--sg-*`, `#home .dash-glass`, focus panel and metric/task surfaces.
- Menu/settings blocks: profile/settings screens mostly use `var(--card)`, `var(--card2)`, `var(--border)` and partial green translucent states.
- Task cards: `styles/screens/home.less` `.task-card-shell`, `.task-row.task-card`, `.task-num-badge`, tag/deadline states.
- Notification cards: `styles/screens/voice.less` `.notif-card`, `.notif-card-icon`, `.notif-kind-chip`, `.notif-empty--panel`, action buttons.
- Buttons/icon buttons: mixed ad hoc styles across `layout.less`, `home.less`, `voice.less`; nav buttons already use blur, rounded surfaces and green glow.
- Inputs/selects: login/auth inputs and task detail controls are still mostly flat `var(--card)` surfaces, not a shared glass family.
- Popups/sheets/status panels: focus panel, quick-add/contact/dialog helpers and task-detail popovers use separate surface rules; no common `.ui-glass-*` API exists.

## Recommended Atomic Briefs

1. `DESIGN-GLASS-001A`: add a reviewed token map only, no UI behavior. Define shared LESS custom properties for glass surface, stroke, highlight, inset shadow, blur, active glow and reduced-transparency fallback.
2. `DESIGN-GLASS-001B`: migrate notification cards to the shared glass class family. This is a narrow safe slice with `npm run smoke:back055`, 390x844 screenshot evidence and no inline styles.
3. `DESIGN-GLASS-001C`: migrate task cards to the shared glass class family with `npm run smoke:back019`.
4. `DESIGN-GLASS-001D`: migrate inputs/selects and icon buttons only after reference image and Claude/Yuri review, because this touches auth, task detail and settings surfaces.

## Verification

Commands run:

```text
git checkout feat/admin-tariff-api
git fetch origin; git pull --ff-only
rg -n "glass|soft-glass|liquid|blur|backdrop|focus|menu-block|card|notif|popup|sheet" styles scripts index.html vk.html pm docs
rg -n "dash-glass|focus-panel|focus-sheet|glass|notif-card|task-card|settings|profile-action|dialog|modal|sheet|backdrop-filter|rgba\(|blur\(" styles -g "*.less"
```

Shared guards are run before commit.

## Changed Files

- `pm/inbox/BRIEF-2026-07-23-42-glass-design-system-foundation.md`
- `pm/design-system-glass-inventory-2026-07-24.md`
- `pm/outbox/REPORT-BRIEF-2026-07-23-42-glass-design-system-foundation.md`
- `pm/backlog.md`
- `shared/WORK_LOG.md`
- `DEVELOPMENT_LOG.md`

## Remaining Tails

Alexey needs to place the visual target at `pm/design-references/glass-card-reference.png` or approve a Claude/Yuri-reviewed token-only first slice. Until then, autonomous code changes for the global glass system stay blocked.

Commit SHA: final automation commit, see `git rev-parse HEAD`.
