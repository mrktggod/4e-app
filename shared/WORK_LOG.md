# WORK LOG — Командный журнал задач

> Сюда пишут все участники команды после завершения задачи.  
> Формат: дата — агент — что сделано — статус.  
> Детальный технический лог: `../DEVELOPMENT_LOG.md`

---

### 2026-07-14 — Codex

**Задача:** Staging auth fix + `/auth/telegram` 1101 на staging
**Результат:** По staging auth добрана реальная причина, а не «сеть»: preflight до staging worker с `Origin: https://4-ai-staging.pages.dev` возвращает `204` и корректный `Access-Control-Allow-Origin`, значит это не CORS. Дальше по живым staging assets подтверждено, что старый alias `4-ai-staging.pages.dev` действительно держал auth-shell в ложном `Нет соединения` из-за client-side crash после успешного ответа: профильный рендер в старом `index.html` вызывал голый `buildReferralLink()` и падал уже после `200 /auth/register|login`. После этого отдельно вскрыт более глубокий слой: `scripts/auth.js` экспортировал только `auth*`-алиасы, а `index.html` и `scripts/auth-handlers.js` звали часть helper-ов как обычные глобали (`processOAuthCallback`, `capturePendingReferralCode`, `getTelegramStartTokenFromLaunch`, `isVkMiniAppContext`, `getPendingReferralCode`, `clearPendingReferralCode`). В app-код внесены оба страховочных фикса: `renderExtendedProfile()` переведён на локальный `getProfileReferralLink()` без жёсткой зависимости от внешней глобали, а `scripts/auth.js` теперь явно экспортирует этот полный helper-набор в `window.*`. Для staging собран fresh Pages artifact и дважды опубликован в `4-ai-staging`; alias `https://4-ai-staging.pages.dev/scripts/auth.js` уже отдаёт `200 application/javascript` и содержит новые exports. При этом встроенный browser smoke Codex после deploy всё ещё видит старое runtime-состояние и те же `ReferenceError`, поэтому `BUG-2026-07-14-001` честно оставлен не как Done, а как `In Progress / нужен fresh-browser QA` — похоже на edge/browser cache propagation, а не на оставшийся backend-bug.

По `/auth/telegram` staging tail дал точный stack trace: проблема сидела не в самом simple Telegram signup, а в merge-ветке «существующий web-account + существующий Telegram-account». `POST /auth/telegram` падал Cloudflare `1101` из-за `ReferenceError: isPaidUser is not defined` в `betterAccountByPlanOrTrial()` -> `mergeAccounts()` -> `handleTelegramAuth()`. В `4e-worker/worker.js` добавлен узкий helper `isPaidUser(user) { return user.plan === "paid"; }`, после чего staging worker задеплоен как version `d98c7ca9-1300-4e2a-81eb-1ad6a5ced167`. Повторный live smoke после deploy подтвердил исправление напрямую: fresh web-user + `POST /auth/telegram` с уже существующим Telegram ID теперь возвращает `200`, `accountMerged: true`, а `wrangler tail --env staging` показывает `POST /auth/telegram - Ok` без exception.

**Коммит:** pending
**Статус:** ⚠️ mixed — worker bug закрыт до Ready for QA, staging app auth-код и alias обновлены, но для `BUG-2026-07-14-001` нужен ручной fresh-browser smoke после cache propagation
**Следующий шаг:** закоммитить оба репо, запушить, затем Юрию проверить в обычном чистом браузере `https://4-ai-staging.pages.dev/`: открывается ли login/register без `ReferenceError` и уходит ли web-auth на home после успешного ответа

---

### 2026-07-15 — Codex

**Задача:** BACK-034 staging contour closeout
**Результат:** Проверен live staging contour без production/main: direct Pages `https://88193776.4-ai-staging.pages.dev` отдаёт 200 и содержит `restless-lab-d737-staging.shelckograff.workers.dev`, alias `https://4-ai-staging.pages.dev/` сейчас тоже смотрит в staging worker, staging worker root возвращает `200 OK`. Это закрывает техническую часть staging Pages + staging worker + alias/current deploy routing.
**Коммит:** pending
**Статус:** BACK-034 Done
**Следующий шаг:** для будущих QA по-прежнему предпочтителен прямой fresh deploy URL, потому что alias исторически мог отставать.

---

### 2026-07-15 — Codex

**Задача:** Close HOME-covered legacy NEW issues
**Результат:** На `https://88193776.4-ai-staging.pages.dev` fresh staging user с 3 задачами подтвердил, что старые home-проблемы, покрытые `HOME-001`, больше не воспроизводятся: `NEW-010` — на главном экране нет старых кнопок `Завершить`, вместо них top-3 priority rows; `NEW-011` — home разбит на focus, 4 metric cards и отдельные readable rows шириной 324px; `NEW-013` — focus copy короткий: `3 задачи требуют внимания` + короткая подпись.
**Коммит:** pending
**Статус:** Done для `NEW-010/011/013`
**Следующий шаг:** `HOME-001` как общий редизайн всё ещё можно оставить Ready for QA до ручного visual pass в обеих темах.

---

### 2026-07-15 — Codex

**Задача:** Remaining NEW UI smoke + fixes for completed stats and focus overlap
**Результат:** На fresh staging user прогнан пакет `NEW-003/004/005/007/012/016` против `https://44ccd355.4-ai-staging.pages.dev`. `NEW-003`, `NEW-004`, `NEW-005` и `NEW-007` прошли без кодовых изменений. Два хвоста оказались реальными: completed task не появлялась в statistics/history, потому что `loadTasks()` сохранял в `allTasksCache` только active-задачи; focus-card всё ещё геометрически пересекался с декоративным блоком. В `index.html` исправлено: `allTasksCache=tasks||[]`, текстовый слой focus-card поднят на `z-index:2`, декоративный слой опущен на `z-index:0`, padding-right увеличен до `144px`. Fresh Pages deploy `https://88193776.4-ai-staging.pages.dev` подтвердил оба фикса: done task видна в `#stats-done-list`, `doneInCache=1`, focus contentRight=209 до decorLeft=237.
**Коммит:** pending
**Статус:** Done для `NEW-003/004/005/007/012/016`
**Следующий шаг:** продолжать по оставшимся Ready for QA/Todo без ручных действий; `HOME-001` и `BACK-056` всё ещё требуют отдельного ручного/визуального или time-mocked QA.

---

### 2026-07-15 — Codex

**Задача:** Fresh staging deploy + headless smoke по Ready for QA UI-пунктам
**Результат:** Найдено, что текущий код уже содержит auth-fix для `buildReferralLink`, но прежний direct Pages deployment `https://c4b8195f.4-ai-staging.pages.dev` всё ещё отдавал старый runtime и падал после успешного `/auth/me`. Выполнен fresh deploy Cloudflare Pages project `4-ai-staging` на `https://44ccd355.4-ai-staging.pages.dev`. После deploy headless browser smoke с новым staging user и seeded real tasks подтвердил: auth shell открывает `home`, `HOME-001` базово рендерит top-3/focus, `NEW-014` focus overlay открывается, `NEW-015` meta строка содержит направление/дату/дедлайн, `NEW-002` statistics и active CTA работают, `NEW-009` ask quick actions видимы и wired, `NEW-021` calendar default `Все дедлайны` заполнен без выбора дня. Для `BACK-056` подтверждён только обычный smoke без harsh copy; after-22 сценарий оставлен Ready for QA.
**Коммит:** pending
**Статус:** Done для `NEW-002/009/014/015/021`; `HOME-001` и `BACK-056` остаются Ready for QA с уточнённым остатком
**Следующий шаг:** ручной визуальный QA `HOME-001` в светлой/тёмной теме и after-22/time-mocked QA для `BACK-056`.

**ONBOARD-001 follow-up:** Fresh empty-account smoke on `https://44ccd355.4-ai-staging.pages.dev` confirmed guided-card `Первый AI-план за 60 секунд`, 3 steps, quick-add overlay, AI-chat CTA and voice CTA. Backlog moved to Done.

---

### 2026-07-14 — Codex

**Задача:** Automated QA smoke по Ready for QA против staging
**Результат:** Бриф `codex-session-2026-07-14-automated-qa-and-bot-live.md` начат с headless/API smoke по staging. Подтверждено, что staging-страница `https://4-ai-staging.pages.dev/` реально смотрит в `https://restless-lab-d737-staging.shelckograff.workers.dev`. Красный главный blocker: web auth-shell на staging после intro показывает `Нет соединения` и на регистрации, и на входе, хотя прямой API для тех же credentials отвечает `200` и отдаёт token. Поэтому UI smoke для `ONBOARD-001`, `HOME-001`, `NEW-002/003/004/005/007/014/015/016` честно не закрыт. При этом backend-path staging частично зелёный: fresh account проходит `/auth/register`, `/auth/login`, `/auth/me` и получает `entitlement.status=active`; create/update/done task проходят; `/anthropic` отвечает `200`; `/transcribe` без файла даёт ожидаемый `400`; paid dev-account `dev1.4e@example.com` логинится и отдаёт активный paid entitlement + seed tasks. Отдельные реальные находки заведены в `pm/bugs.md`: `BUG-2026-07-14-001` (staging auth-shell), `BUG-2026-07-14-002` (`/analytics/lite-event` -> `404`), `BUG-2026-07-14-003` (`/auth/telegram` -> Cloudflare 1101).
**Коммит:** pending
**Статус:** ⚠️ partial / smoke дал смешанный результат, staging не зелёный
**Следующий шаг:** отдельно завершить bot-live часть, затем зафиксировать pass/fail таблицу и blockers без ретуши

---

### 2026-07-14 — Codex

**Задача:** Живой bot/runtime smoke после установки `BOT_TOKEN` в Cloudflare
**Результат:** Production/staging Cloudflare secret сам по себе не разблокировал локальный bot runtime: `npm run start` в `4e-worker` по-прежнему сразу падает с `❌ BOT_TOKEN не задан`, потому что локальному Node-процессу токен не передан через env. Отдельно staging telegram-link path тоже не зелёный: `POST /auth/telegram` после успешного login воспроизводимо возвращает Cloudflare `1101 Worker threw exception`. Из-за этой пары факторов реальную доставку сообщения через живого бота в эту сессию честно не удалось подтвердить.
**Коммит:** pending
**Статус:** ⚠️ fail / blocked реальным env-gap + worker exception
**Следующий шаг:** для локального runtime нужен отдельный local env с `BOT_TOKEN`; для staging bot/auth smoke сначала починить `BUG-2026-07-14-003`

---

### 2026-07-14 — Codex

**Задача:** Карантин CAL-001/CAL-002 из платежной ветки
**Результат:** По решению Юрия CAL-коммиты `38b4d77` и `602fab9` вынесены в отдельную ветку `feat/cal-002-slice` без потери кода. На `feat/admin-tariff-api` выполнены revert-коммиты `99d1bd6` и `bb6a9e2`, строки `CAL-001` и `CAL-002` в `pm/backlog.md` и `shared/ROADMAP.md` возвращены к состоянию `Todo`, чтобы платежная/security-ветка снова соответствовала своему скоупу.
**Коммит:** pending
**Статус:** ✅ выполнено
**Следующий шаг:** выполнить исходный бриф `codex-session-2026-07-14-automated-qa-and-bot-live.md` без выхода за скоуп

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-11 — Codex

**Задача:** INFRA-005 — создать Yandex API Gateway и подготовить VK hosting к RU API base
**Результат:** Через `yc` создан Yandex API Gateway `ai-ru-proxy` в folder `b1gsug9tik07tshenega`, домен `https://d5dg7uthvqp4ebomg3rl.ccx97b51.apigw.yandexcloud.net`, upstream остаётся `https://edge.4-ai.site`. `npm run build:vk-hosting` успешно собирает `.vk-hosting-dist/index.html` с новым `VK_API_BASE_URL`. Сохранённый VK token найден в configstore, `vk-miniapps-deploy` загрузил version `1783760421`; dev URLs обновлены на `https://stage-app54636698-6d0441567e74.pages.vk-apps.com/index.html`. Production deploy остановился на ручном подтверждении VK: `Please, enter code from Administration`.
**Коммит:** N/A
**Статус:** ⚠️ gateway создан, dev hosting обновлён, production VK deploy ждёт confirm code
**Следующий шаг:** ввести VK confirm code из Administration, завершить production VK deploy и пройти phone-smoke VK Mini App без VPN

### 2026-07-12 — Codex

**Задача:** NEW-006 — Safe Area: нижняя навигация Telegram Mini Apps не должна перекрывать контент
**Результат:** В LESS и собранном `styles.min.css` добавлены общие переменные `--safe-area-top`, `--safe-area-bottom`, `--app-bottom-nav-reserve`; нижняя навигация (`.bottom-nav`, `.bottom-nav-v2`) теперь учитывает `env(safe-area-inset-bottom)`, а базовые scroll-контейнеры (`.scroll-body`, `.sub-scroll`, `.profile-scroll`, `.notif-scroll`, `.ask-bar`) получили reserve под панель + safe-area. Headless mobile smoke на `390x844` после пересборки CSS: forced-screen `profile` с прокруткой до низа показывает последний action `Выйти` выше `#global-nav` (`lastBottom=732.18`, `navTop=764`), empty `notifications` остаётся чистым и не заезжает под nav. Отдельный keyboard-overlap для AI-чата оставлен на `NEW-008`.
**Коммит:** `pending`
**Статус:** ✅ safe-area слой подготовлен, baseline smoke зелёный
**Следующий шаг:** перейти к `NEW-008` и разрулить keyboard / input overlap у AI-чата

### 2026-07-12 — Codex

**Задача:** синхронизировать `feat/admin-tariff-api` с `origin/main` без merge в `main`
**Результат:** Ветка подтянута merge-коммитом `a3c9ea1`. Разрулены конфликты в `AGENTS.md`, `FILE_MAP.md`, `pm/backlog.md`, `pm/bugs.md`, `pm/qa-checklist.md`, `pm/team-sync.md`, `shared/ROADMAP.md`, `shared/WORK_LOG.md`: process-протокол и новые task/docs-файлы из `main` сохранены, более свежие статусы и локальные записи ветки не потеряны. В backlog/roadmap добавлены `BACK-055`, `BACK-056`, `CAL-001/002/003`, `OMNI-001`, `ONBOARD-001`, `BETA-001`, `ANALYTICS-001`, `FEEDBACK-001`; в репо пришли `docs/team-sync-protocol.md`, `pm/next-actions.md` и связанные task-доки/asset-файлы.
**Коммит:** `a3c9ea1`
**Статус:** ✅ ветка синхронизирована с `main`, push выполнен
**Следующий шаг:** перейти к `NEW-006` и затем `NEW-008` на мобильном Telegram safe-area / keyboard overlap

### 2026-07-08 — Codex

**Задача:** пересобрать roadmap по фильтрам beta gate, личного штаба дня и монетизации
**Результат:** `shared/ROADMAP.md`, `pm/backlog.md`, `pm/next-actions.md`, `pm/bugs.md` и `pm/qa-checklist.md` синхронизированы по схеме Now / Next / Later / Future / Icebox. Убрана коллизия `BACK-036`: Telegram fallback остался `BACK-036`, архитектурный распил получил `ARCH-001`. Добавлены `BACK-056`, `BETA-001`, `ANALYTICS-001`, `FEEDBACK-001`, `ONBOARD-001`; `BACK-055` поднят до P1. Подготовлен отчёт Юре `pm/agent-inbox/codex-to-yuri-2026-07-08-roadmap-filters-monetization.md`.
**Коммит:** N/A
**Статус:** ✅ выполнено
**Следующий шаг:** Юре проверить отчёт и двигать Now-задачи: `BACK-055`, `BACK-048`, `BACK-036/BACK-041`, `BACK-056`, затем закрытый тест `BETA-001`.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-08 — Codex

**Задача:** добавить в roadmap будущий календарный слой и омниканальные поверхности 4
**Результат:** В `shared/ROADMAP.md` зафиксировано позиционирование 4 как омниканального личного штаба дня и поднятие календаря в ближайшую продуктовую проработку. В `pm/backlog.md` добавлены `CAL-001`, `CAL-002`, `CAL-003`, `OMNI-001`. Созданы документы `docs/tasks/CAL-001-calendar-concept.md`, `docs/tasks/OMNI-001-omnichannel-surfaces.md` и письмо на согласование `pm/agent-inbox/codex-to-team-2026-07-08-omnichannel-calendar-roadmap.md`.
**Коммит:** N/A
**Статус:** ✅ задача оформлена
**Следующий шаг:** Отправить письмо Юрию/Claude, согласовать первый календарный провайдер, privacy-границы и момент старта CAL-002.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-08 — Codex

**Задача:** составить ТЗ для SMART-013 — AI-декомпозиция задачи на этапы
**Результат:** Создано ТЗ `docs/tasks/SMART-013-ai-task-decomposition.md`; добавлен PNG-reference `docs/tasks/assets/SMART-013-ai-task-decomposition-mockup.png`; `SMART-013` в `pm/backlog.md` переведён в `Triaged`; в `docs/ЗАДАЧИ_УМНЫЙ_АССИСТЕНТ.md` добавлена ссылка на ТЗ и зафиксировано решение MVP: AI предлагает preview этапов, пользователь подтверждает, этапы сохраняются как обычный `checklist` без новой сущности подзадач.
**Коммит:** `docs(ai): add smart 013 decomposition spec`
**Статус:** ✅ задача оформлена
**Следующий шаг:** После закрытия ближайших beta/QA-блокеров взять реализацию в ветке `feat/smart-013-task-decomposition` или передать Юре это ТЗ.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-08 — Codex

**Задача:** подготовить ТЗ для Юрия по уведомлениям как ленте внимания
**Результат:** Добавлена задача `BACK-055` в `pm/backlog.md`, создано ТЗ `docs/tasks/BACK-055-notifications-action-cards.md`, сохранён visual reference `docs/tasks/assets/BACK-055-notifications-action-cards-wireframe.svg`, обновлены roadmap и QA-чеклист. Зафиксировано решение: делать MVP карточек уведомлений с действиями `К задаче / Готово / Отложить`, а AI-декомпозицию, историю и умное отложение оставить будущим слоем.
**Коммит:** N/A
**Статус:** ✅ задача оформлена
**Следующий шаг:** Юрий делает реализацию в ветке `feat/notifications-action-cards` и возвращает скрины/видео пустого состояния, карточки `Горит`, раскрытого `Отложить` и перехода `К задаче`.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-08 — Codex

**Задача:** уточнить Team Sync под рабочий процесс Юры через Claude, без GitHub Desktop
**Результат:** В `docs/team-sync-protocol.md`, `pm/team-sync.md`, `docs/git-team-rules.md`, `CLAUDE.md`, `COWORK_INSTRUCTIONS.md` и `AGENTS.md` закреплено, что Юра управляет Git через Claude. Добавлена простая стартовая фраза для безопасного обновления проекта: Claude проверяет ветку, `git status`, делает `git fetch origin` и останавливается при риске конфликта или потери незакоммиченных изменений.
**Коммит:** `docs(process): clarify yuri git via claude`
**Статус:** ✅ выполнено
**Следующий шаг:** Запушить ветку `docs/team-sync-yuri-claude-git` и принять поправку в `main`.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-08 — Codex

**Задача:** закрепить простой team-sync процесс для Алексея, Юрия, Codex и Claude
**Результат:** Добавлены `docs/team-sync-protocol.md` и `pm/team-sync.md`, а также ссылки в `AGENTS.md`, `CLAUDE.md`, `COWORK_INSTRUCTIONS.md` и `docs/git-team-rules.md`. Зафиксированы ключевые фразы `Что там у Лехи?`, `Что там у Юры?`, `Закрой задачу и синхронизируй`; правило commit/push после завершения задачи; запрет автоматического merge в `main`.
**Коммит:** `docs(process): add team sync protocol`
**Статус:** ✅ выполнено
**Следующий шаг:** Запушить ветку `docs/team-sync-protocol`, передать Юре инструкцию и попросить его Claude принять правила из репозитория.

### 2026-07-08 — Codex

**Задача:** Закрыть процессный долг сессии (шаг 0): зафиксировать статус и обновить гигиену сессии.
**Результат:** За 2026-07-08 добавлена запись с итогом по BACK-035/BACK-048, voice/reminders, откату кодировки `52ce8be`, серии `ARCH-001`, а также регистрации `NEW-001..017` в backlog. Обновлён `pm/team-sync.md` (`feat/admin-tariff-api`), `AGENTS.md` (правило кодировки для каждой коммит-сессии) и `scripts/check-ui-architecture.sh` с грубой проверкой `Войти`, `Задачи`, `Сегодня` + детектором `Р[а-яЁё]{2,}`.
**Коммит:** `pending`
**Статус:** ✅ выполнено
**Следующий шаг:** перехожу к задаче 1 (NEW-006/008/001/017).

### 2026-07-07 — Codex

**Задача:** BACK-055 — вынести password-toggle helpers из `index.html`
**Результат:** Общий helper переключения видимости пароля перенесён в `scripts/platform-adapter.js` как `togglePasswordVisibility()`. В `index.html` функции `togglePass()` и `togglePassField()` оставлены как совместимые обёртки для login/reset/privacy экранов, без изменения UI-сценариев.
**Коммит:** `7f5f071`
**Статус:** ✅ маленький шаг распила готов, `BACK-055` остаётся `In Progress`

