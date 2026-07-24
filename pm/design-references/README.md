# Design references

## Canonical DESIGN-GLASS-001 reference

Alexey supplied and approved the task-card composition on 2026-07-24:

```text
pm/design-references/glass-card-reference.png
```

Companion implementation notes:

```text
pm/design-references/glass-card-reference-spec.md
```

The image is the visual target for the shared soft-glass language. It is an
example of hierarchy and component treatment, not a request to hardcode its
sample task text, Telegram host chrome, timestamps, avatars, or exact phone
content.

Night work must:

- use the reference for surface, border, radius, shadow, active-state and
  spacing decisions;
- preserve existing application behavior and real data;
- implement shared tokens and narrow component families, not a one-shot global
  restyle;
- capture comparable 390x844 evidence in light theme and verify dark theme;
- keep a reduced-transparency fallback and accessible focus/contrast states.

If the image cannot be opened or the reference spec conflicts with current
behavior, stop the affected slice and report the exact conflict instead of
guessing.
