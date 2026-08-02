# Autotests

Playwright checks three app surfaces:

- web: `autotests/tests/web`
- Telegram Mini App: `autotests/tests/telegram-app`
- VK Mini App: `autotests/tests/vk-app`

Run:

```bash
npm run test:e2e
npm run test:e2e:web
npm run test:e2e:telegram
npm run test:e2e:vk
```

The Playwright config starts a local static server on `http://127.0.0.1:4174`.
Override it when needed:

```bash
BASE_URL=https://qa-b7076e2.4-ai-staging.pages.dev npm run test:e2e
```

The Telegram and VK tests mock only the host APIs needed for safe browser smoke tests.
They do not replace real Telegram/VK phone QA.

k6 load smoke is intentionally small by default:

```bash
npm run load:smoke
```

Override load target and size explicitly:

```bash
BASE_URL=https://qa-b7076e2.4-ai-staging.pages.dev K6_VUS=5 K6_DURATION=20s npm run load:smoke
```

Do not run k6 against production without a separate human decision.

## Nightly Playwright

`.github/workflows/nightly-playwright.yml` runs the full Web, Telegram and VK
Playwright suite every day at `23:17 UTC` (`02:17 Europe/Moscow`) and can also be
started manually after the workflow is present on the default branch.

The workflow is intentionally nonblocking: it has no `pull_request` or `push`
trigger and is not part of the fast PR gate. A failed nightly run remains red and
uploads the HTML report plus retained traces, screenshots and videos for 14 days.

Treat the workflow as a pilot until five consecutive runs are green. A rerun does
not erase flakiness: record both the failed run and the successful rerun. Real
Telegram/VK device QA remains a separate manual gate.
