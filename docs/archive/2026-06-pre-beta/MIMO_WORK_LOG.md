# Журнал работы MiMo

MiMo используется как дополнительный junior-разработчик. Его ответы не считаются готовым решением без проверки Codex.

## Рабочая роль

Подходящие задачи:

- короткие локальные правки с однозначным ожидаемым результатом;
- классификация и структурирование небольших фрагментов;
- черновики тест-кейсов и чек-листов;
- второе мнение по одному модулю или одной функции;
- поиск очевидных пропусков после того, как Codex определил архитектуру.

Неподходящие задачи:

- самостоятельное чтение всего монолитного frontend или Worker;
- изменение архитектуры без заранее заданных границ;
- работа с secrets, production-данными и пользовательскими переписками;
- самостоятельный deploy, commit, push или миграция данных;
- одновременное редактирование файлов вместе с Codex.

## Процесс контроля

1. Codex выдаёт MiMo одну узкую задачу и ограниченный контекст.
2. В вызове указывается `--task-id MIMO-NNN`.
3. Технические метаданные автоматически записываются в `docs/MIMO_ACTIVITY.jsonl` без prompt и ответа.
4. Codex перепроверяет вывод по коду, документации и тестам.
5. В этот файл добавляется результат проверки, ошибки и корректирующее правило.
6. После каждых пяти задач выполняется краткий обзор качества и обновляются правила выдачи задач.

## Метрики обзора

- доля принятых ответов без исправлений;
- количество фактических ошибок;
- пропущенные требования;
- лишние или выдуманные изменения;
- экономия времени относительно самостоятельного выполнения;
- оптимальный размер передаваемого контекста.

## История

### MIMO-000 — Проверка подключения

- Задача: вернуть строго `OK`, затем `ADAPTER_OK` через локальный клиент.
- Контекст: только тестовая фраза, без файлов проекта.
- Результат: успешно.
- Ошибка: лимита 8 токенов не хватило для final content из-за reasoning; при 128 токенах ответ получен.
- Проверка Codex: пройдена.
- Новое правило: для коротких reasoning-запросов давать минимум 128 output tokens.

### MIMO-001 — Анализ первого D1 auth repository

- Задача: проверить ограниченный SQL-фрагмент `users/auth_identities/sessions` и предложить методы repository.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: задача остановлена защитой до API-вызова.
- Проверка Codex: передача кода проекта внешнему provider требует отдельного явного согласия пользователя.
- Ошибки и пропуски: отсутствуют; MiMo не получил workspace data.
- Принятое решение: Codex реализует repository самостоятельно.
- Новое правило: до отдельного согласия MiMo получает только синтетические примеры и общедоступные данные.

### MIMO-002 — Проверка автоматического журнала

- Задача: вернуть строго `LOG_OK` и записать технические метаданные вызова.
- Переданный контекст: синтетическая строка из 21 символа.
- Результат MiMo: `LOG_OK`.
- Проверка Codex: пройдена; запись содержит task ID, модель, размеры, finish reason и usage, но не содержит prompt или ответ.
- Ошибки и пропуски: нет.
- Принятое решение: автоматический JSONL-журнал используется для каждого будущего вызова.
- Новое правило: все рабочие вызовы обязаны иметь уникальный `MIMO-NNN`.

### MIMO-003 — D1 `/v2/tasks` не делегировался

- Задача: реализация D1 task repository/service/routes и auth ownership checks.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: задача затрагивала auth, ownership и Cloudflare Worker routing; для MiMo без отдельного согласия и без малого изолированного фрагмента риск выше пользы.
- Ошибки и пропуски: нет; решение принято до внешней передачи кода.
- Принятое решение: Codex реализовал и проверил спринт самостоятельно.
- Новое правило: MiMo подключать к таким задачам только после разбиения на безопасный синтетический фрагмент или после явного согласия на передачу конкретных файлов.

### MIMO-004 — Conversation owner resolver не делегировался

- Задача: анализ production-derived KV quarantine buckets и legacy conversation/message ownership evidence.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: задача работала с DPAPI snapshot и потенциально чувствительными legacy ids/task/message payloads; даже sanitized цель требовала локальной расшифровки и строгой privacy-проверки.
- Ошибки и пропуски: нет; решение принято до внешней передачи данных.
- Принятое решение: Codex реализовал generator/verifier локально, без передачи MiMo production-derived данных.
- Новое правило: MiMo не получает задачи, где нужно расшифровывать snapshot, анализировать raw legacy ids или строить миграционные решения по пользовательским данным.

### MIMO-005 — Legacy conversation mapping schema не делегировался

- Задача: добавить D1 migration/repository для legacy conversation mappings и применить schema к staging.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: задача затрагивала миграционную модель ownership и staging D1 schema; ошибка могла бы привести к неправильной разблокировке пользовательских задач.
- Ошибки и пропуски: нет; решение принято до внешней передачи данных.
- Принятое решение: Codex реализовал migration/repository/verifier и применил schema к staging самостоятельно.
- Новое правило: MiMo можно подключать позже только к синтетическим unit-test кейсам для mapping lifecycle, без raw legacy refs и без доступа к Cloudflare.

### MIMO-006 — Conversation mapping seed plan не делегировался

- Задача: построить encrypted seed plan из production-derived KV snapshot и resolver report.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: задача требовала локальной DPAPI-расшифровки raw legacy refs; даже без task/message text это чувствительные migration identifiers.
- Ошибки и пропуски: нет; решение принято до внешней передачи данных.
- Принятое решение: Codex реализовал generator/verifier локально.
- Новое правило: MiMo не получает raw legacy refs, full legacy ref hashes или encrypted/decrypted migration seed artifacts.

### MIMO-007 — Conversation mapping approval tooling не делегировался

- Задача: создать local/manual approval template и encrypted decision plan builder.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: tooling работает вокруг encrypted seed artifacts и может обрабатывать owner ids/conversation ids после ручного заполнения; это не подходит для внешней передачи.
- Ошибки и пропуски: нет.
- Принятое решение: Codex реализовал tooling и проверил no-op pipeline локально.
- Новое правило: MiMo можно подключать только к синтетической проверке JSON schema без реальных hashes/ids/artifacts.

### MIMO-008 — Telegram provider sync foundation не делегировался

- Задача: добавить Worker/D1 provider sync foundation для signed Telegram `register-chat`.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: задача затрагивала ownership, D1 writes и production-risk feature flag; безопаснее реализовать и проверить локально без внешней передачи.
- Ошибки и пропуски: нет.
- Принятое решение: Codex реализовал feature-flagged sync и synthetic verifier локально.
- Новое правило: MiMo не трогает код, который может включить provider sync writes, кроме заранее выделенных синтетических тестов.

### MIMO-009 — Telegram provider sync staging enablement не делегировался

- Задача: включить `ENABLE_D1_PROVIDER_SYNC` только в staging config, выполнить Wrangler dry-run/deploy, безопасные smoke-проверки и подготовить no-write HMAC smoke script.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: staging deploy и read-only D1/HTTP smoke выполнены локально через Wrangler; script syntax check прошёл; production config не менялся.
- Ошибки и пропуски: live HMAC smoke не выполнялся, потому что локальный `BOT_TOKEN` не задан; full signed `register-chat` D1 smoke требует отдельный test identity/synthetic KV+D1 сценарий.
- Принятое решение: Codex сделал инфраструктурный staging шаг самостоятельно.
- Новое правило: MiMo не включает feature flags и не выполняет Cloudflare deploy; максимум — проверяет заранее подготовленные синтетические тесты без доступа к real cloud state.