**Задача:** BACK-055 — вынести Enter-submit helper из `index.html`
**Результат:** Общая проверка Enter-нажатия по input вынесена в `scripts/platform-adapter.js` как `shouldHandleEnterSubmit()`. В `index.html` `submitLoginOnEnter()` остался совместимой обёрткой, а login/register/forgot/reset keydown-ветки теперь используют единый helper без изменения submit-сценариев.
**Коммит:** `0b3e516`
**Статус:** ✅ маленький шаг распила готов, `BACK-055` остаётся `In Progress`

**Задача:** BACK-030 — structured assignee в detail-flow
**Результат:** `openDetailPersonPicker()` и `saveTaskEdits()` теперь сохраняют structured assignee (`@username` / `ID 123456`) отдельно от видимого имени. Detail-карточка показывает бейдж «пользователь 4», если задача реально привязана к аккаунту, а обычное сохранение больше не теряет `assigneeTgId` у уже связанных задач.
**Коммит:** `pending`
**Статус:** ✅ кодовый шаг готов, `BACK-030` остаётся `In Progress` до живого smoke

**Задача:** BACK-055 — вынести email-validator из `index.html`
**Результат:** `isValidEmail()` перенесён в `scripts/platform-adapter.js`; в `index.html` оставлена совместимая обёртка для login/register/forgot/reset flow. `BACK-055` остаётся поэтапным распилом без смены статуса.
**Коммит:** `196a5c3`
**Статус:** ✅ маленький шаг распила готов, `BACK-055` остаётся `In Progress`
**Задача:** BACK-055 — вынести form-error helpers из `index.html`
**Результат:** Общие helpers для доступных ошибок форм (`setFormFieldError`, `clearFormFieldError`, `clearFormErrors`, `focusFirstInvalid`) перенесены в `scripts/platform-adapter.js`. В `index.html` остались совместимые auth-обёртки, поэтому login/register/forgot/reset продолжают использовать прежние `setAuthFieldError`, `clearAuthErrors`, `focusFirstInvalid`.
**Коммит:** `b8d360e`
**Статус:** ✅ маленький шаг распила готов, `BACK-055` остаётся `In Progress`
**Следующий шаг:** Продолжить auth-секцию или вынести следующий общий helper без изменения пользовательского сценария.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-07 — Codex

**Задача:** BACK-055 — вынести общие dialog/focus helpers из `index.html`
**Результат:** Общие helpers для dialog/bottom sheet (`getDialogFocusable`, `openAccessibleDialog`, `closeAccessibleDialog`, `handleAccessibleDialogKeydown`) перенесены в `scripts/platform-adapter.js`. В `index.html` остались совместимые обёртки, поэтому quick-add, contact panel и biometric consent продолжают использовать прежние имена, а platform layer забирает повторяемое DOM-поведение.
**Коммит:** `1c1fb8f`
**Статус:** ✅ маленький шаг распила готов, `BACK-055` остаётся `In Progress`
**Следующий шаг:** Продолжить auth-секцию или вынести следующий общий UI helper без изменения пользовательского сценария.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-07 — Codex

**Задача:** BACK-055 — вынести referral helpers из `index.html`
**Результат:** Referral helpers (`normalizeReferralCode`, чтение `ref/referral/invite`, pending referral storage и сборка referral link) перенесены в `scripts/platform-adapter.js`. В `index.html` оставлены совместимые обёртки, чтобы регистрация, Telegram/VK/OAuth login и кнопка копирования реферальной ссылки продолжили вызывать прежние имена.
**Коммит:** `38c8bfd`
**Статус:** ✅ маленький шаг распила готов, `BACK-055` остаётся `In Progress`
**Следующий шаг:** Продолжить auth-секцию или вынести следующий платформенный helper без изменения пользовательского сценария.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-07 — Codex

**Задача:** BACK-050 — accessibility baseline dialogs/focus/touch-targets, шаг 3
**Результат:** Quick-add overlay, contact panel и biometric consent получили `role="dialog"`, `aria-modal`, `aria-labelledby`/`aria-describedby`, `aria-hidden`, перенос фокуса внутрь при открытии, возврат фокуса после закрытия и общий Tab/Escape handling. Для dialog-контролов добавлен видимый `focus-visible` через LESS; декоративные SVG в biometric consent скрыты от accessibility tree. `BACK-050` переведён в `Ready for QA`, потому что code baseline закрыт, а дальше нужен ручной keyboard/mobile smoke.
**Коммит:** `b91e97b`
**Статус:** ✅ code baseline готов
**Следующий шаг:** Алексей/Юрий проходят ручной smoke: Tab/Shift+Tab/Enter/Escape на auth и dialogs, плюс mobile touch-targets на 360/375/390px.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-07 — Codex

**Задача:** BACK-050 — accessibility baseline status/toast, шаг 2
**Результат:** `#toast` в `index.html` получил `role="status"`, `aria-live="polite"` и `aria-atomic="true"`. `showToast()` теперь переключает обычные сообщения в polite status, а критические ошибки/валидацию/сетевые сбои — в `role="alert"` + `aria-live="assertive"`; текст очищается перед новым сообщением, чтобы live-region стабильно переозвучивался.
**Коммит:** `f5480eb`
**Статус:** ✅ status/toast code baseline готов к ручному smoke
**Следующий шаг:** BACK-050 шаг 3 — dialogs/focus/touch-targets для quick-add, contact panel и biometric consent.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-07 — Codex

**Задача:** BACK-050 — accessibility baseline auth/forms, шаг 1
**Результат:** В `index.html` экраны login/register/forgot/reset получили явные labels, `aria-describedby`, `aria-invalid`, полевые ошибки рядом с input, keyboard submit через JS-обработчики и доступные кнопки показа пароля. В `styles/layout.less` добавлены focus-visible, invalid-state и стили auth-ссылок/переключателей без новых inline handlers/styles. Заодно снижена baseline-планка `scripts/check-ui-architecture.sh`: inline styles `434 → 428`, inline handlers `415 → 402`. `BACK-050` переведён в `In Progress`: status/toast и dialogs/focus/touch-targets остаются следующими шагами.
**Коммит:** `0860245`
**Статус:** ✅ auth/forms code baseline готов к ручному keyboard/focus smoke
**Следующий шаг:** BACK-050 шаг 2 — status/toast baseline (`role=status`/`aria-live`, критические ошибки как alert/полевые ошибки).

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-07 — Codex

**Задача:** BACK-055 — вынести OAuth PKCE/state helpers из `index.html`
**Результат:** В `scripts/platform-adapter.js` перенесены `getOAuthRedirectUri()`, PKCE verifier/challenge generation и хранение/чтение pending OAuth state. В `index.html` остались короткие совместимые обёртки, а `createOAuthPkce()` теперь явно падает в catch входа, если platform layer не загрузился, вместо отправки пустого challenge.
**Коммит:** `pending`
**Статус:** ✅ маленький шаг распила готов, `BACK-055` остаётся `In Progress`
**Следующий шаг:** Следующим безопасным шагом вынести referral helpers или продолжить auth-секцию в отдельный модуль.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-07 — Codex

**Задача:** BACK-055 — вынести platform auth helpers из `index.html`
**Результат:** В `scripts/platform-adapter.js` перенесены Telegram start-token/return-url helpers, хранение pending Telegram start token, чистка auth URL, построение и открытие `t.me` login URL, а также сбор VK launch params. В `index.html` оставлены совместимые короткие обёртки, поэтому `loginWithTelegram()`, `resumePendingTelegramLogin()` и VK auto-login продолжают вызывать прежние имена.
**Коммит:** `edc5317`
**Статус:** ✅ маленький шаг распила готов, `BACK-055` остаётся `In Progress`
**Следующий шаг:** Следующим безопасным шагом вынести OAuth state/PKCE helpers или referral helpers отдельным блоком.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-07 — Codex

**Задача:** BACK-055 — вынести VK Mini Apps adapter из хвоста `index.html`
**Результат:** Реализация старого блока `ПАТЧ 08 — VK MINI APPS АДАПТЕР` перенесена в `scripts/platform-adapter.js` как `FourPlatform.initVkMiniAppAdapter()`. В `index.html` остался короткий вызов после объявления основных функций, поэтому порядок инициализации `showScreen`, storage, haptic, safe-area и VK Pay сохранён.
**Коммит:** `0da8e76`
**Статус:** ✅ маленький шаг распила готов, `BACK-055` остаётся `In Progress`
**Следующий шаг:** Следующим безопасным шагом вынести auth helpers из `index.html` без изменения пользовательских сценариев.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-07 — Codex

**Задача:** BACK-055 / task-move / BACK-038 / BACK-044 — ночная гигиена после аудита
**Результат:** Коллизия ID исправлена: старый `BACK-036` оставлен за Telegram web fallback, а распил `index.html` перенесён в `BACK-055`; зависимость `PLAT-001` обновлена на `BACK-055`. В модалке `task-move` оживлены три быстрых варианта переноса и выбор даты: они используют существующий `handleTaskReschedule()` / `openTaskReschedule()` вместо несуществующих функций. Глобальная карточка «Аналитика» убрана из личного экрана «Статистика», а `/analytics/summary` в worker теперь закрыт `requireAdmin`. Описание `BACK-044` уточнено: скрыто только «Направление», «Человек» снова видим и работает через person picker.
**Коммит:** app `b70d93e`, worker `fc38427`
**Статус:** ✅ гигиена и security-fix готовы
**Следующий шаг:** Продолжить `BACK-055` маленькими безопасными шагами.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-07 — Codex

**Задача:** BACK-055 — первый безопасный шаг распила platform layer
**Результат:** Добавлен `scripts/platform-adapter.js`: единая точка для Telegram WebApp, VK bridge, определения VK Mini App context, surface и bot username. `index.html` подключает адаптер до основного скрипта и использует его для `tg`, `TELEGRAM_BOT_USERNAME`, `tgUser`, `tgInitData`, `isVkMiniAppContext()` с fallback на старые выражения. `scripts/build-pages-whitelist.mjs` теперь включает runtime script в Workers Static Assets artifact. `pm/backlog.md` переведён в `In Progress`, потому что полный распил монолита ещё продолжается.
**Коммит:** `pending`
**Статус:** ✅ первый модульный слой готов
**Следующий шаг:** Вынести VK Mini Apps adapter из хвоста `index.html` в отдельный файл, сохранив текущие hooks `showScreen`, storage и haptic.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-07 — Codex

**Задача:** BACK-037 — staging API smoke перед Ready for QA
**Результат:** `npm run api-smoke` пройден против `https://restless-lab-d737-staging.shelckograff.workers.dev`: `forgot-password(empty)=400`, `forgot-password(invalid)=400`, register/login/auth-me `200`, tasks list/create/done/delete `200`, `transcribe(no-file)=400`. Это закрывает живой staging-прогон для автосмоука; `pm/backlog.md` переведён в `Ready for QA`.
**Коммит:** `pending`
**Статус:** ✅ staging API smoke зелёный
**Следующий шаг:** Следующий незаблокированный пункт ближайшего горизонта — аккуратно продолжить `BACK-055` по распилу `index.html` маленькими безопасными шагами или взять отдельный P2/P3 UI-хвост.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-07 — Codex

**Задача:** BACK-045 / BACK-048 — VK ID + Яндекс ID OAuth и staging dev/test аккаунты
**Результат:** В `4e-worker` добавлены web OAuth endpoints для VK ID и Яндекс ID: `/auth/vk-id/start`, `/auth/vk-id`, `/auth/yandex-id/start`, `/auth/yandex-id`. OAuth login создаёт/находит аккаунт через provider mapping, email и активную legacy-сессию, использует `mergeAccounts`, не дублирует пользователя и возвращает legacy token для текущего фронта. В `index.html` добавлены кнопки «Войти через VK ID» и «Войти через Яндекс ID» без новых inline handlers; callback по `code/state` пишет token и открывает Home. Staging worker задеплоен, OAuth start endpoints корректно требуют реальные secrets. Для `BACK-048` засеяны `dev1.4e@example.com`, `dev2.4e@example.com`, `dev3.4e@example.com`; smoke login → `/auth/me` → `/tasks` прошёл, у всех `plan=paid` и 5 seed-задач. Пароли лежат локально вне git в `<project-root>\_local-secrets\back-048-staging-dev-accounts.json`.
**Коммит:** `pending`
**Статус:** ✅ код и staging smoke готовы; live OAuth smoke ждёт secrets провайдеров
**Следующий шаг:** Юрий добавляет реальные `VK_ID_CLIENT_ID`, `VK_ID_CLIENT_SECRET`, `YANDEX_CLIENT_ID`, `YANDEX_CLIENT_SECRET` в staging/prod secrets и Алексей/Юрий проходят живой OAuth redirect smoke.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-07 — Codex

**Задача:** Срочный фикс сборки `4e-worker` после падения `wrangler deploy`
**Результат:** В `4e-worker/worker.js` восстановлены закрывающие скобки `DEFAULT_TARIFF_CONFIG`: блок `plans` и сам объект config теперь закрываются до `var CORS`. Проблема существовала в тарифной структуре и не была поймана прежним локальным smoke, потому что фактическая Wrangler-сборка worker не запускалась перед статусами Ready for QA/Done. После фикса пройдены `node --check worker.js`, `npx wrangler deploy --dry-run` и реальный `npx wrangler deploy --env staging`; staging worker поднялся на `https://restless-lab-d737-staging.shelckograff.workers.dev`, `/tariff-config` отвечает `200`, `POST /auth/forgot-password` с `fff` отвечает `400`.
**Коммит:** `pending`
**Статус:** ✅ staging deploy прошёл end-to-end
**Следующий шаг:** Для всех будущих задач по `4e-worker` перед переводом в Done/Ready for QA запускать Wrangler dry-run или staging deploy; прод-деплой отдельно по команде Юрия.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-07 — Codex

**Задача:** BACK-035 — закрыть дефект reset-password для невалидного email и передать короткий ручной хвост Алексею
**Результат:** В `4e-worker/worker.js` `POST /auth/forgot-password` теперь использует существующий `isValidEmailAddress` и больше не принимает `fff` как успешный кейс: для пустого email остаётся `400`, для невалидного email теперь тоже `400`. В `scripts/api-smoke.mjs` добавлены оба негативных кейса как регрессия. `pm/backlog.md` обновлён: `BACK-035` переведён в `Ready for QA`, а ручной хвост явно ссылается на `pm/back-035-manual-shortlist.md`. Shortlist готов и передан Алексею как единственный оставшийся ручной шаг.
**Коммит:** `pending`
**Статус:** ✅ автоматизируемая часть закрыта, дальше только ручной shortlist
**Следующий шаг:** Алексей проходит `pm/back-035-manual-shortlist.md`; `INFRA-001` и живые infra-smoke не трогаем до отдельной команды.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-07 — Codex

**Задача:** BACK-034 / SMART-006 — реальный staging AI smoke после добавления `ANTHROPIC_KEY`
**Результат:** В app-репо добавлен скрипт `scripts/staging-smart006-smoke.mjs`, который работает напрямую со staging worker `https://restless-lab-d737-staging.shelckograff.workers.dev`: регистрирует staging-пользователя, логинится, seed-ит реальные задачи и задаёт через `/anthropic` три вопроса из SMART-006. Smoke прошёл успешно: `Как меня зовут?` → `Юрий Смоук`, `Что у меня горит?` → корректно вытащил задачу `Срочно отправить КП Васе`, `Кому я больше всего должен?` → корректно назвал Васю и две активные задачи на нём. Это подтверждает, что staging worker реально видит `ANTHROPIC_KEY`, а профильный контекст пользователя доезжает в system prompt. `pm/backlog.md` обновлён: `BACK-034` и `SMART-006` переведены в `Ready for QA`; `shared/ROADMAP.md` синхронизирован.
**Коммит:** `pending`
**Статус:** ✅ staging smoke пройден
**Следующий шаг:** Алексей использует сокращённый `BACK-035` manual shortlist; по `INFRA-001` ждём вторую RF-проверку и ничего не трогаем.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-07 — Codex

**Задача:** BACK-035 — сократить QA smoke до короткого ручного хвоста и автоматизировать всё, что можно
**Результат:** `pm/qa-checklist.md` размечен по каждому smoke-пункту как `Авто` или `Алексей вручную`. Починен `scripts/api-smoke.mjs`: теперь он работает с реальным user-task flow вместо искусственного `chatId` и пригоден для повторного запуска. Автоматически проверены негативные кейсы reset-password: пустой email корректно даёт `400`, а кейс `fff` неожиданно возвращает `200 {"ok":true}` — это зафиксировано прямо в чек-листе как открытый дефект. Для CI-origin-проверки чеклист теперь явно опирается на guard из `.github/workflows/deploy-pages.yml`. Добавлен сжатый файл `pm/back-035-manual-shortlist.md` с 10 ручными пунктами вместо полного списка. `pm/backlog.md` переведён в `In Progress`.
**Коммит:** `pending`
**Статус:** ⚠️ автоматизация + triage готовы, ручной хвост остаётся у Алексея
**Следующий шаг:** Алексей проходит только `pm/back-035-manual-shortlist.md`; отдельно нужно чинить reset-password для невалидного email `fff`.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-07 — Codex

**Задача:** BACK-034 — уточнить живой блокер staging AI smoke
**Результат:** Перепроверено по коду и docs: staging-контур уже поднят, `wrangler.toml`/`wrangler.staging.toml` содержат отдельный `env.staging`, а dev Mini App живёт на `https://4-ai-staging.pages.dev`. Username бота в коде по умолчанию `Denzel89bot`, плюс dev-сборка умеет переопределять его через `?bot=...`, так что это больше не главный вопрос. В `pm/backlog.md` уточнено, что реальный blocker для AI smoke — отсутствие staging `ANTHROPIC_KEY` и связанных secrets.
**Коммит:** `pending`
**Статус:** ⚠️ блокер подтверждён
**Следующий шаг:** Юрий вручную добавляет staging secrets (`ANTHROPIC_KEY` как минимум), после чего можно запускать staging AI smoke для `BACK-034`/`SMART-006`.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-07 — Codex

**Задача:** INFRA-001 — сверить фактический статус фронта на Workers Static Assets
**Результат:** Повторно подтверждено, что кодовая часть `INFRA-001` уже в репозитории: `wrangler.toml` указывает `main = "worker-static.js"`, routes на `app.4-ai.site` и binding `ASSETS` с `run_worker_first = true`; `worker-static.js` обслуживает `/`, `/vk`, `/privacy` и распознаёт VK launch params на корне. `pm/backlog.md` переведён в `Ready for QA`, потому что от Codex больше не осталось кодовых шагов — нужен только ручной phone/web smoke Юрия из РФ-сети без VPN.
**Коммит:** `pending`
**Статус:** ⚠️ код готов, ждёт QA
**Следующий шаг:** Юрий открывает `https://app.4-ai.site/` и `https://app.4-ai.site/vk` без VPN из РФ-сети; после зелёной проверки `INFRA-001` можно переводить в `Done`.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-07 — Codex

**Задача:** INFRA-002 — синхронизировать статус правила про РФ-доступность без VPN
**Результат:** Подтверждено, что docs-часть уже была выполнена ранее: обязательная проверка прод-URL из РФ-сети без VPN прописана в `pm/release-checklist.md` и `pm/qa-checklist.md`, включая требование минимум двух независимых точек/операторов. `pm/backlog.md` переведён из `Todo` в `In Progress`, чтобы отражать реальность: правило зафиксировано, но живой ручной smoke остаётся за Алексеем.
**Коммит:** `pending`
**Статус:** ⚠️ docs готовы, ждём ручную проверку
**Следующий шаг:** Алексей проходит RF/no-VPN smoke с двух независимых точек; после этого `INFRA-002` можно переводить в `Done`.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-07 — Codex

**Задача:** BACK-048 — безопасный контур dev/test аккаунтов для staging
**Результат:** В `4e-worker` добавлен закрытый admin seed для dev/test аккаунтов: `POST /admin/dev-accounts/seed` создаёт или обновляет пользователя по email, хеширует пароль, ставит `plan=paid`, отмечает `devTestAccount=true` и заливает стабильный набор seed-задач для smoke. Добавлен `DELETE /admin/dev-accounts/{email}` для cleanup только dev/test аккаунтов. В app-репо создан runbook `docs/back-048-dev-test-accounts-runbook.md` с curl-примерами и плейсхолдерами вместо секретов; `pm/backlog.md` переведён в `In Progress`, потому что staging deploy, реальный seed и live smoke ещё впереди.
**Коммит:** `pending`
**Статус:** ⚠️ код готов, нужен staging-шаг
**Следующий шаг:** Задеплоить staging worker, вызвать `POST /admin/dev-accounts/seed` локальным JSON с тремя аккаунтами, передать пароли Алексею вне git и пройти smoke web/VK/TG.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-06 — Codex

**Задача:** Разрешить merge-конфликты `feat/admin-tariff-api` с `origin/main`
**Результат:** Локально разобраны конфликты в `index.html`, `styles.min.css`, `styles/screens/profile.less`, `infra/yandex-api-gateway/ru-proxy-openapi.yaml`, PM-документах и журналах. Сохранены `BACK-048` dev/test accounts из `main`; профильные задачи feature-ветки перенумерованы в `BACK-052..054`. CSS пересобран из LESS через bundled Node 24, потому что системный Node/npm не совместим с lockfile v3.
**Коммит:** `этот merge-коммит`
**Статус:** ✅ выполнено локально
**Следующий шаг:** После проверки запушить `feat/admin-tariff-api` и обновить PR.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-06 — Codex

