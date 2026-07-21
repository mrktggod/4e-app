status: NEED-CLAUDE

# BRIEF-2026-07-21-night-liquid-glass-system

## Context

Alexey prepared the core liquid-glass panel visual in HTML with GPT. This glass is now intended to become a main part of the 4 design language across themes. The click glow / press illumination from the source component must be preserved.

Source artifact copied into the repo for the night runner:

- `docs/tasks/assets/4_liquid_glass_panel_component_2026-07-21.html`

Original local source from Alexey was provided from the user's Downloads folder; use the copied repo artifact above as the canonical source for automation.

## Task

Implement the liquid-glass panel as a reusable app styling layer, not as a one-off pasted HTML demo.

1. Extract the component's useful visual primitives into LESS/CSS tokens and reusable BEM-style classes:
   - glass tint/opacity;
   - blur/saturation/brightness;
   - edge light;
   - green glow;
   - hover/press/click glow behavior;
   - dark and light theme variables.
2. Apply the glass layer to the current redesigned panel/card surfaces where it is clearly safe and consistent:
   - dashboard glass cards / major panels;
   - profile/settings panels;
   - task-detail hero/panels;
   - notifications/chat cards where the current design already uses glass-like surfaces.
3. Keep the click glow / active press illumination from the component. It should feel interactive on tap/click and work on both light and dark themes.
4. Do not paste a separate full demo component into `index.html`. Use `styles/` LESS and existing class structure.
5. Keep layout stable: the glass treatment must not create text overlap, resize cards unexpectedly, or break mobile 390x844.

## Stop Points

- Do not deploy production.
- Do not merge into `main`.
- Do not touch CAL.
- Do not change prices.
- Do not touch secrets.
- Do not touch payment or entitlement logic.
- Do not touch auth/password/session logic.
- If the implementation becomes a broad redesign architecture migration or requires replacing large screen markup, stop and report `NEED-CLAUDE` with a plan instead of forcing it at night.

## Verification

Required before `DONE`:

- `npm run build:css`
- `node scripts/check-cp1251-mojibake.mjs`
- `npm run check:js-syntax`
- `git diff --check`
- `C:\Program Files\Git\bin\bash.exe scripts/check-portable-paths.sh`
- `C:\Program Files\Git\bin\bash.exe scripts/check-ui-architecture.sh`
- Browser/Chrome visual smoke at 390x844 for at least:
  - dashboard/home;
  - task-detail;
  - profile/settings;
  - notifications;
  - one dark-theme and one light-theme capture or raw DOM/layout proof.
- Explicitly verify click/press glow on at least one interactive glass panel/button.

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-21-night-liquid-glass-system.md` with:

- exact files changed;
- where the source component was mapped into app tokens/classes;
- before/after evidence for light and dark themes;
- click glow evidence;
- commit SHA;
- status `DONE` or `NEED-CLAUDE`.
