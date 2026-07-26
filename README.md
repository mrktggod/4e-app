# 4 AI-секретарь — рабочая папка проекта

Локальный checkout `mrktggod/4e-app`: Telegram Mini App, VK Mini App, документация для агентов, PM/QA-контур.

## Быстрый старт для агента

0. Напомни пользователю и выполни: `git fetch origin` и `git pull --rebase`.
1. Прочитай `AGENTS.md`.
2. Прочитай `FILE_MAP.md`.
3. Для UI-правок используй `FILE_MAP_UI.md` и открывай только нужные диапазоны строк.
4. Перед значимой задачей проверь `DEVELOPMENT_LOG.md` и приватный репозиторий `https://github.com/mrktggod/4pm` для roadmap/backlog/bugs/work log.
5. После задачи обнови технический лог и командный журнал.
6. Коммит называй по правилам из `https://github.com/mrktggod/4pm/blob/feat/admin-tariff-api/shared/COMMIT_CONVENTION.md`: `type(scope): что изменилось`.

## Локальная проверка

```bash
python3 -m http.server 8000
```

Открыть:

- `http://127.0.0.1:8000/index.html`
- `http://127.0.0.1:8000/vk.html`
- `http://127.0.0.1:8000/privacy.html`

## Еженедельный ритм

1. Обновить входящие баги и правки в приватном `https://github.com/mrktggod/4pm`.
2. Разобрать приоритеты: P0/P1/P2/P3.
3. Проверить тестовый статус в приватном QA-checklist.
4. Обновить приватный roadmap: что уходит в Now, Next, Later.
5. Перед релизом пройти приватный release-checklist.

## Основные документы

- `https://github.com/mrktggod/4pm` - приватные backlog, bugs, roadmap, QA, release checklist и оценка AI-ассистента.
- `pm/inbox/` - входящие брифы.
- `pm/outbox/` - отчёты по выполненным задачам.
- `docs/tasks/` - операционный архив атомарных задач.