**Задача:** Контроль ветки `feat/admin-tariff-api` перед следующим шагом по `BACK-053`
**Результат:** Переключился на локальную ветку от `origin/feat/admin-tariff-api`; подтвердил, что профильные задачи ветки закрыты и при merge с `main` перенумерованы в `BACK-052`, `BACK-053`, `BACK-054`, чтобы не конфликтовать с `BACK-048` dev/test accounts. По коду `BACK-053`: клик по аватару и фото-превью открывает единый скрытый file input, отдельная дублирующая кнопка настройки фото из разметки убрана. Дополнительно сняты PR-блокеры ветки: portable-path ссылки в `docs/infra-005-yandex-ru-proxy.md` заменены на относительные, conflict markers убраны из `pm/bugs.md`, `pm/qa-checklist.md`, `DEVELOPMENT_LOG.md`.
**Коммит:** `docs(process): clean admin tariff branch blockers`
**Статус:** ✅ контроль выполнен локально
**Следующий шаг:** Разрешить merge-конфликты ветки с `origin/main` и после проверки согласовать push.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-06 — Codex

**Задача:** Синхронизировать статусы спринта 1 после ночных merge/hotfix и UI-пакета
**Результат:** В app-документации обновлены статусы уже закрытых пунктов очереди: `BACK-047` отмечен как Done по факту live worker+app smoke, `BACK-046` / `BACK-043` / `BACK-044` переведены в `Ready for QA` с привязкой к веткам `fix/bottom-nav-app-width`, `fix/profile-responsive-ui`, `fix/task-detail-card-cleanup` и их коммитам. В `pm/qa-checklist.md` и `pm/bugs.md` синхронизированы ревью-статусы и исправлена коллизия старого ID `BACK-042 -> BACK-046`.
**Коммит:** N/A
**Статус:** ✅ статусы синхронизированы
**Следующий шаг:** Отдать Алексею UI-скрины, пройти ручной smoke на ветках и только потом мержить пакет UI-фиксов в `main`

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-06 — Codex

**Задача:** INFRA-005 шаг 1 — подготовить RU API proxy для VK Mini App
**Результат:** В app-репо добавлен готовый spec для Yandex API Gateway `infra/yandex-api-gateway/ru-proxy-openapi.yaml`, который проксирует `/` и `/{path+}` на `https://edge.4-ai.site`, пробрасывает исходные headers/query и фиксирует upstream `Host`. Для VK hosting build введён конфиг через `VK_API_BASE_URL`: `scripts/build-vk-hosting.mjs` теперь подменяет API base в `.vk-hosting-dist/index.html` во время сборки/деплоя. Добавлены runbook `docs/infra-005-yandex-ru-proxy.md`, task-файл `docs/tasks/INFRA-005-yandex-ru-proxy-step1.md` и backlog item `INFRA-005`. До полного выполнения остаётся только ручной слой Алексея: `folder-id`/доступы Yandex Cloud и технический домен gateway для VK smoke без VPN.
**Коммит:** N/A
**Статус:** ✅ подготовка завершена, ждёт ручной облачный шаг
**Следующий шаг:** Алексей создаёт API Gateway по spec, Юрий передаёт технический домен, после чего VK hosting пересобирается с `VK_API_BASE_URL` и идёт phone-smoke без VPN

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-06 — Codex

**Задача:** перенести актуальное правило Linear-триажа багов на свежую ветку от `origin/main`
**Результат:** В `pm/bugs.md` добавлено правило, когда баг заводим отдельной задачей в Linear, а когда оставляем только в `pm/bugs.md`. Старые локальные ветки не пушились: полезное правило перенесено точечно без старых конфликтов.
**Коммит:** `docs(process): add linear bug triage policy`
**Статус:** ✅ выполнено
**Следующий шаг:** Юра и агенты используют правило при разборе новых багов перед созданием Linear issue.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---### 2026-07-06 — Codex

**Задача:** закрепить accessibility как постоянное правило для будущей UI-разработки
**Результат:** Accessibility baseline переведён из разовой задачи `BACK-050` в постоянную часть Definition of Done для нового и изменяемого UI. Обновлены `docs/ui-architecture-rules.md`, `AGENTS.md`, `CLAUDE.md`, `COWORK_INSTRUCTIONS.md` и `shared/ROADMAP.md`. Для Юры добавлена итоговая инструкция `pm/agent-inbox/codex-to-yuri-2026-07-06-accessibility-permanent-rule.md`.
**Коммит:** `docs(ui): make accessibility a permanent rule`
**Статус:** ✅ правило закреплено
**Следующий шаг:** Юрий применяет правило во всех следующих UI-ветках; `BACK-050` остаётся отдельной задачей на практическое доведение критических сценариев до baseline.

### 2026-07-06 — Codex

**Задача:** оформить BACK-050 accessibility baseline и отправить Юре задачи по шагам
**Результат:** В `shared/ROADMAP.md` и `pm/backlog.md` добавлен `BACK-050` на базовую доступность критических сценариев. В `pm/qa-checklist.md` добавлен ручной accessibility smoke: auth keyboard/focus, формы, status/toast, dialog bottom sheets и touch-targets. Создан task-файл `docs/tasks/BACK-050-accessibility-baseline.md` и инбокс-сообщение `pm/agent-inbox/codex-to-yuri-2026-07-06-accessibility-baseline.md` с тремя последовательными задачами для Юры.
**Коммит:** `docs(qa): add accessibility baseline tasks`
**Статус:** ✅ задача оформлена
**Следующий шаг:** Юрий берёт шаг 1 в ветке `fix/accessibility-auth-baseline`; после проверки auth/forms переходить к status/toast и dialog/focus/touch-targets.

### 2026-07-05 — Codex

**Задача:** поставить Юре задачу на dev/test аккаунты с полными правами
**Результат:** Добавлена `BACK-048` в `pm/backlog.md`, создан task-файл `docs/tasks/BACK-048-dev-test-accounts.md`, в `pm/qa-checklist.md` добавлена проверка dev/test аккаунтов. Зафиксированы границы безопасности: сначала staging, production только после подтверждения Алексея; full-access через защищённый backend/admin-механизм; пароли, токены и `ADMIN_SECRET` не хранить в git.
**Коммит:** `docs(ui): add architecture guard for inline debt`
**Статус:** ✅ задача оформлена
**Следующий шаг:** Юрий делает реализацию в worker-ветке `feat/dev-test-accounts` и передаёт Алексею логины/пароли вне репозитория.

### 2026-07-05 — Codex

**Задача:** первичный мобильный QA всех экранов на `375x667`, `390x844`, `360x800`
**Результат:** Проверен текущий `main` после `git fetch origin`: локальный `main` синхронен с `origin/main`. Прогнано 114 экранных состояний `index.html` в локальном браузере с mock auth/tasks. Глобального горизонтального скролла не найдено. Найден новый баг `BUG-2026-07-05-003`: на Home после 22:00 строка фокуса показывает отрицательное время `-1 ч до конца дня`. Визуально проверены login/register, Home, Profile, Task detail, Notifications, Chats, Chat conversation, Ask, Payment, quick-add и contact bottom sheet.
**Коммит:** N/A
**Статус:** ✅ выполнено
**Следующий шаг:** Исправить `BUG-2026-07-05-003`; отдельно пройти live smoke Telegram-login и CloudPayments/Telegram Stars/VK Pay, потому что в локальном QA внешние платежи и реальная авторизация не отправлялись.

### 2026-07-06 — Codex

**Задача:** BACK-044 — упростить детальную карточку задачи
**Результат:** В ветке `fix/task-detail-card-cleanup` описание/исходный запрос перенесены прямо под заголовок задачи, дублирующая вкладка `Описание` убрана, порядок полей на первом экране приведён к `Срок → быстрые кнопки → Статус → Приоритет → Напоминание`. Строки `Направление` и `Человек` скрыты из видимого UI, но сохранены в DOM и по-прежнему доступны `saveTaskEdits()` и `openTask()`. Для mobile detail rows переведены в вертикальный режим, чтобы select и datetime-input не упирались в правый край.
**Коммит:** N/A
**Статус:** ✅ выполнено
**Следующий шаг:** Передать Алексею desktop/mobile screenshots по `BACK-046/043/044`, затем перейти к `INFRA-005` шаг 1

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-06 — Codex

**Задача:** BACK-043 — выровнять мобильную верстку экрана профиля
**Результат:** В ветке `fix/profile-responsive-ui` обновлена мобильная раскладка профиля: телефон/email теперь переносят статусный бейдж под поле на узких экранах, Telegram стал полноширинной строкой без съезда, карточки `Дата рождения` и `О себе` получили ровный внутренний ритм, счётчик `0 / 200` привязан к textarea, а нижняя кнопка сохранения не спорит с нижней навигацией. Заодно в этой же ветке подтянут актуальный статус-синк: `BACK-046` зарегистрирован под новым ID, `BACK-047` закрыт как `Done`.
**Коммит:** N/A
**Статус:** ✅ выполнено
**Следующий шаг:** Снять clean screenshots desktop/mobile для Алексея и перейти к `BACK-044` на базе этой же UI-линейки

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-06 — Codex

**Задача:** BACK-047 — вшить v2 auth/privacy routes в worker и снять ночные фронтовые fallback
**Результат:** В `4e-worker` ветка `feat/back-047-v2-auth-privacy` подвесила live routes `/v2/auth/legacy-session`, `/auth/identities` и `/v2/privacy/*` поверх текущего worker-router. Staging smoke и prod smoke прошли через полный flow: legacy `auth/register` → `x-token` → D1 session → identities → privacy settings. После этого в app-репо ветка `fix/back-047-remove-auth-fallbacks` убрала временное игнорирование `404/501/503` и вернула `vk.html` к прямому чтению `/v2/auth/identities`.
**Коммит:** worker `21ddb48`, app `e85cd50`
**Статус:** ✅ выполнено
**Следующий шаг:** Утром решить merge веток в main и прогнать QA web/VK после live worker-фикса; отдельно закрыть staging secret `VK_SECRET_KEY` для smoke `v2/auth/link-vk`

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-05 — Codex

**Задача:** Добавить в roadmap авторизацию через сервисы РФ — VK ID и Яндекс ID
**Результат:** В `shared/ROADMAP.md` добавлено направление BACK-045 в ближайший горизонт и решение по РФ-провайдерам входа. В `pm/backlog.md` добавлена операционная задача BACK-045, создан task-файл `docs/tasks/BACK-045-russian-service-auth.md`.
**Коммит:** `docs(auth): add russian service auth roadmap`
**Статус:** ✅ выполнено
**Следующий шаг:** Алексей и Юрий решают, кто регистрирует OAuth-приложение Яндекса и когда брать BACK-045 в разработку

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-05 — Codex

**Задача:** Поставить Юре задачу по упрощению детальной карточки задачи
**Результат:** Код приложения не менялся. Добавлены `BACK-044`, QA-регрессия и task-файл `docs/tasks/BACK-044-task-detail-card-cleanup.md`. Требование: описание под заголовком, убрать вкладку "Описание", поднять "Срок" первым, отлепить быстрые кнопки сроков, скрыть строки "Направление" и "Человек" в видимой карточке.
**Коммит:** N/A
**Статус:** ✅ задача оформлена
**Следующий шаг:** Юрий делает код в ветке `fix/task-detail-card-cleanup`, затем Алексей проверяет карточку на телефоне/web перед merge

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-05 — Codex

**Задача:** Поставить Юре задачу по неаккуратной мобильной верстке профиля
**Результат:** Добавлены `BUG-2026-07-05-002`, `BACK-043`, QA-регрессия и task-файл `docs/tasks/BUG-2026-07-05-002_profile_mobile_layout.md`. Требование: выровнять мобильный профиль — статусные бейджи phone/email/telegram, отступы секций "Дата рождения" и "О себе", textarea, счётчик символов и расстояние до нижней навигации.
**Коммит:** N/A
**Статус:** ✅ задача оформлена
**Следующий шаг:** Юрий делает фикс в ветке `fix/profile-mobile-layout`, затем Алексей проверяет mobile web и Telegram WebView перед merge

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-05 — Codex

**Задача:** Зафиксировать для Юры UI-баг ширины нижней панели
**Результат:** Добавлены `BUG-2026-07-05-001`, `BACK-046`, QA-регрессия и task-файл `docs/tasks/BUG-2026-07-05-001_bottom_nav_width.md`. Требование: нижняя панель должна быть по ширине app-контейнера на всех экранах, где она видна; проверить оба компонента `bottom-nav-v2` и `global-nav`.
**Коммит:** N/A
**Статус:** ✅ задача оформлена
**Следующий шаг:** Юрий делает фикс в ветке `fix/bottom-nav-app-width`, затем Алексей проверяет desktop/web и мобильный экран перед merge

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-04 — Codex

**Задача:** Исправить Enter на экране email-входа
**Результат:** В `index.html` поля `login-email` и `login-pass` теперь обрабатывают Enter через `submitLoginOnEnter(event)` и запускают тот же `doLogin()`, что и кнопка "Войти". Повторный вход не стартует, если кнопка уже заблокирована. Добавлен `BUG-2026-07-04-003` и QA-проверка.
**Коммит:** N/A
**Статус:** ✅ локально исправлено, нужен smoke на ноутбуке
**Следующий шаг:** Алексей проверяет вход: email + пароль → Enter; затем выкладываем ветку через GitHub Desktop после общей проверки текущего набора auth-правок

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-05 — Codex

**Задача:** INFRA-004 + merge-пакет long-session-3 — довести VK-хостинг, синхронизировать PM/CI и закрыть инфраструктурные хвосты
**Результат:** `feat/infra-001-workers-static-assets` смёржен в `main` и запушен (`7931e8b`). В app-репо подготовлен контур VK-хостинга: добавлены `@vkontakte/vk-miniapps-deploy`, `scripts/build-vk-hosting.mjs`, `vk-hosting-config.json`, сборка `.vk-hosting-dist` с `index.html` из `vk.html` и локальными vendor-ассетами, чтобы VK-поверхность не зависела от GitHub Pages и внешних CDN. Синхронизированы `pm/backlog.md`, `shared/ROADMAP.md`, `pm/release-checklist.md`, `pm/qa-checklist.md`, добавлена отдельная QA-инструкция `pm/qa-smart-001-002-004-group-bot.md`; в GitHub Actions для `Deploy GitHub Pages` добавлены проверки production `WORKER` URL, запрет staging/`workers.dev` origin и post-deploy smoke. Для `4e-worker` подтверждено: remote `mrktggod/4e-worker` уже существует, репозиторий приватный, `main` синхронен с `origin/main`. Затем `vk-miniapps-deploy` успешно задеплоил и подтвердил production URL `https://prod-app54636698-c3cd4413b138.pages-ac.vk-apps.com/index.html`; Юрий подтвердил, что VK Mini App открывается с телефона без VPN.
**Коммит:** N/A
**Статус:** ✅ выполнено
**Следующий шаг:** Обновить статусы в PM после staging-хвостов и отдельно добить расследование `409` для polling-бота

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-05 — Codex

**Задача:** INFRA-001 — перевести whitelist-фронт на Workers Static Assets и вернуть `app.4-ai.site` в доступный для РФ контур без VPN
**Результат:** В app-репо добавлены `worker-static.js` и `wrangler.toml`; whitelist-сборка из `scripts/build-pages-whitelist.mjs` теперь разворачивается как Static Assets воркера `4-ai-app-worker` на маршруте `app.4-ai.site/*`. Проверено: `/`, `/vk`, `/privacy` отвечают `200`, `pm/` и `shared/ROADMAP.md` недоступны (`404`), CORS до `https://edge.4-ai.site` живой. Дополнительно Worker распознаёт VK launch params в корне и обслуживает `vk.html` без внешнего редиректа, чтобы VK Mini App не зависел от `vk.html -> /vk`.
**Коммит:** N/A
**Статус:** ⚠️ частично
**Следующий шаг:** Юрий проверяет `https://app.4-ai.site/` и `https://app.4-ai.site/vk` с телефона из РФ-сети без VPN; после зелёной проверки можно окончательно вернуть VK DevPage/BotFather на домен `app.4-ai.site`

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-04 — Codex

**Задача:** Delta-sync стратегии и бэклога после сессии SMART-001/002/004
**Результат:** Синхронизированы `shared/ROADMAP.md`, `pm/backlog.md`, `docs/ЗАДАЧИ_УМНЫЙ_АССИСТЕНТ.md` и `docs/marketing/СЦЕНАРИИ_РОЛИКОВ.md` из Desktop-источников; в репозиторий добавлены SMART-013, серия NATIVE-001..006 и пакет вирусных сценариев роликов, чтобы `main` отражал актуальную стратегию 2026-07-04.
**Коммит:** `этот коммит`
**Статус:** ✅ выполнено
**Следующий шаг:** Смёржить docs-ветку в `main`, затем дать Лёхе смотреть уже целостный план вместе с Ready for QA по SMART-001/002/004

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
**Задача:** Продвинуть SMART-001 и SMART-002 — roster участников и assignee с TG ID
**Результат:** В локальном `<worker-repo-root>` добавлен D1-ростер `chat_members` с endpoint'ами `upsert/get/mark-chat-members-left`; bot `handler.js` теперь копит участников из `msg.from`, `reply_to_message.from`, `new_chat_members`, `left_chat_member`, передаёт список участников в Haiku и сохраняет в задачу `assigneeTgId` / `assigneeUsername` по `text_mention`, `@mention`, reply и fuzzy-матчу имени. Staging worker обновлён: миграция `0007_chat_members.sql` применена, версия `231a8070-f7ab-46d2-8983-f3939063afad` отвечает `200 OK`.
**Коммит:** `этот коммит`
**Статус:** ⚠️ частично
**Следующий шаг:** Обновить реальный bot runtime из `<worker-repo-root>/src/bot/`, прогнать smoke в тестовой группе для `@mention`, reply и join/leave событий, затем перевести SMART-001/002 в Ready for QA

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-04 — Codex

**Задача:** Продвинуть SMART-004 — лаконичная фиксация задач в группах
**Результат:** В локальном `<worker-repo-root>` бот подтверждает задачу одной строкой `✓ Имя: задача — срок`, сохраняет её сразу, использует inline-кнопки `✏️/✕` и удаляет задачу через новый `x-action: delete-task`; дополнительно исправлен payload удаления и убран ложный ответ «Отменено», если бот потерял контекст кнопки.
**Коммит:** `этот коммит`
**Статус:** ⚠️ частично
**Следующий шаг:** Обновить реальный bot runtime из `<worker-repo-root>/src/bot/`, пройти ручной smoke в тестовой группе и затем перевести SMART-004 в Ready for QA

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-01 — Codex + Юрий

**Задача:** BACK-022 — Ручной MVP детальной карточки задачи  
**Результат:** Добавлены поля статус/приоритет/дедлайн/время/направление/напоминание/чек-лист в task-detail; saveTaskEdits сохраняет все поля; worker расширен; убран старый prompt-flow; CSS обновлён  
**Коммит:** `dca263e`  
**Статус:** ✅ выполнено  
**Следующий шаг:** BACK-024 (Telegram login fix) или BACK-021 (голос)

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
## Как добавить запись

```markdown
### YYYY-MM-DD — [Ваше имя / Агент]

**Задача:** что делал  
**Результат:** что получилось  
**Коммит:** `hash` или N/A  
**Статус:** ✅ выполнено / ⚠️ частично / ❌ отложено  
**Следующий шаг:** (если есть)
```

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
## Лог

### 2026-07-05 — Codex

**Задача:** Закрыть BACK-007 по privacy/RKN: уточнить номер в `privacy.html`, добавить ссылки на privacy в регистрацию и онбординг
**Результат:** Ветка `fix/privacy-rkn-links`; в `privacy.html` формулировка приведена к тексту с рег. № `102299/77`, в `index.html` добавлены явные privacy-ссылки для onboarding и регистрации, `pm/backlog.md` обновлён до `Ready for QA`; live GitHub Pages `privacy.html` отдаёт `200` и содержит номер РКН.
**Коммит:** `этот коммит`
**Статус:** ✅ выполнено
**Следующий шаг:** Проверить ветку и решить merge после ревью, затем продолжить staging-контур BACK-034

### 2026-07-04 — Codex

**Задача:** Исправить отсутствие реакции кнопки "Войти через Telegram" в веб-версии
**Результат:** В `index.html` Telegram-login fallback переведён с `tg://resolve?...` на `https://t.me/Denzel89bot?start=...`. `openTelegramLink()` теперь вызывается только при наличии Telegram `initData`; обычная веб-версия делает HTTPS-переход и не должна ловить `WebAppTgUrlInvalid`. Фронт сохраняет pending token, отправляет `returnUrl` и умеет завершить вход после возврата с `?telegram_start=<token>`. Добавлены `BUG-2026-07-04-002` и `BACK-036`.
**Коммит:** N/A
**Статус:** ✅ локально исправлено, нужен live smoke после публикации
**Следующий шаг:** Проверить в веб-версии клик по кнопке; на стороне `@Denzel89bot` после START нужна ссылка/кнопка назад на сайт.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-05 — Codex

