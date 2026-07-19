status: DONE

# BRIEF-2026-07-18-price-align-security-perf

## Context

Остаток длинной сессии `codex-2026-07-18-long-session-price-align-security-recheck-perf.md` в формате inbox-протокола. Ветка app/worker: `feat/admin-tariff-api`. Staging only. Перед работой: git fetch + pull ветки в обоих репо.

## Task

1. **(P1, Юрий подтвердил 2026-07-18) Source-default цены года 9504 → 9950.** Ровно места из `docs/tasks/PRICE-MAP-2026-07-17.md`: worker.js:92/93/2768, index.html:993/2620/2621 (номера могли сдвинуться — сверяй по PRICE-MAP и grep). Год rub и stars → 9950, тексты с суммой тоже. Месяц (990) и admin-config/KV не трогать. Verify: по коду default=9950; staging `/tariff-config` по-прежнему 9950.
2. **(P1, security rigor) Live re-test unsigned `update-task` / `set-reminder`.** Из BACK-060: они НЕ в signed-set, «review separately», live-эксплойтом не перепроверены. Staging, свежий аккаунт, вызов bot-path без `x-bot-signature` с чужим `telegramUserId`. Если 200 и данные меняются — НОВЫЙ P1 в `pm/bugs.md` с RAW; узкий фикс только если root cause тот же класс, что BACK-060 (bot-signature gate), entitlement не трогать. Если 401/403 — RAW-пруф и закрыть sibling-риск в BACK-060.
3. **(P2, perf) `tasks.create` ~12с / `tasks.list` ~10с на staging.** Профилируй стадии (auth, D1, KV). Root cause с доказательством. Дешёвый узкий фикс — только если не меняет гарантий; иначе зафиксируй и предложи вариант, решение за Юрием.
4. **(P2, если останется время) Evidence-upgrade** SOURCE-ONLY пунктов из `docs/tasks/EVIDENCE-AUDIT-2026-07-17.md` безопасными staging-тестами; не выдумывать.

## Stop Points

- No production deploy.
- No merge into `main`.
- No CAL tasks.
- No price changes КРОМЕ явно разрешённой Задачи 1 (9504→9950 по PRICE-MAP).
- No payment or entitlement refactors (узкий bot-signature фикс по аналогии с BACK-060 — можно).
- No secret rotation, secret removal, or secret disclosure.

## Verification

- `node scripts/check-cp1251-mojibake.mjs` = 0 перед каждым app-коммитом.
- Staging RAW-proof по каждой задаче; для security — вывод самого эксплойта до/после.
- Свежие тестовые аккаунты, данные Юрия не задевать.

## Report

`pm/outbox/REPORT-BRIEF-2026-07-18-price-align-security-perf.md`: root cause файл:строка, что изменено, SHA app+worker, RAW-пруфы, честные хвосты NEEDS-REAL.
