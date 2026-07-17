# BACK-040 — tariff config readiness checklist

Цель: не считать admin tariff API готовым к paid launch, пока production `/tariff-config` не доказан как осознанный конфиг, а не случайный default/fallback. Этот документ не меняет цену и не включает production deploy.

## 1. Текущий статус

| Layer | Status |
| --- | --- |
| Admin API endpoints | Implemented in worker |
| Public tariff config endpoint | Implemented as `/tariff-config` |
| Front paywall config read | Implemented in `index.html` |
| Business price decision | Not changed by this task |
| Production config proof | Still required before paid launch |

## 2. Readiness gates

| Gate | Expected evidence |
| --- | --- |
| Staging `/tariff-config` | Returns current intended trial/price/plan config |
| Production `/tariff-config` | Returns current intended config, not hardcoded fallback |
| Admin update path | Requires admin auth and rejects unauthenticated update |
| Front paywall | Reads endpoint and renders same terms user will pay for |
| Payment amount | Matches tariff config exactly for the selected plan |
| Audit trail | Manual/admin config changes are recorded in WORK_LOG/release notes |

## 3. Negative checks

| Check | Expected |
| --- | --- |
| Missing admin token on update | Reject |
| Invalid tariff payload | Reject or ignore safely |
| Front cannot fetch config | Show safe fallback/copy, do not misrepresent paid terms |
| Payment amount differs from tariff config | No entitlement grant |
| Production config is default unexpectedly | Stop paid launch |

## 4. Release rule

| Situation | Decision |
| --- | --- |
| Code exists but production config unverified | `BACK-040` stays Ready for QA |
| Staging config verified only | Can continue staging paid smoke, not production launch |
| Production config verified and matches payment gates | Can be considered for Done after release review |
| Price changes requested | Separate business decision and release note |

## 5. Manual evidence to collect

| Evidence | Where to paste result |
| --- | --- |
| Staging `/tariff-config` response without secrets | `pm/qa-results-2026-07-17.md` or release checklist |
| Production `/tariff-config` response without secrets | Release checklist |
| Admin unauthorized response | `pm/qa-results-2026-07-17.md` |
| Paywall screenshot/copy | Manual QA notes |