### MIMO-010 — Staging no-write HMAC smoke не делегировался

- Задача: записать staging `BOT_API_TOKEN` secret без вывода значения и выполнить no-write signed `register-chat` smoke.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: staging secret name проверен через Wrangler, HMAC smoke прошёл, D1 read-only check подтвердил `rows_written = 0`.
- Ошибки и пропуски: первая попытка secret put упала из-за PowerShell quoting; повтор через script block прошёл.
- Принятое решение: Codex выполнил шаг сам, потому что он работает с Cloudflare secret state и HMAC routing.
- Новое правило: MiMo не получает и не устанавливает secrets; для него остаются только синтетические локальные verifier-задачи.

### MIMO-011 — Controlled full staging provider sync smoke не делегировался

- Задача: создать synthetic staging D1/KV state, выполнить signed `register-chat`, проверить provider sync rows и очистить synthetic state.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: PowerShell smoke script прошёл; before cleanup: integrations 1, conversations 1, mappings 2, approvedProviderMappings 2; after cleanup: all synthetic D1 counts 0; synthetic KV final cleanup 0.
- Ошибки и пропуски: Node/Wrangler child-process вариант удалён из-за Windows instability; рабочим оставлен PowerShell-native script.
- Принятое решение: Codex выполнил Cloudflare staging smoke сам.
- Новое правило: MiMo не запускает staging/prod Cloudflare smoke с external writes; можно поручать только локальный разбор sanitized output.

### MIMO-012 — Staging approved mappings report не делегировался

- Задача: построить read-only staging D1 report и privacy verifier для approved provider mappings.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: generator и verifier созданы; report `staging-approved-mappings-20260619-102455.report.json` прошёл verifier; approvedProviderSyncMappings сейчас 0.
- Ошибки и пропуски: первый JSON был с BOM, исправлено на UTF-8 without BOM; длинный SQL для Wrangler сжат в одну строку из-за Windows instability.
- Принятое решение: Codex выполнил сам, потому что задача читает staging D1 через Cloudflare Wrangler.
- Новое правило: MiMo может анализировать только sanitized report summary, но не должен запускать Wrangler или работать с Cloudflare state.

### MIMO-013 — Quarantine unlock planner не делегировался

- Задача: создать local unlock planner и verifier поверх sanitized staging approved mapping report.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: planner/verifier прошли; report `staging-quarantine-unlock-plan-20260619-103152.report.json` показывает 0 unlocked и 198 blocked candidate records.
- Ошибки и пропуски: нет.
- Принятое решение: Codex реализовал сам, потому что planner является частью migration safety chain.
- Новое правило: MiMo может проверять только sanitized summaries, не DPAPI artifacts и не import decisions.

### MIMO-014 — Persistent synthetic provider mapping не делегировался

- Задача: создать fixed synthetic provider-sync mapping в staging и проверить, что report/planner видят approved rows, но не разблокируют quarantine без seed match.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: persistent synthetic state создан; approvedProviderSyncMappings 2; unlock planner вернул `blocked_approved_mappings_do_not_match_seed_refs`, 0 unlocked, 198 blocked.
- Ошибки и пропуски: report generator потребовал исправить singleton array handling для unmatched approved rows.
- Принятое решение: Codex выполнил staging write сам, потому что задача меняет Cloudflare staging D1/KV state.
- Новое правило: MiMo не создаёт persistent staging state; максимум анализирует sanitized report/planner outputs.

### MIMO-015 — Synthetic positive unlock branch не делегировался

- Задача: создать изолированный synthetic approved mappings report и проверить planner branch `ready_for_encrypted_full_hash_join`.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: synthetic approved report и unlock plan созданы; verifiers прошли; status `ready_for_encrypted_full_hash_join`, safeToBuildImportPlanNow false.
- Ошибки и пропуски: нет.
- Принятое решение: Codex реализовал сам как часть migration safety chain.
- Новое правило: MiMo может анализировать только sanitized outputs, не DPAPI full-hash join и не import plan decisions.

### MIMO-016 — Encrypted full-hash join planner не делегировался

- Задача: сделать read-only full-hash join planner между DPAPI seed plan и approved mappings из staging D1.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: planner и verifier созданы; report `encrypted-full-hash-join-20260619-105639.report.json` прошёл verifier; approvedRowsFromD1 2, matchedSeedRows 0, candidateRecordsStillBlocked 198, privacy ok.
- Ошибки и пропуски: optional `syntheticTest` в старом report сломал PowerShell StrictMode, исправлено безопасным чтением JSON-свойств; отдельный `powershell.exe` не смог открыть DPAPI artifact, рабочий запуск выполнен в текущем PowerShell process scope.
- Принятое решение: Codex выполнил сам, потому что задача работает с DPAPI artifacts и staging D1 через Wrangler.
- Новое правило: MiMo не получает DPAPI artifacts, full-hash join context и staging D1 access; максимум — проверка уже sanitized отчёта по заранее подготовленному чеклисту.

### MIMO-017 — Synthetic encrypted task import dry-run не делегировался

- Задача: построить полностью synthetic encrypted task import dry-run fixture и проверить позитивную ветку validators без production-derived данных.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: builder/verifier созданы; synthetic report `synthetic-encrypted-task-import-dry-run-20260619-114243.report.json` прошёл privacy verifier; existing encrypted import verifier прошёл; SQLite/D1-shape validator вставил 3 synthetic tasks для 2 synthetic users; staging apply guard ожидаемо отказался принимать synthetic metadata.
- Ошибки и пропуски: verifier сначала дал ложное срабатывание на `task-import` как `sk-...`, regex сужен до token-like паттерна без ослабления проверок реальных секретов.
- Принятое решение: Codex выполнил сам, потому что задача работает с DPAPI-encrypted import plan shape и safety guard для staging apply.
- Новое правило: MiMo может проверять только sanitized synthetic report summary, но не должен расшифровывать DPAPI plan, запускать staging apply или принимать import decisions.

### MIMO-018 — D1 message repository не делегировался

- Задача: добавить data-layer для pagination истории сообщений и idempotency по provider message IDs.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: `message-repository.mjs` и `verify-message-repository.mjs` созданы; verifier прошёл in-memory SQLite/D1-shape: idempotentProviderIngest ok, duplicateRows 0, cursor ok, ownershipIsolation ok, softDeleteDefault ok.
- Ошибки и пропуски: нет; routes ещё не подключались, чтобы сначала стабилизировать data-layer.
- Принятое решение: Codex реализовал сам, потому что задача касается core ownership/idempotency модели сообщений.
- Новое правило: MiMo можно подключать к простым synthetic route/UI тестам после появления `/v2/messages`, но не к production/staging message data и не к provider payloads.

### MIMO-019 — `/v2/messages` route/service не делегировался

