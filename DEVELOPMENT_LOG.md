# DEVELOPMENT LOG — проект 4 AI-секретарь

> Веду я (Cowork-наблюдатель). Обновляется после каждого значимого изменения.
> Мимо и Codex дописывают раздел после каждой выполненной задачи.

---

## КРИТИЧЕСКИЕ ПРАВИЛА ДЛЯ АГЕНТОВ

### Кодировка (нарушалось 3+ раз — это самая частая ошибка)
- **НИКОГДА** не использовать PowerShell `-replace`, `Set-Content`, `Out-File` для файлов с кириллицей
- Читать: `[System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)`
- Писать: `[System.IO.File]::WriteAllText($f, $content, (New-Object System.Text.UTF8Encoding $false))`
- После правки проверять: `Select-String -Path $file -Pattern 'Войти|Задачи'`
- Если кириллица пропала → восстанавливать байтовым методом с GitHub (не редактировать!)

### Git
- После `git reset --hard` нужен `git push --force`
- Конфликты при `git revert` → `git revert --abort` + `git reset --hard <hash>`
- Перед правкой VK/TG файлов: `git stash` как страховка

### PowerShell
- `;` вместо `&&`
- Скачивать файлы: `$bytes = (Invoke-WebRequest -Uri $url).RawContentStream.ToArray()`
- Заголовки: `-Headers @{"Key"="Value"}`

---

## АРХИТЕКТУРА

| Файл | Назначение |
|------|-----------|
| `4e-app/index.html` | Telegram Mini App — не трогать без крайней нужды |
| `4e-app/vk.html` | VK Mini App — отдельный, без Telegram SDK |
| `4e-worker/worker.js` | Cloudflare Worker (минифицирован) |
| `4e-worker/src/bot/` | Telegram бот (разбит на модули) |

### Ключевые эндпоинты Worker
- `/anthropic` — прокси к Claude, требует `x-token`
- `/tasks` — задачи по токену без chatId
- `/auth/vk` — VK авто-логин

---

## ИЗВЕСТНЫЕ ПРОБЛЕМЫ (открытые)

