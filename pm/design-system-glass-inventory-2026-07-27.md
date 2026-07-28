# DESIGN-GLASS-001 Inventory - 2026-07-27 Night Pass

## Status

Current canonical checkout: `X:\Projects\4-ai-secretary\app`.

Branch: `feat/admin-tariff-api`.

Reference image status: missing in this checkout. `pm/design-references/` does not exist, so this pass does not make pixel-level visual claims.

Existing implementation status: foundation and several follow-up slices are already present in git history and source:

- `0a538fe5dfd5623e1fbc6d5ce3e653a218ef5545` - `feat(ui): add glass foundation primitives`
- `3ad54f9` - notification card slice
- `a59b098` - task detail surface slice
- `60dd597` - home dashboard slice
- `68614bc` / `13acec9` - task detail glass layout restore fixes

No runtime code changed in this pass.

## Current Token Map

Source of truth: `styles/variables.less`.

Shared glass tokens:

- `--glass-surface`
- `--glass-surface-strong`
- `--glass-surface-muted`
- `--glass-stroke`
- `--glass-stroke-strong`
- `--glass-highlight`
- `--glass-shadow`
- `--glass-inset-shadow`
- `--glass-blur`
- `--glass-saturate`
- `--glass-radius-card`
- `--glass-radius-control`
- `--glass-active-glow`
- `--glass-danger-glow`
- `--glass-reduced-surface`

Theme coverage:

- default dark values exist on `:root`;
- light values exist under `[data-theme="light"]`;
- fallback values exist for unsupported `backdrop-filter`;
- reduced-transparency values exist under `@media (prefers-reduced-transparency: reduce)`.

## Current Primitive Map

Foundation primitives in `styles/variables.less`:

- `.ui-glass-card`
- `.ui-glass-row`
- `.ui-glass-button`
- `.ui-glass-icon-button`
- `.ui-glass-field`
- `.ui-glass-sheet`
- `.ui-glass-popover`
- `.ui-glass-status`

Variants:

- `--strong`
- `--muted`
- `--interactive`
- `--active`
- `--primary`
- `--success`
- `--danger`

## Implemented Families Observed

Notification cards:

- renderer uses `.ui-glass-card`, `.ui-glass-button`, `.ui-glass-icon-button`, `.ui-glass-status`;
- source: `scripts/task-ui-renderers.js`;
- styling: `styles/screens/voice.less`;
- report: `pm/outbox/REPORT-BRIEF-2026-07-24-50-glass-notification-card-slice.md`.

Task detail surfaces:

- task detail has tokenized glass panels and controls;
- source: `styles/screens/tasks.less`;
- reports include `pm/outbox/REPORT-BRIEF-2026-07-24-51-glass-task-detail-reference-slice.md` and `pm/outbox/REPORT-BRIEF-2026-07-25-73-task-detail-glass-layout-restore.md`.

Home dashboard / focus surfaces:

- dashboard glass blocks use shared `--glass-*` tokens;
- source: `styles/screens/light-redesign.less`;
- implementation commit found in history as `60dd597`.

## Missing / Risk Areas

Missing local reference evidence:

- `pm/design-references/glass-card-reference.png`
- `pm/design-references/glass-card-reference-spec.md`

Missing broad family coverage:

- global form fields across all screens are not fully migrated;
- popups/dialogs are not fully migrated;
- chat conversation surfaces still have separate `--conv-*` glass variables;
- task detail still has separate `--detail-*` variables in addition to shared tokens;
- legacy `.glass`, `.glass-green`, `.glass-nav`, `.dash-glass`, `.ask-glass-card` classes still exist.

Review risks:

- broad cross-screen migration would be architectural and should stay in Claude/Yuri-reviewed briefs;
- visual matching cannot be claimed until the reference files are restored into this canonical checkout;
- current worktree has unrelated dirty changes in `AGENTS.md` and `index.html`, so runtime edits should wait for a clean handoff or explicit ownership.

## Recommended Next Atomic Briefs

1. Restore or intentionally archive the reference files in canonical PM storage.
2. Consolidate chat `--conv-*` glass variables into shared `--glass-*` tokens without changing behavior.
3. Consolidate task-detail `--detail-*` glass variables into shared tokens after visual review.
4. Migrate one low-risk dialog or field family to `.ui-glass-field` / `.ui-glass-sheet` with mobile and reduced-transparency screenshots.

## 2026-07-28 Night Pass

Rechecked from canonical checkout `X:\Projects\4-ai-secretary\app` on branch `feat/admin-tariff-api`.

Status remains `NEED-REFERENCE` for additional implementation:

- `pm/design-references/` is still absent locally;
- approved `glass-card-reference.png` and `glass-card-reference-spec.md` were not available for this pass;
- no new runtime migration was attempted.

Verified current foundation:

- `styles/variables.less` still contains the shared `--glass-*` token family and `.ui-glass-*` primitives;
- follow-up glass usage remains visible in notification, task-detail, home/focus and task-list LESS;
- existing foundation commit remains `0a538fe5dfd5623e1fbc6d5ce3e653a218ef5545`.

Checks:

- `node scripts/check-cp1251-mojibake.mjs` passed with `0 suspicious tokens`;
- `git diff --check` passed;
- `npm run check:portable-paths` and `npm run check:ui-architecture` could not start because `bash` is not on `PATH` in this shell.

## 2026-07-28 Package 2 Handoff

Brief 56 rechecked package 2 evidence after the previously blocked package
slices were completed.

Package 2 families now marked complete:

- Home/focus dashboard surfaces: `DONE`, commit `60dd5979d8e9a2859c2acbf73e31733afb669afd`.
- Telegram task-list card family: `DONE`, commit `a839a26d9b88c985f223de4cc4ca291d0b78158a`.
- Safe Telegram profile/menu surfaces: `DONE`, commit `2fa8e39da4dd1e3f126d8f932a1f050d8ad9f007`.

Evidence refreshed:

- home/focus light and dark 390x844 screenshots;
- task-card light and dark 390x844 screenshots covering overdue, normal and completed states;
- profile/menu light and dark 390x844 screenshots;
- desktop home overflow coverage through `npm run test:e2e:web`.

Status note: package 2 is closed, but global `DESIGN-GLASS-001` is not
complete. Missing/risk areas above remain open, especially global forms,
dialogs, chat conversation variables, task-detail variable consolidation and
reference-file restoration.
