# REPORT-BRIEF-2026-07-22-33-task-detail-hero-overflow-ios

## Outcome

status: BLOCKED-CONCURRENT-WORK

## Root Cause

The task-detail hero overflow fix is a narrow CSS/runtime-layout task, but it cannot be done safely in the current working tree. `styles.css`, `styles.min.css`, `FILE_MAP_UI.md`, and `index.html` already had pre-existing uncommitted changes at task start. Running `npm run build:css` or editing task-detail layout would overwrite or mix with unrelated concurrent work, which the brief forbids.

Known source anchors from the audit:

- `styles/screens/tasks.less:1668-1671` contains fixed `300px` hero sizing.
- `styles/screens/tasks.less:2010-2038`, `2149-2206`, and `2482-2558` contain later task-detail hero/title/tag clamp and overflow overrides.
- `index.html:456-474` is the hero/title/tag/info-card structure affected by the CSS conflict.

No runtime code, CSS, broad redesign architecture, production deploy, `main` merge, CAL, payment, entitlement, auth-security, or secrets work was touched.

## Changed Files

- `pm/inbox/BRIEF-2026-07-22-33-task-detail-hero-overflow-ios.md`
- `pm/outbox/REPORT-BRIEF-2026-07-22-33-task-detail-hero-overflow-ios.md`

## Verification

- `git status --short --branch` showed pre-existing modified build artifacts and task-detail source context.
- `rg -n "detail-redesign-hero|detail-info-stack|detail-redesign-title|overflow|clamp|height" styles/screens/tasks.less index.html scripts package.json` confirmed the conflicting CSS source area.

## Commit

Pending this task commit.

## Tails

NEEDS-REAL: Re-run after the concurrent CSS/build artifact work is committed or cleared; then consolidate only task-detail hero conflicts, add a long-title/long-tag 390x844 regression fixture, rebuild CSS, and attach raw visual proof.
