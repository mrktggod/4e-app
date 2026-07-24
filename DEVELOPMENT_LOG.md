## 2026-07-24

### Morning runner docs commit sync

**Что сделано:** inbox runner не нашёл `status: NEW` briefs, затем выполнил одну безопасную docs hygiene задачу из whitelist: верхние pending-ссылки на commits в `DEVELOPMENT_LOG.md` и `shared/WORK_LOG.md` заменены на фактические SHA pre-dawn задач; добавлен итоговый report `pm/outbox/REPORT-4e-morning-inbox-and-safe-backlog-runner-2026-07-24.md`.

**Проверка кодировки:** `index.html` и `vk.html` не редактировались; Шаг 0 не применялся. `node scripts/check-cp1251-mojibake.mjs` запускается перед commit.

**Тест:** `git checkout feat/admin-tariff-api`, `git fetch origin`, `git pull --ff-only`, scan `pm/inbox`, `node scripts/check-cp1251-mojibake.mjs`, shared guards before commit.

**Коммит:** this commit

## 2026-07-24

### Pre-dawn runner final closeout

**Что сделано:** создан final report `pm/outbox/REPORT-4e-pre-dawn-inbox-and-whitelist-backlog-runner-2026-07-24.md`: перечислены 4 выполненные whitelist-задачи, их commits/reports/proof, origin verification и причина остановки.

**Проверка кодировки:** `index.html` и `vk.html` не редактировались; Шаг 0 не применялся. Обязательный `node scripts/check-cp1251-mojibake.mjs` запускается перед commit.

**Тест:** документальная сверка `pm/inbox`, `pm/backlog.md`, `shared/ROADMAP.md`, `git log`; финальные guards запускаются перед closeout commit.

**Коммит:** `3fe5b91` (`docs(pm): close pre-dawn runner`)

## 2026-07-24

### BACK-066 — mocked VK Playwright parity guard

**Что сделано:** существующий `autotests/tests/vk-app/basic.spec.ts` расширен с shell-open smoke до mocked parity guard: saved `vk4_token`, `window.vkBridge`, Worker mocks для `/auth/me`, `/tasks`, `/v2/auth/legacy-session`, `/v2/auth/identities`, проверки home task list, task detail, ask, calendar, stats, profile и отсутствия fatal console/page errors.

**Проверка кодировки:** `index.html` и `vk.html` не редактировались; Шаг 0 не применялся. Обязательный `node scripts/check-cp1251-mojibake.mjs` запускается перед commit.

**Тест:** `npm run test:e2e:vk` — 4/4 passed.

**Коммит:** `004c90b` (`test(vk): add mocked parity navigation smoke`)

## 2026-07-24

### NEW-008 — Playwright guard для AI chat keyboard

**Что сделано:** добавлен `autotests/tests/web/chat-keyboard.spec.ts`, который в synthetic auth shell открывает экран `ask`, выставляет `--app-keyboard-offset=260px`, фокусирует `#ask-field` и проверяет reserve под клавиатуру без horizontal overflow. В `styles/screens/voice.less` добавлено scoped-правило `.ask-input-shell.ask-bar--keyboard-open`, потому что поздний `.ask-input-shell` стиль после сборки фактически обнулял keyboard padding. `styles.css` и `styles.min.css` пересобраны.

**Проверка кодировки:** `index.html` не редактировался; Шаг 0 не применялся. Обязательный `node scripts/check-cp1251-mojibake.mjs` запускается перед commit.

**Тест:** `npm run build:css`; `npm run test:e2e:web` — 14/14 passed. Первичный Playwright прогон до CSS-фикса поймал `paddingBottom=0`, после scoped-правила keyboard smoke прошёл на mobile/desktop.

**Коммит:** `9ccdaa0` (`fix(ui): reserve ask input above keyboard`)

## 2026-07-24

### NEW-006 / BACK-046 navigation safe-area Playwright smoke

**What changed:** Added `autotests/tests/web/navigation-safe-area.spec.ts` to cover synthetic-auth home/global navigation viewport bounds and no HTML/body horizontal overflow on Playwright mobile and desktop projects. Updated `FILE_MAP.md`, `pm/autotest-backlog-coverage-2026-07-23.md`, `pm/backlog.md` and the outbox report.

**Encoding check:** `index.html` was not edited; the mandatory encoding ritual was not required. `node scripts/check-cp1251-mojibake.mjs` is run before commit.

**Test:** `npm run test:e2e:web` passed 12/12.

**Commit:** `test(ui): add navigation safe-area e2e smoke`

---

## 2026-07-24

### BACK-061/062 auth legal Playwright smoke

**What changed:** Added `autotests/tests/web/auth-legal.spec.ts` to cover onboarding/login privacy links, login/register privacy opening, auth tab/password/forgot/legal 44px touch targets and legal copy font size. Updated `FILE_MAP.md`, `pm/autotest-backlog-coverage-2026-07-23.md`, `pm/backlog.md` and the outbox report.

**Encoding check:** `index.html` was not edited; the mandatory encoding ritual was not required. `node scripts/check-cp1251-mojibake.mjs` is run before commit.

**Test:** `npm run test:e2e:web` passed 8/8.

**Commit:** `test(auth): add legal accessibility e2e smoke`

---

## 2026-07-24

### DESIGN-GLASS-001 inventory refresh

**What changed:** The 2026-07-24 automation run found no glass reference image in `pm/design-references/`, so runtime glass styling stayed blocked. Added `pm/design-system-glass-inventory-2026-07-24.md`, updated the existing outbox report to `NEED-REFERENCE`, and moved the backlog row from planned night pass to the current reference gate.

**Encoding check:** `index.html` was not edited; the mandatory encoding ritual was not required for this docs-only run.

**Test:** Source/PM audit with `rg`, plus shared guards before commit.

**Commit:** final automation commit, see `git rev-parse HEAD`

---

## 2026-07-23

### VK AI chat Claude scope

**What changed:** For `BRIEF-2026-07-23-49-vk-ai-chat-claude-scope`, no runtime code was changed. Wrote `pm/outbox/REPORT-2026-07-23-49-vk-ai-chat-claude-scope.md`, marked the brief `NEED-CLAUDE`, and updated backlog/work logs with exact `/anthropic` request/response lines, redacted diagnostic plan and allowed post-review fix boundaries.

**Encoding check:** App HTML was not edited; `node scripts/check-cp1251-mojibake.mjs` is run before commit.

**Test:** Source audit and shared docs guards before commit.

**Commit:** this commit

---

## 2026-07-23

### VK auth session Claude scope

**What changed:** For `BRIEF-2026-07-23-48-vk-auth-session-claude-scope`, no runtime code was changed. Wrote `pm/outbox/REPORT-2026-07-23-48-vk-auth-session-claude-scope.md`, marked the brief `NEED-CLAUDE`, and updated backlog/work logs with exact token bootstrap/removal lines and the reviewed fix plan.

**Encoding check:** App HTML was not edited; `node scripts/check-cp1251-mojibake.mjs` is run before commit.

**Test:** Source audit and shared docs guards before commit.

**Commit:** this commit

---

## 2026-07-23

### VK calendar parser beta parity

**What changed:** For `BRIEF-2026-07-23-47-vk-calendar-parser-beta-parity`, added `localDateKey()` and `taskDeadlineDateKey()` in `vk.html`, then used them for task date sorting, overdue checks, parser output, detail date input, calendar task dots and selected-day lists. Added `scripts/vk-calendar-date-key-smoke.mjs`, `npm run smoke:vk-calendar-date-key`, updated file maps, backlog and outbox report.

**Encoding check:** `index.html` was not edited; `node scripts/check-cp1251-mojibake.mjs` is run before commit.

**Test:** `npm run smoke:vk-calendar-date-key`; shared VK/UI guards before commit.

**Commit:** this commit

---

## 2026-07-23

### VK profile beta parity

**What changed:** For `BRIEF-2026-07-23-46-vk-profile-beta-parity`, added account/identity summary chips, privacy policy navigation and a local-only notification settings entry in `vk.html`, without touching subscription/payment/VK Pay/entitlement behavior. Added `scripts/vk-profile-parity-smoke.mjs`, `npm run smoke:vk-profile-parity`, updated file maps, backlog and outbox report.

**Encoding check:** `index.html` was not edited; `node scripts/check-cp1251-mojibake.mjs` is run before commit.

**Test:** `npm run smoke:vk-profile-parity`; shared VK/UI guards before commit.

**Commit:** this commit

---

## 2026-07-23

### VK home beta parity

**What changed:** For `BRIEF-2026-07-23-45-vk-home-beta-parity`, added a narrow VK home parity slice in `vk.html`: focus summary, urgent/overdue/next-deadline chips, and a top task row derived from already loaded local task data. Added `scripts/vk-home-parity-smoke.mjs`, `npm run smoke:vk-home-parity`, updated file maps, backlog and outbox report.

**Encoding check:** `index.html` was not edited; `node scripts/check-cp1251-mojibake.mjs` is run before commit.

**Test:** `npm run smoke:vk-home-parity`; shared VK/UI guards before commit.

**Commit:** this commit

---

## 2026-07-23

### VK task-detail beta parity

**What changed:** For `BRIEF-2026-07-23-44-vk-task-detail-beta-parity`, added a narrow VK task-detail edit slice in `vk.html`: title, status, priority and deadline fields, save/cancel/error UX, worker update helper, local task-state sync, and a static/local smoke `scripts/vk-task-detail-edit-smoke.mjs`. Updated `package.json`, file maps, backlog and outbox report.

**Encoding check:** `index.html` was not edited; `node scripts/check-cp1251-mojibake.mjs` passed before commit.

**Test:** `npm run smoke:vk-task-detail-edit`, `npm run test:e2e:vk`, `node scripts/check-cp1251-mojibake.mjs`, `npm run check:js-syntax`, `node --check scripts/vk-task-detail-edit-smoke.mjs`, `npm run check:ui-architecture`, `npm run check:portable-paths`, `git diff --check`.

**Commit:** this commit

---

## 2026-07-23

### VK beta readiness map

**What changed:** For `BRIEF-2026-07-23-43-vk-beta-readiness-map`, wrote `pm/outbox/REPORT-2026-07-23-43-vk-beta-readiness-map.md`, marked the brief `DONE`, and changed the `VK-BETA-READINESS-001` backlog row to `Done`. The report orders briefs `44-49`, identifies auth/session and AI-chat as `NEED-CLAUDE`, and leaves real VK/device smoke to Yuri.

**Encoding check:** App HTML was not edited; `node scripts/check-cp1251-mojibake.mjs` is run before commit.

**Test:** PM/source audit through `pm/vk-parity-plan-2026-07-23.md`, `docs/tasks/BACK-066-vk-functional-parity-audit-2026-07-22.md`, `docs/tasks/BACK-066-vk-stable-line-functional-parity.md`, and `rg`; shared guards before commit.

**Commit:** this commit

---

## 2026-07-23

### DESIGN-GLASS-001 reference gate

**What changed:** For `BRIEF-2026-07-23-42-glass-design-system-foundation`, the runner found no reference image in `pm/design-references/` and did not implement cross-screen glass styling by guesswork. The brief was marked `NEED-CLAUDE`; the outbox report records the reference gate, current glass inventory and next atomic briefs.

**Encoding check:** `index.html` was not edited in this task; `node scripts/check-cp1251-mojibake.mjs` is run before commit.

**Test:** Source/PM audit through `rg`; shared guards before commit.

**Commit:** this commit

---

## 2026-07-23

### VK beta readiness night queue

**What changed:** Added VK beta-readiness night briefs `43-49` on `feat/admin-tariff-api`: readiness map, task-detail parity, home parity, profile parity, calendar/parser parity, plus `NEED-CLAUDE` scope reports for auth session and AI-chat. Updated `pm/backlog.md`, `shared/ROADMAP.md`, `shared/WORK_LOG.md`, and wrote `pm/outbox/REPORT-2026-07-23-vk-beta-night-queue.md`.

**Encoding check:** App HTML was not modified.

**Test:** Documentation/PM change. Final guard: `node scripts/check-cp1251-mojibake.mjs`, `git diff --check`.

**Commit:** this commit

---

## 2026-07-23

### Roadmap and backlog autotest status sync

**What changed:** Updated `shared/ROADMAP.md` and `pm/backlog.md` with the new `Auto evidence green / manual tail` status rule. Added the 2026-07-23 safe full-suite result to roadmap/backlog, updated `BACK-035`, `BACK-050`, `BACK-061`, `BACK-062`, `BACK-065`, `BACK-066` and `BACK-055` evidence notes, and kept live Telegram/VK/payment/OAuth/production gates out of `Done`.

**Encoding check:** `index.html` was not modified; `node scripts/check-cp1251-mojibake.mjs` passed with `0 suspicious tokens`.

**Test:** Full safe autotest suite passed before this docs sync; follow-up guards passed: `node scripts/check-cp1251-mojibake.mjs`, `npm run check:portable-paths`, `npm run check:ui-architecture`, `git diff --check`.

**Commit:** this commit

---

### Autotest coverage playbook and backlog map

**What changed:** Added `docs/qa/autotest-agent-playbook.md` with agent rules for Playwright, k6, existing `smoke:*` tests, `qa:prebeta`, night-session usage and manual-gate boundaries. Added `pm/autotest-backlog-coverage-2026-07-23.md` mapping current backlog/roadmap items to fully automatable, partially automatable and still-human QA gates. Added `scripts/run-bash-script.mjs` so npm scripts can run Git Bash guards on Windows even when `bash` is not in PATH, and added `check:portable-paths` plus `qa:prebeta` to `package.json`.

**Encoding check:** `index.html` was not modified; `node scripts/check-cp1251-mojibake.mjs` passed inside `npm run qa:prebeta` with `0 suspicious tokens`.

**Test:** `npm run qa:prebeta` passed end-to-end: JS syntax, mojibake, portable paths, UI architecture guard, Playwright 8/8, `smoke:home001`, `smoke:back050`, `smoke:back055`, `smoke:privacy-surface`, and `smoke:viral-share`.

**Commit:** this commit

---

### Playwright and k6 autotest tooling setup

**What changed:** Added `@playwright/test`, `playwright.config.ts`, `autotests/README.md`, Playwright smoke tests for web, Telegram Mini App and VK Mini App, plus `autotests/load/smoke-load.js` for guarded k6 local load smoke. Added npm scripts `test:e2e`, `test:e2e:web`, `test:e2e:telegram`, `test:e2e:vk`, `test:e2e:report` and `load:smoke`. Installed k6 via winget as `C:\Program Files\k6\k6.exe`.

**Encoding check:** `index.html` was not modified; `node scripts/check-cp1251-mojibake.mjs` passed with `0 suspicious tokens`.

**Test:** `npm run test:e2e:web` passed 4/4; `npm run test:e2e` passed 8/8; local k6 smoke passed 81/81 checks with `http_req_failed=0.00%` and `p95=182.5ms`; `npm audit fix` resolved the existing `brace-expansion` audit finding; `npm audit --omit=optional`, `npm run check:js-syntax`, `bash scripts/check-portable-paths.sh` and `git diff --check` passed.

**Commit:** this commit

---

### Telegram Mini App home task list visibility fix

**What changed:** Fixed a home dashboard case where only one visible task could appear while more active tasks existed. `loadTasks()` now normalizes legacy task identifiers (`taskId`, `task_id`, `key`) into the UI `id` field. `getHomeDashboardTasks()` now includes defer/fallback active tasks when filling the visible top-3 rows, and `#home-show-all-btn` becomes visible when active tasks exceed the visible rows. Added `#home-show-all-btn` LESS styling and extended `npm run smoke:home001` to cover 4 active tasks plus the visible show-all action.

**Encoding check:** index marker count before / after: 111 / 111; `node scripts/check-cp1251-mojibake.mjs` passed with `0 suspicious tokens`.

**Test:** `npm run build:css`; `npm run smoke:home001`; `npm run check:js-syntax`; `node scripts/check-cp1251-mojibake.mjs`; `C:\Program Files\Git\bin\bash.exe scripts/check-ui-architecture.sh`; `C:\Program Files\Git\bin\bash.exe scripts/check-portable-paths.sh`; `git diff --check`.

**Commit:** N/A

---

### Синхронизация ночных результатов в roadmap и backlog

**Что сделано:** В `pm/backlog.md` будущие формулировки ночной очереди 30-41 заменены фактическими результатами: 10 briefs Done, Focus отдельно реализован коммитом `91a483a` и требует ручной проверки, `ARCH-001` оставлен как решение для Claude/Юрия. В `shared/ROADMAP.md` добавлена понятная сводка ночной сессии и ссылка на `pm/ANALYSIS-2026-07-23-night-session-and-next-periods.md`. Обновлены `pm/team-sync.md` и `shared/WORK_LOG.md`.

**Проверка кодировки:** `index.html` не изменялся; обязательный mojibake guard запускается перед коммитом.

**Тест:** Markdown diff, проверка ссылок на локальные документы, `node scripts/check-cp1251-mojibake.mjs`, `bash scripts/check-portable-paths.sh`, `git diff --check`.

**Коммит:** this commit

---

### Ask action preview BEM-island cleanup

**What changed:** Removed generated inline layout styles from `renderAskActionPreview()` and `renderAskClarificationPreview()` in `index.html`. Added `.ask-action-card`, `.ask-action-label`, `.ask-action-list`, `.ask-action-controls` and `.ask-action-btn*` rules in `styles/screens/voice.less`; rebuilt `styles.css` and `styles.min.css`. Added `scripts/ask-action-preview-bem-smoke.mjs` and `npm run smoke:ask-action-preview`.

**Encoding check:** index marker count before / after: 111 / 111; `node scripts/check-cp1251-mojibake.mjs` passed with `0 suspicious tokens`.

**Test:** `npm run build:css`; `npm run smoke:ask-action-preview`; `node --check scripts/ask-action-preview-bem-smoke.mjs`; `node scripts/check-cp1251-mojibake.mjs`; `C:\Program Files\Git\bin\bash.exe scripts/check-ui-architecture.sh`; `C:\Program Files\Git\bin\bash.exe scripts/check-portable-paths.sh`; `git diff --check`.

**Commit:** this commit

---

### Task-card header BEM-island cleanup

**What changed:** Removed generated task-card header/category/deadline inline layout styles from `scripts/task-ui-renderers.js`. Added `.task-card-tags` wrapper and moved sizing/alignment into `.task-card-head`, `.task-card-tags`, `.task-card-tag`, and `.task-card-deadline` rules in `styles/screens/home.less`; rebuilt CSS artifacts. Updated BACK-012 inventory/backlog and team sync.

**Encoding check:** `index.html` was not modified in this slice; `node scripts/check-cp1251-mojibake.mjs` passed with `0 suspicious tokens`.

**Test:** `npm run build:css`; `node --check scripts/task-ui-renderers.js`; `npm run smoke:back019`; `C:\Program Files\Git\bin\bash.exe scripts/check-ui-architecture.sh`; `C:\Program Files\Git\bin\bash.exe scripts/check-portable-paths.sh`; `git diff --check`.

**Commit:** this commit

---

### Notification renderer BEM-island cleanup

**What changed:** Moved generated notification empty-state, kind-chip, preview, action-wrap and snooze-menu layout styles out of `scripts/task-ui-renderers.js` string templates into `.notif-*` classes in `styles/screens/voice.less`; rebuilt `styles.css` and `styles.min.css`. Updated BACK-012 inventory/backlog and team sync.

**Encoding check:** `index.html` was not modified in this slice; `node scripts/check-cp1251-mojibake.mjs` passed with `0 suspicious tokens`.

**Test:** `npm run build:css`; `node --check scripts/task-ui-renderers.js`; `npm run smoke:back055`; `C:\Program Files\Git\bin\bash.exe scripts/check-ui-architecture.sh`; `C:\Program Files\Git\bin\bash.exe scripts/check-portable-paths.sh`.

**Commit:** this commit

---

### Task-detail hero overflow iOS fix

**What changed:** Added a final task-detail mobile hero guard in `styles/screens/tasks.less`: long top tags stay one-line with ellipsis, title and description are back in normal flow, fixed absolute coordinates are overridden, and right-side date/priority cards keep a reserved column. Added `scripts/back-069-task-detail-hero-overflow-smoke.mjs` and `npm run smoke:back069-hero`.

**Encoding check:** index marker count before / after: 111 / 111; `index.html` was not modified in this slice.

**Test:** `npm run build:css`; `node scripts/check-cp1251-mojibake.mjs`; `node --check scripts/back-069-task-detail-hero-overflow-smoke.mjs`; `npm run smoke:back069-hero`; `git diff --check`.

**Commit:** this commit

---

### Task-detail tag popup iOS fix

**What changed:** Replaced native task-detail tag `<datalist>` behavior with an app-owned suggestion list inside `div#detail-tag-options`, added a visible cancel action, outside-click close, Escape close and focus restoration, and made `toggleTagInput()` open from computed display state. Added `scripts/back-068-task-detail-tag-popup-smoke.mjs` and `npm run smoke:back068-tag-popup`.

**Encoding check:** index marker count before / after: 111 / 111.

**Test:** `npm run build:css`; `node scripts/check-cp1251-mojibake.mjs`; `git diff --check`; `node --check scripts/back-068-task-detail-tag-popup-smoke.mjs`; `npm run smoke:back068-tag-popup`.

**Commit:** this commit

---

### Task-detail reminder picker iOS fix

**What changed:** Fixed the task-detail reminder picker by moving hidden `select#detail-reminder` out of `button.detail-redesign-bell`, keeping it as a sibling for the existing save/update path, and raising the task-detail action trigger size from 36px to 44px. Added `scripts/back-067-task-detail-reminder-smoke.mjs` and `npm run smoke:back067-reminder` for a focused 390x844 regression check.

**Encoding check:** index marker count before / after: 111 / 111.

**Test:** `npm run build:css`; `node scripts/check-cp1251-mojibake.mjs`; `git diff --check`; `npm run smoke:back067-reminder`.

**Commit:** this commit

---

### Full system roadmap, design, VK and QA tooling audit

**Что сделано:** Runtime не изменялся. Проведён системный audit PM/Git/design/VK/web-VK/auth/AI-chat/desktop notifications и QA tooling. Созданы pm/outbox/REPORT-4e-full-system-roadmap-and-design-audit-2026-07-23.md, pm/design-roadmap-correction-2026-07-23.md, pm/vk-parity-plan-2026-07-23.md и pm/qa-tooling-plan-2026-07-23.md. Зафиксированы три task-detail P1, stale concurrent statuses, OAuth global-alias candidate, web-VK token eviction на timeout, VK AI error-masking, PM-дубли и QA-lab план.

**Проверка кодировки:** index.html не редактировался. Обязательный checker вернул 0 suspicious tokens; audit отдельно обнаружил blind spot checker для 823 box-drawing fragments и одной пользовательской стрелки, вынесенный в QA-ENC-001.

**Тест:** home001, back019, back055, back050, back065, back066-vk, chat-history40 и privacy-surface smoke прошли. `git diff --check`, CP1251 checker и portable-path check прошли.

**Коммит:** `2f18363` (audit docs); final metadata SHA — в task handoff

---

### Night inbox/backlog runner sync

**What changed:** Current run found no `status: NEW` executable inbox briefs because night queue `30-41` was already closed or classified in HEAD. The pending Focus Day popup summary UI was committed separately, and this final automation report was added.

**Encoding check:** current `index.html` marker check returned `111`; `node scripts/check-cp1251-mojibake.mjs` passed with `0 suspicious tokens`.

**Test:** `git fetch origin`; `git pull --ff-only`; `git diff --check`; `npm run build:css`; `node scripts/check-js-syntax.mjs`; `C:\Program Files\Git\bin\bash.exe scripts/check-portable-paths.sh`; `C:\Program Files\Git\bin\bash.exe scripts/check-ui-architecture.sh`; `npm run smoke:home001`.

**Commit:** `91a483a` plus this docs/report commit.

---

## 2026-07-22

### iPhone task-detail regression audit

**What changed:** Runtime code was not changed. Saved Alexey's two iPhone/TMA screenshots, added `docs/tasks/BUG-2026-07-22-task-detail-ios-regressions.md`, and registered `BUG-2026-07-22-001..003`: reminder timing cannot be tapped, tag/native suggestion UI covers content, and long tag/title overlap deadline/priority cards. Notification delivery QA is blocked until the reminder control is fixed.

**Encoding check:** `index.html` was not edited.

**Test:** Visual inspection of the two supplied screenshots plus narrow source/CSS audit of task-detail reminder, tag input/datalist, and late hero layout overrides. `git diff --check`; mojibake guard required before commit.

**Commit:** N/A

---

## 2026-07-22

### Short AI-chat history persistence manual pass

**What changed:** Runtime code was not changed. Recorded Alexey's manual check on current preview `b7076e2`: a recognizable AI-chat message and the visible history remained after fully closing and reopening the app. `BUG-2026-07-21-005` remains open only for an extended history over the current 40-message load/window or another chat surface.

**Encoding check:** `index.html` was not edited.

**Test:** Manual AI-chat send, full close, reopen, and history recheck by Alexey.

**Commit:** N/A

---

## 2026-07-22

### Autologin login-screen flicker confirmed

**What changed:** Runtime code was not changed. Recorded Alexey's manual check on `https://qa-b7076e2.4-ai-staging.pages.dev/`, source `b7076e2`: saved-session autologin succeeds, but the login screen flashes very briefly before home. `BUG-2026-07-21-008` is confirmed as a non-blocking P2 auth-shell issue.

**Encoding check:** `index.html` was not edited.

**Test:** Manual close/reopen check by Alexey with an existing authorized session.

**Commit:** N/A

---

## 2026-07-22

### Subscription entry manual pass on current preview

**What changed:** Runtime code was not changed. Recorded Alexey's manual check on `https://qa-b7076e2.4-ai-staging.pages.dev/`, source `b7076e2`: the subscription button opened the payment provider flow through the card-entry form. `BUG-2026-07-21-007` is closed for the current preview; real payment completion remains untested.

**Encoding check:** `index.html` was not edited.

**Test:** Manual staging-preview check by Alexey; no card data entered and no money charged.

**Commit:** N/A

---

## 2026-07-22

### Isolated staging preview for release QA

**What changed:** Built the current `feat/admin-tariff-api` HEAD `b7076e2` with `PAGES_WORKER_TARGET=staging` and deployed only a Cloudflare Pages preview branch `qa-b7076e2`. Production, `main`, the shared staging alias, Worker code, payments, entitlements, and secrets were not changed. Direct deployment: `https://9ff9c715.4-ai-staging.pages.dev/`; stable preview alias: `https://qa-b7076e2.4-ai-staging.pages.dev/`.

**Encoding check:** `index.html` was not edited; `node scripts/check-cp1251-mojibake.mjs` passed with `0 suspicious tokens`.

**Test:** staging asset build and script-asset check passed; JS syntax check passed; both preview URLs returned `200` with the staging Worker marker, privacy-link fix, task-title normalization, and preview flags; `/auth/login` CORS preflight from the direct preview returned `204` with the matching origin. Cloudflare deployment source is `b7076e2`.

**Commit:** N/A (preview deployment and documentation only)

---

## 2026-07-22

### Morning inbox/safe backlog runner final report

**What changed:** Added the final report for `4e-morning-inbox-and-safe-backlog-runner` on 2026-07-22. Inbox had no executable `NEW` briefs; the run completed 3 safe `BACK-012` BEM-island cleanup tasks and stopped because current run limits were reached after three committed/pushed UI slices.

**Encoding check:** `index.html` was not edited in this final report task; `node scripts/check-cp1251-mojibake.mjs` is required before commit.

**Test:** `node scripts/check-cp1251-mojibake.mjs`; `git diff --check`; `C:\Program Files\Git\bin\bash.exe scripts/check-portable-paths.sh`.

**Commit:** this commit

---

## 2026-07-22

### BACK-012 notifications inline style cleanup

**What changed:** Moved notifications screen header wrapper, unread badge, filters padding, and list wrapper padding from `index.html` into `styles/screens/tasks.less`; rebuilt `styles.css` and `styles.min.css`. Notification filter/action handlers were not changed.

**Encoding check:** before editing `index.html`, marker check returned `106`; after editing, marker check returned `106`.

**Test:** `npm run build:css`; `node scripts/check-cp1251-mojibake.mjs`; `npm run smoke:back055`; `git diff --check`; `node scripts/check-js-syntax.mjs`; `C:\Program Files\Git\bin\bash.exe scripts/check-portable-paths.sh`; `C:\Program Files\Git\bin\bash.exe scripts/check-ui-architecture.sh` (`inline style attributes = 309 / 465`).

**Commit:** this commit

---

## 2026-07-22

### BACK-012 statistics inline style cleanup

**What changed:** Moved statistics screen header wrapper, period pill, action-link cursor styles, weekly rhythm label layout, and custom-list initial hidden state from `index.html` into `styles/screens/tasks.less`; rebuilt `styles.css` and `styles.min.css`. Runtime statistics calculations and click handlers were not changed.

**Encoding check:** before editing `index.html`, marker check returned `106`; after editing, marker check returned `106`.

**Test:** `npm run build:css`; `node scripts/check-cp1251-mojibake.mjs`; `npm run smoke:home001`; `git diff --check`; `node scripts/check-js-syntax.mjs`; `C:\Program Files\Git\bin\bash.exe scripts/check-portable-paths.sh`; `C:\Program Files\Git\bin\bash.exe scripts/check-ui-architecture.sh` (`inline style attributes = 313 / 465`).

**Commit:** this commit

---

## 2026-07-22

### BACK-012 calendar inline style cleanup

**What changed:** Moved calendar screen header wrapper, month navigation actions, deadlines section, deadlines label/icon, empty state, and footer layout styles from `index.html` into `styles/screens/tasks.less`; rebuilt `styles.css` and `styles.min.css`. Runtime calendar logic was not changed.

**Encoding check:** before editing `index.html`, marker check returned `106`; after editing, marker check returned `106`.

**Test:** `npm run build:css`; `node scripts/check-cp1251-mojibake.mjs`; `git diff --check`; `node scripts/check-js-syntax.mjs`; `C:\Program Files\Git\bin\bash.exe scripts/check-portable-paths.sh`; `C:\Program Files\Git\bin\bash.exe scripts/check-ui-architecture.sh` (`inline style attributes = 320 / 465`).

**Commit:** this commit

---

## 2026-07-22

### Night inbox/backlog runner final report

**What changed:** Added the final report for `4e-night-inbox-and-whitelist-backlog-runner` on 2026-07-22 and team/work log sync. Inbox had no `NEW` briefs; the run completed 4 backlog tasks and stopped because remaining work is gated or needs reviewed follow-up briefs.

**Encoding check:** `index.html` was not edited in this final report task; `node scripts/check-cp1251-mojibake.mjs` is required before commit.

**Test:** `node scripts/check-cp1251-mojibake.mjs`; `git diff --check`; `bash scripts/check-portable-paths.sh`.

**Commit:** this commit

---

## 2026-07-22

### BACK-066A VK task intent parsing

**What changed:** Fixed VK chat task command parsing to avoid Cyrillic-unsafe JS `\b`, normalize simple assignee-task phrases, strip recognized deadline phrases from `task.text`, preserve raw input in `originalMsg`, and added `scripts/back-066-vk-task-intent-smoke.mjs` / `npm run smoke:back066-vk`. VK Pay/payment, production deploy, `main`, CAL, secrets, and entitlement were untouched.

**Encoding check:** before editing `vk.html`, marker check returned `13`; after editing, marker check returned `14` (not lower; new smoke/package text adds a marker occurrence outside the existing UI copy). `index.html` was not edited in this task.

**Test:** `npm run smoke:back066-vk`; `node scripts/check-cp1251-mojibake.mjs`; `node --check scripts/back-066-vk-task-intent-smoke.mjs`; `git diff --check`.

**Commit:** this commit

---

## 2026-07-22

### BACK-066 VK functional parity source audit

**What changed:** Added `docs/tasks/BACK-066-vk-functional-parity-audit-2026-07-22.md`, linked it from the parent task, and updated backlog/QA/team sync status to `Partial Done`. Runtime code was not changed; VK Pay/payment, production deploy, `main`, CAL, secrets, and entitlement were untouched.

**Encoding check:** `index.html` was not edited in this task.

**Test:** Source audit of `vk.html` anchors for auth, enter-app, tasks, task detail, AI chat, calendar, stats, and profile against `index.html` anchors from `FILE_MAP_UI.md`; `node scripts/check-cp1251-mojibake.mjs`; `git diff --check`; `bash scripts/check-portable-paths.sh`.

**Commit:** this commit

---

## 2026-07-22

### BACK-065 task title normalization

**What changed:** Added `normalizeTaskTitle()` and connected it to fallback AI-chat task creation, voice task creation, model-created task payloads, and quick-add. The full raw user phrase remains in `originalMsg` when normalization changes the title. Added `scripts/back-065-task-title-normalization-smoke.mjs` and `npm run smoke:back065`; updated `FILE_MAP.md` and `FILE_MAP_UI.md`.

**Encoding check:** before editing `index.html`, marker check returned `106`; after editing, marker check returned `106`.

**Test:** `npm run smoke:back065`; `node scripts/check-cp1251-mojibake.mjs`; `node --check scripts/back-065-task-title-normalization-smoke.mjs`; `git diff --check`.

**Commit:** this commit

---

## 2026-07-22

### BACK-064 classified as Yuri-only notification smoke

**What changed:** Marked `BACK-064` and `BUG-2026-07-21-006` as `NEED-YURI` and added the outbox report. Runtime code was not changed because the task's acceptance criteria require real Telegram/device delivery, correct-recipient proof, sound/vibration, and visible badge/card evidence.

**Encoding check:** `index.html` was not edited in this task; `node scripts/check-cp1251-mojibake.mjs` is required before commit.

**Test:** Reviewed `docs/tasks/BACK-064-notification-salience-delivery-audit.md`, `pm/backlog.md`, and `pm/bugs.md` against autonomous guardrails.

**Commit:** this commit

---

## 2026-07-21

### PM inbox daily runner final summary

**What changed:** Added the final automation report for the 2026-07-21 PM inbox daily runner. Inbox ended with no `NEW` briefs; backlog/roadmap pass found no remaining autonomous whitelist task.

**Encoding check:** `index.html` was not edited in this task; `node scripts/check-cp1251-mojibake.mjs` passed with `0 suspicious tokens`.

**Test:** `node scripts/check-cp1251-mojibake.mjs`; `git diff --check`; `git diff --cached --check`; `node scripts/check-js-syntax.mjs`; `bash scripts/check-portable-paths.sh`.

**Commit:** this commit

---

## 2026-07-21

### Liquid-glass system classified for review

**What changed:** For `BRIEF-2026-07-21-night-liquid-glass-system`, classified the requested cross-screen liquid-glass design-language implementation as `NEED-CLAUDE` under the autonomous guardrails. Runtime code was not changed.

**Encoding check:** `index.html` was not edited in this task; `node scripts/check-cp1251-mojibake.mjs` passed with `0 suspicious tokens`.

**Test:** Reviewed source artifact anchors for liquid-glass variables, panel surface, edge light, green glow, and hover behavior; reviewed existing glass/redesign anchors in `styles/variables.less` and `styles/screens/light-redesign.less`; `node scripts/check-cp1251-mojibake.mjs`; `git diff --check`; `git diff --cached --check`; `node scripts/check-js-syntax.mjs`; `bash scripts/check-portable-paths.sh`.

**Commit:** this commit

---

## 2026-07-21

### FILE_MAP UI line sync

**What changed:** For `BRIEF-2026-07-20-28-file-map-sync-audit`, updated `FILE_MAP_UI.md` line numbers for current `index.html` screen anchors, top-level head/HTML/JS ranges, and biometric patch range. Product code was not changed.

**Encoding check:** `index.html` was not edited in this task; `node scripts/check-cp1251-mojibake.mjs` passed with `0 suspicious tokens`.

**Test:** `Select-String` anchor checks for `home`, `dash-bottom-nav`, `task-detail`, `calendar`, `notifications`, `profile`, `subscription`, `chat-conv`, `global-nav`, key JS functions, and `biometric-consent`; `node scripts/check-cp1251-mojibake.mjs`; `git diff --check`; `git diff --cached --check`; `bash scripts/check-portable-paths.sh`.

**Commit:** this commit

---

## 2026-07-21

### BACK-049 UI guard evidence upgrade

**What changed:** For `BRIEF-2026-07-20-27-back049-ui-guard-evidence-upgrade`, documented exact guard patterns and raw current-HEAD output in `docs/tasks/EVIDENCE-AUDIT-2026-07-17.md`; added a negative scratch test outside the git tree with 403 deliberate `onclick` handlers, proving the guard fails on inline handler growth. Product runtime files were not changed.

**Encoding check:** `index.html` was not edited in this task; `node scripts/check-cp1251-mojibake.mjs` passed with `0 suspicious tokens`.

**Test:** `bash scripts/check-ui-architecture.sh`; negative `%TEMP%` scratch test failed as expected with exit code `1`; staged `node scripts/check-js-syntax.mjs` passed with `no staged JS or HTML files`; `git diff --cached --check`; `bash scripts/check-portable-paths.sh`.

**Commit:** this commit

---

## 2026-07-21

### GPT-QA layout overlap fixes

**What changed:** For `BRIEF-2026-07-20-26-layout-overlaps-from-gpt-qa`, made CSS-only layout fixes: subscription scroll reserve now leaves more room below payment CTA, chat conversation chips/input reserve bottom safe area and suppress global nav while active, and auth/public screens have a CSS fallback that hides global/bottom navigation. Rebuilt `styles.css` and `styles.min.css`.

**Encoding check:** `index.html` was not edited in this task; cp1251/mojibake guard passed with `0 suspicious tokens`.

**Test:** `npm run build:css`; `npm run smoke:back050` returned `"ok": true`; `node scripts/check-cp1251-mojibake.mjs`; `bash scripts/check-ui-architecture.sh` (inline handlers `397 / 402`, inline scripts `3 / 3`); staged `node scripts/check-js-syntax.mjs` passed with `no staged JS or HTML files`; `git diff --cached --check`; `bash scripts/check-portable-paths.sh`.

**Commit:** this commit

---

## 2026-07-21

### Dashboard preview state flags

**What changed:** For `BRIEF-2026-07-20-23-preview-state-flags-for-qa`, added preview-only query flags in `scripts/auth-handlers.js`: `previewUser=trial|paid|expired|free`, `previewTasks=empty|mixed|done-failed`, `previewApi=ok|error`, and `previewTheme=light|dark`. The flags only work with `previewDemo=dashboard` on localhost or direct `*.4-ai-staging.pages.dev` preview hosts. They only alter mock user/task/API/theme visuals.

**Encoding check:** `index.html` was not edited in this task; cp1251/mojibake guard passed with `0 suspicious tokens`.

**Test:** `node --check scripts/auth-handlers.js`; `npm run smoke:home001` returned `"ok": true`; `node scripts/check-cp1251-mojibake.mjs`; `bash scripts/check-ui-architecture.sh` (inline handlers `397 / 402`, inline scripts `3 / 3`); staged `node scripts/check-js-syntax.mjs` passed for `scripts/auth-handlers.js`; `git diff --cached --check`; `bash scripts/check-portable-paths.sh`.

**Commit:** this commit

---

## 2026-07-21

### ARCH-001 inline escape helper extraction

**What changed:** For `BRIEF-2026-07-20-22-arch001-continue-split`, moved the pure inline `esc()` helper into `scripts/platform-adapter.js` as `escapeInlineHandlerValue(value)`. `index.html` still exposes the local `esc` alias for existing call sites, resolving through `PLATFORM.escapeInlineHandlerValue` with the previous implementation as fallback. No UI flow, payment, entitlement, auth-security, production, CAL, price, or secret logic was changed.

**Encoding check:** before editing `index.html`, marker check returned `106`; after editing, marker check returned `106`. Backup created before edit: `index.backup_20260721_2311.html`, then removed before staging as a local safety copy.

**Test:** `node scripts/check-cp1251-mojibake.mjs`; `bash scripts/check-ui-architecture.sh` (inline handlers `397 / 402`, inline scripts `3 / 3`); `bash scripts/check-portable-paths.sh`; `npm run smoke:back050` returned `"ok": true`; staged `node scripts/check-js-syntax.mjs` passed for `scripts/platform-adapter.js` and all three `index.html` inline scripts; `git diff --cached --check`.

**Commit:** this commit

---

## 2026-07-21

### 4e PM inbox daily runner pre-sync

**What changed:** Runtime code was not changed. After `git pull --ff-only` was blocked by local PM/documentation edits, the local work was stashed, origin was fast-forwarded, the stash was reapplied, and document conflicts were resolved. Upstream `BUG-2026-07-21-001..004` / `BACK-061..063` were preserved, while local manual QA/triage notes were renumbered to `BUG-2026-07-21-005..008` and `BACK-064..066`.

**Encoding check:** `index.html` was not edited; `node scripts/check-cp1251-mojibake.mjs` is required before commit.

**Test:** `rg` conflict-marker check; `git diff --check`; `bash scripts/check-portable-paths.sh`; `node scripts/check-cp1251-mojibake.mjs`.

**Commit:** this commit

---

## 2026-07-21

### VIRAL share-card static smoke

**Что сделано:** для `BRIEF-2026-07-20-21-viral-share-card-finish` добавлен `scripts/viral-share-card-smoke.mjs` и npm-script `smoke:viral-share`. Скрипт статически проверяет существующий runtime без изменения `index.html`: `buildDailyShareCardBlob()`, `buildWeeklySummaryCardBlob()`, `shareDailyCard()`, `shareWeeklySummaryCard()`, streak/achievements и weekly stats, PNG canvas 1080x1350, native share, download fallback и lite analytics events.

**Проверка кодировки:** `index.html` не изменялся; обязательная проверка cp1251/mojibake выполнена отдельным guard.

**Тест:** `npm run smoke:viral-share`, `node scripts/check-cp1251-mojibake.mjs`, `node scripts/check-js-syntax.mjs`, `bash scripts/check-ui-architecture.sh`, `git diff --check`, `bash scripts/check-portable-paths.sh`.

**Коммит:** этот коммит; SHA см. в финальном отчёте Codex.
## 2026-07-21

### BACK-012 auth CSS/BEM cleanup island

**Что сделано:** один безопасный auth-island inline→LESS: forgot/reset center panel, auth icon card, password relative wrapper и small auth action wrappers перенесены из inline `style="..."` в `styles/layout.less` как `.auth-center-panel`, `.auth-icon-card`, `.auth-password-field`, `.auth-inline-action*`. Разметка и поведение не менялись; `styles.css`/`styles.min.css` пересобраны через `npm run build:css`. Brief `BRIEF-2026-07-20-20-back012-css-bem-cleanup.md` закрыт, report добавлен в `pm/outbox`.

**Проверка кодировки:** до правки 106 совпадений по `Войти|Задачи|Сегодня`; после правки 106 совпадений.

**Тест:** `npm run build:css`; `node scripts/check-cp1251-mojibake.mjs`; `git diff --check`; `bash scripts/check-ui-architecture.sh` показал inline style attrs `366 -> 356`; `bash scripts/check-portable-paths.sh`; `npm run smoke:back050` вернул `ok: true`.

**Коммит:** `this commit`

## 2026-07-21

### BACK-062 auth legal contrast and touch targets

**Что сделано:** в `index.html` legal-note на onboarding/login/register поднят с 11px/muted до 13px/`var(--text2)` и ссылка privacy получила класс `.auth-legal-link`. В `styles/layout.less` добавлены доступные размеры: privacy link min-height 44px, login/register tabs min-height 44px, password-eye 44x44, forgot-link min-height 44px; фокус `:focus-visible` расширен на `.auth-legal-link`. `styles.css` и `styles.min.css` пересобраны через `npm run build:css`. PM-контур обновлён: `BACK-062`, `BUG-2026-07-21-002` и `BUG-2026-07-21-003` переведены в `Ready for QA`.

**Проверка кодировки:** до правки 106 совпадений по `Войти|Задачи|Сегодня`; после правки 106 совпадений.

**Тест:** `npm run build:css`; перед commit запустить `node scripts/check-cp1251-mojibake.mjs`, `node scripts/check-js-syntax.mjs`, `git diff --check`, `bash scripts/check-portable-paths.sh`, `bash scripts/check-ui-architecture.sh`.

**Коммит:** `this commit`

## 2026-07-21

### BACK-061 auth legal privacy link

**Что сделано:** в `index.html` ссылки `Политикой конфиденциальности` на onboarding и login/register получили явный `data-privacy-policy-link` binding. Добавлены `openPrivacyPolicy()` и `bindPrivacyPolicyLinks()`: в Telegram WebApp используется `Telegram.WebApp.openLink`, в обычном браузере `window.open('privacy.html')`, при блокировке popup — переход текущей вкладки. PM-контур обновлён: `BACK-061` и `BUG-2026-07-21-001` переведены в `Ready for QA`.

**Проверка кодировки:** до правки 106 совпадений по `Войти|Задачи|Сегодня`; после правки 106 совпадений.

**Тест:** перед commit запустить `node scripts/check-cp1251-mojibake.mjs`, `node scripts/check-js-syntax.mjs`, `git diff --check`, `bash scripts/check-portable-paths.sh`, `bash scripts/check-ui-architecture.sh`.

**Коммит:** `this commit`

## 2026-07-21

### QA-001 public smoke audit triage

**Что сделано:** внешний draft PR https://github.com/mrktggod/qb2b/pull/1 разобран и перенесён в PM-контур проекта. В `pm/bugs.md` добавлены четыре подтверждённые/продуктовые находки: privacy-link click, contrast, touch targets, desktop-public-shell decision. В `pm/backlog.md` добавлены `BACK-061`, `BACK-062`, `BACK-063` и строка `QA-001`. Также исправлена повреждённая запись WORK_LOG/DEVELOPMENT_LOG по production Worker Static Assets deploy без изменения кода приложения.

**Проверка кодировки:** index.html не изменялся; проверка не применялась.

**Тест:** PM-only правка; перед commit запустить `node scripts/check-cp1251-mojibake.mjs`, `git diff --check`, `bash scripts/check-portable-paths.sh`.

**Коммит:** `this commit`

## 2026-07-21

### Production Worker Static Assets deploy for redesign

**Что сделано:** после успешного merge/push в `main` и Cloudflare Pages deploy обнаружено, что боевой `app.4-ai.site` обслуживается не Pages custom domain, а Worker Static Assets из `wrangler.toml` (`4-ai-app-worker`, routes `app.4-ai.site` и `app.4-ai.site/*`). Выполнен production `npm run build:worker-assets` и `npx wrangler deploy`.

**Проверка кодировки:** 106 совпадений после merge-resolve и перед деплоем.

**Тест:** production artifact содержит `https://edge.4-ai.site` и не содержит `4-ai-staging.pages.dev`, `workers.dev`, `design-part3-handoff.js`. Live `https://app.4-ai.site/sw.js` содержит `prod-redesign-2026-07-21`; live HTML содержит `dash-artboard`, `detail-redesign-shell`, `profile-handoff-shell` и не содержит staging marker / Part 3 script.

**Деплой:** `4-ai-app-worker` version `6aeffdda-4ab0-476c-892b-0ee0725fea4d`.

**Коммит:** `57ae1b4`

## 2026-07-21

### Production redesign release guard

**Что сделано:** при production-сборке `scripts/build-pages-whitelist.mjs` заменяет staging-host marker `4-ai-staging.pages.dev` на disabled marker, чтобы GitHub Pages deploy guard не блокировал релиз из-за preview-only логики в `index.html`.

**Проверка кодировки:** 106 совпадений до/после merge-resolve.

**Тест:** production `npm run build:worker-assets`; проверка отсутствия `4-ai-staging.pages.dev` и `design-part3-handoff.js` в `.pages-dist/index.html`.

**Коммит:** `5bab618`
# DEVELOPMENT LOG вЂ” РїСЂРѕРµРєС‚ 4 AI-СЃРµРєСЂРµС‚Р°СЂСЊ

> Р’РµРґСѓ СЏ (Cowork-РЅР°Р±Р»СЋРґР°С‚РµР»СЊ). РћР±РЅРѕРІР»СЏРµС‚СЃСЏ РїРѕСЃР»Рµ РєР°Р¶РґРѕРіРѕ Р·РЅР°С‡РёРјРѕРіРѕ РёР·РјРµРЅРµРЅРёСЏ.
> РњРёРјРѕ Рё Codex РґРѕРїРёСЃС‹РІР°СЋС‚ СЂР°Р·РґРµР» РїРѕСЃР»Рµ РєР°Р¶РґРѕР№ РІС‹РїРѕР»РЅРµРЅРЅРѕР№ Р·Р°РґР°С‡Рё.

---

## 2026-07-21 - Autologin delay bug

### BUG-2026-07-21-008 login flicker before authorized app entry

**What changed:** Runtime code was not changed. `pm/bugs.md` now tracks `BUG-2026-07-21-008`: with an existing authorization, the app has a small delay between autologin and app entry, and may briefly show the login screen. `pm/qa-results-2026-07-17.md` records it as a new auth-shell bug.

**Encoding check:** `index.html` was not edited.

**Test:** User report by Alexey in chat; runtime reproduction still needed with a saved staging session and timing evidence.

**Commit:** N/A

---

## 2026-07-21 - NEED-YURI manual notes

### Redesign resolved elsewhere, voice user-visible pass

**What changed:** Runtime code was not changed. `pm/qa-results-2026-07-17.md` records Alexey's note that redesign corrections were handled in another chat and should be treated as resolved outside this manual-QA thread. `pm/backlog.md` records that voice works for Alexey and he uses it constantly; `NEW-020` remains only as an optional technical perf-breakdown tail if raw `__voicePerfLast` numbers are still required.

**Encoding check:** `index.html` was not edited.

**Test:** Manual report by Alexey in chat: redesign had many corrections in another chat and is resolved; voice works and is used constantly.

**Commit:** N/A

---

## 2026-07-21 - Auth/avatar manual recheck

### Wrong password green once, avatar blocked

**What changed:** Runtime code was not changed. `pm/qa-results-2026-07-17.md` now records `QA-AUTH-004` as PASS from Alexey's manual staging check: `Неверный пароль: ошибка видна`. `pm/bugs.md` was updated so `BUG-2026-07-20-001` is `Ready for QA / manually green once`; avatar bugs `BUG-2026-07-20-002` and `BUG-2026-07-20-003` remain blocked because Alexey reported that setting a new avatar says the function is not working yet.

**Encoding check:** `index.html` was not edited.

**Test:** Manual staging report by Alexey in chat: wrong-password error is visible; new avatar cannot be set because the app says the function is not working yet.

**Commit:** N/A

---

## 2026-07-21 - Manual release-readiness check

### Production reachability and GitHub Actions snapshot

**What changed:** Runtime code was not changed. `docs/tasks/MERGE-READINESS-2026-07-17.md` and `pm/qa-results-2026-07-17.md` now record Alexey's manual release-readiness snapshot: Actions are mostly green with one red `Deploy GitHub Pages #264` on `main` commit `7325c27`; production app opens; production tariff config opens; price looks normal.

**Encoding check:** `index.html` was not edited.

**Test:** Manual report and screenshot from Alexey: `Actions: зеленые и один красный`, `Prod app: открывается`, `Prod tariff: открывается`, `Цена: норм`.

**Commit:** N/A

---

## 2026-07-21 - Subscription button staging bug

### BUG-2026-07-21-007 payment UI entrypoint

**What changed:** Runtime code was not changed. `pm/bugs.md` now tracks `BUG-2026-07-21-007`: on `https://4-ai-staging.pages.dev/`, the subscription button does not work and does not open the page. `pm/qa-results-2026-07-17.md` marks `QA-PAY-001` as FAIL for this payment UI entrypoint. No real payment/provider flow was attempted.

**Encoding check:** `index.html` was not edited.

**Test:** Manual staging report by Alexey in chat: "кнопка подписки не работает не открывает страницу" on `https://4-ai-staging.pages.dev/`.

**Commit:** N/A

---

## 2026-07-21 - Telegram Mini App manual smoke

### NEW-006 / NEW-008 live phone check

**What changed:** Runtime code was not changed. `pm/qa-results-2026-07-17.md`, `docs/tasks/NEW-006-tma-safe-area-live-smoke.md`, and `docs/tasks/NEW-008-chat-keyboard-live-smoke.md` now record Alexey's Telegram Mini App report: `ТГ Mini App ок`. The evidence is scoped to the requested AI-chat keyboard and bottom-nav/safe-area phone check; payment/provider/OAuth gates remain Not run.

**Encoding check:** `index.html` was not edited.

**Test:** Manual Telegram Mini App smoke reported by Alexey in chat: `ТГ Mini App ок`.

**Commit:** N/A

---

## 2026-07-21 - Manual browser staging smoke

### Alexey basic staging check

**What changed:** Runtime code was not changed. `pm/qa-results-2026-07-17.md` now records Alexey's manual browser report for `https://4-ai-staging.pages.dev/` as PASS for the basic login/task-create/reload persistence flow. Telegram Mini App safe-area/keyboard and payment/provider/OAuth gates remain Not run.

**Encoding check:** `index.html` was not edited.

**Test:** Manual browser smoke reported by Alexey in chat: "все ок".

**Commit:** N/A

---

## 2026-07-21 - BACK-056 task-doc status sync

### Pre-dawn inbox/backlog runner closeout

**What changed:** Runtime code was not changed. `docs/tasks/BACK-056-home-focus-time-copy.md` was synced from stale `Todo` to `Done` and now includes a 2026-07-21 closeout section pointing to the already-recorded evidence in `pm/backlog.md`, `shared/ROADMAP.md`, and `shared/WORK_LOG.md`.

**Encoding check:** `index.html` was not edited; `node scripts/check-cp1251-mojibake.mjs` is required before commit and recorded in the outbox report/final summary.

**Test:** `node scripts/check-cp1251-mojibake.mjs`; Git Bash `scripts/check-portable-paths.sh`; `git diff --check`.

**Commit:** `this commit`

---

## 2026-07-20 - Auth/avatar login diagnosis

### BRIEF-2026-07-20-morning-refine-01 auth/avatar root cause

**What changed:** Added `scripts/auth-avatar-login-diagnose.mjs` and `npm run smoke:auth-avatar` to reproduce the requested staging auth/avatar issues on fresh accounts without changing auth, password, merge, payment, entitlement, production, or `main`. Wrote a NEED-CLAUDE report with root-cause candidates for wrong-password inline error, avatar leak between accounts in one browser, and avatar not persisting in web/fresh browser.

**Encoding check:** `index.html` was not changed in this run; `node scripts/check-cp1251-mojibake.mjs` passed with 0 suspicious tokens.

**Test:** `npm run smoke:auth-avatar`; `node --check scripts/auth-avatar-login-diagnose.mjs`; `node scripts/check-cp1251-mojibake.mjs`; `npm run check:js-syntax`; Git Bash `scripts/check-portable-paths.sh`; `git diff --check`.

**Commit:** N/A for pre-commit log entry; final commit SHA is reported in the task summary.

---

## 2026-07-20 - BACK-050 accessibility smoke

### Repeatable auth/toast/dialog accessibility guard

**What changed:** Added `scripts/back-050-accessibility-smoke.mjs` and `npm run smoke:back050`. The smoke opens local `index.html` in headless Chrome/CDP at 390x844 and verifies auth/reset labels, `aria-describedby`, field errors, `aria-invalid`, toast `status`/`alert` live-region behavior, and quick-add/contact/focus dialog ARIA plus focus-in/focus-return. Fixed `isCriticalToastMessage()` so Cyrillic critical phrases such as `Нет соединения` switch the toast to `role="alert"` / `aria-live="assertive"`; the old regex used word boundaries that did not reliably match Cyrillic.

**Encoding check:** `index.html` markers before edit: 106; after edit: 106.

**Test:** `npm run smoke:back050`; `node scripts/check-cp1251-mojibake.mjs`; `npm run check:js-syntax`; Git Bash `scripts/check-ui-architecture.sh`; Git Bash `scripts/check-portable-paths.sh`; `git diff --check`.

**Commit:** N/A for pre-commit log entry; final commit SHA is reported in the automation summary.

---

## 2026-07-20 - BACK-055 notification action-card smoke

### Headless evidence for notification attention feed

**What changed:** Added `scripts/back-055-notifications-smoke.mjs` and `npm run smoke:back055` to run an isolated Chrome/CDP smoke for the notification action-card renderer. The smoke verifies the 390x844 notifications surface without live Telegram/backend calls: four cards render without horizontal overflow, unread badge counts unread items, deadline card expands, top-level actions stay to `К задаче / Отложить / Готово`, snooze opens four options, task navigation uses the linked task id, reminder `Готово` calls the done path, waiting notification opens the write flow, filters work, and empty state renders. Updated `docs/tasks/BACK-055-notifications-headless-smoke.md`, `docs/tasks/BACK-055-notifications-action-cards.md`, `docs/tasks/EVIDENCE-AUDIT-2026-07-17.md`, `FILE_MAP.md`, `pm/team-sync.md`, and the outbox report to record `BACK-055` as LIVE evidence rather than SOURCE-ONLY.

**Encoding check:** `index.html` was not changed; `node scripts/check-cp1251-mojibake.mjs` passed with 0 suspicious tokens.

**Test:** `npm run smoke:back055`; `node scripts/check-cp1251-mojibake.mjs`; Git Bash `scripts/check-portable-paths.sh`; `git diff --check`.

**Commit:** N/A for self-referential status-sync entry; final commit SHA is reported in the automation summary.

---

## 2026-07-20 - BACK-019 status sync

### Roadmap and logs aligned after task-card smoke

**What changed:** `shared/ROADMAP.md` now matches `pm/backlog.md` and `pm/team-sync.md`: `BACK-019` is `Done` after the 2026-07-19 headless mobile smoke. The earlier BACK-019 log entries now point at implementation commit `6428386` instead of `pending`.

**Encoding check:** `index.html` was not changed; `node scripts/check-cp1251-mojibake.mjs` passed with 0 suspicious tokens.

**Test:** `node scripts/check-cp1251-mojibake.mjs`; Git Bash `scripts/check-portable-paths.sh`; `git diff --check`.

**Commit:** N/A for self-referential status-sync entry; final commit SHA is reported in the automation summary.

---

## 2026-07-19 - BACK-019 task card mobile smoke

### Task-card clamp and headless mobile QA

**What changed:** `scripts/task-ui-renderers.js:39` no longer writes an inline style on `.task-card-title`, so the existing CSS clamp in `styles.css` can enforce the two-line title rule. Added `scripts/back-019-task-card-smoke.mjs` and `npm run smoke:back019` to run the BACK-019 tap/swipe/overflow smoke in installed Chrome through CDP at 390x844.

**Encoding check:** `index.html` was not changed; `node scripts/check-cp1251-mojibake.mjs` passed with 0 suspicious tokens.

**Test:** `npm run smoke:back019` passed with `viewportWidth=390`, `documentScrollWidth=390`, `lineClamp=2`, `lastCardBottom=428`, `navTop=764`; `node scripts/check-js-syntax.mjs`; `bash scripts/check-portable-paths.sh`; `git diff --check`.

**Commit:** `6428386`

---

## 2026-07-06 — merge `origin/main` into `feat/admin-tariff-api`

### Разрешение конфликтов перед PR

**Что сделано:** Локально выполнен merge `origin/main` в `feat/admin-tariff-api` и вручную разобраны конфликты. В `index.html` сохранён новый inline-описательный блок task detail из `main`, убраны дубли `detail-time-input` / `detail-direction` / `detail-person`, оставлена контактная кнопка исполнителя из feature-ветки и раскрываемый блок «Личные данные аккаунта» в профиле. В PM-документах сохранён `BACK-048` для dev/test accounts, а профильные задачи feature-ветки перенумерованы в `BACK-052`, `BACK-053`, `BACK-054`. `styles.css` и `styles.min.css` пересобраны из `styles/main.less`; `FILE_MAP.md` и `FILE_MAP_UI.md` обновлены под фактические строки.

**Проверка кодировки:** `index.html` markers до merge: 32; после разрешения конфликтов: 32.

**Тест:** `rg -n "^(<<<<<<<|=======|>>>>>>>)" ...`; `git diff --check`; `bash scripts/check-portable-paths.sh`; LESS/minified CSS build через bundled Node 24 (`node .../lessc`, `node .../cleancss`), потому что системный `node v12/npm 6` не поддержал текущий `package-lock.json` v3.

**Коммит:** `этот merge-коммит`

---

## 2026-07-08 — Roadmap filters and monetization alignment

### Синхронизация roadmap по Now / Next / Later / Future / Icebox

**Что сделано:** Код приложения не менялся. Roadmap и backlog пересобраны через продуктовые фильтры: проблема пользователя, усиление "личного штаба дня", необходимость до первых активных/платящих пользователей, стоимость и горизонт. В `pm/backlog.md` добавлен фильтр горизонтов, `BACK-055` поднят до P1, `BUG-2026-07-05-003` связан с новой задачей `BACK-056`, а архитектурный распил `index.html` переименован из конфликтного `BACK-036` в `ARCH-001`. Добавлены `BETA-001`, `ANALYTICS-001`, `FEEDBACK-001` и `ONBOARD-001`. `pm/next-actions.md` заменён актуальной последовательностью: beta gate → закрытый тест → усиление штаба дня → монетизация. Для Юрия создан отчёт `pm/agent-inbox/codex-to-yuri-2026-07-08-roadmap-filters-monetization.md`.

**Проверка кодировки:** `index.html` не менялся, Шаг 0 не требовался.

**Тест:** Документальная проверка связки `shared/ROADMAP.md` → `pm/backlog.md` → `pm/next-actions.md` → `pm/bugs.md` / `pm/qa-checklist.md` → `pm/agent-inbox/codex-to-yuri-2026-07-08-roadmap-filters-monetization.md`; `git diff --check`; `bash scripts/check-portable-paths.sh`.

**Коммит:** N/A

## 2026-07-08 — CAL-001 / OMNI-001 roadmap planning

### Календарь и омниканальные поверхности как будущий слой штаба дня

**Что сделано:** Код приложения не менялся. В `shared/ROADMAP.md` добавлено решение: 4 позиционируется как омниканальный личный штаб дня, а не как бот или generic task manager; календарь поднят в ближайшую продуктовую проработку. В `pm/backlog.md` добавлены `CAL-001`, `CAL-002`, `CAL-003` и `OMNI-001`. Созданы task-документы `docs/tasks/CAL-001-calendar-concept.md` и `docs/tasks/OMNI-001-omnichannel-surfaces.md`. Для согласования с Юрием/Claude подготовлено письмо `pm/agent-inbox/codex-to-team-2026-07-08-omnichannel-calendar-roadmap.md`.

**Проверка кодировки:** `index.html` не менялся, Шаг 0 не требовался.

**Тест:** Документальная проверка связки `shared/ROADMAP.md` → `pm/backlog.md` → `docs/tasks/CAL-001-calendar-concept.md` / `docs/tasks/OMNI-001-omnichannel-surfaces.md` → `pm/agent-inbox/codex-to-team-2026-07-08-omnichannel-calendar-roadmap.md`; `git diff --check`; `bash scripts/check-portable-paths.sh`.

**Коммит:** N/A

## 2026-07-08 — SMART-013: AI task decomposition spec

### Постановка задачи на AI-декомпозицию задачи в чек-лист

**Что сделано:** Код приложения не менялся. Создано ТЗ `docs/tasks/SMART-013-ai-task-decomposition.md`: кнопка `Разбить на этапы` должна жить в блоке чек-листа `task-detail`, AI показывает preview 3-7 шагов, пользователь подтверждает, после чего этапы сохраняются как обычные пункты `checklist`. Добавлен visual reference `docs/tasks/assets/SMART-013-ai-task-decomposition-mockup.png` с source SVG рядом. В `pm/backlog.md` статус `SMART-013` переведён в `Triaged`; в `docs/ЗАДАЧИ_УМНЫЙ_АССИСТЕНТ.md` добавлена ссылка на ТЗ и зафиксирована граница MVP без отдельной сущности подзадач.

**Проверка кодировки:** `index.html` не менялся, Шаг 0 не требовался.

**Тест:** Документальная проверка связки `pm/backlog.md` → `docs/tasks/SMART-013-ai-task-decomposition.md` → `docs/ЗАДАЧИ_УМНЫЙ_АССИСТЕНТ.md`; визуальная проверка PNG-reference; `git diff --check`; `bash scripts/check-portable-paths.sh`.

**Коммит:** `docs(ai): add smart 013 decomposition spec`

## 2026-07-08 — BACK-055: notifications action cards task

### Постановка задачи на уведомления как ленту внимания

**Что сделано:** Код приложения не менялся. Создано ТЗ `docs/tasks/BACK-055-notifications-action-cards.md` для Юрия: экран `Уведомления` должен стать лентой внимания AI-планера, а не архивом событий. В `pm/backlog.md` добавлена задача `BACK-055`, в `shared/ROADMAP.md` направление AI-планерного дашборда дополнено уведомлениями, в `pm/qa-checklist.md` добавлены проверки action cards. Visual reference сохранён в `docs/tasks/assets/BACK-055-notifications-action-cards-wireframe.svg`.

**Проверка кодировки:** `index.html` не менялся, Шаг 0 не требовался.

**Тест:** Документальная проверка связки `shared/ROADMAP.md` → `pm/backlog.md` → `docs/tasks/BACK-055-notifications-action-cards.md` → `pm/qa-checklist.md`; `git diff --check`; `bash scripts/check-portable-paths.sh`.

**Коммит:** N/A

## 2026-07-08 — Team Sync: Yuri Claude-driven Git

### Поправка инструкции Юры без GitHub Desktop

**Что сделано:** Код приложения не менялся. В `docs/team-sync-protocol.md`, `pm/team-sync.md`, `docs/git-team-rules.md`, `CLAUDE.md`, `COWORK_INSTRUCTIONS.md` и `AGENTS.md` уточнено, что Юрий не пользуется GitHub Desktop и управляет Git через Claude. Для Юры добавлена стартовая фраза: Claude должен проверить ветку, `git status`, сделать `git fetch origin` и подтягивать изменения только если нет риска потерять незакоммиченные изменения.

**Проверка кодировки:** `index.html` не менялся, Шаг 0 не требовался.

**Тест:** `git diff --check`; `bash scripts/check-portable-paths.sh`.

**Коммит:** `docs(process): clarify yuri git via claude`

## 2026-07-08 — Team Sync protocol

### Единая синхронизация Алексея, Юрия, Codex и Claude

**Что сделано:** Код приложения не менялся. Добавлены `docs/team-sync-protocol.md` и `pm/team-sync.md`: ключевые фразы `Что там у Лехи?`, `Что там у Юры?`, `Закрой задачу и синхронизируй`, определение завершенной задачи, правило commit/push в рабочую ветку и запрет автоматического merge в `main`. В `AGENTS.md`, `CLAUDE.md`, `COWORK_INSTRUCTIONS.md` и `docs/git-team-rules.md` добавлены ссылки на новый протокол, чтобы Codex и Claude читали один и тот же источник правил.

**Проверка кодировки:** `index.html` не менялся, Шаг 0 не требовался.

**Тест:** `git diff --check`; `bash scripts/check-portable-paths.sh`.

**Коммит:** `docs(process): add team sync protocol`

## 2026-07-06 — Linear bug triage policy

### Правило, когда баг заводим в Linear

**Что сделано:** Код приложения не менялся. На свежей ветке от `origin/main` в `pm/bugs.md` добавлено правило Linear-триажа: в Linear идут P0/P1, подтверждённые, повторяющиеся и требующие разработки/релиза баги; входящие заметки, непроверенные наблюдения, косметика без влияния на ключевой сценарий, дубли и вопросы на уточнение остаются в `pm/bugs.md` до подтверждения.

**Проверка кодировки:** `index.html` не менялся, Шаг 0 не требовался.

**Тест:** `git diff --check`; `bash scripts/check-portable-paths.sh`.

**Коммит:** `docs(process): add linear bug triage policy`
## 2026-07-06 — Accessibility as permanent UI rule

### Доступность закреплена в Definition of Done UI-задач

**Что сделано:** Код приложения не менялся. Accessibility baseline закреплён как постоянное правило для нового и изменяемого UI, а не только как разовая задача `BACK-050`. Обновлены `docs/ui-architecture-rules.md`, `AGENTS.md`, `CLAUDE.md`, `COWORK_INSTRUCTIONS.md` и `shared/ROADMAP.md`. Добавлена итоговая инструкция для Юры: `pm/agent-inbox/codex-to-yuri-2026-07-06-accessibility-permanent-rule.md`.

**Проверка кодировки:** `index.html` не менялся, Шаг 0 не требовался.

**Тест:** Документальная проверка постоянного правила в агентских инструкциях и roadmap; `git diff --check`; `bash scripts/check-portable-paths.sh`; `bash scripts/check-ui-architecture.sh`.

**Коммит:** `docs(ui): make accessibility a permanent rule`

## 2026-07-06 — BACK-050: accessibility baseline

### Базовая доступность критических сценариев

**Что сделано:** Код приложения не менялся. После изучения материала HTML Academy по доступности веб-интерфейсов добавлен `BACK-050` в `shared/ROADMAP.md` и `pm/backlog.md`. В `pm/qa-checklist.md` добавлены проверки auth keyboard/focus, доступных labels/errors, status/toast, dialog bottom sheets и touch-targets. Создан `docs/tasks/BACK-050-accessibility-baseline.md` с порядком работ и `pm/agent-inbox/codex-to-yuri-2026-07-06-accessibility-baseline.md` с тремя копируемыми задачами для Юры.

**Проверка кодировки:** `index.html` не менялся, Шаг 0 не требовался.

**Тест:** Документальная проверка связки `shared/ROADMAP.md` → `pm/backlog.md` → `pm/qa-checklist.md` → `docs/tasks/BACK-050-accessibility-baseline.md` → `pm/agent-inbox/`.

**Коммит:** `docs(qa): add accessibility baseline tasks`

## 2026-07-06 — BACK-049: UI architecture guard

### Правило LESS + BEM без роста inline-долга

**Что сделано:** По решению Алексея закреплено правило для нового UI-кода: HTML = структура, LESS = стили, JS = поведение; новые классы — в BEM-подходе; новые inline `style=""`, `onclick`/`oninput`/`onchange`, inline `<style>` и inline `<script>` в `index.html` не добавлять. Добавлен `docs/ui-architecture-rules.md`, обновлены `AGENTS.md`, `CLAUDE.md`, `COWORK_INSTRUCTIONS.md`, `shared/ROADMAP.md` и `pm/backlog.md`. Добавлен guard `scripts/check-ui-architecture.sh`, npm script `check:ui-architecture`, pre-commit и GitHub Actions проверка. `BACK-012` переведён в `Partial Done`: LESS/minification есть, BEM/legacy cleanup продолжаются через BACK-049 и поэкранные правки.

**Проверка кодировки:** `index.html` не менялся, Шаг 0 не требовался.

**Тест:** `bash scripts/check-ui-architecture.sh`; `bash scripts/check-portable-paths.sh`; `git diff --check`.

**Коммит:** `docs(ui): add architecture guard for inline debt`

## 2026-07-05 — BACK-048: dev/test accounts task

### Постановка задачи на тестовые аккаунты разработчиков

**Что сделано:** Код приложения не менялся. В `pm/backlog.md` добавлена задача `BACK-048` на dev/test аккаунты с Premium/full-access для Алексея, Юрия и QA/dev. Создан task-файл `docs/tasks/BACK-048-dev-test-accounts.md` с требованиями к worker/admin-механизму, staging-first подходом, seed-данными и запретом хранить реальные пароли, токены и `ADMIN_SECRET` в git. В `pm/qa-checklist.md` добавлена проверка dev/test аккаунтов.

**Проверка кодировки:** `index.html` не менялся, Шаг 0 не требовался.

**Тест:** Документальная проверка связки `pm/backlog.md` → `docs/tasks/BACK-048-dev-test-accounts.md` → `pm/qa-checklist.md`; код не менялся.

**Коммит:** N/A

## 2026-07-05 — Mobile QA all screens

### Первичный mobile smoke на 360/375/390px

**Что сделано:** После `git fetch origin` подтверждено, что локальный `main` синхронен с `origin/main` (`0 0` ahead/behind), новых изменений от Юры в `origin/main` нет. Поднят локальный сервер `http://127.0.0.1:8000/index.html`. В браузере Codex проверены 114 состояний экранов `index.html` на viewport `375x667`, `390x844`, `360x800`: login/register, reset/forgot password, Home, AI chat, task detail, calendar, statistics, notifications, profile/settings, subscription/payment, support/FAQ, chats/conversation, new task/confirm/move/done, voice, biometric consent, quick-add и contact bottom sheet. Auth/tasks проверялись в локальном mock-состоянии без отправки реальных внешних запросов.

**Проверка кодировки:** `index.html` не менялся, Шаг 0 не требовался.

**Тест:** Browser QA sweep: глобального горизонтального скролла не найдено. CTA sanity: пустой login остаётся на `login` и показывает `Введи email и пароль`; пустой/невалидный forgot password остаётся на `forgot-password` и показывает полевые ошибки `Введите email` / `Введите корректный email`; payment screen показывает CTA `Оплатить картой`. Найден новый баг `BUG-2026-07-05-003`: Home после 22:00 показывает отрицательное время `2 задач горят · -1 ч до конца дня`. Внешние live flows Telegram-login и CloudPayments/Telegram Stars/VK Pay не отправлялись.

**Коммит:** N/A

## 2026-07-06

### BACK-044 — task detail card cleanup

**Что сделано:** Экран `task-detail` перестроен без изменения модели сохранения. `detail-description` перенесён под заголовок задачи и оформлен как inline-блок `detail-inline-desc`, а вкладка `Описание` и блок `detail-tab-desc` удалены как дублирование. Строки в glass-карточке переставлены в новый порядок: `Срок`, быстрые кнопки, `Статус`, `Приоритет`, `Напоминание`. UI-строки `Направление` и `Человек` скрыты через `detail-field-row-hidden`, но их DOM-id сохранены (`detail-direction`, `detail-person`), поэтому `openTask()` и `saveTaskEdits()` продолжают читать/писать те же данные. Для мобильной ширины detail rows и checklist-add переведены в вертикальный режим через media-rule `max-width:560px`, чтобы контролы не обрезались справа.

**Проверка кодировки:** `index.html` markers до правки: 65; после правки: 65.

**Тест:** `Select-String` до/после по маркерам `Войти|Задачи|Сегодня`; `npm run build:css`; `git diff --check`; headless Chrome preview для task detail desktop/mobile на локальном `file:///.../__codex_task_detail_preview.html`.

### BACK-043 — profile responsive UI pass

**Что сделано:** В `index.html` и `styles/screens/profile.less` приведена мобильная форма профиля к более ровной структуре. Telegram-строка теперь растягивается на полную ширину сетки и получила отдельный класс для обрезки длинного username без расползания badge. Для phone/email на узких экранах статусный badge переносится под input вместо тесной правой колонки. Карточки `Дата рождения` и `О себе` получили явный `profile-form-card` layout с предсказуемыми отступами, textarea закреплена через `profile-about-field`, а счётчик `profile-field-counter` визуально привязан к полю. Параллельно ветка синхронизирована с UI-оболочкой: перенесён фикс `BACK-046` на ширину `bottom-nav-v2`/`global-nav`, а backlog обновлён до актуальных ID/статусов (`BACK-046`, `BACK-047 Done`, `BACK-043 In Progress` -> реализация).

**Проверка кодировки:** `index.html` markers до правки: 65; после правки: 65.

**Тест:** `Select-String` до/после по маркерам `Войти|Задачи|Сегодня`; `npm run build:css`; `git diff --check`; headless Chrome preview для profile desktop/mobile на локальном `file:///.../__codex_profile_preview.html`.

### feat/admin-tariff-api — контроль перед следующим шагом BACK-053

**Что сделано:** Переключена локальная рабочая ветка на `feat/admin-tariff-api` от `origin/feat/admin-tariff-api`. Подтверждено, что профильные задачи этой ветки закрыты и при merge с `main` перенумерованы: `BACK-052` — личные данные в раскрываемом блоке, `BACK-053` — настройка фото по клику на аватар, `BACK-054` — человекочитаемые направления. По `BACK-053` проверена реализация в `index.html`: основной аватар `profile-avatar` и превью `profile-photo-preview` открывают единый скрытый `profile-photo-input`, отдельная дублирующая кнопка настройки фото из HTML-разметки убрана. Дополнительно сняты блокеры перед PR: абсолютные Windows-ссылки в `docs/infra-005-yandex-ru-proxy.md` заменены на относительные, конфликтные маркеры убраны из `pm/bugs.md`, `pm/qa-checklist.md`, `DEVELOPMENT_LOG.md`.

**Проверка кодировки:** `index.html` не менялся, Шаг 0 не требовался.

**Тест:** `bash scripts/check-portable-paths.sh`; `git diff --check`; `rg -n "^<<<<<<<|^=======|^>>>>>>>" DEVELOPMENT_LOG.md pm/bugs.md pm/qa-checklist.md shared/WORK_LOG.md pm/backlog.md`; ручная code-review проверка profile photo flow по `index.html` и `styles/screens/profile.less`.

**Коммит:** `docs(process): clean admin tariff branch blockers`

### Sprint 1 status sync after hotfixes and UI package

**Что сделано:** После сверки с фактическими ветками и коммитами синхронизированы статусы в app-документации. `BACK-047` переведён в `Done`: live worker уже обслуживает `/v2/auth/legacy-session`, `/auth/identities`, `/v2/privacy/settings`, а фронтовые fallback сняты отдельным app-коммитом после `200` на prod. UI-пакет Алексея отражён как `Ready for QA`: `BACK-046` (нижняя панель, commit `748dcfd`), `BACK-043` (мобильный профиль, commit `33903b4`) и `BACK-044` (карточка задачи, commit `250f35b`). В `pm/bugs.md` и `pm/qa-checklist.md` заодно исправлена ссылка на переименованный ID `BACK-046` вместо старого `BACK-042`.

**Тест:** ручная сверка `git log` по веткам `fix/bottom-nav-app-width`, `fix/profile-responsive-ui`, `fix/task-detail-card-cleanup`, `feat/infra-005-yandex-ru-proxy-step1`; сверка `pm/backlog.md`, `pm/bugs.md`, `pm/qa-checklist.md` на соответствие sprint-очереди.

### INFRA-005 — RU proxy step 1 prepared

**Что сделано:** Подготовлен кодовой пакет для промежуточного российского API-адреса под VK Mini App, без переноса основного backend из Cloudflare. В `scripts/build-vk-hosting.mjs` добавлена build-time подмена `WORKER` через переменную окружения `VK_API_BASE_URL`, поэтому один и тот же `vk.html` можно публиковать либо на `edge.4-ai.site`, либо на будущий Yandex proxy-домен без ручной правки исходника. Добавлен `infra/yandex-api-gateway/ru-proxy-openapi.yaml`: OpenAPI spec для Yandex API Gateway с `x-yc-apigateway-integration:http`, путями `/` и `/{path+}`, пробросом исходных headers/query, явным `Host: edge.4-ai.site` и отключённым gateway-side CORS intercept (`origin: false`), чтобы preflight `OPTIONS` уходил в текущий backend. Добавлены runbook `docs/infra-005-yandex-ru-proxy.md` и task-файл `docs/tasks/INFRA-005-yandex-ru-proxy-step1.md`; backlog и roadmap синхронизированы новым item `INFRA-005`.

**Тест:** `git diff --check`; ручная сверка spec с официальной документацией Yandex Cloud по `x-yc-apigateway-integration:http`, CORS (`origin: false`) и spec variables (`${var.*}`); локальный code review `scripts/build-vk-hosting.mjs` на подмену `const WORKER = '...'` в `.vk-hosting-dist/index.html`.

### BACK-047 вЂ” v2 auth/privacy routes wired into live worker

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** Р’ `4e-worker/worker.js` РґРѕР±Р°РІР»РµРЅС‹ РїСЂСЏРјС‹Рµ РёРјРїРѕСЂС‚С‹ `handleV2AuthRequest` Рё `handleV2PrivacyRequest` РёР· `src/worker/*`, РїСЂРѕРєРёРЅСѓС‚ `VK_SECRET_KEY` РІ runtime env Рё РІСЃС‚СЂРѕРµРЅ routing РґР»СЏ РІСЃРµРіРѕ РїСЂРµС„РёРєСЃР° `/v2/auth/*` Рё `/v2/privacy/*`. Р”Р»СЏ СЃРѕРІРјРµСЃС‚РёРјРѕСЃС‚Рё СЃРѕ СЃС‚Р°СЂС‹Рј `vk.html` РґРѕР±Р°РІР»РµРЅ Р°Р»РёР°СЃ `GET /auth/identities`: РїРѕ legacy `x-token` РѕРЅ РїРѕРґРЅРёРјР°РµС‚ D1 session С‡РµСЂРµР· `/v2/auth/legacy-session` Рё РІРѕР·РІСЂР°С‰Р°РµС‚ identities РёР· `/v2/auth/identities`. Staging deploy: version `c618e29f-e96e-4849-acc6-175311115dd6`; production deploy: version `02f8b9a9-2f13-41b2-9e2b-9c343736e473`. Positive smoke РЅР° staging Рё РЅР° prod РїСЂРѕС€С‘Р» С‡РµСЂРµР· РїРѕР»РЅС‹Р№ СЃС†РµРЅР°СЂРёР№ `auth/register` в†’ legacy token в†’ `/v2/auth/legacy-session` в†’ `/auth/identities` в†’ `/v2/privacy/settings`; РІРѕ РІСЃРµС… С€Р°РіР°С… РѕС‚РІРµС‚С‹ Р±С‹Р»Рё `200`, Р° `legacy_user_id === d1_user_id`. Negative smoke РїРѕРґС‚РІРµСЂРґРёР», С‡С‚Рѕ Р±РµР· С‚РѕРєРµРЅРѕРІ `/v2/auth/legacy-session`, `/auth/identities` Рё `/v2/privacy/settings` С‚РµРїРµСЂСЊ РѕС‚РґР°СЋС‚ `401`, Р° РЅРµ `404`.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** `index.html` markers РґРѕ РїСЂР°РІРєРё: 61; РїРѕСЃР»Рµ РїСЂР°РІРєРё: 61.

**РўРµСЃС‚:** `node --check worker.js`; `npx wrangler secret list --env staging` (РѕР±РЅР°СЂСѓР¶РµРЅРѕ, С‡С‚Рѕ РЅР° staging РЅРµС‚ `VK_SECRET_KEY` Рё `RESEND_KEY`, РЅРѕ СЌС‚Рѕ РЅРµ Р±Р»РѕРєРёСЂСѓРµС‚ `legacy-session`/`identities`/`privacy`); `npx wrangler deploy --env staging`; positive smoke staging С‡РµСЂРµР· РІСЂРµРјРµРЅРЅС‹Р№ email `codex-back047-20260705141833@example.com`; `npx wrangler deploy`; positive smoke prod С‡РµСЂРµР· РІСЂРµРјРµРЅРЅС‹Р№ email `codex-back047-prod-20260705142059@example.com`; РѕС‚РґРµР»СЊРЅС‹Р№ negative smoke РЅР° `/`, `/v2/auth/legacy-session`, `/auth/identities`, `/v2/privacy/settings`.

**РљРѕРјРјРёС‚:** worker `21ddb48` (`feat(worker): expose v2 auth and privacy routes`)

### BACK-047 вЂ” frontend cleanup after live 200

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** РџРѕСЃР»Рµ live smoke worker СЃРѕР·РґР°РЅР° РѕС‚РґРµР»СЊРЅР°СЏ app-РІРµС‚РєР° `fix/back-047-remove-auth-fallbacks`. Р’ `index.html` СѓРґР°Р»РµРЅРѕ РІСЂРµРјРµРЅРЅРѕРµ РёРіРЅРѕСЂРёСЂРѕРІР°РЅРёРµ `404/501/503` РІ `syncD1AuthSession()`. Р’ `vk.html` СѓРґР°Р»С‘РЅ helper `isOptionalD1ApiStatus()`, СѓР±СЂР°РЅР° РјСЏРіРєР°СЏ РґРµРіСЂР°РґР°С†РёСЏ РїСЂРё `legacy-session` Рё СЃРЅСЏС‚ РґРІРѕР№РЅРѕР№ fallback `v2/auth/identities -> /auth/identities`: СЌРєСЂР°РЅ СЃРЅРѕРІР° С‡РёС‚Р°РµС‚ identities РЅР°РїСЂСЏРјСѓСЋ РёР· `/v2/auth/identities`, РµСЃР»Рё D1 session СѓР¶Рµ РїРѕРґРЅСЏС‚Р°. РћР±РЅРѕРІР»РµРЅС‹ `FILE_MAP_WORKER.md` Рё `pm/backlog.md` СЃ СЂРµРіРёСЃС‚СЂР°С†РёРµР№ СЃРѕСЃС‚РѕСЏРЅРёСЏ BACK-047.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** `index.html` markers РґРѕ РїСЂР°РІРєРё: 61; РїРѕСЃР»Рµ РїСЂР°РІРєРё: 61.

**РўРµСЃС‚:** `Select-String` РґРѕ/РїРѕСЃР»Рµ РїРѕ РјР°СЂРєРµСЂР°Рј `Р’РѕР№С‚Рё|Р—Р°РґР°С‡Рё|РЎРµРіРѕРґРЅСЏ`; СЂРµР·РµСЂРІРЅР°СЏ РєРѕРїРёСЏ `index.backup_20260705_1422.html`; `C:\Program Files\Git\bin\bash.exe ./scripts/check-portable-paths.sh`; `git diff` РїРѕ `index.html`/`vk.html`.

**РљРѕРјРјРёС‚:** app `e85cd50` (`fix(auth): remove v2 bootstrap fallbacks`)

## РљР РРўРР§Р•РЎРљРР• РџР РђР’РР›Рђ Р”Р›РЇ РђР“Р•РќРўРћР’

### РљРѕРґРёСЂРѕРІРєР° (РЅР°СЂСѓС€Р°Р»РѕСЃСЊ 3+ СЂР°Р· вЂ” СЌС‚Рѕ СЃР°РјР°СЏ С‡Р°СЃС‚Р°СЏ РѕС€РёР±РєР°)
- **РќРРљРћР“Р”Рђ** РЅРµ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ PowerShell `-replace`, `Set-Content`, `Out-File` РґР»СЏ С„Р°Р№Р»РѕРІ СЃ РєРёСЂРёР»Р»РёС†РµР№
- Р§РёС‚Р°С‚СЊ: `[System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)`
- РџРёСЃР°С‚СЊ: `[System.IO.File]::WriteAllText($f, $content, (New-Object System.Text.UTF8Encoding $false))`
- РџРѕСЃР»Рµ РїСЂР°РІРєРё РїСЂРѕРІРµСЂСЏС‚СЊ: `Select-String -Path $file -Pattern 'Р’РѕР№С‚Рё|Р—Р°РґР°С‡Рё'`
- Р•СЃР»Рё РєРёСЂРёР»Р»РёС†Р° РїСЂРѕРїР°Р»Р° в†’ РІРѕСЃСЃС‚Р°РЅР°РІР»РёРІР°С‚СЊ Р±Р°Р№С‚РѕРІС‹Рј РјРµС‚РѕРґРѕРј СЃ GitHub (РЅРµ СЂРµРґР°РєС‚РёСЂРѕРІР°С‚СЊ!)

### Git
- РџРѕСЃР»Рµ `git reset --hard` РЅСѓР¶РµРЅ `git push --force`
- РљРѕРЅС„Р»РёРєС‚С‹ РїСЂРё `git revert` в†’ `git revert --abort` + `git reset --hard <hash>`
- РџРµСЂРµРґ РїСЂР°РІРєРѕР№ VK/TG С„Р°Р№Р»РѕРІ: `git stash` РєР°Рє СЃС‚СЂР°С…РѕРІРєР°

### PowerShell
- `;` РІРјРµСЃС‚Рѕ `&&`
- РЎРєР°С‡РёРІР°С‚СЊ С„Р°Р№Р»С‹: `$bytes = (Invoke-WebRequest -Uri $url).RawContentStream.ToArray()`
- Р—Р°РіРѕР»РѕРІРєРё: `-Headers @{"Key"="Value"}`

---

## РђР РҐРРўР•РљРўРЈР Рђ

| Р¤Р°Р№Р» | РќР°Р·РЅР°С‡РµРЅРёРµ |
|------|-----------|
| `4e-app/index.html` | Telegram Mini App вЂ” РЅРµ С‚СЂРѕРіР°С‚СЊ Р±РµР· РєСЂР°Р№РЅРµР№ РЅСѓР¶РґС‹ |
| `4e-app/vk.html` | VK Mini App вЂ” РѕС‚РґРµР»СЊРЅС‹Р№, Р±РµР· Telegram SDK |
| `4e-worker/worker.js` | Cloudflare Worker (РјРёРЅРёС„РёС†РёСЂРѕРІР°РЅ) |
| `4e-worker/src/bot/` | Telegram Р±РѕС‚ (СЂР°Р·Р±РёС‚ РЅР° РјРѕРґСѓР»Рё) |

### РљР»СЋС‡РµРІС‹Рµ СЌРЅРґРїРѕРёРЅС‚С‹ Worker
- `/anthropic` вЂ” РїСЂРѕРєСЃРё Рє Claude, С‚СЂРµР±СѓРµС‚ `x-token`
- `/tasks` вЂ” Р·Р°РґР°С‡Рё РїРѕ С‚РѕРєРµРЅСѓ Р±РµР· chatId
- `/auth/vk` вЂ” VK Р°РІС‚Рѕ-Р»РѕРіРёРЅ

---

## РР—Р’Р•РЎРўРќР«Р• РџР РћР‘Р›Р•РњР« (РѕС‚РєСЂС‹С‚С‹Рµ)

| # | РџСЂРѕР±Р»РµРјР° | РџСЂРёРѕСЂРёС‚РµС‚ |
|---|----------|-----------|
| 1 | РЈРІРµРґРѕРјР»РµРЅРёРµ Р РљРќ вЂ” СЂСѓС‡РЅРѕР№ С€Р°Рі Р®СЂРёСЏ | РІС‹СЃРѕРєРёР№ |
| 2 | Yandex Cloud PostgreSQL вЂ” СЂСѓС‡РЅРѕР№ С€Р°Рі РђР»РµРєСЃРµСЏ РїРµСЂРµРґ BACK-008 | РІС‹СЃРѕРєРёР№ |
| 3 | `bottom-nav-v2` (РІ #home) Рё `global-nav` вЂ” РґРІР° РѕС‚РґРµР»СЊРЅС‹С… РєРѕРјРїРѕРЅРµРЅС‚Р°, РЅСѓР¶РЅРѕ РґРµСЂР¶Р°С‚СЊ СЃРёРЅС…СЂРѕРЅРёР·РёСЂРѕРІР°РЅРЅС‹РјРё | СЃСЂРµРґРЅРёР№ |
| 4 | ANTHROPIC_KEY РІ worker.js РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ С‚РѕР»СЊРєРѕ PLACEHOLDER вЂ” РЅРµ РєРѕРјРјРёС‚РёС‚СЊ СЂРµР°Р»СЊРЅС‹Р№ РєР»СЋС‡ | РІС‹СЃРѕРєРёР№ |

---

## РРЎРўРћР РРЇ РР—РњР•РќР•РќРР™
## 2026-07-05 вЂ” BACK-045: auth via Russian services roadmap (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** Р’ `shared/ROADMAP.md` РґРѕР±Р°РІР»РµРЅРѕ РЅР°РїСЂР°РІР»РµРЅРёРµ Р±Р»РёР¶Р°Р№С€РµРіРѕ РіРѕСЂРёР·РѕРЅС‚Р°: Р°РІС‚РѕСЂРёР·Р°С†РёСЏ С‡РµСЂРµР· СЂРѕСЃСЃРёР№СЃРєРёРµ РїСЂРѕРІР°Р№РґРµСЂС‹ VK ID Рё РЇРЅРґРµРєСЃ ID. Р’ `pm/backlog.md` РґРѕР±Р°РІР»РµРЅР° Р·Р°РґР°С‡Р° `BACK-045` СЃ РєСЂРёС‚РµСЂРёСЏРјРё РіРѕС‚РѕРІРЅРѕСЃС‚Рё: РїРѕРЅСЏС‚РЅС‹Р№ РІС…РѕРґ РЅР° login/register, РѕС‚СЃСѓС‚СЃС‚РІРёРµ РґСѓР±Р»РµР№ Р°РєРєР°СѓРЅС‚РѕРІ, РІРёРґРёРјРѕСЃС‚СЊ РїСЂРёРІСЏР·Р°РЅРЅС‹С… СЃРїРѕСЃРѕР±РѕРІ РІС…РѕРґР°, smoke РґР»СЏ web/VK/TG. РЎРѕР·РґР°РЅ task-С„Р°Р№Р» `docs/tasks/BACK-045-russian-service-auth.md`.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** `index.html` РЅРµ РјРµРЅСЏР»СЃСЏ, РЁР°Рі 0 РЅРµ С‚СЂРµР±РѕРІР°Р»СЃСЏ.

**РўРµСЃС‚:** Р”РѕРєСѓРјРµРЅС‚Р°Р»СЊРЅР°СЏ РїСЂРѕРІРµСЂРєР° СЃРІСЏР·РєРё `shared/ROADMAP.md` в†’ `pm/backlog.md` в†’ `docs/tasks/`; РєРѕРґ РЅРµ РјРµРЅСЏР»СЃСЏ.

**РљРѕРјРјРёС‚:** `docs(auth): add russian service auth roadmap`

**РЎС‚Р°С‚СѓСЃ:** Todo вЂ” РїРµСЂРµРґ СЂР°Р·СЂР°Р±РѕС‚РєРѕР№ РЅСѓР¶РЅРѕ СЂРµС€РёС‚СЊ, РєС‚Рѕ СЂРµРіРёСЃС‚СЂРёСЂСѓРµС‚ OAuth-РїСЂРёР»РѕР¶РµРЅРёРµ РЇРЅРґРµРєСЃР° Рё РєР°Рє СЌС‚Рѕ СЃРѕРіР»Р°СЃСѓРµС‚СЃСЏ СЃ BACK-026.

---
## 2026-07-05 вЂ” BACK-044: task detail card cleanup triage (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** РџРѕ Р·Р°РјРµС‡Р°РЅРёСЏРј РђР»РµРєСЃРµСЏ РѕС„РѕСЂРјР»РµРЅР° Р·Р°РґР°С‡Р° РґР»СЏ Р®СЂРёСЏ РЅР° СѓРїСЂРѕС‰РµРЅРёРµ РґРµС‚Р°Р»СЊРЅРѕР№ РєР°СЂС‚РѕС‡РєРё Р·Р°РґР°С‡Рё: РѕРїРёСЃР°РЅРёРµ РїРѕРґ Р·Р°РіРѕР»РѕРІРєРѕРј, СѓР±СЂР°С‚СЊ РІРєР»Р°РґРєСѓ `РћРїРёСЃР°РЅРёРµ`, РїРѕРґРЅСЏС‚СЊ `РЎСЂРѕРє` РїРµСЂРІС‹Рј, РґРѕР±Р°РІРёС‚СЊ РѕС‚СЃС‚СѓРї Сѓ Р±С‹СЃС‚СЂС‹С… СЃСЂРѕРєРѕРІ, СЃРєСЂС‹С‚СЊ СЃС‚СЂРѕРєРё `РќР°РїСЂР°РІР»РµРЅРёРµ` Рё `Р§РµР»РѕРІРµРє` РёР· РІРёРґРёРјРѕРіРѕ UI РєР°СЂС‚РѕС‡РєРё. РљРѕРґ РїСЂРёР»РѕР¶РµРЅРёСЏ РЅРµ РјРµРЅСЏР»СЃСЏ. РћР±РЅРѕРІР»РµРЅС‹ `pm/backlog.md`, `pm/qa-checklist.md`, `shared/WORK_LOG.md`; РґРѕР±Р°РІР»РµРЅ `docs/tasks/BACK-044-task-detail-card-cleanup.md`.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** `index.html` РЅРµ РјРµРЅСЏР»СЃСЏ, РЁР°Рі 0 РЅРµ С‚СЂРµР±РѕРІР°Р»СЃСЏ.

**РўРµСЃС‚:** Р”РѕРєСѓРјРµРЅС‚Р°Р»СЊРЅР°СЏ РїСЂРѕРІРµСЂРєР° СЃРІСЏР·РєРё `pm/backlog.md` в†’ `pm/qa-checklist.md` в†’ `docs/tasks/`; РєРѕРґ РЅРµ РјРµРЅСЏР»СЃСЏ.

**РљРѕРјРјРёС‚:** N/A

## 2026-07-23

### Pre-dawn inbox/backlog runner closeout

**Что сделано:** closed 3 autonomous whitelist P1 task-detail fixes from the stale night queue: reminder trigger, task tag popup, and task detail hero overflow. Added the final runner report `pm/outbox/REPORT-4e-pre-dawn-inbox-and-whitelist-backlog-runner-2026-07-23.md`.

**Проверка кодировки:** `4e-app/index.html` marker matches stayed 111 / 111 during app edits.

**Тест:** `npm run build:css`, `node scripts/check-cp1251-mojibake.mjs`, `git diff --check`, `bash scripts/check-portable-paths.sh`, `bash scripts/check-ui-architecture.sh`, `npm run smoke:back067-reminder`, `npm run smoke:back068-tag-popup`, `npm run smoke:back069-hero`.

**Коммит:** `a736148`, `471bfab`, `4207f3a` + closeout commit

## 2026-07-23

### DESIGN-GLASS-001 night scheduling

**Что сделано:** added the global glass design-system direction to PM docs, created `pm/inbox/BRIEF-2026-07-23-42-glass-design-system-foundation.md`, created `pm/design-references/README.md`, and updated the one-off night automation to run a safe glass design-system pass at 23:30.

**Проверка кодировки:** `index.html` was not edited; Step 0 not applicable.

**Тест:** documentation-only change; `node scripts/check-cp1251-mojibake.mjs`, `git diff --check`, and `bash scripts/check-portable-paths.sh`.

**Коммит:** this planning commit

**РЎС‚Р°С‚СѓСЃ:** Triaged вЂ” СЂРµР°Р»РёР·Р°С†РёСЏ РІ РІРµС‚РєРµ `fix/task-detail-card-cleanup`.

---
## 2026-07-05 вЂ” BUG-2026-07-05-002: profile mobile layout triage (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** РџРѕ РґРІСѓРј СЃРєСЂРёРЅР°Рј РђР»РµРєСЃРµСЏ Р·Р°С„РёРєСЃРёСЂРѕРІР°РЅ UI-Р±Р°Рі РїСЂРѕС„РёР»СЏ РЅР° РјРѕР±РёР»СЊРЅРѕР№ РІРµР±-РІРµСЂСЃРёРё: СЃС‚СЂРѕРєР° Telegram Рё СЃС‚Р°С‚СѓСЃРЅС‹Р№ Р±РµР№РґР¶ "РќРµ РїСЂРёРІСЏР·Р°РЅ" РІС‹РіР»СЏРґСЏС‚ РЅРµР°РєРєСѓСЂР°С‚РЅРѕ, Р·Р°РіРѕР»РѕРІРєРё "Р”Р°С‚Р° СЂРѕР¶РґРµРЅРёСЏ" Рё "Рћ СЃРµР±Рµ" РїСЂРёР¶Р°С‚С‹ Рє СЃРѕСЃРµРґРЅРёРј Р±Р»РѕРєР°Рј, РїРѕР»Рµ "Рћ СЃРµР±Рµ" Рё СЃС‡С‘С‚С‡РёРє `0 / 200` РЅРµ РѕР±СЂР°Р·СѓСЋС‚ РіР°СЂРјРѕРЅРёС‡РЅСѓСЋ СЃРµРєС†РёСЋ. Р”РѕР±Р°РІР»РµРЅС‹ `BUG-2026-07-05-002` РІ `pm/bugs.md`, `BACK-043` РІ `pm/backlog.md`, СЂРµРіСЂРµСЃСЃРёСЏ РІ `pm/qa-checklist.md` Рё task-С„Р°Р№Р» `docs/tasks/BUG-2026-07-05-002_profile_mobile_layout.md` РґР»СЏ Р®СЂС‹.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** `index.html` РЅРµ РјРµРЅСЏР»СЃСЏ, РЁР°Рі 0 РЅРµ С‚СЂРµР±РѕРІР°Р»СЃСЏ.

**РўРµСЃС‚:** Р”РѕРєСѓРјРµРЅС‚Р°Р»СЊРЅР°СЏ РїСЂРѕРІРµСЂРєР° СЃРІСЏР·РєРё `pm/bugs.md` в†’ `pm/backlog.md` в†’ `pm/qa-checklist.md` в†’ `docs/tasks/`; РєРѕРґ РЅРµ РјРµРЅСЏР»СЃСЏ.

**РљРѕРјРјРёС‚:** N/A

**РЎС‚Р°С‚СѓСЃ:** Triaged вЂ” СЂРµР°Р»РёР·Р°С†РёСЏ РІ РІРµС‚РєРµ `fix/profile-mobile-layout`.

---
## 2026-07-05 вЂ” BUG-2026-07-05-001: bottom nav width triage (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** РџРѕ СЃРєСЂРёРЅСѓ РђР»РµРєСЃРµСЏ Р·Р°С„РёРєСЃРёСЂРѕРІР°РЅ UI-Р±Р°Рі: РІ desktop/web РЅРёР¶РЅСЏСЏ РїР°РЅРµР»СЊ СЂР°СЃС‚СЏРіРёРІР°РµС‚СЃСЏ РЅР° С€РёСЂРёРЅСѓ РѕРєРЅР° Р±СЂР°СѓР·РµСЂР°, С…РѕС‚СЏ СЃР°Рј СЌРєСЂР°РЅ РїСЂРёР»РѕР¶РµРЅРёСЏ РѕСЃС‚Р°С‘С‚СЃСЏ СѓР·РєРёРј app-РєРѕРЅС‚РµР№РЅРµСЂРѕРј РїРѕ С†РµРЅС‚СЂСѓ. Р”РѕР±Р°РІР»РµРЅС‹ `BUG-2026-07-05-001` РІ `pm/bugs.md`, `BACK-046` РІ `pm/backlog.md`, СЂРµРіСЂРµСЃСЃРёСЏ РІ `pm/qa-checklist.md` Рё task-С„Р°Р№Р» `docs/tasks/BUG-2026-07-05-001_bottom_nav_width.md` РґР»СЏ Р®СЂС‹. РћС‚РґРµР»СЊРЅРѕ РѕС‚РјРµС‡РµРЅРѕ, С‡С‚Рѕ РїСЂРѕРІРµСЂСЏС‚СЊ РЅСѓР¶РЅРѕ РѕР±Р° nav-РєРѕРјРїРѕРЅРµРЅС‚Р°: `bottom-nav-v2` РЅР° Home Рё `global-nav` РЅР° РѕСЃС‚Р°Р»СЊРЅС‹С… СЌРєСЂР°РЅР°С….

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** `index.html` РЅРµ РјРµРЅСЏР»СЃСЏ, РЁР°Рі 0 РЅРµ С‚СЂРµР±РѕРІР°Р»СЃСЏ.

**РўРµСЃС‚:** Р”РѕРєСѓРјРµРЅС‚Р°Р»СЊРЅР°СЏ РїСЂРѕРІРµСЂРєР° СЃРІСЏР·РєРё `pm/bugs.md` в†’ `pm/backlog.md` в†’ `pm/qa-checklist.md` в†’ `docs/tasks/`; РєРѕРґ РЅРµ РјРµРЅСЏР»СЃСЏ.

**РљРѕРјРјРёС‚:** N/A

**РЎС‚Р°С‚СѓСЃ:** Triaged вЂ” СЂРµР°Р»РёР·Р°С†РёСЏ РІ РІРµС‚РєРµ `fix/bottom-nav-app-width`.

---
## 2026-07-04 вЂ” BUG-2026-07-04-003: Enter РЅР° email-РІС…РѕРґРµ (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** Р’ `index.html` РґРѕР±Р°РІР»РµРЅ `submitLoginOnEnter(event)`. РџРѕР»СЏ `login-email` Рё `login-pass` С‚РµРїРµСЂСЊ РїРµСЂРµС…РІР°С‚С‹РІР°СЋС‚ Enter Рё Р·Р°РїСѓСЃРєР°СЋС‚ `doLogin()`, РµСЃР»Рё РєРЅРѕРїРєР° РІС…РѕРґР° РЅРµ Р·Р°Р±Р»РѕРєРёСЂРѕРІР°РЅР°. РџРѕРІРµРґРµРЅРёРµ РєРЅРѕРїРєРё "Р’РѕР№С‚Рё" РЅРµ РјРµРЅСЏР»РѕСЃСЊ. Р’ `pm/bugs.md` РґРѕР±Р°РІР»РµРЅ `BUG-2026-07-04-003`, РІ `pm/qa-checklist.md` РґРѕР±Р°РІР»РµРЅР° СЂРµРіСЂРµСЃСЃРёСЏ Auth / Email keyboard submit.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** `index.html` РґРѕ РїСЂР°РІРєРё: 26 СЃРѕРІРїР°РґРµРЅРёР№ РїРѕ `Р’РѕР№С‚Рё|Р—Р°РґР°С‡Рё|РЎРµРіРѕРґРЅСЏ`; РїРѕСЃР»Рµ РїСЂР°РІРєРё: 26 СЃРѕРІРїР°РґРµРЅРёР№.

**РўРµСЃС‚:** inline JS syntax check С‡РµСЂРµР· Node; Р»РѕРєР°Р»СЊРЅР°СЏ РїСЂРѕРІРµСЂРєР° С„СЂР°РіРјРµРЅС‚Р° РїРѕРґС‚РІРµСЂРґРёР»Р° РЅР°Р»РёС‡РёРµ `onkeydown="submitLoginOnEnter(event)"` РЅР° `login-email` Рё `login-pass`. РќСѓР¶РµРЅ СЂСѓС‡РЅРѕР№ smoke РЅР° РЅРѕСѓС‚Р±СѓРєРµ: email + РїР°СЂРѕР»СЊ в†’ Enter.

**РљРѕРјРјРёС‚:** N/A

**РЎС‚Р°С‚СѓСЃ:** Ready for QA вЂ” РїСЂРѕРІРµСЂРёС‚СЊ Enter РІ РїРѕР»СЏС… email Рё РїР°СЂРѕР»СЏ.

---

## 2026-07-04 вЂ” BUG-2026-07-04-002: web Telegram login fallback fix (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** РСЃРїСЂР°РІР»РµРЅР° РїСЂРёС‡РёРЅР° РѕС€РёР±РєРё `WebAppTgUrlInvalid` РїСЂРё РІС…РѕРґРµ С‡РµСЂРµР· Telegram РІ РІРµР±-РІРµСЂСЃРёРё. `buildTelegramBotLoginUrl()` Р±РѕР»СЊС€Рµ РЅРµ СЃС‚СЂРѕРёС‚ `tg://resolve?...`; С‚РµРїРµСЂСЊ РёСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ `https://t.me/Denzel89bot?start=...`. `openTelegramLoginUrl()` РІС‹Р·С‹РІР°РµС‚ `Telegram.WebApp.openTelegramLink()` С‚РѕР»СЊРєРѕ РІ СЂРµР°Р»СЊРЅРѕРј Mini App-РєРѕРЅС‚РµРєСЃС‚Рµ СЃ `initData`, Р° РѕР±С‹С‡РЅР°СЏ РІРµР±-РІРµСЂСЃРёСЏ СѓС…РѕРґРёС‚ РїРѕ HTTPS-СЃСЃС‹Р»РєРµ. Р¤СЂРѕРЅС‚ СЃРѕС…СЂР°РЅСЏРµС‚ pending `startToken`, РѕС‚РїСЂР°РІР»СЏРµС‚ `returnUrl` РІ Worker, РїСЂРёРЅРёРјР°РµС‚ РІРѕР·РІСЂР°С‚РЅС‹Рµ РїР°СЂР°РјРµС‚СЂС‹ `telegram_start`/`telegramStartToken`/`startToken`/`tgAuth` Рё РїСЂРѕР±СѓРµС‚ Р·Р°РІРµСЂС€РёС‚СЊ РІС…РѕРґ РїСЂРё `pageshow/focus`. Р’ Telegram auth-РІРµС‚РєРµ РёСЃРїСЂР°РІР»РµРЅС‹ Р±РёС‚С‹Рµ СЂСѓСЃСЃРєРёРµ СЃС‚СЂРѕРєРё РѕС€РёР±РѕРє. Р”РѕР±Р°РІР»РµРЅС‹ `BUG-2026-07-04-002`, `BACK-036`, task-С„Р°Р№Р» Рё QA-Р·Р°РїРёСЃСЊ. РџСЂРѕРґРѕР»Р¶РµРЅРёРµ 2026-07-05: bot-side С‡Р°СЃС‚СЊ С‚РѕР¶Рµ Р·Р°РєСЂС‹С‚Р° вЂ” РІ `4e-worker/src/bot/commands.js` `/start auth_*` С‚РµРїРµСЂСЊ С€Р»С‘С‚ РєРЅРѕРїРєСѓ В«Р’РµСЂРЅСѓС‚СЊСЃСЏ РІ 4В» РЅР° `${APP_BASE_URL}/?telegram_start=<token>`, Р° РІ `4e-worker/worker.js` С‚Р°РєРѕР№ Р¶Рµ СЃС†РµРЅР°СЂРёР№ СЂРµР°Р»РёР·РѕРІР°РЅ РґР»СЏ `/bot`/`/webhook`; РѕРґРЅРѕСЂР°Р·РѕРІРѕСЃС‚СЊ Рё TTL 10 РјРёРЅСѓС‚ СѓР¶Рµ Р¶РёР»Рё РІ `consumeTelegramLoginToken()` / `TELEGRAM_LOGIN_TOKEN_TTL_SECONDS = 600`. Production worker Р·Р°РґРµРїР»РѕРµРЅ РєР°Рє version `88b3ab16-fc44-4567-b98c-a8ca4125a5f4`.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** `index.html` РґРѕ РїСЂР°РІРєРё: 26 СЃРѕРІРїР°РґРµРЅРёР№ РїРѕ `Р’РѕР№С‚Рё|Р—Р°РґР°С‡Рё|РЎРµРіРѕРґРЅСЏ`; РїРѕСЃР»Рµ РїСЂР°РІРєРё: 26 СЃРѕРІРїР°РґРµРЅРёР№.

**РўРµСЃС‚:** inline JS syntax check С‡РµСЂРµР· Node 24; JS-smoke РґР»СЏ `buildTelegramBotLoginUrl()` Рё `openTelegramLoginUrl()` РїРѕРґС‚РІРµСЂРґРёР», С‡С‚Рѕ РІРµР±-РІРµСЂСЃРёСЏ РЅРµ РІС‹Р·С‹РІР°РµС‚ `openTelegramLink()` Рё РїРµСЂРµС…РѕРґРёС‚ РЅР° `https://t.me/Denzel89bot?start=auth_test`, Р° Mini App-РєРѕРЅС‚РµРєСЃС‚ РїРµСЂРµРґР°С‘С‚ РІ SDK HTTPS-СЃСЃС‹Р»РєСѓ. РќСѓР¶РЅРѕ РґРѕРїРѕР»РЅРёС‚РµР»СЊРЅРѕ РїСЂРѕРІРµСЂРёС‚СЊ РІРѕР·РІСЂР°С‚РЅСѓСЋ bot-side РєРЅРѕРїРєСѓ РїРѕСЃР»Рµ РїСѓР±Р»РёРєР°С†РёРё. РџРѕР»РЅС‹Р№ Playwright-smoke РЅРµ РІС‹РїРѕР»РЅРµРЅ: РІ РѕРєСЂСѓР¶РµРЅРёРё РЅРµС‚ СѓСЃС‚Р°РЅРѕРІР»РµРЅРЅРѕРіРѕ browser executable.

**РљРѕРјРјРёС‚:** N/A

**РЎС‚Р°С‚СѓСЃ:** Ready for QA вЂ” РЅСѓР¶РµРЅ live smoke РІ РІРµР±-РІРµСЂСЃРёРё Рё РїСЂРѕРІРµСЂРєР° РѕС‚РІРµС‚Р° `@Denzel89bot` РЅР° `/start`.

---
## 2026-07-05 вЂ” INFRA-004 + CI/PM follow-up (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** РџРѕСЃР»Рµ СЃРµСЂРёРё rootfix-РґРµРїР»РѕРµРІ Рё РґРёР°РіРЅРѕСЃС‚РёРєРё Р Р¤-СЃРµС‚РµР№ РїСЂРёРЅСЏС‚ С„РёРЅР°Р»СЊРЅС‹Р№ СЂР°СЃРєР»Р°Рґ: Workers Static Assets РѕСЃС‚Р°СЋС‚СЃСЏ РіР»РѕР±Р°Р»СЊРЅС‹Рј С„СЂРѕРЅС‚РѕРІС‹Рј РєРѕРЅС‚СѓСЂРѕРј (`app.4-ai.site`), РЅРѕ Р¶С‘СЃС‚РєРёРµ Р±РµР»С‹Рµ СЃРїРёСЃРєРё РІ РѕС‚РґРµР»СЊРЅС‹С… Р Р¤-СЃРµС‚СЏС… РЅРµ СЃС‡РёС‚Р°СЋС‚СЃСЏ Р±Р°РіРѕРј РїСЂРёР»РѕР¶РµРЅРёСЏ; Telegram Mini App РѕСЃС‚Р°С‘С‚СЃСЏ РЅР° GitHub Pages, Р° VK-РїРѕРІРµСЂС…РЅРѕСЃС‚СЊ СѓС…РѕРґРёС‚ РЅР° СЃРѕР±СЃС‚РІРµРЅРЅС‹Р№ С…РѕСЃС‚РёРЅРі VK Mini Apps. Р’ app-СЂРµРїРѕ РїРѕРґРіРѕС‚РѕРІР»РµРЅ deploy-РїР°РєРµС‚ `INFRA-004`: РґРѕР±Р°РІР»РµРЅС‹ `@vkontakte/vk-miniapps-deploy`, `scripts/build-vk-hosting.mjs`, `vk-hosting-config.json`, `homepage: "./"` Рё РѕС‚РґРµР»СЊРЅР°СЏ СЃР±РѕСЂРєР° `.vk-hosting-dist`, РєРѕС‚РѕСЂР°СЏ РїСѓР±Р»РёРєСѓРµС‚ `vk.html` РєР°Рє `index.html`, РєРѕРїРёСЂСѓРµС‚ Р»РѕРєР°Р»СЊРЅС‹Рµ vendor-Р°СЃСЃРµС‚С‹ Рё РЅРµ Р·Р°РІРёСЃРёС‚ РѕС‚ `jsdelivr`. Р­С‚Рѕ РїСЂРѕРґРѕР»Р¶Р°РµС‚ СѓСЂРѕРє `INFRA-001`: `run_worker_first` РЅСѓР¶РµРЅ РґР»СЏ СѓРїСЂР°РІР»СЏРµРјС‹С… 404 Рё РґРёР°РіРЅРѕСЃС‚РёРєРё, Р° Р±Р»РѕРєРёСЂРѕРІРєР° `jsdelivr` РІ Р Р¤ С‚СЂРµР±РѕРІР°Р»Р° self-hosted vendor-С„Р°Р№Р»РѕРІ (`vk-bridge`, `telegram-web-app`, `marked`) РІРЅСѓС‚СЂРё СЂРµРїРѕР·РёС‚РѕСЂРёСЏ. РџР°СЂР°Р»Р»РµР»СЊРЅРѕ СЃРёРЅС…СЂРѕРЅРёР·РёСЂРѕРІР°РЅС‹ PM-Р°СЂС‚РµС„Р°РєС‚С‹: РІ `pm/backlog.md` РґРѕР±Р°РІР»РµРЅ `INFRA-004`, Сѓ `INFRA-002` Р·Р°С„РёРєСЃРёСЂРѕРІР°РЅРѕ РїСЂР°РІРёР»Рѕ РїСЂРѕРІРµСЂРєРё РјРёРЅРёРјСѓРј СЃ РґРІСѓС… РЅРµР·Р°РІРёСЃРёРјС‹С… Р Р¤-С‚РѕС‡РµРє/РѕРїРµСЂР°С‚РѕСЂРѕРІ; РІ `shared/ROADMAP.md` Р·Р°РїРёСЃР°РЅР° РёС‚РѕРіРѕРІР°СЏ СЃС…РµРјР° С…РѕСЃС‚РёРЅРіР° 2026-07-05; РІ `pm/release-checklist.md` Рё `pm/qa-checklist.md` РґРѕР±Р°РІР»РµРЅС‹ РїСЂРѕРІРµСЂРєРё РІРЅРµС€РЅРёС… origin Рё post-deploy smoke; СЃРѕР·РґР°РЅР° РёРЅСЃС‚СЂСѓРєС†РёСЏ `pm/qa-smart-001-002-004-group-bot.md` РґР»СЏ СЂСѓС‡РЅРѕРіРѕ QA Р›С‘С…Рё РїРѕ РіСЂСѓРїРїРѕРІРѕРјСѓ Р±РѕС‚Сѓ Рё РѕС‚РґРµР»СЊРЅРѕР№ РїСЂРѕРІРµСЂРєРµ `app.4-ai.site` Р±РµР· VPN. Р’ `.github/workflows/deploy-pages.yml` РґРѕР±Р°РІР»РµРЅС‹ CI-Р·Р°С‰РёС‚С‹ РёР· РїРѕСЃС‚РјРѕСЂС‚РµРјР°: assert РЅР° production `WORKER` URL РІ Р°СЂС‚РµС„Р°РєС‚Рµ, Р·Р°РїСЂРµС‚ staging/`workers.dev` origin, smoke РїРѕ live Pages URL РїРѕСЃР»Рµ РґРµРїР»РѕСЏ Рё Р°РІС‚РѕСЃРѕР·РґР°РЅРёРµ incident issue РїСЂРё РїР°РґРµРЅРёРё workflow.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** РїСЂР°РІРєРё РІ РєРёСЂРёР»Р»РёС‡РµСЃРєРёС… С„Р°Р№Р»Р°С… СЃРґРµР»Р°РЅС‹ С‡РµСЂРµР· `apply_patch` РїРѕСЃР»Рµ С‡С‚РµРЅРёСЏ РІ UTF-8; РєРѕРЅС‚СЂРѕР»СЊРЅС‹Рµ С‚РµРєСЃС‚С‹ `Р§РµРє`, `РҐРѕСЃС‚РёРЅРі`, `Р—Р°РґР°С‡Р°` РІ `pm/backlog.md`, `shared/ROADMAP.md`, `pm/qa-checklist.md`, `pm/release-checklist.md`, `shared/WORK_LOG.md` РѕСЃС‚Р°Р»РёСЃСЊ С‡РёС‚Р°РµРјС‹РјРё.

**РўРµСЃС‚:** `npm run build:vk-hosting` в†’ `.vk-hosting-dist/index.html`, `privacy.html`, `styles.css`, `styles.min.css`, `assets/vendor/*`; grep РїРѕ `vk.html` Рё `.vk-hosting-dist/index.html` РїРѕРґС‚РІРµСЂР¶РґР°РµС‚ `const WORKER = 'https://edge.4-ai.site'`; `git diff --check`; `wrangler --version` в†’ `4.100.0`; `wrangler secret list --env staging` РїРѕРґС‚РІРµСЂР¶РґР°РµС‚ `ANTHROPIC_KEY` Рё `BOT_API_TOKEN`; Р»РѕРєР°Р»СЊРЅС‹Р№ smoke `node src/bot/index.js` РЅР° staging-РїРµСЂРµРјРµРЅРЅС‹С… РїРѕРґРЅРёРјР°РµС‚СЃСЏ, РЅРѕ РІСЃС‘ РµС‰С‘ Р»РѕРІРёС‚ `409 Conflict`; `getWebhookInfo` РІРѕР·РІСЂР°С‰Р°РµС‚ РїСѓСЃС‚РѕР№ `url`, Р·РЅР°С‡РёС‚ РєРѕРЅС„Р»РёРєС‚ РґР°С‘С‚ РґСЂСѓРіРѕР№ polling consumer, Р° РЅРµ webhook. Production deploy VK Mini Apps Р·Р°РІРµСЂС€С‘РЅ С‡РµСЂРµР· `vk-miniapps-deploy`: Р·Р°РіСЂСѓР¶РµРЅР° version `1783191347`, РїРѕРґС‚РІРµСЂР¶РґС‘РЅ РєРѕРґ РёР· Р°РґРјРёРЅРєРё VK, production URL `https://prod-app54636698-c3cd4413b138.pages-ac.vk-apps.com/index.html`; РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ РїРѕРґС‚РІРµСЂРґРёР» phone-smoke Р±РµР· VPN.

**РљРѕРјРјРёС‚:** N/A

## 2026-07-04 вЂ” SMART-001/002: chat roster + assignee tg id (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** Р’ Р»РѕРєР°Р»СЊРЅРѕРј worker checkout РґРѕР±Р°РІР»РµРЅР° РјРёРіСЂР°С†РёСЏ `4e-worker/migrations/0007_chat_members.sql` Рё С‚СЂРё РЅРѕРІС‹С… bot-only action'Р° РІ `worker.js`: `upsert-chat-members`, `get-chat-members`, `mark-chat-members-left`. РћРЅРё РІРµРґСѓС‚ D1-С‚Р°Р±Р»РёС†Сѓ `chat_members` РїРѕ РєР»СЋС‡Сѓ `chat_id + tg_id` Рё РїРѕР·РІРѕР»СЏСЋС‚ Р±РѕС‚Сѓ РєРѕРїРёС‚СЊ roster РіСЂСѓРїРїС‹. Р’ `4e-worker/src/bot/handler.js` РґРѕР±Р°РІР»РµРЅС‹ СЃР±РѕСЂ roster-РєР°РЅРґРёРґР°С‚РѕРІ РёР· `msg.from`, `reply_to_message.from`, `new_chat_members`, `left_chat_member`, Р·Р°РіСЂСѓР·РєР° roster РїРµСЂРµРґ Р°РЅР°Р»РёР·РѕРј, СЌРІСЂРёСЃС‚РёРєРё СЂРµР·РѕР»РІР° РёСЃРїРѕР»РЅРёС‚РµР»СЏ РїРѕ `text_mention`, `@mention`, reply Рё fuzzy-РјР°С‚С‡Сѓ РёРјРµРЅРё, Р° С‚Р°РєР¶Рµ СЃРѕС…СЂР°РЅРµРЅРёРµ `assigneeTgId` / `assigneeUsername` РІ РѕР±СЉРµРєС‚ Р·Р°РґР°С‡Рё. Р’ `4e-worker/src/bot/analyzer.js` system prompt С‚РµРїРµСЂСЊ РїРѕР»СѓС‡Р°РµС‚ СЃРїРёСЃРѕРє СЂРµР°Р»СЊРЅС‹С… СѓС‡Р°СЃС‚РЅРёРєРѕРІ С‡Р°С‚Р° Рё Р°РІС‚РѕСЂР° reply, С‡С‚РѕР±С‹ Haiku С‡Р°С‰Рµ РІРѕР·РІСЂР°С‰Р°Р» Р¶РёРІРѕРµ РёРјСЏ РёР· roster РІРјРµСЃС‚Рѕ Р°Р±СЃС‚СЂР°РєС‚РЅРѕРіРѕ В«РѕРЅ/РѕРЅР°В».

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** `pm/backlog.md` вЂ” РєРѕРЅС‚СЂРѕР»СЊРЅС‹Р№ РїРѕРёСЃРє РґРѕ РїСЂР°РІРєРё `29`; `shared/WORK_LOG.md` вЂ” `171`; `DEVELOPMENT_LOG.md` вЂ” `177`; `FILE_MAP_WORKER.md` вЂ” `11`; `FILE_MAP_BOT.md` вЂ” `5`. РС‚РѕРіРѕРІР°СЏ СЃРІРµСЂРєР° РїРѕСЃР»Рµ РїСЂР°РІРѕРє РЅРµ РґРѕР»Р¶РЅР° РґР°РІР°С‚СЊ СѓРјРµРЅСЊС€РµРЅРёСЏ.

**РўРµСЃС‚:** `node --check <worker-repo-root>/src/bot/analyzer.js`; `node --check <worker-repo-root>/src/bot/handler.js`; `node --check <worker-repo-root>/worker.js`; `npx wrangler d1 migrations apply DB --env staging --remote` в†’ `0007_chat_members.sql вњ…`; `npx wrangler deploy --env staging` в†’ version `231a8070-f7ab-46d2-8983-f3939063afad`; `GET https://restless-lab-d737-staging.shelckograff.workers.dev/` в†’ `200`.

**РљРѕРјРјРёС‚:** `СЌС‚РѕС‚ РєРѕРјРјРёС‚`

**Р‘Р»РѕРєРµСЂС‹:** РЎР°Рј bot runtime РїРѕ-РїСЂРµР¶РЅРµРјСѓ Р¶РёРІС‘С‚ РІРЅРµ git-СЂРµРїРѕР·РёС‚РѕСЂРёСЏ `4e-app`; staging worker СѓР¶Рµ СѓРјРµРµС‚ roster API, РЅРѕ Р±РµР· РѕР±РЅРѕРІР»РµРЅРёСЏ РїСЂРѕС†РµСЃСЃР° `node src/bot/index.js` РЅРµР»СЊР·СЏ С‡РµСЃС‚РЅРѕ РїСЂРѕРІРµСЂРёС‚СЊ group smoke РґР»СЏ `@mention`, reply Рё join/leave.

## 2026-07-04 вЂ” SMART-004: concise group task confirmations (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** Р’ Р»РѕРєР°Р»СЊРЅРѕРј worker checkout РѕР±РЅРѕРІР»РµРЅС‹ bot-РѕР±СЂР°Р±РѕС‚С‡РёРєРё РґР»СЏ `SMART-004`. `4e-worker/src/bot/handler.js` С‚РµРїРµСЂСЊ С„РѕСЂРјРёСЂСѓРµС‚ РѕРґРЅРѕСЃС‚СЂРѕС‡РЅРѕРµ РїРѕРґС‚РІРµСЂР¶РґРµРЅРёРµ `вњ“ РРјСЏ: Р·Р°РґР°С‡Р° вЂ” СЃСЂРѕРє`, СЃРѕС…СЂР°РЅСЏРµС‚ Р·Р°РґР°С‡Сѓ СЃСЂР°Р·Сѓ РїРѕСЃР»Рµ СЂР°Р·Р±РѕСЂР° СЃРѕРѕР±С‰РµРЅРёСЏ, РїРѕРєР°Р·С‹РІР°РµС‚ С‚РѕР»СЊРєРѕ РєРЅРѕРїРєРё `вњЏпёЏ` Рё `вњ•`, Р° СЂРµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ/РѕС‚РјРµРЅР° СѓРґР°Р»СЏСЋС‚ СЃС‚Р°СЂСѓСЋ Р·Р°РїРёСЃСЊ С‡РµСЂРµР· `x-action: delete-task` Рё РЅРµ СЂРёСЃСѓСЋС‚ Р»РѕР¶РЅРѕРµ В«РћС‚РјРµРЅРµРЅРѕВ», РµСЃР»Рё Р±РѕС‚ СѓР¶Рµ РїРѕС‚РµСЂСЏР» РєРѕРЅС‚РµРєСЃС‚ callback. Р’ `4e-worker/worker.js` РїРѕРґС‚РІРµСЂР¶РґС‘РЅ РЅРѕРІС‹Р№ action `delete-task` СЃ СѓРґР°Р»РµРЅРёРµРј РїРѕ `taskId` РёР· user/group KV-РєР»СЋС‡РµР№; `saveTaskByName` РІ С‚РµРєСѓС‰РµРј checkout РЅРµ СЂРµР°Р»РёР·РѕРІР°РЅ, РїРѕСЌС‚РѕРјСѓ РґРѕРїРѕР»РЅРёС‚РµР»СЊРЅС‹С… СЃРєСЂС‹С‚С‹С… РєРѕРїРёР№ Р·Р°РґР°С‡Рё СЌС‚РѕС‚ СЃС†РµРЅР°СЂРёР№ СЃРµР№С‡Р°СЃ РЅРµ СЃРѕР·РґР°С‘С‚.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** `pm/backlog.md` вЂ” РєРѕРЅС‚СЂРѕР»СЊРЅС‹Р№ РїРѕРёСЃРє РґРѕ РїСЂР°РІРєРё `29`; `shared/WORK_LOG.md` вЂ” `167`; `DEVELOPMENT_LOG.md` вЂ” `173`; `FILE_MAP_WORKER.md` вЂ” `10`; `FILE_MAP_BOT.md` вЂ” `3`. РС‚РѕРіРѕРІР°СЏ СЃРІРµСЂРєР° РїРѕСЃР»Рµ РїСЂР°РІРѕРє РЅРµ РґРѕР»Р¶РЅР° РґР°РІР°С‚СЊ СѓРјРµРЅСЊС€РµРЅРёСЏ.

**РўРµСЃС‚:** `node --check <worker-repo-root>/worker.js`; `node --check <worker-repo-root>/src/bot/handler.js`; С‚РѕС‡РµС‡РЅР°СЏ РїСЂРѕРІРµСЂРєР° `handler.js`/`worker.js` РЅР° `formatTaskConfirmationLine`, `delete-task`, `handleDeleteTask`.

**РљРѕРјРјРёС‚:** `СЌС‚РѕС‚ РєРѕРјРјРёС‚`

**Р‘Р»РѕРєРµСЂС‹:** РўРµРєСѓС‰РёР№ `<worker-repo-root>` РЅРµ СЏРІР»СЏРµС‚СЃСЏ РѕС‚РґРµР»СЊРЅС‹Рј git-СЂРµРїРѕР·РёС‚РѕСЂРёРµРј, РїРѕСЌС‚РѕРјСѓ РєРѕРґ bot/worker РїРѕРєР° Р·Р°С„РёРєСЃРёСЂРѕРІР°РЅ С‚РѕР»СЊРєРѕ Р»РѕРєР°Р»СЊРЅРѕ. Р”Р»СЏ Р·Р°РєСЂС‹С‚РёСЏ SMART-004 РЅСѓР¶РµРЅ runtime deploy РїСЂРѕС†РµСЃСЃР° `node src/bot/index.js` Рё СЂСѓС‡РЅРѕР№ smoke РІ С‚РµСЃС‚РѕРІРѕР№ РіСЂСѓРїРїРµ.

## 2026-07-05 вЂ” INFRA-001: whitelist-С„СЂРѕРЅС‚ РЅР° Workers Static Assets (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** Р’ app-СЂРµРїРѕ РїРѕРґРЅСЏС‚ РѕС‚РґРµР»СЊРЅС‹Р№ С„СЂРѕРЅС‚РѕРІС‹Р№ Worker `4-ai-app-worker`: `scripts/build-pages-whitelist.mjs` СЃРѕР±РёСЂР°РµС‚ `.pages-dist`, `wrangler.toml` РїСѓР±Р»РёРєСѓРµС‚ РµС‘ С‡РµСЂРµР· Static Assets РЅР° РјР°СЂС€СЂСѓС‚Рµ `app.4-ai.site/*`, Р° `worker-static.js` РѕР±СЃР»СѓР¶РёРІР°РµС‚ assets Рё СЃС‚СЂР°С…СѓРµС‚ VK-РІС…РѕРґ. Р”Р»СЏ VK РґРѕР±Р°РІР»РµРЅ РІРЅСѓС‚СЂРµРЅРЅРёР№ rewrite: Р·Р°РїСЂРѕСЃС‹ РЅР° `vk.html` Р±РѕР»СЊС€Рµ РЅРµ С‚СЂРµР±СѓСЋС‚ РІРЅРµС€РЅРµРіРѕ `307`, Р° РµСЃР»Рё VK РєРѕРЅС‚РµР№РЅРµСЂ РїСЂРёС…РѕРґРёС‚ РІ РєРѕСЂРµРЅСЊ `/` СЃ launch params (`vk_*`, `sign`), Worker СЃСЂР°Р·Сѓ РѕС‚РґР°С‘С‚ VK-РїРѕРІРµСЂС…РЅРѕСЃС‚СЊ. Р­С‚Рѕ СЃРѕС…СЂР°РЅСЏРµС‚ whitelist-РјРѕРґРµР»СЊ, СѓР±РёСЂР°РµС‚ Р·Р°РІРёСЃРёРјРѕСЃС‚СЊ РѕС‚ Cloudflare Pages РІ Р Р¤ Рё РЅРµ Р·Р°С‚СЂР°РіРёРІР°РµС‚ API worker РЅР° `edge.4-ai.site`.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** РќРµ С‚СЂРµР±РѕРІР°Р»Р°СЃСЊ вЂ” `index.html` Рё `vk.html` РІ СЌС‚РѕР№ Р·Р°РґР°С‡Рµ РЅРµ СЂРµРґР°РєС‚РёСЂРѕРІР°Р»РёСЃСЊ.

**РўРµСЃС‚:** `npm run build:worker-assets`; `npx wrangler deploy`; HTTP-РїСЂРѕРІРµСЂРєРё `https://app.4-ai.site/`, `/vk`, `/privacy` -> `200`; `https://app.4-ai.site/pm/backlog.md` Рё `/shared/ROADMAP.md` -> `404`; preflight `OPTIONS` СЃ origin `https://app.4-ai.site` РґРѕ `https://edge.4-ai.site/auth/login` -> `204`; live HTML РЅР° РґРѕРјРµРЅРµ СЃРѕРґРµСЂР¶РёС‚ `https://edge.4-ai.site` Рё РЅРµ СЃРѕРґРµСЂР¶РёС‚ `workers.dev`, staging URL РёР»Рё `mrktggod.github.io`.

**РљРѕРјРјРёС‚:** N/A

## 2026-07-05 вЂ” SMART-006: user profile in AI chat context (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** Р’ `index.html` СЂР°СЃС€РёСЂРµРЅ system prompt AI-С‡Р°С‚Р°: РґРѕР±Р°РІР»РµРЅРѕ СЏРІРЅРѕРµ СѓРєР°Р·Р°РЅРёРµ СѓС‡РёС‚С‹РІР°С‚СЊ РїСЂРѕС„РёР»СЊ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ. Р СЏРґРѕРј СЃ `sendAsk()` РґРѕР±Р°РІР»РµРЅС‹ helper-С„СѓРЅРєС†РёРё, РєРѕС‚РѕСЂС‹Рµ СЃРѕР±РёСЂР°СЋС‚ РёР· `currentUser` Рё `allTasksCache` РїСЂРѕС„РёР»СЊРЅС‹Р№ Р±Р»РѕРє РґР»СЏ Claude: РёРјСЏ, Р»РѕРєР°Р»СЊРЅРѕРµ РІСЂРµРјСЏ Рё timezone, С‚Р°СЂРёС„, РєРѕР»РёС‡РµСЃС‚РІРѕ Р°РєС‚РёРІРЅС‹С…/РіРѕСЂСЏС‰РёС…/РїСЂРѕСЃСЂРѕС‡РµРЅРЅС‹С… Р·Р°РґР°С‡, Р·Р°РІРµСЂС€С‘РЅРЅС‹Рµ Р·Р° 7 РґРЅРµР№ (РїРѕ РґРѕСЃС‚СѓРїРЅС‹Рј timestamp-РїРѕР»СЏРј), С‚РѕРї-3 Р»СЋРґРµР№ РёР· Р°РєС‚РёРІРЅС‹С… Р·Р°РґР°С‡. Р­С‚РѕС‚ Р±Р»РѕРє С‚РµРїРµСЂСЊ РёРЅР¶РµРєС‚РёС‚СЃСЏ РІ `system` РІРјРµСЃС‚Рµ СЃ РґР°С‚РѕР№ Рё summary Р°РєС‚РёРІРЅС‹С… Р·Р°РґР°С‡.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** `index.html` вЂ” СЃРѕРІРїР°РґРµРЅРёР№ `Р’РѕР№С‚Рё|Р—Р°РґР°С‡Рё|РЎРµРіРѕРґРЅСЏ` РґРѕ: `61`, РїРѕСЃР»Рµ: `61`.

**РўРµСЃС‚:** Р»РѕРєР°Р»СЊРЅС‹Р№ grep РїРѕРґС‚РІРµСЂРґРёР», С‡С‚Рѕ `index.html` РЅР° РІРµС‚РєРµ СЃРѕРґРµСЂР¶РёС‚ РїСЂРѕС„РёР»СЊРЅС‹Р№ Р±Р»РѕРє Рё РёРЅР¶РµРєС‚РёС‚ РµРіРѕ РІ `system`. РџРѕР»РЅС‹Р№ staging smoke РїРѕРєР° Р·Р°Р±Р»РѕРєРёСЂРѕРІР°РЅ: `npx wrangler secret list --env staging` РЅРµ РїРѕРєР°Р·С‹РІР°РµС‚ `ANTHROPIC_KEY`, РїРѕСЌС‚РѕРјСѓ `/anthropic` РЅР° staging РЅРµР»СЊР·СЏ РїСЂРѕРІРµСЂРёС‚СЊ С‡РµСЃС‚РЅРѕ.

**РљРѕРјРјРёС‚:** `СЌС‚РѕС‚ РєРѕРјРјРёС‚`

## 2026-07-05 вЂ” BACK-034: staging contour bootstrap (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** Р”Р»СЏ `<worker-repo-root>` staging-РєРѕРЅС„РёРі РїСЂРёРІРµРґС‘РЅ Рє С€С‚Р°С‚РЅРѕРјСѓ РІРёРґСѓ: РІ `wrangler.toml` РґРѕР±Р°РІР»РµРЅ `[env.staging]` СЃ РѕС‚РґРµР»СЊРЅС‹РјРё D1/KV bindings Рё `routes = []`, С‡С‚РѕР±С‹ staging РЅРµ РЅР°СЃР»РµРґРѕРІР°Р» prod-РґРѕРјРµРЅ `edge.4-ai.site`; `wrangler.staging.toml` СЃРёРЅС…СЂРѕРЅРёР·РёСЂРѕРІР°РЅ. РџСЂРёРјРµРЅРµРЅР° РјРёРіСЂР°С†РёСЏ `postgres_app_state.sql` Рє D1 `4e-staging`, staging worker Р·Р°РґРµРїР»РѕРµРЅ РЅР° `https://restless-lab-d737-staging.shelckograff.workers.dev`. Р’ app-СЂРµРїРѕ СЃРѕР·РґР°РЅР° РІРµС‚РєР° `dev`: `index.html` РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ С…РѕРґРёС‚ РІ staging worker, username Р±РѕС‚Р° РјРѕР¶РЅРѕ РїСЂРѕРєРёРЅСѓС‚СЊ С‡РµСЂРµР· `?bot=<staging_bot_username>`, Р° РїСЂРё РЅРµРґРѕСЃС‚СѓРїРЅРѕСЃС‚Рё `startToken` dev-РІРµС‚РєР° РґРµР»Р°РµС‚ fallback-РѕС‚РєСЂС‹С‚РёРµ Telegram-Р±РѕС‚Р° Р±РµР· С‚СѓРїРёРєР°. РЎРѕР·РґР°РЅ Pages-РїСЂРѕРµРєС‚ `4-ai-staging`, Р·Р°РіСЂСѓР¶РµРЅР° dev-РІРµСЂСЃРёСЏ РїСЂРёР»РѕР¶РµРЅРёСЏ, РґРѕР±Р°РІР»РµРЅР° РёРЅСЃС‚СЂСѓРєС†РёСЏ `docs/staging-contour.md`.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** `index.html` вЂ” СЃРѕРІРїР°РґРµРЅРёР№ `Р’РѕР№С‚Рё|Р—Р°РґР°С‡Рё|РЎРµРіРѕРґРЅСЏ` РґРѕ: `61`, РїРѕСЃР»Рµ: `61`.

**РўРµСЃС‚:** `node --check worker.js`; `npx wrangler d1 migrations apply DB --env staging --remote`; `npx wrangler deploy --env staging`; `curl https://restless-lab-d737-staging.shelckograff.workers.dev/` в†’ `OK`; `curl -X OPTIONS ...` в†’ `204`; `wrangler pages project create 4-ai-staging --production-branch dev`; `wrangler pages deploy . --project-name 4-ai-staging --branch dev`; `curl https://4-ai-staging.pages.dev/` СЃРѕРґРµСЂР¶РёС‚ `const WORKER='https://restless-lab-d737-staging.shelckograff.workers.dev';`.

**РљРѕРјРјРёС‚:** `СЌС‚РѕС‚ РєРѕРјРјРёС‚`

**Р‘Р»РѕРєРµСЂС‹:** `npx wrangler secret list --env staging` РїРѕРєР°Р·С‹РІР°РµС‚ С‚РѕР»СЊРєРѕ `BOT_API_TOKEN`; РґР»СЏ AI smoke РЅСѓР¶РЅС‹ РєР°Рє РјРёРЅРёРјСѓРј `ANTHROPIC_KEY` Рё, РІРµСЂРѕСЏС‚РЅРѕ, `OPENAI_KEY`/`RESEND_KEY`/`VK_SECRET_KEY`. РўР°РєР¶Рµ РЅСѓР¶РµРЅ username С‚РµСЃС‚РѕРІРѕРіРѕ Р±РѕС‚Р° РґР»СЏ РїРѕР»РЅРѕРіРѕ СЂСѓС‡РЅРѕРіРѕ Telegram smoke, РїРѕРєР° РѕРЅ РЅРµ Р·Р°С„РёРєСЃРёСЂРѕРІР°РЅ РІ СЂРµРїРѕР·РёС‚РѕСЂРёРё Рё РїРµСЂРµРґР°С‘С‚СЃСЏ С‡РµСЂРµР· `?bot=...`.

## 2026-07-05 вЂ” BACK-007: privacy/RKN links and wording (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** Р’ `privacy.html` СЃС‚СЂРѕРєР° РїСЂРѕ СЂРµРµСЃС‚СЂ Р РљРќ РїСЂРёРІРµРґРµРЅР° Рє С„РѕСЂРјСѓР»РёСЂРѕРІРєРµ Р·Р°РґР°С‡Рё: В«РЈРІРµРґРѕРјР»РµРЅРёРµ РѕР± РѕР±СЂР°Р±РѕС‚РєРµ РїРµСЂСЃРѕРЅР°Р»СЊРЅС‹С… РґР°РЅРЅС‹С… Р·Р°СЂРµРіРёСЃС‚СЂРёСЂРѕРІР°РЅРѕ Р РѕСЃРєРѕРјРЅР°РґР·РѕСЂРѕРј, СЂРµРі. в„– 102299/77 РѕС‚ 01.07.2026В». Р’ `index.html` РґРѕР±Р°РІР»РµРЅР° СЏРІРЅР°СЏ privacy-СЃСЃС‹Р»РєР° РІ onboarding Рё СЂР°СЃС€РёСЂРµРЅ legal-note РЅР° СЌРєСЂР°РЅРµ auth: С‚РµРїРµСЂСЊ РѕРЅ РїРѕРєСЂС‹РІР°РµС‚ Рё `Р’РѕР№С‚Рё`, Рё `РЎРѕР·РґР°С‚СЊ Р°РєРєР°СѓРЅС‚`.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** `index.html` вЂ” СЃРѕРІРїР°РґРµРЅРёР№ `Р’РѕР№С‚Рё|Р—Р°РґР°С‡Рё|РЎРµРіРѕРґРЅСЏ` РґРѕ: `61`, РїРѕСЃР»Рµ: `61`.

**РўРµСЃС‚:** `Invoke-WebRequest https://mrktggod.github.io/4e-app/privacy.html` РІРµСЂРЅСѓР» `200`; live-СЃС‚СЂР°РЅРёС†Р° СЃРѕРґРµСЂР¶РёС‚ `102299/77`. Р›РѕРєР°Р»СЊРЅС‹Р№ grep РїРѕРґС‚РІРµСЂРґРёР» privacy-СЃСЃС‹Р»РєРё РІ onboarding, auth Рё biometric consent.

**РљРѕРјРјРёС‚:** `СЌС‚РѕС‚ РєРѕРјРјРёС‚`

## 2026-07-04 вЂ” PM docs sync v2.1 (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** РќР°Р№РґРµРЅ СЂРµР°Р»СЊРЅС‹Р№ target-СЂРµРїРѕР·РёС‚РѕСЂРёР№ `<repo-root>` РІРјРµСЃС‚Рѕ `Documents\4\4e-app`. РР· Desktop-РёСЃС‚РѕС‡РЅРёРєР° Р±Р°Р№С‚РѕРІС‹Рј `Copy-Item` СЃРёРЅС…СЂРѕРЅРёР·РёСЂРѕРІР°РЅС‹ `shared/ROADMAP.md`, `pm/backlog.md`, `pm/bugs.md`, `docs/Р—РђР”РђР§Р_РЈРњРќР«Р™_РђРЎРЎРРЎРўР•РќРў.md` Рё `docs/Р—РђР”РђР§Р_Р‘Р•РўРђ_Р_Р’РР РђР›Р¬РќРћРЎРўР¬.md`. РџРѕ РґРѕРїРѕР»РЅРµРЅРёСЋ inbox v2.1 РїРµСЂРµРёРјРµРЅРѕРІР°РЅС‹ task-С„Р°Р№Р»С‹ `BACK-025-completed-tasks-week.md` в†’ `BACK-039-completed-tasks-week.md` Рё `BACK-027-admin-tariff-map.md` в†’ `BACK-040-admin-tariff-map.md`, РѕР±РЅРѕРІР»РµРЅС‹ РёС… РІРЅСѓС‚СЂРµРЅРЅРёРµ РёРґРµРЅС‚РёС„РёРєР°С‚РѕСЂС‹ Рё backlog-Р·Р°РјРµС‚РєР° РїСЂРѕ РєРѕР»Р»РёР·РёСЋ ID. Р”РѕРїРѕР»РЅРёС‚РµР»СЊРЅРѕ РїСЂРёРІРµРґРµРЅС‹ Рє portable-РІРёРґСѓ Р°Р±СЃРѕР»СЋС‚РЅС‹Рµ РїСѓС‚Рё РІ `CODEX_INSTRUCTIONS.md`, С‡С‚РѕР±С‹ РїСЂРѕС€Р»Р° repo-РїСЂРѕРІРµСЂРєР° РїСѓС‚РµР№.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** РєРёСЂРёР»Р»РёС†Р° source/target СЃРѕРІРїР°Р»Р° РґР»СЏ РІСЃРµС… 5 РєРѕРїРёСЂСѓРµРјС‹С… С„Р°Р№Р»РѕРІ вЂ” `ROADMAP 6055/6055`, `backlog 6680/6680`, `bugs 5994/5994`, `Р—РђР”РђР§Р_РЈРњРќР«Р™_РђРЎРЎРРЎРўР•РќРў 4791/4791`, `Р—РђР”РђР§Р_Р‘Р•РўРђ_Р_Р’РР РђР›Р¬РќРћРЎРўР¬ 5264/5264`.

**РўРµСЃС‚:** `git diff --check`; `C:\Program Files\Git\bin\bash.exe scripts/check-portable-paths.sh`; grep РїРѕ СЂРµРїРѕ РЅР° СЃС‚Р°СЂС‹Рµ СЃСЃС‹Р»РєРё `BACK-025-completed-tasks-week` / `BACK-027-admin-tariff-map` Рё Later-РґСѓР±Р»РёРєР°С‚С‹ вЂ” Р»РёС€РЅРёС… СѓРїРѕРјРёРЅР°РЅРёР№ РЅРµ РѕСЃС‚Р°Р»РѕСЃСЊ.

**РљРѕРјРјРёС‚:** `docs(pm): sync roadmap+backlog+bugs вЂ” SMART/VIRAL/PLAT Р·Р°РґР°С‡Рё, Р°СѓРґРёС‚ Р±Р°РіРѕРІ, СЂРµС€РµРЅРёСЏ 2026-07-04`

## 2026-06-29 вЂ” BACK-025: AI planner glass dashboard PM setup (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** РЎРѕР·РґР°РЅР° PM-РѕСЃРЅРѕРІР° РґР»СЏ РїРµСЂРµРґРµР»РєРё РіР»Р°РІРЅРѕРіРѕ СЌРєСЂР°РЅР° РІ СѓС‚СЂРµРЅРЅРёР№ AI-РїР»Р°РЅРµСЂ. Р’ `shared/ROADMAP.md` РґРѕР±Р°РІР»РµРЅРѕ РЅР°РїСЂР°РІР»РµРЅРёРµ "AI-РїР»Р°РЅРµСЂРЅС‹Р№ РґР°С€Р±РѕСЂРґ"; РІ `pm/backlog.md` РґРѕР±Р°РІР»РµРЅ `BACK-025 вЂ” РќР°СЃС‚СЂР°РёРІР°РµРјС‹Р№ СѓС‚СЂРµРЅРЅРёР№ AI-РґР°С€Р±РѕСЂРґ` РєР°Рє P1; `pm/next-actions.md` РѕР±РЅРѕРІР»С‘РЅ РЅРѕРІС‹Рј Р±Р»РёР¶Р°Р№С€РёРј С„РѕРєСѓСЃРѕРј; `pm/qa-checklist.md` РїРѕР»СѓС‡РёР» smoke-РїСЂРѕРІРµСЂРєРё РґР»СЏ "РџР»Р°РЅ РЅР° СЃРµРіРѕРґРЅСЏ", "РџСѓР»СЊСЃ РґРЅСЏ" Рё СЃРјС‹СЃР»РѕРІС‹С… СЃРµРєС†РёР№ Р·Р°РґР°С‡. РЎРѕР·РґР°РЅ `docs/tasks/BACK-025_ai_planner_glass_dashboard.md`.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** `index.html` РЅРµ РјРµРЅСЏР»СЃСЏ, РЁР°Рі 0 РЅРµ С‚СЂРµР±РѕРІР°Р»СЃСЏ.

**РўРµСЃС‚:** Р”РѕРєСѓРјРµРЅС‚Р°Р»СЊРЅР°СЏ РїСЂРѕРІРµСЂРєР° СЃРІСЏР·РєРё `shared/ROADMAP.md` в†’ `pm/backlog.md` в†’ `pm/next-actions.md` в†’ `pm/qa-checklist.md` в†’ `docs/tasks/BACK-025_ai_planner_glass_dashboard.md`; `git diff --check`; `bash scripts/check-portable-paths.sh`.

**РљРѕРјРјРёС‚:** СЌС‚РѕС‚ РєРѕРјРјРёС‚.

**РЎС‚Р°С‚СѓСЃ:** PM setup РІС‹РїРѕР»РЅРµРЅ. РЎР»РµРґСѓСЋС‰РёР№ С€Р°Рі вЂ” СЂРµР°Р»РёР·Р°С†РёСЏ UI РІ РІРµС‚РєРµ `feat/ai-planner-glass-dashboard`.

---

## 2026-06-29 вЂ” BUG-2026-06-29-002: voice microphone error triage (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** РџРѕ СЃРєСЂРёРЅСѓ РђР»РµРєСЃРµСЏ Р·Р°С„РёРєСЃРёСЂРѕРІР°РЅ Р±Р°Рі РіРѕР»РѕСЃРѕРІРѕРіРѕ СЂРµР¶РёРјР°: СЌРєСЂР°РЅ РїРѕРєР°Р·С‹РІР°РµС‚ "РћС€РёР±РєР° РјРёРєСЂРѕС„РѕРЅР°" Рё РЅРµ РЅР°С‡РёРЅР°РµС‚ Р·Р°РїРёСЃСЊ. РўРѕС‡РµС‡РЅР°СЏ РїСЂРѕРІРµСЂРєР° `index.html` РїРѕРєР°Р·Р°Р»Р°, С‡С‚Рѕ С‚РµРєСѓС‰РёР№ `main` РёСЃРїРѕР»СЊР·СѓРµС‚ `SpeechRecognition` РІ `openVoice()`. Р’ РёСЃС‚РѕСЂРёРё РЅР°Р№РґРµРЅ MediaRecorder-flow РІ `70a051f` / `origin/feat/voice-mediarecorder`, РЅРѕ РѕРЅ Р±С‹Р» РѕС‚РєР°С‚Р°РЅ РєРѕРјРјРёС‚РѕРј `e970d33` РѕР±СЂР°С‚РЅРѕ Рє SpeechRecognition. Р”РѕР±Р°РІР»РµРЅС‹ `BUG-2026-06-29-002` РІ `pm/bugs.md`, P1-СЃС‚СЂРѕРєР° `BACK-021` РІ Now `pm/backlog.md`, voice-РїСЂРѕРІРµСЂРєРё РІ `pm/qa-checklist.md` Рё СѓС‚РѕС‡РЅРµРЅРёРµ РІ `docs/tasks/BACK-021-voice-mediarecorder.md`.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** `index.html` РЅРµ РјРµРЅСЏР»СЃСЏ, РЁР°Рі 0 РЅРµ С‚СЂРµР±РѕРІР°Р»СЃСЏ.

**РўРµСЃС‚:** Р”РѕРєСѓРјРµРЅС‚Р°Р»СЊРЅР°СЏ РїСЂРѕРІРµСЂРєР° СЃРІСЏР·РєРё `pm/bugs.md` в†’ `pm/backlog.md` в†’ `pm/qa-checklist.md` в†’ `docs/tasks/BACK-021-voice-mediarecorder.md`; РєРѕРґ РЅРµ РјРµРЅСЏР»СЃСЏ.

**РљРѕРјРјРёС‚:** N/A

**РЎС‚Р°С‚СѓСЃ:** Triaged вЂ” РїРµСЂРµРґ РєРѕРґРѕРІС‹Рј С„РёРєСЃРѕРј РЅСѓР¶РЅРѕ РїРѕРЅСЏС‚СЊ РїСЂРёС‡РёРЅСѓ РѕС‚РєР°С‚Р° `e970d33`, РїСЂРѕРІРµСЂРёС‚СЊ Worker `/transcribe` Рё `OPENAI_KEY`, Р·Р°С‚РµРј РґРµР»Р°С‚СЊ РѕС‚РґРµР»СЊРЅСѓСЋ РІРµС‚РєСѓ `fix/voice-mediarecorder`.

---
## 2026-06-29 вЂ” BUG-2026-06-29-001: Telegram login dead end triage (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** РџРѕ СЃРєСЂРёРЅСѓ РђР»РµРєСЃРµСЏ Рё С‚РѕС‡РµС‡РЅРѕР№ РїСЂРѕРІРµСЂРєРµ `index.html` Р·Р°С„РёРєСЃРёСЂРѕРІР°РЅ Р±Р°Рі РІС…РѕРґР° С‡РµСЂРµР· Telegram: РїСЂРё РѕС‚СЃСѓС‚СЃС‚РІРёРё `Telegram.WebApp.initData` С„СѓРЅРєС†РёСЏ `loginWithTelegram()` РїРѕРєР°Р·С‹РІР°РµС‚ toast "РћС‚РєСЂРѕР№ Р±РѕС‚Р° Рё РЅР°Р¶РјРё Start вЂ” РїРѕР»СѓС‡РёС€СЊ СЃСЃС‹Р»РєСѓ РґР»СЏ РІС…РѕРґР°", РЅРѕ UI РЅРµ РѕС‚РєСЂС‹РІР°РµС‚ Р±РѕС‚Р° Рё РЅРµ РґР°С‘С‚ СЏРІРЅС‹Р№ СЃР»РµРґСѓСЋС‰РёР№ С€Р°Рі. Р”РѕР±Р°РІР»РµРЅС‹ `BUG-2026-06-29-001` РІ `pm/bugs.md`, `BACK-024` РІ `pm/backlog.md`, СЃС‚СЂРѕРєР° СЂРёСЃРєР° РІ `shared/ROADMAP.md`, РїСЂРѕРІРµСЂРєРё РІ `pm/qa-checklist.md` Рё task-С„Р°Р№Р» `docs/tasks/BUG-2026-06-29-001_telegram_login_dead_end.md`.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** `index.html` РЅРµ РјРµРЅСЏР»СЃСЏ, РЁР°Рі 0 РЅРµ С‚СЂРµР±РѕРІР°Р»СЃСЏ.

**РўРµСЃС‚:** Р”РѕРєСѓРјРµРЅС‚Р°Р»СЊРЅР°СЏ РїСЂРѕРІРµСЂРєР° СЃРІСЏР·РєРё `pm/bugs.md` в†’ `pm/backlog.md` в†’ `shared/ROADMAP.md` в†’ `pm/qa-checklist.md` в†’ `docs/tasks/`. РљРѕРґ Рё bot-СЂРµРїРѕР·РёС‚РѕСЂРёР№ РЅРµ РјРµРЅСЏР»РёСЃСЊ.

**РљРѕРјРјРёС‚:** СЌС‚РѕС‚ РєРѕРјРјРёС‚

**РЎС‚Р°С‚СѓСЃ:** Triaged вЂ” РЅСѓР¶РµРЅ live smoke `@Denzel89bot` Рё РёСЃРїСЂР°РІР»РµРЅРёРµ UX/app + bot handoff.

---
## 2026-06-29 вЂ” PM-Р·Р°РґР°С‡Рё РїРѕ РґРµС‚Р°Р»СЊРЅРѕР№ РєР°СЂС‚РѕС‡РєРµ Р·Р°РґР°С‡Рё (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** Р’ `pm/backlog.md` РґРѕР±Р°РІР»РµРЅС‹ `BACK-022` вЂ” СЂСѓС‡РЅРѕР№ MVP РґРµС‚Р°Р»СЊРЅРѕР№ РєР°СЂС‚РѕС‡РєРё Р·Р°РґР°С‡Рё Рё `BACK-023` вЂ” СЂР°СЃС€РёСЂРµРЅРёРµ РєР°СЂС‚РѕС‡РєРё РїРѕСЃР»Рµ MVP. Р’ `shared/ROADMAP.md` РЅР°РїСЂР°РІР»РµРЅРёРµ "РљР°С‡РµСЃС‚РІРѕ Р·Р°РґР°С‡" РѕР±РЅРѕРІР»РµРЅРѕ: `BACK-019` РѕСЃС‚Р°С‘С‚СЃСЏ Р·Р°РґР°С‡РµР№ РїСЂРѕ РєР°СЂС‚РѕС‡РєРё РІ СЃРїРёСЃРєРµ, `BACK-022` РґРѕР±Р°РІР»РµРЅ РєР°Рє СЃР»РµРґСѓСЋС‰РёР№ P1-С„РѕРєСѓСЃ РїРѕ СЌРєСЂР°РЅСѓ `task-detail`. Р’ `pm/next-actions.md` РґРѕР±Р°РІР»РµРЅ PM-С€Р°Рі РїРѕРґРіРѕС‚РѕРІРєРё `BACK-022`. РЎРѕР·РґР°РЅС‹ `docs/tasks/BACK-022_task_detail_manual_mvp.md` Рё `docs/tasks/BACK-023_task_detail_future_expansion.md`.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** `index.html` РЅРµ РјРµРЅСЏР»СЃСЏ, РЁР°Рі 0 РЅРµ С‚СЂРµР±РѕРІР°Р»СЃСЏ.

**РўРµСЃС‚:** Р”РѕРєСѓРјРµРЅС‚Р°Р»СЊРЅР°СЏ РїСЂРѕРІРµСЂРєР° СЃРІСЏР·РєРё `pm/backlog.md` в†’ `shared/ROADMAP.md` в†’ `pm/next-actions.md` в†’ `docs/tasks/`; `git diff --check`; `bash scripts/check-portable-paths.sh`.

**РљРѕРјРјРёС‚:** N/A вЂ” РєРѕРјРјРёС‚/РїСѓС€ РІС‹РїРѕР»РЅСЏСЋС‚СЃСЏ РѕС‚РґРµР»СЊРЅРѕ С‡РµР»РѕРІРµРєРѕРј.

**РЎС‚Р°С‚СѓСЃ:** Р»РѕРєР°Р»СЊРЅРѕ РІС‹РїРѕР»РЅРµРЅРѕ.

---
## 2026-06-30 вЂ” BACK-019 mobile swipe actions + vibration (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** РСЃРїСЂР°РІР»РµРЅС‹ РјРѕР±РёР»СЊРЅС‹Рµ РґРµР№СЃС‚РІРёСЏ РєР°СЂС‚РѕС‡РµРє Р·Р°РґР°С‡: РєРЅРѕРїРєРё `Р—Р°РІРµСЂС€РёС‚СЊ`, `РћС‚РјРµРЅРёС‚СЊ`, `РџРµСЂРµРЅРµСЃС‚Рё` С‚РµРїРµСЂСЊ РѕР±СЂР°Р±Р°С‚С‹РІР°СЋС‚СЃСЏ РґРµР»РµРіРёСЂРѕРІР°РЅРЅРѕ С‡РµСЂРµР· `touchend` Рё `click`, Р±РµР· inline `onclick`, С‡С‚РѕР±С‹ swipe gesture РЅРµ РіР°СЃРёР» РЅР°Р¶Р°С‚РёРµ. Р”РѕР±Р°РІР»РµРЅР° С‚Р°РєС‚РёР»СЊРЅР°СЏ РѕС‚РґР°С‡Р° С‡РµСЂРµР· Vibration API: `10ms` РїСЂРё РґРѕСЃС‚РёР¶РµРЅРёРё РїРѕСЂРѕРіР° СЃРІР°Р№РїР° Рё `20ms` РїСЂРё РЅР°Р¶Р°С‚РёРё action-РєРЅРѕРїРєРё. РњРѕР±РёР»СЊРЅР°СЏ РіРµРѕРјРµС‚СЂРёСЏ РєР°СЂС‚РѕС‡РєРё СѓС‚РѕС‡РЅРµРЅР°: action-СЃР»РѕР№ РїРѕР»СѓС‡РёР» СЃС‚Р°Р±РёР»СЊРЅС‹Рµ `width/height`, РєРЅРѕРїРєРё С„РёРєСЃРёСЂРѕРІР°РЅС‹ РїРѕ 72px, Р»РµРІС‹Р№ СЃРґРІРёРі РєР°СЂС‚РѕС‡РєРё СЂР°РІРµРЅ С€РёСЂРёРЅРµ РґРІСѓС… РєРЅРѕРїРѕРє (`144px`).

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** Р¤Р°Р№Р»С‹ СЃ РєРёСЂРёР»Р»РёС†РµР№ С‡РёС‚Р°Р»РёСЃСЊ/РїРёСЃР°Р»РёСЃСЊ С‡РµСЂРµР· `[System.IO.File]::ReadAllText/WriteAllText` СЃ UTF-8 Р±РµР· BOM.

**РўРµСЃС‚:** `npm run build:css`, `git diff --check`, СЃРёРЅС‚Р°РєСЃРёС‡РµСЃРєР°СЏ РїСЂРѕРІРµСЂРєР° JS РёР· `index.html` С‡РµСЂРµР· Node.

**РљРѕРјРјРёС‚:** СЌС‚РѕС‚ РєРѕРјРјРёС‚.

**РЎС‚Р°С‚СѓСЃ:** Ready for QA вЂ” РїСЂРѕРІРµСЂРёС‚СЊ РЅР° С‚РµР»РµС„РѕРЅРµ swipe left/right, РєРЅРѕРїРєРё РґРµР№СЃС‚РІРёР№ Рё РІРёР±СЂР°С†РёСЋ.

---
## 2026-06-28 вЂ” BACK-019 web swipe actions hidden (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** РСЃРїСЂР°РІР»РµРЅ web Telegram/browser regression: РєРЅРѕРїРєРё `РћС‚РјРµРЅРёС‚СЊ`, `РџРµСЂРµРЅРµСЃС‚Рё`, `Р—Р°РІРµСЂС€РёС‚СЊ` С‚РµРїРµСЂСЊ СЃРєСЂС‹С‚С‹ РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ С‡РµСЂРµР· `opacity:0`, `visibility:hidden` Рё `translateX(...)`. РќР° non-touch СѓСЃС‚СЂРѕР№СЃС‚РІР°С… (`@media (pointer:fine)`) swipe-actions РїРѕР»РЅРѕСЃС‚СЊСЋ РѕС‚РєР»СЋС‡РµРЅС‹ С‡РµСЂРµР· `display:none!important`, С‡С‚РѕР±С‹ РІ Р±СЂР°СѓР·РµСЂРµ РѕРЅРё РЅРµ РІРёСЃРµР»Рё СЃС‚Р°С‚РёС‡РЅРѕ РЅР°Рґ РєР°СЂС‚РѕС‡РєР°РјРё.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** Р¤Р°Р№Р»С‹ СЃ РєРёСЂРёР»Р»РёС†РµР№ С‡РёС‚Р°Р»РёСЃСЊ/РїРёСЃР°Р»РёСЃСЊ С‡РµСЂРµР· `[System.IO.File]::ReadAllText/WriteAllText` СЃ UTF-8 Р±РµР· BOM.

**РўРµСЃС‚:** `npm run build:css`, `git diff --check`, СЃРёРЅС‚Р°РєСЃРёС‡РµСЃРєР°СЏ РїСЂРѕРІРµСЂРєР° JS РёР· `index.html` С‡РµСЂРµР· Node.

**РљРѕРјРјРёС‚:** СЌС‚РѕС‚ РєРѕРјРјРёС‚.

**РЎС‚Р°С‚СѓСЃ:** Ready for QA вЂ” РїСЂРѕРІРµСЂРёС‚СЊ web Telegram/browser Рё touch-СЃРІР°Р№РїС‹ РЅР° С‚РµР»РµС„РѕРЅРµ.

---
## 2026-06-28 вЂ” BACK-019 fix swipe actions visibility (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** РСЃРїСЂР°РІР»РµРЅ Р±Р°Рі, РёР·-Р·Р° РєРѕС‚РѕСЂРѕРіРѕ РєРЅРѕРїРєРё `Р—Р°РІРµСЂС€РёС‚СЊ`, `РћС‚РјРµРЅРёС‚СЊ`, `РџРµСЂРµРЅРµСЃС‚Рё` РѕС‚РѕР±СЂР°Р¶Р°Р»РёСЃСЊ СЃС‚Р°С‚РёС‡РЅРѕ РЅР°Рґ РєР°Р¶РґРѕР№ РєР°СЂС‚РѕС‡РєРѕР№ Р·Р°РґР°С‡. РџСЂРёС‡РёРЅР°: swipe CSS Р±С‹Р» Р·Р°РІСЏР·Р°РЅ РЅР° СЂРѕРґРёС‚РµР»СЊСЃРєРёР№ `.tasks-wrap`, РєРѕС‚РѕСЂРѕРіРѕ РЅРµС‚ Сѓ СЂРµР°Р»СЊРЅРѕРіРѕ `#home-task-list`; СЃРµР»РµРєС‚РѕСЂС‹ РїРµСЂРµРЅРµСЃРµРЅС‹ РЅР° `.task-card-shell`, РїРѕСЌС‚РѕРјСѓ action-РєРЅРѕРїРєРё СЃРЅРѕРІР° СЃРєСЂС‹С‚С‹ РїРѕРґ РєР°СЂС‚РѕС‡РєРѕР№ РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ Рё РІРёРґРЅС‹ С‚РѕР»СЊРєРѕ РїСЂРё СЃРІР°Р№РїРµ.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** Р¤Р°Р№Р»С‹ СЃ РєРёСЂРёР»Р»РёС†РµР№ С‡РёС‚Р°Р»РёСЃСЊ/РїРёСЃР°Р»РёСЃСЊ С‡РµСЂРµР· `[System.IO.File]::ReadAllText/WriteAllText` СЃ UTF-8 Р±РµР· BOM.

**РўРµСЃС‚:** `npm run build:css`, `git diff --check`, СЃРёРЅС‚Р°РєСЃРёС‡РµСЃРєР°СЏ РїСЂРѕРІРµСЂРєР° JS РёР· `index.html` С‡РµСЂРµР· Node.

**РљРѕРјРјРёС‚:** СЌС‚РѕС‚ РєРѕРјРјРёС‚.

**РЎС‚Р°С‚СѓСЃ:** Ready for QA вЂ” РїСЂРѕРІРµСЂРёС‚СЊ СЃРІР°Р№Рї РІР»РµРІРѕ/РІРїСЂР°РІРѕ РЅР° С‚РµР»РµС„РѕРЅРµ.

---
## 2026-06-28 вЂ” BACK-019 СѓР»СѓС‡С€РµРЅРЅС‹Рµ РєР°СЂС‚РѕС‡РєРё Р·Р°РґР°С‡ (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** Р’ `index.html` РґРѕР±Р°РІР»РµРЅ РµРґРёРЅС‹Р№ `renderTaskCard()` РґР»СЏ РґРѕРјР°С€РЅРµРіРѕ СЃРїРёСЃРєР° Р·Р°РґР°С‡, С„РёР»СЊС‚СЂРѕРІ Рё РјРµСЃСЏС‡РЅРѕРіРѕ СЃРїРёСЃРєР°. РљР°СЂС‚РѕС‡РєР° С‚РµРїРµСЂСЊ РїРѕРєР°Р·С‹РІР°РµС‚ РЅРѕРјРµСЂ СЃ С†РІРµС‚РЅС‹Рј РїСЂРёРѕСЂРёС‚РµС‚РѕРј, РєР°С‚РµРіРѕСЂРёСЋ, РґРµРґР»Р°Р№РЅ, РґРІСѓС…СЃС‚СЂРѕС‡РЅРѕРµ РЅР°Р·РІР°РЅРёРµ Рё РїСЂРёРіР»СѓС€С‘РЅРЅСѓСЋ РєСЂР°СЃРЅСѓСЋ РїРѕРґСЃРІРµС‚РєСѓ РїСЂРѕСЃСЂРѕС‡РµРЅРЅС‹С… Р·Р°РґР°С‡. Р”РѕР±Р°РІР»РµРЅС‹ swipe-РґРµР№СЃС‚РІРёСЏ: РІРїСЂР°РІРѕ вЂ” `Р—Р°РІРµСЂС€РёС‚СЊ`, РІР»РµРІРѕ вЂ” `РћС‚РјРµРЅРёС‚СЊ` Рё `РџРµСЂРµРЅРµСЃС‚Рё` СЃ date picker Рё СЃРѕС…СЂР°РЅРµРЅРёРµРј С‡РµСЂРµР· `update-task`.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** Р¤Р°Р№Р»С‹ СЃ РєРёСЂРёР»Р»РёС†РµР№ С‡РёС‚Р°Р»РёСЃСЊ/РїРёСЃР°Р»РёСЃСЊ С‡РµСЂРµР· `[System.IO.File]::ReadAllText/WriteAllText` СЃ UTF-8 Р±РµР· BOM; PowerShell `-replace`, `Set-Content`, `Out-File` РЅРµ РёСЃРїРѕР»СЊР·РѕРІР°Р»РёСЃСЊ.

**РўРµСЃС‚:** `npm run build:css`, `git diff --check`, СЃРёРЅС‚Р°РєСЃРёС‡РµСЃРєР°СЏ РїСЂРѕРІРµСЂРєР° JS РёР· `index.html` С‡РµСЂРµР· Node.

**РљРѕРјРјРёС‚:** СЌС‚РѕС‚ РєРѕРјРјРёС‚.

**РЎС‚Р°С‚СѓСЃ:** Ready for QA вЂ” РЅСѓР¶РµРЅ СЂСѓС‡РЅРѕР№ smoke СЃРІР°Р№РїРѕРІ Рё date picker РЅР° С‚РµР»РµС„РѕРЅРµ.

---
## 2026-06-28 вЂ” РћС‚РІРµС‚СЃС‚РІРµРЅРЅС‹Р№ Р·Р° Р РљРќ: Р®СЂРёР№ (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** РџРѕ СЂРµС€РµРЅРёСЋ РђР»РµРєСЃРµСЏ BACK-007 "РЈРІРµРґРѕРјР»РµРЅРёРµ Р РљРќ" РїРµСЂРµРґР°РЅ Р®СЂРёСЋ. РћР±РЅРѕРІР»РµРЅС‹ `shared/ROADMAP.md`, `pm/backlog.md`, `pm/next-actions.md` Рё СЃРїРёСЃРѕРє РѕС‚РєСЂС‹С‚С‹С… РїСЂРѕР±Р»РµРј РІ СЌС‚РѕРј Р»РѕРіРµ: Р РљРќ С‚РµРїРµСЂСЊ manual task Р®СЂРёСЏ, Р° РЅРµ РђР»РµРєСЃРµСЏ.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** `index.html` РЅРµ РјРµРЅСЏР»СЃСЏ, РЁР°Рі 0 РЅРµ С‚СЂРµР±РѕРІР°Р»СЃСЏ.

**РўРµСЃС‚:** Р”РѕРєСѓРјРµРЅС‚Р°Р»СЊРЅР°СЏ РїСЂР°РІРєР°; РїСЂРѕРІРµСЂРєР° вЂ” `git diff --check` Рё `bash scripts/check-portable-paths.sh`.

**РљРѕРјРјРёС‚:** N/A.

**РЎС‚Р°С‚СѓСЃ:** Р»РѕРєР°Р»СЊРЅРѕ РІС‹РїРѕР»РЅРµРЅРѕ, Р±РµР· push/merge.

---

## 2026-06-28 вЂ” РЎРјСЏРіС‡РµРЅРёРµ Git-РїСЂРѕС†РµСЃСЃР°: GitHub Desktop РЅРµ РѕР±СЏР·Р°С‚РµР»РµРЅ РґР»СЏ Р®СЂС‹ (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** РџРѕ СЂРµС€РµРЅРёСЋ РђР»РµРєСЃРµСЏ РѕС‚РјРµРЅРµРЅР° Р¶С‘СЃС‚РєР°СЏ С„РѕСЂРјСѓР»РёСЂРѕРІРєР° "СЂР°Р±РѕС‚Р°С‚СЊ С‚РѕР»СЊРєРѕ С‡РµСЂРµР· GitHub Desktop". `AGENTS.md`, `CLAUDE.md`, `COWORK_INSTRUCTIONS.md`, `shared/ROADMAP.md`, `pm/next-actions.md` Рё Р±СЂРёС„ РІ `pm/agent-inbox/` РѕР±РЅРѕРІР»РµРЅС‹: GitHub Desktop РѕСЃС‚Р°РІР»РµРЅ РєР°Рє СѓРґРѕР±РЅС‹Р№ РІР°СЂРёР°РЅС‚ РґР»СЏ РђР»РµРєСЃРµСЏ, РЅРѕ РЅРµ РѕР±СЏР·Р°С‚РµР»СЊРЅРѕРµ РїСЂР°РІРёР»Рѕ РґР»СЏ Р®СЂС‹ РёР»Рё РѕРїС‹С‚РЅС‹С… СѓС‡Р°СЃС‚РЅРёРєРѕРІ. `docs/github-desktop-team-rules.md` РїРµСЂРµРёРјРµРЅРѕРІР°РЅ РІ `docs/git-team-rules.md`; РѕР±СЏР·Р°С‚РµР»СЊРЅС‹Рј РѕСЃС‚Р°С‘С‚СЃСЏ РЅРµ РєРѕРЅРєСЂРµС‚РЅС‹Р№ РёРЅСЃС‚СЂСѓРјРµРЅС‚, Р° СЃРѕРіР»Р°СЃРѕРІР°РЅРёРµ СЂРёСЃРєРѕРІР°РЅРЅС‹С… Git-РґРµР№СЃС‚РІРёР№: push, merge РІ `main`, force push, destructive reset/revert Рё `pull --rebase` РїСЂРё РіСЂСЏР·РЅРѕРј РґРµСЂРµРІРµ РёР»Рё РЅРµРїРѕРЅСЏС‚РЅРѕР№ РІРµС‚РєРµ.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** `index.html` РЅРµ РјРµРЅСЏР»СЃСЏ, РЁР°Рі 0 РЅРµ С‚СЂРµР±РѕРІР°Р»СЃСЏ.

**РўРµСЃС‚:** Р”РѕРєСѓРјРµРЅС‚Р°Р»СЊРЅР°СЏ РїСЂР°РІРєР°; РїСЂРѕРІРµСЂРєР° вЂ” `git diff --check` Рё `bash scripts/check-portable-paths.sh`.

**РљРѕРјРјРёС‚:** N/A.

**РЎС‚Р°С‚СѓСЃ:** Р»РѕРєР°Р»СЊРЅРѕ РІС‹РїРѕР»РЅРµРЅРѕ, Р±РµР· push/merge.

---

## 2026-06-28 вЂ” РљРѕРјР°РЅРґРЅС‹Р№ Git-РїСЂРѕС†РµСЃСЃ Рё РїР»Р°РЅ СЃР»РµРґСѓСЋС‰РёС… РґРµР№СЃС‚РІРёР№ (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** РћР±РЅРѕРІР»РµРЅС‹ `AGENTS.md`, `CLAUDE.md`, `COWORK_INSTRUCTIONS.md` Рё `FILE_MAP.md`: СЃС‚Р°СЂРѕРµ РїСЂР°РІРёР»Рѕ Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРѕРіРѕ `pull --rebase` Р·Р°РјРµРЅРµРЅРѕ РЅР° СЂСѓС‡РЅРѕР№ РїСЂРѕС†РµСЃСЃ С‡РµСЂРµР· GitHub Desktop. Р”РѕР±Р°РІР»РµРЅРѕ РїСЂР°РІРёР»Рѕ, С‡С‚Рѕ РёСЃРєР»СЋС‡РµРЅРёСЏ РёР· Git-РїСЂРѕС†РµСЃСЃР° РІРѕР·РјРѕР¶РЅС‹ С‚РѕР»СЊРєРѕ РїРѕСЃР»Рµ СЏРІРЅРѕРіРѕ СЃРѕРіР»Р°СЃРѕРІР°РЅРёСЏ СЃ РђР»РµРєСЃРµРµРј: РєР°РєРѕРµ РїСЂР°РІРёР»Рѕ РЅР°СЂСѓС€Р°РµРј, Р·Р°С‡РµРј, РєР°РєРѕР№ СЂРёСЃРє Рё РєС‚Рѕ РїРѕРґС‚РІРµСЂРґРёР». РЎРѕР·РґР°РЅ `docs/github-desktop-team-rules.md` СЃ РїРѕРЅСЏС‚РЅС‹РјРё РїСЂР°РІРёР»Р°РјРё РґР»СЏ РєРѕРјР°РЅРґС‹ Рё `pm/next-actions.md` СЃ Р±Р»РёР¶Р°Р№С€РёРј PM-РїР»Р°РЅРѕРј: Git-РїСЂРѕС†РµСЃСЃ, QA, legal/infra blockers, premium positioning, Р·Р°РєСЂС‹С‚С‹Р№ С‚РµСЃС‚ Рё РјРѕРЅРµС‚РёР·Р°С†РёСЏ.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** `index.html` РЅРµ РјРµРЅСЏР»СЃСЏ, РЁР°Рі 0 РЅРµ С‚СЂРµР±РѕРІР°Р»СЃСЏ.

**РўРµСЃС‚:** Р”РѕРєСѓРјРµРЅС‚Р°Р»СЊРЅР°СЏ РїСЂР°РІРєР°; РїСЂРѕРІРµСЂРєР° вЂ” `git diff --check` Рё `bash scripts/check-portable-paths.sh`.

**РљРѕРјРјРёС‚:** N/A.

**РЎС‚Р°С‚СѓСЃ:** Р»РѕРєР°Р»СЊРЅРѕ РІС‹РїРѕР»РЅРµРЅРѕ, Р±РµР· push/merge. РЎР»РµРґСѓСЋС‰РёР№ С€Р°Рі вЂ” РђР»РµРєСЃРµР№ РїСЂРѕРІРµСЂСЏРµС‚ РёР·РјРµРЅРµРЅРёСЏ РІ GitHub Desktop РЅР° РІРµС‚РєРµ `docs/git-branch-protocol` Рё СЂРµС€Р°РµС‚, РєРѕРјРјРёС‚РёС‚СЊ Р»Рё РёС….

---

## 2026-06-28 вЂ” РџРѕР¶РµР»Р°РЅРёРµ РђР»РµРєСЃРµСЏ РїРѕ Git-РїСЂРѕС†РµСЃСЃСѓ РІ roadmap (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** Р’ `shared/ROADMAP.md` РґРѕР±Р°РІР»РµРЅ Р±Р»РѕРє "РџРѕР¶РµР»Р°РЅРёСЏ / РѕР¶РёРґР°СЋС‚ СЂРµС€РµРЅРёСЏ" Рё РїСѓРЅРєС‚ РїРѕ Git-РїСЂРѕС†РµСЃСЃСѓ. Р—Р°С„РёРєСЃРёСЂРѕРІР°РЅРѕ, С‡С‚Рѕ РђР»РµРєСЃРµР№ РїРѕРґРґРµСЂР¶РёРІР°РµС‚ РІР°СЂРёР°РЅС‚ B: СЂР°Р·Р±РёСЂР°С‚СЊ РіРѕС‚РѕРІС‹Рµ РІРµС‚РєРё 1 СЂР°Р· РІ РЅРµРґРµР»СЋ + СЃСЂРѕС‡РЅРѕ РґР»СЏ P0/P1. `push`, `merge` Рё `pull --rebase` РЅРµ Р°РІС‚РѕРјР°С‚РёР·РёСЂРѕРІР°С‚СЊ; СЂР°Р±РѕС‚Р° РґРѕР»Р¶РЅР° РёРґС‚Рё С‡РµСЂРµР· GitHub Desktop СЃ СЏРІРЅС‹Рј РїРѕРґС‚РІРµСЂР¶РґРµРЅРёРµРј С‡РµР»РѕРІРµРєР°.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** `index.html` РЅРµ РјРµРЅСЏР»СЃСЏ, РЁР°Рі 0 РЅРµ С‚СЂРµР±РѕРІР°Р»СЃСЏ.

**РўРµСЃС‚:** Р”РѕРєСѓРјРµРЅС‚Р°Р»СЊРЅР°СЏ РїСЂР°РІРєР°; РїСЂРѕРІРµСЂРєР° вЂ” `git diff --check`.

**РљРѕРјРјРёС‚:** N/A.

**РЎС‚Р°С‚СѓСЃ:** РІС‹РїРѕР»РЅРµРЅРѕ РєР°Рє РїРѕР¶РµР»Р°РЅРёРµ, Р° РЅРµ С„РёРЅР°Р»СЊРЅРѕРµ РїСЂР°РІРёР»Рѕ. РЎР»РµРґСѓСЋС‰РёР№ С€Р°Рі вЂ” РїРѕР»СѓС‡РёС‚СЊ РјРЅРµРЅРёРµ Р®СЂС‹ / Claude Рё РїРѕСЃР»Рµ СЂРµС€РµРЅРёСЏ РђР»РµРєСЃРµСЏ РѕС„РѕСЂРјРёС‚СЊ РїСЂР°РІРёР»Рѕ РІ РєРѕРјР°РЅРґРЅС‹С… РёРЅСЃС‚СЂСѓРєС†РёСЏС….

---

## 2026-06-28 вЂ” Р—Р°РїСЂРѕСЃ Рє Claude Р®СЂС‹ РїРѕ РїСЂР°РІРёР»Сѓ merge РІ main (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** РЎРѕР·РґР°РЅ РєРѕРѕСЂРґРёРЅР°С†РёРѕРЅРЅС‹Р№ Р±СЂРёС„ `pm/agent-inbox/codex-to-claude-2026-06-28-branch-main-rule.md` СЃ РІРѕРїСЂРѕСЃРѕРј Рѕ РїСЂР°РІРёР»СЊРЅРѕРј СЂРёС‚РјРµ СЂР°Р·Р±РѕСЂР° РІРµС‚РѕРє Рё merge РІ `main`. Р‘СЂРёС„ С„РёРєСЃРёСЂСѓРµС‚, С‡С‚Рѕ СЂРµС‡СЊ РЅРµ РѕР± Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРѕРј merge РїРѕ СЂР°СЃРїРёСЃР°РЅРёСЋ, Р° Рѕ СЂСѓС‡РЅРѕРј СЂР°Р·Р±РѕСЂРµ РіРѕС‚РѕРІС‹С… РІРµС‚РѕРє С‡РµСЂРµР· GitHub Desktop.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** `index.html` РЅРµ РјРµРЅСЏР»СЃСЏ, РЁР°Рі 0 РЅРµ С‚СЂРµР±РѕРІР°Р»СЃСЏ.

**РўРµСЃС‚:** РџСЂРѕРІРµСЂРµРЅ С‚РµРєСѓС‰РёР№ checkout: СЂР°Р±РѕС‡РµРµ РґРµСЂРµРІРѕ Р±С‹Р»Рѕ С‡РёСЃС‚С‹Рј РїРµСЂРµРґ РїСЂР°РІРєРѕР№, С‚РµРєСѓС‰Р°СЏ РІРµС‚РєР° `docs/git-branch-protocol`. РџСЂР°РІРёР»Рѕ РЅРµ РІРЅРµСЃРµРЅРѕ РІ roadmap / AGENTS.md РґРѕ РѕС‚РІРµС‚Р° Claude Р®СЂС‹ Рё СЂРµС€РµРЅРёСЏ РђР»РµРєСЃРµСЏ.

**РљРѕРјРјРёС‚:** N/A.

**РЎС‚Р°С‚СѓСЃ:** РІС‹РїРѕР»РЅРµРЅРѕ РєР°Рє РїРѕРґРіРѕС‚РѕРІРєР° Рє РѕР±СЃСѓР¶РґРµРЅРёСЋ. РЎР»РµРґСѓСЋС‰РёР№ С€Р°Рі вЂ” РђР»РµРєСЃРµР№ РїРµСЂРµРґР°С‘С‚ Р±СЂРёС„ Р®СЂРµ/Claude Рё РїРѕСЃР»Рµ РѕС‚РІРµС‚Р° СѓС‚РІРµСЂР¶РґР°РµС‚ С„РёРЅР°Р»СЊРЅС‹Р№ РІР°СЂРёР°РЅС‚ РїСЂР°РІРёР»Р°.

---

## 2026-06-28 вЂ” BACK-021: MediaRecorder voice input + Whisper (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** Р’ `index.html` РіРѕР»РѕСЃРѕРІРѕР№ РІРІРѕРґ РїРµСЂРµРІРµРґС‘РЅ РЅР° `MediaRecorder`: РїСЂРёР»РѕР¶РµРЅРёРµ Р·Р°РїСЂР°С€РёРІР°РµС‚ РјРёРєСЂРѕС„РѕРЅ С‡РµСЂРµР· `getUserMedia`, Р·Р°РїРёСЃС‹РІР°РµС‚ РґРѕ 10 СЃРµРєСѓРЅРґ, РѕС‚РїСЂР°РІР»СЏРµС‚ audio blob РЅР° Worker `/transcribe` РєР°Рє multipart `audio`, РїРѕР»СѓС‡Р°РµС‚ С‚РµРєСЃС‚ Рё РїРµСЂРµРґР°С‘С‚ РµРіРѕ РІ `ask-field` / `sendAsk()`. `SpeechRecognition` РѕСЃС‚Р°РІР»РµРЅ fallback, РµСЃР»Рё MediaRecorder РЅРµРґРѕСЃС‚СѓРїРµРЅ. Р’ `4e-worker` commit `339b301` РґРѕР±Р°РІРёР» endpoint `POST /transcribe`: РїСЂРѕРІРµСЂРєР° `x-token`, С‡С‚РµРЅРёРµ multipart, РІС‹Р·РѕРІ OpenAI Whisper `whisper-1` С‡РµСЂРµР· `OPENAI_KEY`, РѕС‚РІРµС‚ `{ text }`.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** РЁР°Рі 0 РґРѕ: `index.html CYRILLIC_BEFORE=20210`. РџРѕСЃР»Рµ РїСЂР°РІРєРё: `index.html CYRILLIC_AFTER=20324`; СЂРѕСЃС‚ РѕР¶РёРґР°РµРјС‹Р№ РёР·-Р·Р° РЅРѕРІС‹С… СЃРѕРѕР±С‰РµРЅРёР№ MediaRecorder/Whisper flow.

**РўРµСЃС‚:** inline JS syntax check РґР»СЏ `index.html`; app `git diff --check`; worker `node --check worker.js`; worker `git diff --check`; `wrangler deploy --dry-run --no-bundle --config wrangler.toml`.

**РљРѕРјРјРёС‚:** app `feat(voice): add MediaRecorder voice input`; worker `339b301 feat(voice): add Whisper transcription endpoint`

**РЎС‚Р°С‚СѓСЃ:** Ready for QA вЂ” РїРµСЂРµРґ live smoke РЅСѓР¶РЅРѕ РґРѕР±Р°РІРёС‚СЊ Worker secret `OPENAI_KEY`, Р·Р°РґРµРїР»РѕРёС‚СЊ Worker/app Рё РїСЂРѕРІРµСЂРёС‚СЊ РіРѕР»РѕСЃРѕРІРѕР№ РІРІРѕРґ РЅР° iPhone Telegram WKWebView Рё Android.

---

## 2026-06-28 вЂ” BACK-020: email verification in profile (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** Р’ `index.html` email РІ СЂР°СЃС€РёСЂРµРЅРЅРѕРј РїСЂРѕС„РёР»Рµ С‚РµРїРµСЂСЊ РїРѕРґС‚РІРµСЂР¶РґР°РµС‚СЃСЏ С‡РµСЂРµР· РєРЅРѕРїРєСѓ `РџРѕРґС‚РІРµСЂРґРёС‚СЊ`: app Р·Р°РїСЂР°С€РёРІР°РµС‚ РїРёСЃСЊРјРѕ Сѓ Worker, РѕР±СЂР°Р±Р°С‚С‹РІР°РµС‚ `?verify_email=TOKEN`, РІС‹Р·С‹РІР°РµС‚ `/auth/verify-email`, РѕР±РЅРѕРІР»СЏРµС‚ `currentUser.emailVerified` Рё РїРѕРєР°Р·С‹РІР°РµС‚ СЃС‚Р°С‚СѓСЃ `РџРѕРґС‚РІРµСЂР¶РґС‘РЅ вњ…`. Р’ `4e-worker` commit `e815266` РґРѕР±Р°РІРёР» endpoints `/auth/request-email-verification` Рё `/auth/verify-email`, РѕС‚РїСЂР°РІРєСѓ Resend РѕС‚ `noreply@4-ai.site`, D1 С‚Р°Р±Р»РёС†Сѓ `app_email_verifications` СЃ KV fallback Рё РїСЂРѕРІРµСЂРєСѓ РєРѕРЅС„Р»РёРєС‚Р° `Р­С‚РѕС‚ email СѓР¶Рµ РёСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ`.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** РЁР°Рі 0 РґРѕ: `index.html CYRILLIC_BEFORE=19940`. РџРѕСЃР»Рµ РїСЂР°РІРєРё: `index.html CYRILLIC_AFTER=20194`; СЂРѕСЃС‚ РѕР¶РёРґР°РµРјС‹Р№ РёР·-Р·Р° РЅРѕРІС‹С… СЂСѓСЃСЃРєРёС… СЃРѕРѕР±С‰РµРЅРёР№ email verification flow.

**РўРµСЃС‚:** inline JS syntax check РґР»СЏ `index.html`; `npm run build:css`; `Portable path check passed`; app `git diff --check`; worker `node --check worker.js`; worker `git diff --check`; `wrangler deploy --dry-run --no-bundle --config wrangler.toml` СЃРѕР±СЂР°Р» Worker Рё attached module `migrations/0004_email_verifications.sql`. Live smoke РЅРµ РІС‹РїРѕР»РЅСЏР»СЃСЏ: РЅСѓР¶РµРЅ merge/deploy worker Рё РїСЂРёРјРµРЅРµРЅРёРµ D1 migration.

**РљРѕРјРјРёС‚:** app `feat(auth): add profile email verification`; worker `e815266 feat(auth): add email verification flow`

**РЎС‚Р°С‚СѓСЃ:** Ready for QA вЂ” РїРѕСЃР»Рµ merge/deploy РїСЂРёРјРµРЅРёС‚СЊ D1 migration `0004_email_verifications.sql`, Р·Р°РїСЂРѕСЃРёС‚СЊ РїРёСЃСЊРјРѕ РёР· РїСЂРѕС„РёР»СЏ, РѕС‚РєСЂС‹С‚СЊ СЃСЃС‹Р»РєСѓ `?verify_email=TOKEN` РІ Р·Р°Р»РѕРіРёРЅРµРЅРЅРѕРј Telegram-Р°РєРєР°СѓРЅС‚Рµ Рё РїСЂРѕРІРµСЂРёС‚СЊ РєРѕРЅС„Р»РёРєС‚ СѓР¶Рµ Р·Р°РЅСЏС‚РѕРіРѕ email.

## 2026-06-28 вЂ” BACK-017: live notification settings (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** Р’ `index.html` СЌРєСЂР°РЅ `notif-settings` РѕС‡РёС‰РµРЅ РѕС‚ Р»РёС€РЅРёС… С‚РёРїРѕРІ (`Р¤Р°Р№Р»С‹ Рё РґРѕРєСѓРјРµРЅС‚С‹`, `РЎРёСЃС‚РµРјР° Рё Р±РµР·РѕРїР°СЃРЅРѕСЃС‚СЊ`, `РњР°СЂРєРµС‚РёРЅРі Рё РЅРѕРІРѕСЃС‚Рё`) Рё РѕСЃС‚Р°РІР»СЏРµС‚ СЂР°Р±РѕС‡РёРµ РєР°РЅР°Р»С‹ Push, Email, Telegram, Р·Р°РґР°С‡Рё/РЅР°РїРѕРјРёРЅР°РЅРёСЏ. Р”РѕР±Р°РІР»РµРЅС‹ `РЈС‚СЂРµРЅРЅРёР№ Р±СЂРёС„РёРЅРі` СЃ time picker default `09:00` Рё `РџСЂРѕСЃСЂРѕС‡РµРЅРЅС‹Рµ Р·Р°РґР°С‡Рё`. РќР°СЃС‚СЂРѕР№РєРё СЃРѕС…СЂР°РЅСЏСЋС‚СЃСЏ РІ localStorage Рё СЃРёРЅС…СЂРѕРЅРёР·РёСЂСѓСЋС‚СЃСЏ С‡РµСЂРµР· `/notifications/settings`. Р’ `4e-worker` commit `b3aa1d6` РґРѕР±Р°РІРёР» D1 С‚Р°Р±Р»РёС†Сѓ `app_notification_settings`, API GET/PUT, `/briefings/check`, С„РёР»СЊС‚СЂР°С†РёСЋ РїСЂРѕСЃСЂРѕС‡РµРЅРЅС‹С… Р·Р°РґР°С‡ РїРѕ РЅР°СЃС‚СЂРѕР№РєР°Рј Рё bot scheduler `checkBriefings`.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** РЁР°Рі 0 РґРѕ: `index.html CYRILLIC_BEFORE=19953`. РџРѕСЃР»Рµ РїСЂР°РІРєРё: `index.html CYRILLIC_AFTER=19940`; СЃРЅРёР¶РµРЅРёРµ РѕР¶РёРґР°РµРјРѕРµ, РїРѕС‚РѕРјСѓ С‡С‚Рѕ СѓРґР°Р»РµРЅС‹ С‚СЂРё СЃС‚Р°СЂС‹С… СЂСѓСЃСЃРєРёС… РїСѓРЅРєС‚Р° СѓРІРµРґРѕРјР»РµРЅРёР№.

**РўРµСЃС‚:** app inline JS syntax check; `npm run build:css`; `git diff --check`; `Portable path check passed`; worker `node --check worker.js`; `node --check src/bot/reminders.js`; `node --check src/bot/index.js`; `wrangler deploy --dry-run --no-bundle --config wrangler.toml`.

**РљРѕРјРјРёС‚:** app `feat(notifications): add live notification settings`; worker `b3aa1d6 feat(notifications): add live notification settings`

**РЎС‚Р°С‚СѓСЃ:** Ready for QA вЂ” РїРµСЂРµРґ live smoke РЅСѓР¶РЅРѕ РїСЂРёРјРµРЅРёС‚СЊ D1 migration `0003_notification_settings.sql` Рё Р·Р°РґРµРїР»РѕРёС‚СЊ worker/bot.

---

## 2026-06-28 вЂ” BACK-016: extended user profile (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** Р’ `index.html` СЌРєСЂР°РЅ РїСЂРѕС„РёР»СЏ СЂР°СЃС€РёСЂРµРЅ РєР°СЂС‚РѕС‡РєРѕР№ `sub-card`: С„РѕС‚Рѕ РїСЂРѕС„РёР»СЏ СЃ РєРЅРѕРїРєРѕР№ `РР·РјРµРЅРёС‚СЊ С„РѕС‚Рѕ` Рё Р»РѕРєР°Р»СЊРЅС‹Рј preview/R2 placeholder, СЂРµРґР°РєС‚РёСЂСѓРµРјРѕРµ РёРјСЏ, readonly ID, С‚РµР»РµС„РѕРЅ Рё email СЃ UI-СЃС‚Р°С‚СѓСЃРѕРј РїРѕРґС‚РІРµСЂР¶РґРµРЅРёСЏ, РїСЂРёРІСЏР·РєР° Telegram, textarea `Рћ СЃРµР±Рµ` РґРѕ 200 СЃРёРјРІРѕР»РѕРІ СЃРѕ СЃС‡С‘С‚С‡РёРєРѕРј Рё date picker РґР°С‚С‹ СЂРѕР¶РґРµРЅРёСЏ. РЎС‚РёР»Рё РґРѕР±Р°РІР»РµРЅС‹ РІ `styles/screens/profile.less`; РґР°РЅРЅС‹Рµ С„РѕСЂРјС‹ СЃРѕС…СЂР°РЅСЏСЋС‚СЃСЏ Р»РѕРєР°Р»СЊРЅРѕ РґРѕ РїРѕСЏРІР»РµРЅРёСЏ backend/R2 profile API.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** РЁР°Рі 0 РґРѕ: `index.html CYRILLIC_BEFORE=19707`. РџРѕСЃР»Рµ РїСЂР°РІРєРё: `index.html CYRILLIC_AFTER=19953`; СЂРѕСЃС‚ РѕР¶РёРґР°РµРјС‹Р№ РёР·-Р·Р° РЅРѕРІС‹С… СЂСѓСЃСЃРєРёС… РїРѕРґРїРёСЃРµР№ РїСЂРѕС„РёР»СЏ.

**РўРµСЃС‚:** inline JS syntax check РґР»СЏ `index.html`; `npm run build:css`; `git diff --check`; `Portable path check passed`.

**РљРѕРјРјРёС‚:** `feat(profile): add extended user profile fields`

**РЎС‚Р°С‚СѓСЃ:** Ready for QA вЂ” РЅСѓР¶РµРЅ РІРёР·СѓР°Р»СЊРЅС‹Р№ smoke РїСЂРѕС„РёР»СЏ Рё РїРѕСЃР»РµРґСѓСЋС‰Р°СЏ backend-Р·Р°РґР°С‡Р° РґР»СЏ R2/profile API.

---

## 2026-06-28 вЂ” BACK-010: Telegram Stars subscription flow (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** Р’ `index.html` payment flow С‚РµРїРµСЂСЊ РІС‹Р±РёСЂР°РµС‚ Telegram Stars РІРЅСѓС‚СЂРё Telegram Mini App: РєРЅРѕРїРєР° РѕРїР»Р°С‚С‹ РїРѕРєР°Р·С‹РІР°РµС‚ СЃСѓРјРјСѓ РІ Stars, Р·Р°РїСЂР°С€РёРІР°РµС‚ invoice Сѓ Worker Рё РѕС‚РєСЂС‹РІР°РµС‚ `Telegram.WebApp.openInvoice`. Р’ `4e-worker` commit `d57771c` РґРѕР±Р°РІРёР» endpoint `/payments/telegram-stars/invoice`, СЃРѕР·РґР°РЅРёРµ `createInvoiceLink` СЃ РІР°Р»СЋС‚РѕР№ `XTR`, РѕР±СЂР°Р±РѕС‚С‡РёРє `/payments/telegram-stars/complete` Рё bot-side РѕР±СЂР°Р±РѕС‚РєСѓ `pre_checkout_query` / `successful_payment`, С‡С‚РѕР±С‹ Premium Р°РєС‚РёРІРёСЂРѕРІР°Р»СЃСЏ РїРѕ СЂРµР°Р»СЊРЅРѕРјСѓ СЃРѕР±С‹С‚РёСЋ Telegram.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** РЁР°Рі 0 РґРѕ: `index.html CYRILLIC_BEFORE=19509`. РџРѕСЃР»Рµ РїСЂР°РІРєРё: `index.html CYRILLIC_AFTER=19707`; СЂРѕСЃС‚ РѕР¶РёРґР°РµРјС‹Р№ РёР·-Р·Р° РЅРѕРІС‹С… СЂСѓСЃСЃРєРёС… СЃРѕРѕР±С‰РµРЅРёР№ Telegram Stars.

**РўРµСЃС‚:** `node --check worker.js`; `node --check src/bot/handler.js`; `wrangler deploy --dry-run --no-bundle --config wrangler.toml`; inline JS syntax check РґР»СЏ `index.html`; `npm run build:css`; `git diff --check`. Live Telegram Stars smoke РЅРµ РІС‹РїРѕР»РЅСЏР»СЃСЏ Р»РѕРєР°Р»СЊРЅРѕ, РїРѕС‚РѕРјСѓ С‡С‚Рѕ РЅСѓР¶РµРЅ Р·Р°РїСѓСЃРє РІРЅСѓС‚СЂРё Telegram Mini App СЃ Р°РєС‚РёРІРЅС‹Рј bot/Worker РѕРєСЂСѓР¶РµРЅРёРµРј.

**РљРѕРјРјРёС‚:** app `feat(payments): add Telegram Stars payment entrypoint`; worker `d57771c feat(payments): add Telegram Stars subscription flow`

**РЎС‚Р°С‚СѓСЃ:** Ready for QA вЂ” РЅСѓР¶РµРЅ live smoke РІ Telegram РїРѕСЃР»Рµ merge/deploy.

---

## 2026-06-28 вЂ” Р¤Р°Р·Р° 11: РѕС‚РЅРѕСЃРёС‚РµР»СЊРЅС‹Рµ РґР°С‚С‹ РІ РєР°СЂС‚РѕС‡РєР°С… Р·Р°РґР°С‡ (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** Р’ `index.html` РґРѕР±Р°РІР»РµРЅ РѕР±С‰РёР№ formatter РѕС‚РЅРѕСЃРёС‚РµР»СЊРЅС‹С… РґР°С‚ РґР»СЏ РєР°СЂС‚РѕС‡РµРє Р·Р°РґР°С‡. Р”РµРґР»Р°Р№РЅС‹ С‚РµРїРµСЂСЊ РїРѕРєР°Р·С‹РІР°СЋС‚СЃСЏ РєР°Рє `СЃРµРіРѕРґРЅСЏ`, `Р·Р°РІС‚СЂР°`, `С‡РµСЂРµР· N РґРЅРµР№` РёР»Рё `РїСЂРѕСЃСЂРѕС‡РµРЅРѕ РЅР° N РґРЅРµР№`; РѕР±С‹С‡РЅС‹Рµ РґР°С‚С‹ Р·Р°РґР°С‡ РїРѕРєР°Р·С‹РІР°СЋС‚СЃСЏ РєР°Рє `СЃРµРіРѕРґРЅСЏ`, `РІС‡РµСЂР°`, `N РґРЅРµР№ РЅР°Р·Р°Рґ` РёР»Рё Р±СѓРґСѓС‰РёР№ РѕС‚РЅРѕСЃРёС‚РµР»СЊРЅС‹Р№ СЃСЂРѕРє. Р¤РѕСЂРјР°С‚С‚РµСЂ РїРѕРґРєР»СЋС‡С‘РЅ Рє РѕСЃРЅРѕРІРЅРѕРјСѓ СЃРїРёСЃРєСѓ Р·Р°РґР°С‡, РјРµСЃСЏС‡РЅРѕРјСѓ С„РёР»СЊС‚СЂСѓ, СЂР°СЃРєСЂС‹С‚РёСЋ РІСЃРµС… Р·Р°РґР°С‡, home-С„РёР»СЊС‚СЂР°Рј Рё СЃРїРёСЃРєР°Рј РІС‹РїРѕР»РЅРµРЅРЅС‹С… Р·Р°РґР°С‡/РѕР±РµС‰Р°РЅРёР№.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** РЁР°Рі 0 РґРѕ: `index.html CYRILLIC_BEFORE=19355`. РџРѕСЃР»Рµ РїСЂР°РІРєРё: `index.html CYRILLIC_AFTER=19509`; СЂРѕСЃС‚ РѕР¶РёРґР°РµРјС‹Р№ РёР·-Р·Р° РЅРѕРІС‹С… СЂСѓСЃСЃРєРёС… РїРѕРґРїРёСЃРµР№ РѕС‚РЅРѕСЃРёС‚РµР»СЊРЅС‹С… РґР°С‚.

**РўРµСЃС‚:** inline JS syntax check, unit smoke formatter cases С‡РµСЂРµР· Node, `npm run build:css`, `git diff --check`.

**РљРѕРјРјРёС‚:** `feat(tasks): show relative dates in task cards`

**РЎС‚Р°С‚СѓСЃ:** РІС‹РїРѕР»РЅРµРЅРѕ вЂ” Р¤Р°Р·Р° 11 Р·Р°РєСЂС‹С‚Р°.

---

## 2026-06-28 вЂ” BACK-009: VK Pay subscription flow (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** Р’ `index.html` payment flow С‚РµРїРµСЂСЊ РІС‹Р±РёСЂР°РµС‚ VK Pay РІРЅСѓС‚СЂРё VK Mini App: РєРЅРѕРїРєР° РѕРїР»Р°С‚С‹ РјРµРЅСЏРµС‚ РїРѕРґРїРёСЃСЊ РЅР° `РћРїР»Р°С‚РёС‚СЊ С‡РµСЂРµР· VK Pay`, СЃРєСЂС‹РІР°РµС‚ card badges Рё РІС‹Р·С‹РІР°РµС‚ `VKWebAppShowOrderBox`; РІРЅРµ VK СЃРѕС…СЂР°РЅСЏРµС‚СЃСЏ CloudPayments. Р’ `vk.html` Р·Р°РіР»СѓС€РєР° `РћРїР»Р°С‚Р° СЃРєРѕСЂРѕ Р±СѓРґРµС‚ РґРѕСЃС‚СѓРїРЅР°` Р·Р°РјРµРЅРµРЅР° РЅР° РєРЅРѕРїРєСѓ `РљСѓРїРёС‚СЊ РїР»Р°РЅ`, РєРѕС‚РѕСЂР°СЏ РѕС‚РєСЂС‹РІР°РµС‚ `VKWebAppShowOrderBox` Рё РѕР±РЅРѕРІР»СЏРµС‚ Premium UI РїРѕСЃР»Рµ СѓСЃРїРµС€РЅРѕРіРѕ bridge-РѕС‚РІРµС‚Р°.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** РЁР°Рі 0 РґРѕ: `index.html CYRILLIC_BEFORE=19182`, `vk.html CYRILLIC_BEFORE=3273`. РџРѕСЃР»Рµ РїСЂР°РІРєРё: `index.html CYRILLIC_AFTER=19355`, `vk.html CYRILLIC_AFTER=3364`; СЂРѕСЃС‚ РѕР¶РёРґР°РµРјС‹Р№ РёР·-Р·Р° РЅРѕРІС‹С… СЂСѓСЃСЃРєРёС… СЃРѕРѕР±С‰РµРЅРёР№ VK Pay.

**РўРµСЃС‚:** inline JS syntax check РґР»СЏ `index.html`/`vk.html`; `npm run build:css`; `git diff --check`. Live VK Pay smoke РЅРµ РІС‹РїРѕР»РЅСЏР»СЃСЏ Р»РѕРєР°Р»СЊРЅРѕ, РїРѕС‚РѕРјСѓ С‡С‚Рѕ РЅСѓР¶РµРЅ Р·Р°РїСѓСЃРє РІРЅСѓС‚СЂРё VK Mini App/payment РѕРєСЂСѓР¶РµРЅРёСЏ.

**РљРѕРјРјРёС‚:** `feat(payments): add VK Pay subscription flow`

**РЎС‚Р°С‚СѓСЃ:** РіРѕС‚РѕРІРѕ Рє live QA РІ VK Mini App.

---
## 2026-06-27 вЂ” BACK-014: PostgreSQL prep without production credentials (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** Р’ `4e-worker/worker.js` РґРѕР±Р°РІР»РµРЅ РїРѕРґРіРѕС‚РѕРІРёС‚РµР»СЊРЅС‹Р№ PostgreSQL storage adapter РґР»СЏ `app_sessions` Рё `app_task_lists`. Adapter С‡РёС‚Р°РµС‚ Р±СѓРґСѓС‰РёРµ env `POSTGRES_URL`/`POSTGRES_TOKEN`, РЅРѕ production-РїРѕРІРµРґРµРЅРёРµ РЅРµ РјРµРЅСЏРµС‚: Р±РµР· `POSTGRES_URL` Worker РїСЂРѕРґРѕР»Р¶Р°РµС‚ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ D1/KV. Р”РѕР±Р°РІР»РµРЅ Р±СѓРґСѓС‰РёР№ DDL `migrations/postgres_app_state.sql` РґР»СЏ СЂСѓС‡РЅРѕРіРѕ РїСЂРёРјРµРЅРµРЅРёСЏ РІ Yandex Cloud PostgreSQL РІРѕ РІСЂРµРјСЏ BACK-008.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** `index.html` РЅРµ РјРµРЅСЏР»СЃСЏ, РЁР°Рі 0 РЅРµ С‚СЂРµР±РѕРІР°Р»СЃСЏ.

**РўРµСЃС‚:** `node --check worker.js`; `wrangler deploy --dry-run --no-bundle --config wrangler.toml`; `git diff --check`; РїРѕСЃР»Рµ merge Р»РѕРєР°Р»СЊРЅС‹Р№ `4e-worker/main` fast-forward РґРѕ `a97d768`, worker СЃРѕРґРµСЂР¶РёС‚ `POSTGRES_URL` Рё `migrations/postgres_app_state.sql`.

**РљРѕРјРјРёС‚:** `37f9dda` (`feat(worker): prepare PostgreSQL storage adapter`), merged as `a97d768`.

**РЎС‚Р°С‚СѓСЃ:** РІС‹РїРѕР»РЅРµРЅРѕ. Р¤Р°РєС‚РёС‡РµСЃРєРёР№ РїРµСЂРµРЅРѕСЃ РџР” РѕСЃС‚Р°С‘С‚СЃСЏ РІ BACK-008 Рё Р¶РґС‘С‚ Yandex Cloud credentials РѕС‚ РђР»РµРєСЃРµСЏ.

---
## 2026-06-27 вЂ” BACK-013: semantic HTML landmarks and aria labels (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** Р’ `index.html` РґРѕР±Р°РІР»РµРЅС‹ СЃРµРјР°РЅС‚РёС‡РµСЃРєРёРµ landmark-С‚РµРіРё Р±РµР· РёР·РјРµРЅРµРЅРёСЏ РєР»Р°СЃСЃРѕРІ Рё id: РєРѕСЂРЅРµРІРѕР№ app-РєРѕРЅС‚РµР№РЅРµСЂ СЃС‚Р°Р» `<main id="app">`, РЅРёР¶РЅРёРµ РЅР°РІРёРіР°С†РёРё `bottom-nav-v2` Рё `global-nav` СЃС‚Р°Р»Рё `<nav>` СЃ `aria-label`, РІРµСЂС…РЅСЏСЏ РѕР±Р»Р°СЃС‚СЊ РіР»Р°РІРЅРѕРіРѕ СЌРєСЂР°РЅР° Рё С€Р°РїРєР° voice-СЌРєСЂР°РЅР° СЃС‚Р°Р»Рё `<header>`. Р”Р»СЏ РёРєРѕРЅРѕС‡РЅРѕР№ РЅР°РІРёРіР°С†РёРё Рё РєР»РёРєР°Р±РµР»СЊРЅС‹С… `div` РґРѕР±Р°РІР»РµРЅС‹ `aria-label`, `role="button"` Рё `tabindex="0"`; РґР»СЏ back-РєРЅРѕРїРѕРє РґРѕР±Р°РІР»РµРЅ `aria-label="РќР°Р·Р°Рґ"`.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** РЁР°Рі 0 РґРѕ: `CYRILLIC_BEFORE=18793`. РџРѕСЃР»Рµ РїСЂР°РІРєРё: `CYRILLIC_AFTER=19182`; СЂРѕСЃС‚ РѕР¶РёРґР°РµРјС‹Р№, РїРѕС‚РѕРјСѓ С‡С‚Рѕ РґРѕР±Р°РІР»РµРЅС‹ СЂСѓСЃСЃРєРёРµ `aria-label`.

**РўРµСЃС‚:** `npm run build:css`; РїСЂРѕРІРµСЂРµРЅ Р±Р°Р»Р°РЅСЃ semantic-С‚РµРіРѕРІ (`main/nav/header` open=close); `git diff --check` Р±РµР· РѕС€РёР±РѕРє; РІСЂСѓС‡РЅСѓСЋ РїСЂРѕРІРµСЂРµРЅС‹ РєСЂРёС‚РёС‡РЅС‹Рµ Р·Р°РєСЂС‹РІР°СЋС‰РёРµ С‚РµРіРё home nav, task detail action bar Рё global nav.

**РљРѕРјРјРёС‚:** `refactor(ui): add semantic HTML landmarks`

**РЎС‚Р°С‚СѓСЃ:** РІС‹РїРѕР»РЅРµРЅРѕ.

---
## 2026-06-27 вЂ” РЎС‚Р°С‚СѓСЃ РѕС‚ Р®СЂС‹ СЃРёРЅС…СЂРѕРЅРёР·РёСЂРѕРІР°РЅ СЃ roadmap/backlog (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:**
- Р—Р°С„РёРєСЃРёСЂРѕРІР°РЅРѕ, С‡С‚Рѕ Р·Р°РєСЂС‹С‚С‹ BACK-001, BACK-002, BACK-003, BACK-004, BACK-005, BACK-006, BACK-012 Рё Resend-РґРѕРјРµРЅ `4-ai.site`.
- `shared/ROADMAP.md` РѕСЃС‚Р°РІР»РµРЅ РµРґРёРЅС‹Рј СЃС‚СЂР°С‚РµРіРёС‡РµСЃРєРёРј С„Р°Р№Р»РѕРј; Р РљРќ Рё Yandex Cloud PostgreSQL РѕС‚РјРµС‡РµРЅС‹ РєР°Рє СЂСѓС‡РЅС‹Рµ РґРµР№СЃС‚РІРёСЏ РђР»РµРєСЃРµСЏ.
| 3 | РџРѕРґРіРѕС‚РѕРІРєР° РєРѕРґР° РїРѕРґ PostgreSQL Р·Р°СЂР°РЅРµРµ вЂ” РјРѕР¶РЅРѕ Р±СЂР°С‚СЊ Codex Р±РµР· credentials | СЃСЂРµРґРЅРёР№ |
- РљРѕРЅРєСЂРµС‚РЅС‹Рµ С†РµРЅС‹ СѓР±СЂР°РЅС‹ РёР· roadmap Рё РІС‹РЅРµСЃРµРЅС‹ РІ РѕС‚РґРµР»СЊРЅРѕРµ СЂРµС€РµРЅРёРµ РїРѕ РјРѕРЅРµС‚РёР·Р°С†РёРё.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** `index.html` РЅРµ РјРµРЅСЏР»СЃСЏ, РЁР°Рі 0 РЅРµ С‚СЂРµР±РѕРІР°Р»СЃСЏ.

**РўРµСЃС‚:** СЂСѓС‡РЅР°СЏ СЃРІРµСЂРєР° `shared/ROADMAP.md` Рё `pm/backlog.md` СЃРѕ СЃС‚Р°С‚СѓСЃРѕРј РѕС‚ Р®СЂС‹; `git diff --check`; `bash scripts/check-portable-paths.sh`.

**РљРѕРјРјРёС‚:** N/A вЂ” РєРѕРјРјРёС‚/РїСѓС€ РІС‹РїРѕР»РЅСЏСЋС‚СЃСЏ РѕС‚РґРµР»СЊРЅРѕ.

**РЎС‚Р°С‚СѓСЃ:** РІС‹РїРѕР»РЅРµРЅРѕ.

---

## 2026-06-27 вЂ” Р•РґРёРЅС‹Р№ roadmap-С„Р°Р№Р» (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:**
- `pm/roadmap.md` РѕР±СЉРµРґРёРЅС‘РЅ СЃ `shared/ROADMAP.md` Рё СѓРґР°Р»С‘РЅ, С‡С‚РѕР±С‹ РІ РїСЂРѕРµРєС‚Рµ РѕСЃС‚Р°Р»СЃСЏ РѕРґРёРЅ РёСЃС‚РѕС‡РЅРёРє РґРѕСЂРѕР¶РЅРѕР№ РєР°СЂС‚С‹.
- Р’ `shared/ROADMAP.md` РїРµСЂРµРЅРµСЃРµРЅС‹ СЂР°Р±РѕС‡РёРµ PM-СЃРµРєС†РёРё Now / Next / Later, СЃС‚СЂР°С‚РµРіРёС‡РµСЃРєРёРµ РіРѕСЂРёР·РѕРЅС‚С‹ 2/3, РїСЂРёРЅС†РёРїС‹ СЂР°Р·РІРёС‚РёСЏ, С†РµРЅРѕРІС‹Рµ РѕСЂРёРµРЅС‚РёСЂС‹ Рё РїСЂР°РІРёР»Рѕ РЅРµ СЃРѕР·РґР°РІР°С‚СЊ РІС‚РѕСЂРѕР№ roadmap.
- РћР±РЅРѕРІР»РµРЅС‹ СЃСЃС‹Р»РєРё Рё РЅР°РІРёРіР°С†РёСЏ РІ `pm/backlog.md`, `FILE_MAP.md`, `CLAUDE.md`, `COWORK_INSTRUCTIONS.md`, `AGENTS.md`.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** `index.html` РЅРµ РјРµРЅСЏР»СЃСЏ, РЁР°Рі 0 РЅРµ С‚СЂРµР±РѕРІР°Р»СЃСЏ.

**РўРµСЃС‚:** `rg -n "shared/ROADMAP|pm/roadmap|ROADMAP.md|roadmap.md|РґРѕСЂРѕР¶РЅ|roadmap"` РґР»СЏ РїРѕРёСЃРєР° СЃСЃС‹Р»РѕРє; `git diff --check`; `bash scripts/check-portable-paths.sh`.

**РљРѕРјРјРёС‚:** N/A вЂ” РєРѕРјРјРёС‚/РїСѓС€ РЅРµ РІС‹РїРѕР»РЅСЏР»СЃСЏ.

**РЎС‚Р°С‚СѓСЃ:** РІС‹РїРѕР»РЅРµРЅРѕ вЂ” РµРґРёРЅСЃС‚РІРµРЅРЅС‹Р№ Р°РєС‚СѓР°Р»СЊРЅС‹Р№ roadmap С‚РµРїРµСЂСЊ `shared/ROADMAP.md`.

---

## 2026-06-27 вЂ” BACK-012: CSS architecture LESS + BEM + minification (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** Inline CSS РёР· `index.html` РІС‹РЅРµСЃРµРЅ РІ LESS-СЃС‚СЂСѓРєС‚СѓСЂСѓ: `styles/main.less`, `styles/variables.less`, `styles/layout.less`, `styles/screens/home.less`, `styles/screens/profile.less`, `styles/screens/tasks.less`, `styles/screens/voice.less`. Р’ `package.json` РґРѕР±Р°РІР»РµРЅС‹ СЃРєСЂРёРїС‚С‹ `build:css` Рё `watch:css`, dev-Р·Р°РІРёСЃРёРјРѕСЃС‚Рё `less` Рё `clean-css-cli`. `index.html` С‚РµРїРµСЂСЊ РїРѕРґРєР»СЋС‡Р°РµС‚ `styles.min.css` РІРјРµСЃС‚Рѕ inline `<style>`.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** `index.html` РёР·РјРµРЅС‘РЅ С‡РµСЂРµР· `[System.IO.File]::ReadAllText/WriteAllText` СЃ UTF-8 Р±РµР· BOM; РєРёСЂРёР»Р»РёС†Р° РЅРµ СЂРµРґР°РєС‚РёСЂРѕРІР°Р»Р°СЃСЊ РІСЂСѓС‡РЅСѓСЋ С‡РµСЂРµР· `Set-Content`/`Out-File`.

**РўРµСЃС‚:** `npm install --save-dev less clean-css-cli`; `npm run build:css`; `rg -n "<style|</style>|styles\.min\.css|styles\.css" index.html` РїРѕРґС‚РІРµСЂРґРёР» РѕС‚СЃСѓС‚СЃС‚РІРёРµ inline CSS Рё РїРѕРґРєР»СЋС‡РµРЅРёРµ `styles.min.css`. CSS РґРѕ/РїРѕСЃР»Рµ СЃСЂР°РІРЅРµРЅ С‡РµСЂРµР· СЃР±РѕСЂРєСѓ Рё РјРёРЅРёС„РёРєР°С†РёСЋ: РѕС‚Р»РёС‡РёСЏ С‚РѕР»СЊРєРѕ С„РѕСЂРјР°С‚РЅС‹Рµ РґР»СЏ custom properties (`rgba(...)` СЃ РїСЂРѕР±РµР»Р°РјРё), РІРёР·СѓР°Р»СЊРЅС‹Рµ Р·РЅР°С‡РµРЅРёСЏ СЃРѕС…СЂР°РЅРµРЅС‹.

**РљРѕРјРјРёС‚:** `refactor(css): migrate to LESS + BEM architecture`

**РЎС‚Р°С‚СѓСЃ:** РІС‹РїРѕР»РЅРµРЅРѕ.

---
## 2026-06-27 вЂ” BACK-008: Yandex Cloud PostgreSQL migration blocked (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** РЎРµСЃСЃРёСЏ РѕСЃС‚Р°РЅРѕРІР»РµРЅР° РґРѕ РєРѕРґРѕРІС‹С… РёР·РјРµРЅРµРЅРёР№. BACK-006 KVв†’D1 РїРѕРґС‚РІРµСЂР¶РґС‘РЅ РєР°Рє Done; BACK-008 РЅРµ РјРѕР¶РµС‚ Р±С‹С‚СЊ РЅР°С‡Р°С‚, РїРѕС‚РѕРјСѓ С‡С‚Рѕ Yandex Cloud PostgreSQL cluster РµС‰С‘ РЅРµ СЃРѕР·РґР°РЅ, credentials Рё connection settings РѕС‚СЃСѓС‚СЃС‚РІСѓСЋС‚.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** `index.html` РЅРµ РјРµРЅСЏР»СЃСЏ, РЁР°Рі 0 РЅРµ С‚СЂРµР±РѕРІР°Р»СЃСЏ.

**РўРµСЃС‚:** РљРѕРґ РЅРµ РјРµРЅСЏР»СЃСЏ. РџСЂРѕРІРµСЂРµРЅС‹ `pm/backlog.md`, `shared/ROADMAP.md`, `shared/WORK_LOG.md`, `DEVELOPMENT_LOG.md`; СЃС‚Р°С‚СѓСЃ BACK-008 РїРµСЂРµРІРµРґС‘РЅ РІ Blocked.

**РљРѕРјРјРёС‚:** `docs(process): close BACK-006, mark BACK-008 blocked`

**РЎС‚Р°С‚СѓСЃ:** Р·Р°Р±Р»РѕРєРёСЂРѕРІР°РЅРѕ вЂ” Р¶РґС‘С‚ СЂСѓС‡РЅРѕР№ С€Р°Рі Р®СЂРёСЏ: СЃРѕР·РґР°С‚СЊ Yandex Cloud PostgreSQL cluster Рё РїРµСЂРµРґР°С‚СЊ credentials/connection settings.

---

## 2026-06-27 вЂ” BACK-006: D1 storage for sessions and tasks (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** Р’ `4e-worker/worker.js` РґРѕР±Р°РІР»РµРЅ D1 storage-layer РґР»СЏ `session:*` Рё `tasks:*`: РЅРѕРІС‹Рµ sessions СЃРѕС…СЂР°РЅСЏСЋС‚СЃСЏ РІ `app_sessions`, task lists вЂ” РІ `app_task_lists`. РЎС‚Р°СЂС‹Рµ KV-Р·РЅР°С‡РµРЅРёСЏ РґР»СЏ `session:*` Рё `tasks:*` РѕСЃС‚Р°СЋС‚СЃСЏ read fallback-РѕРј Рё РїСЂРё РїРµСЂРІРѕРј С‡С‚РµРЅРёРё РїРµСЂРµРЅРѕСЃСЏС‚СЃСЏ РІ D1. Worker РїРµСЂРµРІРµРґС‘РЅ СЃ legacy `addEventListener("fetch")` РЅР° ES module `export default { fetch(request, env) }`, РїРѕС‚РѕРјСѓ С‡С‚Рѕ Cloudflare D1 binding С‚СЂРµР±СѓРµС‚ module Worker. Р’ `wrangler.toml` РґРѕР±Р°РІР»РµРЅ binding `DB` РЅР° `4e-production` (`6107948c-6c67-4c37-baa1-efea6c5c2860`). Р”РѕР±Р°РІР»РµРЅС‹ D1 migrations: `0001_sessions_tasks.sql` РєР°Рє no-op note РґР»СЏ СѓР¶Рµ Р·Р°РЅСЏС‚РѕР№ production schema `sessions/tasks`, Рё `0002_app_kv_state.sql` РґР»СЏ `app_sessions`/`app_task_lists`.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** `index.html` РЅРµ РјРµРЅСЏР»СЃСЏ, РЁР°Рі 0 РЅРµ С‚СЂРµР±РѕРІР°Р»СЃСЏ.

**РўРµСЃС‚:** `node --check worker.js`; `git diff --check`; `wrangler d1 migrations apply 4e-production --local --config wrangler.toml`; `wrangler d1 migrations apply 4e-production --remote --config wrangler.toml`; `PRAGMA table_info(app_sessions)` Рё `PRAGMA table_info(app_task_lists)` РїРѕРґС‚РІРµСЂРґРёР»Рё remote schema; `wrangler deploy --dry-run --config wrangler.toml`; `wrangler deploy --config wrangler.toml` в†’ production version `0b66977a-0b23-4cdf-bd92-c5ec38e2ee1c`. Live smoke: РІСЂРµРјРµРЅРЅС‹Р№ email-Р°РєРєР°СѓРЅС‚ Р·Р°СЂРµРіРёСЃС‚СЂРёСЂРѕРІР°РЅ, `/auth/me` РїРѕ token РїСЂРѕС€С‘Р», `x-action: save-task` СЃРѕС…СЂР°РЅРёР» Р·Р°РґР°С‡Сѓ, `/tasks` РІРµСЂРЅСѓР» РµС‘; D1 РїРѕРєР°Р·Р°Р» `session_rows=1` Рё `task_rows=1`; KV get РґР»СЏ РЅРѕРІС‹С… `session:<token>` Рё `tasks:<chatId>` РІРµСЂРЅСѓР» 404; РІСЂРµРјРµРЅРЅС‹Рµ D1/KV Р·Р°РїРёСЃРё СѓРґР°Р»РµРЅС‹, cleanup count РІРµСЂРЅСѓР» `session_rows=0`, `task_rows=0`.

**РљРѕРјРјРёС‚:** `0a035c9` (`feat(worker): store sessions and tasks in D1`) РІ `4e-worker`.

**РЎС‚Р°С‚СѓСЃ:** РІС‹РїРѕР»РЅРµРЅРѕ вЂ” BACK-006 Р·Р°РєСЂС‹С‚.

---

## 2026-06-27 вЂ” BACK-005: unified user identities (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** Р’ `4e-worker/worker.js` СЃРѕР·РґР°РЅР° РµРґРёРЅР°СЏ server-side РјРѕРґРµР»СЊ РёРґРµРЅС‚РёС‡РЅРѕСЃС‚РµР№ РґР»СЏ Email + Telegram + VK. `link-telegram` С‚РµРїРµСЂСЊ СѓРјРµРµС‚ Р±СЂР°С‚СЊ Telegram ID РёР· `initData` Рё СЃРѕС…СЂР°РЅСЏРµС‚ `telegramId` РІ canonical user. Р”РѕР±Р°РІР»РµРЅ `/auth/link-vk`, РєРѕС‚РѕСЂС‹Р№ РїСЂРёРІСЏР·С‹РІР°РµС‚ VK ID Рє С‚РµРєСѓС‰РµР№ email-СЃРµСЃСЃРёРё С‡РµСЂРµР· `vk:<id>` Рё `vk_rev:<userId>`. `/auth/vk` С‚РµРїРµСЂСЊ РїР°СЂСЃРёС‚ `vk_user_id` РёР· `launchParams`, РёСЃРїРѕР»СЊР·СѓРµС‚ РѕР±С‰РёР№ `saveUser/getUser`, СЃРѕР·РґР°С‘С‚ canonical `vk_<id>@vk.local` user С‚РѕР»СЊРєРѕ РµСЃР»Рё VK РµС‰С‘ РЅРµ РїСЂРёРІСЏР·Р°РЅ, Рё РІРѕР·РІСЂР°С‰Р°РµС‚ session СЃ `email`. `publicUser()` РІРѕР·РІСЂР°С‰Р°РµС‚ `telegramId`, `telegramUsername`, `vkId`.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** `index.html` РЅРµ РјРµРЅСЏР»СЃСЏ, РЁР°Рі 0 РЅРµ С‚СЂРµР±РѕРІР°Р»СЃСЏ.

**РўРµСЃС‚:** `node --check worker.js`; `git diff --check`; `wrangler deploy --dry-run --config wrangler.toml`; `wrangler deploy --config wrangler.toml` в†’ production version `ff365be0-59d3-4307-9c15-54ab037e2917`; Р»РѕРєР°Р»СЊРЅС‹Р№ `wrangler dev --config wrangler.toml --ip 127.0.0.1 --port 8787`; smoke СЃРѕР·РґР°Р» email-Р°РєРєР°СѓРЅС‚, РїСЂРёРІСЏР·Р°Р» Telegram С‡РµСЂРµР· `initData`, РїСЂРёРІСЏР·Р°Р» VK С‡РµСЂРµР· `launchParams`, Р·Р°С‚РµРј `/auth/vk` РІРµСЂРЅСѓР» С‚РѕС‚ Р¶Рµ `user.id` Рё email; `/auth/me` РїРѕ VK token С‚Р°РєР¶Рµ РІРµСЂРЅСѓР» С‚РѕС‚ Р¶Рµ `user.id`. РќР° shutdown `wrangler dev` РїРѕРєР°Р·Р°Р» РІСЂРµРјРµРЅРЅСѓСЋ bundle cleanup/build РѕС€РёР±РєСѓ, РЅРѕ HTTP-smoke РґРѕ shutdown РїСЂРѕС€С‘Р» СѓСЃРїРµС€РЅРѕ. РџРѕСЃР»Рµ merge РІ `main` production live smoke РїРѕРґС‚РІРµСЂРґРёР», С‡С‚Рѕ email-СЂРµРіРёСЃС‚СЂР°С†РёСЏ, Telegram link, VK link, `/auth/vk` Рё `/auth/me` РІРѕР·РІСЂР°С‰Р°СЋС‚ РѕРґРёРЅ canonical `user.id`; РІСЂРµРјРµРЅРЅС‹Рµ KV-РєР»СЋС‡Рё `user:*`, `user_id:*`, `session:*`, `tg:*`, `tg_rev:*`, `vk:*`, `vk_rev:*`, `notifs:*` СѓРґР°Р»РµРЅС‹.

**РљРѕРјРјРёС‚:** `1a593fb` (`fix(auth): unify VK Telegram and email identities`) РІ `4e-worker`.

**РЎС‚Р°С‚СѓСЃ:** РІС‹РїРѕР»РЅРµРЅРѕ вЂ” BACK-005 Р·Р°РєСЂС‹С‚.

---

## 2026-06-27 вЂ” BACK-004: payment webhook live smoke (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** РљРѕРґ РЅРµ РјРµРЅСЏР»СЃСЏ. Production Worker `/payment/webhook` РїСЂРѕРІРµСЂРµРЅ end-to-end РЅР° РІСЂРµРјРµРЅРЅРѕРј С‚РµСЃС‚РѕРІРѕРј РїРѕР»СЊР·РѕРІР°С‚РµР»Рµ `codex-payment-smoke-1782568866@example.com` Рё invoice `codex-smoke-1782568866`.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** `index.html` РЅРµ РјРµРЅСЏР»СЃСЏ, РЁР°Рі 0 РЅРµ С‚СЂРµР±РѕРІР°Р»СЃСЏ.

**РўРµСЃС‚:** Р§РµСЂРµР· production Worker СЃРѕР·РґР°РЅ РІСЂРµРјРµРЅРЅС‹Р№ Р°РєРєР°СѓРЅС‚, РґРѕ webhook `plan=trial`; РѕС‚РїСЂР°РІР»РµРЅ form-urlencoded webhook `Status=Completed`, `AccountId=<test-user-id>`, `Amount=990`, `InvoiceId=codex-smoke-1782568866`, `Description=Smoke 1 month`; webhook РІРµСЂРЅСѓР» `code:0`; РїРѕСЃР»Рµ `/auth/me` РїРѕРєР°Р·Р°Р» `plan=paid`, `trialEndsAt` СѓРІРµР»РёС‡РёР»СЃСЏ РїСЂРёРјРµСЂРЅРѕ РЅР° 30 РґРЅРµР№ (`trialLeft=60`). РџРѕСЃР»Рµ РїСЂРѕРІРµСЂРєРё СѓРґР°Р»РµРЅС‹ С‚РѕС‡РЅС‹Рµ KV-РєР»СЋС‡Рё `user:codex-payment-smoke-1782568866@example.com`, `user_id:d1ce9837-42b0-4460-a17e-ef16856234b4`, `tx:codex-smoke-1782568866`, `notifs:d1ce9837-42b0-4460-a17e-ef16856234b4`.

**РљРѕРјРјРёС‚:** N/A вЂ” РєРѕРґ РЅРµ РјРµРЅСЏР»СЃСЏ.

**РЎС‚Р°С‚СѓСЃ:** РІС‹РїРѕР»РЅРµРЅРѕ вЂ” BACK-004 Р·Р°РєСЂС‹С‚.

---

## 2026-06-27 вЂ” BACK-002: password reset backend endpoints (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** Р’ `4e-worker/worker.js` РЅР° РІРµС‚РєРµ `fix/password-reset-endpoints` РґРѕР±Р°РІР»РµРЅС‹ РЅРѕРІС‹Рµ СЃРѕРІРјРµСЃС‚РёРјС‹Рµ endpoint aliases `/auth/reset-request` Рё `/auth/reset-confirm` РїРѕРІРµСЂС… СЃСѓС‰РµСЃС‚РІСѓСЋС‰РёС… `/auth/forgot-password` Рё `/auth/reset-password`. `handleResetPassword()` С‚РµРїРµСЂСЊ РїСЂРёРЅРёРјР°РµС‚ `newPassword` РёР· РєРѕРЅС‚СЂР°РєС‚Р° Р¤Р°Р·С‹ 12 Рё СЃС‚Р°СЂРѕРµ РїРѕР»Рµ `password` РґР»СЏ РѕР±СЂР°С‚РЅРѕР№ СЃРѕРІРјРµСЃС‚РёРјРѕСЃС‚Рё. РЎСЃС‹Р»РєР° РІ РїРёСЃСЊРјРµ РёСЃРїСЂР°РІР»РµРЅР° РЅР° `https://mrktggod.github.io/4e-app/?reset=TOKEN`.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** `index.html` РЅРµ РјРµРЅСЏР»СЃСЏ, РЁР°Рі 0 РЅРµ С‚СЂРµР±РѕРІР°Р»СЃСЏ.

**РўРµСЃС‚:** `node --check worker.js`; `git diff --check`; `wrangler deploy --dry-run --config wrangler.toml`; Р»РѕРєР°Р»СЊРЅС‹Р№ `wrangler dev --config wrangler.toml --ip 127.0.0.1 --port 8787`; `POST /auth/reset-request` СЃ РЅРµСЃСѓС‰РµСЃС‚РІСѓСЋС‰РёРј email РІРµСЂРЅСѓР» `200 {"ok":true}`; `POST /auth/reset-confirm` СЃ РЅРµРІР°Р»РёРґРЅС‹Рј token Рё `newPassword` РІРµСЂРЅСѓР» РєРѕРЅС‚СЂРѕР»РёСЂСѓРµРјС‹Р№ `400 Bad Request`.

**РљРѕРјРјРёС‚:** `a0965de` (`feat(auth): add password reset endpoints`) РІ `4e-worker`.

**РЎС‚Р°С‚СѓСЃ:** РІС‹РїРѕР»РЅРµРЅРѕ вЂ” PR СЃРјС‘СЂР¶РµРЅ РІ `a173ebf`, production deploy РІС‹РїРѕР»РЅРµРЅ (`729a046c-5849-4a26-9ced-8ee5bc4b1e44`), live API smoke РїСЂРѕС€С‘Р»: `/auth/reset-request` РІРµСЂРЅСѓР» `200 {"ok":true}`, `/auth/reset-confirm` СЃ invalid token РІРµСЂРЅСѓР» РєРѕРЅС‚СЂРѕР»РёСЂСѓРµРјС‹Р№ `400`. Р¤РёРЅР°Р»СЊРЅС‹Р№ СЂСѓС‡РЅРѕР№ smoke РїРѕРґС‚РІРµСЂР¶РґС‘РЅ 2026-06-27: РїРёСЃСЊРјРѕ РїСЂРёС€Р»Рѕ, РєРЅРѕРїРєР° СЃР±СЂРѕСЃР° РѕС‚РєСЂС‹Р»Р° С„РѕСЂРјСѓ, РїР°СЂРѕР»СЊ СЃРѕС…СЂР°РЅС‘РЅ. РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ РІРІС‘Р» С‚РѕС‚ Р¶Рµ РїР°СЂРѕР»СЊ, РЅРѕ reset token Рё backend confirm-flow РѕС‚СЂР°Р±РѕС‚Р°Р»Рё.

---

## 2026-06-26 вЂ” BACK-001: Resend email secret РґР»СЏ Worker (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** Р’ РѕС‚РґРµР»СЊРЅРѕРј worker-СЂРµРїРѕР·РёС‚РѕСЂРёРё `4e-worker` СЃРѕР·РґР°РЅР° РІРµС‚РєР° `fix/resend-email-secret` Рё РєРѕРјРјРёС‚ `086f19b`. РР· `worker.js` СѓРґР°Р»С‘РЅ hardcoded `RESEND_KEY`; `sendEmail()` С‚РµРїРµСЂСЊ С‡РёС‚Р°РµС‚ runtime secret `RESEND_KEY`, РЅРµ РїР°РґР°РµС‚ Worker 1101 РїСЂРё РѕС‚СЃСѓС‚СЃС‚РІСѓСЋС‰РµРј secret, Р»РѕРіРёСЂСѓРµС‚ РєРѕРЅС„РёРіСѓСЂР°С†РёРѕРЅРЅСѓСЋ РѕС€РёР±РєСѓ/РѕС€РёР±РєСѓ Resend Рё РІРѕР·РІСЂР°С‰Р°РµС‚ `false`. `/auth/forgot-password` С‚РµРїРµСЂСЊ РЅРµ СЃРѕРѕР±С‰Р°РµС‚ РїРѕР»СЊР·РѕРІР°С‚РµР»СЋ Р»РѕР¶РЅС‹Р№ СѓСЃРїРµС… РґР»СЏ СЃСѓС‰РµСЃС‚РІСѓСЋС‰РµРіРѕ Р°РєРєР°СѓРЅС‚Р°, РµСЃР»Рё РїРёСЃСЊРјРѕ РЅРµ РѕС‚РїСЂР°РІРёР»РѕСЃСЊ, Р° РІРѕР·РІСЂР°С‰Р°РµС‚ РєРѕРЅС‚СЂРѕР»РёСЂСѓРµРјС‹Р№ `502`.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** `index.html` РЅРµ РјРµРЅСЏР»СЃСЏ, РЁР°Рі 0 РЅРµ С‚СЂРµР±РѕРІР°Р»СЃСЏ.

**РўРµСЃС‚:** `node --check worker.js`; `rg -n "re_[A-Za-z0-9_]+" worker.js` РЅРµ РЅР°С€С‘Р» hardcoded Resend key; `git diff --check` РїСЂРѕС€С‘Р»; `wrangler deploy --dry-run --config wrangler.toml` СЃРѕР±СЂР°Р» Worker (`Total Upload: 55.77 KiB / gzip: 10.35 KiB`) Рё РїРѕРєР°Р·Р°Р» binding `env.KV`. РџСЂРѕРІРµСЂРєР° `wrangler secret list` Рё production deploy Р·Р°Р±Р»РѕРєРёСЂРѕРІР°РЅС‹ РѕРєСЂСѓР¶РµРЅРёРµРј: Wrangler С‚СЂРµР±СѓРµС‚ `CLOUDFLARE_API_TOKEN` РІ non-interactive session. 2026-06-27: `git push -u origin fix/resend-email-secret` completed; PR creation is blocked because local `gh` is not logged in and GitHub connector returned API 404 for `mrktggod/4e-bot`; `wrangler whoami` later succeeded after OAuth login, `wrangler secret list --config wrangler.toml` confirmed `RESEND_KEY`, and production deploy succeeded: Worker `restless-lab-d737`, version `abe182e4-05b5-4c28-9934-9f972e662098`, URL `https://restless-lab-d737.shelckograff.workers.dev`. Safe smoke: `POST /auth/forgot-password` with a non-existing email returned `200 {"ok":true}`. 2026-06-27: live email smoke passed by user confirmation; reset email arrived and Resend marked it delivered. BACK-001 is Done; following the email link and changing the password are BACK-002 scope.

**РљРѕРјРјРёС‚:** `086f19b` (`fix(worker): use Resend secret for email delivery`) РІ `4e-worker`; branch `origin/fix/resend-email-secret` pushed.

---

## 2026-06-26 вЂ” PM-roadmap РїСЂРёРІРµРґС‘РЅ Рє СЂРµР°Р»СЊРЅРѕР№ СЃС‚СЂР°С‚РµРіРёРё РїСЂРѕРґСѓРєС‚Р° (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:**
- `pm/roadmap.md` СЏРІРЅРѕ РЅР°Р·РЅР°С‡РµРЅ РѕРїРµСЂР°С‚РёРІРЅРѕР№ РІРµСЂСЃРёРµР№ СЃС‚СЂР°С‚РµРіРёРё РёР· `shared/ROADMAP.md`.
- РЈР±СЂР°РЅР° РЅРµРѕРґРЅРѕР·РЅР°С‡РЅРѕСЃС‚СЊ СЃ generic-roadmap: РґРѕР±Р°РІР»РµРЅРѕ РїСЂР°РІРёР»Рѕ РЅРµ РїРѕРґРјРµРЅСЏС‚СЊ РїСЂРѕРґСѓРєС‚ 4 AI-СЃРµРєСЂРµС‚Р°СЂСЊ РёРЅСЃС‚СЂСѓРјРµРЅС‚РѕРј СѓРїСЂР°РІР»РµРЅРёСЏ РїСЂРѕРµРєС‚РѕРј.
- `pm/backlog.md` РїРѕРјРµС‡РµРЅ РєР°Рє backlog РёР· СЂРµР°Р»СЊРЅРѕР№ РїСЂРѕРґСѓРєС‚РѕРІРѕР№ СЃС‚СЂР°С‚РµРіРёРё Рё СЃРІСЏР·Р°РЅ СЃ Linear `ALE-5` РґР»СЏ РїРµСЂРІРёС‡РЅРѕРіРѕ Р±Р°Рі-Р±Р°С€Р°.
- РЈС‚РѕС‡РЅС‘РЅ СЃС‚Р°С‚СѓСЃ Р¤Р°Р·С‹ 9: Done / QA, РїРѕС‚РѕРјСѓ С‡С‚Рѕ СЂРµР°Р»РёР·Р°С†РёСЏ РµСЃС‚СЊ, РЅРѕ live-СЃС†РµРЅР°СЂРёР№ РјРёРєСЂРѕС„РѕРЅР° РЅСѓР¶РЅРѕ РїСЂРѕРІРµСЂРёС‚СЊ.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** `index.html` РЅРµ РёР·РјРµРЅСЏР»СЃСЏ.

**РўРµСЃС‚:** СЂСѓС‡РЅР°СЏ СЃРІРµСЂРєР° `pm/roadmap.md` Рё `pm/backlog.md` СЃ `shared/ROADMAP.md`, `DEVELOPMENT_LOG.md`, `shared/WORK_LOG.md`.

**РљРѕРјРјРёС‚:** N/A вЂ” РёР·РјРµРЅРµРЅРёСЏ РїРѕРґРіРѕС‚РѕРІР»РµРЅС‹ Р»РѕРєР°Р»СЊРЅРѕ, РєРѕРјРјРёС‚/РїСѓС€ РЅРµ РІС‹РїРѕР»РЅСЏР»СЃСЏ.

---

## 2026-06-25 вЂ” BACK-003: Р±РёРѕРјРµС‚СЂРёС‡РµСЃРєРѕРµ СЃРѕРіР»Р°СЃРёРµ 152-Р¤Р— (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** Р’ `index.html` СѓСЃС‚Р°РЅРѕРІР»РµРЅ РїР°С‚С‡ `09_biometric_consent.html` РїРµСЂРµРґ Р·Р°РєСЂС‹РІР°СЋС‰РёРј `</body>`. `openVoice()` С‚РµРїРµСЂСЊ СЃРЅР°С‡Р°Р»Р° РІС‹Р·С‹РІР°РµС‚ `window.biometricConsentRequired()`, РїРѕСЌС‚РѕРјСѓ РїСЂРё РїРµСЂРІРѕРј РЅР°Р¶Р°С‚РёРё РЅР° РјРёРєСЂРѕС„РѕРЅ РѕС‚РєСЂС‹РІР°РµС‚СЃСЏ СЌРєСЂР°РЅ СЃРѕРіР»Р°СЃРёСЏ РЅР° РѕР±СЂР°Р±РѕС‚РєСѓ РіРѕР»РѕСЃР°. Р’ С„РѕСЂРјРµ РІС…РѕРґР° РґРѕР±Р°РІР»РµРЅР° СЃСЃС‹Р»РєР° РЅР° `privacy.html`, Р° РІ СЂР°Р·РґРµР»Рµ Р±РµР·РѕРїР°СЃРЅРѕСЃС‚Рё РґРѕР±Р°РІР»РµРЅР° СЃС‚СЂРѕРєР° РѕС‚Р·С‹РІР° СЃРѕРіР»Р°СЃРёСЏ. РћР±РЅРѕРІР»РµРЅС‹ `FILE_MAP.md`, `FILE_MAP_UI.md`, `pm/backlog.md` Рё `pm/roadmap.md`.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** РґРѕ РїСЂР°РІРєРё вЂ” 51 СЃРѕРІРїР°РґРµРЅРёРµ РїРѕ `Р’РѕР№С‚Рё|Р—Р°РґР°С‡Рё|РЎРµРіРѕРґРЅСЏ`; РїРѕСЃР»Рµ РїСЂР°РІРєРё вЂ” 52 СЃРѕРІРїР°РґРµРЅРёСЏ. РЈРІРµР»РёС‡РµРЅРёРµ РѕР¶РёРґР°РµРјРѕРµ: РґРѕР±Р°РІР»РµРЅР° legal-note СЃРѕ СЃР»РѕРІРѕРј В«Р’РѕР№С‚РёВ».

**РўРµСЃС‚:** `node` РїСЂРѕРІРµСЂРёР» СЃРёРЅС‚Р°РєСЃРёСЃ 2 inline scripts РІ `index.html`; СЃС‚Р°С‚РёС‡РµСЃРєР°СЏ РїСЂРѕРІРµСЂРєР° РјР°СЂРєРµСЂРѕРІ Р¤Р°Р·С‹ 9 РїСЂРѕС€Р»Р° (`biometricConsentRequired`, `biometric_consent_v1`, disabled confirm button, legal-note, revoke row). `git diff --check` РїСЂРѕС€С‘Р» Р±РµР· whitespace errors; portable-path СЌРєРІРёРІР°Р»РµРЅС‚ С‡РµСЂРµР· `rg` РЅРµ РЅР°С€С‘Р» Р»РѕРєР°Р»СЊРЅС‹С… user-РїСѓС‚РµР№. `privacy.html` СЃСѓС‰РµСЃС‚РІСѓРµС‚ Рё СЃРѕРґРµСЂР¶РёС‚ РїРѕР»РёС‚РёРєСѓ РєРѕРЅС„РёРґРµРЅС†РёР°Р»СЊРЅРѕСЃС‚Рё/152-Р¤Р—. Playwright РІ Р»РѕРєР°Р»СЊРЅРѕРј РѕРєСЂСѓР¶РµРЅРёРё РЅРµ СѓСЃС‚Р°РЅРѕРІР»РµРЅ, РїРѕСЌС‚РѕРјСѓ browser click-flow РѕСЃС‚Р°С‘С‚СЃСЏ СЂСѓС‡РЅРѕР№ РїСЂРѕРІРµСЂРєРѕР№ РїРѕСЃР»Рµ push.

**РљРѕРјРјРёС‚:** `legal: biometric consent and privacy policy`

---

## 2026-06-25 вЂ” РСЃРїСЂР°РІР»РµРЅРёРµ СЃР±СЂРѕСЃР° РїР°СЂРѕР»СЏ (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:**
- Р’ `index.html` РґРѕР±Р°РІР»РµРЅР° РѕС€РёР±РєР° РїРѕРґ email РЅР° СЌРєСЂР°РЅРµ "РЎР±СЂРѕСЃ РїР°СЂРѕР»СЏ".
- `doForgotPassword()` С‚РµРїРµСЂСЊ РЅРµ РѕС‚РїСЂР°РІР»СЏРµС‚ РїСѓСЃС‚РѕР№ email Рё Р·РЅР°С‡РµРЅРёСЏ РЅРµ РІ С„РѕСЂРјР°С‚Рµ email, РЅР°РїСЂРёРјРµСЂ `fff`.
- РћС‚РІРµС‚ `/auth/forgot-password` С‚РµРїРµСЂСЊ РѕР±СЂР°Р±Р°С‚С‹РІР°РµС‚СЃСЏ СЏРІРЅРѕ: СѓСЃРїРµС… РїРѕРєР°Р·С‹РІР°РµС‚ Р±Р»РѕРє "РџРёСЃСЊРјРѕ РѕС‚РїСЂР°РІР»РµРЅРѕ", СЃРµСЂРІРµСЂРЅР°СЏ РѕС€РёР±РєР° РѕСЃС‚Р°С‘С‚СЃСЏ РЅР° С„РѕСЂРјРµ СЃ РїРѕРЅСЏС‚РЅС‹Рј СЃРѕРѕР±С‰РµРЅРёРµРј.
- `showScreen()` СЃРєСЂС‹РІР°РµС‚ РЅРёР¶РЅСЋСЋ РЅР°РІРёРіР°С†РёСЋ РЅР° РїСѓР±Р»РёС‡РЅС‹С… auth/reset-flow СЌРєСЂР°РЅР°С…: `onboarding`, `login`, `forgot-password`, `reset-password`.
- РћР±РЅРѕРІР»РµРЅС‹ `FILE_MAP.md`, `FILE_MAP_UI.md`, `pm/bugs.md` Рё `pm/qa-checklist.md`.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** 22 / 22 СЃРѕРІРїР°РґРµРЅРёР№ РїРѕ `Р’РѕР№С‚Рё|Р—Р°РґР°С‡Рё|РЎРµРіРѕРґРЅСЏ`; РїРµСЂРµРґ РїСЂР°РІРєРѕР№ СЃРѕР·РґР°РЅ backup `index.backup_20260625_1821.html`.

**РўРµСЃС‚:** Р»РѕРєР°Р»СЊРЅР°СЏ СЂР°Р·РґР°С‡Р° `python3 -m http.server 8000`; `curl -I http://127.0.0.1:8000/index.html` РІРµСЂРЅСѓР» `200 OK`. РўРѕС‡РµС‡РЅС‹Р№ JS-smoke РЅР° С„СѓРЅРєС†РёСЏС… `doForgotPassword()` Рё `showScreen()` РїСЂРѕРІРµСЂРёР» РїСѓСЃС‚РѕР№ email, `fff`, СѓСЃРїРµС€РЅС‹Р№ РѕС‚РІРµС‚, СЃРµСЂРІРµСЂРЅСѓСЋ РѕС€РёР±РєСѓ, СЃРєСЂС‹С‚РёРµ nav РЅР° `forgot-password` Рё `reset-password`. Р’СЃС‚СЂРѕРµРЅРЅС‹Р№ browser-РїР»Р°РіРёРЅ РІ СЌС‚РѕР№ СЃСЂРµРґРµ СѓРїР°Р» РїСЂРё РѕС‚РєСЂС‹С‚РёРё С‚СЏР¶С‘Р»РѕРіРѕ `index.html`, РїРѕСЌС‚РѕРјСѓ РІРёР·СѓР°Р»СЊРЅС‹Р№ WebView-smoke РЅСѓР¶РµРЅ РїРѕСЃР»Рµ РґРµРїР»РѕСЏ/РІ Telegram.

**РљРѕРјРјРёС‚:** N/A вЂ” РєРѕРјРјРёС‚/РїСѓС€ РЅРµ РІС‹РїРѕР»РЅСЏР»СЃСЏ.

---

## 2026-06-25 вЂ” Р¤РёРєСЃР°С†РёСЏ P1 Р±Р°РіР° РІРѕСЃСЃС‚Р°РЅРѕРІР»РµРЅРёСЏ РїР°СЂРѕР»СЏ (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:**
- Р’ `pm/bugs.md` РґРѕР±Р°РІР»РµРЅ Р°РєС‚РёРІРЅС‹Р№ Р±Р°Рі `BUG-2026-06-25-002`: СЃР±СЂРѕСЃ РїР°СЂРѕР»СЏ РїСЂРёРЅРёРјР°РµС‚ РЅРµРєРѕСЂСЂРµРєС‚РЅС‹Р№ email Рё РїРµСЂРµРІРѕРґРёС‚ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ РЅР° РїСѓСЃС‚РѕР№ СЌРєСЂР°РЅ.
- Р‘Р°Рі РѕС‚РјРµС‡РµРЅ РєР°Рє СЃСѓС‰РµСЃС‚РІРµРЅРЅС‹Р№ РґР»СЏ РґРѕСЃС‚СѓРїР°: `High / P1`, РјРµС‚РєР° `Auth / Access blocker risk`.
- РЎРѕР·РґР°РЅР° Р·Р°РґР°С‡Р° РґР»СЏ СЂР°Р·СЂР°Р±РѕС‚РєРё `docs/tasks/BUG-2026-06-25-002_password_reset.md`.
- Р’ `pm/qa-checklist.md` РґРѕР±Р°РІР»РµРЅС‹ СЂРµРіСЂРµСЃСЃРёРѕРЅРЅС‹Рµ РїСЂРѕРІРµСЂРєРё РІРѕСЃСЃС‚Р°РЅРѕРІР»РµРЅРёСЏ РїР°СЂРѕР»СЏ.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** `index.html` РЅРµ РёР·РјРµРЅСЏР»СЃСЏ.

**РўРµСЃС‚:** РїСЂРѕРІРµСЂРµРЅР° СЃС‚СЂСѓРєС‚СѓСЂР° PM-РґРѕРєСѓРјРµРЅС‚РѕРІ; РєРѕРґ РїСЂРёР»РѕР¶РµРЅРёСЏ РЅРµ РјРµРЅСЏР»СЃСЏ.

**РљРѕРјРјРёС‚:** N/A вЂ” РєРѕРјРјРёС‚/РїСѓС€ РЅРµ РІС‹РїРѕР»РЅСЏР»СЃСЏ.

---

## 2026-06-25 вЂ” РќР°РїРѕРјРёРЅР°РЅРёРµ Рѕ СЃРёРЅС…СЂРѕРЅРёР·Р°С†РёРё РїРµСЂРµРґ СЂР°Р±РѕС‚РѕР№ (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:**
- Р’ `AGENTS.md`, `CLAUDE.md`, `README.md` РґРѕР±Р°РІР»РµРЅРѕ РїСЂР°РІРёР»Рѕ: РїРµСЂРµРґ РЅР°С‡Р°Р»РѕРј СЂР°Р±РѕС‚С‹ РЅР°РїРѕРјРЅРёС‚СЊ РїРѕР»СЊР·РѕРІР°С‚РµР»СЋ Рё РІС‹РїРѕР»РЅРёС‚СЊ `git fetch origin` Рё `git pull --rebase`.
- Р’ `FILE_MAP.md` РґРѕР±Р°РІР»РµРЅР° СЃС‚Р°СЂС‚РѕРІР°СЏ РїСЂРѕРІРµСЂРєР° СЃРёРЅС…СЂРѕРЅРёР·Р°С†РёРё СЃ GitHub.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** `index.html` РЅРµ РёР·РјРµРЅСЏР»СЃСЏ.

**РўРµСЃС‚:** РїРµСЂРµРґ РїСЂР°РІРєРѕР№ РІС‹РїРѕР»РЅРµРЅС‹ `git fetch origin` Рё `git pull --rebase`; Р»РѕРєР°Р»СЊРЅР°СЏ РІРµС‚РєР° СЃРёРЅС…СЂРѕРЅРёР·РёСЂРѕРІР°РЅР° СЃ `origin/main`.

**РљРѕРјРјРёС‚:** N/A вЂ” РёР·РјРµРЅРµРЅРёСЏ РїРѕРґРіРѕС‚РѕРІР»РµРЅС‹ Р»РѕРєР°Р»СЊРЅРѕ, РєРѕРјРјРёС‚/РїСѓС€ РЅРµ РІС‹РїРѕР»РЅСЏР»СЃСЏ.

---

## 2026-06-25 вЂ” РџСЂР°РІРёР»Рѕ РїРѕРЅСЏС‚РЅС‹С… Р·Р°РіРѕР»РѕРІРєРѕРІ РєРѕРјРјРёС‚РѕРІ (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:**
- Р”РѕР±Р°РІР»РµРЅ `shared/COMMIT_CONVENTION.md` СЃ С„РѕСЂРјР°С‚РѕРј `type(scope): С‡С‚Рѕ РёР·РјРµРЅРёР»РѕСЃСЊ`.
- РџСЂР°РІРёР»Рѕ РїРѕРґРєР»СЋС‡РµРЅРѕ РІ `AGENTS.md`, `CLAUDE.md`, `COWORK_INSTRUCTIONS.md`, `README.md`.
- `FILE_MAP.md` РѕР±РЅРѕРІР»С‘РЅ, С‡С‚РѕР±С‹ РЅРѕРІС‹Р№ РєРѕРјР°РЅРґРЅС‹Р№ СЃС‚Р°РЅРґР°СЂС‚ Р±С‹Р» РІРёРґРµРЅ Р°РіРµРЅС‚Р°Рј.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** `index.html` РЅРµ РёР·РјРµРЅСЏР»СЃСЏ.

**РўРµСЃС‚:** `git diff --check` РїРѕСЃР»Рµ РїСЂР°РІРѕРє.

**РљРѕРјРјРёС‚:** N/A вЂ” РёР·РјРµРЅРµРЅРёСЏ РїРѕРґРіРѕС‚РѕРІР»РµРЅС‹ Р»РѕРєР°Р»СЊРЅРѕ, РєРѕРјРјРёС‚/РїСѓС€ РЅРµ РІС‹РїРѕР»РЅСЏР»СЃСЏ.

---

## 2026-06-25 вЂ” РЈР±СЂР°РЅС‹ Р»РѕРєР°Р»СЊРЅС‹Рµ РїСѓС‚Рё Рё РґРѕР±Р°РІР»РµРЅ path guard (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:**
- Р’ `COWORK_INSTRUCTIONS.md` Р°Р±СЃРѕР»СЋС‚РЅС‹Р№ Mac-РїСѓС‚СЊ Р·Р°РјРµРЅС‘РЅ РЅР° РїРµСЂРµРЅРѕСЃРёРјС‹Р№ `<repo-root>` Рё СѓРЅРёРІРµСЂСЃР°Р»СЊРЅСѓСЋ РєРѕРјР°РЅРґСѓ РїРµСЂРµС…РѕРґР° РІ Р»РѕРєР°Р»СЊРЅСѓСЋ РїР°РїРєСѓ СЂРµРїРѕР·РёС‚РѕСЂРёСЏ.
- РЎС‚Р°СЂС‹Рµ Windows user-РїСѓС‚Рё Р·Р°РјРµРЅРµРЅС‹ РЅР° `<repo-root>`, `<worker-repo-root>` Рё РѕС‚РЅРѕСЃРёС‚РµР»СЊРЅС‹Рµ РїСѓС‚Рё РІ `AGENTS.md`, `CLAUDE.md`, `docs/tasks/TASK_TEMPLATE.md`, `DEVELOPMENT_LOG.md`.
- Р”РѕР±Р°РІР»РµРЅ `scripts/check-portable-paths.sh`, Р»РѕРєР°Р»СЊРЅС‹Р№ `.githooks/pre-commit` Рё GitHub Actions workflow `.github/workflows/path-guard.yml`.
- Р’ Р»РѕРєР°Р»СЊРЅРѕРј checkout РІРєР»СЋС‡С‘РЅ `git config core.hooksPath .githooks`, С‡С‚РѕР±С‹ РїСЂРѕРІРµСЂРєР° Р·Р°РїСѓСЃРєР°Р»Р°СЃСЊ РїРµСЂРµРґ commit.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** `index.html` РЅРµ РёР·РјРµРЅСЏР»СЃСЏ.

**РўРµСЃС‚:** `git fetch origin` РїРµСЂРµРґ РїСЂР°РІРєРѕР№; Р»РѕРєР°Р»СЊРЅР°СЏ РІРµС‚РєР° РЅРµ РѕС‚СЃС‚Р°РІР°Р»Р° РѕС‚ GitHub. `bash scripts/check-portable-paths.sh` РїСЂРѕС…РѕРґРёС‚. РџРѕРёСЃРє РїРѕ Mac/Windows user-РїСѓС‚СЏРј РЅРµ РЅР°С…РѕРґРёС‚ СЃРѕРІРїР°РґРµРЅРёР№ РІ СЂРµРїРѕР·РёС‚РѕСЂРёРё.

**РљРѕРјРјРёС‚:** `docs: remove local absolute paths from docs`

---

## 2026-06-25 вЂ” Р¤РёРєСЃ РїСѓСЃС‚РѕРіРѕ СЌРєСЂР°РЅР°, logout Рё active-СЃРѕСЃС‚РѕСЏРЅРёСЏ РјРµРЅСЋ (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:**
- РСЃРїСЂР°РІР»РµРЅ РїСѓСЃС‚РѕР№ РіР»Р°РІРЅС‹Р№ СЌРєСЂР°РЅ РїРѕСЃР»Рµ РѕР±РЅРѕРІР»РµРЅРёСЏ: `showScreen()` С‚РµРїРµСЂСЊ СЃР±СЂР°СЃС‹РІР°РµС‚ РІР»РѕР¶РµРЅРЅС‹Р№ scroll-РєРѕРЅС‚РµР№РЅРµСЂ `#home`.
- РЈР±СЂР°РЅС‹ РґСѓР±Р»РёСЂСѓСЋС‰РёРµСЃСЏ `id` Сѓ РїСѓРЅРєС‚РѕРІ РЅРёР¶РЅРµР№ РЅР°РІРёРіР°С†РёРё; active-СЃРѕСЃС‚РѕСЏРЅРёРµ РїРµСЂРµРІРµРґРµРЅРѕ РЅР° `data-nav`.
- Р”РѕР±Р°РІР»РµРЅР° РїРѕРґСЃРІРµС‚РєР° Р°РєС‚РёРІРЅРѕРіРѕ РїСѓРЅРєС‚Р° РґР»СЏ РѕР±РµРёС… РЅР°РІРёРіР°С†РёР№, РІРєР»СЋС‡Р°СЏ РјРёРєСЂРѕС„РѕРЅ.
- РСЃРїСЂР°РІР»РµРЅ logout: РІС‹С…РѕРґ Р±РѕР»СЊС€Рµ РЅРµ РїРѕР»Р°РіР°РµС‚СЃСЏ РЅР° `window.location.reload()`, Р° СЏРІРЅРѕ С‡РёСЃС‚РёС‚ СЃРѕСЃС‚РѕСЏРЅРёРµ Рё РїРѕРєР°Р·С‹РІР°РµС‚ СЌРєСЂР°РЅ РІС…РѕРґР°.
- Р”РѕР±Р°РІР»РµРЅ auth-guard РІ `showScreen()`: Р±РµР· С‚РѕРєРµРЅР° РїСЂРёРІР°С‚РЅС‹Рµ СЌРєСЂР°РЅС‹ Р±РѕР»СЊС€Рµ РЅРµ РїРѕРєР°Р·С‹РІР°СЋС‚ РґРµС„РѕР»С‚РЅРѕРіРѕ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ.
- VK-Р°РґР°РїС‚РµСЂ РІ `index.html` С‚РµРїРµСЂСЊ РІРєР»СЋС‡Р°РµС‚СЃСЏ С‚РѕР»СЊРєРѕ РїСЂРё СЂРµР°Р»СЊРЅС‹С… VK launch-РїР°СЂР°РјРµС‚СЂР°С…, С‡С‚РѕР±С‹ РЅРµ РїРµСЂРµС…РІР°С‚С‹РІР°С‚СЊ `showScreen('login')` РІРЅРµ VK.

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** 22 / 22 СЃРѕРІРїР°РґРµРЅРёР№ РїРѕ `Р’РѕР№С‚Рё|Р—Р°РґР°С‡Рё|РЎРµРіРѕРґРЅСЏ`.

**РўРµСЃС‚:** Р»РѕРєР°Р»СЊРЅР°СЏ СЂР°Р·РґР°С‡Р° `python3 -m http.server 8000`; in-app browser mobile viewport 390x844. РџСЂРѕРІРµСЂРµРЅРѕ: home РїРѕСЃР»Рµ РїСЂРёРЅСѓРґРёС‚РµР»СЊРЅРѕРіРѕ scroll РІРЅРёР· РІРѕР·РІСЂР°С‰Р°РµС‚СЃСЏ РЅР° `scrollTop=0`, `voice` РЅРµ РІРёРґРµРЅ РїРѕРІРµСЂС… home, active stroke РґР»СЏ tasks/calendar/chats/brain Р·РµР»С‘РЅС‹Р№, logout РїРµСЂРµРІРѕРґРёС‚ РЅР° `login`, СЃРєСЂС‹РІР°РµС‚ РЅРёР¶РЅРµРµ РјРµРЅСЋ Рё СѓРґР°Р»СЏРµС‚ token, РїСЂСЏРјРѕР№ `showScreen('profile')` Р±РµР· token РїРµСЂРµРІРѕРґРёС‚ РЅР° `login`.

**РљРѕРјРјРёС‚:** N/A вЂ” РєРѕРјРјРёС‚/РїСѓС€ РЅРµ РІС‹РїРѕР»РЅСЏР»СЃСЏ.

---

## 2026-06-25 вЂ” РџРѕРґРіРѕС‚РѕРІРєР° СЂР°Р±РѕС‡РµР№ РїР°РїРєРё Рє СЂР°Р·СЂР°Р±РѕС‚РєРµ Рё С‚РµСЃС‚РёСЂРѕРІР°РЅРёСЋ (Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:**
- РЎРѕР·РґР°РЅС‹ `FILE_MAP.md`, `FILE_MAP_UI.md`, `FILE_MAP_WORKER.md`, `FILE_MAP_BOT.md`
- Р”РѕР±Р°РІР»РµРЅ `.gitignore` РґР»СЏ СЃРёСЃС‚РµРјРЅС‹С… Рё Р»РѕРєР°Р»СЊРЅС‹С… С„Р°Р№Р»РѕРІ
- РћР±РЅРѕРІР»РµРЅС‹ `AGENTS.md`, `CLAUDE.md`, `COWORK_INSTRUCTIONS.md` РїРѕРґ С‚РµРєСѓС‰РёР№ checkout СЂРµРїРѕР·РёС‚РѕСЂРёСЏ
- РћР±РЅРѕРІР»С‘РЅ `README.md` РєР°Рє Р±С‹СЃС‚СЂС‹Р№ СЃС‚Р°СЂС‚ РґР»СЏ РЅРѕРІС‹С… Р°РіРµРЅС‚РѕРІ
- РЈС‚РѕС‡РЅС‘РЅ PM/QA-РєРѕРЅС‚СѓСЂ С‡РµСЂРµР· `pm/bugs.md` Рё `pm/roadmap.md`

**РџСЂРѕРІРµСЂРєР° РєРѕРґРёСЂРѕРІРєРё:** `index.html` РЅРµ РёР·РјРµРЅСЏР»СЃСЏ.

**РўРµСЃС‚:** Р»РѕРєР°Р»СЊРЅР°СЏ СЂР°Р·РґР°С‡Р° С‡РµСЂРµР· `python3 -m http.server 8000`; `index.html`, `vk.html`, `privacy.html` РѕС‚РІРµС‡Р°СЋС‚ `200 OK`.

**РљРѕРјРјРёС‚:** N/A вЂ” РёР·РјРµРЅРµРЅРёСЏ РїРѕРґРіРѕС‚РѕРІР»РµРЅС‹ Р»РѕРєР°Р»СЊРЅРѕ, РєРѕРјРјРёС‚/РїСѓС€ РЅРµ РІС‹РїРѕР»РЅСЏР»СЃСЏ.

---

### 2026-06-11 вЂ” РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ РІРѕСЂРєРµСЂР°

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** init worker + CI/CD; РЅР°СЃС‚СЂРѕР№РєР° GitHub Actions; СЃРµРєСЂРµС‚С‹ С‡РµСЂРµР· env.

**РџР°С‚С‚РµСЂРЅ РїСЂРѕР±Р»РµРј РІ СЌС‚РѕС‚ РґРµРЅСЊ:**
- chatId fallback РёСЃРїРѕР»СЊР·РѕРІР°Р» global РІРјРµСЃС‚Рѕ telegramId в†’ РёСЃРїСЂР°РІР»РµРЅРѕ
- KV binding РЅРµ Р±С‹Р» РїСЂРѕРїРёСЃР°РЅ РІ wrangler.toml в†’ РёСЃРїСЂР°РІР»РµРЅРѕ
- РџРѕРїС‹С‚РєР° СЃРѕС…СЂР°РЅСЏС‚СЊ Р·Р°РґР°С‡Рё РїРѕ telegramUserId в†’ 2 СЂР°Р·Р° revert (РЅРµСЃС‚Р°Р±РёР»СЊРЅРѕРµ РїРѕРІРµРґРµРЅРёРµ)
- РС‚РѕРі: РїРµСЂРµРґР°РІР°С‚СЊ chatId СЏРІРЅРѕ РїСЂРё СЃРѕС…СЂР°РЅРµРЅРёРё Р·Р°РґР°С‡Рё

---

### 2026-06-11 вЂ” Р РµС„Р°РєС‚РѕСЂРёРЅРі bot.js

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** `bot.js` СЂР°Р·Р±РёС‚ РЅР° РјРѕРґСѓР»Рё `src/bot/` (config, analyzer, tasks, reminders, commands, handler, index).

**РЎС‚Р°С‚СѓСЃ:** Р·Р°РґРµРїР»РѕРµРЅРѕ, СЃС‚Р°Р±РёР»СЊРЅРѕ.

---

### 2026-06-11 вЂ” РќР°С‡Р°Р»Рѕ VK Mini Apps РёРЅС‚РµРіСЂР°С†РёРё

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** backup РєРѕРјРјРёС‚ в†’ РґРѕР±Р°РІР»РµРЅ CORS `Access-Control-Allow-Credentials` в†’ РґРѕР±Р°РІР»РµРЅ СЌРЅРґРїРѕРёРЅС‚ `/auth/vk` Рё `handleVKAuth` в†’ РґРѕР±Р°РІР»РµРЅ `vk.html` frontend РІ worker.

---

### 2026-06-11 вЂ” VK Mini App РІ 4e-app

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** `vk.html` РґРѕР±Р°РІР»РµРЅ РІ 4e-app; Р·Р°РіСЂСѓР·РєР° Р·Р°РґР°С‡ РёР· KV РїРѕСЃР»Рµ VK auth; VK Bridge auto-login.

**РџР°С‚С‚РµСЂРЅ РїСЂРѕР±Р»РµРј:**
- РљРѕРґРёСЂРѕРІРєР° СЃР»РѕРјР°Р»Р°СЃСЊ РїРѕСЃР»Рµ VK РїСЂР°РІРѕРє в†’ 2 restore РєРѕРјРјРёС‚Р° + reset
- РЁСЂРёС„С‚С‹: Google Fonts РЅРµ РіСЂСѓР·СЏС‚СЃСЏ РІ VK iframe в†’ Р·Р°РјРµРЅРµРЅРѕ РЅР° system font stack
- URL AI С‡Р°С‚Р° Р±С‹Р» РЅРµРІРµСЂРЅС‹Рј в†’ РёСЃРїСЂР°РІР»РµРЅРѕ РЅР° `/anthropic`

---

### 2026-06-16 вЂ” РЎС‚Р°Р±РёР»РёР·Р°С†РёСЏ VK + AI С‡Р°С‚

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:**
- AI chat URL в†’ `/anthropic`
- AI chat prompt вЂ” СѓР±СЂР°РЅС‹ Р»РёС€РЅРёРµ РІРѕРїСЂРѕСЃС‹
- Chat history persistence + РїРµСЂРµР·Р°РіСЂСѓР·РєР° Р·Р°РґР°С‡ РїРѕСЃР»Рµ РѕС‚РІРµС‚Р° AI
- Р—Р°РіСЂСѓР·РєР° Р·Р°РґР°С‡ РїРѕ С‚РѕРєРµРЅСѓ Р±РµР· chatId
- РџРµСЂРµРґР°С‡Р° Р·Р°РґР°С‡ РІ system prompt AI

**РЎС‚Р°С‚СѓСЃ:** Р·Р°РґРµРїР»РѕРµРЅРѕ.

---

### 2026-06-16 вЂ” Р”РѕРєСѓРјРµРЅС‚Р°С†РёСЏ РґР»СЏ Р°РіРµРЅС‚РѕРІ

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** РґРѕР±Р°РІР»РµРЅС‹ `COWORK_INSTRUCTIONS.md`, `docs/tasks/TASK_TEMPLATE.md`, `AGENTS.md`.

**РЎС‚Р°С‚СѓСЃ:** СЂРµРїРѕ СЃРѕРґРµСЂР¶РёС‚ РёРЅСЃС‚СЂСѓРєС†РёРё РґР»СЏ РњРёРјРѕ Рё Codex.

---

## 2026-06-20 вЂ” Р®СЂРёРґРёС‡РµСЃРєРѕРµ СЃРѕРѕС‚РІРµС‚СЃС‚РІРёРµ 152-Р¤Р— (РїРѕРґРіРѕС‚РѕРІРєР° Claude)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:**
- РџСЂРѕРІРµРґС‘РЅ Р°РЅР°Р»РёР· СЂРёСЃРєРѕРІ РїРѕ 152-Р¤Р—: Р»РѕРєР°Р»РёР·Р°С†РёСЏ, Р±РёРѕРјРµС‚СЂРёСЏ, СЂРµРіРёСЃС‚СЂР°С†РёСЏ Р РљРќ
- РЎРѕР·РґР°РЅР° `4e-app/privacy.html` вЂ” РџРѕР»РёС‚РёРєР° РєРѕРЅС„РёРґРµРЅС†РёР°Р»СЊРЅРѕСЃС‚Рё (РіРѕС‚РѕРІР° Рє РґРµРїР»РѕСЋ)
- РЎРѕР·РґР°РЅ `redesign/patches/09_biometric_consent.html` вЂ” СЌРєСЂР°РЅ СЃРѕРіР»Р°СЃРёСЏ РЅР° РіРѕР»РѕСЃ (СЃС‚. 11)
- РЎРѕР·РґР°РЅ `RKN_CHECKLIST.md` вЂ” С‡РµРє-Р»РёСЃС‚ СЃ РґР°РЅРЅС‹РјРё РґР»СЏ СѓРІРµРґРѕРјР»РµРЅРёСЏ Р РљРќ

**РљСЂРёС‚РёС‡РµСЃРєРёРµ СЂРёСЃРєРё (С‚СЂРµР±СѓСЋС‚ РґРµР№СЃС‚РІРёР№):**
1. РќРµС‚ СЂРµРіРёСЃС‚СЂР°С†РёРё РІ Р РљРќ вЂ” С€С‚СЂР°С„ 100вЂ“300 С‚С‹СЃ. в†’ Р®СЂРёР№ РїРѕРґР°С‘С‚ СѓРІРµРґРѕРјР»РµРЅРёРµ С‡РµСЂРµР· pd.rkn.gov.ru
2. Р“РѕР»РѕСЃ Р±РµР· РїРёСЃСЊРјРµРЅРЅРѕРіРѕ СЃРѕРіР»Р°СЃРёСЏ вЂ” С€С‚СЂР°С„ РґРѕ 500 С‚С‹СЃ. в†’ Codex СѓСЃС‚Р°РЅР°РІР»РёРІР°РµС‚ РїР°С‚С‡ 09
3. Р”Р°РЅРЅС‹Рµ РІРЅРµ Р Р¤ (Cloudflare) вЂ” С€С‚СЂР°С„ РґРѕ 18 РјР»РЅ в†’ СЂРµС€Р°РµС‚СЃСЏ РјРёРіСЂР°С†РёРµР№ РЅР° Yandex Cloud

**РЎС‚Р°С‚СѓСЃ Codex:** Р¤Р°Р·Р° 9 СѓСЃС‚Р°РЅРѕРІР»РµРЅР° 2026-06-25 РІ СЂР°РјРєР°С… BACK-003; РёРЅСЃС‚СЂСѓРєС†РёРё РёР· CODEX_INSTRUCTIONS.md РІС‹РїРѕР»РЅРµРЅС‹ Р»РѕРєР°Р»СЊРЅРѕ.

---

## 2026-06-20 вЂ” РџРѕРґРіРѕС‚РѕРІРєР° Рє СЂРµРґРёР·Р°Р№РЅСѓ (СЃРµСЃСЃРёСЏ Codex)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:**
- РЎРѕР·РґР°РЅС‹ Р±СЌРєР°РїС‹: `index_original.html` (РєРѕРїРёСЏ index.html) Рё `vk_backup.html` (РєРѕРїРёСЏ vk.html)
- РЎРµСЃСЃРёСЏ Codex Р·Р°РІРµСЂС€РёР»Р°СЃСЊ РёСЃС‡РµСЂРїР°РЅРёРµРј С‚РѕРєРµРЅРѕРІ РґРѕ СѓСЃС‚Р°РЅРѕРІРєРё РїР°С‚С‡РµР№

**Р§С‚Рѕ РќР• СЃРґРµР»Р°РЅРѕ:** РЅРё РѕРґРЅР° РёР· 8 С„Р°Р· СЂРµРґРёР·Р°Р№РЅР° РЅРµ СѓСЃС‚Р°РЅРѕРІР»РµРЅР°

**РЎРѕСЃС‚РѕСЏРЅРёРµ:** index.html С‡РёСЃС‚С‹Р№, РєРёСЂРёР»Р»РёС†Р° РІ РїРѕСЂСЏРґРєРµ, Р±СЌРєР°РїС‹ РіРѕС‚РѕРІС‹

**РЎР»РµРґСѓСЋС‰РёР№ СЃРµР°РЅСЃ:** РЅР°С‡Р°С‚СЊ СЃ Р¤Р°Р·С‹ 1 вЂ” `redesign/patches/01_light_theme.css`  
РџР°С‚С‡Рё Р»РµР¶Р°С‚ РІ `redesign/patches/`, РµСЃР»Рё СЌС‚Р° РїР°РїРєР° РµСЃС‚СЊ РІ С‚РµРєСѓС‰РµРј checkout.

---

## 2026-06-20 вЂ” Warmup-СЃРѕРµРґРёРЅРµРЅРёРµ VK (Claude + Р®СЂРёР№)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** РґРѕР±Р°РІР»РµРЅР° `warmupConnection()` РІ `vk.html` вЂ” С‚РёС…РёР№ GET РЅР° `edge.4-ai.site` РїСЂРё Р·Р°РіСЂСѓР·РєРµ СЃС‚СЂР°РЅРёС†С‹ РґРѕ РїРµСЂРІРѕРіРѕ РєР»РёРєР°. РњР°СЂРєРµСЂ: `vk-auth-warmup-20260620-7`. Commit `00c1a45`.

**РџСЂРѕР±Р»РµРјР°:** VK WebView С…РѕР»РѕРґРЅС‹Р№ СЃС‚Р°СЂС‚ вЂ” DNS+TLS Р·Р°РЅРёРјР°Р» ~15 СЃРµРє. Recovery РёР· CODEX-055 (900ms) РЅРµ СѓСЃРїРµРІР°Р», РїРµСЂРІС‹Р№ РєР»РёРє РїР°РґР°Р» СЃ РѕС€РёР±РєРѕР№ СЃРѕРµРґРёРЅРµРЅРёСЏ.

**Р РµР·СѓР»СЊС‚Р°С‚:** РІС…РѕРґ СЃ РїРµСЂРІРѕРіРѕ РєР»РёРєР° Р±РµР· РѕС€РёР±РєРё вњ…. РќРµР±РѕР»СЊС€Р°СЏ Р·Р°РґРµСЂР¶РєР° (~5вЂ“8 СЃРµРє) РїРѕСЃР»Рµ РєР»РёРєР° РѕСЃС‚Р°С‘С‚СЃСЏ вЂ” РїСЂРёРµРјР»РµРјРѕ РґР»СЏ РІРЅСѓС‚СЂРµРЅРЅРµРіРѕ С‚РµСЃС‚РёСЂРѕРІР°РЅРёСЏ.

---

## 2026-06-20 вЂ” Р РµРґРёР·Р°Р№РЅ index.html (С„Р°Р·С‹ 1вЂ“8) (Claude + Р®СЂРёР№)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** РїРѕР»РЅС‹Р№ СЂРµРґРёР·Р°Р№РЅ `index.html` вЂ” РІСЃРµ 8 РїР°С‚С‡РµР№ СѓСЃС‚Р°РЅРѕРІР»РµРЅС‹ Рё Р·Р°РґРµРїР»РѕРµРЅС‹ Р·Р° РѕРґРЅСѓ СЃРµСЃСЃРёСЋ.

| Р¤Р°Р·Р° | РљРѕРјРјРёС‚ | РЎРѕРґРµСЂР¶Р°РЅРёРµ |
|------|--------|------------|
| 1вЂ“3 | `90e23c6`, `2f02999`, `ffeb8d4` | РЎРІРµС‚Р»Р°СЏ С‚РµРјР°, С„РёР»СЊС‚СЂС‹ Р·Р°РґР°С‡, 4 РЅРѕРІС‹С… СЌРєСЂР°РЅР° |
| 4 | `964cbb8` | РљР°СЂС‚РѕС‡РєР° Р·Р°РґР°С‡Рё: РїРѕР»СЏ-СЃС‚СЂРѕРєРё + С‚Р°Р±С‹ + 3 РєРЅРѕРїРєРё РґРµР№СЃС‚РІРёР№ |
| 5 | `964cbb8` | Р“РѕР»РѕСЃРѕРІРѕР№ СЌРєСЂР°РЅ: РїРѕР»РЅРѕСЌРєСЂР°РЅРЅС‹Р№ `#voice` СЃ РїСѓР»СЊСЃРёСЂСѓСЋС‰РµР№ РєРЅРѕРїРєРѕР№ |
| 6 | `964cbb8` | Р§Р°С‚С‹: РєСЂСѓРіР»С‹Рµ РёРєРѕРЅРєРё РјРµСЃСЃРµРЅРґР¶РµСЂРѕРІ; РљР°Р»РµРЅРґР°СЂСЊ: СЃРµРєС†РёСЏ РґРµРґР»Р°Р№РЅРѕРІ |
| 7 | `9dabe64` | РђРґР°РїС‚РёРІРЅС‹Р№ CSS: hover-СЌС„С„РµРєС‚С‹, tablet sidebar, desktop 3-РєРѕР»РѕРЅРєР° |
| 8 | `9dabe64` | VK Р°РґР°РїС‚РµСЂ: С‚РµРјР°, С…Р°РїС‚РёРєРё, safe area, swipe back, VK Storage |

**РљР»СЋС‡РµРІС‹Рµ С‚РµС…РЅРёС‡РµСЃРєРёРµ СЂРµС€РµРЅРёСЏ:**
- `voice-overlay` в†’ РїРѕР»РЅРѕСЌРєСЂР°РЅРЅС‹Р№ `screen#voice`, `openVoice()` С‚РµРїРµСЂСЊ `showScreen('voice')`
- `detail-title-v2`, `detail-person-v2` в†’ РЅРѕРІС‹Рµ ID `detail-title`, `detail-person`
- `.msng-tabs` в†’ `.msng-icons-row` (48px РєСЂСѓРіР»С‹Рµ РёРєРѕРЅРєРё)
- Р”РѕР±Р°РІР»РµРЅС‹ С„СѓРЅРєС†РёРё: `completeTask`, `switchDetailTab`, `editDetailField`, `openTaskMove`, `enterEditMode`, `makeDetailEditable`, `toggleVoice`, `showVoiceInfo`
- VK Р°РґР°РїС‚РµСЂ Р°РєС‚РёРІРёСЂСѓРµС‚СЃСЏ С‚РѕР»СЊРєРѕ РµСЃР»Рё `window.vkBridge !== undefined` (РЅРµ Р·Р°С‚СЂР°РіРёРІР°РµС‚ TG)

**РљРёСЂРёР»Р»РёС†Р°:** 27 СЃРѕРІРїР°РґРµРЅРёР№ вЂ” РЅРѕСЂРјР° РЅР° РїСЂРѕС‚СЏР¶РµРЅРёРё РІСЃРµР№ СЃРµСЃСЃРёРё.

---

---

## 2026-06-20 вЂ” Post-Codex: РџР°С‚С‡Рё РіР»Р°РІРЅРѕРіРѕ СЌРєСЂР°РЅР° (Claude + Р®СЂРёР№)

**РљРѕРЅС‚РµРєСЃС‚:** Codex РїСЂРёРјРµРЅРёР» С„Р°Р·С‹ 1вЂ“8 РЅРѕ РїР°С‚С‡ 02 (РіР»Р°РІРЅС‹Р№ СЌРєСЂР°РЅ) Р±С‹Р» РїСЂРёРјРµРЅС‘РЅ С‡Р°СЃС‚РёС‡РЅРѕ вЂ” С‚РѕР»СЊРєРѕ С„РёР»СЊС‚СЂ-С‚Р°Р±С‹. Р’РµСЃСЊ РѕСЃРЅРѕРІРЅРѕР№ РєРѕРЅС‚РµРЅС‚ (`focus-day-card`, `stat-mini`, `home-task-list`) РѕСЃС‚Р°Р»СЃСЏ РІ СЃС‚Р°СЂРѕР№ РІРµСЂСЃС‚РєРµ.

**Р§С‚Рѕ РёСЃРїСЂР°РІР»РµРЅРѕ:**
- РџРѕР»РЅР°СЏ Р·Р°РјРµРЅР° Р±Р»РѕРєР° `#home` РЅР° С†РµР»РµРІРѕР№ РґРёР·Р°Р№РЅ РёР· РїР°С‚С‡Р° 02
- РСЃРїСЂР°РІР»РµРЅ Р±Р°Рі CSS: `.task-row{flex-direction:column}` РЅР° СЃС‚СЂРѕРєРµ 147 РїРµСЂРµРѕРїСЂРµРґРµР»СЏР» РЅРѕРІС‹Р№ CSS в†’ РёСЃРїСЂР°РІР»РµРЅРѕ РЅР° `flex-direction:row`
- Р’РѕСЃСЃС‚Р°РЅРѕРІР»РµРЅР° РєРЅРѕРїРєР° Р°РІР°С‚Р°СЂР° РїСЂРѕС„РёР»СЏ (РїСЂРѕРїР°Р»Р° РїСЂРё Р·Р°РјРµРЅРµ С€Р°РїРєРё)
- РСЃРїСЂР°РІР»РµРЅРѕ: С‚РµРјР° darkв†’light РЅРµ РїРµСЂРµРєР»СЋС‡Р°Р»Р°СЃСЊ (toggle РѕР±РЅРѕРІР»СЏР» `<body>`, Р° CSS С‡РёС‚Р°Р» `<html>`)

**РљР»СЋС‡РµРІС‹Рµ РЅРѕРІС‹Рµ ID РІ JS (Р±С‹Р»Рё СЃС‚Р°СЂС‹Рµ, СЃС‚Р°Р»Рё РЅРѕРІС‹Рµ):**
- `focus-bar-text` в†’ `focus-day-text`
- `lime-card` в†’ `home-task-list`
- `dash-done-today` в†’ `stat-done`, `dash-tasks-today` в†’ `stat-tasks`, `dash-prom-today` в†’ `stat-promises`

**РљРѕРјРјРёС‚С‹:** `0b641ba`, `aa35941`

---

## 2026-06-20 вЂ” РђРЅРёРјР°С†РёСЏ РїР»Р°РЅРµС‚С‹ + СЂРµРґРёР·Р°Р№РЅ РєР°СЂС‚РѕС‡РµРє Р·Р°РґР°С‡ (Claude + Р®СЂРёР№)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:**
- РЈР±СЂР°РЅ Lottie CDN (РЅРµ СЂР°Р±РѕС‚Р°Р» РІ TG WebView) в†’ inline SVG-Р°РЅРёРјР°С†РёСЏ СЃ `<animateMotion>` (СЃРїСѓС‚РЅРёРєРё, РѕСЂР±РёС‚С‹, СЃРІРµС‡РµРЅРёРµ) вЂ” СЂР°Р±РѕС‚Р°РµС‚ Р±РµР· Р·Р°РІРёСЃРёРјРѕСЃС‚РµР№
- Р”РѕР±Р°РІР»РµРЅР° sparkle-РёРєРѕРЅРєР° РІ Р»РµРІСѓСЋ С‡Р°СЃС‚СЊ РєР°СЂС‚РѕС‡РєРё В«Р¤РѕРєСѓСЃ РґРЅСЏВ»
- РљР°СЂС‚РѕС‡РєРё Р·Р°РґР°С‡: РЅРѕРІС‹Р№ РїРѕСЂСЏРґРѕРє СЌР»РµРјРµРЅС‚РѕРІ `[в„–][Р±РµР№РґР¶][С‚РµРєСЃС‚/РґР°С‚Р°][вЂє]`, Р±РµР№РґР¶Рё В«Р Р°Р±РѕС‚Р°В»/В«Р›РёС‡РЅРѕРµВ» РІРјРµСЃС‚Рѕ В«РіРѕСЂРёС‚В»/В«Р·Р°РґР°С‡Р°В»/В«РґРѕР»Р¶РЅС‹В»
- РљР°Р¶РґР°СЏ РєР°СЂС‚РѕС‡РєР° Р·Р°РґР°С‡Рё С‚РµРїРµСЂСЊ РёРјРµРµС‚ СЃРѕР±СЃС‚РІРµРЅРЅС‹Р№ С„РѕРЅ (`card2` + border-radius 14px + border) вЂ” РЅРµ РїСЂРѕСЃС‚Рѕ СЂР°Р·РґРµР»РёС‚РµР»СЊ

**РљРѕРјРјРёС‚С‹:** `29f25a7`

---

## 2026-06-20 вЂ” UI-РїРѕР»РёСЂРѕРІРєР°: СЃРІРµС‚Р»Р°СЏ С‚РµРјР°, nav, РІРєР»Р°РґРєР° В«РћР±СЃСѓРґРёС‚СЊВ» (Claude + Р®СЂРёР№)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:**

| РџСЂР°РІРєР° | РћРїРёСЃР°РЅРёРµ |
|--------|----------|
| РЎРІРµС‚Р»Р°СЏ С‚РµРјР° | РЈСЃРёР»РµРЅ glow СЃРІРµСЂС…Сѓ (`home-glow`); Р±РµР»С‹Р№ С„РѕРЅ `.bottom-nav` РІ light mode |
| РџР»Р°РЅРµС‚Р° | РЈРјРµРЅСЊС€РµРЅР° СЃ 148px РґРѕ 118px вЂ” РЅРµ РєР°СЃР°РµС‚СЃСЏ С‚РµРєСЃС‚Р° Рё РєСЂР°С‘РІ РєР°СЂС‚РѕС‡РєРё |
| Nav СѓРЅРёС„РёРєР°С†РёСЏ | `global-nav` С‚РµРїРµСЂСЊ: С‡Р°С‚С‹ \| stats \| mic \| tasks \| brain вЂ” РєР°Рє РІ home; СѓРґР°Р»С‘РЅ РїСЂРѕС„РёР»СЊ |
| Р’РєР»Р°РґРєР° В«РћР±СЃСѓРґРёС‚СЊВ» | Р’ РґРµС‚Р°Р»РёР·Р°С†РёРё Р·Р°РґР°С‡Рё: С‚Р°Р± В«РћР±СЃСѓРґРёС‚СЊВ» в†’ AI РіРµРЅРµСЂРёСЂСѓРµС‚ СЃРѕРІРµС‚ + РІРѕРїСЂРѕСЃ, РґР°Р»РµРµ РїРѕР»РЅРѕС†РµРЅРЅС‹Р№ С‡Р°С‚ РїРѕ Р·Р°РґР°С‡Рµ |
| РЈР±СЂР°РЅ В«РЎРѕРІРµС‚ РѕС‚ 4В» | Р‘Р»РѕРє `detail-ai-sec` СѓРґР°Р»С‘РЅ; С„СѓРЅРєС†РёРѕРЅР°Р» РїРµСЂРµРЅРµСЃС‘РЅ РІ РІРєР»Р°РґРєСѓ В«РћР±СЃСѓРґРёС‚СЊВ» |

**РќРѕРІС‹Рµ JS-С„СѓРЅРєС†РёРё:** `startDiscussAdvice()`, `sendDiscussMessage()`, `addDiscussMsg()`, `updateDiscussLoading()`

**РљРѕРјРјРёС‚:** Р·Р°РґРµРїР»РѕРµРЅРѕ

**РћС‚РєСЂС‹С‚С‹Рµ РїСѓРЅРєС‚С‹ РёР· Р·Р°РїСЂРѕСЃРѕРІ Р®СЂРёСЏ, РєРѕС‚РѕСЂС‹Рµ РќР• СЃРґРµР»Р°РЅС‹:**
- РћС‚РЅРѕСЃРёС‚РµР»СЊРЅС‹Рµ РґР°С‚С‹ РІ РєР°СЂС‚РѕС‡РєР°С… Р·Р°РґР°С‡ (В«РЎРµРіРѕРґРЅСЏВ», В«Р—Р°РІС‚СЂР°В» РІРјРµСЃС‚Рѕ ISO)  
- Р¤Р°Р·Р° 9 (СЃРѕРіР»Р°СЃРёРµ РЅР° Р±РёРѕРјРµС‚СЂРёСЋ) вЂ” Р·Р°РєСЂС‹С‚Р° 2026-06-25, СЃРј. BACK-003 РІС‹С€Рµ
- Backend: email-СЂР°СЃСЃС‹Р»РєР° С‡РµСЂРµР· Resend СЃР»РѕРјР°РЅР°

---

## 2026-06-20 вЂ” РџСЂРѕРјРѕ-СЃС‚СЂР°С‚РµРіРёСЏ: SEO-Р±Р»РѕРі + Р’РљРѕРЅС‚Р°РєС‚Рµ (Claude + Р®СЂРёР№)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:**
- РЎРѕР·РґР°РЅ `4-ai-blog/` вЂ” СЃС‚Р°С‚РёС‡РµСЃРєРёР№ HTML-Р±Р»РѕРі РґР»СЏ РґРµРїР»РѕСЏ РЅР° 4-ai.site (GitHub Pages)
- 3 SEO-СЃС‚Р°С‚СЊРё РїРѕРґ РЅРёР·РєРѕРєРѕРЅРєСѓСЂРµРЅС‚РЅС‹Рµ Р·Р°РїСЂРѕСЃС‹:
  - В«AI-СЃРµРєСЂРµС‚Р°СЂСЊ РІ Telegram: РєР°Рє РЅРµ РґРµСЂР¶Р°С‚СЊ Р·Р°РґР°С‡Рё РІ РіРѕР»РѕРІРµВ»
  - В«Р“РѕР»РѕСЃРѕРІРѕРµ СѓРїСЂР°РІР»РµРЅРёРµ Р·Р°РґР°С‡Р°РјРё: РїРѕС‡РµРјСѓ СЌС‚Рѕ Р±С‹СЃС‚СЂРµРµ Р»СЋР±РѕРіРѕ РїСЂРёР»РѕР¶РµРЅРёСЏВ»
  - В«РљР°Рє РЅРµ Р·Р°Р±С‹РІР°С‚СЊ РІР°Р¶РЅС‹Рµ РґРµР»Р°: РјРµС‚РѕРґ СѓРјРЅС‹С… РЅР°РїРѕРјРёРЅР°РЅРёР№В»
- `sitemap.xml`, `robots.txt`, JSON-LD structured data РІ РєР°Р¶РґРѕР№ СЃС‚СЂР°РЅРёС†Рµ
- `VK_CONTENT_PLAN.md` вЂ” 10 РіРѕС‚РѕРІС‹С… РїРѕСЃС‚РѕРІ СЃ С‚РµРєСЃС‚Р°РјРё Рё С…СЌС€С‚РµРіР°РјРё РґР»СЏ Р’РљРѕРЅС‚Р°РєС‚Рµ
- `DEPLOY.md` вЂ” РёРЅСЃС‚СЂСѓРєС†РёСЏ РїРѕ РїРѕРґРєР»СЋС‡РµРЅРёСЋ РґРѕРјРµРЅР° 4-ai.site С‡РµСЂРµР· GitHub Pages

**РЎС‚Р°С‚СѓСЃ:** С„Р°Р№Р»С‹ РіРѕС‚РѕРІС‹, РґРµРїР»РѕР№ С‚СЂРµР±СѓРµС‚ СЂСѓС‡РЅС‹С… РґРµР№СЃС‚РІРёР№ (РЅР°СЃС‚СЂРѕР№РєР° DNS, РЅРѕРІС‹Р№ GitHub СЂРµРїРѕ)

**РЎР»РµРґСѓСЋС‰РёРµ СЃС‚Р°С‚СЊРё РґР»СЏ Р±Р»РѕРіР° (С‚РµРјС‹):** GTD РґР»СЏ РЅР°С‡РёРЅР°СЋС‰РёС…, 5 TG-Р±РѕС‚РѕРІ РґР»СЏ РїСЂРѕРґСѓРєС‚РёРІРЅРѕСЃС‚Рё, AI vs РїР»Р°РЅРёСЂРѕРІС‰РёРє, СѓС‚СЂРµРЅРЅСЏСЏ СЂСѓС‚РёРЅР°.

---

## 2026-06-20 вЂ” Codex: Backend-РёРЅС„СЂР°СЃС‚СЂСѓРєС‚СѓСЂР° (D1 СЃС…РµРјР° + Р±РµР·РѕРїР°СЃРЅРѕСЃС‚СЊ)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ Codex (С‚РµРєСѓС‰Р°СЏ СЃРµСЃСЃРёСЏ):**

| Р¤Р°Р№Р» | Р§С‚Рѕ |
|------|-----|
| `4e-worker/migrations/0001_initial_schema.sql` | РџРѕР»РЅР°СЏ D1/PostgreSQL СЃС…РµРјР° вЂ” users, auth, sessions, tasks, reminders, AI threads/memories |
| `src/bot/worker-client.js` | HMAC-РїРѕРґРїРёСЃР°РЅРЅС‹Рµ Р·Р°РїСЂРѕСЃС‹ Р±РѕС‚в†’РІРѕСЂРєРµСЂ (Р±РµР·РѕРїР°СЃРЅРѕСЃС‚СЊ) |
| `src/bot/tasks.js` | РџРµСЂРµС…РѕРґ РЅР° `workerFetch` вЂ” РїРѕРґРїРёСЃР°РЅРЅС‹Рµ Р·Р°РїСЂРѕСЃС‹ |
| `src/bot/reminders.js` | РџСЂРѕРІРµСЂРєР° РЅР°РїРѕРјРёРЅР°РЅРёР№ Рё РґРµРґР»Р°Р№РЅРѕРІ С‡РµСЂРµР· РІРѕСЂРєРµСЂ-СЌРЅРґРїРѕРёРЅС‚С‹ |
| `src/bot/index.js` | `setInterval` РґР»СЏ РїРµСЂРёРѕРґРёС‡РµСЃРєРёС… РїСЂРѕРІРµСЂРѕРє (15 РјРёРЅ / 1 С‡Р°СЃ) |

**РћС†РµРЅРєР° СЂР°Р±РѕС‚С‹ Codex:**
- вњ… D1-СЃС…РµРјР° вЂ” РєР°С‡РµСЃС‚РІРµРЅРЅР°СЏ, production-ready. Р РµС€Р°РµС‚ РїСЂРѕР±Р»РµРјСѓ #4 (РµРґРёРЅР°СЏ РјРѕРґРµР»СЊ TG+VK+Email), Р·Р°РєР»Р°РґС‹РІР°РµС‚ РѕСЃРЅРѕРІСѓ РїРѕРґ С„Р°Р·Сѓ 13
- вњ… HMAC-РїРѕРґРїРёСЃСЊ Р·Р°РїСЂРѕСЃРѕРІ вЂ” РїСЂР°РІРёР»СЊРЅРѕРµ Р°СЂС…РёС‚РµРєС‚СѓСЂРЅРѕРµ СЂРµС€РµРЅРёРµ, Р·Р°РєСЂС‹РІР°РµС‚ СѓСЏР·РІРёРјРѕСЃС‚СЊ
- вњ… Reminders/Deadlines вЂ” СЂРµР°Р»РёР·РѕРІР°РЅР° Р»РѕРіРёРєР° РїСЂРѕРІРµСЂРєРё С‡РµСЂРµР· РІРѕСЂРєРµСЂ
- вљ пёЏ **РћС‚РєР»РѕРЅРµРЅРёРµ РѕС‚ РїР»Р°РЅР°:** Codex СЂР°Р±РѕС‚Р°Р» РЅР°Рґ С„Р°Р·РѕР№ 13 (D1 РјРёРіСЂР°С†РёСЏ) РІРјРµСЃС‚Рѕ С„Р°Р· 9/11/12 РєРѕС‚РѕСЂС‹Рµ Р±С‹Р»Рё РІ РѕС‡РµСЂРµРґРё
- вњ… Р¤Р°Р·Р° 9 (biometric consent) вЂ” Р·Р°РєСЂС‹С‚Р° 2026-06-25, СЃРј. BACK-003 РІС‹С€Рµ
- вњ… Р¤Р°Р·Р° 11 (relative dates) вЂ” Р·Р°РєСЂС‹С‚Р° 2026-06-28, СЃРј. Р·Р°РїРёСЃСЊ РІС‹С€Рµ
- вќЊ Р¤Р°Р·Р° 12 (email + СЃР±СЂРѕСЃ РїР°СЂРѕР»СЏ) вЂ” РЅРµ СЃРґРµР»Р°РЅР°

**Р’С‹РІРѕРґ:** СЂР°Р±РѕС‚Р° С†РµРЅРЅР°СЏ, РЅРѕ РЅРµ РїРѕ РїСЂРёРѕСЂРёС‚РµС‚Сѓ. Р¤Р°Р·Р° 9 Р·Р°РєСЂС‹С‚Р° 2026-06-25; С„Р°Р·С‹ 11 Рё 12 РѕСЃС‚Р°СЋС‚СЃСЏ РІ РѕС‡РµСЂРµРґРё.

---

## 2026-06-23 вЂ” Р¤РёРєСЃС‹ РїРѕСЃР»Рµ СЂРµРґРёР·Р°Р№РЅР° (Claude + Р®СЂРёР№)

**РљРѕРЅС‚РµРєСЃС‚:** Codex РїСЂРёРјРµРЅРёР» СЂРµРґРёР·Р°Р№РЅ, РЅРѕ СЃР»РѕРјР°Р» РЅРµСЃРєРѕР»СЊРєРѕ С„СѓРЅРєС†РёР№. РџР°СЂР°Р»Р»РµР»СЊРЅРѕ Р±РѕС‚ СѓРїР°Р».

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:**

| РџСЂР°РІРєР° | Р¤Р°Р№Р» | РћРїРёСЃР°РЅРёРµ |
|--------|------|----------|
| РљРЅРѕРїРєР° РІС‹С…РѕРґР° | `index.html` | Р”РѕР±Р°РІР»РµРЅ `LOGOUT_K='chetam_logged_out'`; `doLogout()` в†’ `window.location.reload()`; TG auto-login Р±Р»РѕРєРёСЂСѓРµС‚СЃСЏ С„Р»Р°РіРѕРј |
| Р“Р°Р»РѕС‡РєР° вњ“ РЅР° РґР°С€Р±РѕСЂРґРµ | `index.html` | РљРЅРѕРїРєР° РїСЂРѕРїР°Р»Р° РїРѕСЃР»Рµ СЂРµРґРёР·Р°Р№РЅР°; РІРѕСЃСЃС‚Р°РЅРѕРІР»РµРЅР° РІ 4 РјРµСЃС‚Р°С…: `loadTasks()`, `toggleAllTasks()`, `setHomeFilter()`, `selectMonth` |
| РљРѕРЅС„Р»РёРєС‚С‹ git | `index.html` | 5+ РєРѕРЅС„Р»РёРєС‚РѕРІ РїСЂРё `git pull --rebase` вЂ” Codex РїСѓС€РёР» РїР°СЂР°Р»Р»РµР»СЊРЅРѕ; СЂР°Р·СЂРµС€РµРЅС‹ РІСЂСѓС‡РЅСѓСЋ |
| SyntaxError Р·РµР»С‘РЅС‹Р№ С„РѕРЅ | `index.html` | РџСЂРѕРїСѓС‰РµРЅРЅС‹Р№ РјР°СЂРєРµСЂ `<<<<<<< HEAD` РЅР° СЃС‚СЂРѕРєРµ ~3594 вЂ” РІС‹Р·С‹РІР°Р» РїР°РґРµРЅРёРµ РІСЃРµРіРѕ JS |
| РЎРІРѕР±РѕРґРЅРѕРµ РјРµСЃС‚Рѕ РЅР° РґРёСЃРєРµ | вЂ” | РћСЃС‚Р°Р»РѕСЃСЊ ~17 РњР‘; РѕС‡РёС‰РµРЅ TEMP в†’ ~887 РњР‘ |
| ROADMAP РѕР±РЅРѕРІР»С‘РЅ | `ROADMAP.md` | Р”РѕР±Р°РІР»РµРЅ В«Р“РѕСЂРёР·РѕРЅС‚ 0.8 вЂ” РўРµС…РЅРёС‡РµСЃРєРёР№ С„СѓРЅРґР°РјРµРЅС‚В»: LESS + BEM + РјРёРЅРёС„РёРєР°С†РёСЏ |
| npm-СЃРєСЂРёРїС‚С‹ | `package.json` | Р”РѕР±Р°РІР»РµРЅС‹ `build:css` Рё `watch:css` РґР»СЏ Р±СѓРґСѓС‰РµРіРѕ LESS-pipeline |
| Р‘РѕС‚: СѓСЃС‚РѕР№С‡РёРІРѕСЃС‚СЊ Рє РїР°РґРµРЅРёСЏРј | `src/bot/config.js` | Р”РѕР±Р°РІР»РµРЅС‹ `bot.on('polling_error')`, `process.on('unhandledRejection')`, `process.on('uncaughtException')` вЂ” Р±РѕС‚ Р±РѕР»СЊС€Рµ РЅРµ РїР°РґР°РµС‚ РѕС‚ СЃРµС‚РµРІС‹С… СЃР±РѕРµРІ Telegram |

**РџР°С‚С‚РµСЂРЅ РїСЂРѕР±Р»РµРј:**
- Codex РїСѓС€РёС‚ РІ С‚РѕС‚ Р¶Рµ РјРѕРјРµРЅС‚ С‡С‚Рѕ Рё РјС‹ в†’ РєРѕРЅС„Р»РёРєС‚С‹ РїСЂРё СЃР»РµРґСѓСЋС‰РµРј pull; СЂРµС€РµРЅРёРµ: `git pull --rebase` РїРµСЂРµРґ РїСѓС€РµРј
- Vim РѕС‚РєСЂС‹Р»СЃСЏ РїСЂРё `git rebase --continue` в†’ Р·Р°РєСЂС‹С‚ С‡РµСЂРµР· РЅРѕРІС‹Р№ С‚РµСЂРјРёРЅР°Р» + `git rebase --abort`; СѓСЃС‚Р°РЅРѕРІР»РµРЅ `git config --global core.editor notepad`

---

## 2026-06-24 вЂ” РђРІС‚РѕСЂРёР·Р°С†РёСЏ TG + API-РєР»СЋС‡ + UX РЅР°РІРёРіР°С†РёРё (Claude + Р®СЂРёР№)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:**

| РџСЂР°РІРєР° | Р¤Р°Р№Р» | РћРїРёСЃР°РЅРёРµ |
|--------|------|----------|
| Р§С‘СЂРЅС‹Р№ СЌРєСЂР°РЅ РІ TG Mini App | `index.html` | `loginWithTelegram()` С‚РµРїРµСЂСЊ РІРѕР·РІСЂР°С‰Р°РµС‚ `true/false`; РїСЂРё РЅРµСѓРґР°С‡Рµ РїРѕРєР°Р·С‹РІР°РµС‚ `showScreen('login')` РІРјРµСЃС‚Рѕ РїСѓСЃС‚РѕС‚С‹; `initApp()` РЅРµ РґРµР»Р°РµС‚ Р±РµР·СѓСЃР»РѕРІРЅС‹Р№ `return` РїРѕСЃР»Рµ TG-Р»РѕРіРёРЅР° |
| `telegramId required` РЅР° РјРѕР±РёР»Рµ | `index.html` | Р’РѕСЂРєРµСЂ Р¶РґР°Р» `body.user.id`, РїСЂРёР»РѕР¶РµРЅРёРµ СЃР»Р°Р»Рѕ С‚РѕР»СЊРєРѕ `{initData}`; РґРѕР±Р°РІР»РµРЅ `user: tgUser` РІ С‚РµР»Рѕ Р·Р°РїСЂРѕСЃР° |
| 4 | ANTHROPIC_KEY РІ worker.js РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ С‚РѕР»СЊРєРѕ PLACEHOLDER вЂ” РЅРµ РєРѕРјРјРёС‚РёС‚СЊ СЂРµР°Р»СЊРЅС‹Р№ РєР»СЋС‡ | РІС‹СЃРѕРєРёР№ |
| AI-С‡Р°С‚ РѕС€РёР±РєР° `invalid x-api-key` | вЂ” | РЎР»РµРґСЃС‚РІРёРµ РїСЂРµРґС‹РґСѓС‰РµРіРѕ; РїРѕСЃР»Рµ РѕР±РЅРѕРІР»РµРЅРёСЏ СЃРµРєСЂРµС‚Р° Рё СЂРµ-РґРµРїР»РѕСЏ в†’ СЂР°Р±РѕС‚Р°РµС‚ |
| РќР°РІРёРіР°С†РёСЏ: СЂР°Р·РЅС‹Рµ РєРЅРѕРїРєРё РїРѕ СЌРєСЂР°РЅР°Рј | `index.html` | `global-nav` (РґР»СЏ РІСЃРµС… СЌРєСЂР°РЅРѕРІ РєСЂРѕРјРµ home) РёРјРµР» 4 РґСЂСѓРіРёРµ РєРЅРѕРїРєРё; СѓРЅРёС„РёС†РёСЂРѕРІР°РЅ: С‚Рµ Р¶Рµ 5 РєРЅРѕРїРѕРє С‡С‚Рѕ РІ `bottom-nav-v2` (С‡Р°С‚С‹, СЃС‚Р°С‚РёСЃС‚РёРєР°, РјРёРєСЂРѕС„РѕРЅ, Р·Р°РґР°С‡Рё, AI) |
| РљР»Р°РІРёР°С‚СѓСЂР° РїРµСЂРµРєСЂС‹РІР°РµС‚ РїРѕР»Рµ РІРІРѕРґР° | `index.html` | РџСЂРё С„РѕРєСѓСЃРµ РЅР° `ask-field` в†’ `global-nav` СЃРєСЂС‹РІР°РµС‚СЃСЏ; РїСЂРё `blur` (СЃ Р·Р°РґРµСЂР¶РєРѕР№ 150РјСЃ) в†’ РІРѕСЃСЃС‚Р°РЅР°РІР»РёРІР°РµС‚СЃСЏ |

**РџР°С‚С‚РµСЂРЅ РїСЂРѕР±Р»РµРј:**
- Р”РІР° nav-РєРѕРјРїРѕРЅРµРЅС‚Р° СЃ СЂР°Р·РЅС‹РјРё РєРЅРѕРїРєР°РјРё (`bottom-nav-v2` РІРЅСѓС‚СЂРё `#home` + `global-nav` С„РёРєСЃРёСЂРѕРІР°РЅРЅС‹Р№) вЂ” СЃР»РµРґРёС‚СЊ С‡С‚РѕР±С‹ РїСЂРё Р±СѓРґСѓС‰РёС… РїСЂР°РІРєР°С… РјРµРЅСЋ РѕРЅРё РѕСЃС‚Р°РІР°Р»РёСЃСЊ СЃРёРЅС…СЂРѕРЅРёР·РёСЂРѕРІР°РЅРЅС‹РјРё
- РЎРµРєСЂРµС‚С‹ РЅРёРєРѕРіРґР° РЅРµ РґРѕР»Р¶РЅС‹ РїРѕРїР°РґР°С‚СЊ РІ `worker.js` РЅР°РїСЂСЏРјСѓСЋ вЂ” С‚РѕР»СЊРєРѕ С‡РµСЂРµР· `PLACEHOLDER` + GitHub Actions

---

## 2026-06-24 (2) вЂ” РќР°РІРёРіР°С†РёСЏ: РїСЂР°РІР° РґРѕСЃС‚СѓРїР°, РїРѕСЂСЏРґРѕРє РєРЅРѕРїРѕРє, Р±Р°Рі С‡Р°С‚РѕРІ (Claude + Р®СЂРёР№)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:**

| РџСЂР°РІРєР° | Р¤Р°Р№Р» | РћРїРёСЃР°РЅРёРµ |
|--------|------|----------|
| РњРµСЃСЃРµРЅРґР¶РµСЂ СЃРєСЂС‹С‚ РґР»СЏ РІСЃРµС… РєСЂРѕРјРµ admin | `index.html` | `isAdmin()` РїСЂРѕРІРµСЂСЏРµС‚ `tgUser.id` (267468814) + email; `applyUserInfo()` СЃРєСЂС‹РІР°РµС‚/РїРѕРєР°Р·С‹РІР°РµС‚ `nav-ask` Рё `nav-chats` |
| РЎС‚Р°С‚РёСЃС‚РёРєР° СѓР±СЂР°РЅР° РёР· РЅР°РІРёРіР°С†РёРё | `index.html` | РљРЅРѕРїРєР° stats СѓРґР°Р»РµРЅР° РёР· `bottom-nav-v2` Рё `global-nav`; РґРѕСЃС‚СѓРї С‚РѕР»СЊРєРѕ С‡РµСЂРµР· РїСЂРѕРіСЂРµСЃСЃ-РєР°СЂС‚РѕС‡РєРё РЅР° РґР°С€Р±РѕСЂРґРµ |
| РџРѕСЂСЏРґРѕРє РєРЅРѕРїРѕРє РјРµРЅСЋ РїРµСЂРµСЂР°Р±РѕС‚Р°РЅ | `index.html` | РќРѕРІС‹Р№ РїРѕСЂСЏРґРѕРє: С‡Р°С‚С‹ (admin) в†’ Р·Р°РґР°С‡Рё в†’ РєР°Р»РµРЅРґР°СЂСЊ в†’ РјРёРєСЂРѕС„РѕРЅ в†’ РјРѕР·Рі; Р°РєС‚РёРІРЅР°СЏ РєРЅРѕРїРєР° РІС‹РґРµР»СЏРµС‚СЃСЏ Р·РµР»С‘РЅС‹Рј С‡РµСЂРµР· `setNavActive()` + CSS `.nav-item.active svg{stroke:var(--green)}` |
| `goHome()` РїРѕС‚РµСЂСЏР» Р°РєС‚РёРІРЅРѕРµ СЃРѕСЃС‚РѕСЏРЅРёРµ | `index.html` | Р”РѕР±Р°РІР»РµРЅ `setNavActive('tasks')` РІ `goHome()` |
| Р‘Р°Рі: РєРЅРѕРїРєР° С‡Р°С‚РѕРІ РІРѕР·РІСЂР°С‰Р°Р»Р° РЅР° РґР°С€Р±РѕСЂРґ | `index.html` | Р”РѕР±Р°РІР»РµРЅС‹ `'chats'`, `'msng-settings'`, `'chat-conv'` РІ `noNav` вЂ” `showScreen('chats')` Р±РѕР»СЊС€Рµ РЅРµ РїРѕРєР°Р·С‹РІР°РµС‚ `global-nav` РґР°Р¶Рµ РєСЂР°С‚РєРѕРІСЂРµРјРµРЅРЅРѕ; С‚Р°Р№РјРµСЂС‹ РІ `completeTask()` Рё `openTaskFromChat()` С‚РµРїРµСЂСЊ РїСЂРѕРІРµСЂСЏСЋС‚ Р°РєС‚РёРІРЅС‹Р№ СЌРєСЂР°РЅ РїРµСЂРµРґ СЂРµРґРёСЂРµРєС‚РѕРј |

**Р”РёР°РіРЅРѕСЃС‚РёРєР° Р±Р°РіРё С‡Р°С‚РѕРІ:**
- Р’ `openChats()` РґРѕР±Р°РІР»РµРЅ `console.log('[openChats] called')` вЂ” РїСЂРё С‚РµСЃС‚РёСЂРѕРІР°РЅРёРё РїСЂРѕРІРµСЂРёС‚СЊ РєРѕРЅСЃРѕР»СЊ
- Р•СЃР»Рё С„СѓРЅРєС†РёСЏ РІС‹Р·С‹РІР°РµС‚СЃСЏ РЅРѕ СЌРєСЂР°РЅ РЅРµ РїРѕРєР°Р·С‹РІР°РµС‚СЃСЏ вЂ” СЃРѕРѕР±С‰РёС‚СЊ

**РР·РІРµСЃС‚РЅС‹Рµ РїСЂРѕР±Р»РµРјС‹:**
- Р‘Р°Рі С‡Р°С‚РѕРІ РјРѕР¶РµС‚ Р±С‹С‚СЊ РµС‰С‘ РЅРµ РїРѕР»РЅРѕСЃС‚СЊСЋ РїРѕС„РёРєС€РµРЅ вЂ” РЅСѓР¶РґР°РµС‚СЃСЏ РІ С‚РµСЃС‚РёСЂРѕРІР°РЅРёРё

---

## 2026-06-25 вЂ” РћРїС‚РёРјРёР·Р°С†РёСЏ СЃС‚СЂСѓРєС‚СѓСЂС‹ РїСЂРѕРµРєС‚Р° (Claude + Р®СЂРёР№)

**Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ:** Р°СѓРґРёС‚ РїР°РїРєРё `Р’РµСЂСЃРёСЏ/` вЂ” РЅР°Р№РґРµРЅС‹ Рё СѓРґР°Р»РµРЅС‹ РґСѓР±Р»Рё, РјСѓСЃРѕСЂ Рё СѓСЃС‚Р°СЂРµРІС€РёРµ С„Р°Р№Р»С‹.

**РЈРґР°Р»РµРЅРѕ (~1.22 MiB):**

| Р¤Р°Р№Р» / РїР°РїРєР° | РџСЂРёС‡РёРЅР° |
|---|---|
| `src/bot/` (РєРѕСЂРµРЅСЊ) | РџРѕР»РЅС‹Р№ РґСѓР±Р»СЊ `4e-worker/src/bot/`; РІРµСЂСЃРёРё РІ `4e-worker` РЅРѕРІРµРµ Рё СЃРѕРґРµСЂР¶Р°С‚ СЂР°СЃС€РёСЂРµРЅРЅСѓСЋ РѕР±СЂР°Р±РѕС‚РєСѓ РѕС€РёР±РѕРє |
| `package.json` (РєРѕСЂРµРЅСЊ) | РЈСЃС‚Р°СЂРµРІС€РёР№ РїР°РєРµС‚ `telegram-bot-4`; СЃСЃС‹Р»Р°Р»СЃСЏ РЅР° СѓРґР°Р»С‘РЅРЅС‹Р№ `src/bot/index.js`; РЅРёРіРґРµ РЅРµ РёСЃРїРѕР»СЊР·РѕРІР°Р»СЃСЏ |
| `package-lock.json` (РєРѕСЂРµРЅСЊ) | Lock Рє СѓСЃС‚Р°СЂРµРІС€РµРјСѓ РїР°РєРµС‚Сѓ РІС‹С€Рµ |
| `.wrangler/cache/` (РєРѕСЂРµРЅСЊ) | РљСЌС€ Wrangler; СЂРµРіРµРЅРµСЂРёСЂСѓРµС‚СЃСЏ Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРё |
| `Р’РµСЂСЃРёСЏ.rar` / `Р’РµСЂСЃРёСЏ.zip` | Р СѓС‡РЅС‹Рµ Р°СЂС…РёРІС‹ РІСЃРµР№ РїР°РїРєРё; РїСЂРѕРµРєС‚ РІ git вЂ” Р°СЂС…РёРІС‹ РёР·Р±С‹С‚РѕС‡РЅС‹ |
| `index (55).html` | РЎР»СѓС‡Р°Р№РЅРѕ СЃРѕС…СЂР°РЅС‘РЅРЅС‹Р№ С„Р°Р№Р» Р±СЂР°СѓР·РµСЂРѕРј |
| `README (1).md` | Р”СѓР±Р»СЊ README СЃ СЃСѓС„С„РёРєСЃРѕРј Р±СЂР°СѓР·РµСЂР° |
| `4_vk_mini_app.html` | РЈСЃС‚Р°СЂРµРІС€РёР№ VK-РїСЂРѕС‚РѕС‚РёРї; С„СѓРЅРєС†РёРѕРЅР°Р» РїРµСЂРµРЅРµСЃС‘РЅ РІ `4e-app/vk.html` + VK-Р°РґР°РїС‚РµСЂ |
| `4e-app/index_original.html` | Backup РїРµСЂРµРґ СЂРµРґРёР·Р°Р№РЅРѕРј; РёР·РјРµРЅРµРЅРёСЏ Р·Р°РєСЂРµРїР»РµРЅС‹ РІ git |
| `4e-app/vk_backup.html` | Backup VK-РІРµСЂСЃРёРё; РІ git |

**РќРµ С‚СЂРѕРЅСѓС‚Рѕ:**
- `redesign/patches/` вЂ” Р¤Р°Р·Р° 9 (`09_biometric_consent.html`) РїСЂРёРјРµРЅРµРЅР° 2026-06-25; РїР°РїРєР° РѕСЃС‚Р°С‘С‚СЃСЏ РєР°Рє РёСЃС‚РѕС‡РЅРёРє РїР°С‚С‡Р°/РёСЃС‚РѕСЂРёСЏ СЂРµРґРёР·Р°Р№РЅР°

**РџСЂРѕРІРµСЂРєР° Р°РєС‚СѓР°Р»СЊРЅС‹С… С„Р°Р№Р»РѕРІ РїРѕСЃР»Рµ СѓРґР°Р»РµРЅРёСЏ:** РІСЃРµ `True` (`4e-app/index.html`, `worker.js`, `4e-worker/src/bot/index.js`, `4e-worker/worker.js`).

---

## 2026-07-01 вЂ” BACK-022 Task detail manual MVP (Codex)

**РџСЂРѕР±Р»РµРјР°:** СЌРєСЂР°РЅ `task-detail` РѕСЃС‚Р°РІР°Р»СЃСЏ РЅР° СЃС‚Р°СЂРѕРј prompt-СЂРµРґР°РєС‚РёСЂРѕРІР°РЅРёРё Рё РЅРµ СЃРѕС…СЂР°РЅСЏР» СЂСѓС‡РЅС‹Рµ РїРѕР»СЏ СЃС‚Р°С‚СѓСЃР°, РїСЂРёРѕСЂРёС‚РµС‚Р°, РІСЂРµРјРµРЅРё, С‡РµРє-Р»РёСЃС‚Р° Рё РЅР°РїСЂР°РІР»РµРЅРёСЏ.

**Р РµС€РµРЅРёРµ:** РІ `index.html` РґРѕР±Р°РІР»РµРЅС‹ СЂСѓС‡РЅС‹Рµ controls РґР»СЏ СЃС‚Р°С‚СѓСЃР°, РїСЂРёРѕСЂРёС‚РµС‚Р°, РІСЂРµРјРµРЅРё, Р±С‹СЃС‚СЂС‹С… РґРµРґР»Р°Р№РЅРѕРІ, РЅР°РїСЂР°РІР»РµРЅРёСЏ, РЅР°РїРѕРјРёРЅР°РЅРёСЏ Рё С‡РµРє-Р»РёСЃС‚Р°; `saveTaskEdits()` РѕС‚РїСЂР°РІР»СЏРµС‚ `status`, `priority`, `time`, `checklist`, `directionLabel` Рё СЃРѕРІРјРµСЃС‚РёРјС‹Р№ `deadline`; `styles/screens/tasks.less` Рё CSS-СЃР±РѕСЂРєР° РѕР±РЅРѕРІР»РµРЅС‹.

**РџСЂРѕРІРµСЂРєР°:** `npm.cmd run build:css`, inline JS `node --check`, `git diff --check`, РєРѕРЅС‚СЂРѕР»СЊ РєРёСЂРёР»Р»РёС†С‹ `Р’РѕР№С‚Рё|Р—Р°РґР°С‡Рё`, raw GitHub СЃРѕРґРµСЂР¶РёС‚ РЅРѕРІС‹Р№ `index.html`; Pages РЅР° РјРѕРјРµРЅС‚ РїСЂРѕРІРµСЂРєРё РµС‰С‘ РѕС‚РґР°РІР°Р» СЃС‚Р°СЂС‹Р№ cache/build (`Last-Modified: Tue, 30 Jun 2026 22:10:38 GMT`).

**Production:** frontend commit `b4fa48f`; Worker production deploy `0deb8806-0de6-4471-9350-af38a75595ef`; live Worker `GET /` РІРµСЂРЅСѓР» `200 OK`, CORS preflight РґР»СЏ `https://mrktggod.github.io` РІРµСЂРЅСѓР» `204`.

---

## РџРђРўРўР•Р РќР« РћРЁРР‘РћРљ (РґР»СЏ РѕР±СѓС‡РµРЅРёСЏ)

1. **Кодировка** — самая частая. Любой PowerShell-агент без явного UTF-8 ломает кириллицу.
2. **KV + chatId** — путаница между `telegramId` и `chatId` при ключах в KV. Правило: передавать chatId явно.
3. **Revert циклы** — 2 раза за один день делали fix → revert → fix. Причина: не тестировали перед коммитом.
4. **VK iframe ограничения** — Google Fonts, внешние ресурсы, Telegram SDK недоступны в VK.

---

## 2026-07-05

### BACK-040 — tariff-config и Admin API тарифов

**Что сделано:** В `4e-worker/worker.js` добавлен единый `DEFAULT_TARIFF_CONFIG` с KV-ключом `tariff_config:current`, публичный `GET /tariff-config`, admin-роуты `GET /admin/users`, `GET /admin/users/:id`, `PUT /admin/users/:id/plan`, `GET/PUT /admin/tariff-config` и защита по `env.ADMIN_SECRET`. Telegram Stars invoice и card webhook теперь берут длительность плана из тарифа, а новые email/TG/VK trial-аккаунты читают `trialDays` из конфига. В `index.html` хардкод `PLANS` заменён на загрузку `/tariff-config`: paywall, карточки подписки, benefit-list, feature-list, `order-summary` и progress bar заполняются из worker-конфига.

**Проверка кодировки:** совпадений до / после — `61 / 64` (`Войти|Задачи|Сегодня`)

**Тест:** `node --check worker.js`; inline JS parse check для `index.html` вернул `inline-js-ok`; модульный smoke воркера через `node --input-type=module` с мок-KV подтвердил `GET /tariff-config`, `GET /admin/users`, `PUT /admin/tariff-config`, `PUT /admin/users/:id/plan`.

**Коммит:** `5bab618`

## 2026-07-22

### Pre-dawn inbox and whitelist backlog runner final report

**What changed:** Added final automation closeout report for the 2026-07-22 pre-dawn run. The run found no executable `NEW` inbox briefs, completed 3 safe tasks, and stopped due to current run limits after docs/status sync plus two small `BACK-012` BEM cleanup islands. Runtime behavior was not changed in this closeout commit.

**Encoding check:** `index.html` was not edited in this closeout task; latest `node scripts/check-cp1251-mojibake.mjs` returned `CP1251 mojibake check passed: 0 suspicious tokens`.

**Test:** `node scripts/check-cp1251-mojibake.mjs`; `C:\Program Files\Git\bin\bash.exe scripts/check-portable-paths.sh`; `git diff --check`.

**Commit:** pending

### BACK-012 task-move BEM cleanup island

**What changed:** Removed task-move preset row text, panel, scroll, last-row and confirm button layout-only inline styles from `index.html` and moved them to `styles/screens/tasks.less`. Rebuilt `styles.css` and `styles.min.css`. No task behavior, backend, payment, entitlement, CAL, production deploy, or `main` merge was touched.

**Encoding check:** `index.html` marker count before edit: 106; after edit: 106. `node scripts/check-cp1251-mojibake.mjs` returned `CP1251 mojibake check passed: 0 suspicious tokens`.

**Test:** `npm run build:css`; `npm run smoke:back019`; `node scripts/check-cp1251-mojibake.mjs`; `C:\Program Files\Git\bin\bash.exe scripts/check-ui-architecture.sh`; `C:\Program Files\Git\bin\bash.exe scripts/check-portable-paths.sh`; `git diff --check`.

**Commit:** pending

### BACK-012 auth/forgot/reset BEM cleanup island

**What changed:** Removed a narrow set of layout-only inline styles from auth/onboarding/forgot/reset markup in `index.html` and moved them to `styles/layout.less` as `auth-screen-title`, `auth-screen-hint`, `auth-form`, `auth-success-*`, and `legal-note--*` classes. Rebuilt `styles.css` and `styles.min.css`. No auth behavior, backend, payment, entitlement, CAL, production deploy, or `main` merge was touched.

**Encoding check:** `index.html` marker count before edit: 106; after edit: 106. `node scripts/check-cp1251-mojibake.mjs` returned `CP1251 mojibake check passed: 0 suspicious tokens`.

**Test:** `npm run build:css`; `npm run smoke:back050`; `npm run check:js-syntax`; `node scripts/check-cp1251-mojibake.mjs`; `C:\Program Files\Git\bin\bash.exe scripts/check-ui-architecture.sh`; `C:\Program Files\Git\bin\bash.exe scripts/check-portable-paths.sh`; `git diff --check`.

**Commit:** pending

### SMART-005 roadmap status sync

**What changed:** Synchronized stale roadmap status for `SMART-005`: `shared/ROADMAP.md` now matches canonical `pm/backlog.md`, where the morning chat briefing task is already `Done`. No runtime code, worker code, payment, entitlement, CAL, production deploy, or `main` merge was touched.

**Encoding check:** `index.html` was not edited in this task; `node scripts/check-cp1251-mojibake.mjs` returned `CP1251 mojibake check passed: 0 suspicious tokens`.

**Test:** `rg` source proof for `SMART-005` in `shared/ROADMAP.md` and `pm/backlog.md`; `node scripts/check-cp1251-mojibake.mjs`; `C:\Program Files\Git\bin\bash.exe scripts/check-portable-paths.sh`; `git diff --check`.

**Commit:** pending

## 2026-07-18

### Redesign soft-glass cutover to staging

**What changed:** Integrated the approved soft-glass redesign slices from origin heads into `feat/admin-tariff-api`: dashboard/home empty state, subscription/pricing UI shell, profile, ask/chat, and task-detail. Added required PNG assets, kept tariff values config-driven, rebuilt `styles.css` / `styles.min.css`, and updated `FILE_MAP.md` / `FILE_MAP_UI.md`.

**Root entry points:** `index.html:306` home, `index.html:390` ask, `index.html:420` task-detail, `index.html:609` profile, `index.html:672` subscription, `scripts/auth-handlers.js:91` dashboard preview renderer.

**Encoding check:** `node scripts/check-cp1251-mojibake.mjs` returned `CP1251 mojibake check passed: 0 suspicious tokens`.

**Tests:** `npm run build:css`; `node scripts/check-js-syntax.mjs`; `C:\Program Files\Git\bin\bash.exe scripts/check-ui-architecture.sh`; `PAGES_WORKER_TARGET=staging npm run build:worker-assets`; live staging marker checks on `https://263b279c.4-ai-staging.pages.dev/`.

**Staging:** Cloudflare Pages project `4-ai-staging`, branch `dev`, deployment `https://263b279c.4-ai-staging.pages.dev/`. Live HTML contains staging worker resolver and markers `dash-artboard`, `ask-soft-screen`, `detail-redesign-shell`, `profile-handoff-shell`.

**Known tails:** API smoke against staging worker fails at `register: 500`; full browser visual smoke was not run because Playwright is not installed locally; prod deploy is NEED-YURI and was not performed.

**Commit:** `f26b3d46d6a3acff7038df35e5e5dc6ae76293ab`

## 2026-07-20

### Dashboard empty CTA contrast on light redesign

**What changed:** Added a scoped LESS override for `html[data-theme="light"] #home .dash-tasks--empty .dash-empty-card` so the empty dashboard CTA remains a dark-glass card with readable light title and body copy. Updated `sw.js` cache version to force the refreshed CSS shell.

**Encoding check:** `index.html` was not edited in this task.

**Tests:** `npm run build:css`; `node scripts/check-cp1251-mojibake.mjs`; `git diff --check`; `bash scripts/check-portable-paths.sh`; `bash scripts/check-ui-architecture.sh`.

**Commit:** `885e3a30baff45a5532ef32926340bf9ea89942c`

### Avatar draft user scoping

**What changed:** Replaced the global `extendedProfileDraft` localStorage key with a per-user key, dropped legacy unscoped drafts instead of migrating them, cleared visible avatar UI during logout, and updated the auth/avatar smoke to verify same-browser account switching and same-user re-login.

**Encoding check:** `index.html` marker count before edit: 106; after edit: 106.

**Test:** `npm run smoke:auth-avatar` against local checkout + staging worker showed account B no longer inherits account A avatar, legacy draft is empty, logout clears avatar backgrounds, and account A gets its own scoped avatar back on same-browser re-login; `node scripts/check-cp1251-mojibake.mjs`; `npm run check:js-syntax`; `git diff --check`; `bash scripts/check-portable-paths.sh`; `bash scripts/check-ui-architecture.sh`.

**Commit:** `a78323fa915d71a858f62a7fc2826b1f5c7848c1`

### Liquid-glass design brief for night session

**What changed:** Copied Alexey's `4_liquid_glass_panel_component.html` into `docs/tasks/assets/4_liquid_glass_panel_component_2026-07-21.html` and added `pm/inbox/BRIEF-2026-07-21-night-liquid-glass-system.md` for safe design-system integration through LESS/BEM classes, preserving the click glow.

**Encoding check:** `index.html` was not edited in this task.

**Test:** `git diff --check`; `node scripts/check-cp1251-mojibake.mjs`; `bash scripts/check-portable-paths.sh`.

**Commit:** pending

### Part 3 handoff route for notification settings

**What changed:** The Part 3 `notifications-light/dark` handoff was previously mounted only on the `notifications` screen, while Profile -> Notifications opens `notif-settings`. Added a second mount for `notif-settings` with back navigation to Profile and bumped `scripts/design-part3-handoff.js` plus `sw.js` cache versions.

**Encoding check:** `index.html` marker count before edit: 106; after edit: 106.

**Tests:** `npm run build:css`; `node scripts/check-cp1251-mojibake.mjs`; `git diff --check`; `bash scripts/check-portable-paths.sh`; `bash scripts/check-ui-architecture.sh`; `node --check scripts/design-part3-handoff.js`.

**Commit:** pending

### Part 3 handoff publish fix

**What changed:** Added `scripts/design-part3-handoff.js` to the Pages whitelist builder. The staging HTML referenced the script, but `.pages-dist/scripts` did not contain it, so `GET /scripts/design-part3-handoff.js?v=20260720-part3-2` returned `404` and no Part 3 iframe layers mounted.

**Encoding check:** `index.html` was not edited in this task.

**Tests:** `node --check scripts/build-pages-whitelist.mjs`; `node --check scripts/design-part3-handoff.js`; `PAGES_WORKER_TARGET=staging npm run build:worker-assets`; `Test-Path .pages-dist/scripts/design-part3-handoff.js`; `node scripts/check-cp1251-mojibake.mjs`; `git diff --check`; `bash scripts/check-portable-paths.sh`; `bash scripts/check-ui-architecture.sh`.

**Commit:** pending

### Part 3 iframe handoff rollback

**What changed:** Removed the Part 3 iframe handoff from the staging app after manual QA found the screens visually unsuitable and non-interactive. Removed the script tag from `index.html`, removed `scripts/design-part3-handoff.js` from the Pages whitelist, deleted the handoff script, and removed `assets/design/part3`.

**Encoding check:** `index.html` marker count before edit: 106; after edit: 106.

**Tests:** `node --check scripts/build-pages-whitelist.mjs`; `PAGES_WORKER_TARGET=staging npm run build:worker-assets`; `node scripts/check-cp1251-mojibake.mjs`; `git diff --check`; `bash scripts/check-portable-paths.sh`; `bash scripts/check-ui-architecture.sh`.

**Commit:** pending

### Task detail long input guard

**What changed:** Added final guard CSS for task-detail title and description fields so long unbroken input wraps/clips inside the hero card instead of pushing into the deadline/priority controls or overflowing the panel. The guard applies to both light and dark themes with explicit width reserves.

**Encoding check:** `index.html` was not edited in this task.

**Tests:** `npm run build:css`; `node scripts/check-cp1251-mojibake.mjs`; `git diff --check`; `bash scripts/check-portable-paths.sh`; `bash scripts/check-ui-architecture.sh`.

**Commit:** pending

### Task detail title balance on light and dark themes

**What changed:** Moved the final light-theme task-detail title and description bounds closer to the hero card left edge. Added dark-theme task-detail title sizing override and moved the description down slightly to create more space below the title.

**Encoding check:** `index.html` was not edited in this task.

**Tests:** `npm run build:css`; `node scripts/check-cp1251-mojibake.mjs`; `git diff --check`; `bash scripts/check-portable-paths.sh`; `bash scripts/check-ui-architecture.sh`.

**Commit:** pending

### Task detail title and description left alignment

**What changed:** Adjusted the final light-theme task-detail bounds so `.detail-redesign-title` and `.detail-redesign-desc` start closer to the left edge of the hero card while keeping enough right-side reserve for the deadline and priority controls.

**Encoding check:** `index.html` was not edited in this task.

**Tests:** `npm run build:css`; `node scripts/check-cp1251-mojibake.mjs`; `git diff --check`; `bash scripts/check-portable-paths.sh`; `bash scripts/check-ui-architecture.sh`.

**Commit:** pending

### Staging visual QA follow-up

**What changed:** Added `onclick="showSubScreen('support')"` to the profile support menu row. Added final scoped light-theme task-detail bounds for `.detail-redesign-title` / `.detail-redesign-desc` so long task titles do not overlap the deadline/priority cards. Added dark-theme dashboard artboard override to remove the remaining green page gradient and keep the canvas black.

**Encoding check:** `index.html` marker count before edit: 106; after edit: 106.

**Tests:** `npm run build:css`; `node scripts/check-cp1251-mojibake.mjs`; `git diff --check`; `bash scripts/check-portable-paths.sh`; `bash scripts/check-ui-architecture.sh`.

**Commit:** pending
### HOME-001 dashboard headless smoke evidence

**Что сделано:** Added `scripts/home-001-dashboard-smoke.mjs` and `npm run smoke:home001`. The smoke opens the real local `index.html` in headless Chrome/CDP at 390x844, mocks only safe read responses, verifies top-3 dashboard rows, 4 metric cards, 3 bottom nav buttons, focus overlay, profile/notifications/statistics/ask/calendar click routes, hero image loading, and dark/light theme rendering. Saved PNG evidence in `docs/tasks/assets/HOME-001-dashboard-smoke-2026-07-20-dark.png` and `docs/tasks/assets/HOME-001-dashboard-smoke-2026-07-20-light.png`. `HOME-001` was moved to `Done` in PM docs.

**Проверка кодировки:** `index.html` was not edited in this task; `node scripts/check-cp1251-mojibake.mjs` returned `CP1251 mojibake check passed: 0 suspicious tokens`.

**Тест:** `npm run smoke:home001` passed with `documentScrollWidth=390`, `homeRows=3`, `metricCards=4`, `bottomNavButtons=3`, `focusPanelRows=3`, dark/light `scrollWidth=390`; `node --check scripts/home-001-dashboard-smoke.mjs`; `npm run check:js-syntax`; `C:\Program Files\Git\bin\bash.exe scripts/check-ui-architecture.sh`; `C:\Program Files\Git\bin\bash.exe scripts/check-portable-paths.sh`.

**Коммит:** `test(ui): add home dashboard smoke evidence`

### BACK-034 staging API resmoke

**Что сделано:** Refreshed automated staging evidence after the 2026-07-18 redesign cutover note that staging API smoke failed at `register: 500`. No runtime code, deploy, production, payment, entitlement, CAL, price, or secret changes were made.

**Проверка кодировки:** `index.html` was not edited in this task; `node scripts/check-cp1251-mojibake.mjs` returned `CP1251 mojibake check passed: 0 suspicious tokens`.

**Тест:** `WORKER_BASE_URL=https://restless-lab-d737-staging.shelckograff.workers.dev npm run api-smoke` passed: forgot-password negative `400/400`, register/login/auth-me `200`, two-user Telegram-linked task flow `200`, task create/list/receiver/done/delete `200`, `/anthropic` `200`, `/transcribe` without file `400`. `GET https://4-ai-staging.pages.dev/` returned `200`, HTML length `459855`, staging worker marker found. CORS preflight `OPTIONS /auth/login` with staging Origin returned `204`, ACAO `https://4-ai-staging.pages.dev/`, methods `GET, POST, PUT, OPTIONS`.

**Коммит:** `test(api): refresh staging smoke evidence`

### SMART-007 AI-memory safe fixture smoke

**Что сделано:** Added `scripts/smart-007-memory-fixture-smoke.mjs` and `npm run smoke:smart007`. The smoke creates a fresh staging-only synthetic account, enables AI processing/memory through the privacy API, saves safe fixture AI messages, verifies `/ai/facts`, renders local `#ai-memory-list` at 390x844, deletes one fact, then clears all facts. SMART-007 evidence was promoted from `SOURCE-ONLY` to `LIVE` in the evidence audit.

**Проверка кодировки:** `index.html` was not edited in this task; `node scripts/check-cp1251-mojibake.mjs` returned `CP1251 mojibake check passed: 0 suspicious tokens`.

**Тест:** `npm run smoke:smart007` passed on staging worker: `register/login/legacy-session/privacy.settings/ai.messages/anthropic` returned `200`; `GET /ai/facts` returned 4 fixture facts; local DOM rendered 4 rows with delete buttons and `scrollWidth=390`; delete-one left 3 facts; clear-all left 0 facts. Also run before commit: `node --check scripts/smart-007-memory-fixture-smoke.mjs`, `node scripts/check-cp1251-mojibake.mjs`, `node scripts/check-js-syntax.mjs`, `bash scripts/check-portable-paths.sh`, `git diff --check`.

**Коммит:** `test(ai): add smart 007 memory fixture smoke`
### Night inbox and whitelist backlog runner roadmap status sync

**What changed:** Scanned `pm/inbox` and found no `status: NEW` briefs. Updated `shared/ROADMAP.md` so the voice row no longer shows stale `BACK-021 Triaged` and the proactive bot row no longer shows stale `SMART-011 In Progress`. Added the matching outbox report for the automation run.

**Encoding check:** `index.html` was not edited in this task; `node scripts/check-cp1251-mojibake.mjs` returned `CP1251 mojibake check passed: 0 suspicious tokens`.

**Test:** `node scripts/check-cp1251-mojibake.mjs`; `bash scripts/check-portable-paths.sh`; `git diff --check`.

**Commit:** pending

### Morning safe backlog docs status sync

**What changed:** Scanned `pm/inbox` and found no `status: NEW` briefs. Synchronized stale task-file statuses for `BACK-044` and `INFRA-005` with canonical `pm/backlog.md` / `shared/ROADMAP.md` state and added the matching outbox report.

**Encoding check:** `index.html` was not edited in this task; `node scripts/check-cp1251-mojibake.mjs` returned `CP1251 mojibake check passed: 0 suspicious tokens`.

**Test:** `node scripts/check-cp1251-mojibake.mjs`; `bash scripts/check-portable-paths.sh`; `git diff --check`.

**Commit:** pending

### Preview demo routing stability

**What changed:** Fixed `previewDemo=dashboard` direct routing by opening the preview screen before real auth/session checks in `initApp()` and by allowing only preview whitelisted screens through `showScreen()` without a real token while preview mode is active.

**Encoding check:** `index.html` marker count before edit: 106; after edit: 106.

**Test:** Local Chrome/CDP smoke verified all six preview URLs (`dashboard`, `task-detail`, `profile`, `subscription`, `chats`, `chat-conv`) open the expected screen with preview token and that internal preview navigation stays on `chats>task-detail`; `node scripts/check-cp1251-mojibake.mjs`; `npm run check:js-syntax`; `git diff --check`; `bash scripts/check-portable-paths.sh`; `bash scripts/check-ui-architecture.sh`.

**Commit:** `f26b3d46d6a3acff7038df35e5e5dc6ae76293ab`

### Auth password inline error lookup

**What changed:** Updated `scripts/auth.js` fallback field-error lookup to use `document.getElementById(fieldId + '-error')` before the older parent `.form-error` search, so password-wrapper fields can render inline errors.

**Encoding check:** `index.html` was not edited in this task.

**Test:** `npm run smoke:auth-avatar` against local checkout + staging worker showed `wrongPasswordUi.passError="Неверный email или пароль"`; `node scripts/check-cp1251-mojibake.mjs`; `npm run check:js-syntax`; `git diff --check`; `bash scripts/check-portable-paths.sh`; `bash scripts/check-ui-architecture.sh`.

**Commit:** pending

## 2026-07-21

### Mobile soft-glass production polish

**Что сделано:** добавлен финальный LESS override для home/task-detail: скрыт декоративный statusbar телефона, тёмный dashboard закреплён на `#000`, home-композиция переведена на явные координаты header/hero/section title/metrics/task list, сохранён вывод 3 задач, очищены квадратные shadow artifacts у metric icons/progress/orb, заголовок и описание task detail ограничены по ширине и переносятся без заезда под срок/приоритет.

**Проверка кодировки:** index.html не изменялся; `node scripts/check-cp1251-mojibake.mjs` → 0 suspicious tokens.

**Тест:** `npm run build:css`; `npm run smoke:home001` → ok=true, homeRows=3, metricCards=4, bottomNavButtons=3, documentScrollWidth=390; визуально проверены light/dark smoke screenshots.

**Коммит:** pending

## 2026-07-21

### Light theme switch fix after soft-glass polish

**Что сделано:** добавлен финальный CSS-слой, где `html[data-theme="light"]` принудительно включает светлые цвета для dashboard/profile/subscription/task-detail, а dark-override больше не срабатывает от отсутствия `.soft-light`.

**Проверка кодировки:** `node scripts/check-cp1251-mojibake.mjs` → 0 suspicious tokens.

**Тест:** `npm run build:css`; `npm run smoke:home001` → ok=true, homeRows=3, metricCards=4, bottomNavButtons=3, documentScrollWidth=390; визуально проверен light smoke screenshot.

**Коммит:** pending

## 2026-07-21 - Idea capture

### Internal agentbot development command center

**Что сделано:** Код приложения не менялся. Создан черновик `pm/idea-capture-2026-07-21.md` с первой продиктованной идеей Алексея: использовать 4 как внутренний штаб разработки агентабота, где можно вести задачи разработки, управлять агентами и получать уведомления о работе агентов в аккаунт.

**Проверка кодировки:** `index.html` не редактировался; Шаг 0 не применялся.

**Тест:** Документальная проверка связки с текущими PM-файлами; идея оставлена как raw idea, без изменения `pm/backlog.md` и `shared/ROADMAP.md` до согласования.

**Коммит:** N/A

### Telegram group task assignment idea

**Что сделано:** В тот же черновик `pm/idea-capture-2026-07-21.md` добавлена вторая идея Алексея: отправка задач другим людям из Telegram-группы через roster участников, распознавание исполнителя по имени/mention/reply, проверку наличия приложения/аккаунта 4 и fallback для неподключенных исполнителей.

**Проверка кодировки:** `index.html` не редактировался; Шаг 0 не применялся.

**Тест:** Документальная проверка; идея оставлена как raw idea и связана с уже существующими направлениями `SMART-001/002/003/004`, без изменения backlog/roadmap до triage.

**Коммит:** N/A

## 2026-07-21 - Chat history disappearance bug triage

### BUG-2026-07-21-005: часть истории чата пропадает

**Что сделано:** Код приложения не менялся. В `pm/bugs.md` заведен `BUG-2026-07-21-005` по сообщению Алексея: "стерлась часть чата, пропала просто". Выполнен первичный code read по трем поверхностям: AI-чат `ask`, чат задачи и Telegram/group `chat-conv`.

**Первичные кандидаты root cause:** AI-чат ограничен `ASK_HISTORY_MAX = 40` и режет локальную историю через `trimAskHistory()` / `sessionStorage`, remote load также запрашивает `/ai/messages?limit=40`; task chat грузит только `limit=40`; group chat при poll полностью перерисовывает список тем, что вернул `/messages?chatId=...`.

**Проверка кодировки:** `index.html` не редактировался; Шаг 0 не применялся.

**Тест:** `rg` и узкое чтение диапазонов `index.html` вокруг `loadAskHistoryRemote`, `loadTaskChat`, `loadConvMessages`, `renderRealMessages`; runtime-воспроизведение пока не выполнялось, нужны поверхность и шаги.

**Коммит:** N/A

## 2026-07-21 - Notification salience triage

### BACK-064 / BUG-2026-07-21-006: уведомления должны быть заметными и надежными

**Что сделано:** Код приложения не менялся. По сообщению Алексея заведён `BUG-2026-07-21-006`: уведомления есть, но их плохо видно и они иногда не срабатывают. Создан task `docs/tasks/BACK-064-notification-salience-delivery-audit.md`, добавлена строка `BACK-064` в `pm/backlog.md` и отдельная QA-зона в `pm/qa-checklist.md`.

**Контекст:** `BACK-055` уже закрывал action-feed и карточки уведомлений, но не доказывал реальную доставку, звук, вибрацию и заметность сигнала. `BACK-017` покрывает delivery smoke; `BACK-064` расширяет его до полного user-visible сигнала.

**Проверка кодировки:** `index.html` не редактировался; Шаг 0 не применялся.

**Тест:** `rg` по notification/haptic/sound/vibration, чтение `BACK-055`, `BACK-017`, `pm/qa-checklist.md` и `scripts/task-ui-renderers.js` notification area. Runtime smoke пока не выполнялся: для Done нужен staging device smoke с raw evidence.

**Коммит:** N/A

## 2026-07-21 - Task title normalization triage

### BACK-065: читаемые заголовки задач из диктовки

**Что сделано:** Код приложения не менялся. По сообщению Алексея заведена задача `docs/tasks/BACK-065-task-title-normalization.md`: заголовок задачи должен быть коротким и читаемым, а не сырой фразой из диктовки вроде "я придумать на платформе". В `pm/backlog.md` добавлен `BACK-065`, в `pm/qa-checklist.md` добавлена QA-зона для проверки нормализации заголовков.

**Контекст:** Первичный code read показал, что сейчас `fallbackTaskFromText()` и `formatTaskIntentTitle()` в `index.html` в основном чистят вводные слова и капитализируют строку, а `scripts/task-ui-renderers.js:getTaskCardTitle()` показывает `task.text` как основной заголовок. Для полноценного результата нужен отдельный helper/AI-contract: `task.text` как нормализованный заголовок, `originalMsg` как полный исходный текст.

**Проверка кодировки:** `index.html` не редактировался; Шаг 0 не применялся.

**Тест:** Документальный triage и code read зон `formatTaskIntentTitle`, `fallbackTaskFromText`, `createTaskFromChat`, `sendVoiceMessage`, `submitQuickAdd`, `getTaskCardTitle`. Runtime-тест не выполнялся, потому что реализация пока не начата.

**Коммит:** N/A

## 2026-07-21 - VK stable line triage

### BACK-066: VK-версия как стабильная продуктовая линия

**Что сделано:** Код приложения не менялся. По сообщению Алексея заведена задача `docs/tasks/BACK-066-vk-stable-line-functional-parity.md`: VK-версия логинится и на телефоне/browser shell работает стабильнее остальных поверхностей, поэтому ее нужно добить по функционалу и использовать как наиболее стабильную линию. В `pm/backlog.md` добавлен `BACK-066`, в `pm/qa-checklist.md` добавлена regression-зона `VK stable line / Functional parity`.

**Контекст:** Roadmap уже фиксирует VK-инфраструктуру как рабочую (`INFRA-004`, `INFRA-005`) и `FILE_MAP_UI.md` показывает, что `vk.html` содержит отдельную урезанную поверхность: auth, tasks, task detail, AI chat, calendar, stats. `BACK-066` не включает VK Pay/payment, production deploy или большой `ARCH-001` распил; первый шаг — parity-аудит `index.html` vs `vk.html`.

**Проверка кодировки:** `index.html` не редактировался; Шаг 0 не применялся.

**Тест:** `rg` по VK/VK Mini/vk.html в roadmap/backlog/tasks, чтение `FILE_MAP_UI.md` диапазонов `vk.html`. Runtime-smoke не выполнялся, потому что задача пока заведена как triage/plan.

**Коммит:** N/A
## 2026-07-22

### Дневной summary-блок в попапе фокуса дня

**Что сделано:** блок дневной сводки перенесён в начало попапа «Фокус дня»: добавлены метрики дня, пульс дня, кнопки «Поделиться планом дня» и «Итоги недели», список задач остаётся ниже блока.

**Проверка кодировки:** совпадений до / после: 106 / 111.

**Тест:** `npm run build:css`, `npm run check:cp1251-mojibake`, `git diff --check`, `bash scripts/check-portable-paths.sh`, `bash scripts/check-ui-architecture.sh`; `npm run smoke:home001` вернул `ok: true`, но завершился с Windows `EBUSY` на cleanup временного Chrome cookie-файла.

**Коммит:** N/A

## 2026-07-22

### Ночная очередь Focus + iPhone task-detail + safe Horizon 0.5

**Что сделано:** После ручного результата Алексея «по фокусу ничего не изменилось» созданы атомарные briefs `BRIEF-2026-07-22-30..34`. Очередь начинается с проверки commit/preview фокуса, затем исправляет три подтверждённых iPhone-регрессии детальной карточки задачи. Пятый brief открывает только безопасный evidence-проход Горизонта 0.5 для истории чата длиннее 40 сообщений. В каждом brief сохранены запреты на production/main, CAL, payment/entitlement, auth-security, secrets и перезапись чужого dirty worktree.

**Проверка кодировки:** `index.html` не редактировался; Шаг 0 не применялся.

**Тест:** Проверены порядок `status: NEW` inbox, уникальность brief-имён, постоянные stop points и ссылки на `BUG-2026-07-21-005`, `BUG-2026-07-22-001..003`. Runtime-тест не выполнялся: это PM/QA постановка ночной очереди.

**Коммит:** N/A

## 2026-07-22

### NEW-020 — голос принят и закрыт

**Что сделано:** Runtime-код не менялся. По явному решению Алексея `NEW-020` переведён из `Ready for QA` / `NEED-YURI` в `Done`: голос работает в его постоянном использовании, претензий к скорости и сценарию нет. Синхронизированы backlog, roadmap, QA evidence, brief и report; необязательный raw latency tail снят.

**Проверка кодировки:** `index.html` не редактировался; Шаг 0 не применялся.

**Тест:** Документальная сверка всех ссылок на `NEW-020`; пользовательская приёмка Алексея 2026-07-22.

**Коммит:** N/A

## 2026-07-22

### Расширение safe night reserve Горизонта 0.5

**Что сделано:** Созданы атомарные briefs `BRIEF-2026-07-22-35..41` после текущей P1/QA очереди. После точной сверки roadmap кандидаты SMART-008/009/010, VIRAL-005 и PLAT-002 исключены как Горизонт 1. Итоговый резерв 0.5: SMART-007 memory UI/privacy regression, privacy artifact/link smoke, BACK-037 CI audit, manual gates pack, ARCH-001 status evidence, BACK-012 component inventory и status consistency audit. Каждый brief исключает production/main, реальные AI/пользовательские данные, CAL, payments/entitlement, auth-security, stores, secrets и крупную архитектуру.

**Проверка кодировки:** `index.html` не редактировался; Шаг 0 не применялся.

**Тест:** Проверены уникальные имена briefs, последовательность `30-41`, соответствие permanent whitelist и наличие явных stop points/report paths.

**Коммит:** N/A

## 2026-07-23

### Анализ ночной сессии и план следующих четырёх периодов

**Что сделано:** Создан подробный документ `pm/ANALYSIS-2026-07-23-night-session-and-next-periods.md`. Он сводит фактические результаты вечернего, ночного, предрассветного и утреннего runners; разделяет runtime, test/CI и process output; оценивает сильные и слабые стороны автономного процесса; объясняет состояние Горизонта 0 и предлагает последовательность из четырёх рабочих периодов: real-device acceptance, managed release candidate, closed beta, затем Horizon 0.5 через VK reliability и QA-lab.

**Проверка кодировки:** `index.html` не редактировался; Шаг 0 не применялся.

**Тест:** `node scripts/check-doc-encoding.mjs`, `node scripts/check-cp1251-mojibake.mjs`, `git diff --check`; факты сверены с runner reports, briefs `30-41`, git log, текущим origin и GitHub Actions.

**Коммит:** N/A
## 2026-07-24

### Night inbox/backlog runner closeout

**Что сделано:** код приложения не менялся. Проверены `pm/inbox`, `pm/backlog.md` и `shared/ROADMAP.md`: новых `status: NEW` briefs нет, а оставшиеся backlog/roadmap-кандидаты не проходят автономный whitelist без Claude/Yuri/live gate или свежего atomic brief. Добавлен closeout-report ночного runner.

**Проверка кодировки:** `index.html` не редактировался; обязательный guard `node scripts/check-cp1251-mojibake.mjs` запускается перед commit.

**Тест:** `git checkout feat/admin-tariff-api`, `git fetch`, `git pull --ff-only`, scan `pm/inbox`, `git diff --check`, `node scripts/check-cp1251-mojibake.mjs`, portable paths guard.

**Коммит:** pending

## 2026-07-24

### Reminder popup acceptance и видимый выбранный интервал

**Что сделано:** Ветка `fix/reminder-indicator-unified` создана от `feat/admin-tariff-api`, потому что основная рабочая копия занята параллельной glass-подготовкой. Из принятой reminder-ветки перенесены только runtime/test изменения без устаревших PM-ID. Popup-варианты получили стабильные 44px tap targets и горизонтальный текст в light/dark. Закрытый колокольчик теперь показывает `15 мин`, `1 час` или `1 день`, скрывает метку для `none` и обновляет полный `aria-label`. `BUG-2026-07-22-001` закрыт ручной приёмкой Алексея; новый индикатор зарегистрирован как уникальный `BUG-2026-07-24-001` / `BACK-070`. Старый focus brief синхронизирован в Done по ручному «Фокус ок». Portable-path guard дополнен исключением служебного `.git` worktree-файла, чтобы полный QA можно было честно запускать в изолированных рабочих копиях. Flaky keyboard-тест теперь ждёт завершения CSS transition через `expect.poll()` вместо мгновенного замера.

**Проверка кодировки:** совпадений до / после: 111 / 111.

**Тест:** `npm run build:css`; `node scripts/check-cp1251-mojibake.mjs`; `npm run smoke:back067-reminder` — `ok: true`, failures `[]`, dark/light trigger 44x44, options 140x44, selected indicators `1 час` / `15 мин`, opacity `1`; `npm run qa:prebeta` — exit 0, Playwright 20/20 и все обязательные smoke зелёные; `npm run smoke:back068-tag-popup` и `npm run smoke:back069-hero` — `ok: true`; portable/doc/diff guards прошли.

**Коммит:** this commit
