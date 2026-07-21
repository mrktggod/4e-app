status: DONE

# BRIEF-2026-07-20-22-arch001-continue-split

## Context
Юрий 2026-07-20 разблокировал ARCH-001 для автономной ночи — продолжить поэтапный распил `index.html` (inline JS) в `scripts/platform-adapter.js` / отдельные модули, малыми шагами, снижая inline-долг. Работать ОСТОРОЖНО — регресс-риск средний.

## Предохранитель
Проверь `git status`: если `index.html` содержит НЕзакоммиченный redesign Юрия — НЕ трогай его, пометь `NEED-CLAUDE`. Распил делать только по чистому дереву.

## Task
1. Выбери 1-2 группы helpers (auth/UI/utility) во inline-`<script>` `index.html`, которые безопасно вынести в `scripts/platform-adapter.js` или новый модуль без изменения поведения.
2. Малые шаги: один вынос = один коммит. После каждого — проверь, что поведение не изменилось.
3. Крупный/рискованный вынос (много зависимостей, глобальные) — НЕ делай автономно, опиши план и пометь `NEED-CLAUDE`.

## Stop Points
- ❌ Не трогать незакоммиченный redesign (см. Предохранитель).
- ❌ prod, merge в main, CAL, цены, секреты, платёжка/entitlement.
- ❌ Не менять поведение — только перенос кода.

## Verification
- `node scripts/check-js-syntax.mjs` exit 0; UI-guard inline event handlers/script НЕ вырос (в идеале снизился).
- `node scripts/check-cp1251-mojibake.mjs` = 0; ключевые сценарии не сломаны (headless smoke).

## Report
`pm/outbox/REPORT-BRIEF-2026-07-20-22-arch001-continue-split.md`: что вынесено file:line→file, SHA, что оставлено NEED-CLAUDE и почему.
