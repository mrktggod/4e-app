# QA results — 2026-07-17

Назначение: один файл для утренней ручной проверки. Заполнять фактами, не выводами по исходникам. Если шаг не проверен руками, оставлять `Not run`.

## 1. Итоговый статус дня

| Поле | Значение |
| --- | --- |
| QA owner | Yuri |
| Environment | staging first, production only after green staging |
| Branch | feat/admin-tariff-api |
| App URL | https://4-ai-staging.pages.dev/ |
| Current release-candidate preview | https://qa-b7076e2.4-ai-staging.pages.dev/ (`b7076e2`) |
| Worker URL | restless-lab-d737-staging.shelckograff.workers.dev |
| Overall decision | Automated core staging API/shell pass; basic browser and Telegram Mini App checks are green; production app/tariff open and price looks normal. On 2026-07-22 the current `b7076e2` preview opened the payment card-entry form successfully. The historical red Pages run was followed by successful main deployments. |
| Beta invite allowed? | No decision yet: payment entry is green; autologin succeeds but has a brief P2 login-screen flicker. Chat-history loss and notification delivery remain the larger open/manual-gated risks. Real payment completion was not tested. |

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
| QA-CHAT-003 | Voice entry | Tap microphone entry | Expected voice flow opens or clear fallback appears | PASS | P2 | 2026-07-22 Alexey explicitly closed the voice issue: voice works in regular use and there are no remaining complaints. `NEW-020` is Done; raw perf breakdown is not required. |
| QA-PAY-001 | Free/trial copy and payment entry | New account sees trial/paywall messaging and opens subscription | Honest trial copy; subscription opens provider flow | PASS (entry only) | P1 | The older shared staging build failed on 2026-07-21. On 2026-07-22 Alexey tested exact preview `b7076e2`: subscription opened the card-entry form. No card data was entered and no real payment was attempted. |
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
| Autologin/login screen flicker | CONFIRMED P2 | Rechecked on current preview `b7076e2`: autologin succeeds, but login flashes very briefly before home. Bug: `BUG-2026-07-21-008`. |

## 10. Manual release-readiness evidence — 2026-07-21

| Check | Result | Evidence |
| --- | --- | --- |
| GitHub Actions overview | RESOLVED / historical failure | Alexey's screenshot showed red `Deploy GitHub Pages #264` on `7325c27`. Log review on 2026-07-22 confirmed the guard correctly rejected a production artifact containing `4-ai-staging.pages.dev`; subsequent Pages runs on `614d7c2` and current `main` `57ae1b4` succeeded. Current branch Quality guard and Mojibake Check are green. |
| Production app | PASS | Alexey reported `https://app.4-ai.site/` opens. |
| Production tariff config | PASS | Alexey reported `https://edge.4-ai.site/tariff-config` opens. |
| Price visual check | PASS | Alexey reported price is normal. |

## 11. Manual NEED-YURI notes — 2026-07-21

| Area | Result | Evidence |
| --- | --- | --- |
| Redesign cutover | Resolved elsewhere | Alexey reported the redesign had many corrections in another chat and should be treated as resolved outside this manual-QA thread. No new redesign decision was made here. |
| Voice usability | PASS / closed | Alexey explicitly confirmed on 2026-07-22 that voice works in regular use and there are no complaints. `NEW-020` is Done; no extra latency pass is required. |

## 12. Current release-candidate preview - 2026-07-22

| Check | Result | Evidence |
| --- | --- | --- |
| Isolated Pages deployment | PASS | Commit `b7076e2` deployed as branch `qa-b7076e2`: `https://9ff9c715.4-ai-staging.pages.dev/`; stable alias `https://qa-b7076e2.4-ai-staging.pages.dev/`. |
| App shell and assets | PASS | Both URLs returned `200`, HTML length `467312`; `scripts/auth-handlers.js` returned `200`. |
| Correct environment | PASS | Live HTML contains `restless-lab-d737-staging.shelckograff.workers.dev`; production and shared staging alias were not changed. |
| Fresh-code markers | PASS | Live artifact contains the privacy-link binding, task-title normalization, and preview flags from the current branch. |
| Browser CORS path | PASS | `OPTIONS /auth/login` from the direct preview origin returned `204`; ACAO matched `https://9ff9c715.4-ai-staging.pages.dev`. |
| Subscription CTA | PASS | Alexey reached the payment card-entry form on `https://qa-b7076e2.4-ai-staging.pages.dev/`. This closes `BUG-2026-07-21-007` for the current preview. No real payment was performed. |
| Saved-session autologin | PASS with P2 flicker | Alexey closed and reopened the current preview: saved authorization worked, but the login screen flashed very briefly before the main screen. Confirmed as `BUG-2026-07-21-008`; not a login blocker. |
| AI-chat short history persistence | PASS | Alexey sent a recognizable message, fully closed the preview, reopened it, and reported that the message and visible history remained. `BUG-2026-07-21-005` stays open only for extended history over the current 40-message window or another chat surface. |

## 13. Task-detail iPhone/TMA screenshot audit - 2026-07-22

| Check | Result | Evidence |
| --- | --- | --- |
| Reminder timing control | BLOCKED / P1 | Alexey could not tap/open reminder timing, so notification delivery was not testable. `BUG-2026-07-22-001`. |
| Tag editor with keyboard | FAIL / P1 | Absolute tag input and native `datalist` suggestion cover the hero; no visible cancel/dismiss action. `BUG-2026-07-22-002`. |
| Long tag/title responsive layout | FAIL / P1 | Tag wraps one letter per line; title overlaps deadline/priority cards and content is clipped. `BUG-2026-07-22-003`. |
| Notification sound/vibration/delivery | Not run | Blocked before reminder setup; repeat after task-detail control fix. |

Evidence and screenshots: `docs/tasks/BUG-2026-07-22-task-detail-ios-regressions.md`.
