status: NEED-YURI

# BRIEF-2026-08-02-123-telegram-group-bot-no-response

## Context

Manual QA 2026-08-02: Telegram bot in a group does not react to messages and does not create tasks.

This matches the existing Yuri-only stop point around live Telegram group behavior and the bot repository being separate from the app checkout.

Related older item: `BRIEF-2026-07-25-69-telegram-group-bot-capture.md`.

## Task

Do not attempt an autonomous app-side fix.

Yuri/Alexey must provide one of:

- canonical bot worktree under `X:\Projects\4-ai-secretary` with fresh instructions and permission to inspect it;
- live group evidence: exact test message, whether bot was mentioned, expected task target, and what the bot answered or did not answer;
- explicit permission for a live bot/group diagnostic.

## Stop Points

- No production deploy.
- No merge into `main`.
- No secret disclosure.
- Do not read non-canonical bot copies.
- Do not send live Telegram messages from automation without explicit permission.

## Verification

Manual/Yuri only.

## Report

If resumed with access/evidence, write `pm/outbox/REPORT-BRIEF-2026-08-02-123-telegram-group-bot-no-response.md`.
