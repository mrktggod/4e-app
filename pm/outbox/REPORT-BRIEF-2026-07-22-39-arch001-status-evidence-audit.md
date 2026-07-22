# REPORT-BRIEF-2026-07-22-39-arch001-status-evidence-audit

status: NEED-CLAUDE

## Task

Audit `ARCH-001` status/evidence without continuing architecture work.

## Chosen Status

Recommended unified status: `In Progress` / `SOURCE-ONLY`, not `Done`.

## Why

The current docs disagree:

- `pm/backlog.md` lists `ARCH-001` as `Done`, but the same row still says to continue moving auth helpers in small steps.
- `shared/ROADMAP.md` lists `ARCH-001` as `In Progress`.
- `docs/tasks/EVIDENCE-AUDIT-2026-07-17.md` explicitly keeps `ARCH-001` as `SOURCE-ONLY`.
- `pm/outbox/REPORT-BRIEF-2026-07-19-17-arch001-evidence-upgrade.md` says the evidence supplement is source evidence only.
- `pm/outbox/REPORT-BRIEF-2026-07-20-22-arch001-continue-split.md` says broader extractions remain separate reviewed slices.

## MVP Boundary Found

Completed source-level boundary:

- `scripts/platform-adapter.js` exists and is mapped in `FILE_MAP.md`.
- The adapter covers Telegram/VK/web detection, VK Mini Apps adapter, Telegram auth/start helpers, VK launch params, OAuth PKCE/state helpers, referral/acquisition helpers, dialog/focus helpers, form-error helpers, email validation, password visibility, Enter-submit handling, and inline-handler value escaping.
- `index.html` and auth scripts use these helpers through compatibility wrappers/fallbacks.

Remaining boundary:

- The main app still has a large inline JavaScript block in `index.html`.
- Some auth/platform interactions remain documented as fallback/wrapper paths rather than a clean completed split.
- The latest ARCH report explicitly says additional broad extractions should remain separate reviewed ARCH-001 slices.

## Why Not DONE Autonomously

This is a gray-zone architecture/status decision. The brief is documentation-only, but the actual sync would require editing `pm/backlog.md` and `shared/ROADMAP.md`, both of which already had unrelated uncommitted changes before this task. I did not mix into those concurrent diffs.

## Proposed Claude/Yuri Decision

Use one of these two formulations:

1. Preferred: `ARCH-001 | In Progress | SOURCE-ONLY` with note: platform-adapter MVP is complete; monolith split continues only as reviewed narrow slices.
2. Alternative: `ARCH-001 platform-adapter MVP | Done`, plus a new follow-up architecture item for remaining index split/auth helper cleanup.

## Verification

```text
rg -n "ARCH-001|platform-adapter|auth helpers|adapter|In Progress|Done" pm shared docs FILE_MAP.md FILE_MAP_UI.md -g "*.md"
evidence found in pm/backlog.md, shared/ROADMAP.md, docs/tasks/EVIDENCE-AUDIT-2026-07-17.md, FILE_MAP.md, FILE_MAP_UI.md, and prior outbox reports

node scripts/check-cp1251-mojibake.mjs
exit code 0

git diff --check -- pm/inbox/BRIEF-2026-07-22-39-arch001-status-evidence-audit.md pm/outbox/REPORT-BRIEF-2026-07-22-39-arch001-status-evidence-audit.md
exit code 0
```

## Stop Points

No architecture/runtime refactor, production deploy, `main` merge, CAL, payment, entitlement, auth-security change, or secret handling was performed.

## Commit

This commit. The final pushed SHA is verified after commit/push because embedding a commit's own SHA in a tracked report changes that SHA.
