# Инструкции для Codex — проект 4 AI-секретарь

## Обязательно читать перед работой

1. `DEVELOPMENT_LOG.md` — история, критические правила, известные проблемы
2. `docs/tasks/` — атомарные задачи от команды
3. `docs/tasks/done/` — что уже сделано

---

## Твоя роль

Codex берётся за задачи которые требуют:
- Чтения нескольких файлов одновременно
- Сложного рефакторинга архитектуры
- Добавления новых фич (новый эндпоинт, новый экран)
- Security fixes в worker.js

Атомарные правки одной строки → отдавай Мимо через `docs/tasks/TASK_TEMPLATE.md`

---

## Критические правила

### Кодировка — САМОЕ ВАЖНОЕ
- НИКОГДА не использовать PowerShell `-replace` или `Set-Content` для файлов с кириллицей
- Читать файлы: `[System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)`
- Писать файлы: `[System.IO.File]::WriteAllText($f, $content, (New-Object System.Text.UTF8Encoding $false))`
- После любой правки проверять: `Select-String -Path $file -Pattern 'Войти|Задачи'`
- Если кириллица пропала — восстанавливать байтовым методом с GitHub

### Git
- После `git reset --hard` нужен `git push --force`
- Конфликты при `git revert` → `git revert --abort` + `git reset --hard <hash>`

### PowerShell
- `;` вместо `&&`
- Скачивать файлы: `$bytes = (Invoke-WebRequest -Uri $url).RawContentStream.ToArray()`

---

## Архитектура

| Файл | Назначение |
|------|-----------|
| `4e-app/index.html` | Telegram Mini App — не трогать без крайней нужды |
| `4e-app/vk.html` | VK Mini App — отдельный, без Telegram SDK |
| `4e-worker/worker.js` | Cloudflare Worker (минифицирован) |
| `4e-worker/bot.js` | Telegram бот |

### Ключевые эндпоинты Worker
- `/anthropic` — прокси к Claude, требует `x-token` (обязательно!)
- `/tasks` — задачи по токену без chatId
- `/auth/vk` — VK авто-логин

---

## После выполнения задачи

Обязательно добавь запись в `DEVELOPMENT_LOG.md`:

```markdown
## ДАТА

### Название изменения

**Проблема:** что было не так

**Решение:** что сделал

**Проверка:** как проверил

**Production:** версия воркера или коммит
```

---

## Приоритеты (открытые задачи)

1. Email через Resend — пользователи не получают писем
2. Сброс пароля — бэкенд не реализован  
3. Тестовый платёж — прогнать webhook до конца
4. Единая модель пользователя VK+TG+Email
5. Миграция с KV на D1
