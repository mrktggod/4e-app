status: NEED-CLAUDE

# BRIEF-2026-07-23-49 - VK-AI-CHAT-001 Claude scope

## Goal

Make VK AI-chat beta-ready without hiding real backend/auth/entitlement errors behind a generic fallback, but keep sensitive diagnosis under Claude/Yuri scope review.

## Context

`pm/vk-parity-plan-2026-07-23.md` marks VK AI-chat as `BROKEN`: a manual signal says it does not work, and source audit says response errors may be masked because `res.ok` is not checked.

The area can touch auth status and entitlement evidence, so autonomous night code changes are not allowed without a reviewed scope.

## Task

Do not touch runtime code.

Write `pm/outbox/REPORT-2026-07-23-49-vk-ai-chat-claude-scope.md` with:

- exact source locations for VK AI request/response handling;
- safest diagnostic plan using a fresh test account and redacted token/payload;
- proposed allowed fix after review: check `res.ok`, show honest error class, add transient retry/request-id diagnostics;
- explicit prohibition on weakening `x-token`, entitlement, or backend auth.

## Stop Points

No code changes in this brief. No production deploy, no merge into `main`, no VK Pay, no prices, no payments, no entitlement changes, no secrets, no CAL, no live VK account/device actions.

## Expected Outcome

`NEED-CLAUDE`.
