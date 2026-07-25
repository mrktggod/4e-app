status: DONE

# SW-CACHE-MATRIX-2026-07-25 — service worker cache matrix

Дата проверки: 2026-07-25.
Среда: `https://4-ai-staging.pages.dev/`.
Тип работы: evidence only, без UX-реакций на waiting worker/controllerchange.

## Короткий вывод

Staging сейчас отдаёт service worker старого формата:

```text
live sw.js cache/version: 4-pwa-shell-v1
live sw.js bytes: 2041
live sw.js sha256: e1590cdcbfa0
```

Локально в ветке `feat/admin-tariff-api` лежит другой `sw.js`:

```text
local sw.js PWA_VERSION: prod-redesign-2026-07-21
local sw.js bytes: 2977
local sw.js sha256: 7a8dd1d505ad
```

То есть staging SW не совпадает с текущим файлом в репозитории. Поэтому полноценный сценарий “новый деплой поверх старого” нельзя честно подтвердить как `PWA_VERSION`-upgrade: live SW не использует `PWA_VERSION`, а использует cache namespace `4-pwa-shell-v1`.

## Asset snapshot на staging

```text
index.html                200  sha 8928302333c3  bytes 459855
sw.js                     200  sha e1590cdcbfa0  version/cache 4-pwa-shell-v1  bytes 2041
styles.min.css            200  sha 3f14c5319f7c  bytes 197090
scripts/auth.js           200  sha 87f18f274c5c  bytes 10982
scripts/auth-handlers.js  200  sha d576b3275068  bytes 18170
scripts/task-ui-renderers.js 200 sha 7a05fafa5d1c bytes 31781
```

`index.html` подключает:

```text
scripts/platform-adapter.js?v=dashboard-handoff-20260718-7
scripts/auth.js?v=dashboard-handoff-20260718-7
scripts/auth-handlers.js?v=dashboard-handoff-20260718-7
scripts/task-ui-renderers.js?v=dashboard-handoff-20260718-7
```

## Matrix

| Сценарий | SW controller | Cache keys | Результат |
|---|---:|---|---|
| First load | no | `4-pwa-shell-v1` | SW ставится, но первая вкладка ещё не controlled |
| Second load | yes | `4-pwa-shell-v1` | вкладка controlled, shell cache используется |
| Update check | yes | `4-pwa-shell-v1` | `registration.update()` не создал `waiting` или `installing` worker |
| Offline | yes | `4-pwa-shell-v1` | reload/navigate offline вернул `200`, title `4` |
| Cleared storage / new context | no | `4-pwa-shell-v1` | чистый контекст снова ставит cache, первая вкладка ещё не controlled |

Полные DOM/browser metrics:

```text
docs/tasks/assets/sw-cache-matrix-2026-07-25/SW-CACHE-MATRIX-2026-07-25-metrics.json
```

## Что видно в Service Workers

Для controlled-сценариев:

```text
scope: https://4-ai-staging.pages.dev/
active script: https://4-ai-staging.pages.dev/sw.js
waiting: false
installing: false
controller: true
cache: 4-pwa-shell-v1
```

Для first load и cleared storage:

```text
registration есть
active worker есть
controller: false
```

Это нормальное поведение первой загрузки: worker установлен, но текущая вкладка начинает контролироваться после следующей навигации/reload.

## Console

Повторяющиеся сообщения:

```text
[Telegram.WebApp] Changing swipes behavior is not supported in version 6.0
```

В offline-сценарии ожидаемо появляется:

```text
Failed to load resource: net::ERR_INTERNET_DISCONNECTED
```

При этом offline navigation для shell завершилась успешно: `status 200`, `title 4`.

## Риски и следующий brief

Не добавлял UX-реакцию на `waiting worker` или `controllerchange`, потому матрица не показала реального waiting-worker состояния.

Более важный следующий brief: проверить pipeline публикации staging assets. Сейчас live `sw.js` не равен локальному `sw.js`, а значит команда может думать, что проверяет `PWA_VERSION`, хотя staging отдаёт старый cache namespace `4-pwa-shell-v1`.

Рекомендация для будущей задачи:

```text
SW-STAGING-PARITY — добиться, чтобы staging отдавал тот же sw.js, что ветка feat/admin-tariff-api, и только после этого повторить update-over-old-deploy matrix.
```
