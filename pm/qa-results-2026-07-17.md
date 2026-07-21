# QA results — 2026-07-17

Назначение: один файл для утренней ручной проверки. Заполнять фактами, не выводами по исходникам. Если шаг не проверен руками, оставлять `Not run`.

## 1. Итоговый статус дня

| Поле | Значение |
| --- | --- |
| QA owner | Yuri |
| Environment | staging first, production only after green staging |
| Branch | feat/admin-tariff-api |
| App URL | https://4-ai-staging.pages.dev/ |
| Worker URL | restless-lab-d737-staging.shelckograff.workers.dev |
| Overall decision | Automated core staging API/shell pass; 2026-07-21 Alexey reported basic browser staging flow and Telegram Mini App keyboard/safe-area are OK; prod app/tariff open and price looks normal; payment UI entry has a new fail: subscription button does not open page; one red GitHub Pages deploy action remains |
| Beta invite allowed? | No decision yet: browser core and Telegram Mini App keyboard/safe-area look OK; subscription button bug is tracked as `BUG-2026-07-21-007`, and one red GitHub Pages deploy action remains separate release-risk evidence |

## 2. Pass/fail matrix

| ID | Flow | Steps | Expected | Result | Severity if fail | Notes / evidence |
| --- | --- | --- | --- | --- | --- | --- |
| QA-AUTH-001 | Registration | Incognito, new email, create account | Account created, no `Нет соединения` | Not run | P0 |  |
| QA-AUTH-002 | Duplicate registration | Try existing email | Clear duplicate message, no generic connection error | Not run | P1 |  |
| QA-AUTH-003 | Login | Existing account, correct password | Login succeeds | PASS | P0 | 2026-07-21 Alexey opened https://4-ai-staging.pages.dev/ on phone/browser and reported "all OK" after the requested basic check. |
| QA-AUTH-004 | Wrong password | Existing account, wrong password | Clear wrong-password message | PASS | P1 | 2026-07-21 Alexey reported: `Неверный пароль: ошибка видна`. This manually rechecks the earlier inline-error issue. |
| QA-AUTH-005 | CORS/browser edge | Registration from browser, not curl | Browser request succeeds or fails with visible server reason | PASS | P0 | Covered by 2026-07-21 browser staging report; exact request log not captured. |
| QA-TASK-001 | Task creation | Create task from main composer | Task draft opens and saves | PASS | P0 | 2026-07-21 Alexey reported basic staging check OK after being asked to verify login, task create, reload, and persistence. |
| QA-TASK-002 | Task confirm | Save through confirm screen | Task appears in list/calendar | PASS | P0 | Inferred from the same manual browser report; keep as browser-only evidence, not TMA evidence. |
| QA-TASK-003 | Reload persistence | Refresh after task save | Task remains visible | PASS | P0 | 2026-07-21 Alexey reported the staging browser check is OK. |
| QA-TASK-004 | Move deadline | Move task to tomorrow/custom date | Deadline changes and persists | Not run | P1 |  |
| QA-CHAT-001 | Text composer | Send normal message | Response renders, composer remains usable | Not run | P0 |  |
| QA-CHAT-002 | Mobile keyboard | Open keyboard on mobile viewport/device | Composer not hidden/broken | PASS | P1 | 2026-07-21 Alexey reported "ТГ Mini App ок" after requested Telegram Mini App AI-chat keyboard check. |
| QA-CHAT-003 | Voice entry | Tap microphone entry | Expected voice flow opens or clear fallback appears | PASS / subjective | P2 | 2026-07-21 Alexey reported voice works and he uses it constantly. This is user-visible live evidence, not the raw `NEW-020` perf breakdown. |
| QA-PAY-001 | Free/trial copy | New account sees trial/paywall messaging | Honest trial copy, no false premium claim | FAIL | P1 | 2026-07-21 Alexey reported on `https://4-ai-staging.pages.dev/`: subscription button does not work / does not open page. Tracked as `BUG-2026-07-21-007`; no real payment was attempted. |
| QA-PAY-002 | Expired access | Expired fixture/user | Premium actions gated | Not run | P0 |  |
| QA-PAY-003 | Active entitlement | Active premium fixture/user | Premium actions allowed | Not run | P0 |  |
| QA-AN-001 | Analytics events | Registration/task/chat/payment gate actions | Expected events fire once | Not run | P2 |  |
| QA-PWA-001 | PWA install prompt | Browser supports install | Manifest does not break app load | Not run | P3 |  |
| QA-SHARE-001 | Share cards | Open daily/weekly share cards | Copy renders without layout break | Not run | P3 |  |
| QA-ONBOARD-001 | First-run onboarding | New account first screen | Onboarding is understandable and not blocking | Not run | P2 |  |
| QA-HOME-001 | Dashboard redesign | Main dashboard after login | Core actions are discoverable | Not run | P1 |  |

## 3. Bug intake table

