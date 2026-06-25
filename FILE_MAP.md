# FILE MAP — 4e-app

Главный индекс репозитория. Читай этот файл перед работой с кодом, затем переходи в карту нужной зоны.

## Статус checkout

| Зона | Статус | Карта |
| --- | --- | --- |
| Mini App UI | В этом репозитории | `FILE_MAP_UI.md` |
| Cloudflare Worker | Отдельный репозиторий, локально не подключён | `FILE_MAP_WORKER.md` |
| Telegram bot | Отдельный репозиторий `mrktggod/4e-bot`, локально не подключён | `FILE_MAP_BOT.md` |
| PM / QA документы | В этом репозитории, папка `pm/` | Этот файл + документы в `pm/` |

## Основные файлы

| Файл | Строк | Назначение | Как читать |
| --- | ---: | --- | --- |
| `index.html` | 5847 | Telegram Mini App: CSS, HTML-экраны, JS-логика | Через `FILE_MAP_UI.md`, только нужный диапазон |
| `vk.html` | 1578 | VK Mini App: отдельная версия без Telegram SDK | Через `FILE_MAP_UI.md`, только нужный диапазон |
| `privacy.html` | 230 | Политика конфиденциальности | Можно читать целиком при правовых правках |
| `AGENTS.md` | 181 | Правила для Codex и агентов | Читать перед задачей |
| `CLAUDE.md` | 117 | Контекст проекта для Claude/Cowork | Читать при координации |
| `COWORK_INSTRUCTIONS.md` | 133 | Инструкции наблюдателя/координатора | Читать при планировании |
| `DEVELOPMENT_LOG.md` | 491 | Канонический технический лог | Обновлять после значимых правок |
| `shared/WORK_LOG.md` | 125 | Общий журнал задач команды | Обновлять после выполненной задачи |
| `shared/COMMIT_CONVENTION.md` | 64 | Правила понятных заголовков коммитов | Читать перед коммитом |
| `scripts/check-portable-paths.sh` | 21 | Проверка, что в репозитории нет локальных абсолютных user-путей | Запускать перед коммитом |
| `.githooks/pre-commit` | 4 | Локальный hook для запуска path guard перед commit | Активировать через `git config core.hooksPath .githooks` |
| `.github/workflows/path-guard.yml` | 13 | GitHub Actions guard для переносимых путей | Срабатывает на push и PR |

## PM / QA

| Файл | Назначение |
| --- | --- |
| `pm/bugs.md` | Сбор багов, входящие, активные, отчёт для разработки |
| `pm/backlog.md` | Фичи, улучшения, техзадачи |
| `pm/roadmap.md` | PM-roadmap: Now / Next / Later |
| `pm/qa-checklist.md` | Smoke, regression areas, acceptance criteria |
| `pm/release-checklist.md` | Проверки до/после релиза |
| `pm/assistant-evaluation.md` | Рубрика оценки качества AI-ассистента |

## Правила чтения больших файлов

1. Не читать `index.html` целиком без необходимости.
2. Для UI сначала открыть `FILE_MAP_UI.md`.
3. Найти экран, функцию или диапазон строк.
4. Читать только нужный диапазон через `sed -n 'start,endp' file`.
5. После изменения экранов, функций, эндпоинтов или крупных блоков обновить соответствующий `FILE_MAP*.md`.

## Проверки перед разработкой

| Проверка | Команда |
| --- | --- |
| Старт работы | `git fetch origin` и `git pull --rebase` |
| Git-статус | `git status --short` |
| Текущая ветка | `git branch --show-current` |
| Remote | `git remote -v` |
| Локальная раздача | `python3 -m http.server 8000` |
| Smoke URL | `http://127.0.0.1:8000/index.html`, `/vk.html`, `/privacy.html` |

## Кодировка

При правках `index.html` и других файлов с кириллицей не использовать PowerShell `Set-Content`, `Out-File`, `-replace`. Проверять кириллицу до и после правки по маркерам `Войти|Задачи|Сегодня`.
