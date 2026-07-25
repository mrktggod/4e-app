status: DONE

# REPORT-BRIEF-2026-07-25-64-voice-exit-controls

## Summary

Voice back and cancel now close the active voice flow through the same cleanup path: recognition handlers are detached, recognition is stopped, queued voice timers are cleared, visual step state is reset, and the user returns to the previous safe screen.

## Root Cause

- `index.html:7194`: voice result/error paths used independent `setTimeout()` calls, so delayed pipeline steps could survive a manual exit.
- `index.html:7262`: `closeVoice()` only stopped recognition and always called `goHome()`, instead of clearing all transient voice state and returning to the previous safe screen.

## Changed Files

- `index.html`
- `scripts/voice-exit-controls-smoke.mjs`
- `package.json`
- `FILE_MAP.md`
- `FILE_MAP_UI.md`
- `pm/inbox/BRIEF-2026-07-25-64-voice-exit-controls.md`
- `pm/bugs.md`
- `pm/backlog.md`
- `pm/team-sync.md`
- `shared/WORK_LOG.md`
- `DEVELOPMENT_LOG.md`

## Evidence

Raw local proof:

```text
npm run smoke:voice-exit-controls
voice exit controls smoke: PASS

npm run smoke:premium-voice-gate
premium voice gate smoke: PASS

npm run smoke:voice-consent-checkbox
voice consent checkbox smoke: PASS

node scripts/check-cp1251-mojibake.mjs
CP1251 mojibake check passed: 0 suspicious tokens

npm run check:js-syntax
JS syntax OK: scripts/voice-exit-controls-smoke.mjs
JS syntax OK: index.html inline-script#1
JS syntax OK: index.html inline-script#2
JS syntax OK: index.html inline-script#3

git diff --check
passed
```

Shared guard equivalents run directly because `bash`/`sh` are not on PATH:

```text
Portable path check passed.
inline style attributes = 299 / 465
inline event handlers = 402 / 402
style tags = 0 / 0
inline script tags = 3 / 3
UI architecture equivalent passed.
```

Encoding ritual:

```text
До правки: 112 совпадений
После правки: 112 совпадений
```

## Commit

This task commit on `feat/admin-tariff-api`; final SHA is recorded in git history after commit.

## Tails

- NEEDS-REAL: live Telegram WebView smoke should confirm both visible controls respond to taps while the microphone permission/recording pipeline is active.
- No production deploy or `main` merge was performed.
