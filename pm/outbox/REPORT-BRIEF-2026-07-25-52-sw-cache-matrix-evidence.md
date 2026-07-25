status: DONE

# REPORT-BRIEF-2026-07-25-52 — service worker cache matrix

## Итог

Задача выполнена как evidence-only. Код не менялся.

## Что проверено

Среда: `https://4-ai-staging.pages.dev/`.

Сценарии:

- first load;
- second load;
- update check через `registration.update()`;
- offline reload/navigation;
- cleared storage через новый browser context.

## Доказательства

- Документ: `docs/tasks/SW-CACHE-MATRIX-2026-07-25.md`
- Метрики: `docs/tasks/assets/sw-cache-matrix-2026-07-25/SW-CACHE-MATRIX-2026-07-25-metrics.json`

## Главная находка

Staging отдаёт `sw.js` старого формата:

```text
live sw.js: 4-pwa-shell-v1, sha e1590cdcbfa0, 2041 bytes
local sw.js: PWA_VERSION prod-redesign-2026-07-21, sha 7a8dd1d505ad, 2977 bytes
```

Из-за этого нельзя честно считать update-сценарий проверкой текущего `PWA_VERSION`: live staging его не содержит.

## Matrix summary

```text
first load: controller false, cache 4-pwa-shell-v1
second load: controller true, cache 4-pwa-shell-v1
update check: waiting false, installing false
offline: status 200, title 4
cleared storage: controller false, cache 4-pwa-shell-v1
```

## Residual

Нужен отдельный future brief `SW-STAGING-PARITY`: синхронизировать staging `sw.js` с текущей веткой и затем повторить проверку “новый деплой поверх старого”.

UX на `waiting worker/controllerchange` не добавлялся, потому матрица не показала реального waiting-worker состояния.

## Верификация

```text
node scripts/check-cp1251-mojibake.mjs
git diff --check
```

Фактический вывод:

```text
CP1251 mojibake check passed: 0 suspicious tokens
git diff --check: без вывода
```
