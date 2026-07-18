# PM Outbox Protocol

Executors write completion reports here as `REPORT-<brief-name>.md`.

Each report must include:

- Root cause as `file:line`, or `N/A` for pure process/docs tasks.
- What changed.
- App commit SHA and worker commit SHA when applicable.
- Raw staging proof, copied exactly from the command or manual check.
- Honest tails marked `NEEDS-REAL` when verification needs real users, live staging, secrets, payments, or another human-controlled resource.

Never include secrets. Use `<redacted>`.
