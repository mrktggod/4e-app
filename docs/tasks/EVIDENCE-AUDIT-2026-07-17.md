# EVIDENCE-AUDIT-2026-07-17

Date: 2026-07-17
Branch: feat/admin-tariff-api
Scope: P0/P1 `Done` and `Ready for QA` items from `pm/backlog.md` and `pm/bugs.md`, plus adjacent high-risk rows that affect beta or merge readiness.
Mode: staging/source evidence only. No production deploy, no main merge, no destructive admin/user mutations.

## Legend

- `LIVE` - confirmed by staging smoke, browser/API response, deployment evidence, or a recent explicit live check recorded in project logs.
- `SOURCE-ONLY` - source/config/docs support the claim, but no fresh live proof was run in this audit.
- `NEEDS-REAL` - requires manual UI/provider/device/production verification or an explicit product decision before it can be treated as closed.
- `PARTIAL` - some proof exists, but a material part remains unverified.

## Fresh evidence gathered in this audit cycle

| Check | Result | Evidence |
| --- | --- | --- |
| Staging API smoke | PASS | `WORKER_BASE_URL=https://restless-lab-d737-staging.shelckograff.workers.dev node scripts/api-smoke.mjs` completed `api-smoke: OK`. Covered forgot-password validation, register/login, auth/me, Telegram link, task create/list/done/delete, Anthropic smoke, transcribe negative case. |
| Staging Pages app | PASS | `GET https://4-ai-staging.pages.dev/` returned 200, real app HTML length 442732, staging worker URL present in bundle. |
| Browser CORS path | PASS | `OPTIONS /auth/login` from origin `https://4-ai-staging.pages.dev` returned 204 with `Access-Control-Allow-Origin: https://4-ai-staging.pages.dev` and allowed methods `GET, POST, PUT, OPTIONS`. |
| BUG-005 exploit proof | PASS | Unsigned linked-user `save-task` returned 403 `bot signature invalid`; `/tasks` stayed empty. Recorded in `pm/bugs.md` and committed earlier. |
| Mojibake guard | PASS | `node scripts/check-cp1251-mojibake.mjs` passes after prior `pm/bugs.md` repair. |
| BOM guard | PASS | BOM cleanup committed earlier; no new BOM expected in touched docs. |

## Backlog evidence classification

