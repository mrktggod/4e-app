status: DONE

# REPORT-BRIEF-2026-07-19-17-arch001-evidence-upgrade

## Result

Added a current-HEAD `ARCH-001` source evidence supplement to `docs/tasks/EVIDENCE-AUDIT-2026-07-17.md`. `ARCH-001` remains `SOURCE-ONLY`, but now has exact `file:line` references instead of a generic architecture note.

## Confirmed Source References

- `scripts/platform-adapter.js:1110` creates `window.FourPlatform`; `scripts/platform-adapter.js:1156` exports `initVkMiniAppAdapter`.
- `scripts/platform-adapter.js:929` defines `initVkMiniAppAdapter(deps)`.
- `scripts/platform-adapter.js:816`, `829`, `844`, `851`, `858`, `867`, `881`, `887` define Telegram launch/return/pending/bot-link helpers.
- `scripts/platform-adapter.js:908` defines VK launch params.
- `scripts/platform-adapter.js:41`, `63`, `68`, `78` define OAuth redirect, PKCE and state helpers.
- `scripts/platform-adapter.js:95`, `103`, `115`, `137`, `149`, `157`, `166`, `173`, `178` define referral/acquisition helpers.
- `scripts/platform-adapter.js:188`, `194`, `206`, `218`, `809` define dialog/focus helpers.
- `scripts/platform-adapter.js:255`, `269`, `273` define form-error helpers.
- `scripts/platform-adapter.js:240` defines email validation.
- `scripts/platform-adapter.js:244` defines password visibility toggle.
- `scripts/platform-adapter.js:251` defines Enter-submit handling.

## Confirmed Usage References

- `index.html:1839` reads `window.FourPlatform`; `index.html:8266-8267` initializes VK adapter.
- `index.html:1912`, `1916`, `1920`, `1924`, `1928`, `1935`, `1969` use Telegram helpers.
- `index.html:1941`, `1987` use VK launch params for `/auth/vk`.
- `scripts/auth.js:5-19`, `40-49`, `61-76` use OAuth helpers.
- `scripts/auth.js:75-76`, `113-145`; `scripts/auth-handlers.js:53-54`, `261`, `367-368`, `420`; `index.html:1948`, `1986-1993`, `2039`, `2066` use referral/acquisition helpers.
- `index.html:3159-3175`, `3180`, `3377`, `3824`, `3830`, `4728`, `4734`, `8359-8360`, `8397-8399`, `8422` use dialog/focus helpers.
- `scripts/auth.js:171-195`; `scripts/auth-handlers.js:46-49`, `222-224` use form-error helpers.
- `scripts/auth.js:166-167`; `scripts/auth-handlers.js:46`, `222`; `index.html:2075`, `7658` use email validation.
- `scripts/auth-handlers.js:480`, `488` use password toggle helpers.
- `scripts/auth-handlers.js:78`; `scripts/platform-adapter.js:782`, `786`, `793`, `800` use Enter-submit helper.

## Verification

```text
node scripts/check-cp1251-mojibake.mjs
CP1251 mojibake check passed: 0 suspicious tokens

git diff --check
```

## Honest Tails

- No product code changed.
- No live smoke was run; this is intentionally source evidence.
- No production deploy.
- No merge into `main`.
- No CAL, price, secret, payment, or entitlement work.