- Задача: добавить thin read route/service для D1 messages pagination поверх message repository.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: `message-service.mjs`, `message-routes.mjs` и `verify-v2-messages.mjs` созданы; route verifier прошёл: unauthenticated 401, invalidQuery 400, cursor ok, ownershipIsolation ok, softDeleteDefault ok, dbUnavailable 503.
- Ошибки и пропуски: provider ingest endpoint наружу не открывался намеренно; legacy KV `/messages` routes не переключались.
- Принятое решение: Codex реализовал сам, потому что route касается auth/ownership boundary для пользовательской истории.
- Новое правило: MiMo может проверять только synthetic `/v2/messages` route cases без реальных provider payloads/message history и без staging/prod D1 access.

### MIMO-020 — VK secret/live hardening не делегировался

- Задача: подтвердить установку `VK_SECRET_KEY`, убрать production `500` на legacy VK auth payload и обновить roadmap/history.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: production `wrangler secret list` подтвердил наличие `VK_SECRET_KEY`; hotfix `97eddb50-0b09-4b4c-9184-d802a65aaa30` задеплоен; post-deploy smoke: health 200, hostile CORS 403, `/auth/vk {}` 400, `/auth/vk {"vk_user_id":"123"}` 400.
- Ошибки и пропуски: valid VK Mini App login нельзя синтетически проверить без чтения secret value; нужен ручной smoke-test из VK.
- Принятое решение: Codex выполнил сам, потому что задача затрагивает Cloudflare production Worker и secret inventory.
- Новое правило: MiMo не получает VK secret value и не выполняет production deploy; ему можно отдавать только sanitized smoke summary и frontend/UI чеклист для ручной VK проверки.

### MIMO-021 — `/v2/messages` Worker entrypoint smoke не делегировался

- Задача: добавить controlled local smoke для реального `worker.fetch(...)` entrypoint `/v2/messages`.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: `smoke-worker-v2-messages-entrypoint.mjs` прошёл; дополнительно прошли `verify-v2-messages.mjs` и `verify-message-repository.mjs`; smoke result: unauthenticated 401, invalidQuery 400, firstPageRows 2, secondPageRows 1, cursor ok, CORS ok, no-store ok, ownershipIsolation ok, softDeleteDefault ok, dbUnavailable 503.
- Ошибки и пропуски: Node печатает non-blocking `MODULE_TYPELESS_PACKAGE_JSON` warning при import `4e-worker/worker.js`; package type не менялся.
- Принятое решение: Codex реализовал сам, потому что smoke проверяет auth/ownership boundary и D1-shape fixture.
- Новое правило: MiMo может проверять только sanitized smoke output и простые UI expectations; staging/prod D1 fixtures и provider payloads остаются под контролем Codex.

### MIMO-022 — VK/email login hotfix не делегировался

- Задача: исправить live симптом “Нет соединения” при email login в VK/app context и усилить VK auto-login launch params.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: Worker CORS hotfix deployed `1e3a82b2-26a3-4fbb-84d5-244cdfda34d5`; `https://prod-app123.vk-apps.com` preflight 204; fake login from same origin 400 with matching ACAO; frontend commit `d157bd982f155ddaa52baf7dd0f98a47dfa54da8` pushed to `mrktggod/4e-app`.
- Ошибки и пропуски: GitHub Pages CDN сначала отдавал старый HTML, затем обновился; valid VK auto-login требует ручной проверки в настоящем VK Mini App.
- Принятое решение: Codex выполнил сам, потому что задача затрагивает production Worker CORS и frontend publish.
- Новое правило: MiMo может получать только sanitized status/smoke summary; production deploy, GitHub push и secret-bearing VK checks остаются за Codex.

### MIMO-023 — Login legacy/frontend hardening не делегировался

- Задача: убрать повторный симптом “долго грузит / Ошибка соединения” после ввода email/password.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: Worker legacy password hardening deployed `a1075c52-a9a5-43eb-b50f-3cf2536ae78e`; synthetic legacy users возвращают 400 вместо exception; malformed/fake production login from `vk-apps.com` возвращает JSON 400; frontend commit `34722335a56bf5831ec1d2dc038fd05a7bafbed4` pushed and verified on GitHub Pages.
- Ошибки и пропуски: реальный пользовательский login требует ручной проверки, потому что реальные credentials не используются и production KV user records не читаются напрямую.
- Принятое решение: Codex выполнил сам, потому что задача затрагивает production auth boundary и frontend publish.
- Новое правило: MiMo может анализировать только sanitized smoke summary; production auth deploy/push и любые реальные user credentials остаются вне MiMo.

### MIMO-024 — `vk.ru` origin CORS hotfix не делегировался

- Задача: исправить оставшуюся “Ошибка соединения” по реальной ссылке `https://vk.ru/app54636698`.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: `vk.ru/app54636698` редиректит на `m.vk.ru/app54636698`; до fix `vk.ru/m.vk.ru/app.vk.ru` preflight был 403; после deploy `95dcb053-0dfb-48f6-91b4-465ed2a5b766` все три origin дают preflight 204 и fake login JSON 400.
- Ошибки и пропуски: ручной valid login всё ещё требует проверки пользователем; rate-limit может временно показать “Слишком много попыток” после серии попыток.
- Принятое решение: Codex выполнил сам, потому что задача затрагивает production Worker CORS.
- Новое правило: при VK диагностике обязательно проверять `vk.ru`, `m.vk.ru`, `app.vk.ru`, `vk.com`, `app.vk.com`, `m.vk.com` и `*.vk-apps.com`.

### MIMO-025 — VK mobile WebView `X-Requested-With` hotfix не делегировался

- Задача: исправить повторную мобильную “Ошибка соединения” в VK после того, как web/desktop вход уже работал.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: найден mobile-specific CORS case — Android WebView может добавлять `X-Requested-With`; production preflight до fix не разрешал этот header. Worker deployed `c2f597c9-8828-4f4e-994f-e0a243fd2da5`; live preflight для `mrktggod.github.io` и `m.vk.ru` с `content-type,x-requested-with` возвращает 204, allow headers содержат `X-Requested-With`; live Node fetch с `X-Requested-With: com.vkontakte.android` возвращает JSON 400 для fake login и invalid register вместо network/1101.
- Ошибки и пропуски: valid пользовательский login/register всё ещё требует ручной проверки на телефоне; реальные credentials не используются в диагностике.
- Принятое решение: Codex выполнил сам, потому что задача затрагивает production Worker CORS/auth boundary.
- Новое правило: для VK mobile smoke всегда проверять preflight с `Access-Control-Request-Headers: content-type,x-requested-with` и live request с `X-Requested-With: com.vkontakte.android`.

### MIMO-026 — VK false connection after successful login не делегировался

- Задача: исправить мобильный симптом, где первый email login показывает “Ошибка соединения”, а повторный клик уже впускает.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: найден frontend bug в `vk.html` — `doLogin()`/`doRegister()` ловили одним `try/catch` и network auth, и post-login `enterApp()`, поэтому UI/localStorage ошибка после успешного токена выглядела как connection error. Добавлены `completeAuth`, `saveAuthToken`, `readChatHistory`; `enterApp()` стал tolerant. Frontend commit `4792e2b` pushed to `mrktggod/4e-app`; GitHub Pages live `vk.html` содержит `completeAuth` и `readChatHistory`.
- Ошибки и пропуски: реальный мобильный smoke остаётся ручным; пустые задачи после email-входа не чинились этим hotfix, потому что это отдельная Gate 2 задача link/merge identities.
- Принятое решение: Codex выполнил сам, потому что задача затрагивает production frontend publish и auth UX.
- Новое правило: при “первый клик ошибка, второй клик успех” проверять не только backend/CORS, но и post-auth frontend code внутри общего `try/catch`.

