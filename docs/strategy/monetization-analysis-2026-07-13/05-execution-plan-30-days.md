# 5. План исполнения на 30 дней

## Цель периода: 13 июля — 12 августа 2026 года

К 12 августа получить:

- один воспроизводимый production release path;
- 5–10 активированных beta users;
- минимум 3 реальные оплаты;
- корректную воронку от источника до оплаты;
- safe referral MVP;
- два опубликованных или готовых к публикации правдивых screen-first ролика;
- решение go/iterate/stop по первичному офферу.

План не является обещанием выручки. Он сокращает путь до проверяемого ответа «готовы ли люди платить и за что».

## Принцип очереди

Три lanes могут идти параллельно:

| Lane | Содержание | WIP |
|---|---|---:|
| A. Release/reliability | CI, payment integrity, staging, integration | 1 крупный результат |
| B. Activation/product | HOME-minimal, onboarding, first plan, events | 1 activation slice |
| C. Human/market | Manual sprint, beta interviews, offer decision | 1 собранный packet |

Длинные сессии разрешены. Нельзя открывать четвёртую продуктовую область до закрытия текущего slice.

## Фаза 0 — 13–14 июля: подготовить ручной спринт

### Lane A

- Зафиксировать точные app/worker SHA для staging candidate.
- Починить app Path guard dependency (`rg` на runner или portable fallback).
- Восстановить worker deploy secret/config в GitHub Actions без публикации значения.
- Убрать production target из PR API smoke; использовать staging и cleanup.
- Составить P0 payment integrity patch plan для выбранного первого канала.
- Проверить, что staging app и worker соответствуют друг другу.

### Lane B

- Завершить минимальную рабочую часть `HOME-001` или скрыть незавершённое feature flag.
- Не начинать новые Later-функции.
- Подготовить данные/аккаунты для проверки Home, voice, task creation и referral.

### Lane C

- Выбрать устройства и две РФ-сети.
- Подготовить ручной packet на вечер 14 июля.
- Определить, какие платёжные операции разрешено проводить как реальные, а какие — только test mode.

### Exit criteria

- один URL staging candidate;
- app SHA + worker SHA записаны;
- manual checklist не требует поиска ссылок по чатам;
- ни один секрет/пароль не записан в документы.

## Фаза 1 — вечер 14 июля: human QA sprint

Выполнить [отдельный checklist](06-manual-sprint-2026-07-14.md). Цель вечера — не «проверить всё», а выдать классификацию:

- `P0 — блокирует release/payment`;
- `P1 — блокирует activation/beta`;
- `P2 — можно принять как known issue`;
- `Pass`.

После спринта не исправлять всё сразу. Сначала один 15-минутный triage.

## Фаза 2 — 15–17 июля: закрыть release path и payment P0

### Lane A

1. Закрыть подлинность, сумму, план и идемпотентность выбранного payment rail.
2. Добавить негативные тесты: неправильная подпись, сумма, plan ID, повтор события.
3. Исправить CI/deploy.
4. Собрать integration candidate app + worker.
5. Пройти staging smoke.
6. Подготовить integration PR; merge только после проверки.

### Lane B

- Исправить только найденные на 14 июля P0/P1 в ключевом flow.
- `BACK-055` не делать автоматически полным объёмом. Если базовые уведомления не блокируют beta, перевести action-cards после beta.

### Lane C

- Принять временное решение по первому каналу оплаты.
- Принять временную цену/trial для первой когорты.
- Принять решение по gate Yandex/ПД до первой реальной продажи.

### Exit criteria

- CI зелёный;
- staging payment security smoke зелёный;
- release candidate больше не растёт новыми областями;
- есть go/no-go для merge.

## Фаза 3 — 18–21 июля: activation slice

### Product scope

1. `HOME-001` minimal: главное, три приоритетные задачи, рабочие переходы, mobile safe area.
2. `ONBOARD-001`: три дела → первый план за 60 секунд.
3. `ANALYTICS-001`: настоящие activation/payment events.
4. `SMART-013` как optional wow после первого плана, не обязательный шаг onboarding.

