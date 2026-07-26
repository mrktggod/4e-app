# REPORT-2026-07-26-79-night-session-misha-product-triage-and-release-prep

Status: NEED-CLAUDE

## What Happened

I did not implement this brief as one automation task.

Reason: the brief bundles release readiness, product triage, backlog editing, multiple UI/runtime fixes, plan documents, and a wider navigation regression into one item. That conflicts with the automation rule: one task equals one focused commit and one report.

It also includes areas that need careful review before code starts:

- release go/no-go for Yuri;
- dedupe against private `pm/bugs.md` and `pm/backlog.md`;
- multiple iPhone/TMA visual bugs that need real-device or fresh-preview proof;
- notification/navigation/completion-state changes across several screens;
- product ideas that explicitly require plans only or Yuri answers.

## Safe Next Step

Claude/Cowork should split this into smaller briefs before implementation. Suggested split:

1. Release readiness summary only, using private backlog/bugs.
2. Misha/Product list dedupe only, updating private bugs/backlog.
3. One small UI fix per bug: reminder bell, time picker, popover overflow, sticky toast, today row overflow.
4. Profile banner removal as its own brief.
5. AI task advice auto-generation removal as its own brief.
6. Dashboard one-task limit diagnostic as its own brief with raw count evidence.
7. Bottom nav stale-cache verification as a diagnostic before any code.
8. Completion feedback shared-root-cause investigation as a diagnostic before any code.
9. Plan-only briefs for support bot, haptics pilot, notification audit, and AI title/description quality.

## What Yuri Needs To Know

The report should not be treated as work refusal. It is a scope safety stop: the items are actionable, but they need to be split so each one can be verified and reverted independently.

## Verification

- Source brief reviewed.
- No code was changed.
- `node scripts/check-cp1251-mojibake.mjs` passed: `CP1251 mojibake check passed: 0 suspicious tokens`.
- `git diff --check` passed.
