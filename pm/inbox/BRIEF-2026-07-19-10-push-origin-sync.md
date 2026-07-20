status: NEW

# BRIEF-2026-07-19-10-push-origin-sync

## Context

Утренний аудит 2026-07-19 нашёл блокер: ночные коммиты (`c511bf9`, `90c8c1d`, `22db397b` и последующие) существуют локально в `X:\4\.tmp-4e-app-publish` на `feat/admin-tariff-api`, но НЕ запушены — `origin/feat/admin-tariff-api` остался на `b8ec76d`. Без пуша невозможна `.patch`-верификация, работа уязвима к потере, merge осложнён.

## Task

1. `git fetch origin` в app-репо (`X:\4\.tmp-4e-app-publish`) и в worker-репо (`X:\4\4e-worker`).
2. Сравнить локальный HEAD `feat/admin-tariff-api` с `origin/feat/admin-tariff-api` в обоих репо.
3. Если локаль впереди — `git push origin feat/admin-tariff-api` (только эта ветка, НЕ main).
4. Проверить, что origin обновился: SHA локального HEAD == SHA origin после push; коммит виден на GitHub (`github.com/.../commit/<sha>`).
5. Если push отклонён (нет прав / non-fast-forward) — НЕ делать force-push, зафиксировать точную ошибку в отчёте как NEED-YURI.

## Stop Points

- No production deploy. No merge into `main`. No force-push. No CAL. No price changes. No payment/entitlement refactors. No secrets.

## Verification

- `git rev-parse HEAD` == `git rev-parse origin/feat/admin-tariff-api` после push (оба репо).
- `node scripts/check-cp1251-mojibake.mjs` → 0 (ничего в файлах не меняется, но по протоколу).

## Report

`pm/outbox/REPORT-BRIEF-2026-07-19-10-push-origin-sync.md`: SHA до/после для app и worker, вывод git push, ссылка на commit на GitHub, honest tails.
