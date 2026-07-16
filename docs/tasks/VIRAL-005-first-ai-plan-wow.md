# VIRAL-005 — onboarding wow moment: первый AI-план за 60 секунд

Статус документа: product decision, 2026-07-16.

## Решение

`VIRAL-005` не должен быть отдельным длинным wizard.

Wow moment должен жить внутри первого пустого home:

1. пользователь попадает в приложение;
2. видит guided-card `Первый AI-план за 60 секунд`;
3. добавляет или надиктовывает 3 задачи;
4. 4 сразу показывает первый фокус дня;
5. пользователь понимает value без обучения.

## Почему не отдельный onboarding wizard

- wizard легко становится рекламной презентацией вместо действия;
- пользователь уже зарегистрировался, его надо быстрее довести до first value;
- текущий `ONBOARD-001` уже дал правильную поверхность: empty-state внутри home;
- отдельный wizard повысит риск сломать auth/signup flow перед beta.

## MVP

MVP уже частично есть через `ONBOARD-001`:

- empty home показывает карточку `Первый AI-план за 60 секунд`;
- есть CTA в quick add;
- есть CTA в AI-chat;
- есть CTA в voice.

Что считать `VIRAL-005`:

- не новый экран;
- не новая механика регистрации;
- а измеримый first-value сценарий.

## Product metric

Activation event:

```text
fresh_user -> creates_3_tasks -> sees_home_focus
```

Дополнительные события:

- `onboarding.firstPlan.start`;
- `onboarding.firstPlan.taskCreated`;
- `onboarding.firstPlan.completed`;
- `onboarding.firstPlan.voiceUsed`;
- `onboarding.firstPlan.aiChatUsed`.

## Copy

Тон:

- коротко;
- без магии ради магии;
- "4 соберёт фокус", а не "AI всё сделает за тебя".

Пример:

```text
Первый AI-план за 60 секунд
Добавь 3 задачи — я соберу фокус дня и покажу, с чего начать.
```

## До beta

До закрытого beta не делать:

- новый wizard;
- gamified onboarding;
- обязательное прохождение 3 шагов;
- отдельную регистрацию ради wow moment.

До beta можно делать:

- измерить completion в lite analytics;
- поправить copy;
- убедиться, что empty-state CTA не ломаются;
- ручной smoke на fresh account.

## Definition of Done

`VIRAL-005` можно закрывать, когда:

- fresh account видит guided first-plan card;
- пользователь может создать 3 задачи через quick add / voice / AI-chat;
- home после этого показывает фокус;
- activation event записывается;
- ручной smoke на fresh account занесён в `shared/WORK_LOG.md`.
