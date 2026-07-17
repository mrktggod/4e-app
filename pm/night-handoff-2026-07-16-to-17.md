# Night handoff — 2026-07-16 → 2026-07-17

Branch: `feat/admin-tariff-api`

Current HEAD:

```text
6ca3241626a2cbbc4f010481d1199e4a4a41df13
```

## What changed at runtime

- `fb71c96` — daily share card MVP.
- `c61ea13` — share card streak/achievements.
- `e1a0747` — weekly share summary.
- `6813d17` — restrained `4` persona copy.
- `bdcee3f` — PWA wrapper groundwork: manifest, service worker, PWA meta.

## Product/process docs added

- `13151c4` — morning manual QA checklist.
- `434b728` — closed beta runbook.
- `a0af560` — beta feedback loop.
- `2cf2175` — workspace unification plan.
- `cd56bdf` — command workspace spec.
- `eb8a225` — TWA/Capacitor roadmap.
- `d0b7ec6` — product decision pack.
- `2ac3f3d` — onboarding wow + OAuth consent decisions.
- `042854b` — native/platform decisions.
- `6587ae8` — release/beta gates.
- `e1a31f2` — monetization decisions.
- `105be31` — Ready for QA triage.
- `dcb855f` — beta invite pack.
- `9240fb8` — post-beta decision tree.
- `6ca3241` — morning command center.

## Open first in the morning

1. `pm/morning-command-center-2026-07-17.md`
2. `pm/manual-qa-2026-07-17.md`
3. `pm/ready-for-qa-triage-2026-07-17.md`
4. `docs/tasks/RELEASE-BETA-GATES-2026-07-16.md`

## If core QA passes

Use:

- `pm/beta-run-2026-07.md`
- `pm/beta-invite-pack-2026-07.md`
- `pm/feedback-loop-2026-07.md`

Start with 3-5 testers, not 10.

## If core QA fails

- Do not invite beta users.
- Add bug to `pm/bugs.md`.
- Keep affected tasks in `Ready for QA`.
- Do not start CAL/native/platform.

## Do not touch without separate decision

- merge main;
- price changes;
- CAL implementation;
- native/platform launches;
- workspace implementation;
- OAuth profile fields without consent;
- VK Pay as paid-ready from UI smoke only;
- `.pages-dist/privacy.html`.

## Known dirty file

`git status --short` still shows:

```text
 M .pages-dist/privacy.html
```

This was treated as unrelated build artifact and intentionally not committed.

## Verification state

HEAD matched origin after the last push:

```text
6ca3241626a2cbbc4f010481d1199e4a4a41df13
```

Runtime smoke/tests were not run in this final doc/product sequence. Manual QA is the next required step.
