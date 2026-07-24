status: DONE

# BRIEF-2026-07-24-51-glass-task-detail-reference-slice

## Context

The supplied reference is a task-detail composition, so task detail is the
primary fidelity slice. It is also a regression-sensitive area with recent
reminder, tag-popup and long-title work.

Dependency gate:

- the accepted commits from `fix/reminder-popover-mobile` must be present in
  the implementation base, or this brief must become `BLOCKED-DEPENDENCY`;
- do not duplicate or silently replace that accepted reminder work;
- the shared glass foundation and notification proof must already be `DONE`.

Reference:

- `pm/design-references/glass-card-reference.png`;
- `pm/design-references/glass-card-reference-spec.md`.

## Task

Apply the shared glass language to one bounded task-detail slice.

In scope:

- screen canvas/background behind task detail;
- existing status/participant grouping surfaces;
- main task hero/content panel;
- existing metadata/icon controls only where their behavior is unchanged.

Out of scope:

- Telegram/iOS host chrome from the screenshot;
- chat/conversation panel and composer;
- new task fields, new status model or new participant behavior;
- reminder/tag/priority/deadline behavior changes;
- global migration of other screens.

Preserve real data, long Russian titles/descriptions, all existing controls and
the accepted reminder interaction. Use existing icon assets/library; do not
draw replacement assets in CSS or inline SVG.

## Stop Points

- No production deploy or merge into `main`.
- No CAL, price, payment, entitlement, auth-security or secret work.
- No broad redesign, inline styles or inline handlers.
- If the reminder dependency is missing or the current worktree contains
  overlapping uncommitted task-detail changes, stop with
  `BLOCKED-DEPENDENCY`.
- If any existing focused smoke regresses, do not weaken the test.

## Verification

- Mandatory index.html encoding check before and after any edit.
- `node scripts/check-cp1251-mojibake.mjs`
- `npm run build:css`
- `npm run smoke:back067-reminder`
- `npm run smoke:back068-tag-popup`
- `npm run smoke:back069-hero`
- `npm run check:portable-paths`
- `npm run check:ui-architecture`
- `git diff --check`
- 390x844 light/dark screenshots using the same long-title fixture
- one desktop viewport overflow check

## Visual acceptance

- Reference-like hierarchy: compact status layer → strong task panel → next
  content section.
- Warm light canvas, milky translucent panels, quiet edge and green active
  state without washing out navy text.
- Minimum 44x44 controls and visible focus state.
- No horizontal overflow, title/meta overlap or sample-data hardcoding.
- Host chrome is not reproduced inside the app.

## Report

Write
`pm/outbox/REPORT-BRIEF-2026-07-24-51-glass-task-detail-reference-slice.md`
with dependency status, changed selectors/files, commit SHA, raw focused smoke
output, screenshot paths and an honest fidelity/miss list.
