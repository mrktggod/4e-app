# Native and platform decisions — 2026-07-16

Статус: product/platform decision.

Цель: отделить полезные native-возможности от преждевременной платформенной экспансии.

## Главный принцип

Native/platform фича должна давать действие, которое невозможно или неудобно сделать в web/PWA.

Если фича просто "ещё одно место, где открыть тот же web app", она не приоритет до beta.

## Приоритет после beta

1. `NATIVE-004` — share sheet / widget.
2. `NATIVE-002` — push actions.
3. `NATIVE-003` — voice shortcuts.
4. `NATIVE-001` — system calendar sync.
5. `NATIVE-005` — geofencing.

## NATIVE-004 — widgets and share sheet

Product value:

- сохранить текст/ссылку/скрин из другого приложения в 4;
- видеть план дня без открытия app.

Решение:

- сначала share sheet capture;
- затем home widget;
- не делать до native wrapper readiness.

MVP share sheet:

- пользователь выбирает `Поделиться -> 4`;
- 4 получает text/url/image metadata;
- AI предлагает задачу;
- пользователь подтверждает сохранение.

## NATIVE-002 — push actions

Product value:

- закрыть/перенести задачу без открытия приложения;
- вернуть пользователя к плану дня.

Решение:

- делать после стабильных notifications/action-feed;
- сначала действия `Готово`, `+1 час`, `Открыть`;
- без сложных smart replies в MVP.

Privacy:

- push text не должен раскрывать чувствительные детали без настройки;
- action должен быть idempotent.

## NATIVE-003 — voice shortcuts

Product value:

- capture задачи без открытия app.

Решение:

- делать после доказанного voice/task creation value внутри app;
- MVP: shortcut открывает app/deep link с текстом или запускает capture, но не обещает фоновый always-on assistant.

Не делать:

- фоновое прослушивание;
- "замена Алисы";
- скрытый сбор аудио.

## NATIVE-001 — system calendar

Product value:

- системный календарь полезен только после внутреннего CAL-002.

Решение:

- defer до CAL-002;
- сначала read-only/free-busy external calendar через CAL-003;
- двусторонняя запись — позже, только с подтверждением.

## NATIVE-005 — geofencing

Product value:

- location reminders могут быть сильными, но это высокий privacy-risk.

Решение:

- later;
- не брать до зрелой consent модели;
- только opt-in per reminder;
- clear delete/revoke path обязателен.

## PLAT-001 — MAX

Решение:

- не стартовать как отдельную разработку до beta и профиля/платформенной готовности;
- MAX — adapter после стабилизации core web/PWA + bot flows;
- не копировать Telegram bot blindly: сначала понять, какие действия MAX реально поддерживает и где пользователи 4 там появятся.

MVP после readiness:

- auth/link account;
- create task from message;
- daily focus notification;
- open web/PWA surface.

## Store/platform launch rule

Новая платформа разрешена только если:

- текущий product core проходит manual QA;
- есть beta evidence repeat usage;
- есть владелец manual smoke;
- есть privacy/payment review;
- есть rollback path.

## Definition of Done для этого decision pack

- `NATIVE-*` и `PLAT-001` получили явный порядок.
- Backlog отражает, что эти задачи не являются ближайшей реализацией до beta.
- Команда не стартует platform/native work без нового отдельного брифа.
