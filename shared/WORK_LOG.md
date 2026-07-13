# WORK LOG — Командный журнал задач

> Сюда пишут все участники команды после завершения задачи.  
> Формат: дата — агент — что сделано — статус.  
> Детальный технический лог: `../DEVELOPMENT_LOG.md`

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

---<!-- Добавляйте новые записи ВЫШЕ этой строки -->

### 2026-07-08 — Codex

**Задача:** Процессный долг после долгой сессии (зелёная блокировка): закрытие Задачи 0, обновление AGENTS и check-ui-architecture, подготовка team-sync.
**Делал:** Codex
**Коммит:** pending
**Состояние:** ✅ Выполнено для этой итерации
**Комментарий:** Внесены: запись в WORK_LOG, новый pm/team-sync.md, обновление AGENTS.md, расширение guard-а кодировки.
