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
| Overall decision | Not run |
| Beta invite allowed? | No decision yet |

## 2. Pass/fail matrix

| ID | Flow | Steps | Expected | Result | Severity if fail | Notes / evidence |
| --- | --- | --- | --- | --- | --- | --- |
| QA-AUTH-001 | Registration | Incognito, new email, create account | Account created, no `Нет соединения` | Not run | P0 |  |
| QA-AUTH-002 | Duplicate registration | Try existing email | Clear duplicate message, no generic connection error | Not run | P1 |  |
| QA-AUTH-003 | Login | Existing account, correct password | Login succeeds | Not run | P0 |  |
| QA-AUTH-004 | Wrong password | Existing account, wrong password | Clear wrong-password message | Not run | P1 |  |
| QA-AUTH-005 | CORS/browser edge | Registration from browser, not curl | Browser request succeeds or fails with visible server reason | Not run | P0 |  |
| QA-TASK-001 | Task creation | Create task from main composer | Task draft opens and saves | Not run | P0 |  |
| QA-TASK-002 | Task confirm | Save through confirm screen | Task appears in list/calendar | Not run | P0 |  |
| QA-TASK-003 | Reload persistence | Refresh after task save | Task remains visible | Not run | P0 |  |
| QA-TASK-004 | Move deadline | Move task to tomorrow/custom date | Deadline changes and persists | Not run | P1 |  |
| QA-CHAT-001 | Text composer | Send normal message | Response renders, composer remains usable | Not run | P0 |  |
| QA-CHAT-002 | Mobile keyboard | Open keyboard on mobile viewport/device | Composer not hidden/broken | Not run | P1 |  |
| QA-CHAT-003 | Voice entry | Tap microphone entry | Expected voice flow opens or clear fallback appears | Not run | P2 |  |
| QA-PAY-001 | Free/trial copy | New account sees trial/paywall messaging | Honest trial copy, no false premium claim | Not run | P1 |  |
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