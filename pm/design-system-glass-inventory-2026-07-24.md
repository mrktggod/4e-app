# DESIGN-GLASS-001 Inventory - 2026-07-24

## Outcome

Reference image was not present during the 2026-07-24 automation run. Runtime glass implementation is blocked as `NEED-REFERENCE`; this file is the safe design-system inventory for Claude/Yuri review.

Reference search result:

- Found: `pm/design-references/README.md`
- Missing: `pm/design-references/glass-card-reference.png`
- Missing: `pm/design-references/glass-card-reference.jpg`
- Missing: `pm/design-references/glass-card-reference.jpeg`
- Missing: `pm/design-references/glass-card-reference.webp`
- No other clearly named glass/card reference image was present in `pm/design-references/`.

## Existing Glass Sources

| Area | Current selectors / files | Notes |
| --- | --- | --- |
| Global helpers | `styles/variables.less`: `.glass`, `.glass-green`, `.glass-nav` | Generic helpers exist, but they do not encode the richer soft-glass language used by the dashboard. |
| Home dashboard | `styles/screens/home.less`: `#home .dash-glass`, `#home .dash-glass::before`, `#home .dash-glass::after`, `--sg-*` | Strongest current foundation: blur, saturation, layered highlights, inset shadow, dark translucent fill. |
| Focus panel | `styles/screens/home.less`: `#focus-panel-overlay .quick-add-sheet`, `.focus-summary-card`, `.home-ai-row` | Close to target family, but still uses local selectors instead of shared component classes. |
| Task cards | `styles/screens/home.less`: `.task-card-shell`, `.task-row.task-card`, `.task-num-badge`, `.task-card-tag`, `.task-card-deadline` | Uses translucent states and cards, but not a reusable glass API. Good candidate after reference approval. |
| Notifications | `styles/screens/voice.less`: `.notif-card`, `.notif-empty--panel`, `.notif-kind-chip`, `.notif-action-*` | Low-risk candidate because it has a focused smoke: `npm run smoke:back055`. |
| Profile/menu blocks | `styles/screens/profile.less`: `.profile-card`, `.profile-premium-card`, `.profile-menu-row` | Already uses blur and translucent panels; menu rows need a shared row/token language before broad migration. |
| Task detail | `index.html` classes `detail-glass-panel`, `detail-info-card`; styles spread across LESS | Visually glass-like, but recently fixed P1 mobile issues make this a review-only area for now. |
| Ask/chat | `index.html`: `.ask-plan-card`, `.ask-glass-card`; `styles/screens/voice.less` and light overrides | Needs separate review because the chat surface has dense input/action states. |
| Inputs/selects | Auth, task detail, settings fields across `layout.less`, `tasks.less`, `voice.less` | Mostly flat `var(--card)`/`var(--card2)` controls. Do not migrate without reference because contrast and focus states are easy to regress. |
| Popups/sheets | Quick-add, focus overlay, detail popovers, dialogs | Multiple local patterns; needs a shared sheet/popup class family plus reduced-transparency fallback. |

## Proposed Token Map

Recommended shared custom properties, to be added only after reference approval or Claude/Yuri token-only approval:

| Token | Purpose |
| --- | --- |
| `--glass-surface` | Default translucent panel fill. |
| `--glass-surface-strong` | Higher-opacity fill for sheets, popups and dense cards. |
| `--glass-surface-muted` | Quiet fill for nested rows and secondary controls. |
| `--glass-stroke` | Main 1px border/stroke. |
| `--glass-stroke-strong` | Active/selected border or important card edge. |
| `--glass-highlight` | Top/left light sweep layer. |
| `--glass-shadow` | Outer elevation shadow. |
| `--glass-inset-shadow` | Inner depth/shadow layer. |
| `--glass-blur` | Backdrop blur amount. |
| `--glass-saturate` | Backdrop saturation amount. |
| `--glass-radius-card` | Card/panel radius. |
| `--glass-radius-control` | Button/input radius. |
| `--glass-active-glow` | Green active/focus glow. |
| `--glass-danger-glow` | Overdue/error glow. |
| `--glass-reduced-surface` | Fallback fill for reduced transparency / unsupported backdrop-filter. |

## Proposed Component Classes

| Family | Suggested classes | First safe slice |
| --- | --- | --- |
| Panels/cards | `.ui-glass-card`, `.ui-glass-card--strong`, `.ui-glass-card--interactive`, `.ui-glass-card--danger` | Notification cards or focus summary card. |
| Rows | `.ui-glass-row`, `.ui-glass-row--menu`, `.ui-glass-row--compact` | Profile/menu rows after reference approval. |
| Buttons | `.ui-glass-button`, `.ui-glass-button--primary`, `.ui-glass-icon-button` | Non-auth, non-payment icon buttons first. |
| Fields | `.ui-glass-field`, `.ui-glass-select`, `.ui-glass-textarea` | Review-only until reference defines contrast/focus style. |
| Sheets/popups | `.ui-glass-sheet`, `.ui-glass-popover`, `.ui-glass-overlay` | Focus panel sheet after screenshot review. |
| Status panels | `.ui-glass-status`, `.ui-glass-status--success`, `.ui-glass-status--warning` | Small notification/status cards. |

## Risk Areas

- Broad cross-screen migration would touch auth, payments/subscription UI, task detail, notifications, profile and chat at once; that exceeds the autonomous slice.
- Inputs and selects need explicit focus/error/disabled states, otherwise accessibility and form usability can regress.
- Task detail recently received mobile P1 fixes; avoid restyling its layout without `smoke:back067-reminder`, `smoke:back068-tag-popup`, and `smoke:back069-hero`.
- Light theme has many override rules in `styles/screens/light-redesign.less`; shared tokens must include light-mode values rather than stacking more `!important` overrides.
- Existing `.glass` helper is too generic to become the final API without a compatibility plan.

## Next Atomic Briefs

1. `DESIGN-GLASS-001A`: Alexey places `pm/design-references/glass-card-reference.png`; Claude/Yuri approve token names and allowed first family.
2. `DESIGN-GLASS-001B`: Token-only LESS slice in `styles/variables.less` plus light/dark fallback, no runtime selector migration; run CSS build and guards.
3. `DESIGN-GLASS-001C`: Migrate notification cards to `.ui-glass-card` family; run `npm run smoke:back055`, mobile 390x844 and desktop screenshot checks.
4. `DESIGN-GLASS-001D`: Migrate focus summary/menu blocks only after visual review; run `npm run smoke:home001`.
5. `DESIGN-GLASS-001E`: Field/button family review brief; include accessibility criteria before code.