**Задача:** Встроить SMART-006 — профиль пользователя в контекст AI-чата
**Результат:** Ветка `feat/smart-006-profile-context`; в `index.html` AI system prompt теперь получает блок профиля пользователя: имя, локальное время/таймзону, тариф, количество активных/горящих/просроченных задач, завершённые за 7 дней и топ людей из активных задач. Новых API не понадобилось — всё собрано из `currentUser` и `allTasksCache`.
**Коммит:** `этот коммит`
**Статус:** ⚠️ частично
**Следующий шаг:** После добавления `ANTHROPIC_KEY` в staging прогнать smoke на вопросах «что у меня горит?» и «кому я больше всего должен?», затем перейти к SMART-004

### 2026-07-05 — Codex

**Задача:** Поднять staging-контур BACK-034: staging worker, staging Pages и dev-ветку Mini App
**Результат:** В `4e-worker` добавлен рабочий `env.staging`, staging D1 мигрирован (`postgres_app_state.sql`), worker задеплоен на `https://restless-lab-d737-staging.shelckograff.workers.dev` (version `a5ff6e7d-b0b2-4e4c-b777-edcc19387029`). В app-репо создана ветка `dev`, `index.html` смотрит на staging worker, bot username можно передать через `?bot=...`, Pages-проект `4-ai-staging` создан и dev-версия доступна на `https://4-ai-staging.pages.dev/`. Добавлена памятка `docs/staging-contour.md`.
**Коммит:** `этот коммит`
**Статус:** ⚠️ частично
**Следующий шаг:** Юрий добавляет недостающие staging secrets (`ANTHROPIC_KEY`, при необходимости `OPENAI_KEY`, `RESEND_KEY`, `VK_SECRET_KEY`) и сообщает username тестового бота; после этого можно закрыть AI smoke и перейти к SMART-006 на staging

### 2026-07-04 — Codex

**Задача:** Синхронизировать `shared/ROADMAP.md`, `pm/backlog.md`, `pm/bugs.md` и docs-материалы из Desktop-источника в реальный publish-репозиторий по inbox `cowork-to-codex-2026-07-04-roadmap-sync.md` v2.1
**Результат:** Ветка `docs/roadmap-backlog-sync-2026-07-04` создана в `<repo-root>`; байтовым копированием обновлены roadmap/backlog/bugs и два docs-файла, проверена кириллица, переименованы `docs/tasks/BACK-039-completed-tasks-week.md` и `docs/tasks/BACK-040-admin-tariff-map.md`, очищены старые ссылки и portable-path замечания в `CODEX_INSTRUCTIONS.md`.
**Коммит:** `docs(pm): sync roadmap+backlog+bugs — SMART/VIRAL/PLAT задачи, аудит багов, решения 2026-07-04`
**Статус:** ✅ выполнено
**Следующий шаг:** Разобрать diff и при необходимости отдельно синхронизировать эту же PM-линию в другие рабочие копии через git

### 2026-06-29 — Codex

**Задача:** Завести PM-задачу BACK-025 по утреннему AI-дашборду
**Результат:** В `shared/ROADMAP.md` и `pm/backlog.md` добавлен `BACK-025 — Настраиваемый утренний AI-дашборд` как P1. Обновлены `pm/next-actions.md` и `pm/qa-checklist.md`; создан task-файл `docs/tasks/BACK-025_ai_planner_glass_dashboard.md` с составом MVP и acceptance checklist.
**Коммит:** этот коммит
**Статус:** ✅ выполнено
**Следующий шаг:** Реализовать интерфейс в ветке `feat/ai-planner-glass-dashboard`: новый `home`, glass UI, "План на сегодня", "Пульс дня" и смысловые секции задач.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-06-29 — Codex

**Задача:** Триаж ошибки голосового режима
**Результат:** Зафиксирован `BUG-2026-06-29-002`: голосовой режим показывает "Ошибка микрофона" и не начинает запись. Проверка показала, что текущий `main` использует `SpeechRecognition` после отката MediaRecorder-flow (`e970d33`), а значит баг связан с известной несовместимостью Telegram/iOS WebView. `BACK-021` поднят в Now как P1/Triaged; обновлены `pm/bugs.md`, `pm/backlog.md`, `pm/qa-checklist.md` и `docs/tasks/BACK-021-voice-mediarecorder.md`.
**Коммит:** N/A
**Статус:** ⚠️ частично — баг оформлен, код не исправлялся
**Следующий шаг:** Алексей передаёт Юре/Claude вопрос по откату `e970d33`; после ответа делать фикс в ветке `fix/voice-mediarecorder` и проверять Worker `/transcribe` + `OPENAI_KEY`.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-06-29 — Codex

**Задача:** Триаж ошибки входа через Telegram
**Результат:** Зафиксирован `BUG-2026-06-29-001`: вход через Telegram показывает тупиковую подсказку "Открой бота и нажми Start", а в Telegram действие не предлагается. Добавлены запись в `pm/bugs.md`, задача `BACK-024` в `pm/backlog.md`, roadmap-риск в `shared/ROADMAP.md`, проверки в `pm/qa-checklist.md` и task-файл для разработки.
**Коммит:** этот коммит
**Статус:** ⚠️ частично — баг оформлен, код/bot не исправлялись
**Следующий шаг:** Юрий или владелец bot-репозитория проверяет `@Denzel89bot` `/start`; Codex после доступа к bot/app может исправить UX и пройти live smoke.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-06-29 — Codex

**Задача:** Завести PM-задачи по детальной карточке задачи
**Результат:** В `pm/backlog.md` добавлены `BACK-022` для ручного MVP экрана `task-detail` и `BACK-023` для будущего расширения карточки после MVP. `shared/ROADMAP.md` и `pm/next-actions.md` обновлены: `BACK-019` оставлен как задача про карточки в списке, `BACK-022` — как следующий PM-фокус по ручному сценарию без голоса. Созданы task-файлы `docs/tasks/BACK-022_task_detail_manual_mvp.md` и `docs/tasks/BACK-023_task_detail_future_expansion.md`.
**Коммит:** N/A
**Статус:** ✅ локально выполнено
**Следующий шаг:** PM-проверка состава `BACK-022`, затем отдельная реализация без смешивания с Git-процессом.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-06-30 — Codex

**Задача:** BACK-019 mobile bugfix + vibration
**Результат:** Кнопки swipe-actions переведены на делегированные `touchend`/`click` handlers, добавлена Vibration API отдача `10ms` на пороге свайпа и `20ms` на action-кнопках; мобильная ширина action-кнопок и левый сдвиг карточки выровнены.
**Коммит:** этот коммит
**Статус:** ✅ Ready for QA
**Следующий шаг:** Проверить на телефоне `Отменить`, `Перенести`, `Завершить` и вибрацию.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---### 2026-06-28 — Codex

**Задача:** BACK-019 web bugfix — скрыть swipe-кнопки в браузере
**Результат:** Swipe-actions скрыты по умолчанию через opacity/visibility/translate; на non-touch устройствах (`pointer:fine`) кнопки полностью отключены, чтобы web Telegram/browser не показывал их статично.
**Коммит:** этот коммит
**Статус:** ✅ Ready for QA
**Следующий шаг:** Проверить web Telegram/browser и телефонные свайпы.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---### 2026-06-28 — Codex

**Задача:** BACK-019 bugfix — скрыть swipe-кнопки по умолчанию
**Результат:** Исправлена причина статичного отображения кнопок `Завершить`, `Отменить`, `Перенести`: CSS больше не зависит от отсутствующего `.tasks-wrap` у `#home-task-list`, action-слой привязан к `.task-card-shell`.
**Коммит:** этот коммит
**Статус:** ✅ Ready for QA
**Следующий шаг:** Проверить на телефоне, что кнопки появляются только при свайпе.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---### 2026-06-28 — Codex

**Задача:** BACK-019 — улучшенные карточки задач
**Результат:** В `index.html` добавлена новая структура карточки задач: номер с приоритетом, категория, дедлайн, двухстрочное название, подсветка просрочки и swipe-действия `Завершить`, `Отменить`, `Перенести` с date picker. LESS/CSS пересобран.
**Коммит:** этот коммит
**Статус:** ✅ Ready for QA
**Следующий шаг:** Ручной smoke на телефоне: свайп влево/вправо, перенос дедлайна и завершение задачи.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---### 2026-06-28 — Юрий + Мимо (Cowork)

**Задача:** Актуализация backlog, фиксы голоса, мерж веток
**Результат:**
- BACK-018 Done: удалена иконка дашборда из нав-меню (`7206ca6`)
- BACK-019 Todo: добавлен в backlog + task-файл для Кодекса
- BACK-020 Done: закрыт после QA Кодекса
- BACK-021 Known issue: откат MediaRecorder → SpeechRecognition; iOS старый не работает
- Voice fixes: SR колбэки обнуляются перед stop (`c4ef729`), окно закрывается корректно
- ANTHROPIC_KEY: фикс чтения из runtime env в worker.js (`844fa80`)
- Лёшина ветка `docs/git-branch-protocol` смержена в main (`df6b54a`)
**Коммит:** `79f37e3`
**Статус:** ✅ выполнено
**Следующий шаг:** Кодекс → BACK-019 (карточки задач); Паша iOS голос — known issue

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-06-28 — Codex

**Задача:** Зафиксировать ответственного за РКН
**Результат:** По решению Алексея BACK-007 "Уведомление РКН" назначен на Юрия; обновлены `shared/ROADMAP.md`, `pm/backlog.md`, `pm/next-actions.md` и `DEVELOPMENT_LOG.md`
**Коммит:** N/A
**Статус:** ✅ локально выполнено
**Следующий шаг:** Юрий решает, закрывает РКН сам или привлекает внешнего специалиста; после подачи уведомления команда вносит номер/подтверждение в legal-документ

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-06-28 — Codex

**Задача:** Отменить жёсткое правило "только GitHub Desktop"
**Результат:** GitHub Desktop оставлен как удобный вариант для Алексея, но не как обязательное правило для Юры; командный документ переименован в `docs/git-team-rules.md`; в инструкциях закреплено, что обязательны проверка ветки, понятный риск и согласование опасных Git-действий, а не конкретное приложение
**Коммит:** N/A
**Статус:** ✅ локально выполнено
**Следующий шаг:** Проверить формулировку с Юрой / Claude и после согласования утвердить финальное правило

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-06-28 — Codex

**Задача:** Самостоятельно закрепить безопасный Git-процесс и следующий PM-план
**Результат:** Обновлены `AGENTS.md`, `CLAUDE.md`, `COWORK_INSTRUCTIONS.md` и `FILE_MAP.md`; создан `docs/github-desktop-team-rules.md` с ручным процессом через GitHub Desktop и правилом согласованных исключений; создан `pm/next-actions.md` с ближайшими шагами по Git-процессу, QA, legal/infra blockers, premium positioning, закрытому тесту и монетизации
**Коммит:** N/A
**Статус:** ✅ локально выполнено
**Следующий шаг:** Алексей проверяет изменения в GitHub Desktop на ветке `docs/git-branch-protocol` и решает, коммитить ли их

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-06-28 — Codex

**Задача:** Записать пожелание Алексея по ритму разбора веток в roadmap
**Результат:** В `shared/ROADMAP.md` добавлен пункт "Git-процесс: разбор веток и merge в `main`": Алексей поддерживает вариант B — 1 раз в неделю + срочно для P0/P1; правило ждёт мнение Юры / Claude и финальное утверждение Алексея
**Коммит:** N/A
**Статус:** ✅ выполнено
**Следующий шаг:** Получить ответ Юры / Claude и после этого оформить финальное правило команды для GitHub Desktop

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-06-28 — Codex

**Задача:** Подготовить запрос к Claude Юры по правилу разбора веток и merge в `main`
**Результат:** Создан бриф `pm/agent-inbox/codex-to-claude-2026-06-28-branch-main-rule.md`; правило не утверждено и не внесено в roadmap до ответа Claude и решения Алексея
**Коммит:** N/A
**Статус:** ✅ выполнено
**Следующий шаг:** Алексей передаёт бриф Юре/Claude; после ответа принять вариант ритма и оформить правило в документах

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-06-28 — Codex

**Задача:** BACK-021 — голосовой ввод через MediaRecorder + Whisper
**Результат:** В `index.html` добавлен MediaRecorder flow с отправкой audio blob на `/transcribe` и fallback на SpeechRecognition; worker commit `339b301` добавил Whisper endpoint через `OPENAI_KEY`.
**Коммит:** app `feat(voice): add MediaRecorder voice input`; worker `339b301`
**Статус:** ⚠️ Ready for QA
**Следующий шаг:** Добавить secret `OPENAI_KEY`, задеплоить worker/app и пройти live smoke на iPhone Telegram WKWebView и Android.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-06-28 — Codex

**Задача:** BACK-020 — подтверждение email в профиле для связки аккаунтов
**Результат:** В `index.html` добавлена кнопка подтверждения email, обработка `?verify_email=TOKEN` и обновление статуса `Подтверждён ✅`; worker commit `e815266` добавил Resend-письмо, D1/KV хранение token и проверку конфликта занятого email.
**Коммит:** app `feat(auth): add profile email verification`; worker `e815266`
**Статус:** ⚠️ Ready for QA
**Следующий шаг:** Смержить/deploy app и worker, применить D1 migration `0004_email_verifications.sql`, пройти live smoke: запрос письма, переход по ссылке и конфликт уже существующего email.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-06-28 — Codex

**Задача:** BACK-017 — оживить настройки уведомлений
**Результат:** В `index.html` удалены лишние toggles уведомлений, добавлены рабочие настройки каналов, утренний брифинг с time picker и просроченные задачи; worker commit `b3aa1d6` сохраняет настройки в D1/KV и отдаёт bot scheduler брифинги/просрочки.
**Коммит:** app `feat(notifications): add live notification settings`; worker `b3aa1d6`
**Статус:** ⚠️ Ready for QA
**Следующий шаг:** Смержить/deploy, применить D1 migration `0003_notification_settings.sql`, проверить сохранение настроек и сообщения бота.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-06-28 — Codex

**Задача:** BACK-016 — расширенный профиль пользователя
**Результат:** В `index.html` добавлена расширенная карточка профиля: фото с placeholder под R2, имя, системный ID, телефон/email со статусами, Telegram-привязка, `О себе` со счётчиком и дата рождения; стили вынесены в `styles/screens/profile.less`.
**Коммит:** `feat(profile): add extended user profile fields`
**Статус:** ⚠️ Ready for QA
**Следующий шаг:** Проверить профиль визуально; отдельной задачей подключить backend/R2 сохранение профиля.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-06-28 — Codex

**Задача:** BACK-010 — Telegram Stars / ЮKassa
**Результат:** В `index.html` добавлен Telegram Stars payment flow через `Telegram.WebApp.openInvoice`; worker commit `d57771c` создаёт invoice link и bot подтверждает `successful_payment`, после чего Premium активируется в Worker.
**Коммит:** app `feat(payments): add Telegram Stars payment entrypoint`; worker `d57771c`
**Статус:** ⚠️ Ready for QA
**Следующий шаг:** Смержить/deploy app и worker, затем пройти live smoke внутри Telegram Mini App; YooKassa остаётся следующим card-provider решением.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-06-28 — Codex

**Задача:** Фаза 11 — относительные даты в карточках задач
**Результат:** В `index.html` добавлен общий formatter дат: карточки задач показывают `сегодня`, `вчера`, `N дней назад`, `завтра`, `через N дней` и `просрочено на N дней` вместо абсолютных дат.
**Коммит:** `feat(tasks): show relative dates in task cards`
**Статус:** ✅ выполнено
**Следующий шаг:** После merge можно продолжать следующую задачу из roadmap/backlog; BACK-008 остаётся заблокированным до credentials, BACK-009 ждёт merchant approval VK.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-06-28 — Codex

**Задача:** BACK-009 — VK Pay для подписки
**Результат:** В `index.html` VK-контекст переводит payment screen на `VKWebAppShowOrderBox`, а обычный web/TG flow остаётся на CloudPayments. В `vk.html` кнопка `Купить план` теперь открывает VK Pay вместо заглушки и обновляет Premium UI после успешного bridge-ответа.
**Коммит:** `feat(payments): add VK Pay subscription flow`
**Статус:** ⚠️ готово к live QA
**Следующий шаг:** Проверить оплату внутри VK Mini App; после успешного smoke перевести BACK-009 в Done.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---### 2026-06-27 — Codex

**Задача:** BACK-014 — подготовка кода под PostgreSQL заранее
**Результат:** В `4e-worker` смержен PostgreSQL storage adapter для `app_sessions`/`app_task_lists` и добавлен будущий DDL `migrations/postgres_app_state.sql`. Без `POSTGRES_URL` production продолжает работать через D1/KV; live credentials не требовались.
**Коммит:** `37f9dda` (`feat(worker): prepare PostgreSQL storage adapter`), merge `a97d768`
**Статус:** ✅ выполнено
**Следующий шаг:** BACK-008 остаётся manual blocker: Алексей создаёт Yandex Cloud PostgreSQL cluster и передаёт credentials/connection settings.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---### 2026-06-27 — Codex

**Задача:** BACK-013 — Семантический HTML + aria-label
**Результат:** В `index.html` добавлены `<main>`, `<header>`, `<nav>` для app/root, главного экрана, voice header и нижней навигации; иконочные nav/action элементы получили `aria-label`, `role="button"` и `tabindex="0"`. Визуальные классы и JS id/onclick сохранены.
**Коммит:** `refactor(ui): add semantic HTML landmarks`
**Статус:** ✅ выполнено
**Следующий шаг:** Следующая Codex-задача без внешних credentials — BACK-014: подготовка кода под PostgreSQL заранее.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-06-27 — Codex

**Задача:** Синхронизировать roadmap/backlog со статусом от Юры
**Результат:** В `shared/ROADMAP.md` и `pm/backlog.md` зафиксированы закрытые BACK-001/002/003/004/005/006/012 и Resend-домен; РКН и Yandex Cloud PostgreSQL отмечены как ручные действия Алексея; Codex-задачи сейчас — семантический HTML и подготовка PostgreSQL-кода
**Коммит:** N/A
**Статус:** ✅ выполнено
**Следующий шаг:** Выбрать следующую Codex-задачу: семантический HTML или подготовка PostgreSQL-кода

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-06-27 — Codex

**Задача:** BACK-012 — CSS-архитектура LESS + BEM + минификация
**Результат:** Inline CSS из `index.html` вынесен в LESS-модули `styles/variables.less`, `styles/layout.less`, `styles/screens/home.less`, `profile.less`, `tasks.less`, `voice.less`; добавлен `styles/main.less`. В `package.json` добавлены `build:css` и `watch:css`, сборка создаёт `styles.css` и `styles.min.css`, а `index.html` подключает минифицированный файл.
**Коммит:** `refactor(css): migrate to LESS + BEM architecture`
**Статус:** ✅ выполнено
**Следующий шаг:** После merge можно продолжать следующую задачу из roadmap/backlog; BACK-008 остаётся заблокированным до Yandex Cloud credentials.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-06-27 — Codex

**Задача:** BACK-008 — перенос ПД в Yandex Cloud PostgreSQL
**Результат:** Задача не стартовала по коду: Yandex Cloud PostgreSQL cluster ещё не создан, credentials/connection settings отсутствуют. BACK-006 KV→D1 уже закрыт и смержен; следующий технический шаг заблокирован ручной подготовкой инфраструктуры.
**Коммит:** `docs(process): close BACK-006, mark BACK-008 blocked`
**Статус:** ⚠️ заблокировано
**Следующий шаг:** Юрий создаёт Yandex Cloud PostgreSQL cluster и передаёт credentials/connection settings; после этого Codex продолжает BACK-008.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-06-27 — Codex

**Задача:** Объединить roadmap-документы в один источник
**Результат:** `pm/roadmap.md` объединён с `shared/ROADMAP.md` и удалён; инструкции и ссылки обновлены, единственный актуальный roadmap теперь `shared/ROADMAP.md`
**Коммит:** N/A
**Статус:** ✅ выполнено
**Следующий шаг:** Проверить, удобно ли команде вести стратегию и PM-план в одном `shared/ROADMAP.md`; затем закоммитить docs-изменения

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-06-27 — Codex

**Задача:** BACK-006 — миграция KV → D1 для sessions/tasks
**Результат:** В `4e-worker` добавлен D1 binding `DB`, миграции `0001_sessions_tasks.sql`/`0002_app_kv_state.sql`, Worker переведён на ES module entrypoint для D1. Новые sessions пишутся в `app_sessions`, task lists — в `app_task_lists`; старые KV `session:*`/`tasks:*` читаются fallback-ом и автопереносятся при доступе. Production Worker задеплоен как version `0b66977a-0b23-4cdf-bd92-c5ec38e2ee1c`; live smoke подтвердил D1 rows для session/task и 404 в KV по новым `session:*`/`tasks:*`.
**Коммит:** `0a035c9` (`feat(worker): store sessions and tasks in D1`)
**Статус:** ✅ выполнено
**Следующий шаг:** Следующий backlog item — BACK-007: уведомление РКН; следующий Codex-технический item — BACK-008: перенос ПД в Yandex Cloud PostgreSQL.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-06-27 — Codex

