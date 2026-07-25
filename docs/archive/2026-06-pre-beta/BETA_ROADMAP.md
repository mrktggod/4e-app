# Roadmap подготовки beta

> Update 2026-06-20: VK connected accounts profile UI частично закрывает Gate 2 —
> `vk.html` показывает Email/VK/Telegram через protected `/auth/identities` и
> умеет обновлять signed VK-связь через `/auth/link-vk`. Unlink/relink policy и
> production D1 cutover остаются в работе; D1 read endpoint
> `GET /v2/auth/identities` и signed D1 link foundation
> `POST /v2/auth/link-telegram` / `POST /v2/auth/link-vk` задеплоены в staging.
> D1 identity conflict challenge-record foundation тоже задеплоен в staging:
> конфликт существующей provider identity теперь возвращает `409` с
> `requiresChallenge: true` и безопасным public challenge object; automatic
> merge остаётся отключённым.
> Challenge completion route `POST /v2/auth/link-challenges/:id/complete`
> задеплоен в staging: повторно проверяет signed provider proof, помечает
> challenge `completed`, но всё ещё не выполняет automatic merge.
> Merge confirmation route `POST /v2/auth/link-challenges/:id/merge` задеплоен
> в staging: требует `confirm: true`, делает preflight по конфликтам контактов
> и AI memory, атомарно переносит D1-owned rows на canonical user и ревокает
> sessions старого user.
> VK frontend получил hidden conflict/complete/merge UI layer: если backend
> возвращает `requiresChallenge`, профиль показывает карточку подтверждения,
> умеет вызвать complete/merge endpoints и обработать merge conflicts. Live
> flow ждёт production D1/v2 auth bridge или cutover.
> Staging D1/v2 auth bridge добавлен: `POST /v2/auth/legacy-session`
> принимает уже проверенную legacy `x-token`-сессию, создаёт/находит D1 user +
> web identity и выдаёт Bearer token для v2 routes. Staging Worker version:
> `0b771399-3713-47c7-a95e-2cf09fa9d717`. Production не переключался, потому
> что `wrangler.toml` пока не содержит D1 binding.
> VK frontend подготовлен к bridge: после legacy session он может получить
> `state.d1Token` через `/v2/auth/legacy-session`, использовать Bearer token для
> `/v2/auth/link-vk` и challenge complete/merge routes, а если v2 недоступен —
> безопасно откатывается на legacy `/auth/link-vk`.
> Production D1 cutover readiness checker добавлен:
> `node scripts/check-production-d1-cutover-readiness.js`. Текущий результат
> ожидаемо `not ready`: blocker — production `wrangler.toml` ещё без D1 `DB`
> binding; warning — production provider sync flag намеренно не включён.
> Production D1 gate выполнен: создана D1 `4e-production`
> (`6107948c-6c67-4c37-baa1-efea6c5c2860`), `wrangler.toml` подключил
> `binding = "DB"`, migrations `0001`–`0005` применены, Worker production
> deployed version `fc2df9b0-2f19-4bc3-8bb3-e3f05d9a25d6`. Controlled
> legacy→D1 bridge smoke прошёл, synthetic rows очищены (`smokeUsers=0`,
> `totalUsers=0`). Provider sync flag в production всё ещё намеренно выключен.
> Defensive legacy session parsing deployed: malformed `session:*` KV values
> больше не дают Worker `1101`; staging и production smoke подтвердили `401`
> + best-effort cleanup. Production Worker version:
> `3892efae-de1a-4d0c-8bd7-822b7835894c`.
> Email Gate 0 closed: `RESEND_KEY` добавлен в production Cloudflare Worker
> Secrets, Worker использует `env.RESEND_KEY` в `sendEmail()`, production
> `/auth/forgot-password` smoke на `shelckograff@gmail.com` вернул `200`
> / `{"ok":true}` через временный KV user; временные `user:*` /
> `user_id:codex-email-smoke-*` ключи очищены. Manual inbox confirmation:
> Gmail получил reset-письма от `onboarding@resend.dev`.
> Production D1 migration status report готов:
> `backups/production-d1-migration-status-20260620-141754.report.json`.
> Решение `hold_production_import`: 83 task rows механически готовы, но 206
> legacy records остаются в quarantine, 198 conversation-owner candidates всё
> ещё blocked, `rowsToWrite = 0`, `safeToBuildImportPlanNow = false`.
> Ready-task import approval pack готов:
> `backups/production-ready-task-import-approval-20260620-142957.report.json`.
> Он не делает writes; он фиксирует узкий scope `83` ready rows и требует
> явную фразу `APPROVE_PRODUCTION_D1_IMPORT_READY_TASKS_83_ONLY`.

