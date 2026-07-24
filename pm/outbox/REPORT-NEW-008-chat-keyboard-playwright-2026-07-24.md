status: DONE

# REPORT — NEW-008 chat keyboard Playwright guard

## Task

Upgrade repeatable evidence for `NEW-008` by adding a safe Playwright keyboard geometry smoke, without production deploy, main merge, CAL, prices, secrets, payment, or entitlement work.

## Root Cause

- `scripts/platform-adapter.js`: keyboard bridge already writes `--app-keyboard-offset`.
- `index.html`: ask input focus handler already adds `.ask-bar--keyboard-open`.
- `styles/screens/tasks.less`: `.ask-bar--keyboard-open` declares keyboard padding.
- `styles/screens/voice.less`: later `.ask-input-shell` rules overrode the effective ask bar geometry, so Playwright measured `paddingBottom=0` after focus.

## Changed Files

- `autotests/tests/web/chat-keyboard.spec.ts` — added synthetic auth Playwright smoke for ask keyboard reserve.
- `styles/screens/voice.less` — added a scoped `.ask-input-shell.ask-bar--keyboard-open` rule.
- `styles.css`, `styles.min.css` — rebuilt with `npm run build:css`.
- `FILE_MAP.md` — registered the new test and refreshed autotest coverage line count.
- `pm/autotest-backlog-coverage-2026-07-23.md` — marked the `NEW-008` repeatable slice as done.
- `pm/backlog.md` — moved `NEW-008` to `Auto evidence green / Ready for live QA`.
- `DEVELOPMENT_LOG.md`, `shared/WORK_LOG.md`, `pm/team-sync.md` — synced task status.

## Raw Proof

```text
npm run build:css
Exit code: 0

npm run test:e2e:web
Running 14 tests using 2 workers
14 passed (50.9s)
```

Initial failing evidence before the CSS fix:

```text
chat keyboard geometry › ask input reserves keyboard space without horizontal overflow
Expected paddingBottom >= 260
Received: 0
```

## Remaining Tail

NEEDS-REAL: final acceptance still requires the existing live checklist `docs/tasks/NEW-008-chat-keyboard-live-smoke.md` in a real Telegram Mini App/mobile keyboard environment.

## Status

DONE for autonomous whitelist scope. No live TMA/device, production deploy, main merge, payment, entitlement, price, CAL, or secret work was performed.
