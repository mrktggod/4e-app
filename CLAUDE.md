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
| `mrktggod/4pm` | Приватная бизнес-документация: roadmap, backlog, bugs, strategy, PM/QA | Нет app deploy |
| 4e-worker (отдельный) | Cloudflare Worker | `npx wrangler deploy` |
| 4e-bot (отдельный) | Telegram бот | Railway автодеплой |

## Архитектура файлов

```
4e-app/
  index.html          ← Telegram Mini App (крупный legacy-монолит; новый UI-код не должен увеличивать inline-долг)
  vk.html             ← VK Mini App (отдельный, без Telegram SDK)
  privacy.html        ← Политика конфиденциальности (152-ФЗ)
  CLAUDE.md           ← Этот файл
  DEVELOPMENT_LOG.md  ← Канонический лог изменений
  AGENTS.md           ← Правила для агентов
  FILE_MAP.md         ← Главная карта файлов для агентов
  FILE_MAP_UI.md      ← Карта index.html / vk.html / privacy.html
  pm/
    inbox/            ← Операционные входящие брифы
    outbox/           ← Операционные отчёты
  docs/
    tasks/            ← Архив атомарных задач
```

Roadmap, backlog, bugs, QA checklist, team sync, work log и commit convention переехали в приватный репозиторий `https://github.com/mrktggod/4pm`.

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
- Юрий обычно управляет Git через Claude. Если Юрий просит обновиться, закрыть задачу, commit или push, сначала проверь текущую ветку и `git status`, затем действуй только если нет риска потерять чужие или незакоммиченные изменения.
- Локальный commit можно делать по явной просьбе.
- `pull --rebase`, push, merge в `main`, force push и destructive reset/revert требуют отдельного согласования, если есть риск затронуть чужие изменения или live.
- Перед опасным Git-действием указать ветку, действие, риск и кто подтвердил.
- Рабочий редактор: `git config --global core.editor notepad`
- Заголовки коммитов писать по правилам из приватного `https://github.com/mrktggod/4pm/blob/feat/admin-tariff-api/shared/COMMIT_CONVENTION.md`: `type(scope): что изменилось`

### 5. Team Sync: ключевые фразы Юрия и Алексея
- Если Юрий пишет `Что там у Лехи?`, сначала прочитай приватный `https://github.com/mrktggod/4pm`, затем дай короткий отчёт по задачам от Алексея, статусам, блокерам и следующему шагу.
- Если Юрий пишет `Закрой задачу и синхронизируй`, помоги проверить изменения, сделать commit, push в рабочую ветку и обновить team sync в приватном `4pm`. Если push не получился, объясни причину и дай простую ручную инструкцию.
- Если Юрий пишет `Обнови проект из GitHub безопасно`, проверь ветку, `git status`, сделай `git fetch origin` и подтягивай изменения только если рабочее дерево не содержит рискованных незакоммиченных изменений.
- Если Алексей спрашивает `Что там у Юры?`, Codex делает зеркальный отчёт по приватному `4pm`, PM-докам и Git-состоянию.
- Merge в `main` не делается автоматически и требует отдельного подтверждения.

### 6. Одна фаза за сессию
Codex берёт одну задачу, делает, коммитит, стоп. Не начинает следующую без нового промпта.

### 6. UI-архитектура
- Новый UI-код: HTML = структура, LESS = стили, JS = поведение.
- Новые стили писать в `styles/**/*.less`, затем запускать `npm run build:css`.
- Новые классы называть по BEM-подходу: `block`, `block__element`, `block--modifier`.
- Базовая доступность входит в Definition of Done для нового и изменяемого UI: labels/accessible names, видимый focus, keyboard flow, доступные status/error сообщения, dialog-поведение и mobile touch targets.
- Не добавлять новые `style=""`, `onclick=""`, `oninput=""`, `onchange=""` и похожие inline-обработчики в HTML.
- Для поведения использовать `addEventListener()` или делегирование событий.
- Старый inline-код и accessibility-проблемы считать legacy-долгом: не переписывать всё одним проходом, но не увеличивать и постепенно исправлять при правке конкретных экранов.
- Проверка: `npm run check:ui-architecture`.
- Для UI-задач сверять результат с приватным QA checklist в `https://github.com/mrktggod/4pm`.
- Подробности по UI-архитектуре хранятся в приватном `4pm`.

## Навигация по index.html (5000+ строк)

1. Сначала читай `FILE_MAP.md`, затем `FILE_MAP_UI.md` — там диапазоны строк по секциям.
2. Читай только нужную секцию через диапазоны строк.
3. Не ориентируйся на старую привычку писать CSS/JS прямо в `index.html`; новые стили идут в LESS, новые обработчики — в JS.

## Текущие приоритеты (июнь 2026)

Актуальный источник приоритетов — приватный `https://github.com/mrktggod/4pm`.

Ближайший фокус:
- [ ] **Фаза 11** — относительные даты в карточках задач
- [ ] **152-ФЗ / РКН** — ручное действие Алексея до публичного промо
- [ ] **Yandex Cloud PostgreSQL** — ручной blocker до переноса ПД
- [ ] **Premium trust positioning** — обсудить с Юрием / Claude до закрепления в roadmap
- [ ] **QA перед внешними пользователями** — smoke/regression по приватному `4pm`

Патчи лежат в `redesign/patches/`, если эта папка есть в текущем checkout.
Если локальных патчей нет в checkout, сначала уточнить источник патча и не искать `CODEX_INSTRUCTIONS.md` как обязательный файл репозитория.

## Перед началом работы

0. Проверить текущую ветку и статус. Если нужен `pull --rebase`, push или merge — сначала явно согласовать действие и риск.
1. Прочитай `DEVELOPMENT_LOG.md` — последние изменения
2. Прочитай приватный `4pm` roadmap — текущие приоритеты
3. Прочитай приватный `4pm` work log — что делает команда прямо сейчас
4. Если работа передаётся между Алексеем и Юрием — прочитай team sync в приватном `4pm`
5. После работы — дописать запись в `DEVELOPMENT_LOG.md` и при необходимости в приватный `4pm`

## Деплой

```powershell
# App:
# main связан с GitHub Pages, поэтому push/merge в main влияет на live.
# Локальный commit можно делать по явной просьбе; push/merge согласовывать отдельно.

# Worker (из 4e-worker/):
npx wrangler deploy
```