### MIMO-027 — VK docs + chat task persistence не делегировался

- Задача: сверить официальную VK документацию и исправить фактический разрыв chat → dashboard tasks.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: официальная VK launch params документация подтверждает текущий способ получения launch params (`window.location` / `VKWebAppGetLaunchParams`) и необходимость проверки `sign`; проблема была не в VK launch flow, а в email login timeout и отсутствии `save-task` вызова из VK чата. Frontend commit `5120a36` pushed; GitHub API показывает новый `vk.html` blob `2ae7465e402a43d2c71a0e96e803c089d8e79480`.
- Ошибки и пропуски: GitHub Pages edge cache может временно отдавать старый HTML; реальный мобильный smoke остаётся ручным.
- Принятое решение: Codex выполнил сам, потому что задача затрагивает production frontend publish и auth/task UX.
- Новое правило: если AI “фиксирует задачу”, обязательно проверять реальный путь записи (`x-action: save-task` или v2 task route), а не только сохранение истории чата.

### MIMO-028 — Legacy identity linking / VK dashboard read compatibility не делегировался

- Задача: начать Gate 2 unified identity без полного production D1 cutover; связать VK/email в текущем legacy KV path и устранить пустой дашборд после сохранения задач.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: в Worker добавлены `POST /auth/link-vk`, protected `GET /auth/identities`, copy-only merge legacy buckets и улучшенный `/auth/vk` mapping. Production Worker deployed `233ba462-ffb4-467d-8a9e-f04b01df9f41`. Frontend `vk.html` теперь вызывает `linkCurrentVK()` после email login/register и принимает legacy `/tasks` array response; commit `16e4ef3` pushed.
- Ошибки и пропуски: важная причина пустого дашборда была в несовпадении формата `/tasks`: Worker отдавал массив, а VK frontend ждал `{ tasks: [...] }`. GitHub Pages cache проверен маркерами после push.
- Принятое решение: Codex выполнил сам, потому что задача касается production auth boundary, signed VK launch params и merge поведения пользовательских данных.
- Новое правило: при жалобе “данные сохранились, но не отображаются” проверять не только write path, но и shape read response на фронте.

### MIMO-029 — VK connected accounts profile UI не делегировался

- Задача: добавить в профиль VK Mini App видимый блок подключённых аккаунтов Email/VK/Telegram.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: добавлен read-only/refresh UI поверх уже защищённых `/auth/identities` и `/auth/link-vk`; JS syntax check прошёл для локального и publish `vk.html`.
- Ошибки и пропуски: unlink/relink и отдельный Telegram link flow намеренно не делались, чтобы не расширять scope.
- Принятое решение: Codex выполнил сам, потому что изменение маленькое, связано с production auth UX и должно точно соответствовать текущему Worker API.
- Новое правило: маленькие UI-слои для production auth сначала делать поверх уже проверенных endpoints, а полный redesign переносить после стабилизации состояний.

### MIMO-030 — D1 v2 auth identities read endpoint не делегировался

- Задача: подготовить D1/v2 read path для connected accounts, чтобы будущий редизайн не зависел от legacy KV `/auth/identities`.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: добавлены `listIdentitiesByUser`, `service.listIdentities()` и protected `GET /v2/auth/identities`; локальные `node --check`, `verify-auth-repository`, `verify-v2-auth` и `verify-d1-schema` прошли. Staging Worker deployed `913ef30c-0da1-4f93-8852-eb3e8380efb1`; repeat no-token smoke вернул ожидаемый `401`.
- Ошибки и пропуски: первый smoke сразу после deploy кратко вернул старый `404`, повторная проверка подтвердила route. Production cutover, D1 write/link routes и unlink/relink policy намеренно не делались.
- Принятое решение: Codex выполнил сам, потому что это security-sensitive auth route и маленький backend слой под Gate 2.
- Новое правило: перед редизайном connected-account UI должен иметь одинаковый read contract в legacy и v2/D1 путях.

### MIMO-031 — D1 v2 signed identity link routes не делегировался

- Задача: добавить безопасный D1/v2 write/link foundation для Telegram/VK identities без unsafe arbitrary provider ID writes.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: добавлены provider verifiers, `service.linkVerifiedIdentity()`, protected `POST /v2/auth/link-telegram` и `POST /v2/auth/link-vk`; локальные signed verifier tests и v2 auth conflict-flow прошли; staging Worker deployed `5b145762-4e19-402e-bba2-c815f6a1b0ee`; no-write smoke для identities/link routes вернул `401` без bearer token.
- Ошибки и пропуски: full Telegram remote write smoke не запускался, потому что Codex не читает значение staging `BOT_API_TOKEN`; full VK smoke требует staging `VK_SECRET_KEY`, которого сейчас нет в secret list. Production cutover, D1 user merge и unlink/relink policy намеренно не делались.
- Принятое решение: Codex выполнил сам, потому что route security зависит от provider signature verification и D1 ownership semantics.
- Новое правило: D1 identity writes разрешать только через provider-specific signed proof routes; не делать универсальный public `/link-identity` по provider/user id.

### MIMO-032 — D1 identity conflict challenge foundation не делегировался

- Задача: добавить durable challenge-record foundation для случая, когда signed Telegram/VK identity уже принадлежит другому D1 user.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: добавлена migration `0005_account_link_challenge_metadata.sql`, repository/service create/find challenge methods, safe `AuthConflictError.details` и conflict-flow `409 requiresChallenge`; локальные verifier scripts прошли; staging D1 migration применена; staging Worker deployed `9bf77231-9535-4b3b-8bc7-d5a8f043d05f`; read-only D1 query подтвердил новые колонки.
- Ошибки и пропуски: первый read-only D1 query упал из-за nested PowerShell quoting и был успешно повторён проще. Full remote provider challenge smoke не запускался, потому что Codex не читает secret values для подписи реальных payloads. Production, automatic merge и unlink/relink не трогались.
- Принятое решение: Codex выполнил сам, потому что задача security-sensitive и влияет на D1 identity ownership/merge semantics.
- Новое правило: при identity conflict сначала создавать короткоживущий pending challenge с безопасным public contract; automatic merge запрещён до user-facing confirmation policy.

### MIMO-033 — D1 link challenge completion route не делегировался

- Задача: добавить staging-safe route завершения identity conflict challenge без automatic merge.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: добавлены `updateAccountLinkChallengeStatus`, `getLinkChallengeCompletionTarget`, `completeVerifiedLinkChallenge` и `POST /v2/auth/link-challenges/:id/complete`; локальные verifier scripts прошли; staging Worker deployed `b4096eb1-e639-4baf-9d4c-935a0684f549`; no-write smoke нового route вернул `401` без bearer token.
- Ошибки и пропуски: full remote provider completion smoke не запускался, потому что Codex не читает secret values для подписи реальных payloads. Production, automatic merge, frontend UI и unlink/relink не трогались.
- Принятое решение: Codex выполнил сам, потому что route security зависит от Bearer session, signed provider proof, D1 challenge ownership и запрета silent merge.
- Новое правило: completed challenge означает только "provider ownership proof собран"; перенос identity/user data разрешать только отдельным merge confirmation policy.