**Задача:** BACK-005 — единая модель пользователя VK + TG + Email
**Результат:** PR `fix/unified-user-identities` смёржен в `main` worker (`d5af7aa`), production Worker задеплоен как version `ff365be0-59d3-4307-9c15-54ab037e2917`. Live smoke прошёл: временный email-аккаунт привязан к Telegram через `initData` и VK через `launchParams`, затем `/auth/vk` и `/auth/me` вернули тот же canonical `user.id`; тестовые KV-ключи удалены.
**Коммит:** `1a593fb` (`fix(auth): unify VK Telegram and email identities`)
**Статус:** ✅ выполнено
**Следующий шаг:** Следующий backlog item — BACK-006: миграция KV → D1.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-06-27 — Codex

**Задача:** BACK-004 — тестовый платёж, прогнать webhook до конца
**Результат:** Production `/payment/webhook` проверен на временном тестовом пользователе: webhook вернул `code:0`, пользователь перешёл `trial` → `paid`, срок Premium увеличился с 30 до 60 дней. Тестовые KV-ключи `user:*`, `user_id:*`, `tx:*`, `notifs:*` удалены после smoke.
**Коммит:** `docs(process): close BACK-006, mark BACK-008 blocked`
**Статус:** ✅ выполнено
**Следующий шаг:** Следующий backlog item — BACK-005: единая модель пользователя VK + TG + Email.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-06-27 — Codex

**Задача:** BACK-002 — сброс пароля, backend reset endpoints
**Результат:** В `4e-worker/worker.js` добавлены совместимые маршруты `/auth/reset-request` и `/auth/reset-confirm`; reset-confirm принимает `newPassword` и старое поле `password`; ссылка в письме ведёт на `https://mrktggod.github.io/4e-app/?reset=TOKEN`.
**Коммит:** `a0965de` (`feat(auth): add password reset endpoints`)
**Статус:** ✅ выполнено
**Следующий шаг:** BACK-002 закрыт: live smoke прошёл, письмо пришло, кнопка сброса открыла форму, пароль сохранён. Пользователь ввёл тот же пароль, но reset token и backend confirm-flow отработали.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-06-26 — Codex

**Задача:** BACK-001 — Email через Resend, пользователи не получают писем
**Результат:** В `4e-worker/worker.js` удалён hardcoded Resend key, отправка теперь использует runtime secret `RESEND_KEY`, ошибки Resend/fetch обрабатываются контролируемо, `/auth/forgot-password` возвращает `502` если письмо существующему пользователю не отправилось
**Коммит:** `086f19b` (`fix(worker): use Resend secret for email delivery`), branch `origin/fix/resend-email-secret`
**Статус:** ✅ выполнено
**Следующий шаг:** BACK-001 закрыт: письмо сброса дошло, Resend доставил. Клик по ссылке и смена пароля относятся к BACK-002.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-06-26 — Codex

**Задача:** Исправить PM-roadmap/backlog по замечанию Юры
**Результат:** `pm/roadmap.md` и `pm/backlog.md` привязаны к реальной стратегии `shared/ROADMAP.md`; добавлено правило не использовать generic-стратегию про управление проектом; backlog связан с Linear `ALE-5`
**Коммит:** N/A
**Статус:** ✅ выполнено
**Следующий шаг:** Проверить live-сценарий Фазы 9 и заводить подтверждённые P0/P1 баги отдельными Linear issues

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-06-25 — Codex

**Задача:** BACK-003 — установить Фазу 9: биометрическое согласие 152-ФЗ для голосового ввода
**Результат:** В `index.html` добавлен экран согласия перед первым запуском микрофона, guard в `openVoice()`, ссылка на `privacy.html` в форме входа, строка отзыва согласия в настройках безопасности; карты файлов и PM-статус обновлены
**Коммит:** `legal: biometric consent and privacy policy`
**Статус:** ✅ выполнено
**Следующий шаг:** После push проверить live `mrktggod.github.io/4e-app/privacy.html` и ручной сценарий микрофона в Telegram WebView

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-06-25 — Codex

**Задача:** Исправить `BUG-2026-06-25-002` — сброс пароля принимает некорректный email и может вести на пустой экран
**Результат:** Добавлена валидация email и inline-ошибка, серверный ответ обрабатывается без пустого экрана, нижняя навигация скрыта на auth/reset-flow, баг переведён в Ready for QA
**Коммит:** N/A
**Статус:** ✅ выполнено
**Следующий шаг:** Задеплоить через git push и проверить сценарий в Telegram WebView

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-06-25 — Codex

**Задача:** Зафиксировать P1-баг восстановления пароля по скринам пользователя
**Результат:** В `pm/bugs.md` добавлен `BUG-2026-06-25-002`, создана задача для разработки, в QA-чеклист добавлены проверки невалидного email и пустого экрана после сброса пароля
**Коммит:** N/A
**Статус:** ✅ выполнено
**Следующий шаг:** Передать задачу разработчику и после фикса проверить auth/regression-сценарии

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-06-25 — Codex

**Задача:** Закрепить напоминание о синхронизации перед работой
**Результат:** В инструкции добавлено правило: перед началом работы напоминать и выполнять `git fetch origin` + `git pull --rebase`
**Коммит:** N/A
**Статус:** ✅ выполнено
**Следующий шаг:** Применять это правило в начале каждой новой задачи

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-06-25 — Codex

**Задача:** Ввести понятные заголовки коммитов для всей команды
**Результат:** Добавлен `shared/COMMIT_CONVENTION.md`, правило подключено в инструкции Codex/Claude/Cowork и README
**Коммит:** N/A
**Статус:** ✅ выполнено
**Следующий шаг:** Использовать формат `type(scope): что изменилось` во всех следующих коммитах

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-06-25 — Codex

**Задача:** Убрать локальные абсолютные пути из документации и добавить защиту
**Результат:** Локальные Mac/Windows user-пути заменены на переносимые `<repo-root>` / `<worker-repo-root>` / относительные пути; добавлены `scripts/check-portable-paths.sh`, `.githooks/pre-commit` и GitHub Actions path guard
**Коммит:** `docs: remove local absolute paths from docs`
**Статус:** ✅ выполнено
**Следующий шаг:** Запушить маленький docs-fix

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-06-25 — Codex

**Задача:** Исправить пустой экран после reload/logout и подсветку нижнего меню
**Результат:** Главный экран сбрасывает внутренний скролл при показе, пункты меню подсвечиваются через `data-nav`, logout явно открывает экран входа, приватные экраны без token перекидывают на login, VK-адаптер не перехватывает login вне VK-контекста
**Коммит:** `d8aead3`
**Статус:** ✅ выполнено
**Следующий шаг:** Проверить на реальном Telegram WebView после деплоя

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-06-25 — Codex

**Задача:** Проверить и подготовить `4e-app` к разработке и тестированию
**Результат:** Добавлены карты файлов, обновлены инструкции агентов, добавлен `.gitignore`, уточнён PM/QA-контур; локальный smoke-test страниц прошёл
**Коммит:** `d8aead3`
**Статус:** ✅ выполнено
**Следующий шаг:** Коммит/пуш подготовленных файлов или переход к сбору первых багов

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-06-24 (сессия 2) — Cowork (Claude)

**Задача:** Баги навигации: мессенджер для admin, порядок кнопок, подсветка, баг чатов
**Результат:** Скрыт мессенджер для не-admin; новый порядок кнопок (задачи→календарь→mic→мозг); зелёная подсветка активной кнопки; добавлен 'chats' в noNav; защищены auto-redirect таймеры; `console.log` в openChats для диагностики
**Коммит:** `b1ce786`
**Статус:** ⚠️ частично — баг с кнопкой чатов ещё не протестирован
**Следующий шаг:** Юрий тестирует кнопку мессенджера в Telegram на телефоне

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-06-24 — Cowork (Claude)

**Задача:** Создать shared-папку с документацией для нового члена команды  
**Результат:** Созданы `4e-app/CLAUDE.md`, `shared/ROADMAP.md`, `shared/DEVELOPMENT_HISTORY.md`, `shared/WORK_LOG.md`  
**Коммит:** N/A (Юрий пушит вручную)  
**Статус:** ✅ выполнено  
**Следующий шаг:** Юрий пушит файлы в репо и выдаёт доступ новому участнику

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-06-24 (сессия 3) — Cowork (Claude)

**Задача:** Патч 10 — починить веб-версию на десктопе (множественные экраны одновременно)  
**Результат:** Добавлен CSS override после `@media(min-width:1440px)` — приложение показывается как mobile-frame 430px по центру браузера; override сбрасывает принудительный `display:flex!important` на `#task-detail`, `#voice`, `#chat-conv` из патча 07  
**Коммит:** `b936f64`  
**Статус:** ✅ выполнено

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-05 — Codex

**Задача:** BACK-040 — вынести тарифы в worker `tariff-config` и подключить paywall к конфигу
**Результат:** В `4e-worker/worker.js` добавлены публичный `/tariff-config` и admin API `/admin/users`, `/admin/users/:id`, `/admin/users/:id/plan`, `/admin/tariff-config` с защитой по `ADMIN_SECRET`; Telegram Stars и card webhook читают длительность плана из конфига. В `index.html` paywall и экран подписки больше не используют хардкоженный `PLANS`: цены, тексты, benefits, feature-list и trial-progress загружаются из worker-конфига.
**Коммит:** pending
**Статус:** ✅ выполнено
**Следующий шаг:** залить `ADMIN_SECRET` в staging/prod secrets, проверить `/admin/tariff-config` curl-ом и отдать BACK-040 в QA
**Следующий шаг:** Проверить https://mrktggod.github.io/4e-app в десктопном браузере

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-06 — Codex

**Задача:** BACK-049 — закрепить UI-архитектурное правило LESS + BEM и запретить рост inline-долга
**Результат:** Добавлены `docs/ui-architecture-rules.md` и `scripts/check-ui-architecture.sh`; правило внесено в AGENTS/CLAUDE/COWORK, `pm/backlog.md` и `shared/ROADMAP.md`; pre-commit и GitHub Actions теперь проверяют, что `index.html` не наращивает inline `style`, inline handlers и inline script/style blocks.
**Коммит:** N/A
**Статус:** ✅ выполнено
**Следующий шаг:** При следующих UI-задачах переносить затронутые стили в LESS и обработчики в JS, не делая массовый рефакторинг всего `index.html`.

### 2026-07-12 — Codex

**Задача:** NEW-008 — убрать конфликт поля ввода `ask` с мобильной клавиатурой во VK WebView
**Делал:** Codex
**Коммит:** pending
**Состояние:** ✅ Выполнено для этой итерации
**Комментарий:** В `platform-adapter.js` замена `body.paddingBottom` на CSS-переменную `--app-keyboard-offset`, в стилях `ask-bar` добавлен режим `ask-bar--keyboard-open`. Smoke на локальном `http://127.0.0.1:4173/`: экран `ask`, оффсет клавиатуры `260px`, `input.bottom=568`, панель ввода поднята (`padding-bottom=276px`), нижняя навигация не перекрывает поле.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---### 2026-07-12 — Codex

**Задача:** NEW-001 — staging smoke по утреннему брифингу и account-scoped notification prefs
**Делал:** Codex
**Коммит:** pending
**Состояние:** ✅ Выполнено
**Комментарий:** Прогнан живой smoke локальной ветки против staging worker `https://restless-lab-d737-staging.shelckograff.workers.dev` через fetch-rewrite. На двух свежих staging-аккаунтах подтверждено: ключи `notif_prefs:<userId>` разные, bare `notif_prefs` не создаётся, `morningBriefing=true` + `briefingTime=08:45` сохраняются у первого пользователя локально и на сервере, второй пользователь эти настройки не наследует, повторный вход первого восстанавливает его собственные значения. Это закрывает исходный баг про «плавающий» утренний брифинг между профилями.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---### 2026-07-12 — Codex

**Задача:** NEW-017 — проверить календарь на показ реальных задач вместо демо-набора
**Делал:** Codex
**Коммит:** pending
**Состояние:** ✅ Выполнено
**Комментарий:** Перепроверено на двух поверхностях. (1) Локальная ветка `.tmp-4e-app-publish` против staging worker через fetch-rewrite: после регистрации свежего аккаунта и seed-а задач `Smoke calendar alpha/beta` календарь показывает именно их, без демо-сигналов. (2) Реальная staging-страница `https://4-ai-staging.pages.dev/`: после регистрации свежего аккаунта и seed-а задачи `Stage calendar task` календарь показывает реальную задачу `13 июля — Мария — Stage calendar task`; демо-набор не воспроизводится. Исходный баг про демо-задачи считаем закрытым как неподтверждённый на текущем коде/деплое. Отдельно замечено: нижний блок «Все дедлайны» по умолчанию остаётся в состоянии «Выберите дату», но это уже другой UX-вопрос, не демо-данные.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---### 2026-07-12 — Codex

**Задача:** BACK-030 — staging smoke по structured assignee и доставке задачи другому пользователю 4
**Делал:** Codex
**Коммит:** pending
**Состояние:** ✅ Выполнено
**Комментарий:** Прогнан `api-smoke` против `https://restless-lab-d737-staging.shelckograff.workers.dev`. RAW-результат по BACK-030 цепочке: `register/login/auth-me 200`, второй пользователь `register/login 200`, привязка Telegram для creator/receiver `200`, `tasks.create 200`, после создания у задачи сохранены normalized `assigneeUsername` и `assigneeTgId`, в `tasks.list.receiver` задача видна у получателя, затем `done-task 200` и `delete-task 200`. Это закрывает живой smoke для share-flow.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---
### 2026-07-12 — Codex

**Задача:** SMART-013 — починить AI-декомпозицию задачи на этапы и перепроверить сохранение checklist
**Делал:** Codex
**Коммит:** pending
**Состояние:** ✅ Кодовый фикс готов, branch smoke зелёный
**Комментарий:** Найден и исправлен реальный дефект в `index.html`: общий `aiCall()` бил в корень worker вместо `/anthropic`, из-за чего `Разбить на этапы` сохранял мусорный пункт `Ошибка: "Not found"`; дополнительно очищен parser step-list от fenced JSON / служебных строк. После фикса fresh-target smoke локальной ветки `http://127.0.0.1:4173/?fresh=...` с fetch-rewrite на staging worker создаёт задачу, вызывает `decomposeCurrentTask()` и сохраняет 8 нормальных шагов и в UI, и в persisted `checklist`. Отдельно зафиксировано расхождение поверхности: реальная `https://4-ai-staging.pages.dev/` пока на старом деплое и ещё не содержит `decomposeCurrentTask`, так что live deploy smoke возможен только после публикации ветки.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---### 2026-07-12 — Codex

**Задача:** SMART-013 — live staging deploy smoke после фикса AI-декомпозиции
**Делал:** Codex
**Коммит:** pending
**Состояние:** ✅ Выполнено
**Комментарий:** Для безопасного smoke собран временный staging-артефакт из `HEAD` с подменой `const WORKER` на `https://restless-lab-d737-staging.shelckograff.workers.dev`, затем выполнен `wrangler pages deploy ... --project-name 4-ai-staging --branch dev`. Wrangler вернул deployment URL `https://c4b8195f.4-ai-staging.pages.dev`. На этом live deployment headless smoke подтвердил, что `decomposeCurrentTask` существует, страница смотрит в staging worker, и сценарий `создать задачу -> Разбить на этапы` сохраняет 8 нормальных шагов как в UI, так и в persisted `checklist`. Отдельно замечено, что алиас `https://4-ai-staging.pages.dev/` некоторое время оставался на старом деплое, поэтому для проверки использовался прямой deployment URL.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---### 2026-07-13 — Codex

**Задача:** NEW-021 — календарь: блок `Все дедлайны` пуст до клика по дню
**Делал:** Codex
**Коммит:** d005913
**Состояние:** ✅ Кодовый фикс готов
**Комментарий:** В `index.html` вынесен отдельный рендер нижнего списка дедлайнов: `renderCalendarDeadlinesList(tasks)` сразу показывает все активные дедлайны, отсортированные по сроку, вместо заглушки `Выберите дату`. Верхний блок `Дедлайны` по-прежнему остаётся day-specific и обновляется по клику на день, то есть дефект закрыт без изменения основной логики выбора даты.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---### 2026-07-13 — Codex

**Задача:** NEW-020 — замерить субъективную медлительность голосового ввода без слепого фикса
**Делал:** Codex
**Коммит:** pending
**Состояние:** ✅ Кодовый measurement-контур готов, нужен один живой smoke
**Комментарий:** В `index.html` вокруг текущего voice-flow (`openVoice` → `SpeechRecognition` → `sendVoiceMessage` → `createTaskFromChat`/`sendAsk`) добавлена живая телеметрия: после каждого запуска приложение пишет breakdown в `window.__voicePerfLast`, копит последние 10 сэмплов в `window.__voicePerfHistory` и логирует `[voice-perf]` в console. Метрики раскладывают путь на `recognitionMs`, `preDispatchUiMs`, `branchMs`, `totalMs`, а также сохраняют branch (`task`/`ask`), статус и ошибку. Параллельно статический аудит уже показал вероятную главную причину ощущения "медленно": после `SpeechRecognition.onresult` код ещё примерно 3.6 секунды удерживает пользователя на анимационных шагах через каскад `setTimeout`, и только потом реально вызывает `sendVoiceMessage()`. Следующий шаг — снять один живой sample на staging и решить, оптимизируем ли сначала искусственную UI-паузу или backend-ветку.

---
### 2026-07-13 — Codex

**Задача:** CI / team-sync handoff — запушить честный `pm/team-sync.md`
**Делал:** Codex
**Коммит:** `2cebc26`
**Состояние:** ✅ Выполнено
**Комментарий:** В `.tmp-4e-app-publish/pm/team-sync.md` уже лежал корректный незакоммиченный апдейт с ответом Алексею по состоянию `feat/admin-tariff-api` и отдельной записью про payment security P0. Контент не переписывался: перед коммитом проверен diff, подтверждено, что это именно локально забытый процессный push-gap, а не новый смысловой конфликт. Файл закоммичен как есть, а после расхождения с `origin/feat/admin-tariff-api` сохранён через merge рядом с payment-P0 цепочкой, без перетирания привезённых записей.

---

### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 8, платёжная аналитика по воронке
**Результат:** Поверх существующего `audit_events` добавлен узкий payment-event слой без отдельной инфраструктуры: app теперь отправляет user-step события `paywall_viewed`, `plan_selected`, `checkout_started`, а worker автоматически пишет `invoice_created`, `payment_provider_callback_received`, `payment_verified`, `payment_failed/payment_refunded`, `entitlement_activated` вокруг CloudPayments и Telegram Stars. Для этого добавлен endpoint `/analytics/payment-event`, а серверные платёжные хендлеры начали логировать lifecycle сами, так что воронка больше не заканчивается одним фактом «у пользователя стал paid`.
**Коммит:** worker `f57149b` (`feat(analytics): track payment funnel events`), app `pending`
**Статус:** ✅ базовая payment funnel analytics заведена end-to-end
**Следующий шаг:** если останется время — отдельно сверить, нужен ли ещё объём для `ANALYTICS-001`, но P0 payment-block уже закрыт по сути

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 7, честный paywall copy
**Результат:** В defaults worker и app убраны ложные формулировки про «подписку», «автопродление каждый месяц» и «отмену в любой момент», хотя текущий monetization-flow продаёт разовый доступ на фиксированный срок. Базовые тексты теперь говорят о `Доступе к 4`, `разовом доступе на 30/365 дней` и `разовом доступе без автопродления`, а заметка про VK Pay честно переведена в статус отложенного способа до server-side verification.
**Коммит:** worker `7411667` (`fix(payments): make paywall copy honest`), app `pending`
**Статус:** ✅ paywall copy приведён в соответствие реальной модели оплаты
**Следующий шаг:** перейти к задаче 8 — добавить платёжную аналитику по воронке и provider callbacks

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 6, зачистить simulatePaymentSuccess и локальные self-activation хвосты
**Результат:** Из production UI убрана оставшаяся локальная активация Premium без серверного подтверждения: `simulatePaymentSuccess()` больше не меняет пользователя и только явно сообщает, что тестовая активация отключена, а `startVKPayment()` перестал вызывать локальный `onPaymentSuccess()` даже в случае client-side success статуса. Экран `payment-success` теперь используется только как отображение уже подтверждённого server-state, а не как механизм самоназначения entitlement в клиенте.
**Коммит:** app `pending`
**Статус:** ✅ client-side self-activation для платежей вычищена из боевого потока
**Следующий шаг:** перейти к задаче 7 — сделать paywall copy честным и убрать формулировки про автопродление/отмену там, где его нет

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 5, VK Pay только за feature flag
**Результат:** В tariff-config добавлен явный флаг `payments.vkPayEnabled` с дефолтом `false`, и app перестал автоматически выбирать VK Pay только по факту запуска внутри VK Mini App. Пока серверной верификации для VK Pay нет, боевой путь уходит на подтверждаемые провайдеры, а включение VK Pay теперь возможно только осознанным конфигом через admin-layer, а не скрытой клиентской эвристикой по окружению.
**Коммит:** worker `3c83e57` (`fix(payments): gate vk pay behind config`), app `pending`
**Статус:** ✅ VK Pay выведен из production-path до появления backend verification
**Следующий шаг:** перейти к задаче 6 — зачистить simulatePaymentSuccess()/локальные self-activation хвосты

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 4, Telegram Stars completion только от доверенного источника
**Результат:** Закрыт обходной completion-контур для Stars: бот теперь подписывает raw JSON тела `successful_payment` через общий секрет, а `4e-worker` принимает `/payments/telegram-stars/complete` только с валидной подписью, совпавшим `telegramId`, `payload`, `totalAmount`, `currency=XTR` и обязательными charge ids. Серверная активация entitlement больше не зависит от голого клиентского POST, а фронт после Telegram Stars перестал включать локальный fallback `onPaymentSuccess()` при неуспевшем polling — если webhook ещё не дошёл, UI честно ждёт серверное подтверждение.
**Коммит:** worker `5979f38` (`fix(payments): trust telegram stars bot callbacks`), app `pending`
**Статус:** ✅ Telegram Stars переведён на signed bot completion без client-side self-activation
**Следующий шаг:** перейти к задаче 5 — убрать VK Pay из боевого пути за feature flag, пока нет серверной верификации

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 3, CloudPayments webhook HMAC + order/amount/idempotency
**Результат:** Для карточной оплаты добавлен серверный `pending order` контур: app перед открытием CloudPayments сначала получает из worker подтверждённый `invoiceId`/`accountId`/`amount`/`data`, а webhook в `4e-worker` теперь активирует Premium только после проверки `Content-HMAC` по официальной схеме CloudPayments, совпадения `invoiceId`, `AccountId`, `Amount`, `Currency` и живого pending-order в KV. Старый эвристический trust по `Description`/клиентскому payload убран: без серверного заказа и валидной подписи entitlement не включается. На клиенте карточный успех тоже больше не включает Premium мгновенно локально — сначала идёт повторный `auth/me` до серверного подтверждения webhook.
**Коммит:** worker `c39eeb1` (`fix(payments): verify cloudpayments webhooks`), app `pending`
**Статус:** ✅ CloudPayments переведён на signed callback + server-side order verification
**Следующий шаг:** перейти к задаче 4 — убрать слепое доверие в Telegram Stars completion и добавить серверную подпись/проверку источника

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 2, единая entitlement-модель для premium capability
**Результат:** В `4e-worker` premium-доступ перестал жить в разрозненных проверках `plan/trialEndsAt`: добавлены канонические `syncUserEntitlement()` и `hasPremiumAccess()`, а `publicUser` и `toAdminUser` теперь отдают единый объект `entitlement` как источник правды для статуса и срока доступа. Серверные premium-gate перенесены на этот слой для `/anthropic`, `save-task`, `update-task` и `transcribe`, поэтому клиент больше не может честно выглядеть premium только за счёт локального состояния или обходного payload.
**Коммит:** worker `036ac78` (`fix(payments): unify premium entitlement gates`)
**Статус:** ✅ единая entitlement-модель заведена в worker и стала обязательной для premium-capability
**Следующий шаг:** перейти к задаче 3 — закрыть CloudPayments webhook HMAC, сумму/заказ и replay/idempotency на сервере

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — задача 1, честная сверка backlog перед фиксом
**Результат:** В pm/backlog.md уточнены monetization-статусы без переписывания несвязанных итогов: BACK-004 явно ограничен functional webhook smoke и больше не выглядит как закрытый security-proof; BACK-009 и BACK-010 теперь честно говорят, что текущая Ready for QA покрывает UI/bot entrypoint, но не backend verification/durable entitlement для реальных денег; BACK-040 дополнен примечанием, что production /tariff-config может отвечать default-конфигом с updatedAt: 0, а не подтверждённой admin-записью. Отдельно заведён новый P0 BACK-059 на unified entitlement model (hasPremiumAccess) как базовый блокер для всех платных capability.
**Коммит:** pending
**Статус:** ✅ backlog приведён к честному описанию payment-risk до кодовых фиксов
**Следующий шаг:** перейти к BACK-059/задаче 2 — собрать единый entitlement gate в 4e-worker, а затем уже переносить на него CloudPayments, Stars, voice, AI и premium-capabilities

---### 2026-07-13 — Codex

**Задача:** CI / team-sync handoff — починить guard workflow на GitHub Actions runner
**Делал:** Codex
**Коммит:** pending
**Состояние:** ✅ Выполнено
**Комментарий:** По живым GitHub Actions logs для `Quality guard` на PR #27 и PR #34 подтверждена одна и та же причина падения: на `ubuntu-latest` отсутствует `rg`, из-за чего `check-portable-paths.sh` и `check-ui-architecture.sh` падают на `command not found`, а UI guard потом ещё и даёт ложный `index.html must link styles.min.css`. Фикс сделан в одном месте: в `.github/workflows/path-guard.yml` добавлен шаг установки `ripgrep` перед guard-скриптами, чтобы обе проверки работали на runner так же, как локально, без переписывания самих shell-скриптов.

---
### 2026-07-13 — Codex

**Задача:** CI / staging handoff — обновить `pm/team-sync.md` для Алексея
**Делал:** Codex
**Коммит:** pending
**Состояние:** ✅ Выполнено частично / staging handoff готов, production всё ещё заблокирован
**Комментарий:** В `pm/team-sync.md` обновлён payment-P0 блок до реального состояния после сегодняшних прогонов: добавлен прямой staging URL `https://c4b8195f.4-ai-staging.pages.dev/`, список UI smoke (`HOME-001`, `NEW-006`, `NEW-008`, `NEW-021`) и честный payment smoke status. Зафиксировано, что positive CloudPayments (`200` / `{"code":0}`) и fake HMAC (`403` / `{"code":13}`) уже подтверждены live, а production по-прежнему блокируется на трёх хвостах: `badAmount` body, replay/idempotency и Telegram Stars после восстановления `BOT_TOKEN`/secret env.

---
### 2026-07-13 — Codex

**Задача:** Payment security P0 — verify push, production deploy и живой prod smoke
**Делал:** Codex
**Коммит:** pending
**Состояние:** ✅ Выполнено
**Комментарий:** Сначала закрыто критичное расхождение по push: подтверждено буквально, что `HEAD == origin/feat/admin-tariff-api == f90a8392e0b72b4e4ad3d611e76c0367738802cb`, а `pm/team-sync.md` на remote уже содержит team-sync и staging handoff. После этого Codex независимо прогнал staging webhook smoke из своего shell: для CloudPayments подтвердились `positive` (`200` / `{"code":0}` + рост `accessUntil`), `fake HMAC` (`403` / `{"code":13}`), `badAmount` (`400` / `{"code":11}`) и idempotency; для Telegram Stars — `positive`, `fake-signature` (`403`) и `replay` (`duplicate: true`). Затем выполнен production deploy `npx wrangler deploy` в `4e-worker-p0`: опубликована версия `fa422fd3-3531-4cb2-9bfb-97f0cf6100e0`, custom domain `https://edge.4-ai.site`. На production тем же независимым shell-smoke повторно подтверждены CloudPayments `positive/fake/badAmount/idempotency` и Telegram Stars `positive/fake/replay`. Важная находка по ходу проверки: `/payment/webhook` принимает CloudPayments callback как `application/x-www-form-urlencoded`, а не JSON; именно это сначала дало ложный `200 {"code":0}` без изменения `accessUntil`, после чего smoke был повторён в правильном wire-format и стал зелёным.

---
### 2026-07-13 — Codex

**Задача:** INFRA-005 — довести VK production deploy через Yandex RU proxy до живого smoke
**Делал:** Codex
**Коммит:** pending
**Состояние:** ✅ Выполнено
**Комментарий:** В `.tmp-4e-app-publish` повторно запущен `npm run deploy:vk-hosting` с `VK_API_BASE_URL=https://d5dg7uthvqp4ebomg3rl.ccx97b51.apigw.yandexcloud.net`. Сборка `.vk-hosting-dist` прошла, `vk-miniapps-deploy` загрузил version `1783968473`, обновил dev URLs и дошёл до ручного production-confirm слоя VK. В живой интерактивный deploy-сеанс были переданы коды из VK Administration, после чего Юрий подтвердил практический runtime-smoke: приложение открывается и работает в самом VK-приложении. Этого достаточно, чтобы закрыть хвост `INFRA-005` как выполненный, даже несмотря на неидеальный финальный вывод CLI.

---
### 2026-07-14 — Codex

**Задача:** Ночная сессия: BACK-055/056, NEW-003/004/007/014/015/016, HOME-001, ONBOARD-001, BACK-059, ANALYTICS-001; затем fix staging auth post-success crash.
**Делал:** Codex
**Коммит:** 17f5d84, a7daa31, 9f97dc7
**Состояние:** ✅ Ready for QA
**Комментарий:** В `.tmp-4e-app-publish` сохранён ночной пакет home/dashboard/task UX: action-feed уведомлений (BACK-055), исправление focus copy (BACK-056), доработки HOME-001 и связанных NEW-003/004/007/014/015/016, плюс ONBOARD-001 как побочный ночной проход. В `4e-worker` сохранены premium gates и lite activation analytics (BACK-059, ANALYTICS-001) поверх актуального origin без перезаписи payment-security P0. Отдельно исправлен staging auth bug: после успешных `POST /auth/register` и `POST /auth/login` фронт падал на клиенте в профиле из-за обращения к неэкспортированной `buildReferralLink()`, поэтому UI оставался на auth-экране и показывал ложный тост `Нет соединения`; фикс — отвязка `renderExtendedProfile()` от скрытой глобали и явный экспорт helper в `scripts/auth.js`.

---
<!-- Добавляйте новые записи ВЫШЕ этой строки -->

### 2026-07-08 — Codex

**Задача:** Процессный долг после долгой сессии (зелёная блокировка): закрытие Задачи 0, обновление AGENTS и check-ui-architecture, подготовка team-sync.
**Делал:** Codex
**Коммит:** pending
**Состояние:** ✅ Выполнено для этой итерации
**Комментарий:** Внесены: запись в WORK_LOG, новый pm/team-sync.md, обновление AGENTS.md, расширение guard-а кодировки.

## 2026-07-14 overnight staging QA follow-up (Codex)
- BUG-2026-07-14-001: доведён до live staging green. Реальный browser-smoke на `https://4-ai-staging.pages.dev/` после уже внесённых auth-фиксов прошёл оба UI-сценария `Регистрация` и `Войти`: после submit экран переходит на home, `Нет соединения` и `ReferenceError` не воспроизводятся. Console содержит только штатные Telegram warnings про `Changing swipes behavior`.
- ONBOARD-001: подтверждён empty-state home для нового аккаунта. Видна guided-card `Первый AI-план за 60 секунд` с CTA `Добавить задачу`, а quick-add реально открывается и не является мёртвой кнопкой.
- HOME-001: подтверждён новый home-layout (`Сегодня`, focus-card, compact metrics, top-list) и основные точки входа: profile, notifications, AI-chat, calendar. После добавления первой задачи home перестраивается в `1 задача требуют внимания` + `Топ-1 задач`.
- NEW-003 / NEW-004: профиль на staging показывает один верхний avatar (`Изменить фото`) и компактный блок `Личные данные аккаунта` без старой отдельной тяжёлой карточки.
- NEW-005 / NEW-015 / NEW-016: после quick-add длинная задача с исполнителем `Антон` отображается без развала UI; в home/focus/statistics видна unified meta `Работа · поставлена сегодня · дедлайн сегодня`, а focus-card/focus-panel не конфликтуют с декоративным элементом.
- NEW-014: отдельная сводка `Фокус дня` подтверждена живым кликом по focus-card. Открывается overlay со списком задач и CTA `Открыть все задачи`, который реально ведёт на экран `Статистика`.
- NEW-007: в task detail после скролла вниз вкладка `История` открывается и показывает timeline-entry `Создана задача` для только что созданной задачи. Базовый history-path живой.
- NEW-021 / BUG-2026-07-14-005: reproduced. Календарь не показывает дедлайн задачи, хотя тот же дедлайн уже виден в home/focus meta; после явного клика по дню UI меняет подпись, но список остаётся пустым.
- BUG-2026-07-14-004: новая находка. В AI-чате quick action `📊 Статистика` не даёт нормального ответа и рендерит ошибку `messages.0.id: Extra inputs are not permitted`.
- BUG-2026-07-14-002: старый `404` на `/analytics/lite-event` в текущем live staging не подтверждён. Pages сейчас указывает на `https://restless-lab-d737-staging.shelckograff.workers.dev`, прямой smoke `register -> login -> POST /analytics/lite-event` вернул `200 {ok:true}`, а home load не дал console-ошибок вокруг lite analytics. Но `/analytics/summary` без `x-admin-secret` всё ещё отвечает `401`, так что end-to-end подтверждение прихода событий в summary остаётся отдельной админ-проверкой.
- Tooling: починен `.tmp-4e-app-publish/scripts/check-cp1251-mojibake.mjs` — проверка больше не зависает на гигантском append-only `shared/WORK_LOG.md`, и now returns `CP1251 mojibake check passed: 0 suspicious tokens`.
- BACK-059: expired-account smoke этой ночью не закрыт. Без admin fixture / истёкшего entitlement не удалось честно воспроизвести expired path; оставить как BLOCKED для отдельного QA с подготовленным пользователем.
- Bot-live retry: отдельный live-bot smoke этой ночью не доведён; нужен локальный runtime с доступным `BOT_TOKEN` в env или отдельное подтверждение через staging bot path.
- Bot-local runtime follow-up: в `4e-worker` локальный `npm run start` поднимается после нормализации env-имен (`BOT_API_TOKEN -> BOT_TOKEN`, `ANTHROPIC_KEY -> ANTHROPIC_API_KEY`) и печатает `🛡 4 бот запущен...`. Полный live inbound smoke этой ночью всё равно не выполнен, потому что внешний Telegram message/update в сессию не подавался.

## 2026-07-15 - post-QA sprint cleanup (BUG-004 / BUG-005 / bot runtime)

**Задача:** довести post-QA brief после ночного smoke: честно перепроверить `BUG-2026-07-14-004` и `BUG-2026-07-14-005`, не ослабить mojibake-checker, добрать staging proof и ещё раз пройти bot/runtime path без ручных шагов Юрия.

**Результат:** Для `BUG-2026-07-14-004` подтверждён фронтовый root cause: `sendAsk()` слал в Anthropic `messages` из `askHistory` вместе с запрещённым `id`, что и давало `messages.0.id: Extra inputs are not permitted`. В `.tmp-4e-app-publish/index.html` добавлена `sanitizeClaudeMessages()`, staging Pages вручную перелит сначала на `https://b39e029a.4-ai-staging.pages.dev`, затем после календарного фикса на `https://73d33de6.4-ai-staging.pages.dev`; live smoke на свежем URL подтвердил `POST /anthropic -> 200` и отсутствие `validation_error` в браузере.

**Результат:** Для `BUG-2026-07-14-005` подтверждён именно branch-local календарный баг, а не CAL-скоуп. Причина была в том, что calendar path парсил дедлайны отдельной функцией и не понимал относительные строки `сегодня/завтра`, хотя home/statistics уже жили на `parseTaskDate()`. После переключения `parseCalendarTaskDeadline()` на общий parser live smoke с задачей `Smoke calendar task` (`deadline: сегодня`) показал её в календарном блоке `Все дедлайны` как `сегодня / Я — Smoke calendar task`.

**Проверка guard-а:** `scripts/check-cp1251-mojibake.mjs` не ослаблен, а ускорен. Убрано исключение `shared/WORK_LOG.md` из scan-таргетов, вместо дорогого `text.slice(0, offset).split(...)` добавлен предрасчёт `lineStarts` + бинарный поиск номера строки. Smoke-проверка с временным `pm/_mojibake-smoke.md` на заведомо искажённом тестовом токене дала ожидаемый fail (`6 suspicious fragment(s)/token(s)`), после удаления файла checker снова проходит зелёно.

**Бот/runtime:** внешний live inbound message по-прежнему не подтверждён, но bot-path стал честнее. Прямой `getMe` по токену вернул `@Denzel89bot`, а локальный `npm run start` в `4e-worker` реально стартует и печатает `🛡 4 бот запущен...`, если перед запуском сделать mapping `BOT_API_TOKEN -> BOT_TOKEN` и `ANTHROPIC_KEY -> ANTHROPIC_API_KEY`. Это же расхождение env-имён отдельно записано в `pm/team-sync.md`, чтобы не потерять operational root cause.

**Следующий шаг:** короткий ручной QA можно вести уже против `https://73d33de6.4-ai-staging.pages.dev`; для полного bot-live confirmation всё ещё нужен реальный внешний Telegram update/message, которого в эту сессию не было.

## 2026-07-15 - chat regressions on staging (task-first + composer)

**Задача:** добить новый QA-бриф по AI-чату на staging: `BUG-2026-07-15-001` (task-first сломан) и `BUG-2026-07-15-002` (composer под нижним меню) без выхода в CAL/payment/prod.

**Результат:** Для `BUG-2026-07-15-001` root cause найден во фронтовом flow `sendAsk()`. До фикса chat path сначала ждал ответ модели, а затем ещё и мог уйти в локальный clarify before save, потому что task-intent fallback вызывал `buildAskTaskClarification()` раньше `createTaskFromChat()`. Это ломало правило SMART-004: явный task-intent мог приводить к уточнению до сохранения задачи. Исправление сделано прямо в `index.html`: task-intent path (`<create_task>` и `looksLikeTaskRequest()`) теперь сохраняет задачу сразу, а подтверждение prepend-ится перед AI-текстом; `fallbackTaskFromText()` дополнительно нормализует фразы вроде `сделать текст завтра` в задачу `Сделать текст` с `deadline: завтра`.

**Проверка:** fresh Pages deploy `https://1103d926.4-ai-staging.pages.dev`, live browser smoke на mobile viewport. Репро `сделать текст завтра` теперь даёт сообщения `сделать текст завтра` -> `✅ Задача «Сделать текст» добавлена. Понял! Создаю задачу 📝`, а тот же fresh аккаунт сразу видит в `/tasks` запись `text: "Сделать текст"`, `deadline: "завтра"`, `source: "ai_chat"`, `originalMsg: "сделать текст завтра"`.

**Результат:** Для `BUG-2026-07-15-002` root cause тоже подтверждён на живом layout, а не предположением. До фикса AI-чат открывался с hidden nav, но после blur/send keyboard-close path снова показывал `global-nav`, хотя активный экран оставался `ask`; замер через Playwright на viewport `390x844` дал `overlap=64px` между `.ask-bar` и `#global-nav`. Фикс узкий: экран `ask` помечен как `screen--no-bottom-nav`, `noNav`-контуры в JS теперь включают `ask`, а `styles.css` и `styles.min.css` получили ask-specific padding без нижнего nav reserve и отдельный класс `ask-bar-icon` вместо новых inline-стилей.

**Проверка:** повторный live smoke на `https://1103d926.4-ai-staging.pages.dev` показывает `navHidden=true` и `overlap=0` и до, и после отправки сообщения; composer остаётся видимым и кликабельным над местом нижнего меню.

**Следующий шаг:** ручной QA по AI-чату вести уже против `https://1103d926.4-ai-staging.pages.dev`, а не alias `https://4-ai-staging.pages.dev`, потому что alias у этого проекта уже не раз отставал от свежего Pages deploy.

## 2026-07-15 - staging admin smoke for BACK-059 and analytics summary

**Задача:** с живым staging `ADMIN_SECRET` добить два старых хвоста: `/analytics/summary` end-to-end для `BACK-038 / ANALYTICS-001` и expired-path smoke для `BACK-059`, не рефакторя entitlement/payment код.

**Результат:** `ADMIN_SECRET` как таковой больше не blocker. `GET /analytics/summary` на staging worker `https://restless-lab-d737-staging.shelckograff.workers.dev` отвечает `200`, а не `401`. Но сам e2e оказался красным: fresh staging account успешно отправляет `plan-view`, `focus-open`, `statistics-open` в `/analytics/lite-event` (все три запроса `200 {"ok":true}`), а summary до и после smoke не меняется совсем — `auditEvents.total = 0`, а `summary.activation.dailyValue.planView/focusOpen/statisticsOpen` остаются `0`. Это заведено как `BUG-2026-07-15-003`, а статусы `BACK-038` и `ANALYTICS-001` переведены из `Ready for QA` в `Blocked`.

**Результат:** Для `BACK-059` сама entitlement-логика в эту сессию не опровергнута, но staging не дал подготовить expired fixture честным admin-only способом. `GET /admin/users` с секретом вернул 67 users и `expiredCount = 0`. Текущий `PUT /admin/users/:id/plan` умеет только двигать срок вперёд через positive `days`, а `trialDays` в `/admin/tariff-config` и dev-seed `accessDays` нормализуются через positive integer fallback, так что сделать свежего expired-user обратимо через существующий admin API нельзя. Это оформлено как `BUG-2026-07-15-004`, а `BACK-059` переведён в `Blocked` именно на fixture-path, без самовольной правки worker-кода.

**Безопасность:** секрет нигде не записывался в файлы проекта, не коммитился и использовался только как runtime header `x-admin-secret: <redacted>` в живых запросах.

**Следующий шаг:** чтобы закрыть `BACK-059`, нужен либо узкий admin fixture path для expired entitlement, либо заранее подготовленный истёкший staging-account; чтобы закрыть `ANALYTICS-001`, нужно починить доставку `recordAuditEvent()` -> `audit_events`/summary read path, потому что UI и endpoint уже доходят до `200`.
## 2026-07-15 - analytics fix and expired fixture on staging

