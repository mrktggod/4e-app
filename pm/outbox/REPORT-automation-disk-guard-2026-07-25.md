# REPORT - automation disk guard - 2026-07-25

## Outcome

DONE for prompt guard update.

Updated the prompt prefix for these active Codex cron automations:

- `4e-night-inbox-and-whitelist-backlog-runner`
- `4e-pre-dawn-inbox-and-whitelist-backlog-runner`
- `4e-morning-inbox-and-safe-backlog-runner`

## Added Rule

Each prompt now starts with the disk guard requested by Alexey:

```text
ДИСК: работать только в X:\4. Файлы проекта не создавать и не читать на диске C:.
Абсолютные пути "C:\" в коде и конфигах запрещены — инструменты (wrangler, node, npm)
вызывать через PATH. Исключение: данные самих приложений (Claude, Codex, npm)
в AppData внутри профиля пользователя — это не файлы проекта, их не трогаем.
Если рабочая папка оказалась не в X:\4 — ОСТАНОВИТЬСЯ, написать об этом в REPORT
и не продолжать работу. Если для задачи объективно нужен путь на C: — это NEED-YURI,
самостоятельно не обходить.
```

## Verification

Read back local Codex automation configs after update. All three prompts now start with `ДИСК: работать только в X:\4`.

## Remaining Tail

Codex currently lists the registered `4` project on the old C-drive workspace, while `X:\4` exists on disk but is not listed as a Codex project. Because of the new prompt rule, these automations should stop and report instead of working from the wrong project until the automation target is moved to a registered `X:\4` project.
