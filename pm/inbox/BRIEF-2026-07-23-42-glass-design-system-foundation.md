status: DONE

# BRIEF-2026-07-23-42-glass-design-system-foundation

## Context

Alexey approved a global design direction on 2026-07-23: the glass panels already used around Focus of the Day and menu blocks should become the foundation of the 4e interface.

This is not a small polish task. It affects the design system for buttons, cards, notification panels, new blocks, form fields, popups, and other repeated surfaces.

Alexey supplied and approved the visual target on 2026-07-24:

- image: `pm/design-references/glass-card-reference.png`;
- interpretation: `pm/design-references/glass-card-reference-spec.md`.

The missing-reference gate is cleared. The Telegram/iOS host header in the
image is out of scope and must not be recreated inside the app.

## Task

Implement the token/primitives foundation for `DESIGN-GLASS-001`.

1. Read the canonical image, reference spec and the existing inventory
   `pm/design-system-glass-inventory-2026-07-24.md`.
2. Add or normalize shared LESS/CSS custom properties for:
   - default, strong and muted glass surfaces;
   - stroke and active stroke;
   - highlight, outer shadow and inset shadow;
   - blur/saturation;
   - card/control radii;
   - active and danger states;
   - reduced-transparency fallback;
   - light and dark theme values.
3. Add the smallest reusable primitive class family needed by later briefs.
4. Do not migrate a runtime screen or alter layout/behavior in this commit.
5. Document the final token names and any deliberate deviation from the
   reference ranges.

## Stop Points

- No production deploy.
- No merge into `main`.
- No CAL tasks.
- No price changes.
- No payment or entitlement refactors.
- No secret rotation, secret removal, or secret disclosure.
- No runtime screen migration in this foundation commit.
- No new decorative image generation.
- No new inline styles or inline handlers.
- No claim that prod was changed; branch/preview-ready code only.

## Verification

- `node scripts/check-cp1251-mojibake.mjs`
- `npm run build:css` if LESS/CSS changes are made.
- `git diff --check`
- `bash scripts/check-portable-paths.sh`
- `bash scripts/check-ui-architecture.sh`
- Verify light, dark and reduced-transparency token values exist.

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-23-42-glass-design-system-foundation.md` with:

- outcome: `DONE`, `NEED-CLAUDE`, or `NEED-YURI`;
- reference image status and path;
- changed files;
- commit SHA if committed;
- raw build/guard evidence;
- remaining tails and next atomic briefs.