**Задача:** закрыть два blocker-а из `ANALYTICS-001 / BACK-038` и `BACK-059` по брифу `codex-session-2026-07-15-analytics-fix-and-expired-fixture.md`, не трогая payment decision logic и не выходя в production.

**Результат:** Диагностика сначала показала скрытый surface mismatch: staging app в `.tmp-4e-app-publish/index.html` всё ещё был жёстко привязан к `https://edge.4-ai.site`, то есть к production custom-domain worker, а не к `restless-lab-d737-staging`. Параллельно CORS в worker разрешал только точный `https://4-ai-staging.pages.dev`, но не preview-поддомены вида `https://1103d926.4-ai-staging.pages.dev`, из-за чего preview-origin получал `Access-Control-Allow-Origin: *` и credentials-flow был ненадёжен. Во фронте `WORKER` переведён на hostname-based выбор: staging/preview Pages и localhost теперь ходят в `https://restless-lab-d737-staging.shelckograff.workers.dev`, production остаётся на `https://edge.4-ai.site`; в `4e-worker/worker.js` CORS расширен на `*.4-ai-staging.pages.dev`.

**Результат:** По самой analytics-цепочке root cause подтверждён сырым staging-smoke и D1 evidence. До фикса fresh user на staging worker успешно проходил `POST /auth/register` и три `POST /analytics/lite-event` (`plan-view`, `focus-open`, `statistics-open`), но `GET /analytics/summary` до и после оставался нулевым (`auditEvents.total = 0`, `dailyValue.planView/focusOpen/statisticsOpen = 0/0/0`), а `wrangler d1 execute --env staging` показывал пустой `audit_events`. По коду выяснилось, что email-auth users сохранялись только в KV (`saveUser()`), тогда как analytics-summary и `audit_events` жили в D1 с FK на `users`. Фикс узкий: в `saveUser()` добавлен D1 shadow-sync профиля (`users.id/display_name/status/created_at/updated_at`), без изменений entitlement/payment веток. После deploy staging worker `bb9f7019-c4fc-4f29-8e3c-f9a965b3a2cd`, затем `9ce798f7-3da2-4991-b327-3a8bea3217de`, live smoke стал зелёным: summary вырос с `users.total=10, auditEvents.total=0` до `users.total=11, auditEvents.total=4`; `activation.auth.register.d1=1`; `dailyValue.planView/focusOpen/statisticsOpen = 1/1/1`. Отдельный `wrangler d1 execute --env staging` подтвердил состояние после репликации: `audit_events.total=5`, `register=2`, `lite-plan/focus/statistics = 1/1/1`.

**Результат:** Для `BACK-059` добавлен staging-only reversible admin fixture path `PUT /admin/users/:id/fixture/expired`. Endpoint доступен только когда `APP_BASE_URL` у worker содержит `staging`, сохраняет backup user-state в KV, при `mode=apply` переводит `trialEndsAt` и `entitlement.accessUntil` в прошлое, а при `mode=revert` восстанавливает исходные данные. Live smoke проведён через уже существующий gated endpoint `POST /auth/link-telegram`: до fixture `200`, после `mode=apply` — `403`, после `mode=revert` — снова `200`. Это подтверждает expired-path без правки `hasPremiumAccess`, `getUserEntitlement`, webhook-ов и другой payment logic.

**Следующий шаг:** руками добрать QA уже на новом staging Pages deploy после push фронтовой правки `WORKER` hostname resolver; отдельно production по этому брифу не трогался.
## 2026-07-15 - env unification and worker.js.tmp cleanup audit

**Задача:** привести worker/bot runtime к одной env-конвенции, проверить staging и отдельно убедиться, что артефакт `worker.js.tmp` не участвует в реальном деплое.

**Результат:** В `4e-worker` подтверждено, что реальный deploy идёт из `worker.js` (`wrangler.toml: main = "worker.js"`), а текущего `worker.js.tmp` в рабочем дереве нет и путь `worker.js.tmp` не находится в git history этого репо. CI cleanup выполнен: из `.github/workflows/deploy.yml` убран старый шаг с `sed`-инъекцией секретов прямо в `worker.js`; `.gitignore` дополнен `worker.js.tmp`. Каноническая конвенция выбрана как `BOT_TOKEN` + `ANTHROPIC_API_KEY`: она уже совпадает с локальным bot runtime (`bot.js`, `src/bot/*`, `package.json start`) и с архитектурными docs. Worker-side env имена выровнены под неё: `worker.js` и `src/worker/auth/auth-routes.mjs` теперь читают `env.BOT_TOKEN` и `env.ANTHROPIC_API_KEY`.

**Результат:** Staging secrets аудированы без чтения значений. До правки на Cloudflare уже одновременно существовали старые и новые bot-имена (`BOT_API_TOKEN` и `BOT_TOKEN`), а для Anthropic был только старый `ANTHROPIC_KEY`, поэтому staging-мягкая миграция сведена к добавлению нового `ANTHROPIC_API_KEY` без трогания prod. После staging deploy `7205d97a-a310-4f5c-a83a-806656b437ee` live smoke зелёный: fresh user получил `POST /anthropic -> 200`, а Telegram-dependent path тоже прошёл через `POST /auth/link-telegram -> 200` и `POST /payments/telegram-stars/invoice -> 200` c `invoiceUrl`. Локальный `npm run start` под новой `.dev.vars` тоже стартует без manual mapping; короткий автозавершаемый run печатает `🛡 4 бот запущен...`.

**Следующий шаг:** Юрий вручную довыставляет canonical secret names на production (`ANTHROPIC_API_KEY`, при желании позже cleanup старых имён), после чего можно отдельной безопасной сессией убрать legacy secret names уже без staging-risks.

## 2026-07-15 - payment P0 verification on staging

**Задача:** добить verify-first бриф codex-session-2026-07-15-payment-p0-verification.md на staging без production deploy: проверить negative/positive payment-path для CloudPayments и Telegram Stars, прогнать unified entitlement gate через expired fixture, подтвердить судьбу simulatePaymentSuccess() и синхронизировать backlog по фактам.

**Результат:** По unified entitlement model staging verification зелёный. Через fresh user и reversible fixture PUT /admin/users/:id/fixture/expired подтверждено, что после mode=apply server-side gate закрывает все ключевые paid-path: /anthropic, /transcribe, x-action=save-task, x-action=update-task и даже unsigned bot-style save-task по 	elegramUserId возвращают 403, а после mode=revert entitlement и 	rialActive возвращаются в исходное состояние. Это поднимает BACK-059 из Ready for QA в Done: gate живой и проверен не по коду, а по реальным staging-ответам.

**Результат:** По payment provider paths staging verification красный и backlog обновлён вниз, а не вверх. Для CloudPayments bad/missing HMAC режется как ожидается, wrong-amount signed callback premium не активирует, но всё ещё отвечает {"code":0} вместо явного reject, и главное — positive signed callback на staging сейчас тоже не поднимает entitlement: пользователь остаётся на 	rial. Для Telegram Stars negative auth-часть тоже зелёная (ad signature -> 403), но signed completion-path сейчас не проходит: POST /payments/telegram-stars/complete с валидной HMAC подписью отвечает 404 {"ok":false,"error":"invoice not found"} даже после свежего invoice creation и короткой паузы. Поэтому BACK-004 и BACK-010 переведены в Blocked, чтобы backlog больше не выглядел оптимистичнее реального staging.

**Результат:** Отдельно подтверждён новый security follow-up вне самой entitlement-логики. Для active user worker принимает прямой POST / с x-action=save-task и 	elegramUserId без x-bot-signature / x-bot-timestamp / x-bot-nonce, создаёт задачу и отдаёт 200 {"ok":true}. Это не premium-bypass — expired fixture потом честно режет тот же путь — но это реальный missing bot-request authentication. По этой находке pm/bugs.md уже получил BUG-2026-07-15-005, а в backlog заведён новый P0 BACK-060.

**simulatePaymentSuccess():** проверено дополнительно: в app это остаётся только отключённым UI-stub без backend entitlement-активации; production-reachable self-activation path по этой функции не найден.

**Ручные действия / cowork sync:** сверил ручные прогоны из чата и наших файлов. Фикстура expired отработала как ожидается, staging secrets для smoke уже были выставлены вручную, а в логах команды теперь отражено, что payment P0 ещё не зелёный. Отдельно зафиксировано, что в одном из ручных PowerShell-выводов ADMIN_SECRET оказался напечатан в явном виде; сам секрет не записывался в проектные файлы, но его нужно ротировать в Cloudflare как скомпрометированный выводом терминала.

**Статус:** mixed
- BACK-059 -> Done
- BACK-004 -> Blocked
- BACK-010 -> Blocked
- BACK-060 -> Todo

**Следующий шаг:** чинить provider completion paths отдельно от entitlement gate: сначала CloudPayments positive/wrong-amount response semantics и entitlement activation, затем Telegram Stars invoice not found, затем закрыть BACK-060 с обязательной bot-signature проверкой на x-action bot-path.


## 2026-07-15 - BACK-060 bot signature guard

**Задача:** закрыть найденную на staging дыру, где worker принимал sessionless bot-style `x-action` запросы без `x-bot-signature` / `x-bot-timestamp` / `x-bot-nonce`.

**Что сделано:** в `4e-worker/worker.js` добавлена server-side проверка bot HMAC-подписи и окна свежести timestamp для sessionless bot-only POST действий (`save-message`, `register-chat`, `upsert-chat-members`, `get-chat-members`, `mark-chat-members-left`, `telegram-auth`) и для bot-scoped shared действий (`save-task`, `done-task`, `delete-task`, когда запрос идёт с `telegramUserId` или в `user_`/`group_` scope). Подпись считается по той же схеме, что уже использует `4e-worker/src/bot/worker-client.js`: `timestamp + nonce + method + path + body`.

**Статус:** `BACK-060` переведён в `Ready for QA`.

**Что осталось:** staging smoke без подписи должен вернуть `403`, а корректно подписанный bot-запрос должен проходить штатно.

## 2026-07-15 - BACK-060 second pass on staging

**Контекст:** Первый фикс `BACK-060` был закоммичен в `4e-worker` как `54583de` и задеплоен на staging, но live smoke показал, что unsigned `get-chat-members` всё ещё отдаёт `200`. Это подтвердило, что первая абстрактная guard-логика не закрыла маршрут фактически.

**Что сделано:** Во втором проходе защита перенесена в явные route-level `x-action` ветки `worker.js`. Вместо общего pre-pass каждый чувствительный bot action теперь читает body локально и отдельно валидирует `x-bot-signature` / `x-bot-timestamp` / `x-bot-nonce` перед handler-ом. Это распространяется на bot-only actions (`save-message`, `register-chat`, `upsert-chat-members`, `get-chat-members`, `mark-chat-members-left`, `telegram-auth`) и на bot-scoped shared actions (`save-task`, `done-task`, `delete-task`).

**Live результат:** second-pass staging deploy выполнен, после чего unsigned `POST /` с `x-action=get-chat-members` и body `{"chatId":"group_back060_smoke","limit":5}` начал возвращать `403 {"ok":false,"error":"bot signature invalid"}`. Это и есть нужное отрицательное доказательство, что дыра по missing bot-signature на staging закрылась.

**Статус:** `BACK-060` остаётся в `Ready for QA`, а не в `Done`, потому что signed happy-path (`200` с корректной подписью) в этом автономном проходе не был переподтверждён: в non-interactive shell не было видимого `BOT_TOKEN` для повторного подписанного smoke.

## 2026-07-15 - BACK-060 signed smoke complete

**Результат:** `BACK-060` закрыт полностью после ручного signed smoke Юрия на staging. Уже подтверждённый negative path остался зелёным (`unsigned get-chat-members -> 403 {"ok":false,"error":"bot signature invalid"}`), а signed happy-path теперь также подтверждён: `signed get-chat-members -> 200 {"ok":true,"members":[]}`.

**Статус:** `BACK-060` переведён из `Ready for QA` в `Done`.

## 2026-07-15 - payment provider P0 smoke recheck

**Задача:** перепроверить `BACK-004` и `BACK-010` после закрытия `BACK-060`, без новых ручных действий и без production deploy.

**Результат:** новый staging smoke показал, что provider completion-path уже работает при правильном wire-format. Для CloudPayments callback должен идти как `application/x-www-form-urlencoded` с `Content-HMAC` по raw form body; предыдущий красный synthetic smoke отправлял JSON и поэтому не доказывал реальный provider path. В корректном формате positive callback вернул `200 {"code":0}` и поднял entitlement, bad amount вернул `400 {"code":11}` без изменения entitlement, replay вернул `200 {"code":0}` без повторного продления. `BACK-004` переведён в `Done`.

**Результат:** Telegram Stars backend completion также перепроверен через fresh invoice creation и signed completion со строковым Telegram `invoice_payload`. Positive вернул `200` и поднял entitlement, wrong amount вернул `400 telegram stars amount mismatch`, replay вернул `200 duplicate:true` без повторного продления. Предыдущий `invoice not found` был вызван synthetic payload shape, где `payload` отправлялся объектом `{ invoiceId }`, а реальный bot отправляет `payment.invoice_payload` строкой. `BACK-010` возвращён в `Ready for QA`: backend P0 зелёный, но реальная покупка Stars в Telegram не прогонялась.

**Статус:** mixed
- `BACK-004` -> `Done`
- `BACK-010` -> `Ready for QA`

## 2026-07-15 — BACK-007 RKN/privacy live closeout

**Задача:** BACK-007 — закрыть уведомление РКН и видимость privacy-ссылок после live QA.
**Результат:** Source-check подтвердил ссылки на `privacy.html` на login/register и onboarding. Live staging check с follow-redirect подтвердил: `https://88193776.4-ai-staging.pages.dev/privacy.html` и `https://4-ai-staging.pages.dev/privacy.html` отвечают `200`, содержат заголовок `Политика конфиденциальности` и номер РКН `102299/77`.
**Статус:** Done для `BACK-007`.
**Следующий шаг:** продолжать по backlog-пунктам без ручных действий; ручные Telegram Mini App и microphone smoke не закрывать синтетически.

## 2026-07-15 — BACK-038 / ANALYTICS-001 live closeout

**Задача:** Закрыть analytics e2e после фикса D1 shadow-sync и admin summary.
**Результат:** На staging worker `https://restless-lab-d737-staging.shelckograff.workers.dev` fresh email-user зарегистрирован успешно, `POST /analytics/lite-event` для `plan-view`, `focus-open`, `statistics-open` вернули `200 {"ok":true}`. Прямой D1 query по marker `codex-back038-closeout` подтвердил строки `lite-plan-view=1`, `lite-focus-open=1`, `lite-statistics-open=1`. Admin `GET /analytics/summary` вернул `200`: `auditEvents.total=85`, `dailyValue.planView.d1=10`, `focusOpen.d1=4`, `statisticsOpen.d1=6`, `auth.register.d1=47`.
**Статус:** Done для `BACK-038`, `ANALYTICS-001`, `BUG-2026-07-14-002`, `BUG-2026-07-15-003`.
**Следующий шаг:** не требуются ручные действия; продолжать по backlog, кроме Telegram Mini App/microphone/manual visual smoke.

## 2026-07-15 — BACK-059 bug-status sync

**Задача:** Синхронизировать статус `BUG-2026-07-15-004` с уже закрытым `BACK-059`.
**Результат:** `BACK-059` уже находится в `Done` после staging negative tests через reversible expired fixture: premium-path возвращали `403` после `mode=apply` и восстанавливались после `mode=revert`. Связанный bug про отсутствие fixture path переведён из `Ready for QA` в `Done`, без изменений кода.
**Статус:** Done для `BUG-2026-07-15-004`.

## 2026-07-15 — bug status closeout from existing live smoke evidence

**Задача:** Закрыть bug-строки, где live-smoke evidence уже записан в `pm/bugs.md`, но статус оставался `Ready for QA`.
**Результат:** В `Done` переведены: `BUG-2026-07-14-004` (AI quick action statistics no validation error), `BUG-2026-07-15-001` (AI chat task-first creates task before clarification), `BUG-2026-07-15-002` (ask composer no longer overlaps bottom nav), `BUG-2026-07-14-003` (`/auth/telegram` no longer throws Worker 1101). Новых runtime-изменений нет; это синхронизация статусов с уже записанными staging/live smoke результатами.
**Статус:** Done для четырёх bug-строк.

## 2026-07-15 — BACK-051 account merge toast

**Задача:** BACK-051 — пользователь должен увидеть понятное уведомление после слияния аккаунтов.
**Результат:** Подтверждено, что email-login и Telegram legacy уже вызывают `showAccountMergeToast(d)` при `accountMerged`. Закрыт недостающий OAuth callback path для VK/Yandex: после `showAccountMergeToast(d)` обычный welcome-toast теперь показывается только при `!d.accountMerged`, чтобы merge-message не дублировался и не перетирался.
**Статус:** Done для `BACK-051`; runtime-код изменён только в `scripts/auth.js`.

## 2026-07-15 — BACK-056 after-22 focus copy closeout

**Задача:** BACK-056 / BUG-2026-07-05-003 — home focus copy не должен показывать отрицательное время после 22:00.
**Результат:** Current home focus block в `index.html` больше не зависит от часа: текст строится только от количества задач (`N задача/задачи/задач требуют внимания`, `Сегодня всё спокойно`) и subtitle `4 уже расставил приоритеты` / `План собран...`. Static grep по runtime не нашёл `22 -`, отрицательного времени или focus-copy `до конца дня`; найденные `до конца дня` относятся только к demo-chat текстам.
**Статус:** Done для `BACK-056` и `BUG-2026-07-05-003`.

## 2026-07-15 — SMART-001/002/006 status sync

**Задача:** Синхронизировать SMART-статусы, где staging-smoke evidence уже записан в work log/backlog.
**Результат:** `SMART-006` переведён в `Done` по staging AI smoke с реальными задачами и вопросами `Как меня зовут?`, `Что у меня горит?`, `Кому я больше всего должен?`. `SMART-001` и `SMART-002` переведены в `Done` по staging-worker smoke: roster в D1 `chat_members`, join/leave, `assigneeTgId`/`assigneeUsername` из mention/reply/fuzzy. `SMART-004` оставлен `Ready for QA`, потому что его живой bot-flow не закрывался в этом проходе.
**Статус:** Done для `SMART-001`, `SMART-002`, `SMART-006`.

## 2026-07-16 — BACK-060 / BUG-2026-07-15-005 status sync

**Задача:** Синхронизировать bug-status после полного закрытия bot-signature guard.
**Результат:** `BACK-060` уже находится в `Done`: second-pass route-level guard задеплоен, unsigned `get-chat-members` вернул `403 {"ok":false,"error":"bot signature invalid"}`, signed happy-path с реальным `BOT_TOKEN` вернул `200 {"ok":true,"members":[]}`. Дополнительно сверено, что bot runtime paths в `src/bot/tasks.js`, `src/bot/commands.js`, `src/bot/handler.js` ходят через `workerFetch()`, который подписывает запросы через `x-bot-timestamp`, `x-bot-nonce`, `x-bot-signature`.
**Статус:** `BUG-2026-07-15-005` переведён в `Done`; runtime-код не менялся.

## 2026-07-16 — BUG-2026-07-04-003 enter-login status sync

**Задача:** Сверить старый bug про Enter на email-входе.
**Результат:** Кодовая проверка подтвердила, что `submitLoginOnEnter(event)` уже реализован, а `platform-adapter.js` навешивает `keydown` на весь `#form-login`: Enter из `#login-email` и `#login-pass` проходит через `PLATFORM.shouldHandleEnterSubmit(event)`, вызывает `submitLoginOnEnter(event)` и далее `doLogin()`, если кнопка входа не disabled.
**Статус:** `BUG-2026-07-04-003` переведён в `Done`; runtime-код не менялся.

## 2026-07-16 — BUG-2026-07-05-001 bottom nav width status sync

**Задача:** Сверить старый bug про растянутую нижнюю панель браузера.
**Результат:** `BACK-046` уже находится в `Done` в backlog. Source-check подтвердил текущий desktop/web override: `#app` центрируется и ограничивается `max-width:430px`, `.bottom-nav-v2` получает `left:50%`, `transform:translateX(-50%)`, `width:min(100%,430px)`, а `#global-nav` — `width:min(calc(100vw - 28px),402px)`. Это закрывает исходный сценарий, где nav растягивался на ширину browser viewport.
**Статус:** `BUG-2026-07-05-001` переведён в `Done`; runtime-код не менялся.

## 2026-07-16 — BACK-055 notifications action-feed source QA

**Задача:** Закрыть `BACK-055` без ручного smoke, если source path покрывает DoD.
**Результат:** Source QA подтвердил реализацию в `scripts/task-ui-renderers.js`: `openNotifications()`/`loadNotifications()` грузят `/notifications`; фильтры и спокойные empty states есть; `getNotifTaskId()` нормализует `taskId`, `task_id`, `relatedTaskId`, `related_task_id`, `task.id`; action buttons показывают только возможные действия. Для task-linked уведомлений есть `К задаче` -> `openTaskById()`, `Готово` -> `markDoneKV()`, `Отложить` -> snooze menu `15 мин / 1 час / 3 часа / Завтра` и `update-task`; waiting-like payload получает `Написать`. Уведомления без `taskId` получают безопасный `Понятно`/fallback без невозможных действий.
**Статус:** Done для `BACK-055`; runtime-код не менялся.