## Gate 0 — аварийная безопасность

- Отозвать и перевыпустить обнаруженные Anthropic/Resend credentials.
- Перенести Anthropic, Resend и Telegram Bot token в Cloudflare Secrets. Anthropic/BOT/Resend настроены; hardcoded Resend key removed, live reset-email path проверен.
- `RESEND_KEY` настроен в production Cloudflare Secrets; live reset-email path
  проверен production smoke через `/auth/forgot-password`.
- Закрыть AI proxy авторизацией, квотами и серверным allowlist моделей.
- Закрыть неавторизованные task/message/chat/reminder endpoints.
- Добавить внутреннюю подпись для запросов Telegram-бота. Production Worker HMAC deployed: `5b4624ae-b8d1-43f6-ba31-8030c60c4a50`.
- Отключить неподписанные Telegram/VK login и account linking. Telegram `initData` verification deployed: `45236ba6-3955-46ec-8c17-7268283c1308`; VK launch params verifier deployed: `0b4a6ef6-b026-4fcd-ac26-679ab236949b`; `VK_SECRET_KEY` настроен в Cloudflare Secrets; `/auth/vk` invalid/legacy payload hardening deployed: `97eddb50-0b09-4b4c-9184-d802a65aaa30`; valid VK Mini App login ждёт ручной smoke-test из VK.
- Проверять подпись payment webhook.
- Ограничить CORS известными origins. Production CORS allowlist deployed: `ab72b8fa-1a70-4c63-9033-152c35923052`.
- Сделать snapshot текущего KV перед миграциями.
- Production KV snapshot сделан с DPAPI-шифрованием и проверкой количества ключей; transform dry-run показал миграционные конфликты legacy tasks, которые нужно нормализовать до production D1 import.
- Task normalization dry-run готов: из 295 legacy task records безопасно импортируемы 83, 6 exact duplicates пропускаются, 206 records остаются в quarantine до owner reconciliation.
- Encrypted task import plan для 83 importable records готов и проверен; staging D1 writes не выполнялись, потому что plan содержит production-derived task text/user ids.
- 83 verified legacy task rows applied to staging D1 after approval; staging now has 8 users and 85 tasks total, imported task metadata valid and FK check clean.
- Quarantine reconciliation report готов: 206 records в 16 buckets; 13 buckets требуют conversation/provider owner resolver, 1 global/manual review, 1 wrapped-user resolver, 1 manual owner decision.
- Conversation/provider owner resolver готов: 13 buckets / 198 records проверены, 0 можно безопасно импортировать сейчас; для всех нужен provider sync или explicit manual mapping.
- Legacy conversation mapping schema готова и применена к staging D1: `legacy_conversation_mappings` хранит только SHA-256 legacy ref hashes и пока содержит 0 rows.
- Encrypted conversation mapping seed plan готов: 13 buckets / 198 records → 14 seed refs; D1/KV writes не выполнялись.
- Local/manual conversation mapping approval tooling готов: approval template создан, no-op encrypted decision plan проверен, rowsToWrite сейчас 0.
- Telegram provider sync mapping foundation готов и feature-flagged; staging config теперь включает `ENABLE_D1_PROVIDER_SYNC = "1"`, staging Worker задеплоен (`8c781424-032e-4e4d-8588-cce888a819ba`) и прошёл dry-run + HTTP/read-only D1 smoke. Staging `BOT_API_TOKEN` secret настроен, no-write HMAC smoke прошёл. Controlled full staging provider-sync smoke прошёл на synthetic data: before cleanup mappings 2, after cleanup D1/KV synthetic state 0. Staging-safe approved mappings report и quarantine unlock planner готовы и privacy-verified. Persistent synthetic mapping создан: approvedProviderSyncMappings = 2, но seed match = 0, quarantine unlock = 0, blocked candidate records = 198. Изолированный synthetic positive branch подтвердил `ready_for_encrypted_full_hash_join`, но `safeToBuildImportPlanNow = false`. Encrypted full-hash join planner с DPAPI artifacts готов и privacy-verified: staging approved rows = 2, full-hash matches = 0, candidateRecordsStillBlocked = 198. Synthetic encrypted task import dry-run fixture готов: 3 synthetic rows проходят existing encrypted import verifier и SQLite/D1-shape validator, staging apply guard блокирует synthetic metadata. Production flag не включён.
- Production D1 migration status report готов и privacy-verified:
  `hold_production_import`, blockers `5`, importable task rows `83`,
  quarantined records `206`, candidateRecordsStillBlocked `198`. Production D1
  writes остаются выключенными до explicit quarantine/owner policy.
