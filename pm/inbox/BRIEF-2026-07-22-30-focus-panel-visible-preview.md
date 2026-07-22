status: NEW

# BRIEF-2026-07-22-30-focus-panel-visible-preview

## Context

Алексей 2026-07-22 вручную проверил «Фокус дня» и не увидел изменений. В рабочей копии уже есть незакоммиченные изменения `index.html`, `styles/screens/home.less`, собранного CSS и `FILE_MAP_UI.md` из другой сессии. Их нельзя перезаписывать или присваивать себе.

## Task

1. В начале проверить ветку, `git status` и diff файлов фокуса.
2. Если изменения всё ещё незакоммичены, поставить `status: BLOCKED-CONCURRENT-WORK`, перечислить файлы в отчёте и перейти к следующему брифу. Не делать stash/reset/commit чужих изменений.
3. Если реализация уже находится в чистом commit ветки, собрать CSS и поднять только изолированный Pages preview.
4. На viewport 390x844 проверить, что нажатие «Фокус дня» открывает панель и в ней видны дневные метрики, кнопки шаринга и список задач.
5. Если код в preview есть, но блок не отображается, сделать только узкий runtime/layout fix этой панели.

## Acceptance

- Пользователь видит изменение после одного нажатия на «Фокус дня».
- Панель не обрезана и не перекрывает свои действия на 390x844.
- В отчёте есть точный commit и изолированная preview-ссылка либо честный `BLOCKED-CONCURRENT-WORK`.

## Stop Points

- No production deploy.
- No merge into `main`.
- No shared staging alias update.
- No overwrite, stash, reset or commit of pre-existing uncommitted changes.
- No CAL tasks, price changes, payment/entitlement work or secrets.

## Verification

- `node scripts/check-cp1251-mojibake.mjs`
- `npm run build:css`
- `npm run smoke:home001`
- `git diff --check`
- 390x844 DOM/screenshot evidence from the isolated preview.

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-22-30-focus-panel-visible-preview.md` with root cause, changed files, commit SHA, preview URL/raw proof, and honest tails.