## 2026-07-16 — BACK-016 extended profile source QA

**Задача:** Закрыть `BACK-016` по расширенному профилю без ручного smoke.
**Результат:** Source QA подтвердил профильный набор: единый `#profile-avatar` с photo picker, `#profile-name`, `#profile-user-id`, поля `name/phone/email/birthdate/about`, phone/email/telegram status badges, about counter, local draft save. Дополнительно закрыт маленький хвост после `NEW-003`: preview выбранного фото теперь пишет в актуальный `#profile-avatar` с fallback на старый `#profile-photo-preview`, если он когда-нибудь встретится в старой разметке.
**Статус:** Done для `BACK-016`.

## 2026-07-16 — BACK-039 completed tasks dashboard

**Задача:** BACK-039 — вкладка `Выполнено` должна иметь список завершённых задач и мини-дашборд.
**Результат:** В `openDoneList()` / `openFilteredTaskList(...)` добавлен мини-дашборд для done-режима: счётчики за сегодня, 7 дней и 30 дней, а также сворачиваемая секция `За неделю` со списком завершённых задач или empty-state. Даты берутся из существующего done/history timestamp helper с fallback на created timestamp для старых записей.
**Статус:** Done для `BACK-039`; live visual smoke не выполнялся.

## 2026-07-16 — BACK-028 productivity statistics source QA

**Задача:** BACK-028 — закрыть вкладку статистики результативности без ручного smoke, если source path покрывает DoD.
**Результат:** Source/runtime check подтвердил, что `openStatistics()` вызывает `loadStats(...)` по всем задачам из `allTasksCache`, а экран содержит общий прогресс, недельный график, активные задачи, блок обещаний, историю выполненных и советы 4. Дополнительно исправлен видимый mojibake стрелки периода в заголовках статистики: `в–ѕ` заменён на HTML-entity `&#9662;`.
**Статус:** Done для `BACK-028`; live visual smoke не выполнялся.

## 2026-07-16 — BACK-032 task chat/comments source QA

**Задача:** BACK-032 — подтвердить отдельный чат задачи с 4, комментарии и сохранение истории.
**Результат:** Source QA подтвердил фронт и worker: task-detail имеет вкладку `Обсудить задачу`, поле комментария и `addDetailComment()`; комментарий пользователя сохраняется через `/messages/task`, AI-ответ приходит через `/anthropic`, затем assistant reply/actions сохраняются тем же endpoint и отображаются в обсуждении и timeline истории. В worker `GET/POST /messages/task` проверяют ownership задачи через `resolveTaskForSession`, читают/пишут KV-историю по user/task key и ограничивают её `MAX_TASK_MESSAGES_PER_CHAT=80`.
**Статус:** Done для `BACK-032`; live smoke не выполнялся.

## 2026-07-16 — SMART-008 chat actions source QA

**Задача:** SMART-008 — подтвердить действия из AI-чата: перенести/закрыть/изменить/показать после подтверждения.
**Результат:** Source QA подтвердил два action path: общий AI-chat просит Claude добавлять `<task_actions>[...]</task_actions>`, парсит их через `parseAskActionsFromText()`, показывает preview `Предлагаемые действия` и выполняет только после `confirmAskActions()`. Поддержаны `complete`, `reschedule`, `edit`, `remind`, `show`; мутации идут через `done-task`, `update-task`, `setReminderOnWorker()` или локальный `openTask()`. Task-detail chat использует аналогичный preview/confirm через `confirmTaskChatActions()`.
**Статус:** Done для `SMART-008`; live AI smoke не выполнялся.

## 2026-07-16 — SMART-009 one clarification question

**Задача:** SMART-009 — AI-chat должен задавать максимум один уточняющий вопрос с кнопками, если для задачи не хватает дедлайна или исполнителя.
**Результат:** Подключён существующий clarification UI к реальному task-creation flow. Теперь при `<create_task>` или fallback task intent без дедлайна/исполнителя `startAskTaskClarification()` заменяет loading bubble на один вопрос с кнопками, сохраняет pending draft в `askHistory`, а `answerAskClarification()` после выбора вызывает `finalizeAskClarifiedTask()` и создаёт задачу. Если не хватает двух полей, задаётся только первый вопрос, чтобы сохранить обещание "максимум один".
**Статус:** Done для `SMART-009`; live AI smoke не выполнялся.

## 2026-07-16 — SMART-010 task dedup source QA

**Задача:** SMART-010 — подтвердить дедупликацию похожих задач при создании.
**Результат:** Source QA подтвердил, что `saveTaskWithDedup()` используется и в ручном создании, и в AI-chat creation path. `findSimilarActiveTask()` ищет похожие активные задачи по similarity score с boost за совпадающего исполнителя; пользователю показывается confirm `OK — объединить, Отмена — создать новую`. При подтверждении `mergeIntoSimilarTask()` дополняет существующую задачу через `update-task` и открывает merged task.
**Статус:** Done для `SMART-010`; live smoke не выполнялся.

## 2026-07-16 — SMART-012 adaptive briefing source QA

**Задача:** SMART-012 — проверить, можно ли закрыть адаптивное время брифинга/напоминаний.
**Результат:** Source QA подтвердил готовую часть: `adaptiveBriefing` собирает локальную активность пользователя (`task_create`, `ai_chat`, `task_done`, notifications) по часам, хранит последние 21 день, после 2+ дней активности выбирает лучший час в диапазоне 07:00–22:00 и сдвигает briefing на 1 час раньше, ограничивая итог 07:30–11:30. `applyAdaptiveBriefingIfNeeded()` сохраняет suggested time как `briefingTime` и обновляет controls. Отдельной адаптации обычных task-reminders не найдено.
**Статус:** `SMART-012` переведён в `Partial Done`, не `Done`.

## 2026-07-16 — VIRAL-002 referral source QA

**Задача:** VIRAL-002 — подтвердить реферальную ссылку, +30 дней обоим и счётчик приглашений.
**Результат:** Source QA подтвердил полный path: frontend принимает `ref/referral/invite`, сохраняет pending referral, строит ссылку через `PLATFORM.buildReferralLink()`, показывает её в профиле и копирует через `copyReferralLink()`. Worker держит `REFERRAL_BONUS_DAYS=30`; `applyReferralReward()` начисляет бонус invited user и inviter, увеличивает `referralCount`, защищается от self-referral/replay, а `publicUser()` отдаёт `referralCode/referralCount`. `ref` проходит через email register, OAuth, Telegram auth и VK auth.
**Статус:** Done для `VIRAL-002`; live referral smoke не выполнялся.

## 2026-07-16 — BACK-037 CI/API smoke source QA

**Задача:** BACK-037 — подтвердить CI и API smoke без нового ручного запуска.
**Результат:** Source QA подтвердил `.github/workflows/api-smoke.yml` на PR/main и `scripts/api-smoke.mjs`: reset-password empty/invalid, register/login/auth-me, two-user Telegram link/share-flow, tasks create/list/done/delete, optional SMART-013 decomposition и `transcribe(no-file)`. `path-guard.yml` ставит `ripgrep` на runner и гоняет portable paths, doc encoding и UI architecture guard. Более ранний WORK_LOG уже содержит успешный staging run против `restless-lab-d737-staging` от 2026-07-07.
**Статус:** Done для `BACK-037`.

## 2026-07-16 — BACK-057 offline free mode MVP

**Задача:** BACK-057 — начать бесплатный offline-mode без ручных секретов и без смены платёжной модели.
**Результат:** В `index.html` добавлен user-scoped localStorage-кэш задач и очередь офлайн-мутаций `save-task/update-task/done-task/delete-task`. `loadTasks()` при сетевой ошибке показывает последний сохранённый план и накладывает queued-изменения поверх кэша. `postTaskChatMutation()` теперь ставит поддержанные task mutations в очередь при network error, а `online` event запускает синхронизацию. `saveTaskToWorker()` и `saveTaskEdits()` используют общий mutation path, а `markDoneKV()` из `scripts/task-ui-renderers.js` больше не обходит offline queue прямым `fetch`.
**Статус:** `BACK-057` переведён в `Partial Done`: MVP cache+queue готов, но карточный статус `ждёт синхронизации`, Free-лимиты, offline AI draft и Premium Sync ещё не реализованы.

**Дополнение:** Queued-задачи теперь имеют видимый статус `ждёт синхронизации` в home meta и маленький badge в task-card, чтобы пользователь понимал, что изменение сохранено локально и ждёт сети.

## 2026-07-16 — VIRAL-001 share card MVP

**Задача:** VIRAL-001 — сделать первую шеринговую карточку плана/итогов дня без ручных интеграций.
**Результат:** На home добавлена кнопка `Поделиться планом дня`. `shareDailyCard()` строит PNG 1080x1350 через canvas: dark glass background, метрики `В работе / Выполнено / Обещания`, top задач или спокойный empty-state, watermark `4 · личный штаб дня`. Если браузер поддерживает `navigator.share({files})`, открывается системный share sheet; иначе файл скачивается как `4-plan-day.png`. Событие пишет `trackLiteEvent('share-card', ...)`.
**Статус:** `VIRAL-001` переведён в `Partial Done`: runtime MVP готов, live VK Stories/TG smoke остаётся ручным.

## 2026-07-16 — VIRAL-004 share card streak

**Задача:** VIRAL-004 — добавить streak и достижения в шеринговую карточку.
**Результат:** В canvas-карточку добавлен блок `Достижения`: streak `N дней с планом` считается по локальным датам созданных/закрытых задач, плюс выбираются 2–3 достижения (`закрыто сегодня`, `закрыто за 7 дней`, `в фокусе`, `обещаний под контролем`, fallback `план собран`).
**Статус:** Done для `VIRAL-004`; live visual smoke карточки не выполнялся.

## 2026-07-16 — VIRAL-006 weekly share summary MVP

**Задача:** VIRAL-006 — сделать еженедельную шерабельную AI-сводку `Твоя неделя`.
**Результат:** На home добавлена кнопка `Итоги недели`. `shareWeeklySummaryCard()` строит PNG 1080x1350 через canvas: метрики за 7 дней, ритм-график по дням, главные закрытые задачи и фокус-бейджи на следующую неделю. При поддержке `navigator.share({files})` открывается системный share sheet, иначе карточка скачивается как `4-week-summary.png`.
**Статус:** `VIRAL-006` переведён в `Partial Done`: runtime MVP готов, но live visual/share smoke на телефоне и настоящая AI-текстовка недели остаются отдельным хвостом.

## 2026-07-16 — VIRAL-003 restrained 4 persona MVP

**Задача:** VIRAL-003 — добавить сдержанную AI-персону в приложение.
**Результат:** Home focus-card и AI planner summary получили единый спокойный голос `4`: `4 рядом`, `я держу фокус`, `я держу спокойный штаб`, next-step copy. Реализация намеренно не добавляет тяжёлого маскота и не меняет HOME-001 layout.
**Статус:** `VIRAL-003` переведён в `Partial Done`: runtime tone MVP готов; brand bible, аватарные правила и связка с VK Clips остаются отдельным хвостом.

## 2026-07-16 — PLAT-002 PWA wrapper groundwork

**Задача:** PLAT-002 — подготовить PWA-обёртку как шаг к RuStore.
**Результат:** Добавлен `manifest.webmanifest`, PWA meta в `index.html`, регистрация `sw.js` и service worker с network-first navigation/offline shell cache. `scripts/build-pages-whitelist.mjs` теперь копирует `sw.js` в Pages artifact.
**Статус:** `PLAT-002` переведён в `Partial Done`: runtime groundwork готов; installed-PWA smoke, PNG/maskable icons и публикация в RuStore остаются отдельными шагами.

## 2026-07-16 — BETA-001 closed beta runbook

**Задача:** BETA-001 — подготовить закрытый тест 5-10 пользователей.
**Результат:** Добавлен `pm/beta-run-2026-07.md`: критерии выбора тестеров, текст приглашения, обязательный smoke перед приглашением, сценарии дня 1 и дня 2-3, формат feedback и критерии выхода/остановки.
**Статус:** `BETA-001` переведён в `Partial Done`: runbook готов, но реальный beta-run и перенос найденных blockers в `pm/bugs.md` остаются ручным этапом.

## 2026-07-16 — FEEDBACK-001 beta feedback loop

**Задача:** FEEDBACK-001 — подготовить быстрый feedback loop закрытого теста.
**Результат:** Добавлен `pm/feedback-loop-2026-07.md`: канал связи, сообщение тестеру, ежедневный ритуал разбора, формат записи в `pm/bugs.md`, шаблон daily-сводки и правило не раздувать скоуп во время beta.
**Статус:** `FEEDBACK-001` переведён в `Partial Done`: процесс готов, но реальный запуск с beta-пользователями и первые перенесённые blockers остаются ручным этапом.

## 2026-07-16 — INFRA-006 workspace unification plan

**Задача:** INFRA-006 — снизить риск работы в неправильной локальной копии.
**Результат:** Добавлен `pm/infra-006-workspace-unification.md`: предложены каноничные app/worker папки, preflight-команды перед задачей, маркировка `DO_NOT_WORK_HERE`, безопасный аудит копий и критерии закрытия.
**Статус:** `INFRA-006` переведён в `Partial Done`: план готов, но ручное решение по архивированию/удалению копий и закрепление правила остаются за Юрием/Алексеем.

## 2026-07-16 — BACK-011 command workspace spec

**Задача:** BACK-011 — подготовить основу командного workspace без реализации вслепую.
**Результат:** Добавлен `docs/tasks/BACK-011-command-workspace.md`: product promise, MVP/non-goals, роли, data model, API sketch, UI sketch, AI behavior, privacy/security checks и phased DoD.
**Статус:** `BACK-011` переведён в `Partial Done`: spec готов, реализация backend/frontend и QA с двумя аккаунтами остаются отдельными этапами.

## 2026-07-16 — PLAT-003 TWA/Capacitor roadmap

**Задача:** PLAT-003 — подготовить путь Google Play TWA → App Store Capacitor.
**Результат:** Добавлен `docs/tasks/PLAT-003-twa-capacitor-roadmap.md`: prerequisites после PWA, Android TWA phase, iOS Capacitor phase, payment-policy risks, non-goals и DoD.
**Статус:** `PLAT-003` переведён в `Partial Done`: roadmap готов, но реальные wrappers/store assets/payment decision/manual smoke остаются следующими этапами.

## 2026-07-16 — Product decision pack: calendar / omni / native sequencing

**Задача:** Зафиксировать продуктовые решения вместо дальнейшей реализации вслепую.
**Результат:** Добавлен `docs/tasks/PRODUCT-DECISIONS-2026-07-16.md`: северная звезда продукта, beta gate, calendar decision, omnichannel decision, native priority, growth/workspace boundaries и anti-scope rules. Обновлены `CAL-001-calendar-concept.md` и `OMNI-001-omnichannel-surfaces.md`.
**Статус:** `CAL-001` и `OMNI-001` переведены в `Partial Done`; `CAL-002` и `CAL-003` переведены в `Deferred` до beta/CAL-002 readiness.

## 2026-07-16 — Product decisions: onboarding wow and OAuth profile consent

**Задача:** Зафиксировать решения по `VIRAL-005` и `BACK-058`.
**Результат:** Добавлены `docs/tasks/VIRAL-005-first-ai-plan-wow.md` и `docs/tasks/BACK-058-oauth-profile-consent.md`. Решения: wow moment остаётся в first empty home, не отдельный wizard; OAuth profile data не запрашиваются "про запас", каждое поле требует отдельного consent и value.
**Статус:** `VIRAL-005` переведён в `Partial Done`; `BACK-058` переведён в `Deferred` до `BACK-045` live smoke, beta signal и consent copy.

## 2026-07-16 — Product decisions: native/platform sequencing

**Задача:** Зафиксировать порядок `NATIVE-*` и `PLAT-001`, чтобы не начинать платформенную экспансию до beta.
**Результат:** Добавлен `docs/tasks/NATIVE-PLATFORM-DECISIONS-2026-07-16.md`: priority order, decisions for share sheet/widgets, push actions, voice shortcuts, system calendar, geofencing and MAX.
**Статус:** `PLAT-001` и `NATIVE-001..005` переведены в `Deferred` до beta/native wrapper/CAL readiness по соответствующим условиям.

## 2026-07-16 — Release and beta gates

**Задача:** Зафиксировать go/no-go правила для closed beta, payment и production.
**Результат:** Добавлен `docs/tasks/RELEASE-BETA-GATES-2026-07-16.md`: closed beta gate, что можно включать в beta, что остаётся за ручным QA, payment gate, production gate, success metrics, stop conditions и утренний порядок проверки.
**Статус:** `BETA-001` получил явную ссылку на release gate; Ready for QA пункты не закрывались без ручного smoke.

## 2026-07-16 — Monetization decisions

**Задача:** Зафиксировать payment/product policy перед beta и paid launch.
**Результат:** Добавлен `docs/tasks/MONETIZATION-DECISIONS-2026-07-16.md`: payment-ready criteria, trial/beta policy, VK Pay decision, Telegram Stars decision, admin tariff decision и beta monetization posture.
**Статус:** `BACK-009`, `BACK-010`, `BACK-040` оставлены `Ready for QA`, но получили явные product gates; цена не менялась.

## 2026-07-16 — Ready for QA triage

**Задача:** Свести ручные `Ready for QA` пункты в утренний порядок проверки.
**Результат:** Добавлен `pm/ready-for-qa-triage-2026-07-17.md`: P0/P1 before beta, bot/group flow, payment QA, product/UI later QA, список того, что нельзя закрывать source-only, и правила pass/fail записи.
**Статус:** Backlog-статусы не закрывались; документ нужен для завтрашнего ручного smoke.

## 2026-07-16 — Beta invite pack

**Задача:** Подготовить готовые тексты для закрытого beta-run.
**Результат:** Добавлен `pm/beta-invite-pack-2026-07.md`: кого звать первым, длинное/короткое приглашение, follow-up через 2-4 часа, follow-up на день 2, ответы на blocker/feature request/payment question и шаблон daily summary.
**Статус:** `BETA-001` дополнен ссылкой на invite pack; реальная рассылка остаётся ручным этапом.

## 2026-07-16 — Post-beta decision tree

**Задача:** Подготовить правило выбора следующего продуктового шага после первых дней beta.
**Результат:** Добавлен `pm/post-beta-decision-tree-2026-07.md`: cases A-F для core broken, weak retention, time realism, outside capture, reminders value и team promises; есть template decision meeting и правило выбора 1-2 задач.
**Статус:** `FEEDBACK-001` дополнен ссылкой на decision tree; реальное применение после beta-feedback остаётся ручным этапом.

## 2026-07-16 — Morning command center

**Задача:** Сделать единый входной файл для утренней проверки после ночной подготовки.
**Результат:** Добавлен `pm/morning-command-center-2026-07-17.md`: порядок core QA, beta invite, fail-path, post-beta decision tree, список "не трогать утром", ссылки на decision docs и шаблон короткого отчёта.
**Статус:** Документ готов; runtime/backlog статусы не менялись.

## 2026-07-16 — Night handoff

**Задача:** Свести ночную работу в один проверяемый handoff.
**Результат:** Добавлен `pm/night-handoff-2026-07-16-to-17.md`: текущий HEAD, список runtime/doc коммитов, что открыть утром, pass/fail path, список "не трогать" и известный грязный build artifact.
**Статус:** Handoff готов; следующий шаг — ручной QA утром.

## 2026-07-16 — BACK-012 CSS architecture plan

**Задача:** Зафиксировать безопасный путь закрытия CSS/BEM долга.
**Результат:** Добавлен `docs/tasks/BACK-012-css-architecture-plan.md`: current state, decision not to do broad refactor before beta, allowed pre-beta fixes, post-beta cleanup sequence and DoD.
**Статус:** `BACK-012` оставлен `Partial Done`; broad inline/BEM cleanup deferred until after beta-critical QA.

## 2026-07-16 — SMART-012 adaptive reminders plan

**Задача:** Зафиксировать безопасный путь от adaptive briefing к adaptive task reminders.
**Результат:** Добавлен `docs/tasks/SMART-012-adaptive-reminders-plan.md`: current state, decision not to expand reminders before beta, signals, MVP phases, non-goals and DoD.
**Статус:** `SMART-012` оставлен `Partial Done`; adaptive task reminders deferred until beta proves reminder value.

## 2026-07-16 — BACK-057 offline mode plan

**Задача:** Зафиксировать границы Free offline mode после runtime MVP.
**Результат:** Добавлен `docs/tasks/BACK-057-offline-mode-plan.md`: current state, Free offline scope, Premium Sync separation, manual QA requirements and DoD.
**Статус:** `BACK-057` оставлен `Partial Done`; manual offline smoke is required before Done.

## 2026-07-17 — next-cycle matrix after overnight backlog/product pass

- Added `pm/next-cycle-matrix-2026-07-17.md` as the next-cycle routing layer for morning QA and post-QA work.
- Captured the do-first QA order: auth/registration, task-first flow, chat composer, entitlement/paywall, analytics.
- Split remaining backlog into safe buckets: Ready for QA, Partial Done without runtime changes, Deferred until explicit product/platform decision, and explicit no-touch items.
- Kept the current guardrails unchanged: no merge to main, no price change, no CAL implementation, no native launches, no OAuth profile expansion without consent, and no staging build artifact cleanup in this slice.