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
| BACK-034 | Done | LIVE | 2026-07-20 staging resmoke passed app shell, worker marker, CORS preflight, auth/register/login, two-user task flow, `/anthropic`, and `/transcribe` negative. |
| BACK-035 | Ready for QA | NEEDS-REAL | Requires manual UI/provider validation before Done. |
| BACK-036 | Ready for QA | NEEDS-REAL | `/start` fallback needs real bot/user journey verification. |
| BACK-041 | Ready for QA | NEEDS-REAL | Needs real provider/UI path; do not promote from source alone. |
| BACK-048 | Done | LIVE | Covered by current worker smoke and prior recorded proof. |
| BACK-055 | Done | LIVE | 2026-07-20 headless Chrome/CDP smoke `npm run smoke:back055` verified notification action-card rendering and interactions at 390x844. |
| HOME-001 | Done | LIVE/PARTIAL | 2026-07-20 local headless Chrome/CDP smoke `npm run smoke:home001` verified dashboard structure, routes, dark/light render and screenshot artifacts at 390x844. |
| BACK-049 | Done | SOURCE-ONLY | Needs explicit live proof if it becomes release-critical. |
| BACK-050 | Ready for QA | LIVE/PARTIAL | 2026-07-20 local headless Chrome/CDP smoke `npm run smoke:back050` verified auth labels/errors, toast status/alert live-region behavior, and quick-add/contact/focus dialog ARIA/focus at 390x844. Manual keyboard/mobile smoke remains required before Done. |
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
| BACK-026 | Done | LIVE | Fresh staging `telegram-merge-smoke` created two isolated accounts, linked each through `/auth/telegram`, received `accountMerged:true`, and confirmed `/auth/me` on the returned receiver token. |
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
| BUG-2026-07-14-003 | Done | LIVE | Fresh staging `telegram-merge-smoke` proved `/auth/telegram` returns `200` without Worker 1101 and returns usable auth tokens. |
| BUG-2026-07-04-002 | Ready for QA | NEEDS-REAL | Needs real bot/user verification before Done. |

## Items that must not be silently promoted

- `ONBOARD-001`, `NEW-006`, `NEW-008`, `BACK-035`, `BACK-036`, `BACK-041`, `BACK-045`, `BACK-050`, `BACK-009`, `BACK-010`, `SMART-004`, `SMART-011`, `BUG-2026-07-04-002` need real manual/provider/device checks.
- `BETA-001` remains partial because no invite wave has been sent.
- `INFRA-006` is materially improved, but duplicate-checkout policy remains an operational risk unless the team keeps one canonical worker clone.

## 2026-07-17 supplemental SOURCE-ONLY to LIVE pass

Raw narrow smoke used fresh isolated staging accounts and did not touch Yuri's manual QA accounts:

```text
telegram-merge-smoke: worker=https://restless-lab-d737-staging.shelckograff.workers.dev
register(creator): 200 1233ms
login(creator): 200 552ms
register(receiver): 200 689ms
login(receiver): 200 531ms
telegram link(creator): 200 2197ms body={"ok":true,...,"accountMerged":true,...}
telegram link(receiver): 200 2374ms body={"ok":true,...,"accountMerged":true,...}
auth/me(receiver after telegram): 200 258ms ok=true userId=b2a73164-1b44-471d-8cbf-aca3d52d6d51
telegram-merge-smoke: OK
```

Promoted from `SOURCE-ONLY` to `LIVE` in this audit doc:

| ID | New evidence class | Why |
| --- | --- | --- |
| BACK-026 | LIVE | Account merge/link path was exercised through staging `/auth/telegram` and returned `accountMerged:true`. |
| BUG-2026-07-14-003 | LIVE | Same smoke proves `/auth/telegram` no longer throws Worker 1101 and returns valid auth. |
| BACK-055 | LIVE | 2026-07-20 `npm run smoke:back055` covers UI/headless interaction on the notifications screen: cards, unread badge, expand, snooze, go-to-task, done, write, filters and empty state. |

Attempted broader `api-smoke` raw output before the narrow rerun:

