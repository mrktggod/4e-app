status: NEW

# BRIEF-2026-07-28-100-telegram-bot-response-diagnostics

## Context

Telegram bot stopped replying. User signal: bot files exist, but something in the response logic is broken.

This is a repair/diagnostic task for the night session. Do not assume the fix is in the Mini App UI. First locate the bot-side code and the current repo boundaries from `AGENTS.md`, `FILE_MAP.md`, `FILE_MAP_BOT.md`, `DEVELOPMENT_LOG.md`, and any local bot-related scripts/docs available inside the allowed project roots.

If the canonical Telegram bot repository is not locally available under `X:\Projects\4-ai-secretary` and the issue cannot be reproduced from files in `app`, stop with `NEED-YURI` and explain what repo/path/access is missing. Do not inspect or create project files on `C:`.

## Task

Diagnose and restore Telegram bot replies where this can be done safely from local source.

Required steps:

1. Identify the actual bot entrypoints, command/message handlers, worker/webhook or polling glue, and any recent bot-related reports.
2. Find the likely breakage that makes incoming Telegram messages receive no answer.
3. If the root cause is a narrow local code/config bug outside secrets, payments, entitlement, auth-security, production deploy and live Telegram actions, fix it.
4. Add or update a safe local/mock smoke test that proves a representative Telegram update reaches the reply path.
5. Do not rotate, print, remove or edit secrets. Do not call Telegram live API with a real bot token.
6. If the fix requires live Telegram webhook setup, bot token, hosting control, production deploy, or access to a missing bot repo, do not guess: write `NEED-YURI`.

## Stop Points

- No production deploy.
- No merge into `main`.
- No CAL tasks.
- No price changes.
- No payment or entitlement refactors.
- No auth-security changes unless the task becomes `NEED-CLAUDE`.
- No secret rotation, secret removal, secret disclosure, or committing tokens.
- No live Telegram API calls with a real bot token.
- No project files on `C:`; work only under `X:\Projects\4-ai-secretary`.

## Verification

- `node scripts/check-cp1251-mojibake.mjs`
- Bot-specific local/mock smoke proving an incoming Telegram update reaches a reply/send-message path.
- Any existing bot or worker tests relevant to the touched files.
- `npm run check:portable-paths` or the exact guard logic if bash is unavailable in PATH.
- `git diff --check`

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-28-100-telegram-bot-response-diagnostics.md` with:

- root cause with `file:line` references;
- changed files;
- commit SHA;
- raw local/mock proof;
- explicit statement that no secrets/live Telegram/prod deploy/payment/entitlement/CAL work was done;
- remaining manual tail, especially live Telegram webhook/device verification if needed.
