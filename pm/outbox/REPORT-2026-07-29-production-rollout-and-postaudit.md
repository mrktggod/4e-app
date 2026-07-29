# REPORT-2026-07-29-production-rollout-and-postaudit

status: NEED-YURI

## Result

Production rollout was not performed.

Step 1 preflight found blockers before merge:

1. `origin/main` is not on the expected old SHA `57ae1b49`. Fresh fetch shows `origin/main = 4ab2afcb6d6f4afa6219b9bc2e1da78900ca5797`.
2. `origin/feat/admin-tariff-api` is not `7cb290e`; fresh fetch shows `origin/feat/admin-tariff-api = fdbe24679a7112128a19557c9013f7a7e030c5d9`.
3. `pm/inbox` contains 7 `status: NEW` briefs created after the requested rollout scope. Several are QA regressions that plausibly must be fixed before release.

No merge to `main`, no push to `main`, no deploy watch, and no production Playwright/k6 post-audit were run.

## Fresh Branch State

| Ref | SHA |
| --- | --- |
| local active branch | `feat/admin-tariff-api` |
| local HEAD | `fdbe24679a7112128a19557c9013f7a7e030c5d9` |
| `origin/feat/admin-tariff-api` | `fdbe24679a7112128a19557c9013f7a7e030c5d9` |
| `origin/main` | `4ab2afcb6d6f4afa6219b9bc2e1da78900ca5797` |
| merge-base | `4ab2afcb6d6f4afa6219b9bc2e1da78900ca5797` |
| commits in feat not in main | 13 |
| commits in main not in feat | 0 |

## Stop-Zone Check

Range checked: `5ca2e19..origin/feat/admin-tariff-api`.

| Check | Result |
| --- | --- |
| CAL path match | none in changed paths |
| price/tariff path match | none in changed paths |
| payment path match | none in changed paths |
| entitlement path match | none in changed paths |
| secrets/config path match | none in changed paths |
| textual stop-zone scan | matches are stop-point text, local test placeholders, notification test strings, nav/calendar wording, and Windows Chrome fallback paths; no obvious runtime payment/entitlement/price/CAL/secret change was identified |

## Required Guards

| Command | Result |
| --- | --- |
| `node scripts/check-cp1251-mojibake.mjs` | pass: `CP1251 mojibake check passed: 0 suspicious tokens` |
| inbox `status: NEW` scan | failed release precondition: `NEW_COUNT=7` |

## NEW Inbox Briefs

| Brief | Release impact |
| --- | --- |
| `BRIEF-2026-07-29-100-night-qa-first-runner-protocol.md` | process/doc task, not runtime |
| `BRIEF-2026-07-29-101-home-show-all-bottom-nav-regression.md` | Web/Telegram dashboard regression: hidden show-all button and bottom nav covering task rows |
| `BRIEF-2026-07-29-102-ai-chat-keyboard-reserve-padding.md` | Web Playwright AI chat keyboard geometry failure |
| `BRIEF-2026-07-29-103-task-detail-desktop-long-title.md` | desktop task-detail long-title layout failure |
| `BRIEF-2026-07-29-104-web-nav-contract-vs-bottom-menu.md` | Web/TG navigation contract mismatch |
| `BRIEF-2026-07-29-105-vk-mobile-tabs-bottom-reserve.md` | VK mobile visual clipping and bottom reserve issue |
| `BRIEF-2026-07-29-106-night-test-infra-windows-fallbacks.md` | test infrastructure task, not runtime |

## Decision Needed

Yuri has approved the rollout in principle, but this preflight no longer matches the requested assumptions.

Needed decision before continuing:

1. Treat `origin/main = 4ab2afc` as the accepted current production baseline.
2. Decide whether the 7 new briefs, especially `101`-`105`, must be fixed before rollout or can remain post-release backlog.
3. If rollout should proceed anyway, explicitly approve merging `origin/feat/admin-tariff-api = fdbe246...` into `main` despite these open QA briefs.

## Local Notes

Pre-existing local uncommitted changes were present and left untouched.
