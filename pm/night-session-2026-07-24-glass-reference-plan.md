# Long night session — DESIGN-GLASS-001

Window: 2026-07-24 → 2026-07-25  
Goal: turn Alexey's approved task-card reference into a reusable, verified
soft-glass foundation and two narrow runtime proofs without a broad redesign.

## Approved source

- Image: `pm/design-references/glass-card-reference.png`
- Interpretation: `pm/design-references/glass-card-reference-spec.md`
- Existing inventory: `pm/design-system-glass-inventory-2026-07-24.md`

The Telegram/iOS top chrome in the screenshot is not application UI.

## Execution order

| Order | Brief | Intended result | Expected commit |
| ---: | --- | --- | --- |
| 1 | `BRIEF-2026-07-23-42-glass-design-system-foundation` | Shared light/dark/reduced-transparency tokens and primitives; no runtime migration | `feat(ui): add shared soft glass foundation` |
| 2 | `BRIEF-2026-07-24-50-glass-notification-card-slice` | First isolated runtime proof using existing notification behavior | `feat(ui): migrate notification cards to glass primitives` |
| 3 | `BRIEF-2026-07-24-51-glass-task-detail-reference-slice` | Reference-led task-detail shell/hero slice after reminder dependency gate | `feat(ui): apply glass reference to task detail` |
| 4 | `BRIEF-2026-07-24-52-glass-night-visual-qa-handoff` | Full QA, screenshot evidence, backlog sync and morning questions | `docs(ui): close glass reference night pass` |

One brief equals one task, one report and one commit. Do not squash unrelated
work into these commits.

## Start gate

Before runtime work:

1. Verify branch and remote.
2. Preserve the current unrelated dirty analysis files; do not stage them into
   glass commits.
3. Do not switch/reset the dirty checkout destructively. Use a clean isolated
   worktree/branch when necessary.
4. Confirm the accepted `fix/reminder-popover-mobile` dependency before brief
   51. If it is absent, block only brief 51; do not reimplement it.
5. Open the reference image and spec before choosing values.

## Time budget

- Foundation: 60–90 minutes.
- Notification proof: 60–90 minutes.
- Task-detail reference slice: 90–150 minutes.
- Full QA and handoff: 45–75 minutes.

The runner may stop earlier when a dependency, focused smoke or visual
regression fails. Finishing fewer honest slices is better than a broad,
unreviewed restyle.

## Permanent boundaries

- No production deploy.
- No merge into `main`.
- No CAL, prices, payments, entitlement, auth-security or secrets.
- No global cross-screen migration.
- No new inline styles or inline handlers.
- No replacement of real application data with screenshot sample content.
- No weakening tests to make the run green.

## Morning review

The handoff should make five questions answerable in under ten minutes:

1. Does the light task-detail hierarchy feel like the supplied reference?
2. Is dark theme equally readable rather than merely inverted?
3. Are active/selected states clear without relying only on green?
4. Did reminder, tag popup and long-title behavior remain intact?
5. Is the notification family consistent enough to prove the primitives are
   reusable?

## Extension packages

Alexey approved preparing faster follow-up design work for the same night after
the new test tools became available. Packages 2 and 3 are defined in
`pm/night-session-2026-07-24-glass-packages-2-3-plan.md`.

They continue after this package only if the earlier briefs are `DONE` and the
focused tests stay green. The extension is still atomic: one brief, one report
and one commit. It does not permit production deploy, `main` merge, payment,
entitlement, auth-security, CAL, secrets or a one-shot global redesign.
