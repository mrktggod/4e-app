# Cloudflare secrets handoff — 2026-07-17

Факт ручного действия: Юрий установил Cloudflare Worker secrets через локальный PowerShell/Wrangler. Значения секретов не передавались в чат, не записывались в файлы и не должны появляться в git.

## 1. Worker folder used

| Field | Value |
| --- | --- |
| Folder | `C:\Users\shelc\Documents\4\4e-worker` |
| Branch observed before secret setup | `feat/admin-tariff-api` |
| Method | `npx wrangler secret put ... --env <env>` |

## 2. Secrets marked as installed by Yuri

| Secret | Staging | Production | Notes |
| --- | --- | --- | --- |
| `BOT_TOKEN` | Installed | Installed | Bot/live checks may use environment binding, not chat-visible token |
| `VK_ID_CLIENT_ID` | Installed | Installed | VK ID live smoke no longer blocked by missing client id |
| `VK_ID_CLIENT_SECRET` | Installed | Installed | VK ID live smoke no longer blocked by missing client secret |
| `YANDEX_CLIENT_ID` | Installed | Installed | Yandex ID setup no longer blocked by missing client id |
| `YANDEX_CLIENT_SECRET` | Installed | Installed | Yandex ID setup no longer blocked by missing client secret |

## 3. Security rules

| Rule | Status |
| --- | --- |
| Secret values are not committed | Required |
| Secret values are not pasted into chat | Required |
| Temporary JSON files with secrets are not used for this handoff | Required |
| Live smoke should show only statuses and non-secret response bodies | Required |

## 4. Remaining work unlocked by this handoff

| Backlog item | New blocker state |
| --- | --- |
| `BACK-045` VK ID + Yandex ID auth | Secret setup is no longer the blocker; next step is staging deploy/live OAuth smoke |
| Bot live checks | `BOT_TOKEN` is installed; next step is runtime/deploy-aware smoke, not secret collection |

## 5. What is not implied

| Not implied | Reason |
| --- | --- |
| OAuth is Done | Needs staging browser smoke and callback verification |
| Production launch is approved | Needs green staging and release decision |
| Secrets are visible to Codex | They remain Cloudflare environment secrets only |