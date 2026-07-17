# INFRA-006 — worker line-ending incident

Дата: 2026-07-17

Цель: зафиксировать CRLF-инцидент в `4e-worker`, чтобы не держать детали в чате и не повторить ошибку в других локальных копиях.

## 1. Summary

| Field | Value |
| --- | --- |
| Affected repo | `X:\4\4e-worker` |
| Branch | `feat/admin-tariff-api` |
| Symptom | Massive CRLF-only diff after `git checkout -- .` attempts |
| Root cause | `core.autocrlf=true` + no repo-level `.gitattributes` |
| Fix commit | `6fd5a268532e3098fd9cc38e28c45d2b01274b7c` |
| External check | https://github.com/mrktggod/4e-worker/commit/6fd5a268532e3098fd9cc38e28c45d2b01274b7c |
| Final tracked diff | Clean after fix; only `kv-backups/` remains untracked |

## 2. What happened

Repeated attempts to use `git checkout -- .` as a quick rollback were unsafe in this repository because Git for Windows had `core.autocrlf=true`. Without `.gitattributes`, checkout could rewrite tracked text files into CRLF and create huge 1:1 insertion/deletion diffs.

This made a normal rollback command look successful while still leaving, or even expanding, line-ending noise.

## 3. Fix applied

| Step | Result |
| --- | --- |
| Set local repo config | `git config core.autocrlf false` in `X:\4\4e-worker` |
| Add repo policy | `.gitattributes` with `* text=auto eol=lf` |
| Renormalize check | `git add --renormalize .` staged only `.gitattributes` at the time of fix |
| Commit | `6fd5a268532e3098fd9cc38e28c45d2b01274b7c` |
| Push evidence | Git push reported `f9e840a..6fd5a26 feat/admin-tariff-api -> feat/admin-tariff-api` |

## 4. Current local risk audit

| Repo | `core.autocrlf` | `.gitattributes` | Current note |
| --- | --- | --- | --- |
| `X:\4\4e-worker` | `false` | yes | Fixed; only `kv-backups/` untracked |
| `X:\4\.tmp-4e-app-publish` | `true` | no | Same risk exists; only `.pages-dist/privacy.html` dirty at audit time |
| `X:\4\4e-worker-p0` | `true` | no | Same risk exists; untracked smoke scripts present |

## 5. Follow-up recommendation

| Priority | Action |
| --- | --- |
| P1 | Add `.gitattributes` and set `core.autocrlf=false` in app repo before any broad checkout/renormalize/pull operations |
| P1 | Decide whether `4e-worker-p0` remains an active repo or archive; if active, apply same line-ending policy |
| P2 | Avoid `git checkout -- .` as a first response to unexplained diffs on Windows until line-ending policy is known |
| P2 | Include real `git status --short` and `git diff --stat` output in incident reports |

## 6. What not to do

| Do not | Reason |
| --- | --- |
| Do not run git from `X:\4` root | Root `.git` was disabled; workspace root is not a repo |
| Do not delete `kv-backups/` automatically | It is an untracked worker artifact and needs separate decision |
| Do not normalize all repos in one mixed commit | Keep line-ending policy changes per repo and easy to review |
| Do not treat cached remote refs as fresh fetch proof | Worker fetch may fail due to credentials; use push output or GitHub commit URL |