### MIMO-034 — D1 merge confirmation route не делегировался

- Задача: добавить staging-safe merge route после completed identity challenge с явным `confirm: true`.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: добавлены repository preflight/merge methods, `mergeCompletedLinkChallenge` и `POST /v2/auth/link-challenges/:id/merge`; verifier scripts покрыли confirm-required, чужой merge, перенос identities/tasks/reminders/integrations/contacts/conversations/AI/audit rows, revoke source sessions и delete source user; staging Worker deployed `b80be643-0fa6-402a-a314-888013f62998`; no-write smoke merge route вернул `401`.
- Ошибки и пропуски: первый curl smoke с escaped JSON в PowerShell завершился без body; повтор с `{}` прошёл. Full remote provider merge smoke не запускался без чтения secret values. Production, frontend UI и unlink/relink не трогались.
- Принятое решение: Codex выполнил сам, потому что merge затрагивает ownership и должен быть атомарным, с preflight и без участия MiMo как junior-reviewer.
- Новое правило: user merge разрешён только после completed challenge + явного `confirm: true` + clean preflight; source sessions всегда revoke, а не silent handover.

### MIMO-035 — VK identity conflict/merge UI layer не делегировался

- Задача: добавить UI state в VK profile для identity conflict → complete → merge без полного редизайна.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: в `4e-app/vk.html` и publish-копию добавлен hidden challenge panel, handlers `completePendingLinkChallenge`/`mergePendingLinkChallenge`, обработка `requiresChallenge`, contract markers и JS syntax checks прошли.
- Ошибки и пропуски: live flow остаётся forward-compatible, потому что production VK frontend всё ещё использует legacy `/auth/*` + `x-token`, а D1/v2 challenge routes пока staging/Bearer. Production Worker не менялся.
- Принятое решение: Codex выполнил сам, потому что это маленький production-facing UI patch и надо точно сохранить текущий VK auth behavior.
- Новое правило: frontend challenge UI можно публиковать скрытым forward-compatible слоем, но нельзя считать flow live-ready до production D1/v2 auth bridge или cutover.

### MIMO-036 — D1 legacy session bridge не делегировался

- Задача: добавить безопасный bridge из legacy KV `x-token` session в D1 Bearer session для будущего VK v2 challenge flow.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: добавлен `POST /v2/auth/legacy-session`, `exchangeLegacySession()` и Worker handoff проверенного legacy user; `node --check`, `node scripts/verify-v2-auth.mjs`, Wrangler staging dry-run и no-write live smoke прошли. Staging Worker deployed `0b771399-3713-47c7-a95e-2cf09fa9d717`.
- Ошибки и пропуски: production не трогался, потому что `wrangler.toml` пока без D1 binding; full staging success-smoke с synthetic KV/D1 writes не запускался без отдельного cleanup-сценария.
- Принятое решение: Codex выполнил сам, потому что bridge касается auth/session ownership и должен принимать только серверно проверенную legacy session, а не данные от клиента.
- Новое правило: production D1/v2 cutover нельзя делать, пока production Worker не имеет D1 binding и отдельного migration/smoke gate; bridge сначала проверять на staging.

### MIMO-037 — VK frontend D1 auth bridge handshake не делегировался

- Задача: подключить VK frontend к `/v2/auth/legacy-session` и v2 challenge routes без поломки текущего production legacy login.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: добавлен runtime `state.d1Token`, `syncD1AuthSession()`, v2-first `linkCurrentVK()` с fallback на legacy `/auth/link-vk`, D1-token guards для complete/merge; inline JS checks прошли для local и publish `vk.html`, копии совпадают; publish-клон закоммичен локально `fcd2b79`, escalated push отправил `bb9bdce..fcd2b79 main -> main`, GitHub connector readback подтвердил markers на `main`.
- Ошибки и пропуски: production D1 binding ещё отсутствует, поэтому опубликованный frontend будет тихо откатываться на legacy path до production D1/cutover. Первый sandbox `git push origin main` не прошёл из-за локальных Windows/Git credentials `SEC_E_NO_CREDENTIALS`, повторный escalated push прошёл. Full mobile smoke и direct `github.io` cache/readback не запускались.
- Принятое решение: Codex выполнил сам, потому что изменение затрагивает auth-token routing и должно сохранить production fallback.
- Новое правило: frontend может пробовать v2 path только с отдельным Bearer token; legacy `x-token` нельзя использовать как v2 Bearer token.

### MIMO-038 — Production D1 cutover readiness checker не делегировался

- Задача: добавить локальный preflight перед production D1/cutover, не создавая Cloudflare resources.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: добавлен `scripts/check-production-d1-cutover-readiness.js`; `node --check` прошёл; запуск checker ожидаемо вернул `ok:false`, blocker `production Worker has no D1 DB binding yet`, warning по production `ENABLE_D1_PROVIDER_SYNC`.
- Ошибки и пропуски: Cloudflare resources не создавались и production Worker не деплоился; checker локальный и не проверяет secret values/remote D1 queries.
- Принятое решение: Codex выполнил сам, потому что это маленький ops-safety слой и он нужен до внешнего Cloudflare state change.
- Новое правило: production D1/cutover начинать только после явного approval и зелёного readiness checker/dry-run/smoke gate.

### MIMO-039 — Production D1 gate не делегировался

- Задача: после явного approval создать и подключить production D1, применить migrations, задеплоить Worker с binding и проверить bridge.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: создана D1 `4e-production` (`6107948c-6c67-4c37-baa1-efea6c5c2860`), `wrangler.toml` получил `DB` binding, migrations `0001`–`0005` применены, production Worker deployed `fc2df9b0-2f19-4bc3-8bb3-e3f05d9a25d6`, readiness checker `ok:true`, dry-run видел `env.DB (4e-production)`, no-write auth boundary smoke прошёл, controlled legacy→D1 bridge smoke прошёл, cleanup подтверждён `smokeUsers=0`, `totalUsers=0`.
- Ошибки и пропуски: первый D1 create упал transient `fetch failed` и был повторён после `d1 list`; первые smoke attempts выявили проблему записи JSON через Windows CLI/BOM и были исправлены через `--path` + UTF8 no BOM; production provider sync flag оставлен выключенным; real VK mobile smoke не запускался.
- Принятое решение: Codex выполнил сам, потому что это production infra gate с sensitive ownership/session проверками и нужен строгий cleanup.
- Новое правило: production smoke scripts для KV JSON должны писать через temp file UTF-8 no BOM и `wrangler kv key put --path`, а legacy `getSession()` надо дополнительно защитить от malformed JSON.

### MIMO-040 — Defensive legacy session parsing не делегировался

