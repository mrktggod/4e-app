# INFRA-006 — X drive migration handoff

Дата: 2026-07-16

Цель: перенести локальные папки проекта с `<old-project-root>` на новый раздел `<project-root>` и сделать `<project-root>` текущей каноничной локальной рабочей зоной без удаления старой копии на `C:`.

## 1. Что сделано

| Item | Result |
| --- | --- |
| Source | `<old-project-root>` |
| Destination | `<project-root>` |
| Method | Safe file copy via `robocopy /E /XJ`, without deleting source |
| Copied dirs | 2331 |
| Copied files | 17998 |
| Copy failures | 0 |
| Old `C:` copy | Kept as rollback/archive copy |

## 2. New canonical local paths

| Surface | New canonical path |
| --- | --- |
| App / Pages UI | `<app-repo-root>` |
| Worker/API | `<worker-repo-root>` |
| Worker P0 archive/copy | `<worker-p0-archive>` |
| Project root/archive zone | `<project-root>` |

## 3. Known carried-over dirty state

| Repo / folder | State |
| --- | --- |
| App | `.pages-dist/privacy.html` remains a known dirty build artifact and was copied as-is |
| Worker | `kv-backups/` remains untracked and was copied as-is |

## 4. Rules after migration

| Rule | Decision |
| --- | --- |
| New app work | Use `<app-repo-root>` |
| New worker work | Use `<worker-repo-root>`, after confirming branch/scope |
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