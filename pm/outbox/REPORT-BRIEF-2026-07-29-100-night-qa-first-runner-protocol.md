# REPORT-BRIEF-2026-07-29-100-night-qa-first-runner-protocol

Status: DONE

## What changed

Updated `AGENTS.md` only. The autonomous night runner order now explicitly says:

1. process `pm/inbox/BRIEF-*.md`;
2. run mandatory nightly QA before private backlog or roadmap whitelist fixes;
3. triage red QA into atomic briefs;
4. fix QA briefs one by one with review-agent evidence;
5. re-run failed QA plus `node scripts/check-cp1251-mojibake.mjs`;
6. only then proceed to ordinary private backlog or roadmap whitelist work.

Runtime app code was not changed.

## Exact protocol wording

The new `AGENTS.md` section says, in part:

```markdown
Before any private backlog or roadmap whitelist fixes, run the mandatory nightly QA suite for Web, Telegram, VK, and load-safe checks that are available locally. Record the raw commands and results in a QA report.
```

It also says red QA must be split into atomic briefs, fixed one at a time, checked by a separate review agent, and re-run before whitelist work starts.

## Stop points preserved

The existing permanent stop points remain unchanged:

- no production deploy;
- no merge into `main`;
- no CAL tasks;
- no price changes;
- no payment or entitlement refactors;
- no secret rotation, removal, or disclosure.

## Raw proof

Commands run:

```text
node scripts/check-cp1251-mojibake.mjs
git diff --check -- AGENTS.md pm/inbox/BRIEF-2026-07-29-100-night-qa-first-runner-protocol.md pm/outbox/REPORT-BRIEF-2026-07-29-100-night-qa-first-runner-protocol.md
rg -n "Before any private backlog|re-run the failed QA|Production deploy|CAL tasks|payment or entitlement" AGENTS.md
```

Results:

- `node scripts/check-cp1251-mojibake.mjs`: passed, exit code 0.
- `git diff --check` for the changed task files: passed, exit code 0.
- The new QA-before-backlog wording is present in `AGENTS.md`.
- The stop-point wording remains present in `AGENTS.md`.

## Remaining manual/team decisions

The protocol requires a review agent for fix-agent work. The exact human/tool assignment for that review role is still a team operations decision, but the night runner is no longer allowed to skip QA and start with backlog cleanup.
