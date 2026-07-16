# INFRA-006 — X drive migration handoff

Дата: 2026-07-16

Цель: перенести локальные папки проекта с `C:\Users\shelc\Documents\4` на новый раздел `X:\4` и сделать `X:\4` текущей каноничной локальной рабочей зоной без удаления старой копии на `C:`.

## 1. Что сделано

| Item | Result |
| --- | --- |
| Source | `C:\Users\shelc\Documents\4` |
| Destination | `X:\4` |
| Method | Safe file copy via `robocopy /E /XJ`, without deleting source |
| Copied dirs | 2331 |
| Copied files | 17998 |
| Copy failures | 0 |
| Old `C:` copy | Kept as rollback/archive copy |

## 2. New canonical local paths

| Surface | New canonical path |
| --- | --- |
| App / Pages UI | `X:\4\.tmp-4e-app-publish` |
| Worker/API | `X:\4\4e-worker` |
| Worker P0 archive/copy | `X:\4\4e-worker-p0` |
| Project root/archive zone | `X:\4` |

## 3. Known carried-over dirty state

| Repo / folder | State |
| --- | --- |
| App | `.pages-dist/privacy.html` remains a known dirty build artifact and was copied as-is |
| Worker | `kv-backups/` remains untracked and was copied as-is |

## 4. Rules after migration

| Rule | Decision |
| --- | --- |
| New app work | Use `X:\4\.tmp-4e-app-publish` |
| New worker work | Use `X:\4\4e-worker`, after confirming branch/scope |
| Old `C:` folders | Do not edit unless explicitly doing rollback/recovery |
| Cleanup/delete old copy | Manual decision later, not part of this migration |
| Commit/push | From `X:` copy going forward |

## 5. Not done intentionally

| Not done | Reason |
| --- | --- |
| Delete old `C:` copy | Avoid data loss until morning confirmation |
| Rewrite historical logs | Old paths in old logs are historical facts |
| Runtime deploy/smoke | Migration documentation only |
| Secret export/import | Cloudflare secrets stay in Cloudflare; local secret files are not documented by value |