# BACK-057 — Offline Free Mode plan

Status: product/tech decision, 2026-07-16.

## Current state

Implemented runtime MVP:

- localStorage task cache scoped by user/chat key;
- offline mutation queue for task create/update/done/delete;
- cached task list shown on network failure;
- queued changes marked as waiting for sync;
- `online` event triggers sync.

## Decision

Keep `BACK-057` as `Partial Done` until manual offline smoke.

Do not expand into Premium Sync before beta.

Reason:

- local offline safety helps trust;
- multi-device sync is a different product/infra problem;
- offline AI draft can mislead users if AI/backend is unavailable;
- beta should first verify task cache/queue does not lose data.

## Free offline scope

Free offline mode means:

- user can open last saved plan;
- user can create/edit/complete/delete tasks locally;
- user sees that changes are queued;
- changes sync when network returns.

Free offline mode does not mean:

- AI works offline;
- all devices stay in sync;
- conflicts are fully resolved;
- attachments/media are cached.

## Premium Sync scope later

Premium Sync is a separate future capability:

- multi-device state;
- conflict handling;
- background sync;
- audit of offline mutations;
- possibly encrypted local storage.

Do not market current offline MVP as Premium Sync.

## Manual QA required

Use `pm/manual-qa-2026-07-17.md`.

Minimum pass:

- load tasks online;
- switch offline;
- reload and see cached plan;
- create/complete task offline;
- see queued status;
- return online;
- queued status disappears after sync/reload;
- no duplicate task appears.

## Definition of Done

`BACK-057` can become `Done` only when:

- manual offline smoke passes;
- duplicate/replay behavior checked;
- user-visible queued state is understandable;
- limitations are documented in product copy or known issues;
- Premium Sync remains separate backlog item if needed.
