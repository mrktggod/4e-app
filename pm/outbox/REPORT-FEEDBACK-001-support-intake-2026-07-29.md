# REPORT-FEEDBACK-001-support-intake-2026-07-29

Status: DONE for the narrow app/static-worker slice.

## Context

User request: make a simple feedback bot/channel for current users, based on
`FEEDBACK-001` / support-bot intake work if present.

Local basis found:

- `docs/tasks/EVIDENCE-AUDIT-2026-07-17.md` marks `FEEDBACK-001` as
  `Partial Done / PARTIAL`;
- `pm/inbox/PRODUCT_IDEAS_TASKS.md` has `IDEA-001: Подключить Telegram-бота к
  поддержке`;
- the app already has support entry points and `write-support` form in
  `index.html`.

## Implemented

- `index.html`: existing support form now sends a structured request instead
  of only showing a success toast.
- `index.html`: request includes topic, message, user identity fields,
  Telegram identity when available, platform, page, host, theme and user agent.
- `worker-static.js`: added `POST /support` endpoint for the frontend Static
  Assets Worker.
- `worker-static.js`: endpoint sends Telegram `sendMessage` using env
  `SUPPORT_BOT_TOKEN` and `SUPPORT_CHAT_ID`.
- `worker-static.js`: if env is missing, endpoint returns
  `503 support_telegram_not_configured` instead of pretending delivery worked.
- `scripts/support-form-smoke.mjs`: verifies app form payload and UI reset.
- `scripts/worker-static-support-smoke.mjs`: verifies Telegram delivery payload
  through mocked fetch and missing-config behavior.

## Not Done

- No real Telegram token or chat id was added.
- No production deploy.
- No existing Telegram bot repository changes; that repo is not local in this
  checkout.
- No two-way operator reply flow from Telegram back into the app.

## Yuri Setup Needed

Configure secrets/vars for the app Static Assets Worker before real delivery:

- `SUPPORT_BOT_TOKEN`: token for the support bot;
- `SUPPORT_CHAT_ID`: Telegram chat/group id where Yuri/team should receive
  requests.

Then deploy the frontend worker through the normal human-approved process.

## Raw Proof

Encoding:

```text
Step 0 marker count before / after: 45 / 45
CP1251 mojibake check passed: 0 suspicious tokens
```

Support form smoke:

```text
node scripts/support-form-smoke.mjs
"smoke": "support-form"
"viewport": "390x844"
"ok": true
"url": "https://edge.4-ai.site/support"
"method": "POST"
"topic": "Техническая проблема"
"message": "Не открывается список задач после входа"
"source": "app_support_form"
"supportMsgValue": ""
"supportChar": "0/1000"
```

Worker support smoke:

```text
node scripts/worker-static-support-smoke.mjs
"smoke": "worker-static-support"
"ok": true
"telegramCalls": 1
"missingConfigStatus": 503
```

Syntax and guards:

```text
node --check scripts/support-form-smoke.mjs
node --check scripts/worker-static-support-smoke.mjs
node --check worker-static.js
git diff --check
C:\Program Files\Git\bin\bash.exe scripts/check-portable-paths.sh
Portable path check passed.
C:\Program Files\Git\bin\bash.exe scripts/check-ui-architecture.sh
UI architecture guard: inline style attributes = 284 / 465
UI architecture guard: inline event handlers = 401 / 402
UI architecture guard: style tags = 0 / 0
UI architecture guard: inline script tags = 3 / 3
```

Npm wrapper note:

```text
npm run check:portable-paths
npm run check:ui-architecture
spawnSync bash ENOENT
```

The direct Git Bash versions of both guards passed.

## Commit Status

Not committed in this run. The worktree already contained unrelated dirty
runtime, documentation and screenshot changes before the FEEDBACK-001 edits, so
the support intake slice was left for human/Claude staging review.
