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
