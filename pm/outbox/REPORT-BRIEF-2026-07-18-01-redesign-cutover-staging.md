# REPORT-BRIEF-2026-07-18-01-redesign-cutover-staging

Status: NEED-YURI

## Summary

Transferred the approved soft-glass redesign slices into `feat/admin-tariff-api` and deployed the staging Pages artifact to Cloudflare Pages project `4-ai-staging`.

Staging URL for Yuri review:

- Direct deployment: `https://263b279c.4-ai-staging.pages.dev/`
- Alias currently also serves the same HTML length and redesign markers: `https://4-ai-staging.pages.dev/`

Production deploy was not performed. Merge into `main` was not performed.

## Source Heads Used

| Slice | Branch | Origin head used |
| --- | --- | --- |
| Profile | `origin/codex/redesign-profile-soft-glass` | `328fdff29cb6f3c4940162a42def13d7c94f4f45` |
| Chat / Ask | `origin/codex/redesign-chat-soft-glass` | `1b1ff0c437d3daa10217c04b89126c6460e3fbab` |
| Task detail | `origin/codex/redesign-task-detail-soft-glass` | `e2d861cc44938d63368245828b5a111cf7fea0f7` |
| Dashboard / Home empty state | `origin/codex/redesign-dashboard-subscription-soft-glass` | `a5d40e3aac04e01ae64cf4a741a382d2d24dc7bb` |
| Subscription / pricing UI | `origin/codex/redesign-dashboard-subscription-soft-glass` | `a5d40e3aac04e01ae64cf4a741a382d2d24dc7bb` |

## Root Cause / Entry Points

This brief was a planned cutover, not a defect fix. The working branch was missing the approved redesign surfaces that were finalized on separate Codex branches.

Runtime entry points now carrying the staged slices:

- `index.html:306` - dashboard/home soft-glass shell.
- `index.html:390` - chat/ask soft-glass shell.
- `index.html:420` - task-detail soft-glass shell.
- `index.html:609` - profile soft-glass shell.
- `index.html:672` - subscription/pricing screen retained with tariff-config driven values.
- `scripts/auth-handlers.js:91` - dashboard/subscription preview demo renderer.

## Changed Files

- `index.html`
- `scripts/auth-handlers.js`
- `scripts/build-pages-whitelist.mjs`
- `styles/screens/home.less`
- `styles/screens/profile.less`
- `styles/screens/tasks.less`
- `styles/screens/voice.less`
- `styles.css`
- `styles.min.css`
- `assets/design/dashboard-avatar.png`
- `assets/design/dashboard-hero-orb.png`
- `assets/profile-orb.png`
- `FILE_MAP.md`
- `FILE_MAP_UI.md`
- `pm/inbox/BRIEF-2026-07-18-01-redesign-cutover-staging.md`
- `pm/outbox/REPORT-BRIEF-2026-07-18-01-redesign-cutover-staging.md`
- `shared/WORK_LOG.md`
- `DEVELOPMENT_LOG.md`

`pm/backlog.md` was already dirty before this run with an unrelated `ANALYTICS-002` row. I did not include it in the commit. `REDESIGN-001` was not found in the current backlog, so the requested backlog update is left as NEEDS-REAL instead of mixing unrelated local changes.

## Raw Evidence

Branch sync:

```text
origin/codex/redesign-profile-soft-glass 328fdff29cb6f3c4940162a42def13d7c94f4f45
origin/codex/redesign-chat-soft-glass 1b1ff0c437d3daa10217c04b89126c6460e3fbab
origin/codex/redesign-task-detail-soft-glass e2d861cc44938d63368245828b5a111cf7fea0f7
origin/codex/redesign-dashboard-subscription-soft-glass a5d40e3aac04e01ae64cf4a741a382d2d24dc7bb
```

Local checks:

```text
npm run build:css -> exit 0
node scripts/check-js-syntax.mjs -> exit 0
node scripts/check-cp1251-mojibake.mjs -> CP1251 mojibake check passed: 0 suspicious tokens
C:\Program Files\Git\bin\bash.exe scripts/check-ui-architecture.sh -> exit 0
UI architecture guard: inline style attributes = 366 / 465
UI architecture guard: inline event handlers = 386 / 402
UI architecture guard: style tags = 0 / 0
UI architecture guard: inline script tags = 3 / 3
```

Staging build/deploy:

```text
PAGES_WORKER_TARGET=staging npm run build:worker-assets -> exit 0
Pages worker target: staging
Pages artifact ready: .nojekyll, 404.html, assets/, favicon.ico, favicon.svg, index.html, manifest.webmanifest, privacy.html, scripts/, styles.css, styles.min.css, sw.js, vk.html
npx wrangler pages deploy .pages-dist --project-name 4-ai-staging --branch dev -> exit 0
Deployment complete: https://263b279c.4-ai-staging.pages.dev
```

Live staging marker proof:

```text
GET https://263b279c.4-ai-staging.pages.dev/ length=459629
restless-lab-d737-staging.shelckograff.workers.dev=True
dash-artboard=True
ask-soft-screen=True
detail-redesign-shell=True
profile-handoff-shell=True
styles.min.css=True

GET https://4-ai-staging.pages.dev/ length=459629
stagingWorker=True
deployMarker=True

/scripts/auth-handlers.js?v=dashboard-handoff-20260718-7 status=200 length=19341 previewFn=True
/styles.min.css status=200 length=197120 css markers for dash/ask/detail/profile=True
/assets/design/dashboard-avatar.png status=200 length=32025
/assets/design/dashboard-hero-orb.png status=200 length=193966
/assets/profile-orb.png status=200 length=51861
```

API smoke:

```text
WORKER_BASE_URL=https://restless-lab-d737-staging.shelckograff.workers.dev node scripts/api-smoke.mjs
forgot-password(empty): 400
forgot-password(invalid): 400
register: 500
api-smoke failed: register failed
```

Accidental prod-default smoke:

```text
node scripts/api-smoke.mjs --help
api-smoke: worker=https://edge.4-ai.site
forgot-password(empty): 400
forgot-password(invalid): 400
register: 500
api-smoke failed: register failed
```

The script has no help mode and defaults to production when `WORKER_BASE_URL` is not set. No production deploy, merge, price, payment, entitlement, secret, or CAL change was made.

## Prod Cutover Checklist

NEED-YURI: production redesign deploy waits for Yuri's explicit "deploy" decision.

Before production:

1. Review `https://263b279c.4-ai-staging.pages.dev/` on mobile and desktop.
2. Confirm staging API `register` 500 is understood or fixed if full login smoke is required before prod.
3. Confirm no price/business-copy change is intended; this cutover did not change `priceRub` values.
4. Deploy production by the normal approved production path only after Yuri approval.
5. Rollback by reverting the app commit and redeploying the previous known-good Pages/production frontend artifact.

## Honest Tails

- NEED-YURI: prod deploy approval.
- NEED-YURI: staging API smoke is red at `register: 500`.
- NEEDS-REAL: full browser visual smoke was not run because Playwright is not installed locally.
- NEEDS-REAL: `REDESIGN-001` backlog row was not found; `pm/backlog.md` had unrelated dirty changes before this run.
- App commit SHA: NEEDS-REAL in-file self-reference; final commit hash is recorded in the automation summary.
