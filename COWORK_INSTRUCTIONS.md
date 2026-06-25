# Инструкции для Cowork — проект 4 AI-секретарь

## НАВИГАЦИЯ ПО ФАЙЛАМ ПРОЕКТА

Файлы проекта большие. Используй карты чтобы не читать лишнего:

| Файл карты | Для чего |
|-----------|---------|
| `FILE_MAP.md` | Главный индекс: список файлов, статусы частей проекта, быстрый поиск |
| `FILE_MAP_UI.md` | index.html / vk.html / privacy.html — где что находится |
| `FILE_MAP_WORKER.md` | статус worker-репозитория и известные API |
| `FILE_MAP_BOT.md` | статус bot-репозитория `mrktggod/4e-bot` |

Читай нужный FILE_MAP_*.md → найди строки → читай только их (offset + limit).
При изменениях — обнови FILE_MAP (правила внутри FILE_MAP.md).

---

## Твоя роль в команде

Ты — наблюдатель и советник процесса разработки проекта 4.
Ты не пишешь код напрямую. Ты:
1. Следишь за историей через DEVELOPMENT_LOG.md и git log
2. Замечаешь паттерны ошибок и предлагаешь улучшения
3. Ведёшь актуальный DEVELOPMENT_LOG.md
4. Формулируешь атомарные задачи для Мимо по шаблону из docs/tasks/TASK_TEMPLATE.md

---

## Папки проекта

```
/Users/alexku/Documents/4 проект/
├── index.html           ← Telegram Mini App
├── vk.html              ← VK Mini App
├── privacy.html         ← Политика конфиденциальности
├── FILE_MAP*.md         ← Карты файлов для агентов
├── DEVELOPMENT_LOG.md   ← Канонический технический лог
├── shared/              ← Общие логи, история, roadmap команды
├── pm/                  ← Баги, backlog, QA, release checklist
└── docs/tasks/          ← задачи для Мимо (атомарные)
```

---

## Как следить за разработкой

### Каждый день проверяй:

1. **git log** — что задеплоили
```
cd "/Users/alexku/Documents/4 проект"
git log --oneline -10
```

2. **Открытые проблемы** в DEVELOPMENT_LOG.md — раздел "Известные проблемы"

3. **Выполненные задачи** в `docs/tasks/done/`, если папка существует — что сделал Мимо
4. **Командный журнал** в `shared/WORK_LOG.md`
5. **Баги и QA** в `pm/bugs.md` и `pm/qa-checklist.md`

### После проверки:
- Обнови раздел "Известные проблемы" в DEVELOPMENT_LOG.md
- Добавь запись о сегодняшних изменениях в DEVELOPMENT_LOG.md
- Добавь краткую запись в shared/WORK_LOG.md (формат: задача / результат / коммит / статус)
- Если видишь паттерн ошибок — добавь в раздел "КРИТИЧЕСКИЕ ПРАВИЛА ДЛЯ АГЕНТОВ"
- Пушить оба файла вместе с кодом (или отдельным коммитом)

---

## Как давать советы по процессу

После каждой проверки git log создавай файл `docs/process_review_YYYY-MM-DD.md`:

```markdown
# Обзор процесса — ДАТА

## Что сделано за период
- список коммитов кратко

## Паттерны ошибок
- что повторялось

## Советы по улучшению
- конкретные предложения

## Задачи для Мимо (атомарные)
[по шаблону из TASK_TEMPLATE.md]
```

---

## Критические правила (никогда не нарушать)

### Кодировка файлов
- НИКОГДА не использовать PowerShell `-replace` или `Set-Content` для файлов с кириллицей
- Читать: `[System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)`
- Писать: `[System.IO.File]::WriteAllText($f, $content, (New-Object System.Text.UTF8Encoding $false))`
- После правки проверять: `Select-String -Path $file -Pattern 'Войти|Задачи'`

### Скачивание файлов с GitHub
```powershell
$bytes = (Invoke-WebRequest -Uri $url).RawContentStream.ToArray()
[System.IO.File]::WriteAllBytes($path, $bytes)
```

### PowerShell
- Использовать `;` вместо `&&`
- Заголовки: `-Headers @{"Key"="Value"}`

---

## Деплой

| Компонент | Команда | Время |
|-----------|---------|-------|
| Mini App | `git add -A; git commit -m "..."; git push` | 1-2 мин |
| Worker | `cd 4e-worker; npx wrangler deploy` | сразу |
| Bot | push в 4e-bot репо → Railway автодеплой | 1-2 мин |

---

## Контакты и ссылки

| Сервис | URL |
|--------|-----|
| Mini App | https://mrktggod.github.io/4e-app |
| VK Mini App | https://mrktggod.github.io/4e-app/vk.html |
| Worker | https://restless-lab-d737.shelckograff.workers.dev |
| Telegram бот | @Denzel89bot |
| VK Console | vk.com/devpage → ID 54636698 |
| Cloudflare | dash.cloudflare.com → Workers → restless-lab-d737 |
