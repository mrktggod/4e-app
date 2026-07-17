# Post-beta decision tree — 2026-07

Цель: после первых 2-3 дней закрытого теста выбрать следующий шаг по данным, а не по самой громкой идее.

## Сначала классифицировать результат

### Case A — Core broken

Признаки:

- люди не могут зарегистрироваться/войти;
- задачи не сохраняются;
- home непонятен;
- mobile keyboard/safe-area мешают создать задачу;
- paywall случайно блокирует trial/free path.

Решение:

- не начинать новые фичи;
- чинить P0/P1 blockers;
- beta не расширять;
- CAL/native/workspace остаются deferred.

### Case B — Core works, retention weak

Признаки:

- люди смогли создать задачи;
- но не вернулись на день 2;
- фокус дня не стал привычкой;
- AI-chat/voice почти не используют.

Решение:

- улучшать activation/return loop;
- проверить morning reminder / daily briefing;
- усилить first-plan flow;
- не начинать calendar/native до понимания причины невозврата.

### Case C — Core works, people ask about time realism

Признаки:

- пользователи говорят "не понимаю, что реально успею";
- много задач с дедлайнами;
- recurring signal: нужен план по времени;
- home/focus используют повторно.

Решение:

- брать `CAL-002` discovery/implementation;
- начинать с internal duration + planned slot;
- не подключать внешний календарь сразу.

### Case D — Core works, capture from outside is pain

Признаки:

- люди хотят отправлять текст/скрин/ссылку в 4;
- задачи появляются в Telegram/VK/браузере/почте;
- "забыл занести" повторяется.

Решение:

- следующим кандидатом становится `NATIVE-004` share sheet или browser/email source;
- calendar пока не главный.

### Case E — Core works, reminders drive value

Признаки:

- люди закрывают задачи из уведомлений;
- просят действия прямо в push;
- Telegram reminders полезны, но не покрывают все поверхности.

Решение:

- следующим кандидатом становится `NATIVE-002` push actions;
- делать только после native wrapper readiness.

### Case F — Team promises dominate

Признаки:

- основные задачи про "жду от людей";
- пользователи хотят отправлять/напоминать другим;
- личный список уже понятен.

Решение:

- развивать SMART-011 / bot reminders;
- workspace implementation (`BACK-011`) только если реально нужен общий shared context, а не просто reminder.

## Decision meeting template

```text
Дата:
Участников beta:
Активировались:
Вернулись на день 2:
Создали задачи:
Закрыли задачи:
Использовали AI/voice:
Поделились карточкой/пригласили:

Top blockers:
Top repeated value:
Top repeated request:

Case: A/B/C/D/E/F
Next 1-2 tasks:
Что явно не делаем:
```

## Правило выбора следующей задачи

Выбираем максимум 1-2 задачи на следующий цикл.

Приоритет:

1. P0/P1 blockers.
2. Retention/return loop.
3. Calendar/time realism, если это повторяющийся signal.
4. Capture/share sheet, если это повторяющийся signal.
5. Native/platform только после доказанного repeat usage.

## Что не считать сигналом

- один человек попросил "сделайте как Jira";
- один человек хочет Apple Watch;
- "красиво, но..." без действия;
- просьба о скидке до доказанного value;
- идея, которую нельзя проверить за 1-2 дня.
