status: DONE

# BRIEF-2026-08-01-118-home-show-all-visible

## Source

Nightly QA triage from `npm run qa:prebeta` on 2026-08-01.

## Problem

`smoke:home001` reported that the home screen did not expose the show-all action when active tasks exceeded the visible priority rows. The same failure appeared in light theme.

## Scope

- Safe UI/QA fix only.
- No production deploy.
- No merge to `main`.
- No CAL, prices, secrets, payment, or entitlement changes.

## Result

DONE. The show-all button is no longer hidden by QA rollout CSS and the visibility check counts current `.home-ai-row` dashboard rows.
