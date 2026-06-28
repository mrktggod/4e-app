# 4 AI-секретарь — Project Context for Claude Code

> Этот файл читается автоматически при старте сессии Claude Code.
> Обновлять при изменении архитектуры или приоритетов.

## Что это за проект

**4 AI-секретарь** — персональный AI-ассистент через Telegram Mini App + VK Mini App.  
Позиционирование: персональный операционный директор — партнёр, который следит за всем, напоминает, анализирует, берёт рутину на себя.

Live: https://mrktggod.github.io/4e-app  
VK: https://mrktggod.github.io/4e-app/vk.html  
Worker: https://restless-lab-d737.shelckograff.workers.dev

## Репозитории

| Репо | Что | Деплой |
|------|-----|--------|
| `mrktggod/4e-app` | Telegram + VK Mini App (этот репо) | GitHub Pages — push → live |
| 4e-worker (отдельный) | Cloudflare Worker | `npx wrangler deploy` |
| 4e-bot (отдельный) | Telegram бот | Railway автодеплой |

## Архитектура файлов

```
4e-app/
  index.html          ← Telegram Mini App (5000+ строк, CSS+HTML+JS в одном файле)
  vk.html             ← VK Mini App (отдельный, без Telegram SDK)
  privacy.html        ← Политика конфиденциальности (152-ФЗ)
  CLAUDE.md           ← Этот файл
  DEVELOPMENT_LOG.md  ← Канонический лог изменений
  AGENTS.md           ← Правила для агентов
  FILE_MAP.md         ← Главная карта файлов для агентов
  FILE_MAP_UI.md      ← Карта index.html / vk.html / privacy.html
  shared/
    ROADMAP.md        ← Единственная дорожная карта продукта
    DEVELOPMENT_HISTORY.md ← Сводная история разработки
    WORK_LOG.md       ← Журнал задач команды (пишут все агенты)
    COMMIT_CONVENTION.md ← Правила понятных заголовков коммитов
  pm/
    bugs.md           ← Баги, входящие, отчёт для разработки
    qa-checklist.md   ← Smoke/regression checklist
```

## Команда агентов

| Агент | Роль | Где работает |
|-------|------|-------------|
| **Codex** (OpenAI) | Пишет и деплоит код | `<repo-root>` |
| **Cowork** (Claude) | Планирование, документация, советник | Рядом с Юрием |
| **MiMo** | Оптимизация токенов, AI-вызовы | API |

**Codex — главный исполнитель кода.** Cowork не пишет в index.html напрямую без запроса.

## КРИТИЧЕСКИЕ ПРАВИЛА

### 1. Кодировка (нарушалось 3+ раз)
- **НИКОГДА** не использовать PowerShell `-replace`, `Set-Content`, `Out-File` для файлов с кириллицей
- Читать: `[System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)`
- Писать: `[System.IO.File]::WriteAllText($f, $content, (New-Object System.Text.UTF8Encoding $false))`
- Проверять после: `(Select-String -Path $f -Pattern 'Войти|Задачи|Сегодня').Count` — должно быть >= 26

### 2. Секреты
- `worker.js` содержит только `ANTHROPIC_KEY_PLACEHOLDER` — не коммитить реальный ключ!
- Реальные ключи — только в GitHub Secrets, GitHub Actions инжектирует при деплое

### 3. Два nav-компонента в index.html
- `bottom-nav-v2` внутри `#home` (position:absolute)
- `global-nav` фиксированный для остальных экранов
- При изменении меню — обновлять **оба**!

### 4. Git
- GitHub Desktop — удобный вариант для Алексея, но не обязательное правило для Юрия или опытных участников.
- Локальный commit можно делать по явной просьбе.
- `pull --rebase`, push, merge в `main`, force push и destructive reset/revert требуют отдельного согласования, если есть риск затронуть чужие изменения или live.
- Перед опасным Git-действием указать ветку, действие, риск и кто подтвердил.
- Рабочий редактор: `git config --global core.editor notepad`
- Заголовки коммитов писать по `shared/COMMIT_CONVENTION.md`: `type(scope): что изменилось`

### 5. Одна фаза за сессию
Codex берёт одну задачу, делает, коммитит, стоп. Не начинает следующую без нового промпта.

## Навигация по index.html (5000+ строк)

1. Сначала читай `FILE_MAP.md`, затем `FILE_MAP_UI.md` — там диапазоны строк по секциям.
2. Читай только нужную секцию через диапазоны строк.
3. Текущая структура `index.html`: CSS 12–969 | HTML 971–2844 | JS 2845–5776.

## Текущие приоритеты (июнь 2026)

Актуальный источник приоритетов — `shared/ROADMAP.md` и `pm/backlog.md`.

Ближайший фокус:
- [ ] **Фаза 11** — относительные даты в карточках задач
- [ ] **152-ФЗ / РКН** — ручное действие Алексея до публичного промо
- [ ] **Yandex Cloud PostgreSQL** — ручной blocker до переноса ПД
- [ ] **Premium trust positioning** — обсудить с Юрием / Claude до закрепления в roadmap
- [ ] **QA перед внешними пользователями** — smoke/regression по `pm/qa-checklist.md`

Патчи лежат в `redesign/patches/`, если эта папка есть в текущем checkout.
Если локальных патчей нет в checkout, сначала уточнить источник патча и не искать `CODEX_INSTRUCTIONS.md` как обязательный файл репозитория.

## Перед началом работы

0. Проверить текущую ветку и статус. Если нужен `pull --rebase`, push или merge — сначала явно согласовать действие и риск.
1. Прочитай `DEVELOPMENT_LOG.md` — последние изменения
2. Прочитай `shared/ROADMAP.md` — текущие приоритеты
3. Прочитай `shared/WORK_LOG.md` — что делает команда прямо сейчас
4. После работы — дописать запись в `DEVELOPMENT_LOG.md` и `shared/WORK_LOG.md`

## Деплой

```powershell
# App:
# main связан с GitHub Pages, поэтому push/merge в main влияет на live.
# Локальный commit можно делать по явной просьбе; push/merge согласовывать отдельно.

# Worker (из 4e-worker/):
npx wrangler deploy
```
