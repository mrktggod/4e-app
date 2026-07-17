# Staging automated QA evidence — 2026-07-17

## Scope

This is the autonomous, non-manual slice from `pm/next-cycle-matrix-2026-07-17.md`.

Manual-only rows remain manual: real Telegram Mini App safe-area, mobile keyboard, real payment purchase, real Telegram group delivery, and Russia/no-VPN checks were not marked Done from this run.

## Environment

| Field | Value |
| --- | --- |
| App URL | `https://4-ai-staging.pages.dev/` |
| Worker URL | `https://restless-lab-d737-staging.shelckograff.workers.dev` |
| Branch | `feat/admin-tariff-api` |
| Date | 2026-07-17 |

## Results

| Area | Result | Evidence |
| --- | --- | --- |
| Staging app shell | PASS | `GET https://4-ai-staging.pages.dev/ -> 200`, HTML length `442732` |
| Staging worker wiring | PASS | HTML contains `restless-lab-d737-staging.shelckograff.workers.dev` |
| Browser CORS preflight | PASS | `OPTIONS /auth/login` with `Origin: https://4-ai-staging.pages.dev` returned `204`; `Access-Control-Allow-Origin: https://4-ai-staging.pages.dev` |
| Auth API | PASS | register/login/auth-me all returned `200` in `api-smoke` |
| Forgot password negative | PASS | empty/invalid email both returned `400` |
| Two-user Telegram-linked task flow | PASS | creator/receiver link returned `200`; created task appeared in receiver list |
| Task create/done/delete | PASS | `save-task`, `done-task`, `delete-task` all returned `200` |
| AI endpoint | PASS | `/anthropic` returned `200` |
| Transcribe negative | PASS | `/transcribe` without file returned `400` |

## Raw command output

`WORKER_BASE_URL=https://restless-lab-d737-staging.shelckograff.workers.dev node scripts/api-smoke.mjs`

```text
api-smoke: worker=https://restless-lab-d737-staging.shelckograff.workers.dev
forgot-password(empty): 400 737ms
forgot-password(invalid): 400 423ms
register: 200 767ms
login: 200 235ms
auth/me: 200 97ms
register(user2): 200 478ms
login(user2): 200 207ms
telegram link(creator): 200 1552ms
telegram link(receiver): 200 1313ms
tasks.list.before: 200 90ms
tasks.create: 200 507ms
tasks.list.after: 200 93ms
tasks.list.receiver: 200 90ms
tasks.done: 200 121ms
tasks.delete: 200 203ms
anthropic(smoke): 200 2061ms
transcribe(no-file): 400 101ms
api-smoke: OK
```

Staging app shell / CORS:

```text
GET https://4-ai-staging.pages.dev/
STATUS: 200
LEN: 442732
WORKER: staging worker found
REFERRAL_SYMBOL: buildReferralLink text present

OPTIONS https://restless-lab-d737-staging.shelckograff.workers.dev/auth/login
Origin: https://4-ai-staging.pages.dev
STATUS: 204
ACAO: https://4-ai-staging.pages.dev
ACAM: GET, POST, PUT, OPTIONS
```

## Manual gates not closed by this run

| Area | Why still gated |
| --- | --- |
| `BACK-035` full QA | This run covers automated API only, not complete manual checklist |
| `BACK-036` / `BACK-041` Telegram fallback | Requires real Telegram behavior/history path |
| `BACK-045` OAuth | Requires real browser OAuth provider callback |
| `HOME-001`, `BACK-050`, `NEW-006`, `NEW-008`, `NEW-020` | Require manual/browser/mobile/TMA visual and keyboard checks |
| `BACK-009`, `BACK-010`, `BACK-019`, `BACK-040` | Payment/gate checks must not become paid-launch approval from API-only smoke |
| `SMART-004`, `SMART-011` | Require real Telegram group/runtime confirmation |
| `INFRA-001`, `INFRA-002` | Require production/Russia/no-VPN checks |

## Decision

Automated core staging layer is green. No new P0/P1 bug was found in this autonomous run.

Beta invite is still not automatically approved because the matrix explicitly requires manual core/mobile checks before the invite decision.