- Задача: закрыть Worker `1101` при malformed legacy KV `session:*`.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: `getSession()` получил guarded `JSON.parse`, shape/expiresAt validation и best-effort cleanup; `node --check`, `verify-v2-auth`, readiness checker и `git diff --check` прошли; staging deployed `03a605a3-7239-48be-abfd-2774bdee48ad`; production deployed `3892efae-de1a-4d0c-8bd7-822b7835894c`; malformed-session smoke на staging/production вернул `401` и удалил KV key; production bridge regression smoke прошёл, cleanup `smokeUsers=0`, `totalUsers=0`.
- Ошибки и пропуски: финальный D1 count после bridge smoke сначала был запущен из корня и Wrangler не нашёл `wrangler.toml`; повтор из `4e-worker` прошёл. Real VK mobile smoke не запускался.
- Принятое решение: Codex выполнил сам, потому что это production crash guard и требует точной проверки edge behavior.
- Новое правило: любые raw legacy KV JSON reads должны быть guarded и не должны превращать плохие данные в Worker `1101`.

### MIMO-041 — Production D1 migration status report не делегировался

- Задача: собрать read-only sanitized статус production KV→D1 migration после production D1 gate, без D1/KV writes.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: добавлены `scripts/report-production-d1-migration-status.mjs` и `scripts/verify-production-d1-migration-status.mjs`; создан `backups/production-d1-migration-status-20260620-141754.report.json`; verifier подтвердил `hold_production_import`, blockers `5`, importableTaskRows `83`, quarantinedRecords `206`, candidateRecordsStillBlocked `198`; `node --check` и `git diff --check` прошли.
- Ошибки и пропуски: первая версия читала `conversationCandidateRecords` из неверного поля и давала `0`; исправлено на `conversationOwner.scope.candidateRecords`, после чего отчёт показал ожидаемые `198`.
- Принятое решение: Codex выполнил сам, потому что это safety/reporting слой перед production import и он должен быть privacy-verified.
- Новое правило: production D1 import нельзя запускать только потому, что D1 binding уже есть; нужен отдельный migration status report и explicit quarantine/owner policy.

### MIMO-042 — Ready task import approval pack не делегировался

- Задача: подготовить проверяемую approval-точку для узкого scope `83` ready task rows без production writes.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: добавлены `scripts/build-production-ready-task-import-approval-pack.mjs` и `scripts/verify-production-ready-task-import-approval-pack.mjs`; read-only production D1 count показал `users/tasks/auth_identities/sessions = 0`, `rows_written = 0`, `changed_db = false`; создан `backups/production-ready-task-import-approval-20260620-142957.report.json`; verifier подтвердил `approval_required_ready_83_only`, readyRows `83`, quarantinedRecordsExcluded `206`.
- Ошибки и пропуски: первый Wrangler count был запущен из корня и не нашёл `wrangler.toml`; затем запуск перенесён в `4e-worker`. PowerShell ломал JSON CLI argument, поэтому builder получил Windows-safe `--d1-counts`.
- Принятое решение: Codex выполнил сам, потому что это safety gate перед возможными production writes.
- Новое правило: даже ready 83 rows нельзя писать в production без отдельной явной фразы `APPROVE_PRODUCTION_D1_IMPORT_READY_TASKS_83_ONLY`, fresh dry-run и rollback note.

### MIMO-045 — Frontend privacy center не делегировался

- Задача: добавить в основной frontend экран “Данные и память” и подключить его к `/v2/privacy`.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: в `4e-app/index.html` добавлены profile item, screen `privacy-center`, D1 session bridge через `/v2/auth/legacy-session`, controls для AI/messenger permissions, retention, consent и export/delete requests; добавлен `verify-privacy-center-html.mjs`; HTML verifier, `/v2/privacy` verifier, Worker entrypoint smoke, auth regression и schema verifier прошли.
- Ошибки и пропуски: первый apply patch был слишком крупным и не применился; решение — разбить HTML/JS правки на атомарные patches. Remote migration/deploy/publish не выполнялись.
- Принятое решение: Codex выполнил сам, потому что экран связан с персональными данными, auth-token routing и должен аккуратно fallback-иться до remote migration `0006`.
- Новое правило: при смене legacy token обязательно очищать D1 Bearer token, чтобы не смешать пользователей между legacy и `/v2/*` контурами.

### MIMO-044 — `/v2/privacy` routes не делегировался

- Задача: подключить privacy controls foundation к локальному Worker API для будущего экрана “Данные и память”.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: добавлены `privacy-service.mjs`, `privacy-routes.mjs`, `verify-v2-privacy.mjs`, `smoke-worker-v2-privacy-entrypoint.mjs`; `worker.js` подключает `/v2/privacy/*`; CORS methods включают `PUT`; route verifier, Worker entrypoint smoke, auth regression, messages entrypoint regression, repository verifier и schema verifier прошли.
- Ошибки и пропуски: remote D1 migration/deploy не выполнялись; UI privacy center и retention job ещё не реализованы; Node entrypoint smoke сохраняет старое warning про отсутствие `"type": "module"` в `4e-worker/package.json`.
- Принятое решение: Codex выполнил сам, потому что это security/privacy API boundary и его надо проверять synthetic route + entrypoint smoke, а не отдавать джун-задачей.
- Новое правило: любой UI для персональных данных сначала подключать к `/v2/privacy`, а не писать consent/settings напрямую в legacy KV или frontend local state.

### MIMO-043 — Privacy controls foundation не делегировался

- Задача: добавить D1-фундамент для consent, privacy settings, export/delete requests и retention controls после обновления общего плана по юридической безопасности и персональным данным.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: добавлены `0006_privacy_controls.sql`, `privacy-repository.mjs`, `verify-privacy-controls-repository.mjs`, обновлён `verify-d1-schema.js`; `node --check`, repository verifier и schema verifier прошли.
- Ошибки и пропуски: production D1 не менялся; UI/routes/retention job не реализованы в этом шаге; юридические тексты остаются отдельной задачей.
- Принятое решение: Codex выполнил сам, потому что это чувствительный privacy/security слой и он должен быть спроектирован консистентно с D1 auth/messages/AI memory.
- Новое правило: мессенджер-import, messenger-send, AI processing и AI memory должны включаться отдельными consent/permission событиями, а не одним общим “разрешить всё”.

### MIMO-046 — Staging privacy gate не делегировался

- Задача: применить migration `0006_privacy_controls.sql` на staging D1, задеплоить staging Worker и проверить live `/v2/privacy` без реальных данных.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: staging dry-run увидел `env.DB (4e-staging)`, migration `0006` была единственной pending и успешно применена, staging Worker deployed `1a89a880-069d-4d74-835b-94831831ac33`; `scripts/smoke-staging-v2-privacy.ps1` подтвердил unauth `401`, settings defaults/update, consent grant, data subject request и cleanup `users/sessions/settings/consents/dataRequests = 0`.
- Ошибки и пропуски: production D1/Worker и GitHub Pages не трогались; register/login smoke не выбран из-за rate limit, вместо него использована synthetic D1 session.
- Принятое решение: Codex выполнил сам, потому что это security/privacy staging gate с remote D1 writes и обязательным cleanup.
- Новое правило: перед публикацией UI с персональными данными нужен live staging gate по synthetic-only данным и отдельный production gate.

### MIMO-047 — Production privacy gate не делегировался