- Ready-task import approval pack готов и privacy-verified:
  `approval_required_ready_83_only`, production D1 read-only counts `0/0/0/0`,
  excluded quarantined records `206`. Следующий write-step требует отдельной
  явной approval-фразы.

Критерий выхода: внешний клиент не может читать/менять чужие данные, создавать identity по произвольному provider ID или расходовать AI-ключ без валидной сессии.

## Gate 1 — инженерный фундамент

- Определить один монорепозиторий и удалить дубли только после сравнения.
- Перевести Worker и bot на TypeScript.
- Разделить routes, services, repositories и provider adapters.
- Создать D1 production/staging и миграции. Staging и начальная миграция готовы; production создаётся после проверки миграции KV.
- Ввести D1 repositories. Первый auth repository для users/identities/sessions готов, проверен и подключён к staging routes.
- Staging `/v2/auth/*` подключены к D1 и прошли edge smoke-test. Production web-auth не переключается до snapshot KV и решения по password hashing/managed auth.
- Staging `/v2/auth/legacy-session` даёт безопасный bridge из legacy KV session в D1 Bearer session; production cutover ждёт production D1 binding и отдельный migration/smoke gate.
- Production D1 cutover readiness checker готов; после подключения `DB` blocker снят, остался только намеренный warning по disabled provider sync flag.
- Staging `/v2/tasks` подключен к D1 через repository/service/routes, прошёл local route tests и edge smoke-test; старые production KV `/tasks` не переключены.
- Добавить schema validation входных данных.
- Добавить structured logs и Cloudflare observability.
- Добавить CI: lint, typecheck, unit, Worker integration tests, secret scan.

Критерий выхода: новая среда поднимается из Git + migrations без ручной правки bundle.

## Gate 2 — users и unified identity

