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
<repo-root>/
├── index.html           ← Telegram Mini App
├── vk.html              ← VK Mini App
├── privacy.html         ← Политика конфиденциальности
├── FILE_MAP*.md         ← Карты файлов для агентов
├── DEVELOPMENT_LOG.md   ← Канонический технический лог
├── shared/              ← Общие логи, история и roadmap команды
├── pm/                  ← Баги, backlog, QA, release checklist
└── docs/tasks/          ← задачи для Мимо (атомарные)
```

---

## Как следить за разработкой

### Каждый день проверяй:

1. **Git / git log** — что задеплоили и какая ветка активна
```
cd "<локальная папка репозитория 4e-app>"
git log --oneline -10
```

2. **Открытые проблемы** в DEVELOPMENT_LOG.md — раздел "Известные проблемы"

3. **Выполненные задачи** в `docs/tasks/done/`, если папка существует — что сделал Мимо
4. **Командный журнал** в `shared/WORK_LOG.md`
5. **Team Sync** в `pm/team-sync.md` — что Алексей передал Юре и что Юра вернул
6. **Баги и QA** в `pm/bugs.md` и `pm/qa-checklist.md`

### После проверки:
- Обнови раздел "Известные проблемы" в DEVELOPMENT_LOG.md
- Добавь запись о сегодняшних изменениях в DEVELOPMENT_LOG.md
- Добавь краткую запись в shared/WORK_LOG.md (формат: задача / результат / коммит / статус)
- Если видишь паттерн ошибок — добавь в раздел "КРИТИЧЕСКИЕ ПРАВИЛА ДЛЯ АГЕНТОВ"
- Не пушить и не merge'ить автоматически. Локальный commit допустим по явной просьбе; push, PR и merge требуют отдельного решения.
- Если готовится коммит — проверь заголовок по `shared/COMMIT_CONVENTION.md`
- Если Юрий пишет `Что там у Лехи?` или `Закрой задачу и синхронизируй`, сначала прочитай `docs/team-sync-protocol.md` и действуй по нему.

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

### Git и main
- `main` связан с GitHub Pages, поэтому изменения в `main` могут попасть в live.
- GitHub Desktop — вариант для Алексея и слабых пользователей Git, но не обязательное правило для Юрия.
- Юрий обычно управляет Git через Claude: сначала проверять ветку и `git status`, потом выполнять fetch/pull/commit/push только если понятно, что изменения не потеряются.
- Не выполнять автоматически `pull --rebase`, push, merge или force push, если есть риск затронуть чужие изменения или live.
- Если есть незакоммиченные изменения, конфликт или непонятная ветка — остановиться и вынести решение человеку.
- Перед опасным Git-действием указать ветку, действие, риск и кто подтвердил.
- Регулярное правило разбора веток пока ожидает финальное утверждение Алексея после мнения Юрия / Claude.

### Team Sync
- `pm/team-sync.md` — короткий диспетчерский экран команды, а не второй backlog.
- Фраза Юрия `Что там у Лехи?` означает: прочитать `docs/team-sync-protocol.md`, `pm/team-sync.md`, PM-доки и Git-состояние, затем дать короткий отчёт.
- Фраза `Закрой задачу и синхронизируй` означает: проверить изменения, сделать commit, push в рабочую ветку и обновить `pm/team-sync.md`. Если push не прошёл — объяснить причину и дать простую ручную инструкцию.
- Merge в `main` не входит в автоматическое закрытие задачи.

### Кодировка файлов
- НИКОГДА не использовать PowerShell `-replace` или `Set-Content` для файлов с кириллицей
- Читать: `[System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)`
- Писать: `[System.IO.File]::WriteAllText($f, $content, (New-Object System.Text.UTF8Encoding $false))`
- После правки проверять: `Select-String -Path $file -Pattern 'Войти|Задачи'`

### UI-архитектура
- Новый UI-код не должен увеличивать inline-долг в `index.html`/`vk.html`.
- Новые стили писать в `styles/**/*.less`; новые классы — в BEM-подходе.
- Базовая доступность входит в Definition of Done для нового и изменяемого UI: labels/accessible names, видимый focus, keyboard flow, доступные status/error сообщения, dialog-поведение и mobile touch targets.
- Не добавлять новые `style=""` и inline-обработчики `onclick`/`oninput`/`onchange`.
- Если видишь новый inline UI-код в diff, фиксируй как процессную ошибку и проси переделать через LESS + JS.
- Если видишь новый UI без доступных подписей, фокуса, клавиатурного пути, status/alert или нормальных touch-targets, фиксируй как QA/process gap и отправляй на доработку.
- Проверка для Codex/Юры: `bash scripts/check-ui-architecture.sh`.
- Ручная проверка для UI-задач: accessibility smoke в `pm/qa-checklist.md`.
- Подробности: `docs/ui-architecture-rules.md`.

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

| Компонент | Как делать | Время |
|-----------|---------|-------|
| Mini App | Локальный commit по явной просьбе; push ветки и PR/merge только после проверки и согласования | 1-2 мин после merge |
| Worker | `cd 4e-worker; npx wrangler deploy`, если задача явно про worker и есть доступ | сразу |
| Bot | push в 4e-bot репо человеком → Railway автодеплой | 1-2 мин |

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