| Bug ID | Found in QA row | Severity | Environment | Short title | Repro steps | Expected | Actual | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BUG-YYYYMMDD-001 |  |  |  |  |  |  |  |  |

## 4. Severity rubric

| Severity | Meaning | Action |
| --- | --- | --- |
| P0 | Blocks registration/login/core task/chat/payment entitlement | Fix before beta invite |
| P1 | Major flow degraded, workaround exists | Fix before wider beta |
| P2 | UX/analytics issue that does not block core value | Can enter beta backlog if documented |
| P3 | Polish/docs/low-risk enhancement | Defer unless cheap and safe |

## 5. Go/no-go rule

| Condition | Decision |
| --- | --- |
| Any P0 open | No beta invite |
| More than two P1 open | No wider beta |
| P0=0 and P1<=2 with known workaround | Small closed beta allowed |
| Analytics broken for core events | Beta allowed only if qualitative feedback is enough for that batch |
| Payment/entitlement broken | No paid smoke / no production payment changes |

## 6. After QA

1. Copy real failures from this file into `pm/bugs.md`.
2. Update `pm/backlog.md` statuses only after a real pass/fail result.
3. Fix P0/P1 in separate small commits.
4. Add a `shared/WORK_LOG.md` entry for each fix.
5. Do not reopen CAL/native/price/main-merge work from this QA file.

## 7. Automated staging evidence — 2026-07-17

| Check | Result | Evidence |
| --- | --- | --- |
| App shell | PASS | `GET https://4-ai-staging.pages.dev/ -> 200`, HTML length `442732` |
| Worker wiring | PASS | staging HTML contains `restless-lab-d737-staging.shelckograff.workers.dev` |
| CORS preflight | PASS | `OPTIONS /auth/login` with staging Origin returned `204`, ACAO is `https://4-ai-staging.pages.dev` |
| API smoke | PASS | `scripts/api-smoke.mjs` against staging returned `api-smoke: OK` |
| Auth/register/login/auth-me | PASS | register `200`, login `200`, auth/me `200` |
| Tasks create/list/receiver/done/delete | PASS | all returned `200` in smoke; receiver saw copied assigned task |
| AI endpoint | PASS | `/anthropic` returned `200` |
| Transcribe negative | PASS | no-file returned `400` |

Evidence doc: `docs/tasks/STAGING-AUTOMATED-QA-2026-07-17.md`.

Manual rows above remain `Not run` unless Yuri/real browser/device confirms them.

## 8. Manual browser evidence — 2026-07-21

| Check | Result | Evidence |
| --- | --- | --- |
| Basic browser staging flow | PASS | Alexey opened `https://4-ai-staging.pages.dev/` and reported "все ок" after the requested browser check. Recorded as browser evidence for login/task-create/reload persistence only. |
| Telegram Mini App safe-area/keyboard | PASS | Alexey opened the app through Telegram Mini App on phone and reported "ТГ Mini App ок" after the requested AI-chat keyboard and bottom-nav/safe-area check. |
| Payment/provider/OAuth gates | Not run | No real provider/payment/OAuth smoke was reported in this check. |
| Subscription button UI | FAIL | Alexey reported on `https://4-ai-staging.pages.dev/` that the subscription button does not work and does not open the page. Bug: `BUG-2026-07-21-007`. |

## 9. Manual auth/avatar evidence — 2026-07-21

| Check | Result | Evidence |
| --- | --- | --- |
| Wrong password inline error | PASS | Alexey reported `Неверный пароль: ошибка видна` on staging. |
| Set new avatar | BLOCKED | Alexey reported a new avatar cannot be set: the app says the function is not working yet. This prevents a fresh manual recheck of avatar leak/persistence scenarios. |
| Autologin/login screen flicker | NEW BUG | Alexey reported a small delay between existing authorization/autologin and app entry; login screen should ideally not be shown when a valid session exists. Bug: `BUG-2026-07-21-008`. |

## 10. Manual release-readiness evidence — 2026-07-21

| Check | Result | Evidence |
| --- | --- | --- |
| GitHub Actions overview | PARTIAL | Alexey reported Actions are green with one red. Screenshot shows red `Deploy GitHub Pages #264`, commit `7325c27`, on `main`; nearby `Mojibake Check #110`, commit `614d7c2`, is green. |
| Production app | PASS | Alexey reported `https://app.4-ai.site/` opens. |
| Production tariff config | PASS | Alexey reported `https://edge.4-ai.site/tariff-config` opens. |
| Price visual check | PASS | Alexey reported price is normal. |

## 11. Manual NEED-YURI notes — 2026-07-21

| Area | Result | Evidence |
| --- | --- | --- |
| Redesign cutover | Resolved elsewhere | Alexey reported the redesign had many corrections in another chat and should be treated as resolved outside this manual-QA thread. No new redesign decision was made here. |
| Voice usability | PASS / subjective | Alexey reported voice works and he uses it constantly. Keep `NEW-020` technical perf task open only if raw latency breakdown is still needed. |
