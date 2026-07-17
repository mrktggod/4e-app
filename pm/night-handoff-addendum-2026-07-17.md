# Night handoff addendum — 2026-07-17

Этот addendum закрывает хвост после первоначального night handoff: после него были добавлены ещё несколько docs/product срезов, поэтому утренний вход теперь должен идти не только через старый handoff, но и через новые управляющие файлы.

## Новые точки входа

| Файл | Назначение |
| --- | --- |
| `pm/morning-command-center-2026-07-17.md` | Главный утренний маршрут |
| `pm/qa-results-2026-07-17.md` | Таблица ручного pass/fail QA |
| `pm/next-cycle-matrix-2026-07-17.md` | Разделение Ready/Partial/Deferred/No-touch |
| `pm/tail-closeout-2026-07-17.md` | Закрытие ночных хвостов и стоп-линии |

## Важное для утра

- Начинать не с backlog целиком, а с QA P0/P1 потоков.
- Не закрывать Ready for QA по исходникам.
- Не начинать CAL/native/main merge/price work в этой ветке.
- Если регистрация/логин снова показывают `Нет соединения`, это P0 и первый фикс дня.
- Если P0/P1 нет, можно переходить к закрытой beta по runbook.

## Dirty state

- `.pages-dist/privacy.html` остается известным dirty build artifact и не входит в ночной docs/product scope.