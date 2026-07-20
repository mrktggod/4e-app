status: DONE

# REPORT-BRIEF-2026-07-19-18-smart007-evidence-upgrade

## Result

Created a dedicated safe fixture plan for SMART-007 and updated the evidence audit with exact source references. SMART-007 remains `SOURCE-ONLY`; no live run was performed in this brief.

## Changed Files

- `docs/tasks/SMART-007-memory-evidence-fixture-plan.md` - new safe fixture plan.
- `docs/tasks/EVIDENCE-AUDIT-2026-07-17.md` - added SMART-007 source evidence and fixture-plan supplement.
- `pm/inbox/BRIEF-2026-07-19-18-smart007-evidence-upgrade.md` - marked DONE.
- `pm/outbox/REPORT-BRIEF-2026-07-19-18-smart007-evidence-upgrade.md` - this report.

## Confirmed Source References

- Worker migration `migrations/0008_user_facts.sql` creates `user_facts` and `idx_user_facts_user_rank`.
- Worker `worker.js:3652-3655` triggers fact extraction after assistant messages are saved.
- Worker `worker.js:3666-3680` reads AI memory/processing privacy settings.
- Worker `worker.js:3697-3708` lists ranked facts from `user_facts`.
- Worker `worker.js:3768-3808` upserts and trims facts.
- Worker `worker.js:3812-3851` calls Haiku for durable fact extraction.
- Worker `worker.js:3855-3886` implements `GET /ai/facts`, `DELETE /ai/facts/:id`, and `DELETE /ai/facts`.
- Worker `worker.js:4924-4928` wires `/ai/facts` routes.
- `index.html:1129-1140` defines the "Что 4 знает обо мне" UI.
- `index.html:2129-2270` fetches/renders/deletes/clears facts.
- `index.html:6536-6542` injects fact summary into the AI system prompt.

## Fixture Plan

New plan path: `docs/tasks/SMART-007-memory-evidence-fixture-plan.md`

It defines:

- fresh staging-only test account format;
- three safe synthetic facts;
- API/UI verification steps;
- deletion and clear-all checks for 152-FZ-style user control;
- stop points against production, real user data, Yuri's account, and opportunistic promotion to LIVE.

## Verification

```text
node scripts/check-cp1251-mojibake.mjs
CP1251 mojibake check passed: 0 suspicious tokens

git diff --check
```

## Honest Tails

- No live SMART-007 smoke was run.
- No D1 data was queried or mutated.
- No product code changed.
- No production deploy.
- No merge into `main`.
- No CAL, price, secret, payment, or entitlement work.
