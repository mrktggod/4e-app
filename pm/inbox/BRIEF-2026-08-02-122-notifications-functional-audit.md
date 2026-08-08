status: DONE

# BRIEF-2026-08-02-122-notifications-functional-audit

## Context

Manual QA 2026-08-02: notifications were not visible. Alexey suspects permission request may not exist, sound may not be configured, and the current notification feature needs deeper research because notifications are core to the service.

## Task

Audit the current notification functionality end to end from the app side:

- where the UI asks for notification permission, if anywhere;
- how task reminders are saved;
- what local notification UI exists;
- what Telegram/bot/worker delivery contract exists in this app checkout or linked reports;
- what is already covered by tests;
- what cannot be verified without live Telegram/bot/worker access.

Do not implement broad notification architecture in this brief. If a narrow frontend bug is obvious and safe, create a follow-up implementation brief with exact files and proof needed.

## Surface

- App notification UI and PM evidence.
- Worker/bot code is out of this checkout unless canonical worktrees are explicitly available under `X:\Projects\4-ai-secretary`.

## Stop Points

- No production deploy.
- No merge into `main`.
- No CAL tasks.
- No price changes.
- No payment or entitlement refactors.
- No secret rotation, secret removal, or secret disclosure.
- Do not send live notifications from automation.

## Verification

- Read current notification-related file map entries and reports.
- Run existing notification smoke if applicable, for example `npm run smoke:back055` or notification contract smoke if configured.
- `node scripts/check-cp1251-mojibake.mjs`
- `git diff --check`

## Report

Write `pm/outbox/REPORT-BRIEF-2026-08-02-122-notifications-functional-audit.md` with current capability map, gaps, and next safe briefs.
