# REPORT-BRIEF-2026-07-25-69-telegram-group-bot-capture

Status: NEED-YURI
Branch: `feat/admin-tariff-api`
Commit: this commit

## Task

Audit or fix Telegram group capture/respond path for `BUG-2026-07-25-016`.

## Blocker

The automation cannot safely perform this task from the app checkout:

- `FILE_MAP.md:16` says Telegram bot is a separate repository `mrktggod/4e-bot` and is locally not connected to this app checkout.
- `FILE_MAP_BOT.md:7-13` says the bot repo is separate, GitHub app access is unavailable, and SSH access is not configured.
- `FILE_MAP_BOT.md:27-31` says not to change bot logic from `4e-app` without access to the bot repository.
- Current project instructions mark local `4e-bot-repo`, `src\bot`, and other copies as non-canon; working in them would violate the disk/canon rule.
- The brief forbids live Telegram actions from automation.

## Why NEED-YURI

This bug depends on either canonical bot source or live Telegram group behavior after remove/re-add. Both are outside the safe app-runner scope:

- If the source issue is in bot update handling, the canonical bot repo/worktree must be provided first.
- If the issue is platform/runtime behavior, Yuri/manual QA must provide live Telegram evidence because automation cannot perform live group actions.

## Evidence

```text
FILE_MAP.md:16 Telegram bot | separate repo mrktggod/4e-bot | locally not connected
FILE_MAP_BOT.md:7-13 repo/access status: bot repo separate, GitHub app access unavailable, SSH unavailable
FILE_MAP_BOT.md:27-31 do not change bot logic from 4e-app without bot repo access
pm/inbox/BRIEF-2026-07-25-69... Stop Points: no live Telegram actions from automation
```

## Proposed Next Step

Yuri should provide one of:

- A canonical bot worktree inside `X:\4` with fresh `AGENTS.md`/file map and permission to audit it.
- A Claude-reviewed source brief against the actual `mrktggod/4e-bot` repo.
- Live Telegram group reproduction evidence after bot remove/re-add, without exposing secrets.

## Scope Notes

- No production deploy.
- No merge into `main`.
- No bot secret rotation/removal/disclosure.
- No payment, entitlement, CAL, or price work.
- No runtime files changed.
