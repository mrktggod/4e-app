# REPORT-BRIEF-2026-08-02-120-telegram-web-menu-and-voice-buttons-regression

status: DONE
lessons_read: 1

## Root Cause

- `scripts/telegram-bottom-menu-diagnostic-smoke.mjs` still asserted older Focus artwork and side-button press behavior that are outside the menu/chat/voice regression. This blocked the existing Telegram geometry and center-button asset proof.
- `autotests/tests/web/navigation-safe-area.spec.ts` used incomplete auth/onboarding setup and broad API route matching. On this workstation the default Playwright port `4174` is occupied by a non-static service returning `{"error":"Требуется вход."}` for `/index.html`; running on a free `AUTOTEST_PORT` proves the web/PWA geometry.

## Changed Files

- `autotests/tests/web/navigation-safe-area.spec.ts` - made the web navigation smoke use the actual onboarding key, dark theme, scoped API mocks, and a dark-theme assertion.
- `scripts/telegram-bottom-menu-diagnostic-smoke.mjs` - moved the screenshot artifact to this brief and kept the diagnostic focused on Telegram menu geometry and light/dark center-button assets.
- `docs/tasks/assets/BRIEF-2026-08-02-120-telegram-bottom-menu-dark.png` - Telegram dark screenshot evidence.
- `pm/inbox/BRIEF-2026-08-02-120-telegram-web-menu-and-voice-buttons-regression.md` - moved brief status to DONE.
- `pm/outbox/REPORT-BRIEF-2026-08-02-120-telegram-web-menu-and-voice-buttons-regression.md` - added this report.

No runtime UI CSS/HTML change was needed: canonical assets are present and current computed metrics already match the intended menu and center voice/chat button geometry.

## Verification

- `npm run build:css` - PASS.
- `npm run smoke:telegram-bottom-menu` - PASS. Raw proof: dark Telegram `navBottomGap: 32`, center voice `62x62`, dark center background includes `dark-chat-button-orb.png`; light center background includes `dashboard-light-center-20260806.png`; screenshot saved to `docs/tasks/assets/BRIEF-2026-08-02-120-telegram-bottom-menu-dark.png`.
- `$env:AUTOTEST_PORT='4184'; npm run test:e2e:web -- --grep "navigation safe area"` - PASS, 4/4 tests. Raw proof: mobile and desktop web/PWA dark-theme navigation safe-area tests passed.
- `node scripts/check-cp1251-mojibake.mjs` - PASS, `0 suspicious tokens`.
- `npm run check:portable-paths` - PASS.
- `git diff --check` - PASS.

## Commit

- App commit: d42cb1665be545d8d21ef7e0969a013a4e3c9bee

## Honest Tails

- Default local Playwright port `4174` is occupied by another service on this workstation; use `AUTOTEST_PORT=4184` or another free port for this smoke here.
- No production deploy, no merge into `main`, no CAL, no prices, no secrets, no payment or entitlement changes.
- Pre-existing unrelated local modifications were left untouched.
