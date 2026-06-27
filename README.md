# 4 AI-секретарь — рабочая папка проекта

Локальный checkout `mrktggod/4e-app`: Telegram Mini App, VK Mini App, документация для агентов, PM/QA-контур.

## Быстрый старт для агента

0. Напомни пользователю и выполни: `git fetch origin` и `git pull --rebase`.
1. Прочитай `AGENTS.md`.
2. Прочитай `FILE_MAP.md`.
3. Для UI-правок используй `FILE_MAP_UI.md` и открывай только нужные диапазоны строк.
4. Перед значимой задачей проверь `DEVELOPMENT_LOG.md`, `shared/WORK_LOG.md`, `pm/bugs.md`.
5. После задачи обнови технический лог и командный журнал.
6. Коммит называй по `shared/COMMIT_CONVENTION.md`: `type(scope): что изменилось`.

## Локальная проверка

```bash
python3 -m http.server 8000
```

Открыть:

- `http://127.0.0.1:8000/index.html`
- `http://127.0.0.1:8000/vk.html`
- `http://127.0.0.1:8000/privacy.html`

## Еженедельный ритм

1. Обновить входящие баги и правки в `pm/bugs.md` и `pm/backlog.md`.
2. Разобрать приоритеты: P0/P1/P2/P3.
3. Проверить тестовый статус в `pm/qa-checklist.md`.
4. Обновить `pm/roadmap.md`: что уходит в Now, Next, Later.
5. Перед релизом пройти `pm/release-checklist.md`.

## Основные документы

- `pm/backlog.md` - список фич, улучшений и технических задач.
- `pm/bugs.md` - баг-репорты и статус исправлений.
- `pm/roadmap.md` - дорожная карта проекта.
- `pm/qa-checklist.md` - smoke, regression и acceptance-проверки.
- `pm/release-checklist.md` - подготовка релиза.
- `pm/assistant-evaluation.md` - оценка качества AI-ассистента.
