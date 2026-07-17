# Product decisions — 2026-07-16

Статус: рабочее продуктовое решение для ветки `feat/admin-tariff-api`.

Цель: не расползтись в календарь, task tracker, набор ботов и мобильных оболочек. 4 остаётся личным AI-штабом дня.

## 1. Северная звезда продукта

4 продаёт не список задач и не чат с AI.

4 продаёт ощущение:

> "Я понимаю, что сегодня важно, кому я что должен, кто должен мне, что горит, и какой следующий шаг реалистичен."

Отсюда главный критерий любой фичи:

- помогает ли она быстрее понять фокус дня;
- помогает ли она не потерять обещание;
- помогает ли она вернуться завтра;
- помогает ли она доверять данным и платежам.

Если фича не усиливает эти 4 пункта, она уходит в later.

## 2. Ближайший product gate

До расширения продукта главный gate — закрытый beta-run.

До beta можно делать:

- auth/signup/login stability;
- сохранение задач;
- home/focus clarity;
- AI-chat/task creation blockers;
- notifications/action feed;
- share cards как лёгкий growth loop;
- feedback loop;
- PWA/install groundwork без store-публикаций.

До beta не делаем:

- полноценный календарь;
- командный workspace implementation;
- native widgets/push/share sheet;
- новые platform launches;
- redesign onboarding/home сверх уже сделанного;
- изменение цен.

## 3. Calendar decision

Решение: календарь 4 — это не календарь встреч, а слой реалистичности дня.

Он должен отвечать:

- что реально влезает сегодня;
- что нужно перенести;
- где перегруз;
- какое следующее действие стоит сделать;
- какие уведомления относятся к плану дня.

### CAL-001

CAL-001 считается продуктово оформленным, когда команда подтверждает эту модель:

```text
task -> deadline -> duration -> planned slot -> notification -> dashboard explanation
```

Ключевые поля задачи для будущего MVP:

- `durationMin`;
- `plannedStart`;
- `plannedEnd`;
- `timeBlockStatus`: `none|planned|moved|missed`;
- `calendarSource`: `internal|external`;
- `capacityHint`: `fits|tight|overloaded`.

### CAL-002

CAL-002 стартует только после beta gate.

MVP внутри 4:

- дневная лента;
- ручной time blocking;
- длительность задачи;
- объяснение AI: `влезает / не влезает / перенести`;
- без записи во внешний календарь.

Не делаем в CAL-002:

- полноценную месячную сетку;
- приглашения на встречи;
- автоматическое планирование без подтверждения;
- внешний calendar write.

### CAL-003

CAL-003 стартует только после CAL-002 и отдельного privacy review.

Принцип внешнего календаря:

- сначала read-only;
- сначала free/busy или минимальные детали;
- названия событий только с отдельным согласием;
- запись во внешний календарь только после явного подтверждения пользователя.

Первый провайдер не выбираем в коде сейчас. Product preference:

- для RU-позиционирования — Яндекс, если OAuth/consent и API readiness не блокируют;
- для быстрой технической проверки — тот провайдер, где быстрее пройти OAuth/sync smoke;
- решение принять после beta, не раньше.

## 4. Omnichannel decision

Решение: омниканальность — это не "быть везде". Это один штаб, который принимает задачи из разных мест.

Порядок:

1. Web/PWA как основная рабочая поверхность.
2. Telegram/VK как текущие входы и быстрые действия.
3. Share cards/referral как growth loop.
4. Calendar layer после beta.
5. Native surfaces после доказанного retention.

Не строим новые каналы, пока:

- auth не стабилен;
- beta не дала repeat usage;
- нет понятного top blocker list;
- текущие поверхности не проходят smoke.

## 5. Native decision

Native-фичи нужны не ради app-store присутствия, а когда они дают уникальное действие вне открытого приложения.

Приоритет native после beta:

1. `NATIVE-004`: share sheet — потому что ловит задачи из внешнего контекста.
2. `NATIVE-002`: push actions — потому что закрывает задачу без открытия app.
3. `NATIVE-003`: voice shortcuts — потому что даёт быстрый capture.
4. `NATIVE-001`: системный календарь — после внутреннего CAL-002.
5. `NATIVE-005`: geofencing — позже, только с явным consent.

## 6. Growth decision

Growth сейчас должен быть лёгким и встроенным:

- referral link;
- plan/day share card;
- weekly wrapped card;
- restrained 4 persona;
- wow moment внутри home empty-state.

Не делаем сейчас:

- отдельную viral campaign platform;
- VK Clips automation;
- тяжёлый mascot/character redesign;
- forced sharing.

## 7. Workspace decision

Workspace — later, не до beta.

Причина:

- workspace резко увеличивает privacy/security surface;
- нужен второй реальный пользователь для QA;
- легко превратить 4 в generic team task tracker.

Сейчас достаточно spec. Реализация только после:

- stable personal flow;
- beta signal, что люди реально используют "жду от людей";
- отдельный backend security pass.

## 8. Product sequence

Ближайшая последовательность:

1. Завтра: manual QA по `pm/manual-qa-2026-07-17.md`.
2. Закрыть P0/P1 blockers из QA.
3. Запустить `BETA-001` на 5-10 пользователей.
4. Каждый день вести `FEEDBACK-001`.
5. После 2-3 дней beta решить: календарь, native share sheet или retention fixes.

## 9. Что считать успехом beta

Не downloads и не "понравилось".

Успех:

- пользователь сам создал реальные задачи;
- вернулся на следующий день;
- понял home/focus без объяснения;
- не потерял задачи;
- нашёл value в "4 держит день";
- хотя бы один пользователь поделился планом/итогами или пригласил другого.

## 10. Anti-scope rules

Если появляется новая идея, спрашиваем:

1. Она чинит blocker beta?
2. Она повышает шанс повторного возвращения завтра?
3. Она усиливает фокус дня/обещания/следующий шаг?
4. Её можно проверить за 1-2 дня?

Если нет — в backlog later, без реализации сейчас.