- Реализовать `users` + `auth_identities` + sessions.
- Безопасный Web login/logout/reset и revoke sessions.
- Проверяемый Telegram Mini App login.
- Проверяемый VK Mini App login. VK/email “Нет соединения” hotfix deployed:
  Worker CORS now allows `https://app.vk.com` and `https://*.vk-apps.com`;
  frontend `index.html`/`vk.html` now read launch params from search/hash/VK Bridge;
  GitHub Pages commit `d157bd982f155ddaa52baf7dd0f98a47dfa54da8`. Follow-up
  login hardening deployed: Worker legacy password verifier no longer throws
  (`a1075c52-a9a5-43eb-b50f-3cf2536ae78e`), frontend login/register/VK bridge
  calls now use timeouts and safe JSON parsing, GitHub Pages commit
  `34722335a56bf5831ec1d2dc038fd05a7bafbed4`. Actual app URL
  `https://vk.ru/app54636698` redirects to `https://m.vk.ru/app54636698`;
  Worker now also allows `https://vk.ru`, `https://m.vk.ru`,
  `https://app.vk.ru`, production deploy
  `95dcb053-0dfb-48f6-91b4-465ed2a5b766`. Mobile WebView follow-up:
  Worker CORS now allows `X-Requested-With`, `/auth/register` uses safe JSON
  parsing, production deploy `c2f597c9-8828-4f4e-994f-e0a243fd2da5`. Frontend
  follow-up for false mobile “Ошибка соединения” after successful token:
  `vk.html` separates network auth errors from post-login UI init, publish commit
  `4792e2b`. VK docs check confirmed launch params flow is correct; email login
  timeout increased and VK chat task commands now persist to `/tasks`, publish
  commit `5120a36`. Legacy Gate 2 bridge deployed: Worker `POST /auth/link-vk`
  verifies signed VK launch params and links VK ID to current email session,
  `/auth/vk` now reuses existing VK→email mapping, and copy-only merge pulls old
  VK/TG legacy buckets into the current user; production Worker version
  `233ba462-ffb4-467d-8a9e-f04b01df9f41`. VK frontend commit `16e4ef3` calls
  `linkCurrentVK()` after email auth and accepts both legacy `/tasks` array and
  `{ tasks: [...] }` response shapes.
- Challenge flow для привязки и merge аккаунтов. Частично закрыто legacy bridge
  для signed VK/TG contexts; staging D1/v2 bridge из legacy session в Bearer
  token готов; VK frontend умеет использовать этот Bearer token для v2 link и
  challenge routes с legacy fallback; production D1 binding/cutover, full live
  VK flow и unlink UI остаются.
- Миграция существующих Web/TG/VK пользователей из KV.
- Экран подключенных аккаунтов и удаление связи.

Критерий выхода: один пользователь видит одинаковые данные после входа через любой связанный интерфейс.

## Gate 3 — задачи, история и уведомления

- Перенести tasks/messages/chats/reminders в D1.
- D1 task MVP готов в staging: create/list/get/patch, Bearer auth, ownership isolation, metadata limit, status/priority validation.
- KV→D1 task normalization report готов; следующий шаг — staging insert plan для importable tasks и quarantine reconciliation для unresolved buckets.
- Encrypted import plan прошёл локальный SQLite/D1-shape validator и был применён к staging D1 после approval. Quarantine + conversation owner resolver + mapping schema + seed plan + approval tooling + Telegram provider sync foundation готовы; provider sync включён только в staging и задеплоен, no-write HMAC smoke и controlled full provider-sync smoke прошли. Staging-safe approved mappings report + unlock planner готовы; persistent synthetic mapping проверил safety branch: approved rows есть, но seed refs не совпали, поэтому разблокировано 0 из 14 seed refs / 198 candidate records. Synthetic positive branch проверил `ready_for_encrypted_full_hash_join`. Encrypted full-hash join planner с DPAPI artifacts и sanitized output готов; текущие approved full hashes не совпали с seed full hashes, поэтому real encrypted task import dry-run всё ещё заблокирован. Полностью synthetic encrypted task import dry-run fixture готов и прошёл existing validators + SQLite/D1-shape validation без D1/KV writes.
- Пагинация истории и idempotency provider message IDs: D1 `message-repository`
  готов и проверен локально на synthetic SQLite/D1-shape — idempotent provider
  ingest, cursor pagination, ownership isolation, soft-delete default. Thin
  `GET /v2/messages` route/service готов локально: Bearer auth, cursor
  pagination, ownership isolation, no public provider ids/metadata. Controlled
  local Worker entrypoint smoke готов: real `worker.fetch(...)`, synthetic
  D1 fixture, CORS/no-store, pagination, ownership isolation, soft-delete,
  DB-unavailable `503`. Следующий шаг — provider ingest path behind
  staging-only feature flag или staging-only D1 message fixture после отдельного
  approval на staging writes.
