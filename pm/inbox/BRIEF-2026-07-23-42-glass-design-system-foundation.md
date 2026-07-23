status: NEED-CLAUDE

# BRIEF-2026-07-23-42-glass-design-system-foundation

## Context

Alexey approved a global design direction on 2026-07-23: the glass panels already used around Focus of the Day and menu blocks should become the foundation of the 4e interface.

This is not a small polish task. It affects the design system for buttons, cards, notification panels, new blocks, form fields, popups, and other repeated surfaces.

Reference image path for Alexey's card mockup:

- Preferred: `pm/design-references/glass-card-reference.*`
- Alternative: any clearly named glass/card reference image inside `pm/design-references/`

If no image exists at runtime, do not invent pixel-perfect details.

## Task

Create the first safe night pass for `DESIGN-GLASS-001`.

1. Audit current glass-like surfaces and tokens.
2. Map the component families that should move to the shared glass language:
   - focus/day panels;
   - menu blocks;
   - task and notification cards;
   - buttons and icon buttons;
   - input fields and selects;
   - popups, sheets, and small status panels.
3. If Alexey's reference image is present, implement one narrow reviewable branch slice that moves the closest existing component families toward that reference.
4. If the reference image is missing, or the required change is too broad for safe autonomous work, write `NEED-REFERENCE` or `NEED-CLAUDE` with exact next atomic briefs.

## Stop Points

- No production deploy.
- No merge into `main`.
- No CAL tasks.
- No price changes.
- No payment or entitlement refactors.
- No secret rotation, secret removal, or secret disclosure.
- No broad cross-screen redesign in one commit.
- No new inline styles or inline handlers.
- No claim that prod was changed; branch/preview-ready code only.

## Verification

- `node scripts/check-cp1251-mojibake.mjs`
- `npm run build:css` if LESS/CSS changes are made.
- `git diff --check`
- `bash scripts/check-portable-paths.sh`
- `bash scripts/check-ui-architecture.sh` if UI files change.
- Mobile visual check at 390x844 and one desktop viewport when browser tooling is available.

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-23-42-glass-design-system-foundation.md` with:

- outcome: `DONE`, `NEED-REFERENCE`, `NEED-CLAUDE`, or `NEED-YURI`;
- reference image status and path;
- changed files;
- commit SHA if committed;
- raw visual/smoke evidence;
- remaining tails and next atomic briefs.