```text
api-smoke: worker=https://restless-lab-d737-staging.shelckograff.workers.dev
forgot-password(empty): 400 499ms
forgot-password(invalid): 400 247ms
register: 200 854ms
login: 200 234ms
auth/me: 200 213ms
register(user2): 200 539ms
login(user2): 200 262ms
telegram link(creator): 200 1720ms
telegram link(receiver): 200 1783ms
tasks.list.before: 200 541ms
tasks.create: 200 12304ms
tasks.list.after: 200 10319ms
api-smoke failed: fetch failed
```

This partial run was not counted as a full PASS. It only helped identify that a narrow Telegram merge smoke was the safer proof for this pass.

Still not promoted:

| ID | Kept as | Reason |
| --- | --- | --- |
| BACK-003 | SOURCE-ONLY / needs manual UI | First-microphone biometric consent is a browser/UI consent path, not a safe API-only proof. |
| BACK-025 | SOURCE-ONLY / needs manual UI | Morning AI dashboard is product UI; requires visual/manual acceptance. |
| BACK-049 | SOURCE-ONLY | Architecture guard is process/tooling evidence, not staging runtime behavior. |
| SMART-003 | SOURCE-ONLY / needs real chat context | "Write to assignee" requires Telegram/deep-link behavior validation. |
| SMART-007 | SOURCE-ONLY | AI memory/facts needs a dedicated safe fixture and acceptance criteria; not promoted opportunistically. |
| ARCH-001 | SOURCE-ONLY | Architecture refactor proof remains source/tooling based. |

## Conclusion

The staging backend/auth/task/AI smoke layer is healthy. Several P0/P1 rows have credible live evidence, especially auth, tasks, BUG-005, CORS, and Anthropic smoke. However, merge/prod/beta readiness should not be inferred from those API checks alone: UI-heavy, provider-heavy, bot journey, payment/provider, and product-decision rows still need real manual acceptance or explicit owner decisions.

## 2026-07-18 price/security/perf supplement

| Check | Result | Evidence |
| --- | --- | --- |
| Source year price alignment | LIVE/SOURCE | Worker and app source defaults changed from `9504` to `9950`; staging worker deploy `6cf4e558-9681-46a7-ae60-20f51375d505`; `GET /tariff-config` returned `plans.year.priceRub=9950` and `plans.year.stars=9950`. Details: `docs/tasks/PRICE-MAP-2026-07-17.md`. |
| BACK-060 sibling unsigned re-check | LIVE | Fresh unsigned sessionless `update-task` and `set-reminder` with foreign `telegramUserId` both returned `401 {"ok":false,"error":"Не авторизован"}` on staging; no sibling bot-style mutation observed. Details: `docs/tasks/BACK-060-bot-path-signature-reconciliation.md`. |
| Task create/list latency re-check | LIVE/PARTIAL | Fresh staging account showed `tasks.create` 283 ms, `tasks.list.before` 163 ms, `tasks.list.after` 148 ms. Prior 10-12s latency did not reproduce; no code fix applied. Details: `docs/tasks/PERF-2026-07-18-task-latency-recheck.md`. |

## 2026-07-20 BACK-050 accessibility smoke supplement

| Check | Result | Evidence |
| --- | --- | --- |
| Auth field accessibility baseline | LIVE/PARTIAL | `npm run smoke:back050` verified `login-email`, `login-pass`, `reg-name`, `reg-email`, `reg-pass`, `forgot-email`, `reset-pass`, and `reset-pass2` have labels, `aria-describedby`, field error targets, and `aria-invalid=false`. |
| Toast live-region behavior | LIVE/PARTIAL | Same smoke verified default `#toast` is `role=status` / `aria-live=polite`, critical `Нет соединения` switches to `role=alert` / `aria-live=assertive`, and success/status text switches back to polite status. |
| Dialog focus baseline | LIVE/PARTIAL | Same smoke verified quick-add, contact panel, and focus panel dialogs expose `role=dialog`, `aria-modal=true`, `aria-labelledby`, `aria-hidden` state changes, focus-in, and focus-return on close/Escape. |

## 2026-07-20 ARCH-001 source evidence supplement

