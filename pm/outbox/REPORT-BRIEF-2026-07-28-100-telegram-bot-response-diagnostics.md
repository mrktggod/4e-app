# REPORT-BRIEF-2026-07-28-100-telegram-bot-response-diagnostics

Outcome: `NEED-YURI`

## What I Checked

I inspected the allowed app repo context and the local canonical-looking bot
checkout under `X:\Projects\4-ai-secretary\bot`.

Bot boundaries:

- `FILE_MAP.md:16` says Telegram bot is a separate repo: `mrktggod/4e-bot`.
- `FILE_MAP_BOT.md:9` names the repo as `mrktggod/4e-bot`.
- `FILE_MAP_BOT.md:18-20` points to `src/bot/index.js`, `src/bot/handler.js`, and `src/bot/tasks.js` as the current bot modules.
- `FILE_MAP_BOT.md:27-31` says not to change bot logic from `4e-app` without working in the real bot repo.

Local bot checkout status:

- `X:\Projects\4-ai-secretary\bot` exists and is a git checkout of `mrktggod/4e-bot`.
- It is on `main`, not `feat/admin-tariff-api`; no local or remote `feat/admin-tariff-api` branch exists there.
- `X:\Projects\4-ai-secretary\bot\AGENTS.md` is missing.

## Likely No-Reply Root Cause

The plain message reply path is silent when analysis fails or finds nothing:

- `X:\Projects\4-ai-secretary\bot\src\bot\handler.js:98` calls `analyzeMessage(msg.text, sender, date)`.
- `X:\Projects\4-ai-secretary\bot\src\bot\handler.js:99` returns immediately when `result` is empty, so the user receives no bot reply.
- `X:\Projects\4-ai-secretary\bot\src\bot\handler.js:166` catches analyzer errors and only logs them, again without replying to the user.
- `X:\Projects\4-ai-secretary\bot\src\bot\analyzer.js:45` calls Anthropic.
- `X:\Projects\4-ai-secretary\bot\src\bot\analyzer.js:60-64` parses only `data.content[0].text`; API errors, model errors, invalid JSON, or a normal `found:false` response all become a no-reply path.

This is enough to explain "bot files exist, but incoming messages receive no
answer" from local source: the bot only replies when analysis returns a task.
It does not acknowledge ordinary messages or analyzer/API failure.

## Why I Did Not Patch It Autonomously

Restoring real Telegram replies requires changing and deploying the separate
bot service, not the app branch. That crosses the brief stop points:

- no live Telegram API calls with a real bot token;
- no secret changes or inspection;
- no production deploy;
- stop with `NEED-YURI` if the fix requires bot token, hosting control, live webhook/polling setup, or production bot deployment.

The app automation contract also says one task should produce one commit on
`feat/admin-tariff-api`; the bot repo is on `main` and has no matching feature
branch. I did not create or push a bot repo commit from this app runner.

## Recommended Fix For Yuri / Bot Owner

In `mrktggod/4e-bot`, add a narrow mocked test around `src/bot/handler.js` that
emits a representative text update and asserts one of these reply paths:

- task found -> `bot.sendMessage` sends the task confirmation;
- analyzer returns `null` -> bot sends a short "I did not find a task" acknowledgement;
- analyzer throws/API error -> bot sends a short temporary failure acknowledgement.

Then patch `handler.js` so analyzer-null and analyzer-error paths do not stay
silent. Deploy only through the normal bot deployment process after Yuri
approves.

## Verification

Source audit only; no bot runtime change was made.

```text
node scripts/check-cp1251-mojibake.mjs
CP1251 mojibake check passed: 0 suspicious tokens

npm run check:portable-paths
Portable path check passed.

git diff --check
PASS
```

## Explicit Non-Actions

No secrets were printed in this report. No live Telegram API call was made.
No bot token was used. No production deploy was made. No payment,
entitlement, price, CAL, auth-security, or `main` merge work was done.

## Manual Tail

Yuri or the bot owner must approve the bot repo branch/process, apply the
handler fallback fix in `mrktggod/4e-bot`, deploy the bot service, and verify a
real Telegram message receives a reply without exposing tokens.
