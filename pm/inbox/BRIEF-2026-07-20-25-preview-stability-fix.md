status: NEW

# BRIEF-2026-07-20-25-preview-stability-fix

## Context
GPT-QA 2026-07-20 (отчёт): preview-режим нестабилен — это блокер для всего визуального QA (GPT и Codex-self). Приоритет ВЫСОКИЙ (чинить одним из первых): без стабильного preview тестировать нечем. Связано с брифом 23 (preview-флаги) — один preview-слой.

## Предохранитель
Если правки в `index.html`/scripts затрагивают НЕзакоммиченный redesign Юрия (`git status`) — не трогай, NEED-CLAUDE.

## Task (preview routing, demo-режим, НЕ реальный auth)
1. 🔴 `?previewDemo=dashboard&previewScreen=task-detail` открывает login вместо task-detail. Тоже для `previewScreen=chat-conv`. Найди root cause (file:line): почему прямая ссылка с previewScreen не рендерит целевой экран, а падает в login. Почини так, чтобы КАЖДАЯ demo-ссылка открывала нужный экран в свежей вкладке без опоры на предыдущую навигацию.
2. 🟠 previewDemo routing flaky между вкладками/после внутренней навигации (иногда сбрасывает в login при активном previewDemo). Сделай preview-состояние устойчивым: пока `previewDemo` активен, внутренняя навигация из dashboard/profile/chats НЕ сбрасывает в login.
3. Это demo/preview-слой — НЕ трогать реальную auth-логику/сессии/пароли. Только маршрутизацию preview.

## Stop Points
- ❌ Реальный auth/сессии/пароли/entitlement/платёжка — НЕ трогать (это только preview routing).
- ❌ prod, merge в main, CAL, цены, секреты.
- ❌ Незакоммиченный redesign (см. Предохранитель).

## Verification
- Каждая из 6 demo-ссылок (dashboard/task-detail/profile/subscription/chats/chat-conv) открывает нужный экран в СВЕЖЕЙ вкладке (staging-проверка, RAW/скрин-описание).
- previewDemo не сбрасывается в login при внутренней навигации.
- `check-cp1251-mojibake` = 0.

## Report
`pm/outbox/REPORT-BRIEF-2026-07-20-25-preview-stability-fix.md`: root cause file:line, что изменено, staging-proof по каждой ссылке, SHA.
