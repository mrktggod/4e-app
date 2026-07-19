# REPORT-BRIEF-2026-07-18-price-align-security-perf

Status: DONE

## Summary

Rechecked the price alignment, unsigned bot-path sibling risk, and staging task API performance. No code changes were needed in this run: the source defaults were already aligned to `9950`, staging rejects unsigned sibling mutations, and the old 10-12s task latency did not reproduce.

## Root Cause / Entry Points

This brief bundled follow-up verification from an earlier long session.

- `index.html:735` - static yearly per-month display is `829 ₽`.
- `index.html:736` - static yearly total display is `/ мес · 9 950 ₽/год`.
- `index.html:2369` - frontend default yearly `priceRub: 9950`.
- `index.html:2370` - frontend default yearly `stars: 9950`.
- `X:\4\4e-worker\worker.js:92` - worker default yearly `priceRub: 9950`.
- `X:\4\4e-worker\worker.js:93` - worker default yearly `stars: 9950`.
- `X:\4\4e-worker\worker.js:2791` - Telegram Stars fallback yearly `stars: 9950`.
- `X:\4\4e-worker\worker.js:3276` - `update-task` requires session before mutation.
- `X:\4\4e-worker\worker.js:4012` - `set-reminder` requires session before mutation.

## Changed Files

- `pm/inbox/BRIEF-2026-07-18-price-align-security-perf.md`
- `pm/outbox/REPORT-BRIEF-2026-07-18-price-align-security-perf.md`

No app runtime file or worker runtime file was changed in this run.

## Raw Evidence

Source price code search:

```text
X:\4\.tmp-4e-app-publish> rg -n "9504|9 504" index.html
exit 1, no matches

X:\4\4e-worker> rg -n "9504|9 504" worker.js
exit 1, no matches
```

Staging tariff config:

```text
GET https://restless-lab-d737-staging.shelckograff.workers.dev/tariff-config
status=200
plans.month.priceRub=990
plans.month.stars=990
plans.year.priceRub=9950
plans.year.stars=9950
plans.year.periodLabel="/ мес · 9 950 ₽/год"
plans.year.displayPrice="829 ₽"
plans.year.totalPriceLabel="9 950 ₽"
```

Unsigned bot-path sibling live re-test:

```text
POST / x-action:update-task
body={"telegramUserId":"999000111","taskId":"codex-unsigned-sibling","updates":{"text":"should-not-change"}}
status=401
response={"ok":false,"error":"Не авторизован"}

POST / x-action:set-reminder
body={"telegramUserId":"999000111","taskId":"codex-unsigned-sibling","taskText":"should not remind","reminderType":"1hour"}
status=401
response={"ok":false,"error":"Не авторизован"}
```

Staging API/perf smoke:

```text
WORKER_BASE_URL=https://restless-lab-d737-staging.shelckograff.workers.dev SKIP_SMART013_SMOKE=1 node scripts/api-smoke.mjs
forgot-password(empty): 400 452ms
forgot-password(invalid): 400 193ms
register: 200 782ms
login: 200 229ms
auth/me: 200 171ms
register(user2): 200 353ms
login(user2): 200 210ms
telegram link(creator): 200 1434ms
telegram link(receiver): 200 1727ms
tasks.list.before: 200 98ms
tasks.create: 200 319ms
tasks.list.after: 200 102ms
tasks.list.receiver: 200 93ms
tasks.done: 200 113ms
tasks.delete: 200 116ms
transcribe(no-file): 400 90ms
api-smoke: OK
```

Required app check:

```text
node scripts/check-cp1251-mojibake.mjs
CP1251 mojibake check passed: 0 suspicious tokens
```

## Honest Tails

- NEEDS-REAL: no production deploy, merge into `main`, CAL, secret action, payment/entitlement refactor, or admin runtime tariff mutation was performed.
- NEEDS-REAL: perf profiling beyond the green smoke was not needed because the reported 10-12s latency did not reproduce.
- App commit SHA: NEEDS-REAL until report commit is created.
- Worker commit SHA: `225e13f` was current; no worker commit was created in this run.
