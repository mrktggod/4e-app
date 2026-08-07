status: NEED-YURI

# BRIEF-2026-08-02-120-telegram-web-menu-and-voice-buttons-regression

## Context

Manual QA 2026-08-02:

- Telegram Mini App: bottom menu visibility rules are mostly correct, but in dark theme the menu is too high and looks bad.
- Web dark theme: bottom menu moved downward and became too low, likely because a Telegram-specific fix affected web.
- Chat and voice input buttons lost visual quality; Alexey says the redesign sources had better theme-specific buttons that may not have been applied.

## Task

Diagnose and fix the bottom menu geometry separately for Telegram Mini App and web/PWA. Restore the intended high-quality chat and voice buttons for light and dark themes if the redesign source assets/classes are present in the canonical app checkout.

If the correct source assets are not present in `X:\Projects\4-ai-secretary\app`, stop with `NEED-YURI` and report exactly what source file or asset is missing. Do not read old non-canonical checkouts.

## Surface

- Telegram Mini App `index.html`.
- Web/PWA `index.html`.
- Explicitly compare the two surfaces; do not apply a single CSS fix blindly.

## Stop Points

- No production deploy.
- No merge into `main`.
- No CAL tasks.
- No price changes.
- No payment or entitlement refactors.
- No secret rotation, secret removal, or secret disclosure.

## Verification

- `npm run build:css`
- Telegram-focused bottom menu smoke or screenshot evidence in dark theme.
- Web/PWA navigation-safe-area smoke or screenshot evidence in dark theme.
- Chat/voice button visual evidence for light and dark themes.
- `node scripts/check-cp1251-mojibake.mjs`
- `git diff --check`
- `npm run check:portable-paths`

## Report

Write `pm/outbox/REPORT-BRIEF-2026-08-02-120-telegram-web-menu-and-voice-buttons-regression.md` with root cause, changed files, commit SHA, raw proof, and honest tails.
