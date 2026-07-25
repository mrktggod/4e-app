status: NEW

# BRIEF-2026-07-25-69-telegram-group-bot-capture

## Context

Linked bug: `BUG-2026-07-25-016`.

In a Telegram group, the bot does not answer and does not capture tasks after being removed and added back.

## Task

Audit the Telegram group capture/respond path and either fix a narrow source issue or classify the exact blocker. The app repo notes that the bot repo is separate; do not guess if the needed code or live Telegram evidence is unavailable.

## Stop Points

- No production deploy.
- No merge into `main`.
- No live Telegram actions from automation.
- No bot secret rotation/removal/disclosure.
- No payment, entitlement, CAL, or price work.
- If the local bot repo is unavailable or live Telegram is required, write `NEED-CLAUDE` or `NEED-YURI` report.

## Verification

- Source audit evidence with file/line references where available.
- Any local bot tests only if the bot repo is safely available.
- `node scripts/check-cp1251-mojibake.mjs` for app repo PM/report changes.

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-25-69-telegram-group-bot-capture.md`.

