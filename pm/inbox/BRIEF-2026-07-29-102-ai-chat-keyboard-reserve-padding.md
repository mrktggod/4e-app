status: NEW

# BRIEF-2026-07-29-102-ai-chat-keyboard-reserve-padding

## Context

Playwright Web failed on AI chat keyboard geometry. The test sets `--app-keyboard-offset=260px`, focuses `#ask-field`, and `.ask-bar--keyboard-open` appears, but computed `padding-bottom` remains `0`.

Proof:

- `npx playwright test autotests/tests/web --reporter=line --workers=1`
- Failed on mobile and desktop in `autotests/tests/web/chat-keyboard.spec.ts`.
- Expected: `paddingBottom >= 260`.
- Actual: `paddingBottom = 0`, `--app-keyboard-offset = 260px`.

## Task

Fix the AI chat composer keyboard reserve so the focused ask input actually reserves vertical space when `.ask-bar--keyboard-open` is present.

Keep the existing voice entrypoint, send button, Premium/biometric gates, and keyboard offset variable behavior.

## Stop Points

- No production deploy.
- No merge into `main`.
- No CAL tasks.
- No price changes.
- No payment or entitlement refactors.
- No secret rotation, secret removal, or secret disclosure.
- Do not rewrite the AI chat flow or `/anthropic` contract.

## Verification

- Before fix: cite the failing Playwright output from QA report.
- After fix:
  - `npx playwright test autotests/tests/web/chat-keyboard.spec.ts --reporter=line --workers=1`
  - `npm run smoke:voice-exit-controls`
  - `npm run smoke:premium-voice-gate`
  - `node scripts/check-cp1251-mojibake.mjs`
  - `node scripts/check-js-syntax.mjs`
  - portable path and UI architecture guards or their PowerShell equivalents.

## Review Agent Check

Another agent must verify that the fix affects keyboard reserve only and does not regress voice open/consent behavior.

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-29-102-ai-chat-keyboard-reserve-padding.md` with root cause, changed files, raw Playwright proof, commit SHA, and live Telegram keyboard manual tail.
