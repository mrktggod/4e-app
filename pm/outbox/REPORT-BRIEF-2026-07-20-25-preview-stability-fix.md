# REPORT-BRIEF-2026-07-20-25-preview-stability-fix

Status: DONE

## Root Cause

- `index.html:2021`: `initApp()` previously entered the real token `/auth/me` path before preview routing. In a shared browser profile, a previous preview tab left `chetam_token=preview-dashboard-demo-token`; the next fresh preview tab could call real `/auth/me` with that demo token, remove it as invalid, and fall through to login.
- `scripts/task-ui-renderers.js:185`: `showScreen()` treated every non-public screen as auth-protected when `getToken()` was empty, so preview-only direct routes like `task-detail` and `chat-conv` could be redirected to login before preview state stabilized.

## Changed

- Added a preview-only early return in `initApp()` before real auth/session checks.
- Added `isDashboardPreviewActive()` and allowed only the dashboard preview screens (`home`, `task-detail`, `profile`, `subscription`, `chats`, `chat-conv`) through `showScreen()` without a real token while `previewDemo=dashboard` is active.
- Allowed `localhost` / `127.0.0.1` for local preview smoke only; production host behavior is unchanged.

## Proof

Local Chrome/CDP smoke against the current checkout with a shared browser profile:

```json
{
  "results": [
    {"name":"dashboard","active":"home","tokenPreview":true},
    {"name":"task-detail","active":"task-detail","tokenPreview":true},
    {"name":"profile","active":"profile","tokenPreview":true},
    {"name":"subscription","active":"subscription","tokenPreview":true},
    {"name":"chats","active":"chats","tokenPreview":true},
    {"name":"chat-conv","active":"chat-conv","tokenPreview":true}
  ],
  "nav": "chats>task-detail"
}
```

Encoding check for `index.html`: `Войти|Задачи|Сегодня` marker count before edit `106`, after edit `106`.

## Checks

- `node scripts/check-cp1251-mojibake.mjs`
- `npm run check:js-syntax`
- `git diff --check`
- `C:\Program Files\Git\bin\bash.exe scripts/check-portable-paths.sh`
- `C:\Program Files\Git\bin\bash.exe scripts/check-ui-architecture.sh`

## Commit

`0217f77bdcf1662c6d8d39b50bd5e216eaa3bede`

## Guardrails

No production deploy, no merge to `main`, no CAL work, no price changes, no secrets, no payment/entitlement changes, and no real auth/password/session logic changes.
