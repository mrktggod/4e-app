status: DONE
brief: pm/inbox/BRIEF-2026-07-30-115-vk-ai-chat-main-parity.md

# REPORT - BRIEF-2026-07-30-115 VK AI chat main parity

## Result

VK AI chat now handles the existing structured task tags used by the main app and
keeps `originalMsg` on tasks created from VK chat.

## Changed Files

- `vk.html`
- `scripts/vk-ai-chat-main-parity-smoke.mjs`
- `package.json`
- `FILE_MAP.md`
- `DEVELOPMENT_LOG.md`

## Behavior

- Direct VK chat task creation stores `originalMsg` and `description`.
- `<create_task>{...}</create_task>` is parsed when returned by `/anthropic` and
  saved through the existing `x-action:save-task` path.
- `<task_actions>[...]</task_actions>` supports safe `show`, `complete`,
  `reschedule`, and `edit` actions through existing frontend paths.
- Tags are removed from visible assistant text and local chat history.
- No backend `/anthropic` contract change or profile facts/memory expansion was
  added.

## Raw Evidence

```text
npm run smoke:vk-ai-chat-parity
> node scripts/vk-ai-chat-main-parity-smoke.mjs
VK AI chat main parity smoke: PASS
```

```text
npm run smoke:vk-ai-chat-errors
> node scripts/vk-ai-chat-errors-smoke.mjs
VK AI chat errors smoke: PASS
```

```text
npm run test:e2e:vk
4 passed
```

```text
node --check scripts/vk-ai-chat-main-parity-smoke.mjs
exit 0
```

```text
node scripts/check-cp1251-mojibake.mjs
CP1251 mojibake check passed: 0 suspicious tokens
```

## Tails

Remote chat history and profile facts/memory remain out of scope. No backend
contract change, production deploy, main merge, or live VK account/device check
was performed.