| ID | Status in source | Evidence class | Audit note |
| --- | --- | --- | --- |
| BACK-001 | Done | LIVE | Core worker/API path has repeated live smoke coverage. |
| BACK-002 | Done | LIVE | Auth/register/login path covered by staging API smoke. |
| BACK-003 | Done | SOURCE-ONLY | Source/docs indicate completion; no fresh live proof in this audit. |
| BACK-004 | Done | LIVE | Task lifecycle covered by staging API smoke. |
| BACK-059 | Done | LIVE | Entitlement/bot-scope hardening had prior signed/unsigned smoke and current source remains in place. |
| BACK-060 | Done | LIVE | Bot-only/shared-action signature enforcement was previously proven; current staging deploy accepted signed path and source guard remains. |
| BACK-021 | Done | LIVE | Telegram link/auth path covered by staging API smoke. |
| BACK-022 | Done | LIVE | Related auth/task flow remains covered by smoke. |
| BACK-024 | Done | LIVE | Covered by source plus staging smoke path. |
| BACK-025 | Done | SOURCE-ONLY | No fresh live proof in this audit. |
| BACK-034 | Done | LIVE | Covered by task lifecycle smoke and source continuity. |
| BACK-035 | Ready for QA | NEEDS-REAL | Requires manual UI/provider validation before Done. |
| BACK-036 | Ready for QA | NEEDS-REAL | `/start` fallback needs real bot/user journey verification. |
| BACK-041 | Ready for QA | NEEDS-REAL | Needs real provider/UI path; do not promote from source alone. |
| BACK-048 | Done | LIVE | Covered by current worker smoke and prior recorded proof. |
| BACK-055 | Done | SOURCE-ONLY | Source/docs support; no fresh live proof in this audit. |
| HOME-001 | Ready for QA | NEEDS-REAL | Dashboard redesign is UI-heavy and needs Yuri/manual QA. |
| BACK-049 | Done | SOURCE-ONLY | Needs explicit live proof if it becomes release-critical. |
| BACK-050 | Ready for QA | NEEDS-REAL | Provider/manual path remains required. |
| NEW-006 | Ready for QA | NEEDS-REAL | Staging chain needs manual UI confirmation. |
| NEW-008 | Ready for QA | NEEDS-REAL | Staging chain needs manual UI confirmation. |
| BACK-005 | Done | LIVE | Task API paths covered by smoke. |
| BACK-007 | Done | LIVE | Task delete/done/list covered by smoke. |
| BACK-047 | Done | LIVE | Privacy/auth worker path has prior production/staging evidence and source continuity. |
| BACK-045 | Ready for QA | NEEDS-REAL | VK credentials are ready; Yandex ID remains blocker per backlog/team-sync. |
| SMART-006 | Done | LIVE | Anthropic smoke returned 200 in current staging smoke. |
| SMART-004 | Ready for QA | NEEDS-REAL | Needs real voice/browser/device path, not API-only proof. |
| SMART-001 | Done | LIVE | AI endpoint covered by current Anthropic smoke. |
| SMART-002 | Done | LIVE | Same AI integration path covered by current smoke/source continuity. |
| SMART-003 | Done | SOURCE-ONLY | Source indicates completion; no fresh scenario proof in this audit. |
| SMART-007 | Done | SOURCE-ONLY | Source/docs support; no fresh live proof in this audit. |
| ARCH-001 | Done | SOURCE-ONLY | Architecture item; source/docs only. |
| BACK-009 | Ready for QA | NEEDS-REAL | Needs real UI/payment/provider QA before Done. |
| BACK-010 | Ready for QA | NEEDS-REAL | Needs real UI/payment/provider QA before Done. |
| BACK-026 | Done | SOURCE-ONLY | Source/docs support; no fresh live proof in this audit. |
| BACK-030 | Ready for QA | LIVE/PARTIAL | Anthropic call works on staging, but any full UX acceptance remains QA. |
| SMART-011 | Ready for QA | NEEDS-REAL | External/AI UX behavior still needs real acceptance. |
| INFRA-001 | Ready for QA | NEEDS-REAL | Requires external deployment/infra confirmation. |
| INFRA-002 | In Progress | PARTIAL | Not part of Done/Ready closure; remains active. |
| INFRA-004 | Done | LIVE | Staging deployment/path evidence exists. |
| INFRA-005 | Done | LIVE | Manual VK app check was recorded by Yuri; status remains supported. |
| INFRA-006 | Partial Done | PARTIAL | CRLF incidents are closed in known checkouts, but workspace unification policy remains relevant. |
| ONBOARD-001 | Ready for QA | NEEDS-REAL | User explicitly wanted manual review; do not count as Done. |
| ANALYTICS-001 | Ready for QA | LIVE/PARTIAL | Events/source and smoke support basics; analytics warehouse/dashboard acceptance still needs real review. |
| BETA-001 | Partial Done | PARTIAL | Invite checklist exists; no beta invites sent. |
| FEEDBACK-001 | Partial Done | PARTIAL | Needs product/manual acceptance. |

## Bugs evidence classification

| Bug ID | Status | Evidence class | Audit note |
| --- | --- | --- | --- |
| BUG-2026-07-14-001 | Done | LIVE | Staging auth/CORS fix has live API and browser-origin evidence. |
| BUG-2026-07-14-002 | Done | LIVE | Staging auth path covered by current smoke. |
| BUG-2026-07-15-001 | Done | LIVE/PARTIAL | Chat/task source fixes are present; full UI regression still benefits from manual QA. |
| BUG-2026-07-15-003 | Done | LIVE/PARTIAL | Source/smoke coverage exists where API-level; UI-specific behavior needs manual acceptance. |
| BUG-2026-07-15-004 | Done | LIVE/PARTIAL | Source/smoke coverage exists where API-level; UI-specific behavior needs manual acceptance. |
| BUG-2026-07-15-005 | Done | LIVE | Unsigned linked-user exploit was repro-tested closed on staging with 403 and empty `/tasks`. |
| BUG-2026-07-14-003 | Done | SOURCE-ONLY | Source/docs support; no fresh live proof in this audit. |
| BUG-2026-07-04-002 | Ready for QA | NEEDS-REAL | Needs real bot/user verification before Done. |

## Items that must not be silently promoted

- `HOME-001`, `ONBOARD-001`, `NEW-006`, `NEW-008`, `BACK-035`, `BACK-036`, `BACK-041`, `BACK-045`, `BACK-050`, `BACK-009`, `BACK-010`, `SMART-004`, `SMART-011`, `BUG-2026-07-04-002` need real manual/provider/device checks.
- `BETA-001` remains partial because no invite wave has been sent.
- `INFRA-006` is materially improved, but duplicate-checkout policy remains an operational risk unless the team keeps one canonical worker clone.

## Conclusion

The staging backend/auth/task/AI smoke layer is healthy. Several P0/P1 rows have credible live evidence, especially auth, tasks, BUG-005, CORS, and Anthropic smoke. However, merge/prod/beta readiness should not be inferred from those API checks alone: UI-heavy, provider-heavy, bot journey, payment/provider, and product-decision rows still need real manual acceptance or explicit owner decisions.