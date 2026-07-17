# MERGE-READINESS-2026-07-17

Date: 2026-07-17
Branch: feat/admin-tariff-api
Scope: pre-merge and production cutover readiness for the current app/worker state.
Mode: evidence-only. No merge to `main`, no production deploy, no price change.

## Verdict

Not ready for merge to `main` or production cutover yet.

The staging API layer is healthy, but there are release blockers that should be resolved before production: production secret naming mismatch for Anthropic, failing worker deploy CI on `main`, and an unresolved tariff year-price mismatch versus the expected product value.

## Blockers

| Blocker | Severity | Evidence | Required action |
| --- | --- | --- | --- |
| Production Anthropic secret name mismatch | P0 | Worker source reads `env.ANTHROPIC_API_KEY`, while production `wrangler secret list` shows `ANTHROPIC_KEY` and does not show `ANTHROPIC_API_KEY`. | Add production secret `ANTHROPIC_API_KEY` with the same intended value, or explicitly change source to support `ANTHROPIC_KEY` fallback and test it. Do not expose the value in docs/logs. |
| Worker `main` deploy CI failing | P0 | Latest `Deploy Worker` runs on `main` failed. Failed log for run `28739783905` says Wrangler in non-interactive mode needs `CLOUDFLARE_API_TOKEN`. Current workflow uses an action `apiToken` input mapped from repo secret `CF_API_TOKEN`, but the CLI log shows the environment variable was not available to Wrangler in that run. | Fix `.github/workflows/deploy.yml` before merge, likely by exporting `CLOUDFLARE_API_TOKEN` from the repo secret or updating the wrangler-action config according to current action docs. Then prove a green deploy run. |
| Tariff year price mismatch | P1 | Worker default tariff config has month `990` and year `9504`; brief expected `990/9950`. Telegram Stars defaults mirror `9504`. | Yuri/Alexey product decision required. Do not change price autonomously inside this branch. |
| Real provider/manual gates remain | P1 | Several `Ready for QA` rows require real browser/provider/bot/device checks. | Finish manual QA list before beta/prod claims. |

## Production secret/name checklist

Checked by name only with `wrangler secret list`; no secret values were printed or stored.

| Secret/binding | Production status | Notes |
| --- | --- | --- |
| `BOT_TOKEN` | Present | Bot runtime/signature flows can use production token name. |
| `BOT_API_TOKEN` | Present | Present as separate legacy/provider token name. |
| `ANTHROPIC_API_KEY` | Missing | Worker source expects this exact name. Blocker. |
| `ANTHROPIC_KEY` | Present | Does not satisfy current source by itself. |
| `OPENAI_KEY` | Present | Present by name. |
| `ADMIN_SECRET` | Present | Present by name. |
| `CLOUDPAYMENTS_API_SECRET` | Present | Source also supports legacy fallback names, but canonical name is present. |
| `TELEGRAM_STARS_WEBHOOK_SECRET` | Present | Present by name. |
| `VK_ID_CLIENT_ID` | Present | VK ID credentials ready. |
| `VK_ID_CLIENT_SECRET` | Present | VK ID credentials ready. |
| `YANDEX_CLIENT_ID` | Present | Present by name; separate Yandex readiness still needs product/provider confirmation. |
| `YANDEX_CLIENT_SECRET` | Present | Present by name; separate Yandex readiness still needs product/provider confirmation. |
| `RESEND_KEY` | Present | Present by name. |
| `PG_HOST`, `PG_PORT`, `PG_DATABASE`, `PG_USER`, `PG_PASSWORD` | Present | Present by name. |

## CI deploy readiness

| Check | Status | Evidence | Next step |
| --- | --- | --- | --- |
| Worker workflow exists | PASS | `.github/workflows/deploy.yml` deploys on pushes to `main`. | Keep. |
| Recent `main` deploys green | FAIL | Four latest listed `Deploy Worker` runs on `main` were failures. | Fix workflow and rerun. |
| Failure root cause captured | PASS | Failed log says non-interactive Wrangler requires `CLOUDFLARE_API_TOKEN`. | Wire env var explicitly or update action usage. |
| App branch readiness | PARTIAL | App branch is used for staging and docs, but manual UI QA remains. | Finish manual QA before merge. |

## Safety checks

| Check | Status | Evidence |
| --- | --- | --- |
| Staging-only expired fixture gate | PASS/SOURCE | `handleAdminExpiredFixture` requires admin and returns 403 unless `APP_BASE_URL` contains `staging`. Production `APP_BASE_URL` is `https://app.4-ai.site`, so source blocks production. No production request was run. |
| `simulatePaymentSuccess` | PASS/SOURCE | Current app function logs `simulatePaymentSuccess disabled in production`; no local self-activation path found from that function in this audit. |
| CloudPayments amount/currency gate | PASS/SOURCE | Worker checks accountId, amount, and currency; amount/currency mismatch returns code 11 / HTTP 400. |
| Telegram Stars amount gate | PASS/SOURCE | Worker checks expected stars amount and `XTR` currency before entitlement activation. |
| Staging API smoke | PASS/LIVE | `api-smoke: OK` against staging worker. |
| Browser-origin CORS | PASS/LIVE | Staging origin preflight returns correct ACAO and allowed methods. |

## Required before merge/prod

1. Add or align production Anthropic secret name: `ANTHROPIC_API_KEY` vs existing `ANTHROPIC_KEY`.
2. Fix worker deploy CI so a push to `main` can deploy with `CLOUDFLARE_API_TOKEN` available to Wrangler.
3. Decide tariff year price: keep source `9504` or change to expected `9950` deliberately.
4. Complete manual/provider/device QA for `Ready for QA` rows listed in the evidence audit.
5. Run a final staging smoke after any secret/workflow/price changes.
6. Only then consider merge to `main` and production deploy.