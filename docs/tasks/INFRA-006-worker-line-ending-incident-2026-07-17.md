# INFRA-006 — worker line-ending and duplicate-clone incident

Date: 2026-07-17

Purpose: record the CRLF incident and the local worker-copy decision so the team does not repeat the same workspace split.

## Summary

| Field | Value |
| --- | --- |
| Affected repo | `X:\4\4e-worker` |
| Branch | `feat/admin-tariff-api` |
| Symptom | Massive CRLF-only diffs after rollback/checkout attempts |
| Root cause | Windows Git `core.autocrlf=true` + missing repo-level `.gitattributes` |
| Worker fix commit | `6fd5a268532e3098fd9cc38e28c45d2b01274b7c` |
| App fix commit | `f29af90ad8c8457a8e6f36b648b324b7b622871f` |
| Canonical app repo | `X:\4\.tmp-4e-app-publish` |
| Canonical worker repo | `X:\4\4e-worker` |
| Archived duplicate | `X:\4\4e-worker-p0_archived-2026-07-17` |

## What happened

Repeated attempts to use `git checkout -- .` as a quick rollback were unsafe while local Git could rewrite tracked files to CRLF. The rollback looked successful in text reports but the working tree still showed huge 1:1 insertion/deletion diffs.

The same risk existed in multiple local copies. Later audit confirmed that `X:\4\4e-worker-p0` was not a separate project: it was a duplicate clone of the same remote as `X:\4\4e-worker`.

## Fixes applied

| Repo | Decision / fix |
| --- | --- |
| `X:\4\4e-worker` | `core.autocrlf=false`, `.gitattributes` with LF policy, committed as `6fd5a26` |
| `X:\4\.tmp-4e-app-publish` | `core.autocrlf=false`, `.gitattributes` with LF policy, committed as `f29af90` |
| `X:\4\4e-worker-p0` | confirmed duplicate clone, then archived as `X:\4\4e-worker-p0_archived-2026-07-17` |

## Canonical path decision

`worker-p0 is duplicate clone; canonical worker repo is X:\4\4e-worker`.

The archived duplicate contains `DO_NOT_WORK_HERE.txt`. Do not run git, edit, deploy, or smoke from that archived folder unless doing explicit recovery.

## Current local risk audit

| Path | Status | Note |
| --- | --- | --- |
| `X:\4\.tmp-4e-app-publish` | canonical app repo | clean after app LF normalization |
| `X:\4\4e-worker` | canonical worker repo | clean except allowed untracked `kv-backups/` |
| `X:\4\4e-worker-p0_archived-2026-07-17` | archived duplicate | read-only recovery copy, not active worktree |
| `X:\4` root | not a repo | old accidental root `.git` disabled earlier |

## What not to do

| Do not | Reason |
| --- | --- |
| Do not run git from `X:\4` root | Root is a workspace container, not a repo |
| Do not work in `4e-worker-p0_archived-2026-07-17` | It is a duplicate archived copy |
| Do not use broad checkout/reset as first reaction to Windows diffs | Check line-ending policy first |
| Do not delete `kv-backups/` automatically | It is an untracked worker artifact needing a separate decision |
