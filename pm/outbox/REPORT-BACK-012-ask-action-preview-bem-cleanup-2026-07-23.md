status: DONE

# REPORT: BACK-012 ask action preview BEM cleanup

## Task

Move one safe generated UI island from inline styles to LESS/BEM classes: ask action and clarification previews.

## Root Cause

- `index.html:6562` `renderAskActionPreview()` generated ask action preview markup with inline style attributes for the card, label, list, controls and buttons.
- `index.html:6614` `renderAskClarificationPreview()` generated clarification option markup with inline style attributes for option buttons, question card and controls.

## Changed Files

- `index.html`
- `styles/screens/voice.less`
- `styles.css`
- `styles.min.css`
- `scripts/ask-action-preview-bem-smoke.mjs`
- `package.json`
- `docs/tasks/BACK-012-component-inventory-2026-07-22.md`
- `pm/backlog.md`
- `pm/team-sync.md`
- `shared/WORK_LOG.md`
- `DEVELOPMENT_LOG.md`

## What Changed

- Replaced generated ask action preview inline styles with `.ask-action-card`, `.ask-action-label`, `.ask-action-list`, `.ask-action-controls`, `.ask-action-btn`, `.ask-action-btn--primary`, `.ask-action-btn--secondary` and `.ask-action-btn--pill`.
- Kept the existing action handlers: `confirmAskActions`, `dismissAskActions`, and `answerAskClarification`.
- Added `npm run smoke:ask-action-preview` to assert the target renderers contain no `style=` attributes and that the classes exist in LESS and minified CSS.
- Rebuilt CSS artifacts.

## Proof

```text
Before index encoding marker check:
До правки: 111 совпадений

After index encoding marker check:
После правки: 111 совпадений
```

```text
> smoke:ask-action-preview
> node scripts/ask-action-preview-bem-smoke.mjs

{
  "ok": true,
  "checked": [
    "renderAskActionPreview",
    "renderAskClarificationPreview"
  ],
  "inlineStyleAttrs": 0
}
```

```text
CP1251 mojibake check passed: 0 suspicious tokens
```

```text
UI architecture guard: inline style attributes = 299 / 465
UI architecture guard: inline event handlers = 401 / 402
UI architecture guard: style tags = 0 / 0
UI architecture guard: inline script tags = 3 / 3
```

```text
Portable path check passed.
```

```text
node --check scripts\ask-action-preview-bem-smoke.mjs
git diff --check
Both passed with exit code 0.
```

## Boundaries

- No production deploy.
- No merge into `main`.
- No CAL work.
- No pricing changes.
- No payment, entitlement, auth-security, or secret changes.

## Next Step

Stop autonomous BACK-012 cleanup until a fresh narrow brief/smoke selects the next safe island. The remaining profile/settings and broader ask surfaces are wider than the current pre-reviewed whitelist candidate.
