# REPORT-BRIEF-2026-07-22-41-horizon05-status-consistency

status: DONE

## Task

Audit Horizon 0.5 status consistency across roadmap/backlog/task docs/reports and fix only provable stale statuses.

## Changed Statuses

| Item | Before | After | Evidence |
|---|---|---|---|
| `BACK-007` / 152-FZ privacy row in `shared/ROADMAP.md` Horizon 0.5 table | `Частично Done`; text still said privacy number/link remained | `Done`; text points to privacy artifact/link smoke | `pm/backlog.md:100` already says `BACK-007 Done`; `shared/ROADMAP.md:49` already says 152-FZ `Done`; `pm/outbox/REPORT-BRIEF-2026-07-22-36-privacy-surface-regression-smoke.md` proved `privacy.html`, `102299/77`, and auth/onboarding link handlers |

Only this hunk was staged from `shared/ROADMAP.md`; unrelated pre-existing voice/operational-mode edits in the same file were left unstaged.

## Remaining Tails

| Item | Current Status Class | Why Not Changed |
|---|---|---|
| `ARCH-001` | NEED-CLAUDE | `pm/backlog.md` says `Done`, roadmap says `In Progress`, and evidence says `SOURCE-ONLY`. BRIEF-39 report recommends `In Progress / SOURCE-ONLY`, but canonical docs are dirty and architecture status needs reviewed decision. |
| `SMART-004` | NEED-YURI/manual | Ready for QA is honest; task docs require real Telegram group smoke for user/context/no-spam behavior. |
| `SMART-011` | NEED-YURI/manual | Ready for QA is honest; task docs require real Telegram/group recipient/copy/no-spam proof. |
| `BACK-045` | NEED-YURI/manual | Ready for QA is honest; credentials are installed but Done needs real browser VK/Yandex OAuth smoke and provider-safe context. |
| `BACK-008` | NEED-YURI/manual | Manual blocker is honest; needs Yandex Cloud HTTP gateway/Cloud Function and secret handling by owner. |
| `BACK-012` | autonomous-safe only for narrow docs/BEM islands | `Partial Done` is honest; inventory exists now, but cleanup remains one island + one smoke at a time. |

## Cross-File Evidence

```text
rg -n "BACK-007|privacy|РКН|ARCH-001|BACK-012|SMART-004|SMART-011|BACK-045|BACK-008" shared/ROADMAP.md pm/backlog.md docs/tasks pm/outbox -g "*.md"

Key hits:
pm/backlog.md:100 BACK-007 Done
shared/ROADMAP.md:49 152-FZ Done
shared/ROADMAP.md:69 stale 152-FZ Partial Done before this fix
pm/backlog.md:117 ARCH-001 Done
shared/ROADMAP.md:74 ARCH-001 In Progress
docs/tasks/EVIDENCE-AUDIT-2026-07-17.md:218 ARCH-001 remains SOURCE-ONLY
pm/backlog.md:111 SMART-004 Ready for QA
pm/backlog.md:148 SMART-011 Ready for QA
pm/backlog.md:109 BACK-045 Ready for QA
pm/backlog.md:101 BACK-008 Manual blocker
pm/backlog.md:129 BACK-012 Partial Done
```

## Verification

```text
node scripts/check-cp1251-mojibake.mjs
exit code 0

git diff --cached -- shared/ROADMAP.md
only BACK-007/152-FZ Horizon 0.5 row staged

git diff --check --cached
exit code 0
```

## Stop Points

No runtime code, reprioritization, production deploy, `main` merge, CAL, payment, entitlement, auth-security, product decision, or secret handling was performed.

## Commit

This commit. The final pushed SHA is verified after commit/push because embedding a commit's own SHA in a tracked report changes that SHA.
