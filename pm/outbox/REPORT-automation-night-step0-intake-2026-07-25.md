# REPORT - night runner step 0 inbox intake - 2026-07-25

## Outcome

DONE for automation prompt update.

Updated only the first night automation:

- `4e-night-inbox-and-whitelist-backlog-runner`

## Change

Added a new first block before the existing disk guard and before normal inbox processing:

- Step 0 must go to the X-drive app publish workspace.
- It must fetch, checkout `feat/admin-tariff-api`, pull fast-forward only, show `pm/` status, then add/commit/push `pm/`.
- If `pm/` has no changes, the runner must continue normally.
- Reason recorded in the prompt: Cowork writes briefs as files and has no git rights, so uncommitted briefs were invisible to cloud runners.
- After Step 0 the runner reads `pm/inbox` as usual.

The existing disk guard remains in the prompt after Step 0.

## Verification

Read back the local Codex automation config after update.

Raw verification from the prompt start:

- first Unicode codepoints: `1064,1040,1043,32,48,32`
- this is `ШАГ 0 `
- `ДИСК:` remains later in the prompt

## Tail

No code files changed. The automation still points at the currently registered Codex project; the prompt itself now instructs the runner to use the X-drive app publish workspace for the Cowork inbox intake step.
