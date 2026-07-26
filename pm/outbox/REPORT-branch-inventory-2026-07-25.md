# REPORT-branch-inventory-2026-07-25

Status: DONE

## What Was Done

I made a remote branch inventory only. No branches were deleted.

Commands run:

```powershell
git fetch --all --prune
git branch -r --format='%(refname:short) %(committerdate:short) %(authorname)'
git branch -r --merged origin/main
git branch -r --no-merged origin/main
git branch -r --merged origin/feat/admin-tariff-api
git branch -r --no-merged origin/feat/admin-tariff-api
```

Verdict rule: `can delete` means the branch is merged into both `origin/main` and `origin/feat/admin-tariff-api`, and it is not protected/current/sensitive by name. `keep` means unmerged, protected/current, or sensitive by stop-point area.

## Inventory

| Branch | Last commit | Author | Merged main | Merged feat/admin | Verdict |
| --- | --- | --- | --- | --- | --- |
| `origin` | 2026-07-21 | shelckograff | yes | yes | keep: remote HEAD alias |
| `origin/codex/docs-monetization-i18n-roadmap` | 2026-07-13 | shelckograff | no | no | keep: unmerged |
| `origin/codex/redesign-chat-soft-glass` | 2026-07-18 | shelckograff | no | no | keep: unmerged redesign branch |
| `origin/codex/redesign-dashboard-subscription-soft-glass` | 2026-07-18 | shelckograff | no | no | keep: unmerged redesign branch |
| `origin/codex/redesign-intake-plan` | 2026-07-18 | shelckograff | no | no | keep: unmerged |
| `origin/codex/redesign-profile-soft-glass` | 2026-07-18 | shelckograff | no | no | keep: unmerged redesign branch |
| `origin/codex/redesign-slice-handoff` | 2026-07-18 | shelckograff | no | no | keep: unmerged redesign branch |
| `origin/codex/redesign-task-detail-soft-glass` | 2026-07-18 | shelckograff | no | no | keep: unmerged redesign branch |
| `origin/codex/roadmap-beta-gate-monetization` | 2026-07-08 | Alexey Kudashov | yes | yes | can delete: fully merged |
| `origin/docs/4-project-agents-rules` | 2026-07-05 | Alexey Kudashov | no | no | keep: unmerged |
| `origin/docs/agent-deliberation-rules` | 2026-06-27 | shelckograff | yes | yes | can delete: fully merged |
| `origin/docs/agents-v2` | 2026-07-05 | shelckograff | no | no | keep: unmerged |
| `origin/docs/bottom-nav-width-task` | 2026-07-05 | Alexey Kudashov | no | no | keep: unmerged |
| `origin/docs/decision-center-workflow` | 2026-06-27 | shelckograff | yes | yes | can delete: fully merged |
| `origin/docs/delta-sync-2026-07-04b` | 2026-07-04 | shelckograff | yes | yes | can delete: fully merged |
| `origin/docs/git-branch-protocol` | 2026-06-28 | Alexey Kudashov | yes | yes | can delete: fully merged |
| `origin/docs/interface-performance-plan` | 2026-06-27 | Alexey Kudashov | yes | yes | can delete: fully merged |
| `origin/docs/linear-triage-policy` | 2026-07-06 | Alexey Kudashov | yes | yes | can delete: fully merged |
| `origin/docs/notifications-action-cards` | 2026-07-08 | Alexey Kudashov | yes | yes | can delete: fully merged |
| `origin/docs/pm-roadmap-alignment` | 2026-06-26 | Alexey Kudashov | yes | yes | can delete: fully merged |
| `origin/docs/qa-automation-plan` | 2026-06-26 | mrktggod | yes | yes | can delete: fully merged |
| `origin/docs/qa-calendar-nav-regression-20260720` | 2026-07-20 | Alexey Kudashov | no | no | keep: unmerged |
| `origin/docs/qa-lab-client-bug-intake` | 2026-07-24 | shelckograff | no | no | keep: unmerged |
| `origin/docs/rules-review-roadmap` | 2026-06-27 | shelckograff | yes | yes | can delete: fully merged |
| `origin/docs/single-roadmap-source` | 2026-06-27 | Alexey Kudashov | yes | yes | can delete: fully merged |
| `origin/docs/smart-013-task-decomposition` | 2026-07-08 | Alexey Kudashov | yes | yes | can delete: fully merged |
| `origin/docs/smart-014-voice-multi-task-plan` | 2026-07-20 | Alexey Kudashov | no | no | keep: unmerged |
| `origin/docs/task-card-manual-mvp` | 2026-06-27 | shelckograff | yes | yes | can delete: fully merged |
| `origin/docs/task-detail-card-cleanup-task` | 2026-07-05 | Alexey Kudashov | yes | yes | can delete: fully merged |
| `origin/docs/team-sync-protocol` | 2026-07-08 | Alexey Kudashov | yes | yes | can delete: fully merged |
| `origin/docs/team-sync-yuri-claude-git` | 2026-07-08 | Alexey Kudashov | yes | yes | can delete: fully merged |
| `origin/docs/ui-architecture-guard` | 2026-07-06 | Alexey Kudashov | yes | yes | can delete: fully merged |
| `origin/feat/admin-tariff-api` | 2026-07-26 | shelckograff | no | yes | keep: current working branch |
| `origin/feat/ai-planner-glass-dashboard` | 2026-07-01 | shelckograff | yes | yes | can delete: fully merged |
| `origin/feat/biometric-consent` | 2026-06-25 | shelckograff | yes | yes | can delete: fully merged |
| `origin/feat/cal-002-slice` | 2026-07-14 | shelckograff | yes | yes | keep: CAL stop-point name, ask Yuri before deletion |
| `origin/feat/cloudflare-pages-prod` | 2026-07-04 | shelckograff | yes | yes | keep: prod/deploy-sensitive name |
| `origin/feat/email-verification` | 2026-06-28 | shelckograff | yes | yes | can delete: fully merged |
| `origin/feat/extended-profile` | 2026-06-28 | shelckograff | yes | yes | can delete: fully merged |
| `origin/feat/infra-005-yandex-ru-proxy-step1` | 2026-07-11 | shelckograff | no | no | keep: unmerged infra branch |
| `origin/feat/less-architecture` | 2026-06-27 | shelckograff | yes | yes | can delete: fully merged |
| `origin/feat/notifications-live` | 2026-06-28 | shelckograff | yes | yes | can delete: fully merged |
| `origin/feat/relative-dates` | 2026-06-28 | shelckograff | yes | yes | can delete: fully merged |
| `origin/feat/smart-001-002-roster-assignee` | 2026-07-04 | shelckograff | yes | yes | can delete: fully merged |
| `origin/feat/task-card-improvements` | 2026-06-28 | shelckograff | yes | yes | can delete: fully merged |
| `origin/feat/task-detail-mvp` | 2026-07-01 | shelckograff | yes | yes | can delete: fully merged |
| `origin/feat/telegram-stars-yookassa` | 2026-06-28 | shelckograff | yes | yes | keep: payment-sensitive name |
| `origin/feat/vk-pay-subscription` | 2026-06-28 | shelckograff | yes | yes | keep: payment-sensitive name |
| `origin/feat/voice-mediarecorder` | 2026-06-28 | shelckograff | yes | yes | can delete: fully merged |
| `origin/fix/auth-bootstrap-404-fallback` | 2026-07-05 | shelckograff | no | no | keep: unmerged auth-adjacent fix |
| `origin/fix/profile-ui` | 2026-06-28 | shelckograff | yes | yes | can delete: fully merged |
| `origin/fix/reminder-indicator-unified` | 2026-07-24 | shelckograff | no | no | keep: unmerged |
| `origin/fix/reminder-popover-mobile` | 2026-07-23 | shelckograff | no | no | keep: unmerged |
| `origin/fix/task-card-mobile` | 2026-07-01 | shelckograff | yes | yes | can delete: fully merged |
| `origin/main` | 2026-07-21 | shelckograff | yes | yes | keep: protected main branch |

## Summary

- Can delete: 31 branches.
- Keep: 23 branches plus the remote HEAD alias.
- No deletion was performed.

## Verification

- Raw command evidence captured from the required branch commands.
- `node scripts/check-cp1251-mojibake.mjs` passed: `CP1251 mojibake check passed: 0 suspicious tokens`.
- `npm run check:portable-paths` passed after adding Git Bash to PATH for the command.
- `git diff --check` passed.
