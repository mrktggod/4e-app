status: QA-REPORT
date: 2026-07-29
branch: feat/admin-tariff-api
head: ced8fd6

# Большой локальный QA-прогон: Web / Telegram / VK / k6

Прогон выполнен по текущему локальному состоянию `X:\Projects\4-ai-secretary\app`.
Рабочее дерево до теста уже было грязным; изменения не коммитились.

## Команды и итог

| Проверка | Итог |
| --- | --- |
| Playwright Web (`autotests/tests/web`) | FAIL: 12/16 passed, 4 failed |
| Playwright Telegram mock | PASS: 2/2 |
| Playwright VK mock | PASS: 4/4 |
| k6 local static smoke | PASS: 5 VU, 20s, 285 requests, 0% failed, p95 41.42ms |
| `check:js-syntax` | PASS |
| `check:cp1251-mojibake` | PASS |
| Portable paths guard | PASS через PowerShell equivalent; npm wrapper fails because `bash` is not in PATH |
| UI architecture guard | PASS через PowerShell equivalent: inline styles 284/465, handlers 394/402, style tags 0/0, inline scripts 3/3 |

## Web

Статус: красный.

Что работает:

- app shell открывается;
- `privacy.html` открывается;
- auth/legal ссылки и touch targets проходят;
- базовая voice-кнопка в AI-чате видима и ведёт в consent flow;
- home bottom nav остаётся внутри viewport на home.

Баги:

1. `P1 Web/TG dashboard`: `home-show-all-btn` скрыт, когда активных задач больше, чем показывается в top-3.
   - Proof: `npm run smoke:home001` failed.
   - Failures: `home should expose show-all when active tasks exceed visible priority rows`, `light theme lost show-all task action`.
   - Visual: `docs/tasks/assets/HOME-001-dashboard-smoke-2026-07-20-light.png`, `docs/tasks/assets/HOME-001-dashboard-smoke-2026-07-20-dark.png`.
   - Dark visual tail: third task card is partly hidden behind bottom nav.

2. `P1 AI chat keyboard`: keyboard reserve class is added, CSS variable is set, but computed `padding-bottom` remains `0`.
   - Proof: Playwright Web failed on mobile and desktop.
   - Expected: `paddingBottom >= 260`.
   - Actual: `paddingBottom = 0`, `--app-keyboard-offset = 260px`.

3. `P2 Web shell/test-contract`: `#global-nav` is not visible on `calendar`, while current Telegram bottom-menu diagnostic expects global nav hidden on inner pages.
   - Proof: Playwright Web failed on mobile and desktop: `#global-nav should be visible`.
   - Related green diagnostic: `npm run smoke:telegram-bottom-menu` says `globalNavVisible=false` on `profile`, `task-detail`, `subscription`, `statistics`.
   - Decision needed in implementation: either restore global nav on these inner surfaces or update the web Playwright contract to the new shell rule.

4. `P1 Task detail desktop`: long desktop task title wraps vertically too much.
   - Proof: `npm run smoke:back069-hero` failed after setting `CHROME_PATH` to Playwright Chromium.
   - Error: `desktop title appears vertically wrapped: 200px`.
   - Mobile screenshots look readable, so this is primarily desktop/tablet layout.

## Telegram Mini App

Статус: partially green.

What passed:

- Playwright Telegram mock opens on mobile and desktop: 2/2 passed.
- `npm run smoke:telegram-bottom-menu` passed.
- `npm run smoke:telegram-dashboard-one-task` failed on the same show-all problem as Web, so dashboard data/layout has a shared Web/TG bug.

Telegram-specific limitations:

- This was a mocked host smoke, not a live Telegram phone run.
- No real Telegram keyboard, haptics, bot handoff, live auth, or group behavior was checked.

Telegram visible risk:

- Dark home screenshot shows the top-3 list clipped by the fixed bottom nav when show-all is hidden.

## VK Mini App

Статус: green in automated mock, with visual tails.

What passed:

- VK Playwright mock: 4/4 passed.
- Covered open, home, task detail, ask, calendar, stats and profile navigation.
- `npm run smoke:vk-task-actions` passed: visible `Готово` fallback works and does not expose destructive action.

Visual tails from screenshots:

- Mobile VK top filter tabs overflow/crop to the right; `Неделя` is partly clipped.
- Mobile VK full-page screenshot shows fixed bottom nav covering lower task-list content.
- Desktop VK is stable in the captured shell.

Artifacts:

- `autotests/test-results/vk-app-basic-VK-Mini-App-opens-with-mocked-launch-params-mobile-chromium/vk-home.png`
- `autotests/test-results/vk-app-basic-VK-Mini-App-opens-with-mocked-launch-params-desktop-chromium/vk-home.png`

VK limitations:

- This is not a live VK Mini Apps host smoke.
- No VK Pay, live VK auth, device safe-area, or host back/swipe behavior was checked.

## k6

Статус: green for local static delivery.

Run:

- `BASE_URL=http://127.0.0.1:4184`
- `K6_VUS=5`
- `K6_DURATION=20s`

Results:

- `/index.html`, `/vk.html`, `/privacy.html`: 200 OK;
- 285 HTTP requests;
- failed requests: 0%;
- p95 latency: 41.42ms;
- max latency: 383.2ms.

Interpretation: static local delivery is healthy. This does not prove Worker/API/staging/prod latency.

## Environment Issues

- `npm run check:portable-paths` exits 127 because wrapper cannot spawn `bash`.
- `npm run check:ui-architecture` exits 127 for the same reason.
- CDP smoke scripts need `CHROME_PATH` because `chrome`/`msedge` are not in PATH. Using Playwright Chromium fixed `back055`; `back069` then failed on a real layout assertion.
- Python `http.server` emits benign `ConnectionAbortedError` when browsers abort asset requests during test shutdown.

## Suggested Fix Sprints

### Sprint 1: Release Blockers

1. Restore `home-show-all-btn` for Web/Telegram when active tasks exceed visible rows.
2. Fix dark home list/bottom-nav overlap after show-all is restored.
3. Fix AI chat keyboard reserve so `.ask-bar--keyboard-open` produces actual bottom padding/reserved area.
4. Fix or formally update the `#global-nav` contract for inner screens.

### Sprint 2: Desktop/Responsive Polish

1. Fix task-detail desktop long-title wrapping (`back069`).
2. Add/refresh desktop visual proof for task detail after the fix.
3. Re-run Web Playwright full suite and `home001`, `back069`.

### Sprint 3: VK Mobile Visual Parity

1. Make VK top filters scroll/fit cleanly on mobile without clipped `Неделя`.
2. Add bottom content reserve for VK task list under fixed nav.
3. Re-run VK Playwright and capture mobile visual screenshots.

### Sprint 4: Test Infrastructure

1. Make shell guards Windows-portable without requiring `bash` in PATH, or document Git Bash dependency.
2. Update CDP smoke scripts to default to Playwright Chromium when `chrome`/`msedge` are unavailable.
3. Split Web shell nav expectation from Telegram bottom-menu expectation so tests reflect one product decision.