- R2 для voice/media.
- Cron/Queue вместо таймеров постоянно работающего bot-процесса.
- Миграция данных KV с проверкой количества и выборочным checksum.
- Период dual-read/dual-write и безопасный rollback.

Критерий выхода: перезапуск любого процесса не теряет pending state, сообщения или напоминания.

## Gate 4 — реальный Messenger Hub

- Удалить production demo fallback.
- Реализовать Telegram provider adapter end-to-end.
- Проверять принадлежность каждого conversation пользователю.
- Отправка, sync cursor, retries, rate limits и delivery errors.
- Подключить VK community messages вторым adapter-ом.
- Остальные provider tabs показывать честно как недоступные до интеграции.

Критерий выхода: список чатов и сообщения получены из provider API, а не из mock; отправка и ошибки отражаются в UI.

## Gate 5 — AI memory MVP

- История AI/chat хранится построчно и пагинируется.
- Queue создает summaries и structured memories.
- Context builder имеет жесткий token budget.
- Пользователь видит и редактирует память.
- Consent, retention, export/delete и журнал действий.
- Privacy controls foundation готов локально: D1 migration `0006_privacy_controls.sql`,
  repository `privacy-repository.mjs` и synthetic verifier покрывают user privacy
  settings, consent grant/revoke history и data subject requests. Production D1
  не менялся.
- `/v2/privacy` routes готовы локально: settings, consent events и data subject
  requests доступны через Bearer-auth API; route verifier и Worker entrypoint
  smoke прошли. Remote migration/deploy не выполнялись; следующий шаг — UI
  “Данные и память” или staging/deploy gate для migration `0006`.
- Frontend privacy center готов локально в `4e-app/index.html`: профиль получил
  экран “Данные и память”, D1 session bridge через `/v2/auth/legacy-session`,
  controls для AI/messenger permissions, retention, consent и export/delete
  requests. Static verifier и backend regressions прошли. Frontend publish и
  production deploy не выполнялись.
- Staging privacy gate закрыт: migration `0006_privacy_controls.sql` применена
  к `4e-staging`, Worker `restless-lab-d737-staging` задеплоен как
  `1a89a880-069d-4d74-835b-94831831ac33`, live smoke
  `scripts/smoke-staging-v2-privacy.ps1` подтвердил `/v2/privacy` settings,
  consent и data subject request на synthetic data; cleanup verified `0`.
  Production D1/Worker и GitHub Pages на этом шаге не трогались.
- Production privacy gate закрыт: migration `0006_privacy_controls.sql`
  применена к `4e-production`, Worker `restless-lab-d737` задеплоен как
  `83a5df15-41cc-4edb-b8f9-0d455ac09236`, live smoke
  `scripts/smoke-production-v2-privacy.ps1` подтвердил `/v2/privacy`
  settings, consent и data subject request на synthetic data; final cleanup
  verified `users/sessions/settings/consents/dataRequests = 0`, pending
  migrations отсутствуют.
- Frontend privacy center опубликован на GitHub Pages:
  commit `1bdcb76` (`feat: publish privacy center`) в `mrktggod/4e-app`.
  Raw GitHub и live Pages readback подтвердили markers `privacy-center`,
  `syncD1AuthSession` и `/v2/privacy/settings`. Нужен ручной Web/VK smoke
  пользовательского flow.
- VK mobile auth hotfix опубликован на GitHub Pages:
  commit `d38d0bd` (`fix: retry VK auth requests`) в `mrktggod/4e-app`.
  `vk.html` получил hidden retry для email login, `cache: 'no-store'` для auth fetch
  и recovery login после register timeout. Raw GitHub и live Pages readback подтвердили
  markers `fetchAuthWithRetry`, `cache: 'no-store'` и legacy auth calls. Нужен ручной
  mobile VK smoke одним тапом после полного закрытия/открытия VK app.
