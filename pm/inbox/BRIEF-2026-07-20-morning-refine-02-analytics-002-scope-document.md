status: NEW

# BRIEF-2026-07-20-morning-refine-02-analytics-002-scope-document

## ⚠️ Delivery note (read first)
Same caveat as the sibling brief `BRIEF-2026-07-20-morning-refine-01-auth-avatar-login-diagnose.md`: this is a re-issue of the untracked `pm/inbox/BRIEF-2026-07-19-16-analytics-002-scope-pause-and-document.md`, which was never processed because Codex Automation appears to only see files already committed on `origin`, and Cowork has no push credentials this session. Please commit+push this file to `pm/inbox/` on `origin` as your first step if it isn't already there, so future automation cycles pick it up.

## Context
The 2026-07-19 morning audit found two commits implementing `ANALYTICS-002` Step 1 and Step 2 (frontend attribution capture + worker D1 persistence), even though:

- `docs/tasks/ANALYTICS-002-metrics-plan.md` itself states `Status: plan before code` and "No implementation before Yuri approves this plan" (Non-goals section).
- `pm/backlog.md` still lists `ANALYTICS-002` as `Planned`, not started.
- Neither commit has a matching `pm/outbox/REPORT-*.md`, nor a `shared/WORK_LOG.md` entry.

Commits: app `54cbddcb` "feat(analytics): pass first-touch attribution", worker `64bc0477` "feat(worker): persist acquisition attribution", both same 2026-07-19 daytime window. `scripts/platform-adapter.js` attribution capture, `index.html` VK-auth request body now includes `attribution`, worker migration `migrations/0009_user_acquisition_attribution.sql` adds `acquisition_channel/source/campaign/content` to `users`, `worker.js` persists them and adds channel breakdown to `/analytics/summary`.

Not classified as a security incident (no price/payment/entitlement/secrets touched), but it is an undocumented scope step ahead of the plan's own approval gate, and it touches an auth-adjacent request body (VK auth), which `AGENTS.md` treats as gray-zone by analogy with BACK-060. As of the 2026-07-20 06:00 audit, this is still unaddressed — no further ANALYTICS-002 commits since 54cbddcb/64bc0477, so at least the "don't build further" boundary has held on its own.

## Task
Documentation only. Do NOT write any new ANALYTICS-002 implementation code (no Step 3-6) until Yuri explicitly approves continuing.

1. Write `pm/outbox/REPORT-analytics-002-step1-2-retro.md` documenting what commits `54cbddcb` (app) and `64bc0477` (worker) actually did: files changed, root reasoning, whether this was an explicit Yuri-approved daytime decision or an autonomous choice — be honest if you don't have a clear record of approval.
2. Add matching `shared/WORK_LOG.md` entries for both commits (retroactive, dated to the actual commit time, 2026-07-19).
3. Update the `ANALYTICS-002` row in `pm/backlog.md`: status from `Planned` to `Step 1-2 implemented (unreviewed) — paused pending Yuri decision`, and note Steps 3-6 (product event expansion, cohort retention, technical stability metrics, dashboard) are on hold.
4. Do not touch `scripts/platform-adapter.js`, `index.html`, `worker.js`, or the migration file themselves — documentation-only, not a revert and not further implementation.

## Stop Points
- No new ANALYTICS-002 code (Steps 3-6 or any expansion of Steps 1-2).
- No revert of the existing attribution commits either — leave the code as-is; keep vs. quarantine is Yuri's call, not this brief's.
- No production deploy. No merge into `main`. No CAL. No price changes. No payment/entitlement refactors. No secrets.

## Verification
- `git log -1 --stat` for both commits reproduced accurately in the report (file lists match).
- `pm/backlog.md` diff touches only the ANALYTICS-002 row.
- `node scripts/check-cp1251-mojibake.mjs` → 0.

## Report
`pm/outbox/REPORT-BRIEF-2026-07-20-morning-refine-02-analytics-002-scope-document.md`: confirmation of the 3 doc updates, honest note on whether approval context is known or unknown.
