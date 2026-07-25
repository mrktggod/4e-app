# REPORT-BRIEF-2026-07-25-67-chat-voice-entrypoint

Status: DONE
Branch: `feat/admin-tariff-api`
App commit: this commit

## Task

Add a clear voice input entrypoint inside the AI chat composer without adding a new voice backend or changing Premium/payment/entitlement policy.

## Root Cause

- `index.html:435-439`: the `ask-bar` composer had a textarea and send button, but no primary voice control inside the typing surface. The only voice affordance was elsewhere, so users could miss voice input while chatting.
- Existing voice policy path was already centralized in `openVoice()` at `index.html:7203`; the fix only needed to call that existing function.

## Changed Files

- `index.html`: added an accessible microphone button inside the AI chat composer, wired to `openVoice()`.
- `styles/screens/voice.less`: changed the composer grid to textarea + voice + send and added button/focus/active styles.
- `styles/screens/light-redesign.less`: added light-theme treatment for the voice button.
- `styles.css`, `styles.min.css`: rebuilt from LESS.
- `autotests/tests/web/chat-keyboard.spec.ts`: added focused coverage proving the voice entrypoint is visible, tap-sized, and wired to the biometric consent gate.
- `FILE_MAP.md`, `FILE_MAP_UI.md`: updated line counts and AI chat map notes.
- `pm/backlog.md`, `pm/bugs.md`, `pm/team-sync.md`, `shared/WORK_LOG.md`, `DEVELOPMENT_LOG.md`: synchronized PM/team status.

## Raw Evidence

```text
npx playwright test autotests/tests/web/chat-keyboard.spec.ts
4 passed
```

```text
Encoding ritual for index.html:
Before: 112 matches for Войти|Задачи|Сегодня
After: 112 matches for Войти|Задачи|Сегодня
```

Shared guards are run before commit:

- `npm run build:css`
- `node scripts/check-cp1251-mojibake.mjs`
- `npm run check:js-syntax`
- Direct portable path guard equivalent, because `bash` is unavailable on PATH in this runner.
- Direct UI architecture guard equivalent, because `bash` is unavailable on PATH in this runner.
- `git diff --cached --check`

## Scope Notes

- No production deploy.
- No merge into `main`.
- No new voice backend.
- No payment, price, entitlement, or Premium-policy refactor.
- No secrets touched.

## Tail

NEEDS-REAL: final Telegram Mini App/manual device QA should confirm the composer microphone is obvious in the live mobile container.
