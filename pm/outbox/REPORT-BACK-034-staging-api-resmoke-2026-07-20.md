status: DONE

# REPORT-BACK-034-staging-api-resmoke-2026-07-20

## Task

Refresh safe staging evidence for `BACK-034` after the redesign cutover note that staging API smoke had failed at `register: 500`.

## Root cause

`DEVELOPMENT_LOG.md` recorded a known tail from the 2026-07-18 redesign cutover: staging API smoke failed at `register: 500`. `shared/ROADMAP.md` still listed the staging contour as `Ready for QA`, while `pm/backlog.md` already had `BACK-034` as `Done`.

## Changed files

- `docs/tasks/STAGING-AUTOMATED-QA-2026-07-17.md` - appended 2026-07-20 resmoke evidence.
- `shared/ROADMAP.md` - synchronized the staging-contour row to `Done`.
- `docs/tasks/EVIDENCE-AUDIT-2026-07-17.md` - refreshed `BACK-034` evidence note.
- `pm/outbox/REPORT-BACK-034-staging-api-resmoke-2026-07-20.md` - this report.
- `DEVELOPMENT_LOG.md`, `shared/WORK_LOG.md`, `pm/team-sync.md` - coordination logs.

## Raw proof

```text
WORKER_BASE_URL=https://restless-lab-d737-staging.shelckograff.workers.dev npm run api-smoke

forgot-password(empty): 400
forgot-password(invalid): 400
register: 200
login: 200
auth/me: 200
register(user2): 200
login(user2): 200
telegram link(creator): 200
telegram link(receiver): 200
tasks.list.before: 200
tasks.create: 200
tasks.list.after: 200
tasks.list.receiver: 200
tasks.done: 200
tasks.delete: 200
anthropic(smoke): 200
transcribe(no-file): 400
api-smoke: OK
```

App shell and CORS:

```text
GET https://4-ai-staging.pages.dev/
APP_STATUS=200
APP_LEN=459855
WORKER_MARKER=found

OPTIONS https://restless-lab-d737-staging.shelckograff.workers.dev/auth/login
Origin: https://4-ai-staging.pages.dev/
PREFLIGHT_STATUS=204
PREFLIGHT_ACAO=https://4-ai-staging.pages.dev/
PREFLIGHT_ACAM=GET, POST, PUT, OPTIONS
```

## Guards

```text
node scripts/check-cp1251-mojibake.mjs
CP1251 mojibake check passed: 0 suspicious tokens

C:\Program Files\Git\bin\bash.exe scripts/check-portable-paths.sh
Portable path check passed.
```

## Commit

Pending before commit: `test(api): refresh staging smoke evidence`.

## Tails

`NEEDS-REAL`: this closes only the automated staging API/app-shell evidence. It does not approve beta launch, production deploy, `main` merge, OAuth provider callback, real Telegram/TMA/device QA, payment/provider smoke, CAL, prices, secrets, or entitlement changes.