### Не входит

- новый календарь;
- AI-персонаж;
- share-card;
- weekly summary;
- offline mode;
- новые платформы.

### Exit criteria

- новый пользователь без подсказки создаёт три дела;
- видит персональный Home;
- события доходят до аналитики;
- можно определить D1 return по user cohort;
- paywall/checkout/payment события имеют единый transaction correlation ID без PII.

## Фаза 4 — 22–28 июля: закрытый beta-run 5–10 человек

### Набор

- тёплые контакты, похожие на первичный ICP;
- не только команда и разработчики;
- у каждого явное согласие на обратную связь;
- один источник/ссылка на пользователя для attribution.

### Ритуал

- День 0: 15 минут наблюдения за входом и первым планом.
- День 1: короткий вопрос «Открыл ли утром? Что было полезно/мешало?».
- День 3: первая проверка готовности платить и причины.
- День 7: итоговое интервью и предложение оплаты.

### Исправления

- немедленно: потеря данных, вход, первый план, payment integrity;
- в течение beta: повторяющийся P1 у 2+ людей;
- в backlog: всё остальное.

### Exit criteria

- activation видна по событиям;
- есть фактический D1 и ранний D7;
- минимум 3 человека сформулировали ценность своими словами;
- есть список top-3 objections;
- принято решение по платному офферу.

## Фаза 5 — 29 июля — 2 августа: soft monetization

### Оффер

Один оффер, одна цена, один основной план. Не делать A/B на выборке 5–10 человек.

Варианты для решения команды:

- текущий 30-дневный trial + раннее founder-offer после Day 7;
- новый 7/14-дневный trial для следующей когорты;
- платный beta plan с ручным сопровождением.

Рекомендация: не ждать календарного окончания 30 дней, иначе обучение о willingness-to-pay переносится на месяц. Предложить оплату после доказанного aha-момента, честно объяснив условия.

### Платёж

- включить один подтверждённый канал;
- второй канал не блокирует запуск;
- каждый payment success сверяется с backend user plan;
- refund/cancel/manual recovery path записан;
- реальная транзакция не считается успешной только по UI.

### Exit criteria

- минимум 3 реальные оплаты или ясный документированный отказ;
- нет расхождения provider transaction ↔ canonical user ↔ Premium period;
- измерен time-to-pay от регистрации;
- сформулировано, что люди фактически покупают.

## Фаза 6 — 3–7 августа: referral beta + screen-first promo

### Referral

- reward gate после activation/решения команды;
- two-user staging/production smoke;
- cap/rate rules;
- VK обещания не публиковать до VK flow;
- referral events и attribution.

### Promo

- ролик «голос → задачи»;
- ролик «задача → шаги»;
- одна conversion entry;
- реальный CTA и privacy;
- убрать «бесплатно», placeholders, fake claims.

### Exit criteria

- можно связать ролик/ссылку с activated user;
- referral reward не выдаётся за self/disposable duplicate;
- есть первые share/click/signup/activation данные.

## Фаза 7 — 8–12 августа: решение и следующий S-curve

### Review

- activation rate;
- D1/D7;
- план использован в разные дни;
- payment conversion;
- cost-to-serve;
- referral activation;
- qualitative value language.

### Возможные решения

**Go:** есть activation, повторное использование и 3+ оплаты. Дальше VIRAL-001 и масштабирование promo.

**Iterate:** люди активируются, но не платят — пересобрать offer/price/paywall/value proof.

**Fix retention:** первый план нравится, но не возвращаются — уведомления/ритуал/weekly loop важнее acquisition.
**Stop/pivot slice:** не получают first value — не строить viral/promotional expansion.

## Backlog freeze на период

До 12 августа без отдельного решения не начинать:

- CAL-002/003;
- MAX/RuStore/native;
- Workspace;
- Offline Free Mode;
- streak economy;
- weekly AI generation;
- animated AI character;
- новый большой CSS refactor;
- paid ads;
- публичный SEO-blog launch.

## Резерв по времени

20% периода оставить на фактические P0/P1 beta. Не заполнять заранее дополнительными фичами.
