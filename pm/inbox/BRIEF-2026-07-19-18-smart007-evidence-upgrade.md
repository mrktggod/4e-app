status: DONE

Done report: `pm/outbox/REPORT-BRIEF-2026-07-19-18-smart007-evidence-upgrade.md`

# BRIEF-2026-07-19-18-smart007-evidence-upgrade

## Context

EVIDENCE-AUDIT-2026-07-17: SMART-007 (память фактов между сессиями, AI-память v1) — Done, но SOURCE-ONLY: «AI memory/facts needs a dedicated safe fixture and acceptance criteria; not promoted opportunistically». Whitelist evidence-upgrade задача, но аудит явно предупреждает не промоутить в LIVE без выделенного safe fixture — эта задача именно про подготовку такого fixture-плана, не про сам live-прогон.

## Task

1. Найти в коде фактический механизм: фоновое извлечение фактов (Haiku) → D1 `user_facts`, экран «Что 4 знает обо мне» с удалением. Подтвердить file:line в worker и index.html/скриптах.
2. Составить short "dedicated safe fixture" план в новом файле `docs/tasks/SMART-007-memory-evidence-fixture-plan.md`: какой тестовый аккаунт, какие 2-3 факта безопасно завести, как проверить появление в `user_facts` и на экране, как проверить удаление (152-ФЗ) без live-прогона в этом брифе.
3. НЕ выполнять сам live-прогон (это NEEDS-REAL/следующий шаг) — только код-верификация + готовый план, чтобы следующий безопасный прогон делался по чёткому чеклисту, а не с нуля.
4. Обновить строку SMART-007 в `docs/tasks/EVIDENCE-AUDIT-2026-07-17.md`: оставить SOURCE-ONLY, добавить ссылку на новый fixture-план.

## Stop Points

- Только чтение кода + 2 docs-файла (новый fixture-план + правка EVIDENCE-AUDIT). Продуктовый код и D1-данные не трогать.
- No live smoke в этом брифе (нет доступа к safe fixture-аккаунту) — только план.
- No production deploy. No merge into `main`. No CAL. No price changes. No payment/entitlement refactors. No secrets.

## Verification

- Цитаты file:line подтверждены на текущем HEAD.
- `node scripts/check-cp1251-mojibake.mjs` → 0.

## Report

`pm/outbox/REPORT-BRIEF-2026-07-19-18-smart007-evidence-upgrade.md`: найденные file:line, путь к новому fixture-плану, commit SHA.