- VK mobile auth follow-up после неуспешного ручного smoke опубликован:
  commit `0be7711` (`fix: use simple CORS for VK auth`) в `mrktggod/4e-app`.
  Legacy email auth в `vk.html` теперь использует `Content-Type: text/plain`, чтобы убрать
  CORS preflight в мобильном VK WebView; добавлены build marker
  `vk-auth-simple-cors-20260620-2` и кнопка “Проверить связь”. Если manual smoke всё ещё
  не пройдёт, diagnostics line должна показать, блокируется ли `workers.dev` целиком.
- VK mobile diagnostics подтвердил `workers.dev` timeout в реальном VK WebView:
  добавлен production Worker custom domain `edge.4-ai.site`, при этом старый
  `workers.dev` явно сохранён через `workers_dev = true`. `vk.html` опубликован
  commit `c8acb96` (`fix: use edge domain for VK API`) + follow-up `3d61b57`
  (`fix: tune VK edge auth timeout`) и теперь использует `https://edge.4-ai.site`
  с marker `vk-auth-edge-domain-20260620-4`.
  Follow-up `ac7fe3c` (`fix: speed up VK auth screen`) опубликован: `vk.html`
  больше не ждёт `window.load`/`VKWebAppInit`/`auth/me` перед показом формы,
  `vk-bridge` грузится async, сохранённая сессия проверяется с коротким timeout,
  а VK auto-login уходит в background. Новый marker:
  `vk-auth-fast-boot-20260620-5`.
  Follow-up `54a17bf` (`fix: recover VK email login`) опубликован после
  real-device smoke “первый клик ошибка, второй клик входит”: login flow теперь
  после dropped/TypeError ответа сам делает короткий `recoverLoginSession()`
  через `/auth/login` и не требует второго ручного нажатия. Новый marker:
  `vk-auth-login-recovery-20260620-6`.
  Follow-up `ba3b345` (`fix: warm VK auth connection`) опубликован после
  повторного real-device smoke: если первый клик происходит раньше прогрева
  WebView/API, `vk.html` теперь запускает background `warmAuthConnection('boot')`
  и перед первым manual login ждёт короткий `warmAuthConnection('login')`.
  Новый marker: `vk-auth-warmup-20260620-7`.
  Нужен ручной smoke: форма входа должна появиться быстро; “Проверить связь”
  всё ещё должен показать быстрый `ping` и `auth`, затем email login.
- Метрики: стоимость на active user, latency, retrieval hit rate, corrections/deletions.

Критерий выхода: AI использует релевантную прошлую информацию, может показать источник памяти и забывает данные по команде пользователя.

## Gate 6 — редизайн и release candidate

- Зафиксировать visual brief и ключевые user journeys.
- Пересобрать frontend из компонентов, а не одного HTML-файла.
- 2026-06-20: interim redesign polish опубликован в GitHub Pages (`f3dc86a`) — light theme home background, guarded VK host theme, task tab `Обсудить задачу`. Это улучшает текущий UI, но не закрывает компонентную пересборку.
- 2026-06-20: VK runtime redesign route fix опубликован (`af531ee`) — выяснено, что VK Mini App грузит `vk.html`; в `vk.html` добавлены home redesign, task detail, `Обсудить задачу` и theme toggle без изменения auth/identity endpoints. Это закрывает текущий VK visual/runtime баг, но не закрывает долг унификации frontend.
- Полные состояния: loading, empty, disconnected, permission denied, expired auth, sync error, offline.
- Accessibility и responsive QA для Web, Telegram и VK webviews.
- E2E: регистрация, link/merge, task from message, reminder, inbox, AI memory, export/delete.
- Staging beta, feature flags, support/feedback и rollback plan.

Критерий выхода: каждый обещанный beta-сценарий имеет тест, наблюдаемость и понятное ошибочное состояние.

## Что сознательно не входит в первый beta scope

- Одновременный запуск всех шести мессенджеров.
- Скрытое обучение отдельной модели на личных сообщениях пользователя.
- Vector database до измерения качества D1/FTS retrieval.
- Реальные платежи до подписанного webhook и надежного entitlement ledger.
- «Биометрическая защита» без полноценной серверной WebAuthn реализации.
