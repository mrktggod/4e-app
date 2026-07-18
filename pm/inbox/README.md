# PM Inbox Protocol

Cowork puts executable briefs here as `BRIEF-YYYY-MM-DD-slug.md`.

Each brief must start with one status line:

```markdown
status: NEW
```

Executor flow:

1. Change `status: NEW` to `status: IN_PROGRESS` before work starts.
2. Do the narrow task described in the brief.
3. Change status to `DONE` after verification, or `BLOCKED-<reason>` when the brief conflicts with `AGENTS.md` or needs a human decision.
4. Write the matching report in `pm/outbox/REPORT-<brief-name>.md`.

Do not use this folder for secrets, production credentials, or private account data.
