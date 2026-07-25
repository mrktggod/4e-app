status: DONE

# REPORT-BRIEF-2026-07-25-62-expired-premium-voice-gate

## Summary

Expired Premium voice entry now fails as an explicit Premium gate before the listening screen starts. The UI routes the user to `subscription` and does not change payment, entitlement, pricing, backend or production behavior.

## Root Cause

- `index.html:7150`: `openVoice()` entered the biometric/listening flow without checking the existing frontend Premium entitlement state.
- `index.html:7210`: voice task dispatch errors now reuse the same Premium-required handler when a Worker-style 402/403 premium denial reaches the voice path.

## Changed Files

- `index.html`
- `scripts/premium-voice-gate-smoke.mjs`
- `package.json`
- `FILE_MAP.md`
- `FILE_MAP_UI.md`
- `pm/inbox/BRIEF-2026-07-25-62-expired-premium-voice-gate.md`
- `pm/bugs.md`
- `pm/backlog.md`
- `pm/team-sync.md`
- `shared/WORK_LOG.md`
- `DEVELOPMENT_LOG.md`

## Evidence

Raw local proof:

```text
npm run smoke:premium-voice-gate
premium voice gate smoke: PASS

npm run smoke:premium-task-denial
premium-task-action-denial-smoke: ok

node scripts/check-cp1251-mojibake.mjs
CP1251 mojibake check passed: 0 suspicious tokens

npm run check:js-syntax
JS syntax check: no staged JS or HTML files

git diff --check
passed
```

Guard environment note:

```text
npm run check:portable-paths
Unable to run scripts/check-portable-paths.sh: spawnSync bash ENOENT

npm run check:ui-architecture
Unable to run scripts/check-ui-architecture.sh: spawnSync bash ENOENT
```

Equivalent checks run directly because `bash`/`sh` are not on PATH:

```text
Portable path check passed.
inline style attributes = 299 / 465
inline event handlers = 401 / 402
style tags = 0 / 0
inline script tags = 3 / 3
UI architecture equivalent passed.
```

Encoding ritual:

```text
До правки: 112 совпадений
После правки: 112 совпадений
```

## Commit

This task commit on `feat/admin-tariff-api`; final SHA is recorded in git history after commit.

## Tails

- NEEDS-REAL: live expired-Premium account smoke in Telegram Mini App should confirm the user sees the subscription route instead of `Говори...` / listening pipeline.
- No staging/prod deploy was performed.
