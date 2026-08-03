status: DONE
brief: pm/inbox/BRIEF-2026-07-30-116-ai-task-decomposition-steps.md

# REPORT - BRIEF-2026-07-30-116 AI task decomposition steps

## Result

Web/PWA task detail now shows AI-proposed checklist steps as a preview and only
writes them after explicit user confirmation.

## Changed Files

- `index.html`
- `styles/screens/tasks.less`
- `styles.css`
- `styles.min.css`
- `scripts/task-decomposition-preview-smoke.mjs`
- `package.json`
- `FILE_MAP.md`
- `DEVELOPMENT_LOG.md`

## Behavior

- Empty checklist state explains that 4 can split the task into clear steps.
- Existing checklists show the secondary "add steps with AI" action label.
- The existing `/anthropic` call requests 3-7 short concrete steps.
- AI results are rendered into `#detail-decompose-preview` with confirm/cancel
  controls.
- Cancel clears pending steps and does not call `saveTaskEdits`.
- Confirm appends pending steps to the checklist and saves exactly once.
- Strict JSON `{"steps":[...]}` responses parse correctly and are capped at
  seven steps.
- No new backend endpoint, payment, entitlement, production deploy, main merge,
  VK, or Telegram surface work was added.

## Raw Evidence

```text
npm run smoke:task-decomposition
> node scripts/task-decomposition-preview-smoke.mjs
Task decomposition preview smoke: PASS
```

```text
npm run build:css
> lessc styles/main.less styles.css && cleancss styles.css -o styles.min.css
```

```text
npm run test:e2e:web
16 passed
```

```text
node --check scripts/task-decomposition-preview-smoke.mjs
exit 0
```

```text
npm run check:js-syntax
JS syntax OK: scripts/task-decomposition-preview-smoke.mjs
JS syntax OK: index.html inline-script#1
JS syntax OK: index.html inline-script#2
JS syntax OK: index.html inline-script#3
JS syntax OK: index.html inline-script#4
```

```text
npm run check:portable-paths
Portable path check passed.
```

```text
git diff --cached --check
exit 0
```

```text
node scripts/check-cp1251-mojibake.mjs
CP1251 mojibake check passed: 0 suspicious tokens
```

```text
npm run check:ui-architecture
UI architecture guard failed: inline script tags = 4, allowed max = 3
```

## Tails

This is a frontend Web/PWA MVP only. VK and Telegram parity remain separate
follow-up work. No live AI/backend integration smoke was run. The UI
architecture guard remains red on pre-existing inline script debt (`4 > 3`);
this task did not add inline script tags.
