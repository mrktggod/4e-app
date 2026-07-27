status: DONE

# BRIEF-2026-07-27-83-misha-product-list-dedupe

## Context

`pm/inbox/MISHA_BUGS.md` (8 items) and `pm/inbox/PRODUCT_IDEAS_TASKS.md` (10 items) landed 2026-07-26. Claude/Cowork already confirmed `MISHA_BUGS.md` BUG-001/BUG-002 duplicate `BUG-2026-07-25-017`/`018` (already fixed, Ready for QA). The rest of the two lists have not been cross-checked against `pm/bugs.md`/`pm/backlog.md` yet.

## Task

Walk every remaining item in both files. For each: check whether it matches an existing entry in `pm/bugs.md`/`pm/backlog.md` (private repo). If duplicate, note it as such (do not re-implement). If genuinely new, add it with a proper ID to `pm/bugs.md` or `pm/backlog.md` as appropriate — do not fix anything in this brief, this is a bookkeeping pass only.

## Stop Points

- No code changes in this brief — only editing `pm/bugs.md`/`pm/backlog.md` entries.
- No merge/deploy.

## Verification

- Every item from both source files has a clear disposition: duplicate-of-X, or new-ID-assigned.

## Report

`pm/outbox/REPORT-2026-07-27-83-misha-product-list-dedupe.md` — table of item → disposition.
