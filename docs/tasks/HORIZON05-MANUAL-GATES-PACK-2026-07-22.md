# Horizon 0.5 Manual Gates Pack — 2026-07-22

Purpose: keep Horizon 0.5 manual-only work visible without running live Telegram, OAuth, provider, production, payment, entitlement, CAL, or secret actions during autonomous runs.

## Source Docs

| Source | Used For |
|---|---|
| `docs/tasks/SMART-004-group-task-capture-smoke.md` | Telegram group task capture live checklist |
| `docs/tasks/SMART-011-waiting-on-people-smoke.md` | Telegram waiting-on-people reminder live checklist |
| `docs/tasks/RELEASE-BETA-GATES-2026-07-16.md` | Beta gate grouping and manual-only boundaries |
| `shared/ROADMAP.md` | Current Horizon 0.5 statuses for SMART-004, SMART-011, BACK-045, BACK-008 |
| `pm/tail-closeout-2026-07-17.md` | Manual/platform/secret blocker framing |

## Manual Gates

| Gate | Current Status | Owner Bucket | Surface | Safe Prep Steps | Expected Result | Raw Evidence To Capture |
|---|---|---|---|---|---|---|
| SMART-004 group task capture | Ready for QA | Alexey can run if Yuri provides safe test group/runtime context; otherwise Yuri | Real Telegram group + bot + app task list | Use a non-personal test group; use synthetic task text; avoid private user data; follow `docs/tasks/SMART-004-group-task-capture-smoke.md` without changing bot/runtime code | Bot gives one concise confirmation, task appears for the correct user/context, edit/delete actions behave honestly, irrelevant chatter does not create spam | Screenshot or copied Telegram message IDs for each checklist row, app task ID/user context proof, list of failed rows |
| SMART-011 waiting-on-people reminder | Ready for QA | Yuri-only for live Telegram recipient/copy/no-spam signoff; Alexey can observe | Real Telegram group/private recipient + bot reminder CTA | Use synthetic users or agreed test accounts; run one reminder then quick repeat; do not use Yuri personal data as proof; follow `docs/tasks/SMART-011-waiting-on-people-smoke.md` | Reminder reaches the intended recipient/chat, copy is acceptable, quick repeat does not spam, missing Telegram link has a clear fallback | Telegram delivery proof, recipient/chat proof, duplicate-click result, copy approval note, failed rows |
| BACK-045 VK/Yandex OAuth smoke | Ready for QA | Yuri-only for provider accounts/secrets and live browser OAuth | VK ID and Yandex ID browser OAuth callback | Confirm staging/prod target explicitly before run; use provider test account; never paste secrets into docs/chat; do not broaden scopes beyond approved fields | OAuth login completes, callback returns to app, account identity is correct, email path remains unaffected | Browser URL redacted to remove tokens, status/result screenshots, account identity proof with sensitive fields redacted, provider/error logs without secrets |
| BACK-008 Yandex Cloud PostgreSQL migration gate | Manual blocker | Yuri/provider/infrastructure owner | Yandex Cloud PostgreSQL + future HTTP gateway/Cloud Function between worker and DB | Confirm cluster status and intended gateway owner; document connection model without credentials; do not rotate/remove/disclose secrets; no worker migration changes in autonomous run | A named gateway plan exists with owner, staging target, rollback posture, and secret handling boundaries before code work starts | Provider resource IDs only if non-secret, architecture note, owner/date, redacted staging proof when gateway exists |

## Bucket Split

| Bucket | Gates |
|---|---|
| Alexey can do with safe test context | SMART-004 observation/run checklist if Yuri has already prepared bot/runtime/group context |
| Yuri-only | SMART-011 final live-recipient/no-spam signoff; BACK-045 provider OAuth live smoke; BACK-008 infrastructure/gateway decision |
| Provider/secret needed | BACK-045 provider accounts/callbacks; BACK-008 Yandex Cloud gateway/DB connection handling |

## Stop Rules

- Do not mark these gates Done from source review or headless/browser-only evidence.
- Do not run live Telegram/OAuth/provider/payment actions from autonomous night runs.
- Do not write secrets, tokens, provider callback payloads, or personal data into reports.
- Payment and entitlement gates remain outside this pack except where `RELEASE-BETA-GATES-2026-07-16.md` references them as separate beta blockers.

## Morning Order

1. Yuri confirms whether any live provider/group context is available.
2. Alexey or Yuri runs only the matching checklist.
3. Evidence is copied into the original checklist doc and summarized in `pm/team-sync.md`.
4. If a P0/P1 finding appears, open or update `pm/bugs.md` before changing status.