- Задача: применить migration `0006_privacy_controls.sql` на production D1, задеплоить production Worker и проверить live `/v2/privacy` без реальных данных.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: production preflight показал pending только `0006`, users/sessions/tasks/identities `0`, FK check clean и dry-run с `env.DB (4e-production)`; migration `0006` применена, production Worker deployed `83a5df15-41cc-4edb-b8f9-0d455ac09236`; `scripts/smoke-production-v2-privacy.ps1` подтвердил unauth `401`, settings defaults/update, consent grant, data subject request и cleanup `users/sessions/settings/consents/dataRequests = 0`; финально pending migrations отсутствуют и FK check clean.
- Ошибки и пропуски: GitHub Pages не публиковался; на предыдущем заходе remote Wrangler D1 команды были остановлены usage limit до `15:40`, обходные пути не использовались.
- Принятое решение: Codex выполнил сам, потому что это production security/privacy gate с remote D1 writes и обязательным cleanup.
- Новое правило: после production privacy gate можно публиковать frontend privacy center, но сам publish должен быть отдельным проверяемым шагом.

### MIMO-048 — Frontend privacy center publish не делегировался

- Задача: опубликовать frontend privacy center на GitHub Pages после закрытия production privacy gate.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: `4e-app/index.html` синхронизирован в `.tmp-4e-app-publish/index.html`, `vk.html` не менялся; `verify-privacy-center-html.mjs` получил optional path argument; local и publish verifiers прошли; commit `1bdcb76` (`feat: publish privacy center`) pushed в `mrktggod/4e-app`; raw GitHub и live Pages readback подтвердили `privacy-center`, `syncD1AuthSession`, `/v2/privacy/settings`.
- Ошибки и пропуски: Git sandbox требовал safe.directory, использован one-shot `git -c safe.directory=...`; GitHub Pages сначала отдавал старый HTML, live URL был прополлен до появления markers; ручной Web/VK user-flow smoke ещё не выполнен.
- Принятое решение: Codex выполнил сам, потому что это publish gate с GitHub Pages readback и нужно не потерять production privacy prerequisites.
- Новое правило: после frontend publish обязательно делать raw GitHub readback и live Pages marker readback, а ручной webview smoke фиксировать отдельным шагом.

### MIMO-049 — VK mobile auth timeout hotfix не делегировался

- Задача: устранить мобильную VK WebView ошибку email auth “Сервер отвечает дольше обычного…” после жалобы пользователя.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: установлено, что exact timeout text находится в `4e-app/vk.html`, а production Worker auth/CORS живые; добавлен `fetchAuthWithRetry` с hidden retry для login, `cache: 'no-store'`, `credentials: 'omit'`, register timeout recovery через login; добавлен `scripts/verify-vk-auth-retry-html.mjs`; local verifier, publish verifier, privacy center verifier, `/v2/privacy` verifier, Worker privacy entrypoint smoke и publish `diff --check` прошли; commit `d38d0bd` (`fix: retry VK auth requests`) pushed в `mrktggod/4e-app`; raw GitHub и live Pages readback подтвердили markers.
- Ошибки и пропуски: GitHub Pages сначала отдавал старый `vk.html`, live URL был прополлен с cache-busting query до появления новых markers; реальный mobile VK smoke остаётся ручным шагом пользователя.
- Принятое решение: Codex выполнил сам, потому что это production-facing hotfix на auth flow, а MiMo как junior мог бы не отличить backend outage от WebView/network/cache проблемы.
- Новое правило: для VK mobile auth bugs сначала проверять source of toast text, backend latency/CORS и live Pages freshness; только потом менять Worker или увеличивать timeout.

### MIMO-050 — VK mobile simple-CORS auth diagnostics не делегировался

- Задача: второй hotfix после того, как `MIMO-049`/`CODEX-051` не решил реальный mobile VK login.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: production Worker auth/CORS снова проверены как живые; подтверждено, что Worker принимает JSON body с `Content-Type: text/plain`; `vk.html` переведён на simple-CORS legacy email auth без preflight, добавлены build marker `vk-auth-simple-cors-20260620-2`, блок `authDiagnostics` и кнопка “Проверить связь”; verifier обновлён; local verifier, publish verifier, privacy center regression и publish `diff --check` прошли; commit `0be7711` (`fix: use simple CORS for VK auth`) pushed в `mrktggod/4e-app`; raw GitHub и live Pages readback подтвердили markers.
- Ошибки и пропуски: предыдущий retry-only фикс оказался недостаточным; GitHub Pages коротко отдавал старый HTML и был прополлен до нового build marker; manual VK mobile smoke ещё нужен.
- Принятое решение: Codex выполнил сам, потому что это production-facing auth fix с тонким CORS/WebView поведением и быстрым publish/readback циклом.
- Новое правило: если VK mobile login висит, убрать preflight для legacy email auth через simple-CORS перед более дорогим переносом API на custom domain; если и это не поможет, просить diagnostics line и проверять блокировку `workers.dev`.

### MIMO-051 — VK API edge domain не делегировался

- Задача: после real-device diagnostics `ping:timeout`/`auth:timeout` на `workers.dev` поднять альтернативный API URL для VK mobile.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: `api.4-ai.site` проверен и отклонён как чужой/другой API; `edge.4-ai.site` был свободен и привязан к текущему Worker через `routes = [{ pattern = "edge.4-ai.site", custom_domain = true }]`; после первого deploy обнаружено отключение `workers.dev`, добавлен `workers_dev = true` и выполнен повторный deploy; live checks подтвердили `edge.4-ai.site/` → `200 OK`, `/v2/privacy/settings` без токена → `401`, `/auth/login` synthetic → быстрый `400`, старый `workers.dev` тоже жив; `vk.html` переключён на `https://edge.4-ai.site`; после первого cold edge check увеличены auth/diagnostics timeouts и marker обновлён до `vk-auth-edge-domain-20260620-4`; verifier/regressions прошли; commits `c8acb96` (`fix: use edge domain for VK API`) и `3d61b57` (`fix: tune VK edge auth timeout`) pushed в `mrktggod/4e-app`; raw GitHub и live Pages readback подтвердили markers.
- Ошибки и пропуски: Wrangler по умолчанию отключил `workers.dev` при route config без `workers_dev = true`; manual VK mobile smoke на новом домене ещё нужен.
- Принятое решение: Codex выполнил сам, потому что это production routing/auth availability fix и требует точного Cloudflare deploy + rollback awareness.
- Новое правило: перед использованием существующего `api.*` домена проверять route identity через ожидаемые protected endpoints; при добавлении Worker routes всегда явно задавать `workers_dev = true`, если старый Worker URL ещё используется фронтом/ботом.

### MIMO-052 — VK auth screen fast boot не делегировался

