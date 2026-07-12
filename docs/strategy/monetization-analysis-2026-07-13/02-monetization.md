# 2. Монетизация: готовность, риски и первый платёжный путь

## 2.1. Вердикт

Платёжный UI и backend-скелет существуют, но на текущем SHA проект **не готов к безопасной первой выручке**.

Блокируют четыре P0:

1. CloudPayments webhook активирует Premium без доказанной проверки HMAC и суммы.
2. Telegram Stars completion endpoint может активировать Premium без доказанной доверенной bot-подписи и сверки charge amount.
3. VK Pay меняет paid-state локально в UI без подтверждённого backend entitlement.
4. Premium-доступ проверяется по разным правилам: AI, задачи, transcribe и bot-path могут давать противоречивые права.

Это не повод откладывать монетизацию на месяцы. Это короткий security/integrity slice, который должен идти раньше public paywall.

## 2.2. Состояние по каналам

| Канал/зона | Реальное состояние | Вердикт |
|---|---|---|
| CloudPayments | Widget и webhook есть; synthetic test активировал Premium | **P0 blocked** до HMAC/order/amount/idempotency |
| Telegram Stars | Invoice создаётся из тарифа, app открывает invoice, bot-path существует | **P0 blocked** до trusted completion и charge validation |
| VK Pay | OrderBox открывается; UI локально ставит paid | **P0 / UI only** до backend verification и durable entitlement |
| YooKassa | Упоминается в roadmap/task title, SDK/endpoints/webhook не найдены | Not started; не блокирует первый платёж |
| Tariff config | Worker API live; app feature-ветка читает config | Worker deployed, production UI отстаёт |
| Admin tariff API | Код и ADMIN protection существуют | Ready for authorized smoke; секреты не проверялись |
| Trial/paywall | 30 дней и paywall UI есть | Нужен единый entitlement и согласованный copy |
| Referral reward | +30 дней обоим реализованы | Beta QA only до anti-fraud и reward gate |
| Revenue analytics | Audit events и summary есть | Недостаточно для revenue funnel/reconciliation |

## 2.3. P0: CloudPayments webhook

Текущий worker flow принимает поля статуса/пользователя/суммы/счёта и активирует Premium, но кодовый аудит не нашёл обязательной проверки `Content-HMAC`/`X-Content-HMAC` и сверки суммы с тарифом.