ARCH-001 remains `SOURCE-ONLY` because it is an architecture extraction item, not a user-facing runtime smoke. This supplement replaces the earlier generic note with exact current-HEAD source references.

| Area | Source evidence | Call / usage evidence |
| --- | --- | --- |
| Platform adapter export surface | `scripts/platform-adapter.js:1110` creates `window.FourPlatform`; `scripts/platform-adapter.js:1156` exports `initVkMiniAppAdapter`. | `index.html:1839` reads `const PLATFORM=window.FourPlatform||{}`; `index.html:8266-8267` calls `window.FourPlatform.initVkMiniAppAdapter(...)`. |
| VK Mini Apps adapter | `scripts/platform-adapter.js:929` defines `initVkMiniAppAdapter(deps)`; `scripts/platform-adapter.js:956-1099` handles VK auth, safe-area, haptics, swipe back, VK storage and VK payment wrapper. | `index.html:8266-8267` initializes the adapter from the app shell. |
| Telegram start/return helpers | `scripts/platform-adapter.js:816` defines `getTelegramStartTokenFromLaunch()`; `scripts/platform-adapter.js:829` defines `getTelegramReturnUrl()`; `scripts/platform-adapter.js:844`, `851`, `858`, `867`, `881`, `887` define pending-start, clean-url, bot-login-url and open helpers. | `index.html:1912`, `1916`, `1920`, `1924`, `1928`, `1935`, `1969` use Telegram pending/start helpers; `scripts/auth.js:105`, `160` wrap start/return helpers. |
| VK launch params | `scripts/platform-adapter.js:30` defines VK context detection; `scripts/platform-adapter.js:908` defines `getVkLaunchParams()`. | `index.html:1941` calls `PLATFORM.getVkLaunchParams`; `index.html:1987` sends launch params through `/auth/vk`. |
| OAuth PKCE/state helpers | `scripts/platform-adapter.js:41`, `63`, `68`, `78` define redirect URI, PKCE, remember and consume state helpers. | `scripts/auth.js:5-19` delegates OAuth helpers to `window.PLATFORM`; `scripts/auth.js:40-49` uses them in `startOAuthLogin`; `scripts/auth.js:61-76` consumes them in callback. |
| Referral and attribution helpers | `scripts/platform-adapter.js:95`, `103`, `115`, `137`, `149`, `157`, `166`, `173`, `178` define referral normalization, acquisition attribution, pending referral and referral link helpers. | `scripts/auth.js:75-76`, `113-145` and `scripts/auth-handlers.js:53-54`, `261`, `367-368`, `420` use attribution/referral helpers; `index.html:1948`, `1986-1993`, `2039`, `2066` use referral capture/link flow. |
| Dialog/focus helpers | `scripts/platform-adapter.js:188`, `194`, `206`, `218`, `809` define focusable lookup, accessible open/close/key handling and first-invalid focus. | `index.html:3159-3175`, `3180`, `3377`, `3824`, `3830`, `4728`, `4734`, `8359-8360`, `8397-8399`, `8422` use accessible dialog helpers; `scripts/auth.js:203-206` delegates first-invalid focus. |
| Form-error helpers | `scripts/platform-adapter.js:255`, `269`, `273` define field error set/clear helpers. | `scripts/auth.js:171-195` delegates auth field errors to platform helpers; `scripts/auth-handlers.js:46-49`, `222-224` uses the auth validation path. |
| Email validator | `scripts/platform-adapter.js:240` defines `isValidEmail(email)`. | `scripts/auth.js:166-167` delegates to the adapter; `scripts/auth-handlers.js:46`, `222` and `index.html:2075`, `7658` use `isValidEmail`. |
| Password toggle helpers | `scripts/platform-adapter.js:244` defines `togglePasswordVisibility(fieldId)`. | `scripts/auth-handlers.js:480`, `488` call `PLATFORM.togglePasswordVisibility(...)`. |
| Enter-submit helper | `scripts/platform-adapter.js:251` defines `shouldHandleEnterSubmit(event)`; `scripts/platform-adapter.js:752-806` binds auth enter-submit handlers. | `scripts/auth-handlers.js:78` and `scripts/platform-adapter.js:782`, `786`, `793`, `800` use the shared helper. |
