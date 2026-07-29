# REPORT-BRIEF-2026-07-29-102-ai-chat-keyboard-reserve-padding

Status: DONE

## Root cause

The keyboard-open class was applied to the ask composer (`.ask-bar.ask-input-shell.ask-bar--keyboard-open`), but later glass/light CSS rules reset `padding: 0 !important` on `#ask .ask-input-shell` and `html[data-theme="light"] #ask .ask-bar`.

That late cascade beat the earlier keyboard reserve rule, so Playwright saw `--app-keyboard-offset: 260px` and `.ask-bar--keyboard-open`, but computed `.ask-bar` `padding-bottom` stayed `0`.

## Changed files

- `styles/screens/voice.less`
- `styles/screens/light-redesign.less`
- `styles.css`
- `styles.min.css`
- `pm/inbox/BRIEF-2026-07-29-102-ai-chat-keyboard-reserve-padding.md`
- `pm/outbox/REPORT-BRIEF-2026-07-29-102-ai-chat-keyboard-reserve-padding.md`

## What changed

- Added scoped keyboard-open padding to `.ask-bar--keyboard-open`.
- Added a later, more specific `#ask .ask-input-shell.ask-bar--keyboard-open` override after the glass control reset.
- Added the equivalent light-theme override for `html[data-theme="light"] #ask .ask-bar.ask-bar--keyboard-open`.
- Did not change AI chat JS, `/anthropic`, voice entrypoint, consent, Premium, biometric, payment, entitlement, or auth behavior.

## Before proof

Command:

```text
npx playwright test autotests/tests/web/chat-keyboard.spec.ts --reporter=line --workers=1
```

Before result:

- 2 failed, 2 passed.
- Mobile and desktop both failed at `autotests/tests/web/chat-keyboard.spec.ts:103`.
- Expected `paddingBottom >= 260`.
- Received `paddingBottom = 0`.
- `keyboardOffset` was `260px`.

## After proof

Commands:

```text
npm run build:css
npx playwright test autotests/tests/web/chat-keyboard.spec.ts --reporter=line --workers=1
npm run smoke:voice-exit-controls
npm run smoke:premium-voice-gate
node scripts/check-cp1251-mojibake.mjs
node scripts/check-js-syntax.mjs
PowerShell equivalent for scripts/check-portable-paths.sh
PowerShell equivalent for scripts/check-ui-architecture.sh
git diff --check -- changed 102 files
```

Results:

- `npx playwright test autotests/tests/web/chat-keyboard.spec.ts --reporter=line --workers=1`: PASS, 4/4.
- `npm run smoke:voice-exit-controls`: PASS.
- `npm run smoke:premium-voice-gate`: PASS.
- `node scripts/check-cp1251-mojibake.mjs`: PASS, exit code 0.
- `node scripts/check-js-syntax.mjs`: PASS; no staged JS or HTML files.
- PowerShell portable-path equivalent: PASS.
- PowerShell UI-architecture equivalent: PASS, inline style attributes `284 / 465`, inline event handlers `401 / 402`, style tags `0 / 0`, inline script tags `3 / 3`.
- `git diff --check`: PASS for changed 102 files.

## Review-agent result

PASS. The review agent verified the diff is CSS-only and limited to keyboard-open ask composer padding. It found no readable source diff changes to `premium`, `biometric`, `consent`, `openVoice`, `voice-overlay`, `subscription`, or auth/gate lines.

## Honest tails

No live Telegram keyboard/device QA was run. Evidence is local Playwright browser geometry only.
