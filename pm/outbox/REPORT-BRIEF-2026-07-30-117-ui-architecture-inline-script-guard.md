status: DONE
brief: pm/inbox/BRIEF-2026-07-30-117-ui-architecture-inline-script-guard.md

# REPORT - BRIEF-2026-07-30-117 UI architecture inline script guard

## Result

The pre-whitelist QA gate no longer fails on inline script tag count.

## Changed Files

- `index.html`
- `scripts/qa-press-feedback.js`
- `scripts/build-pages-whitelist.mjs`
- `sw.js`
- `FILE_MAP.md`
- `DEVELOPMENT_LOG.md`

## Behavior

- Moved the small QA press/haptic/autoresize helper from inline `index.html` into
  `scripts/qa-press-feedback.js`.
- Kept the same DOMContentLoaded installation guard and duplicate-install guard.
- Added the new runtime script to the Pages whitelist builder and PWA shell cache.
- Reduced `index.html` inline script tags from 4 to 3 without touching payment,
  entitlement, CAL, production deploy, `main`, secrets, or auth-security logic.

## Raw Evidence

```text
npm run check:ui-architecture
UI architecture guard: inline style attributes = 283 / 465
UI architecture guard: inline event handlers = 402 / 402
UI architecture guard: style tags = 0 / 0
UI architecture guard: inline script tags = 3 / 3
```

```text
npm run test:e2e:web
16 passed
```

```text
npm run check:pages-script-assets
Pages script asset check passed:
- index.html -> scripts/qa-press-feedback.js
```

```text
node scripts/check-cp1251-mojibake.mjs
CP1251 mojibake check passed: 0 suspicious tokens
```

## Tails

No product UX change was intended. This was a narrow QA gate unblocker before
private backlog/roadmap whitelist selection.
