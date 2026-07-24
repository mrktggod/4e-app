# REPORT — QA Lab and client bug intake

**Date:** 2026-07-24  
**Branch:** `docs/qa-lab-client-bug-intake`  
**Status:** DONE / planning and PM sync only

## Result

Created a canonical plan for the next free QA/tooling layer and client bug intake:

- `pm/QA-LAB-AND-CLIENT-BUG-INTAKE-2026-07-24.md`
- `docs/tasks/QA-LAB-001-axe-core-playwright-accessibility.md`
- `docs/tasks/QA-LAB-002-playwright-visual-screenshots.md`
- `docs/tasks/FEEDBACK-002-client-bug-intake.md`
- `pm/inbox/BRIEF-2026-07-24-61-qa-lab-axe-core-playwright.md`
- `pm/inbox/BRIEF-2026-07-24-62-qa-lab-visual-screenshots.md`
- `pm/inbox/BRIEF-2026-07-24-63-qa-lab-lighthouse-ci-report.md`
- `pm/inbox/BRIEF-2026-07-24-64-feedback-client-bug-intake-pm-template.md`

Backlog, roadmap, bug process, QA playbook, team sync and logs were synchronized.

Portable path guard was also updated to ignore only the service `.git` pointer file used by Git worktrees. Project files and `.git/**` exclusions are unchanged.

## Tool decisions

Selected free tools Codex can operate:

1. `axe-core` on Playwright for accessibility checks.
2. Playwright visual screenshots for stable glass/design components.
3. Lighthouse CI for preview/prebeta quality reports.
4. OWASP ZAP baseline as passive report-first staging scan.

Rejected for now:

- paid device farms;
- paid visual SaaS;
- broad monitoring SaaS before beta signal;
- production load/security scanning without explicit human approval.

## Client bug intake

Defined `FEEDBACK-002`:

- bot `/bug` wizard;
- screenshot/video with consent;
- `CLIENT-BUG-YYYY-MM-DD-NNN`;
- `source: client`;
- relevance check before creating normal `BUG-*`;
- statuses `NEW`, `NEEDS-REPRO`, `CONFIRMED`, `DUPLICATE`, `STALE`, `CLOSED`;
- no raw personal data in PM docs.

Runtime implementation is not done in this repo because Telegram bot repo `mrktggod/4e-bot` is separate and not locally connected.

## Sources checked

- Playwright visual comparisons: https://playwright.dev/docs/test-snapshots
- axe-core: https://github.com/dequelabs/axe-core
- axe-core npm packages: https://github.com/dequelabs/axe-core-npm
- Lighthouse CI getting started: https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/getting-started.md
- OWASP ZAP baseline: https://www.zaproxy.org/docs/docker/baseline-scan/
- Telegram Bot API: https://core.telegram.org/bots/api
- GitHub Issues REST API: https://docs.github.com/en/rest/issues
- Cloudflare R2 pricing: https://developers.cloudflare.com/r2/pricing/
- OpenTelemetry browser JS docs: https://opentelemetry.io/docs/languages/js/getting-started/browser/

## Boundaries

No app runtime, worker runtime, bot runtime, production deploy, `main` merge, payment, entitlement, CAL or secrets were touched.

## Next

Execute `BRIEF-2026-07-24-61-qa-lab-axe-core-playwright` as the first technical QA Lab task.
