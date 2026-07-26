# REPORT-BRIEF-2026-07-25-75-platform-global-alias-oauth-diagnostics

Status: DONE

## Short Answer

VK ID and Yandex ID login do not start on the current shared staging page `https://4-ai-staging.pages.dev/`.

I did not change code. I did not test production because this automation has a no-production stop point.

## Source Check

Current branch source now contains the intended global bridge in `index.html`:

| File | Line | Finding |
| --- | ---: | --- |
| `index.html` | 1898 | `const PLATFORM=window.FourPlatform||{};` |
| `index.html` | 1899 | `window.PLATFORM=PLATFORM;` |
| `index.html` | 1906 | `window.WORKER=WORKER;` |

However, the live shared staging page did not expose those globals during the click test.

## `window.PLATFORM` Access Table

| File:line | When `window.PLATFORM` is undefined |
| --- | --- |
| `scripts/auth.js:6` | Safe fallback: redirect URI becomes current page URL. |
| `scripts/auth.js:10` | Hard failure: `createOAuthPkce()` throws `platform adapter unavailable`. This blocks VK/Yandex OAuth start. |
| `scripts/auth.js:11` | Would call PKCE helper only if line 10 passed. |
| `scripts/auth.js:15` | Safe no-op: OAuth state is not remembered. |
| `scripts/auth.js:19` | Safe fallback returns `null`; OAuth callback cannot recover pending state. |
| `scripts/auth.js:100` | Safe fallback: VK Mini App context is false. |
| `scripts/auth.js:106` | Safe fallback: Telegram start token is empty. |
| `scripts/auth.js:110` | Safe fallback: local referral normalization. |
| `scripts/auth.js:114` | Safe fallback: referral code from launch is empty. |
| `scripts/auth.js:119` | Safe fallback: attribution is `{}`. |
| `scripts/auth.js:126` | Safe no-op: pending referral is not saved through adapter. |
| `scripts/auth.js:130` | Safe fallback: pending referral is empty. |
| `scripts/auth.js:134` | Safe no-op: pending referral is not cleared through adapter. |
| `scripts/auth.js:138` | Safe no-op: launch referral capture does not run. |
| `scripts/auth.js:142` | Safe fallback: referral link is empty unless another global helper exists. |
| `scripts/auth.js:160` | Safe fallback: Telegram return URL is current page. |
| `scripts/auth.js:167` | Safe fallback: email validation is simple `@` check. |
| `scripts/auth.js:171-172` | Safe fallback path is used; modern field error helper is skipped. |
| `scripts/auth.js:194-195` | Safe no-op/fallback: modern form error clearing is skipped. |
| `scripts/auth.js:205-206` | Safe fallback: no adapter focus helper. |

`scripts/auth-handlers.js` does not use `window.PLATFORM`; it uses free variable `PLATFORM`:

| File:line | If no global `PLATFORM` binding exists |
| --- | --- |
| `scripts/auth-handlers.js:78` | `submitLoginOnEnter` can throw `ReferenceError` when called. |
| `scripts/auth-handlers.js:646` | Password visibility toggle can throw `ReferenceError`. |
| `scripts/auth-handlers.js:654` | Change-password visibility toggle can throw `ReferenceError`. |

## Live Staging Click Evidence

Environment: `https://4-ai-staging.pages.dev/`, 390x844 headless Chrome. I clicked through onboarding with the visible skip control, then clicked the real VK/Yandex buttons. No account credentials were entered.

Before VK click:

```json
{
  "active": ["login"],
  "platformGlobal": false,
  "platformIsAdapter": false,
  "worker": null,
  "startOAuthType": "function"
}
```

After VK click:

```json
{
  "url": "https://4-ai-staging.pages.dev/",
  "active": ["login"],
  "toast": "Сервис входа временно недоступен"
}
```

Before Yandex click:

```json
{
  "active": ["login"],
  "platformGlobal": false,
  "platformIsAdapter": false,
  "worker": null,
  "startOAuthType": "function"
}
```

After Yandex click:

```json
{
  "url": "https://4-ai-staging.pages.dev/",
  "active": ["login"],
  "toast": "Сервис входа временно недоступен"
}
```

## Conclusion

Current shared staging: VK ID and Yandex ID login do not work at OAuth start. The app stays on the login screen and shows `Сервис входа временно недоступен`.

Production: not tested. The automation is not allowed to perform production checks. Yuri or a manual QA owner should verify production only if needed.

## Proposed Fix Plan

No code was changed in this run. The safe next step is to deploy/sync staging from current `feat/admin-tariff-api`, then repeat the same click test. If `window.PLATFORM === window.FourPlatform` and `window.WORKER` are present but provider start still fails, the next diagnostic should inspect `/auth/vk-id/start` and `/auth/yandex-id/start` responses without exposing secrets.

## Verification

- Source inventory with `rg` and line-number reads.
- Live staging browser clicks on both OAuth buttons.
- `node scripts/check-cp1251-mojibake.mjs` should be run before commit.
