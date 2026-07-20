# REPORT-SMART-007-memory-fixture-smoke-2026-07-20

Status: DONE
Branch: `feat/admin-tariff-api`
Automation: `4e PM inbox daily runner`

## Task

Upgrade SMART-007 evidence from `SOURCE-ONLY` using the dedicated safe fixture plan, without production, real user data, live Telegram/device QA, payment, entitlement, price, CAL, secrets, or `main`.

## Root Cause

`docs/tasks/EVIDENCE-AUDIT-2026-07-17.md` still marked SMART-007 as `SOURCE-ONLY`: source references existed, but there was no fixture proof that staging extracted facts, rendered the user-facing AI-memory screen, and honored delete/clear controls.

## Changed Files

- `scripts/smart-007-memory-fixture-smoke.mjs` - new staging-only fixture smoke.
- `package.json` - added `npm run smoke:smart007`.
- `FILE_MAP.md` - added the new smoke script.
- `docs/tasks/SMART-007-memory-evidence-fixture-plan.md` - recorded the fixture result.
- `docs/tasks/EVIDENCE-AUDIT-2026-07-17.md` - promoted SMART-007 evidence to `LIVE`.
- `pm/backlog.md`, `shared/ROADMAP.md`, `pm/team-sync.md`, `DEVELOPMENT_LOG.md`, `shared/WORK_LOG.md` - synced PM status.

## Raw Proof

```text
npm run smoke:smart007
smart-007-memory-fixture-smoke: worker=https://restless-lab-d737-staging.shelckograff.workers.dev
register: 200
login: 200
legacy-session: 200
privacy.settings: 200
ai.messages.user: 200
anthropic: 200
ai.messages.assistant: 200
facts.poll.1: 200 count=4
facts.delete-one: 200
facts.after-delete-one: 200
facts.clear-all: 200
facts.after-clear: 200
smart-007-memory-fixture-smoke: OK
```

Fixture account: `smart007-fixture-202607202006-1784577991198@example.org`.

Extracted facts:

```text
Тестовый пользователь SMART-007 fixture
Предпочитает короткие утренние планы
Учебный проект 'Северный маяк'
Предпочитает получать задачи списком из трёх пунктов
```

DOM proof:

```text
activeScreen=ai-memory
rows=4
containsExpected=true
all rows have delete buttons
scrollWidth=390
```

Delete/clear proof:

```text
afterDeleteCount=3
afterClearCount=0
```

Tokens and D1 session values were redacted as `<redacted>`.

## Honest Tails

- This is staging fixture proof, not production or real-user proof.
- No production deploy, `main` merge, CAL, price, payment, entitlement, secret, live Telegram/device, or Yuri personal-data action was performed.
- App commit SHA: see the commit that adds this report.
