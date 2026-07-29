# REPORT-2026-07-29-need-claude-status-audit

Outcome: `DONE-AUDIT`

## Scope

Yuri asked to check the current `NEED-CLAUDE` backlog and do what is waiting.
This audit does not override explicit stop-points for auth/session, AI,
entitlement, live Telegram/VK API, production, payment, CAL, secrets, or merge
to `main`.

## Current Status Scan

Direct `status: NEED-CLAUDE` entries found in `pm/inbox` / `pm/outbox`:

- `BRIEF-2026-07-28-101-telegram-notification-delivery-contract-preflight.md`
- `BRIEF-2026-07-27-95-telegram-dashboard-one-task-diagnostic.md`
- `BRIEF-2026-07-25-68-ai-delete-intent-safety.md`
- `BRIEF-2026-07-23-49-vk-ai-chat-claude-scope.md`
- `BRIEF-2026-07-23-48-vk-auth-session-claude-scope.md`
- `BRIEF-2026-07-22-39-arch001-status-evidence-audit.md`
- `BRIEF-2026-07-21-night-liquid-glass-system.md`
- `BRIEF-2026-07-20-morning-refine-01-auth-avatar-login-diagnose.md`
- `BRIEF-2026-07-19-10a-auth-avatar-login-diagnose.md`
- Matching historical reports for the same items.

## Items Already Followed Up

- `BRIEF-2026-07-25-68-ai-delete-intent-safety.md` was split into
  `BRIEF-2026-07-26-78-ai-delete-intent-refuse-fix.md`, which is `DONE`.
  The remaining old `NEED-CLAUDE` file is historical evidence, not the next
  implementation target.
- `BRIEF-2026-07-21-night-liquid-glass-system.md` is a broad historical glass
  migration stop-point. Later package briefs handled safe glass slices; this
  item should not be resumed as one broad autonomous task.
- `BRIEF-2026-07-19-10a-auth-avatar-login-diagnose.md` and
  `BRIEF-2026-07-20-morning-refine-01-auth-avatar-login-diagnose.md` contain
  the original auth/avatar diagnosis. The new avatar consistency user report is
  now tracked separately as
  `BRIEF-2026-07-29-107-profile-avatar-cross-surface-consistency.md`.

## Still Gated

- `BRIEF-2026-07-28-101-telegram-notification-delivery-contract-preflight.md`:
  local preflight found a Worker Markdown contract mismatch. Next code change is
  a reviewed Worker patch (`Markdown` vs `MarkdownV2` behavior), not an
  autonomous UI patch.
- `BRIEF-2026-07-27-95-telegram-dashboard-one-task-diagnostic.md`: deterministic
  mocks render the expected top-3 tasks; the reported one-task behavior needs
  live Telegram account/API evidence or backend/cache investigation.
- `BRIEF-2026-07-23-48-vk-auth-session-claude-scope.md`: explicitly auth/session
  adjacent; no runtime code should be changed without Claude/Yuri scope review.
- `BRIEF-2026-07-23-49-vk-ai-chat-claude-scope.md`: explicitly AI/auth/
  entitlement adjacent; no runtime code should be changed without reviewed
  diagnostics.
- `BRIEF-2026-07-22-39-arch001-status-evidence-audit.md`: architecture status
  reconciliation remains a reviewed planning/docs decision.
- `BRIEF-2026-07-29-107-profile-avatar-cross-surface-consistency.md`: queued as
  `NEW`; if the fix requires a shared backend profile/avatar persistence
  contract, classify it as `NEED-CLAUDE` instead of faking consistency locally.

## Done Now

- Fixed the safe web-profile referral-link display bug in
  `BRIEF-2026-07-29-108-web-profile-referral-link-empty.md`.
- Did not touch auth/session, AI entitlement, live VK/Telegram API, production,
  prices, payment, CAL, secrets, or `main`.

## Verification

- `rg -n "^status:\\s*NEED-CLAUDE" pm/inbox pm/outbox`
- Read the current reports/briefs for the active and superseded items above.
- `node scripts/check-cp1251-mojibake.mjs` passed after the referral-link fix.
