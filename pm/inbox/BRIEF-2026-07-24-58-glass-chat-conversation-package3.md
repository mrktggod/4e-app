status: BLOCKED-DEPENDENCY

# BRIEF-2026-07-24-58-glass-chat-conversation-package3

## Context

The provided reference includes a chat panel, but package 1 intentionally left
chat out. This package 3 brief aligns the AI chat/conversation surfaces after
the primary task surfaces and generic controls are stable.

Dependencies:

- packages 1 and 2 and brief 57 should be `DONE`, or this brief should become
  `BLOCKED-DEPENDENCY`;
- do not change AI request, auth token or entitlement behavior.

## Task

Apply the shared glass language to safe Telegram chat surfaces.

In scope:

- chat/conversation panel surfaces;
- message list containers and empty/loading states;
- composer shell and send button visual treatment;
- existing local state indicators;
- keyboard-safe layout polish covered by Playwright.

Out of scope:

- `/anthropic` API behavior;
- auth token handling;
- AI prompt or model behavior;
- chat history persistence rules;
- payment/entitlement gating;
- VK AI chat, which remains Claude-reviewed unless separately briefed.

Preserve message sending, loading, error and history behavior.

## Stop Points

- No production deploy or merge into `main`.
- No CAL, price, payment, entitlement, auth-security or secret work.
- If the chat change requires API/auth semantics, stop with `NEED-CLAUDE`.
- No new inline styles or inline handlers.

## Verification

- Mandatory index.html encoding check before and after any edit.
- `node scripts/check-cp1251-mojibake.mjs`
- `npm run build:css`
- `npm run test:e2e:web`
- `npm run smoke:chat-history40`
- `npm run smoke:back065`
- `npm run check:portable-paths`
- `npm run check:ui-architecture`
- `git diff --check`
- 390x844 light/dark screenshots of chat with loaded, loading and composer
  states

## Report

Write
`pm/outbox/REPORT-BRIEF-2026-07-24-58-glass-chat-conversation-package3.md`
with changed selectors/files, commit SHA, raw test output, screenshot paths,
API/auth exclusions and remaining manual tails.
