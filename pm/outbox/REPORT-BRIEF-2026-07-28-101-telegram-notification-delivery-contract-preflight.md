# REPORT-BRIEF-2026-07-28-101-telegram-notification-delivery-contract-preflight

Outcome: `NEED-CLAUDE`

## Path Map

App notification UI:

- `scripts/task-ui-renderers.js:342` loads `/notifications`.
- `scripts/task-ui-renderers.js:403` keeps notification Telegram recipient fields as `assigneeTgId`, `telegramId`, or `tgId` for UI actions.

Worker settings and collection path:

- `X:\Projects\4-ai-secretary\worker\worker.js:695-715` defines and normalizes notification settings.
- `X:\Projects\4-ai-secretary\worker\worker.js:719-736` reads notification settings.
- `X:\Projects\4-ai-secretary\worker\worker.js:4124-4128` checks `telegram`, task and overdue settings, then resolves `tg_rev:<userId>`.
- `X:\Projects\4-ai-secretary\worker\worker.js:4191-4238` collects morning briefings and resolves `telegramId`.
- `X:\Projects\4-ai-secretary\worker\worker.js:4248-4263` runs briefing cron and calls `sendTelegramBotMessage(briefing.telegramId, buildBriefingMessage(...))`.

Worker send boundary:

- `X:\Projects\4-ai-secretary\worker\worker.js:1949-1971` builds the Telegram `sendMessage` payload and calls `https://api.telegram.org/bot<token>/sendMessage`.
- `X:\Projects\4-ai-secretary\worker\worker.js:4739-4745` exposes `/notifications/settings`.
- `X:\Projects\4-ai-secretary\worker\worker.js:4773-4774` exposes `/briefings/check`.

## Local Preflight Result

Added `scripts/telegram-notification-delivery-contract-smoke.mjs` and
`npm run smoke:telegram-notification-contract`.

The smoke is intentionally local-only:

- reads sibling `../worker/worker.js`;
- extracts `buildBriefingMessage` and `sendTelegramBotMessage`;
- mocks `fetch`;
- uses a fake `local-test-token`;
- redacts the token-like segment in output;
- makes no live Telegram API call.

It found a contract mismatch:

- `X:\Projects\4-ai-secretary\worker\worker.js:4156-4162` escapes briefing task lines with `escapeMarkdownV2`.
- `X:\Projects\4-ai-secretary\worker\worker.js:1955` sends the payload with `parse_mode: "Markdown"`, not `MarkdownV2`.

That means the safe local preflight cannot honestly prove the intended
Telegram copy contract. The next fix should be a reviewed worker patch, likely
changing the briefing send boundary to `MarkdownV2` or changing briefing copy
escaping to match `Markdown`.

## Raw Local Proof

```text
npm run smoke:telegram-notification-contract

AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
+ actual - expected

+ 'Markdown'
- 'MarkdownV2'
           ^

at scripts/telegram-notification-delivery-contract-smoke.mjs:117:8
```

Syntax proof for the new smoke:

```text
node --check scripts/telegram-notification-delivery-contract-smoke.mjs
PASS
```

## Changed Files

- `package.json`
- `FILE_MAP.md`
- `scripts/telegram-notification-delivery-contract-smoke.mjs`
- `pm/inbox/BRIEF-2026-07-28-101-telegram-notification-delivery-contract-preflight.md`
- `pm/outbox/REPORT-BRIEF-2026-07-28-101-telegram-notification-delivery-contract-preflight.md`

No worker runtime code was changed in this app commit.

## Verification

```text
node --check scripts/telegram-notification-delivery-contract-smoke.mjs
PASS

node scripts/check-cp1251-mojibake.mjs
CP1251 mojibake check passed: 0 suspicious tokens

npm run check:portable-paths
Portable path check passed.

git diff --check
PASS
```

## Remaining Gates

BACK-017 and BACK-064 stay manual/live:

- real Telegram/device delivery still must be checked by Yuri or the bot/worker owner;
- no live Telegram API calls, webhook changes, bot tokens, secrets, production deploy, payment, entitlement, CAL, auth-security, or `main` merge work was done.
