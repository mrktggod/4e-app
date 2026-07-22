status: NEW

# BRIEF-2026-07-22-34-chat-history-over-40-evidence

## Context

Это первый ограниченный безопасный резерв горизонта 0.5 после очереди текущих P1. `BUG-2026-07-21-005` не воспроизвёлся на короткой AI-истории, но source-аудит показывает лимит 40 сообщений в AI-чате и task chat.

## Task

1. На свежих синтетических данных определить поведение AI-chat и task chat при 45-60 сообщениях без использования личной истории Алексея/Юрия.
2. Предпочесть детерминированный fixture/mock и не делать десятки платных AI-вызовов.
3. Зафиксировать, это ожидаемое окно последних 40 сообщений, реальная потеря хранения или отсутствие пагинации/кнопки старой истории.
4. Добавить узкий regression test/evidence. Runtime fix делать только если причина локальная, очевидная и не меняет retention/data model/API contract.
5. Если нужен Worker/API, изменение политики хранения или продуктовый выбор, поставить `status: NEED-CLAUDE` и дать точный план без runtime-правок.

## Acceptance

- Есть воспроизводимое доказательство для истории длиннее 40 сообщений хотя бы на одной поверхности.
- В отчёте разделены хранение данных, загрузка API и отображение UI.
- Не используются реальные пользовательские данные и платные массовые AI-запросы.

## Stop Points

- Run only after briefs `30-33` are completed or honestly classified.
- No production deploy or merge into `main`.
- No personal account/history access.
- No payment, entitlement, auth-security, CAL, secrets or data-retention policy changes.

## Verification

- `node scripts/check-cp1251-mojibake.mjs`
- Deterministic fixture/test output with 45-60 uniquely numbered messages.
- `git diff --check`

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-22-34-chat-history-over-40-evidence.md` with root cause by storage/API/UI layer, changed files, commit SHA if any, raw proof, and next decision if pagination is needed.