- Задача: убрать долгий loader до страницы входа в VK mobile WebView после real-device жалобы пользователя.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: `4e-app/vk.html` переведён на fast boot — `vk-bridge` грузится async, bootstrap больше не ждёт `window.load`, форма входа показывается до `/auth/me`, сохранённый token проверяется с timeout `2500ms`, VK auto-login уходит в background; marker обновлён до `vk-auth-fast-boot-20260620-5`; local verifier, privacy regressions, publish verifier и live GitHub Pages readback прошли; commit `ac7fe3c` (`fix: speed up VK auth screen`) pushed в `mrktggod/4e-app`.
- Ошибки и пропуски: этот шаг не лечит сам сетевой timeout VK WebView к `edge.4-ai.site`; он только убирает лишнее frontend ожидание до формы. Чистовой `4-ai.site` не трогался и route `4-ai.site/api/*` не деплоился.
- Принятое решение: Codex выполнил сам, потому что это production-facing frontend hotfix с cache/readback циклом, а MiMo мог перепутать чистовой и технический контуры.
- Новое правило: `4-ai.site` считать чистовым контуром и не использовать для технических hotfix-ов/same-origin API без явного решения пользователя; при VK mobile auth bugs сначала отделять UX loader delay от реального network timeout.

### MIMO-053 — VK email login recovery не делегировался

- Задача: убрать необходимость второго ручного нажатия “Войти” в VK mobile WebView после real-device smoke: первый клик показывал “Ошибка соединения”, второй клик входил.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: по screenshot установлено, что `ping:200` до `edge.4-ai.site` уже проходит, а `auth:TypeError` остаётся только на POST `/auth/login`; live `curl` с `Origin: https://mrktggod.github.io` подтвердил корректные CORS headers и быстрые `GET /` → `200`, `POST /auth/login` invalid → `400`; `4e-app/vk.html` получил `recoverLoginSession()`, recovery delay `900ms`, login catch-path “Проверяем вход...”, marker `vk-auth-login-recovery-20260620-6`; local verifier, privacy regressions, publish verifier, raw GitHub и live Pages readback прошли; commit `54a17bf` (`fix: recover VK email login`) pushed в `mrktggod/4e-app`.
- Ошибки и пропуски: Worker не менялся; clean `4-ai.site` не трогался; если первый клик всё ещё ошибается, нужна per-attempt diagnostics primary/recovery login.
- Принятое решение: Codex выполнил сам, потому что это production-facing frontend recovery logic и его надо было быстро проверить publish/readback циклом.
- Новое правило: если real user сообщает “первый клик ошибка, второй клик работает”, сначала добавлять idempotent recovery внутри первого действия, а не просить пользователя повторять действие руками.

### MIMO-054 — VK auth connection warm-up не делегировался

- Задача: проверить план после параллельной работы с Клодом и закрыть гипотезу пользователя, что первый login click происходит до прогрева VK WebView/API.
- Переданный контекст: ничего не отправлено.
- Результат MiMo: не вызывался.
- Проверка Codex: `PRODUCT_ROADMAP.md` и `BETA_ROADMAP.md` сверены — текущая работа остаётся в Этапе 2 / Gate 2, лишней ветки нет; перед push обнаружены новые commits Клода по редизайну в `mrktggod/4e-app`, текущий diff проверен как точечный `vk.html` change. В `vk.html` добавлен `warmAuthConnection()`, background boot warm-up и login warm-up перед первым `/auth/login`; marker `vk-auth-warmup-20260620-7`; local verifier, privacy regressions, publish verifier, raw GitHub и live Pages readback прошли; commit `ba3b345` (`fix: warm VK auth connection`) pushed поверх `29f25a7`.
- Ошибки и пропуски: Worker не менялся; clean `4-ai.site` не трогался; если первый клик всё ещё ошибается, нужна per-attempt diagnostics warmup/primary/recovery.
- Принятое решение: Codex выполнил сам, потому что это production-facing VK auth hotfix с риском пересечься с новыми commits Клода; требовалась аккуратная проверка diff перед push.
- Новое правило: после параллельной работы Клода перед любым publish сначала проверять latest commits/diff и убеждаться, что Codex patch не перетирает редизайн/чужие изменения.

### MIMO-055 — Light theme + task discussion tab polish не делегировался

- Задача: по скринам пользователя поправить светлую тему нового redesign, где фон главного экрана оставался чёрным, и переименовать вкладку `Комментарии` в карточке задачи на `Обсудить задачу`.
- Переданный контекст: ничего не отправлялось.
- Результат MiMo: не вызывался.
- Проверка Codex: найден жёсткий CSS `#home{background:#0a0f07}`, который перебивал light theme; найдено, что VK Bridge напрямую перетирал `data-theme` по host scheme; `vk.html` проверен как legacy/auth-focused экран без redesign. Внесён патч в локальный `4e-app/index.html` и publish clone `.tmp-4e-app-publish/index.html`; добавлен verifier `scripts/verify-redesign-light-theme-html.mjs`; commit `f3dc86a` (`fix: polish light theme discussion tab`) pushed в `mrktggod/4e-app`; raw GitHub и cache-busted GitHub Pages readback подтвердили `discussion=true`, `lightHome=true`, `vkThemeGuard=true`.
- Ошибки и пропуски: первая live-check команда сломалась на кавычках PowerShell/Node, перезапущена упрощённо; обычный GitHub Pages URL кратко отдавал старый HTML, cache-busted readback подтвердил обновление.
- Принятое решение: Codex выполнил сам, потому что это узкий UI-polish publish поверх свежего redesign Клода и его нужно было быстро проверить на live Pages, не затрагивая Worker/D1/auth.
- Новое правило: при frontend redesign hotfix проверять не только CSS, но и host/theme adapter; если VK Mini App URL указывает на `vk.html`, помнить, что новый redesign сейчас находится в `index.html`, а `vk.html` не редиректит на него.

### MIMO-056 — VK runtime redesign route fix не делегировался

- Задача: после real-device VK smoke пользователь показал, что в VK Mini App всё ещё старый интерфейс, задача не открывается, кнопки темы нет.
- Переданный контекст: ничего не отправлялось.
- Результат MiMo: не вызывался.
- Проверка Codex: установлено, что VK реально грузит `4e-app/vk.html`, а `CODEX-057` был применён к `index.html`; `vk.html` нельзя просто заменить на `index.html`, потому что в нём текущие рабочие `edge.4-ai.site`, `vk4_token`, `linkCurrentVK`, `/auth/identities`, challenge/merge и auth warm-up. В `vk.html` добавлен runtime redesign слой: home chips/focus/stat cards, task-detail route, вкладка `Обсудить задачу`, theme toggle, guarded host theme; auth verifier и новый redesign verifier прошли локально и в publish-клоне; commit `af531ee` (`fix: apply VK redesign runtime`) pushed в `mrktggod/4e-app`; raw GitHub и GitHub Pages readback подтвердили markers.
- Ошибки и пропуски: предыдущий вывод “для нового дизайна переключить VK на index.html” был рискованным/неполным, потому что не учитывал, что `index.html` и `vk.html` имеют разные auth/token контуры.
- Принятое решение: Codex выполнил сам, потому что это production-facing VK UI route fix с сохранением рабочей auth/identity логики и требовал быстрого publish/readback цикла.
- Новое правило: если пользователь присылает скрин из VK Mini App, сначала искать точные строки скрина в `vk.html`; redesign-патчи для VK должны попадать в `vk.html`, пока архитектурно не выполнена безопасная унификация `index.html`/`vk.html`.

## Шаблон записи

### MIMO-NNN — Название

- Задача:
- Переданный контекст:
- Результат MiMo:
- Проверка Codex:
- Ошибки и пропуски:
- Принятое решение:
- Новое правило:
