# REPORT-2026-07-29-vk-oauth-profile-linking

status: PARTIAL / NEED-YURI

## Result

Two separate issues were checked.

1. Production VK ID login is not failing because of the previous `window.PLATFORM` alias bug. Live production evidence shows `window.PLATFORM === window.FourPlatform`, `window.startOAuthLogin` exists, and `/auth/vk-id/start` returns HTTP 200.
2. The current VK ID failure happens after redirecting to VK ID: VK returns `invalid_request` with message `redirect_uri is missing or invalid` for `redirect_uri=https://app.4-ai.site/`.

This requires Yuri/provider-side action in VK ID settings: add/verify the allowed redirect URI for production `https://app.4-ai.site/` for client `54636698`. Current staging `https://4-ai-staging.pages.dev/` shows the same VK-side error in a fresh live probe, so the provider config likely changed or the earlier green test used a different target/config.

No production deploy, no merge to `main`, no secrets, no payments, no entitlement logic, no CAL, and no live account login were performed.

## Live Evidence

### Production

- URL: `https://app.4-ai.site/`
- `window.PLATFORM`: present
- `window.FourPlatform`: present
- `window.PLATFORM === window.FourPlatform`: true
- `window.WORKER`: `https://edge.4-ai.site`
- `/auth/vk-id/start`: HTTP 200
- VK ID URL includes `redirect_uri=https%3A%2F%2Fapp.4-ai.site%2F`
- VK page text: `Fehler beim Hochladen`
- Console error: `{message: redirect_uri is missing or invalid, code: invalid_request, additional_data: Array(0)}`

### Staging Cross-check

- URL: `https://4-ai-staging.pages.dev/`
- `window.PLATFORM === window.FourPlatform`: true
- `window.WORKER`: `https://restless-lab-d737-staging.shelckograff.workers.dev`
- `/auth/vk-id/start`: HTTP 200
- VK page shows the same `redirect_uri is missing or invalid` error for `https://4-ai-staging.pages.dev/`

## Frontend Change

Profile contact/link buttons no longer use fake local verification for phone.

- Phone button now starts Yandex ID linking instead of toggling local `phoneVerified`.
- Web profile now has explicit VK ID and Yandex ID rows.
- VK ID / Yandex ID buttons call the existing OAuth flow from the current logged-in session.
- Existing OAuth callback already sends the current `x-token` and the worker path merges via the existing BACK-026 logic when `activeSessionUser` differs from the OAuth user.
- Email remains on the real `/auth/request-email-verification` path.

## Manual Merge Option for Yuri's Current Split

Recommended manual path after provider redirect config is fixed:

1. Yuri opens the account that still has the tasks.
2. In Profile, click `Привязать Яндекс ID`.
3. Complete Yandex login with the Yandex account that currently opens the empty profile.
4. The OAuth callback returns with the active session token; worker `signInWithOAuthProfile()` detects the other Yandex-owned account and calls existing `mergeAccounts(activeSessionUser, user)`.
5. The current task account remains the canonical account, and the empty Yandex-created account is merged into it.

If provider OAuth cannot be used, the safer fallback is a Yuri-only admin/manual merge by exact two user ids in the backend datastore. That should be handled as a separate `NEED-YURI` operation with IDs supplied out-of-band and no secrets in reports.

## Verification

- `node scripts/profile-account-link-smoke.mjs` -> PASS
- `node --check scripts/profile-account-link-smoke.mjs` -> PASS
- `node scripts/check-cp1251-mojibake.mjs` -> PASS, `0 suspicious tokens`
- `node scripts/check-js-syntax.mjs` -> PASS for staged `index.html` and `scripts/profile-account-link-smoke.mjs`.

## Remaining Blockers

- NEED-YURI: fix VK ID allowed redirect URI for `https://app.4-ai.site/` in provider settings.
- NEED-YURI: decide whether to also restore staging redirect URI `https://4-ai-staging.pages.dev/`.
- Manual live account merge test must wait until provider redirect config is fixed.