CloudPayments документирует HMAC headers для уведомлений и рекомендует сверять сумму, номер заказа и AccountId: [официальная документация CloudPayments](https://developers.cloudpayments.ru/).

### Почему предыдущий smoke недостаточен

Live smoke доказал, что endpoint может продлить пользователя. Но synthetic POST без provider authenticity доказывает функциональность обработчика, а не безопасность реального платежа.

### Safe flow

1. Server создаёт `payment_order`:
   - `orderId`;
   - canonical `userId`;
   - `planId`;
   - ожидаемая сумма/валюта;
   - статус `pending`;
   - expiry;
   - provider.
2. Frontend передаёт только opaque order ID и display values.
3. Webhook:
   - проверяет HMAC сырого body/params;
   - проверяет provider status;
   - сверяет `InvoiceId`, `AccountId`, amount, currency, plan;
   - фиксирует provider transaction ID;
   - идемпотентно меняет order → paid;
   - активирует entitlement один раз.
4. Повтор webhook возвращает success, но не продлевает второй раз.
5. Refund/cancel меняет ledger и entitlement по принятой политике.

## 2.4. P0: Telegram Stars completion

Invoice creation использует tariff values, что хорошо. Проблема в completion:

- публичный endpoint принимает данные завершения;
- bot-клиент умеет подписывать запрос, но Worker в текущем коде не проверяет эту подпись;
- не доказана сверка currency/total amount/provider charge с pending invoice;
- пользователь, знающий свой invoice ID, не должен иметь возможность сам завершить оплату.

### Safe flow

- entitlement выдаётся только из обработанного Telegram `successful_payment` update;
- bot → worker request подписан и проверен;
- invoice payload содержит opaque order ID;
- currency/amount/payload/provider charge ID сверяются;
- повтор update идемпотентен;
- client polling только читает order status и никогда не завершает payment.

## 2.5. P0: VK Pay

Сейчас app и `vk.html` после успешного bridge response локально обновляют plan/trial. Это визуальный optimistic success, а не источник истины.

Риски:

- после reload paid-state может исчезнуть;
- подделанный bridge/client state не должен давать Premium;
- canonical user backend не получает доказанный order;
- reconciliation/refund невозможны.

До server-side verification VK Pay либо скрывается feature flag, либо помечается недоступным. Публичный CTA «оплатить в VK» не должен вести в недолговечный локальный успех.

## 2.6. P0: единая модель доступа

Текущий worker:

- считает `plan === 'paid'` достаточным для AI без проверки окончания paid period;
- task creation смотрит на дату иначе;
- bot task path может обходить тот же gate;
- transcribe требует login, но не доказанный active Premium.

В результате возможна абсурдная ситуация: AI доступен «навсегда» после первой оплаты, но новые задачи после даты доступа запрещены.

### Целевая модель

```text
hasPremiumAccess(user, now) =
  entitlement.status == active
  AND entitlement.accessUntil > now
```

`plan` — это тип купленного продукта/история, а не бессрочное право.

Все платные точки используют одну функцию/сервис:

| Capability | Gate |
|---|---|
| AI chat / decomposition / generation | active entitlement |
| Task create/edit, если это Premium policy | одна согласованная policy |
| Voice/transcribe | active entitlement или явный free quota |
| Bot task path | тот же gate, что app |
| Advanced analytics | active entitlement |
| Cross-device sync | active entitlement по будущей policy |

Если планируется free manual mode, его capabilities перечисляются явно. `BACK-057` не нужен для первого платежа, но нельзя иметь неявный «полу-free» режим из разных if-условий.

## 2.7. Tariff и коммерческий copy

### Подтверждённое состояние

Production worker `/tariff-config` сейчас публично возвращает:

- trial: 30 дней;
- month: 990 ₽, 990 Stars;
- year: 9 504 ₽, 9 504 Stars;
- годовая display price: 792 ₽/месяц;
- `updatedAt: 0`, то есть production использует default config, не подтверждённую admin-запись.

Staging config отвечает, но часть русских строк повреждена в `????`.

Roadmap одновременно говорит, что ценовая модель должна быть отдельным решением. Значит цена уже технически опубликована до стратегического approval.

### Copy contradictions

- UI обещает «Автопродление каждый месяц», но текущий widget вызывает одноразовый `charge`;
- UI обещает «Отмена в любой момент», но self-service cancel flow отсутствует;
- некоторые экраны/тосты жёстко обещают 30 дней, хотя trial вынесен в config;
- production frontend ещё не читает config и может показывать другие значения;
- `simulatePaymentSuccess()` присутствует в production source и должен быть удалён или жёстко dev-gated.

### Решение до запуска

Для первой когорты честнее продавать:

> Разовый доступ Premium на 30 или 365 дней

Пока реального recurrent billing/cancel management нет, слово «автопродление» убрать. Recurrent subscription делать отдельным платёжным продуктом после первой выручки.

## 2.8. Рекомендуемый первый rail

### Рекомендация: CloudPayments как разовая web-оплата на 30/365 дней

Почему:

- widget и merchant integration уже существуют;
- путь был частично smoke-tested;
- scope security patch понятен;
- можно честно продавать fixed-term access без recurrent обещаний;
- один web rail позволяет проверить willingness-to-pay, не ожидая VK и Stars.

Обязательные шаги:

1. HMAC validation.
2. Server-side order.
3. Amount/currency/plan/user validation.
4. Payment ledger и provider transaction ID.
5. Unified `accessUntil` entitlement.
6. Idempotency/replay test.
7. Refund/expiry test.
8. Одна реальная разрешённая оплата.

Не использовать web/card flow внутри Telegram, пока правила платформы и договорные условия не подтверждены. Для Telegram-когорты вторым rail довести Stars.

### Второй rail: Telegram Stars

После trusted completion это естественный канал TG. Он не должен задерживать web pilot, но нужен до широкого Telegram paywall.

### Третий rail: VK Pay

Только после durable backend verification. Текущий UI-only flow нельзя считать оплатой.

### Не сейчас

- YooKassa как второй web provider;
- Offline Free Mode;
- Workspace billing;
- store/IAP strategy;
- сложные recurring plans.

## 2.9. Trial и скорость обучения

30-дневный trial создаёт хороший вход, но откладывает ответ о готовности платить на месяц. Для цели «быстро дойти до монетизации» выбрать один из вариантов:

1. Оставить 30 дней, но после 3–7 дней доказанной ценности предложить founder plan добровольно.
2. Для следующей beta cohort сделать 7/14 дней через config.
3. Продавать paid beta с ручным сопровождением.

Не рекомендуется одновременно тестировать три варианта на 5–10 пользователях. Выбрать один оффер и провести качественные интервью.

## 2.10. Referral economics

Текущая схема 30 дней trial + 30 дней обоим за signup может дать до 60+ дней бесплатного доступа приглашённому/пригласившему без доказанной ценности или оплаты.

До public referral нужны:

- reward after activation/payment;
- cap per inviter/time window;
- canonical identity/merge protection;
- device/email velocity heuristics;
- idempotent reward ledger;
- cost liability report;
- separate referred retention/payment cohorts.

## 2.11. Revenue analytics и reconciliation

Добавить события:

- `paywall_viewed`;
- `plan_selected`;
- `checkout_started`;
- `invoice_created`;
- `payment_provider_callback_received`;
- `payment_verified`;
- `payment_failed`;
- `entitlement_activated`;
- `payment_refunded`;
- `entitlement_expired`.

Поля без PII:

- provider;
- plan ID;
- amount/currency;
- order ID;
- canonical user ID;
- source/campaign;
- timestamps;
- failure reason category.

Ежедневное reconciliation:

`provider paid transactions = internal paid orders = active entitlements changes`

Любое расхождение попадает в ручной review.

## 2.12. Definition of Done для первого платежа

- [ ] Один rail выбран.
- [ ] Server order и ledger существуют.
- [ ] Provider authenticity проверяется.
- [ ] Amount/plan/user/currency сверяются.
- [ ] Replay не продлевает доступ.
- [ ] `accessUntil` применяется ко всем paid capabilities.
- [ ] Негативные тесты зелёные.
- [ ] Staging E2E зелёный.
- [ ] Production real/test transaction подтверждена.
- [ ] Reload/login на другом устройстве сохраняет Premium.
- [ ] Refund/expiry path проверен или явно ограничен policy.
- [ ] Paywall copy соответствует фактической продаже.
- [ ] Payment events видны в admin analytics/reconciliation.
