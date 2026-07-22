# REPORT-BRIEF-2026-07-22-34-chat-history-over-40-evidence

## Outcome

status: DONE

## Root Cause by Layer

Storage layer:

- App-side AI chat local session history is intentionally bounded by `ASK_HISTORY_MAX = 40` and saved after `trimAskHistory()`.
- This evidence does not prove remote Worker storage loss. It only proves the app layer keeps/loads a visible last-message window.
- For task chat, existing PM evidence says Worker stores a bounded KV history, but this app-repo run did not inspect or change Worker code.

API/load layer:

- `index.html:6095` defines `ASK_HISTORY_MAX = 40`.
- `index.html:6140` requests `/ai/messages?limit=40` via `ASK_HISTORY_MAX`.
- `index.html:5634` requests `/messages/task?...&limit=40`.

UI layer:

- AI chat renders only the loaded/trimmed `askHistory` window.
- Task chat UI can render every item supplied in `currentTaskMessages`, but the frontend loader only asks the API for 40 messages.
- Task-chat AI prompt context separately uses only the last 6 messages; that is prompt-context behavior, not visible history storage.

## Changed Files

- `package.json`
- `scripts/chat-history-over-40-evidence.mjs`
- `pm/inbox/BRIEF-2026-07-22-34-chat-history-over-40-evidence.md`
- `pm/outbox/REPORT-BRIEF-2026-07-22-34-chat-history-over-40-evidence.md`

## Raw Proof

Command:

```text
npm run smoke:chat-history40
```

Key output:

```json
{
  "ai": {
    "fixtureMessages": 60,
    "localSessionWindow": 40,
    "localFirstVisible": "ai-message-21",
    "localLastVisible": "ai-message-60",
    "remoteRequestedLimit": 40,
    "remoteLoadedWindow": 40
  },
  "taskChat": {
    "fixtureMessages": 60,
    "frontendRequestedLimit": 40,
    "apiWindowFirstVisible": "task-message-21",
    "apiWindowLastVisible": "task-message-60",
    "uiRenderedCountIfSupplied": 60,
    "promptContextWindow": 6
  },
  "conclusion": "Frontend shows a last-message window without pagination; this evidence does not prove remote storage loss."
}
```

## Verification

- `npm run smoke:chat-history40`
- `node scripts/check-cp1251-mojibake.mjs`
- `node --check scripts/chat-history-over-40-evidence.mjs`
- `git diff --check`
- `scripts/check-portable-paths.sh` via Git Bash

## Commit

Pending this task commit.

## Next Decision

NEEDS-CLAUDE: If the product expectation is access to older chat messages, this needs a reviewed pagination/API contract brief. A runtime fix was not made because changing the loaded window, retention semantics, or Worker API behavior is a product/API decision, not a local obvious frontend bug.
