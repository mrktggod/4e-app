# BACK-012 — CSS architecture plan

Status: technical decision, 2026-07-16.

Goal: finish LESS + BEM cleanup without breaking beta-critical UI.

## Current state

Already done:

- `styles/main.less` builds into `styles.css`;
- `styles.min.css` is connected from `index.html`;
- build scripts exist;
- CSS minification path works.

Still not done:

- large legacy inline styles remain in `index.html`;
- old component naming is mixed with newer BEM-like classes;
- some runtime UI was intentionally shipped inline to avoid broad refactors during beta prep;
- guard count should not be treated as a blocker if cleanup would risk auth/home/task flows before beta.

## Decision

Do not perform broad CSS/BEM refactor before closed beta.

Reason:

- auth/home/task creation/mobile composer are beta-critical;
- inline cleanup creates high visual regression risk;
- current priority is manual QA and beta signal, not architectural purity.

## What is allowed before beta

Allowed:

- small CSS fixes for P0/P1 visual blockers;
- safe-area/composer overlap fixes;
- accessibility/focus fixes;
- tiny extracted classes only when touching a specific bug.

Not allowed:

- mass moving inline styles from `index.html`;
- renaming existing classes across screens;
- changing layout primitives for home/auth/task detail;
- running formatter that rewrites the monolith.

## Post-beta cleanup sequence

### Phase 1 — component inventory

Create a table of high-traffic screens:

- auth/login/register;
- home;
- task card;
- task detail;
- AI-chat composer;
- profile/settings;
- notifications/action feed.

For each screen record:

- primary wrapper class;
- inline style count;
- shared tokens used;
- regression risk.

### Phase 2 — BEM islands

Refactor one island per PR/commit:

- `auth-*`;
- `home-*`;
- `task-card-*`;
- `task-detail-*`;
- `ask-*`;
- `profile-*`;
- `notif-*`.

Rule: one island, one visual smoke, one commit.

### Phase 3 — guard tightening

Only after major islands are clean:

- lower allowed inline-style budget;
- enforce no new inline event handlers where feasible;
- document exceptions for generated/legacy surfaces.

## Definition of Done

`BACK-012` can become `Done` when:

- high-traffic screens have stable LESS/BEM islands;
- `index.html` no longer carries avoidable layout inline styles for those islands;
- minified CSS build still ships;
- visual smoke passes on mobile and desktop;
- guard thresholds reflect the new baseline.