| # | Проблема | Приоритет |
|---|----------|-----------|
| 1 | Email через Resend — пользователи не получают писем | высокий |
| 2 | Сброс пароля — бэкенд не реализован | высокий |
| 3 | Тестовый платёж — webhook не протестирован до конца | средний |
| 4 | Единая модель пользователя VK+TG+Email | средний |
| 5 | Миграция с KV на D1 | низкий |
| 6 | `bottom-nav-v2` (в #home) и `global-nav` — два отдельных компонента, нужно держать синхронизированными | средний |
| 7 | ANTHROPIC_KEY в worker.js должен быть только PLACEHOLDER — не коммитить реальный ключ | высокий |

---

## ИСТОРИЯ ИЗМЕНЕНИЙ

## 2026-06-26 — BACK-001: Resend email secret для Worker (Codex)

**Что сделано:** В отдельном worker-репозитории `4e-worker` создана ветка `fix/resend-email-secret` и коммит `086f19b`. Из `worker.js` удалён hardcoded `RESEND_KEY`; `sendEmail()` теперь читает runtime secret `RESEND_KEY`, не падает Worker 1101 при отсутствующем secret, логирует конфигурационную ошибку/ошибку Resend и возвращает `false`. `/auth/forgot-password` теперь не сообщает пользователю ложный успех для существующего аккаунта, если письмо не отправилось, а возвращает контролируемый `502`.

**Проверка кодировки:** `index.html` не менялся, Шаг 0 не требовался.

**Тест:** `node --check worker.js`; `rg -n "re_[A-Za-z0-9_]+" worker.js` не нашёл hardcoded Resend key; `git diff --check` прошёл; `wrangler deploy --dry-run --config wrangler.toml` собрал Worker (`Total Upload: 55.77 KiB / gzip: 10.35 KiB`) и показал binding `env.KV`. Проверка `wrangler secret list` и production deploy заблокированы окружением: Wrangler требует `CLOUDFLARE_API_TOKEN` в non-interactive session. 2026-06-27: `git push -u origin fix/resend-email-secret` completed; PR creation is blocked because local `gh` is not logged in and GitHub connector returned API 404 for `mrktggod/4e-bot`; `wrangler whoami` later succeeded after OAuth login, `wrangler secret list --config wrangler.toml` confirmed `RESEND_KEY`, and production deploy succeeded: Worker `restless-lab-d737`, version `abe182e4-05b5-4c28-9934-9f972e662098`, URL `https://restless-lab-d737.shelckograff.workers.dev`. Safe smoke: `POST /auth/forgot-password` with a non-existing email returned `200 {"ok":true}`; final email-delivery smoke still needs an existing test account and Resend Dashboard/email confirmation.

**Коммит:** `086f19b` (`fix(worker): use Resend secret for email delivery`) в `4e-worker`; branch `origin/fix/resend-email-secret` pushed.

---
## 2026-06-25 — BACK-003: биометрическое согласие 152-ФЗ (Codex)

**Что сделано:** В `index.html` установлен патч `09_biometric_consent.html` перед закрывающим `</body>`. `openVoice()` теперь сначала вызывает `window.biometricConsentRequired()`, поэтому при первом нажатии на микрофон открывается экран согласия на обработку голоса. В форме входа добавлена ссылка на `privacy.html`, а в разделе безопасности добавлена строка отзыва согласия. Обновлены `FILE_MAP.md`, `FILE_MAP_UI.md`, `pm/backlog.md` и `pm/roadmap.md`.

**Проверка кодировки:** до правки — 51 совпадение по `Войти|Задачи|Сегодня`; после правки — 52 совпадения. Увеличение ожидаемое: добавлена legal-note со словом «Войти».

**Тест:** `node` проверил синтаксис 2 inline scripts в `index.html`; статическая проверка маркеров Фазы 9 прошла (`biometricConsentRequired`, `biometric_consent_v1`, disabled confirm button, legal-note, revoke row). `git diff --check` прошёл без whitespace errors; portable-path эквивалент через `rg` не нашёл локальных user-путей. `privacy.html` существует и содержит политику конфиденциальности/152-ФЗ. Playwright в локальном окружении не установлен, поэтому browser click-flow остаётся ручной проверкой после push.

**Коммит:** `legal: biometric consent and privacy policy`

---
## 2026-06-25 — Исправление сброса пароля (Codex)

**Что сделано:**
- В `index.html` добавлена ошибка под email на экране "Сброс пароля".
- `doForgotPassword()` теперь не отправляет пустой email и значения не в формате email, например `fff`.
- Ответ `/auth/forgot-password` теперь обрабатывается явно: успех показывает блок "Письмо отправлено", серверная ошибка остаётся на форме с понятным сообщением.
- `showScreen()` скрывает нижнюю навигацию на публичных auth/reset-flow экранах: `onboarding`, `login`, `forgot-password`, `reset-password`.
- Обновлены `FILE_MAP.md`, `FILE_MAP_UI.md`, `pm/bugs.md` и `pm/qa-checklist.md`.

**Проверка кодировки:** 22 / 22 совпадений по `Войти|Задачи|Сегодня`; перед правкой создан backup `index.backup_20260625_1821.html`.

**Тест:** локальная раздача `python3 -m http.server 8000`; `curl -I http://127.0.0.1:8000/index.html` вернул `200 OK`. Точечный JS-smoke на функциях `doForgotPassword()` и `showScreen()` проверил пустой email, `fff`, успешный ответ, серверную ошибку, скрытие nav на `forgot-password` и `reset-password`. Встроенный browser-плагин в этой среде упал при открытии тяжёлого `index.html`, поэтому визуальный WebView-smoke нужен после деплоя/в Telegram.

**Коммит:** N/A — коммит/пуш не выполнялся.

---

## 2026-06-25 — Фиксация P1 бага восстановления пароля (Codex)

**Что сделано:**
- В `pm/bugs.md` добавлен активный баг `BUG-2026-06-25-002`: сброс пароля принимает некорректный email и переводит пользователя на пустой экран.
- Баг отмечен как существенный для доступа: `High / P1`, метка `Auth / Access blocker risk`.
- Создана задача для разработки `docs/tasks/BUG-2026-06-25-002_password_reset.md`.
- В `pm/qa-checklist.md` добавлены регрессионные проверки восстановления пароля.

**Проверка кодировки:** `index.html` не изменялся.

**Тест:** проверена структура PM-документов; код приложения не менялся.

**Коммит:** N/A — коммит/пуш не выполнялся.

---

## 2026-06-25 — Напоминание о синхронизации перед работой (Codex)

**Что сделано:**
- В `AGENTS.md`, `CLAUDE.md`, `README.md` добавлено правило: перед началом работы напомнить пользователю и выполнить `git fetch origin` и `git pull --rebase`.
- В `FILE_MAP.md` добавлена стартовая проверка синхронизации с GitHub.

**Проверка кодировки:** `index.html` не изменялся.

**Тест:** перед правкой выполнены `git fetch origin` и `git pull --rebase`; локальная ветка синхронизирована с `origin/main`.

**Коммит:** N/A — изменения подготовлены локально, коммит/пуш не выполнялся.

---

## 2026-06-25 — Правило понятных заголовков коммитов (Codex)

**Что сделано:**
- Добавлен `shared/COMMIT_CONVENTION.md` с форматом `type(scope): что изменилось`.
- Правило подключено в `AGENTS.md`, `CLAUDE.md`, `COWORK_INSTRUCTIONS.md`, `README.md`.
- `FILE_MAP.md` обновлён, чтобы новый командный стандарт был виден агентам.

**Проверка кодировки:** `index.html` не изменялся.

**Тест:** `git diff --check` после правок.

**Коммит:** N/A — изменения подготовлены локально, коммит/пуш не выполнялся.

---

## 2026-06-25 — Убраны локальные пути и добавлен path guard (Codex)

**Что сделано:**
- В `COWORK_INSTRUCTIONS.md` абсолютный Mac-путь заменён на переносимый `<repo-root>` и универсальную команду перехода в локальную папку репозитория.
- Старые Windows user-пути заменены на `<repo-root>`, `<worker-repo-root>` и относительные пути в `AGENTS.md`, `CLAUDE.md`, `docs/tasks/TASK_TEMPLATE.md`, `DEVELOPMENT_LOG.md`.
- Добавлен `scripts/check-portable-paths.sh`, локальный `.githooks/pre-commit` и GitHub Actions workflow `.github/workflows/path-guard.yml`.
- В локальном checkout включён `git config core.hooksPath .githooks`, чтобы проверка запускалась перед commit.

**Проверка кодировки:** `index.html` не изменялся.

**Тест:** `git fetch origin` перед правкой; локальная ветка не отставала от GitHub. `bash scripts/check-portable-paths.sh` проходит. Поиск по Mac/Windows user-путям не находит совпадений в репозитории.

**Коммит:** `docs: remove local absolute paths from docs`

---

## 2026-06-25 — Фикс пустого экрана, logout и active-состояния меню (Codex)

**Что сделано:**
- Исправлен пустой главный экран после обновления: `showScreen()` теперь сбрасывает вложенный scroll-контейнер `#home`.
- Убраны дублирующиеся `id` у пунктов нижней навигации; active-состояние переведено на `data-nav`.
- Добавлена подсветка активного пункта для обеих навигаций, включая микрофон.
- Исправлен logout: выход больше не полагается на `window.location.reload()`, а явно чистит состояние и показывает экран входа.
- Добавлен auth-guard в `showScreen()`: без токена приватные экраны больше не показывают дефолтного пользователя.
- VK-адаптер в `index.html` теперь включается только при реальных VK launch-параметрах, чтобы не перехватывать `showScreen('login')` вне VK.

**Проверка кодировки:** 22 / 22 совпадений по `Войти|Задачи|Сегодня`.

**Тест:** локальная раздача `python3 -m http.server 8000`; in-app browser mobile viewport 390x844. Проверено: home после принудительного scroll вниз возвращается на `scrollTop=0`, `voice` не виден поверх home, active stroke для tasks/calendar/chats/brain зелёный, logout переводит на `login`, скрывает нижнее меню и удаляет token, прямой `showScreen('profile')` без token переводит на `login`.

**Коммит:** N/A — коммит/пуш не выполнялся.

---

## 2026-06-25 — Подготовка рабочей папки к разработке и тестированию (Codex)

**Что сделано:**
- Созданы `FILE_MAP.md`, `FILE_MAP_UI.md`, `FILE_MAP_WORKER.md`, `FILE_MAP_BOT.md`
- Добавлен `.gitignore` для системных и локальных файлов
- Обновлены `AGENTS.md`, `CLAUDE.md`, `COWORK_INSTRUCTIONS.md` под текущий checkout репозитория
- Обновлён `README.md` как быстрый старт для новых агентов
- Уточнён PM/QA-контур через `pm/bugs.md` и `pm/roadmap.md`

**Проверка кодировки:** `index.html` не изменялся.

**Тест:** локальная раздача через `python3 -m http.server 8000`; `index.html`, `vk.html`, `privacy.html` отвечают `200 OK`.

**Коммит:** N/A — изменения подготовлены локально, коммит/пуш не выполнялся.

---

### 2026-06-11 — Инициализация воркера

**Что сделано:** init worker + CI/CD; настройка GitHub Actions; секреты через env.

**Паттерн проблем в этот день:**
- chatId fallback использовал global вместо telegramId → исправлено
- KV binding не был прописан в wrangler.toml → исправлено
- Попытка сохранять задачи по telegramUserId → 2 раза revert (нестабильное поведение)
- Итог: передавать chatId явно при сохранении задачи

---

### 2026-06-11 — Рефакторинг bot.js

**Что сделано:** `bot.js` разбит на модули `src/bot/` (config, analyzer, tasks, reminders, commands, handler, index).

**Статус:** задеплоено, стабильно.

---

### 2026-06-11 — Начало VK Mini Apps интеграции

**Что сделано:** backup коммит → добавлен CORS `Access-Control-Allow-Credentials` → добавлен эндпоинт `/auth/vk` и `handleVKAuth` → добавлен `vk.html` frontend в worker.

---

### 2026-06-11 — VK Mini App в 4e-app

**Что сделано:** `vk.html` добавлен в 4e-app; загрузка задач из KV после VK auth; VK Bridge auto-login.

**Паттерн проблем:**
- Кодировка сломалась после VK правок → 2 restore коммита + reset
- Шрифты: Google Fonts не грузятся в VK iframe → заменено на system font stack
- URL AI чата был неверным → исправлено на `/anthropic`

---

### 2026-06-16 — Стабилизация VK + AI чат

**Что сделано:**
- AI chat URL → `/anthropic`
- AI chat prompt — убраны лишние вопросы
- Chat history persistence + перезагрузка задач после ответа AI
- Загрузка задач по токену без chatId
- Передача задач в system prompt AI

**Статус:** задеплоено.

---

### 2026-06-16 — Документация для агентов

**Что сделано:** добавлены `COWORK_INSTRUCTIONS.md`, `docs/tasks/TASK_TEMPLATE.md`, `AGENTS.md`.

**Статус:** репо содержит инструкции для Мимо и Codex.

---

## 2026-06-20 — Юридическое соответствие 152-ФЗ (подготовка Claude)

**Что сделано:**
- Проведён анализ рисков по 152-ФЗ: локализация, биометрия, регистрация РКН
- Создана `4e-app/privacy.html` — Политика конфиденциальности (готова к деплою)
- Создан `redesign/patches/09_biometric_consent.html` — экран согласия на голос (ст. 11)
- Создан `RKN_CHECKLIST.md` — чек-лист с данными для уведомления РКН

**Критические риски (требуют действий):**
1. Нет регистрации в РКН — штраф 100–300 тыс. → Юрий подаёт уведомление через pd.rkn.gov.ru
2. Голос без письменного согласия — штраф до 500 тыс. → Codex устанавливает патч 09
3. Данные вне РФ (Cloudflare) — штраф до 18 млн → решается миграцией на Yandex Cloud

**Статус Codex:** Фаза 9 установлена 2026-06-25 в рамках BACK-003; инструкции из CODEX_INSTRUCTIONS.md выполнены локально.

---

## 2026-06-20 — Подготовка к редизайну (сессия Codex)

**Что сделано:**
- Созданы бэкапы: `index_original.html` (копия index.html) и `vk_backup.html` (копия vk.html)
- Сессия Codex завершилась исчерпанием токенов до установки патчей

**Что НЕ сделано:** ни одна из 8 фаз редизайна не установлена

**Состояние:** index.html чистый, кириллица в порядке, бэкапы готовы

**Следующий сеанс:** начать с Фазы 1 — `redesign/patches/01_light_theme.css`  
Патчи лежат в `redesign/patches/`, если эта папка есть в текущем checkout.

---

## 2026-06-20 — Warmup-соединение VK (Claude + Юрий)

**Что сделано:** добавлена `warmupConnection()` в `vk.html` — тихий GET на `edge.4-ai.site` при загрузке страницы до первого клика. Маркер: `vk-auth-warmup-20260620-7`. Commit `00c1a45`.

**Проблема:** VK WebView холодный старт — DNS+TLS занимал ~15 сек. Recovery из CODEX-055 (900ms) не успевал, первый клик падал с ошибкой соединения.

**Результат:** вход с первого клика без ошибки ✅. Небольшая задержка (~5–8 сек) после клика остаётся — приемлемо для внутреннего тестирования.

---

## 2026-06-20 — Редизайн index.html (фазы 1–8) (Claude + Юрий)

**Что сделано:** полный редизайн `index.html` — все 8 патчей установлены и задеплоены за одну сессию.

| Фаза | Коммит | Содержание |
|------|--------|------------|
| 1–3 | `90e23c6`, `2f02999`, `ffeb8d4` | Светлая тема, фильтры задач, 4 новых экрана |
| 4 | `964cbb8` | Карточка задачи: поля-строки + табы + 3 кнопки действий |
| 5 | `964cbb8` | Голосовой экран: полноэкранный `#voice` с пульсирующей кнопкой |
| 6 | `964cbb8` | Чаты: круглые иконки мессенджеров; Календарь: секция дедлайнов |
| 7 | `9dabe64` | Адаптивный CSS: hover-эффекты, tablet sidebar, desktop 3-колонка |
| 8 | `9dabe64` | VK адаптер: тема, хаптики, safe area, swipe back, VK Storage |

**Ключевые технические решения:**
- `voice-overlay` → полноэкранный `screen#voice`, `openVoice()` теперь `showScreen('voice')`
- `detail-title-v2`, `detail-person-v2` → новые ID `detail-title`, `detail-person`
- `.msng-tabs` → `.msng-icons-row` (48px круглые иконки)
- Добавлены функции: `completeTask`, `switchDetailTab`, `editDetailField`, `openTaskMove`, `enterEditMode`, `makeDetailEditable`, `toggleVoice`, `showVoiceInfo`
- VK адаптер активируется только если `window.vkBridge !== undefined` (не затрагивает TG)

**Кириллица:** 27 совпадений — норма на протяжении всей сессии.

---

---

## 2026-06-20 — Post-Codex: Патчи главного экрана (Claude + Юрий)

**Контекст:** Codex применил фазы 1–8 но патч 02 (главный экран) был применён частично — только фильтр-табы. Весь основной контент (`focus-day-card`, `stat-mini`, `home-task-list`) остался в старой верстке.

**Что исправлено:**
- Полная замена блока `#home` на целевой дизайн из патча 02
- Исправлен баг CSS: `.task-row{flex-direction:column}` на строке 147 переопределял новый CSS → исправлено на `flex-direction:row`
- Восстановлена кнопка аватара профиля (пропала при замене шапки)
- Исправлено: тема dark→light не переключалась (toggle обновлял `<body>`, а CSS читал `<html>`)

**Ключевые новые ID в JS (были старые, стали новые):**
- `focus-bar-text` → `focus-day-text`
- `lime-card` → `home-task-list`
- `dash-done-today` → `stat-done`, `dash-tasks-today` → `stat-tasks`, `dash-prom-today` → `stat-promises`

**Коммиты:** `0b641ba`, `aa35941`

---

## 2026-06-20 — Анимация планеты + редизайн карточек задач (Claude + Юрий)

**Что сделано:**
- Убран Lottie CDN (не работал в TG WebView) → inline SVG-анимация с `<animateMotion>` (спутники, орбиты, свечение) — работает без зависимостей
- Добавлена sparkle-иконка в левую часть карточки «Фокус дня»
- Карточки задач: новый порядок элементов `[№][бейдж][текст/дата][›]`, бейджи «Работа»/«Личное» вместо «горит»/«задача»/«должны»
- Каждая карточка задачи теперь имеет собственный фон (`card2` + border-radius 14px + border) — не просто разделитель

**Коммиты:** `29f25a7`

---

## 2026-06-20 — UI-полировка: светлая тема, nav, вкладка «Обсудить» (Claude + Юрий)

**Что сделано:**

| Правка | Описание |
|--------|----------|
| Светлая тема | Усилен glow сверху (`home-glow`); белый фон `.bottom-nav` в light mode |
| Планета | Уменьшена с 148px до 118px — не касается текста и краёв карточки |
| Nav унификация | `global-nav` теперь: чаты \| stats \| mic \| tasks \| brain — как в home; удалён профиль |
| Вкладка «Обсудить» | В детализации задачи: таб «Обсудить» → AI генерирует совет + вопрос, далее полноценный чат по задаче |
| Убран «Совет от 4» | Блок `detail-ai-sec` удалён; функционал перенесён в вкладку «Обсудить» |

**Новые JS-функции:** `startDiscussAdvice()`, `sendDiscussMessage()`, `addDiscussMsg()`, `updateDiscussLoading()`

**Коммит:** задеплоено

**Открытые пункты из запросов Юрия, которые НЕ сделаны:**
- Относительные даты в карточках задач («Сегодня», «Завтра» вместо ISO)  
- Фаза 9 (согласие на биометрию) — закрыта 2026-06-25, см. BACK-003 выше
- Backend: email-рассылка через Resend сломана

---

## 2026-06-20 — Промо-стратегия: SEO-блог + ВКонтакте (Claude + Юрий)

**Что сделано:**
- Создан `4-ai-blog/` — статический HTML-блог для деплоя на 4-ai.site (GitHub Pages)
- 3 SEO-статьи под низкоконкурентные запросы:
  - «AI-секретарь в Telegram: как не держать задачи в голове»
  - «Голосовое управление задачами: почему это быстрее любого приложения»
  - «Как не забывать важные дела: метод умных напоминаний»
- `sitemap.xml`, `robots.txt`, JSON-LD structured data в каждой странице
- `VK_CONTENT_PLAN.md` — 10 готовых постов с текстами и хэштегами для ВКонтакте
- `DEPLOY.md` — инструкция по подключению домена 4-ai.site через GitHub Pages

**Статус:** файлы готовы, деплой требует ручных действий (настройка DNS, новый GitHub репо)

**Следующие статьи для блога (темы):** GTD для начинающих, 5 TG-ботов для продуктивности, AI vs планировщик, утренняя рутина.

---

## 2026-06-20 — Codex: Backend-инфраструктура (D1 схема + безопасность)

**Что сделано Codex (текущая сессия):**

| Файл | Что |
|------|-----|
| `4e-worker/migrations/0001_initial_schema.sql` | Полная D1/PostgreSQL схема — users, auth, sessions, tasks, reminders, AI threads/memories |
| `src/bot/worker-client.js` | HMAC-подписанные запросы бот→воркер (безопасность) |
| `src/bot/tasks.js` | Переход на `workerFetch` — подписанные запросы |
| `src/bot/reminders.js` | Проверка напоминаний и дедлайнов через воркер-эндпоинты |
| `src/bot/index.js` | `setInterval` для периодических проверок (15 мин / 1 час) |

**Оценка работы Codex:**
- ✅ D1-схема — качественная, production-ready. Решает проблему #4 (единая модель TG+VK+Email), закладывает основу под фазу 13
- ✅ HMAC-подпись запросов — правильное архитектурное решение, закрывает уязвимость
- ✅ Reminders/Deadlines — реализована логика проверки через воркер
- ⚠️ **Отклонение от плана:** Codex работал над фазой 13 (D1 миграция) вместо фаз 9/11/12 которые были в очереди
- ✅ Фаза 9 (biometric consent) — закрыта 2026-06-25, см. BACK-003 выше
- ❌ Фаза 11 (relative dates) — не сделана  
- ❌ Фаза 12 (email + сброс пароля) — не сделана

**Вывод:** работа ценная, но не по приоритету. Фаза 9 закрыта 2026-06-25; фазы 11 и 12 остаются в очереди.

---

## 2026-06-23 — Фиксы после редизайна (Claude + Юрий)

**Контекст:** Codex применил редизайн, но сломал несколько функций. Параллельно бот упал.

**Что сделано:**

| Правка | Файл | Описание |
|--------|------|----------|
| Кнопка выхода | `index.html` | Добавлен `LOGOUT_K='chetam_logged_out'`; `doLogout()` → `window.location.reload()`; TG auto-login блокируется флагом |
| Галочка ✓ на дашборде | `index.html` | Кнопка пропала после редизайна; восстановлена в 4 местах: `loadTasks()`, `toggleAllTasks()`, `setHomeFilter()`, `selectMonth` |
| Конфликты git | `index.html` | 5+ конфликтов при `git pull --rebase` — Codex пушил параллельно; разрешены вручную |
| SyntaxError зелёный фон | `index.html` | Пропущенный маркер `<<<<<<< HEAD` на строке ~3594 — вызывал падение всего JS |
| Свободное место на диске | — | Осталось ~17 МБ; очищен TEMP → ~887 МБ |
| ROADMAP обновлён | `ROADMAP.md` | Добавлен «Горизонт 0.8 — Технический фундамент»: LESS + BEM + минификация |
| npm-скрипты | `package.json` | Добавлены `build:css` и `watch:css` для будущего LESS-pipeline |
| Бот: устойчивость к падениям | `src/bot/config.js` | Добавлены `bot.on('polling_error')`, `process.on('unhandledRejection')`, `process.on('uncaughtException')` — бот больше не падает от сетевых сбоев Telegram |

**Паттерн проблем:**
- Codex пушит в тот же момент что и мы → конфликты при следующем pull; решение: `git pull --rebase` перед пушем
- Vim открылся при `git rebase --continue` → закрыт через новый терминал + `git rebase --abort`; установлен `git config --global core.editor notepad`

---

## 2026-06-24 — Авторизация TG + API-ключ + UX навигации (Claude + Юрий)

**Что сделано:**

| Правка | Файл | Описание |
|--------|------|----------|
| Чёрный экран в TG Mini App | `index.html` | `loginWithTelegram()` теперь возвращает `true/false`; при неудаче показывает `showScreen('login')` вместо пустоты; `initApp()` не делает безусловный `return` после TG-логина |
| `telegramId required` на мобиле | `index.html` | Воркер ждал `body.user.id`, приложение слало только `{initData}`; добавлен `user: tgUser` в тело запроса |
| ANTHROPIC_KEY бэкин в worker.js | `worker.js` | Реальный ключ был закоммичен в git (невалидный); восстановлен `ANTHROPIC_KEY_PLACEHOLDER`; ключ обновлён в GitHub Secrets → GitHub Actions инжектирует при деплое |
| AI-чат ошибка `invalid x-api-key` | — | Следствие предыдущего; после обновления секрета и ре-деплоя → работает |
| Навигация: разные кнопки по экранам | `index.html` | `global-nav` (для всех экранов кроме home) имел 4 другие кнопки; унифицирован: те же 5 кнопок что в `bottom-nav-v2` (чаты, статистика, микрофон, задачи, AI) |
| Клавиатура перекрывает поле ввода | `index.html` | При фокусе на `ask-field` → `global-nav` скрывается; при `blur` (с задержкой 150мс) → восстанавливается |

**Паттерн проблем:**
- Два nav-компонента с разными кнопками (`bottom-nav-v2` внутри `#home` + `global-nav` фиксированный) — следить чтобы при будущих правках меню они оставались синхронизированными
- Секреты никогда не должны попадать в `worker.js` напрямую — только через `PLACEHOLDER` + GitHub Actions

---

## 2026-06-24 (2) — Навигация: права доступа, порядок кнопок, баг чатов (Claude + Юрий)

**Что сделано:**

| Правка | Файл | Описание |
|--------|------|----------|
| Мессенджер скрыт для всех кроме admin | `index.html` | `isAdmin()` проверяет `tgUser.id` (267468814) + email; `applyUserInfo()` скрывает/показывает `nav-ask` и `nav-chats` |
| Статистика убрана из навигации | `index.html` | Кнопка stats удалена из `bottom-nav-v2` и `global-nav`; доступ только через прогресс-карточки на дашборде |
| Порядок кнопок меню переработан | `index.html` | Новый порядок: чаты (admin) → задачи → календарь → микрофон → мозг; активная кнопка выделяется зелёным через `setNavActive()` + CSS `.nav-item.active svg{stroke:var(--green)}` |
| `goHome()` потерял активное состояние | `index.html` | Добавлен `setNavActive('tasks')` в `goHome()` |
| Баг: кнопка чатов возвращала на дашборд | `index.html` | Добавлены `'chats'`, `'msng-settings'`, `'chat-conv'` в `noNav` — `showScreen('chats')` больше не показывает `global-nav` даже кратковременно; таймеры в `completeTask()` и `openTaskFromChat()` теперь проверяют активный экран перед редиректом |

**Диагностика баги чатов:**
- В `openChats()` добавлен `console.log('[openChats] called')` — при тестировании проверить консоль
- Если функция вызывается но экран не показывается — сообщить

**Известные проблемы:**
- Баг чатов может быть ещё не полностью пофикшен — нуждается в тестировании

---

## 2026-06-25 — Оптимизация структуры проекта (Claude + Юрий)

**Что сделано:** аудит папки `Версия/` — найдены и удалены дубли, мусор и устаревшие файлы.

**Удалено (~1.22 MiB):**

| Файл / папка | Причина |
|---|---|
| `src/bot/` (корень) | Полный дубль `4e-worker/src/bot/`; версии в `4e-worker` новее и содержат расширенную обработку ошибок |
| `package.json` (корень) | Устаревший пакет `telegram-bot-4`; ссылался на удалённый `src/bot/index.js`; нигде не использовался |
| `package-lock.json` (корень) | Lock к устаревшему пакету выше |
| `.wrangler/cache/` (корень) | Кэш Wrangler; регенерируется автоматически |
| `Версия.rar` / `Версия.zip` | Ручные архивы всей папки; проект в git — архивы избыточны |
| `index (55).html` | Случайно сохранённый файл браузером |
| `README (1).md` | Дубль README с суффиксом браузера |
| `4_vk_mini_app.html` | Устаревший VK-прототип; функционал перенесён в `4e-app/vk.html` + VK-адаптер |
| `4e-app/index_original.html` | Backup перед редизайном; изменения закреплены в git |
| `4e-app/vk_backup.html` | Backup VK-версии; в git |

**Не тронуто:**
- `redesign/patches/` — Фаза 9 (`09_biometric_consent.html`) применена 2026-06-25; папка остаётся как источник патча/история редизайна

**Проверка актуальных файлов после удаления:** все `True` (`4e-app/index.html`, `worker.js`, `4e-worker/src/bot/index.js`, `4e-worker/worker.js`).

---

## ПАТТЕРНЫ ОШИБОК (для обучения)

1. **Кодировка** — самая частая. Любой PowerShell-агент без явного UTF-8 ломает кириллицу.
2. **KV + chatId** — путаница между `telegramId` и `chatId` при ключах в KV. Правило: передавать chatId явно.
3. **Revert циклы** — 2 раза за один день делали fix → revert → fix. Причина: не тестировали перед коммитом.
4. **VK iframe ограничения** — Google Fonts, внешние ресурсы, Telegram SDK недоступны в VK.
