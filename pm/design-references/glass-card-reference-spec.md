# DESIGN-GLASS-001 — task-card reference specification

Date accepted: 2026-07-24  
Owner of direction: Alexey  
Canonical image: `pm/design-references/glass-card-reference.png`  
Source SHA-256:
`C116612E0CBAB43582D04474BA29B2C2D4090E7312E7219CC414E23DA46E93C8`

## What this reference decides

This image is the visual anchor for the 4e soft-glass system. It defines the
relationship between background, panels, controls, status, typography and
nested content. It does not replace the existing product model or task-detail
behavior.

The reference should first influence shared tokens and reviewable component
families. It must not trigger a global restyle in one commit.

## Source boundary

The black top area with the iOS clock, signal, battery, `Закрыть`, the Mini App
title and the ellipsis menu is Telegram host chrome. Do not recreate or style
that area inside 4e.

The application visual target begins below the host chrome:

- warm light canvas with very subtle green light fields;
- circular in-app back action;
- compact glass panels for status and participants;
- large task-content panel;
- nested chat panel and composer.

All text, dates, avatars and task content in the image are illustrative. Use
real application data and existing labels.

## Visual grammar

### Canvas

- Warm off-white base rather than neutral pure white.
- Large, low-opacity green radial light fields behind content.
- No noisy texture and no sharp gradients.
- Content must remain legible when `backdrop-filter` is unsupported.

### Glass surfaces

- Milky translucent fill with a visible but quiet white edge.
- Soft green tint may appear in active/selected surfaces, not on every panel.
- Layered depth: subtle outer shadow plus a restrained inset highlight.
- Blur should support hierarchy without making text or borders hazy.
- Nested panels use a quieter surface than their parent.

Suggested implementation ranges, to be tuned through screenshot comparison:

| Property | Reference range |
| --- | --- |
| Card radius | 26–34px at 390px viewport |
| Control radius | 18–28px; circular controls remain circular |
| Border | 1px translucent white/green edge |
| Backdrop blur | 20–32px with saturation around 115–135% |
| Outer shadow | soft, wide, low-opacity neutral/green |
| Inner highlight | top/left white highlight, low opacity |
| Panel gap | 12–18px |
| Main horizontal inset | 16–20px |

These are reference ranges, not hardcoded acceptance numbers. Prefer the
existing spacing scale when it produces the same visible rhythm.

### Color roles

- Primary ink: deep blue/navy for headings and body text.
- Active/accent: fresh green for selected status, actions and focus rings.
- Supporting identity colors: limited green, warm coral and calm blue.
- Inactive controls: pale glass with navy icon/text.
- Avoid using green as the only status signal; keep text or icon confirmation.

### Typography

- The task title is the strongest element: bold, large and compact.
- Supporting description is materially smaller and lighter but still navy.
- Metadata is compact and scannable, with dates allowed to wrap intentionally.
- Avoid uppercase everywhere; reserve it for short status chips.
- Preserve current Russian copy and content semantics.

### Controls and states

- Minimum interactive target: 44x44 CSS pixels.
- Icon buttons are circular or rounded glass controls with visible hover,
  pressed, focus-visible and disabled states.
- Active status has more than color: selected geometry, label weight and/or
  icon.
- Fields have a clear boundary and readable placeholder; focus must not rely on
  glow alone.
- Destructive and overdue states must retain their semantic color and contrast.

## Component mapping

| Reference area | 4e component family | Night priority |
| --- | --- | --- |
| Status/participants panels | status panels, chips, compact grouped controls | Token target only in foundation pass |
| Main task panel | task-detail hero/content surface | Narrow slice after reminder dependency gate |
| Circular metadata actions | icon buttons and task metadata controls | Include only when existing behavior stays unchanged |
| Nested chat panel | conversation surface and composer | Later slice; do not combine with task hero migration |
| Milky canvas/background | shared screen background/light theme | Token layer; no broad cross-screen rollout |
| Active green selection | shared active/focus states | Required in tokens and accessibility verification |

## Theme and accessibility rules

- The reference is the light-theme target.
- Dark theme must use existing semantic roles and preserve hierarchy; do not
  invert the screenshot mechanically.
- Add an opaque reduced-transparency fallback.
- Respect `prefers-reduced-motion`; decorative glow must not be required for
  understanding.
- Verify keyboard focus, 44px targets, contrast, long Russian text, 200% text
  zoom where practical, and no horizontal overflow.

## Visual acceptance

For each runtime slice:

1. Capture 390x844 light and dark screenshots in the same app state.
2. Compare light screenshot with the canonical reference for hierarchy,
   spacing, surface depth, border treatment, radius and active state.
3. Confirm host chrome is absent from the implementation.
4. Confirm no sample data from the reference was hardcoded.
5. Run the component-specific smoke plus shared CSS/encoding/architecture
   guards.
6. Report visible misses honestly; do not call the global design system done
   after one migrated family.
