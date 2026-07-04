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
| 1 | Уведомление РКН — ручной шаг Юрия | высокий |
| 2 | Yandex Cloud PostgreSQL — ручной шаг Алексея перед BACK-008 | высокий |
| 3 | `bottom-nav-v2` (в #home) и `global-nav` — два отдельных компонента, нужно держать синхронизированными | средний |
| 4 | ANTHROPIC_KEY в worker.js должен быть только PLACEHOLDER — не коммитить реальный ключ | высокий |

---

## ИСТОРИЯ ИЗМЕНЕНИЙ
## 2026-07-04 — SMART-001/002: chat roster + assignee tg id (Codex)

**Что сделано:** В локальном worker checkout добавлена миграция `4e-worker/migrations/0007_chat_members.sql` и три новых bot-only action'а в `worker.js`: `upsert-chat-members`, `get-chat-members`, `mark-chat-members-left`. Они ведут D1-таблицу `chat_members` по ключу `chat_id + tg_id` и позволяют боту копить roster группы. В `4e-worker/src/bot/handler.js` добавлены сбор roster-кандидатов из `msg.from`, `reply_to_message.from`, `new_chat_members`, `left_chat_member`, загрузка roster перед анализом, эвристики резолва исполнителя по `text_mention`, `@mention`, reply и fuzzy-матчу имени, а также сохранение `assigneeTgId` / `assigneeUsername` в объект задачи. В `4e-worker/src/bot/analyzer.js` system prompt теперь получает список реальных участников чата и автора reply, чтобы Haiku чаще возвращал живое имя из roster вместо абстрактного «он/она».

**Проверка кодировки:** `pm/backlog.md` — контрольный поиск до правки `29`; `shared/WORK_LOG.md` — `171`; `DEVELOPMENT_LOG.md` — `177`; `FILE_MAP_WORKER.md` — `11`; `FILE_MAP_BOT.md` — `5`. Итоговая сверка после правок не должна давать уменьшения.

**Тест:** `node --check <worker-repo-root>/src/bot/analyzer.js`; `node --check <worker-repo-root>/src/bot/handler.js`; `node --check <worker-repo-root>/worker.js`; `npx wrangler d1 migrations apply DB --env staging --remote` → `0007_chat_members.sql ✅`; `npx wrangler deploy --env staging` → version `231a8070-f7ab-46d2-8983-f3939063afad`; `GET https://restless-lab-d737-staging.shelckograff.workers.dev/` → `200`.

**Коммит:** `этот коммит`

**Блокеры:** Сам bot runtime по-прежнему живёт вне git-репозитория `4e-app`; staging worker уже умеет roster API, но без обновления процесса `node src/bot/index.js` нельзя честно проверить group smoke для `@mention`, reply и join/leave.

## 2026-07-04 — SMART-004: concise group task confirmations (Codex)

**Что сделано:** В локальном worker checkout обновлены bot-обработчики для `SMART-004`. `4e-worker/src/bot/handler.js` теперь формирует однострочное подтверждение `✓ Имя: задача — срок`, сохраняет задачу сразу после разбора сообщения, показывает только кнопки `✏️` и `✕`, а редактирование/отмена удаляют старую запись через `x-action: delete-task` и не рисуют ложное «Отменено», если бот уже потерял контекст callback. В `4e-worker/worker.js` подтверждён новый action `delete-task` с удалением по `taskId` из user/group KV-ключей; `saveTaskByName` в текущем checkout не реализован, поэтому дополнительных скрытых копий задачи этот сценарий сейчас не создаёт.

**Проверка кодировки:** `pm/backlog.md` — контрольный поиск до правки `29`; `shared/WORK_LOG.md` — `167`; `DEVELOPMENT_LOG.md` — `173`; `FILE_MAP_WORKER.md` — `10`; `FILE_MAP_BOT.md` — `3`. Итоговая сверка после правок не должна давать уменьшения.

**Тест:** `node --check <worker-repo-root>/worker.js`; `node --check <worker-repo-root>/src/bot/handler.js`; точечная проверка `handler.js`/`worker.js` на `formatTaskConfirmationLine`, `delete-task`, `handleDeleteTask`.

**Коммит:** `этот коммит`

**Блокеры:** Текущий `<worker-repo-root>` не является отдельным git-репозиторием, поэтому код bot/worker пока зафиксирован только локально. Для закрытия SMART-004 нужен runtime deploy процесса `node src/bot/index.js` и ручной smoke в тестовой группе.

## 2026-07-05 — SMART-006: user profile in AI chat context (Codex)

**Что сделано:** В `index.html` расширен system prompt AI-чата: добавлено явное указание учитывать профиль пользователя. Рядом с `sendAsk()` добавлены helper-функции, которые собирают из `currentUser` и `allTasksCache` профильный блок для Claude: имя, локальное время и timezone, тариф, количество активных/горящих/просроченных задач, завершённые за 7 дней (по доступным timestamp-полям), топ-3 людей из активных задач. Этот блок теперь инжектится в `system` вместе с датой и summary активных задач.

**Проверка кодировки:** `index.html` — совпадений `Войти|Задачи|Сегодня` до: `61`, после: `61`.

**Тест:** локальный grep подтвердил, что `index.html` на ветке содержит профильный блок и инжектит его в `system`. Полный staging smoke пока заблокирован: `npx wrangler secret list --env staging` не показывает `ANTHROPIC_KEY`, поэтому `/anthropic` на staging нельзя проверить честно.

**Коммит:** `этот коммит`

## 2026-07-05 — BACK-034: staging contour bootstrap (Codex)

**Что сделано:** Для `<worker-repo-root>` staging-конфиг приведён к штатному виду: в `wrangler.toml` добавлен `[env.staging]` с отдельными D1/KV bindings и `routes = []`, чтобы staging не наследовал prod-домен `edge.4-ai.site`; `wrangler.staging.toml` синхронизирован. Применена миграция `postgres_app_state.sql` к D1 `4e-staging`, staging worker задеплоен на `https://restless-lab-d737-staging.shelckograff.workers.dev`. В app-репо создана ветка `dev`: `index.html` по умолчанию ходит в staging worker, username бота можно прокинуть через `?bot=<staging_bot_username>`, а при недоступности `startToken` dev-ветка делает fallback-открытие Telegram-бота без тупика. Создан Pages-проект `4-ai-staging`, загружена dev-версия приложения, добавлена инструкция `docs/staging-contour.md`.

**Проверка кодировки:** `index.html` — совпадений `Войти|Задачи|Сегодня` до: `61`, после: `61`.

**Тест:** `node --check worker.js`; `npx wrangler d1 migrations apply DB --env staging --remote`; `npx wrangler deploy --env staging`; `curl https://restless-lab-d737-staging.shelckograff.workers.dev/` → `OK`; `curl -X OPTIONS ...` → `204`; `wrangler pages project create 4-ai-staging --production-branch dev`; `wrangler pages deploy . --project-name 4-ai-staging --branch dev`; `curl https://4-ai-staging.pages.dev/` содержит `const WORKER='https://restless-lab-d737-staging.shelckograff.workers.dev';`.

**Коммит:** `этот коммит`

**Блокеры:** `npx wrangler secret list --env staging` показывает только `BOT_API_TOKEN`; для AI smoke нужны как минимум `ANTHROPIC_KEY` и, вероятно, `OPENAI_KEY`/`RESEND_KEY`/`VK_SECRET_KEY`. Также нужен username тестового бота для полного ручного Telegram smoke, пока он не зафиксирован в репозитории и передаётся через `?bot=...`.

## 2026-07-04 — PM docs sync v2.1 (Codex)

**Что сделано:** Найден реальный target-репозиторий `<repo-root>` вместо `Documents\4\4e-app`. Из Desktop-источника байтовым `Copy-Item` синхронизированы `shared/ROADMAP.md`, `pm/backlog.md`, `pm/bugs.md`, `docs/ЗАДАЧИ_УМНЫЙ_АССИСТЕНТ.md` и `docs/ЗАДАЧИ_БЕТА_И_ВИРАЛЬНОСТЬ.md`. По дополнению inbox v2.1 переименованы task-файлы `BACK-025-completed-tasks-week.md` → `BACK-039-completed-tasks-week.md` и `BACK-027-admin-tariff-map.md` → `BACK-040-admin-tariff-map.md`, обновлены их внутренние идентификаторы и backlog-заметка про коллизию ID. Дополнительно приведены к portable-виду абсолютные пути в `CODEX_INSTRUCTIONS.md`, чтобы прошла repo-проверка путей.

**Проверка кодировки:** кириллица source/target совпала для всех 5 копируемых файлов — `ROADMAP 6055/6055`, `backlog 6680/6680`, `bugs 5994/5994`, `ЗАДАЧИ_УМНЫЙ_АССИСТЕНТ 4791/4791`, `ЗАДАЧИ_БЕТА_И_ВИРАЛЬНОСТЬ 5264/5264`.

**Тест:** `git diff --check`; `C:\Program Files\Git\bin\bash.exe scripts/check-portable-paths.sh`; grep по репо на старые ссылки `BACK-025-completed-tasks-week` / `BACK-027-admin-tariff-map` и Later-дубликаты — лишних упоминаний не осталось.

**Коммит:** `docs(pm): sync roadmap+backlog+bugs — SMART/VIRAL/PLAT задачи, аудит багов, решения 2026-07-04`

## 2026-06-29 — BACK-025: AI planner glass dashboard PM setup (Codex)

**Что сделано:** Создана PM-основа для переделки главного экрана в утренний AI-планер. В `shared/ROADMAP.md` добавлено направление "AI-планерный дашборд"; в `pm/backlog.md` добавлен `BACK-025 — Настраиваемый утренний AI-дашборд` как P1; `pm/next-actions.md` обновлён новым ближайшим фокусом; `pm/qa-checklist.md` получил smoke-проверки для "План на сегодня", "Пульс дня" и смысловых секций задач. Создан `docs/tasks/BACK-025_ai_planner_glass_dashboard.md`.

**Проверка кодировки:** `index.html` не менялся, Шаг 0 не требовался.

**Тест:** Документальная проверка связки `shared/ROADMAP.md` → `pm/backlog.md` → `pm/next-actions.md` → `pm/qa-checklist.md` → `docs/tasks/BACK-025_ai_planner_glass_dashboard.md`; `git diff --check`; `bash scripts/check-portable-paths.sh`.

**Коммит:** этот коммит.

**Статус:** PM setup выполнен. Следующий шаг — реализация UI в ветке `feat/ai-planner-glass-dashboard`.

---

## 2026-06-29 — BUG-2026-06-29-002: voice microphone error triage (Codex)

**Что сделано:** По скрину Алексея зафиксирован баг голосового режима: экран показывает "Ошибка микрофона" и не начинает запись. Точечная проверка `index.html` показала, что текущий `main` использует `SpeechRecognition` в `openVoice()`. В истории найден MediaRecorder-flow в `70a051f` / `origin/feat/voice-mediarecorder`, но он был откатан коммитом `e970d33` обратно к SpeechRecognition. Добавлены `BUG-2026-06-29-002` в `pm/bugs.md`, P1-строка `BACK-021` в Now `pm/backlog.md`, voice-проверки в `pm/qa-checklist.md` и уточнение в `docs/tasks/BACK-021-voice-mediarecorder.md`.

**Проверка кодировки:** `index.html` не менялся, Шаг 0 не требовался.

**Тест:** Документальная проверка связки `pm/bugs.md` → `pm/backlog.md` → `pm/qa-checklist.md` → `docs/tasks/BACK-021-voice-mediarecorder.md`; код не менялся.

**Коммит:** N/A

**Статус:** Triaged — перед кодовым фиксом нужно понять причину отката `e970d33`, проверить Worker `/transcribe` и `OPENAI_KEY`, затем делать отдельную ветку `fix/voice-mediarecorder`.

---
## 2026-06-29 — BUG-2026-06-29-001: Telegram login dead end triage (Codex)

**Что сделано:** По скрину Алексея и точечной проверке `index.html` зафиксирован баг входа через Telegram: при отсутствии `Telegram.WebApp.initData` функция `loginWithTelegram()` показывает toast "Открой бота и нажми Start — получишь ссылку для входа", но UI не открывает бота и не даёт явный следующий шаг. Добавлены `BUG-2026-06-29-001` в `pm/bugs.md`, `BACK-024` в `pm/backlog.md`, строка риска в `shared/ROADMAP.md`, проверки в `pm/qa-checklist.md` и task-файл `docs/tasks/BUG-2026-06-29-001_telegram_login_dead_end.md`.

**Проверка кодировки:** `index.html` не менялся, Шаг 0 не требовался.

**Тест:** Документальная проверка связки `pm/bugs.md` → `pm/backlog.md` → `shared/ROADMAP.md` → `pm/qa-checklist.md` → `docs/tasks/`. Код и bot-репозиторий не менялись.

**Коммит:** этот коммит

**Статус:** Triaged — нужен live smoke `@Denzel89bot` и исправление UX/app + bot handoff.

---
## 2026-06-29 — PM-задачи по детальной карточке задачи (Codex)

**Что сделано:** В `pm/backlog.md` добавлены `BACK-022` — ручной MVP детальной карточки задачи и `BACK-023` — расширение карточки после MVP. В `shared/ROADMAP.md` направление "Качество задач" обновлено: `BACK-019` остаётся задачей про карточки в списке, `BACK-022` добавлен как следующий P1-фокус по экрану `task-detail`. В `pm/next-actions.md` добавлен PM-шаг подготовки `BACK-022`. Созданы `docs/tasks/BACK-022_task_detail_manual_mvp.md` и `docs/tasks/BACK-023_task_detail_future_expansion.md`.

**Проверка кодировки:** `index.html` не менялся, Шаг 0 не требовался.

**Тест:** Документальная проверка связки `pm/backlog.md` → `shared/ROADMAP.md` → `pm/next-actions.md` → `docs/tasks/`; `git diff --check`; `bash scripts/check-portable-paths.sh`.

**Коммит:** N/A — коммит/пуш выполняются отдельно человеком.

**Статус:** локально выполнено.

---
## 2026-06-30 — BACK-019 mobile swipe actions + vibration (Codex)

**Что сделано:** Исправлены мобильные действия карточек задач: кнопки `Завершить`, `Отменить`, `Перенести` теперь обрабатываются делегированно через `touchend` и `click`, без inline `onclick`, чтобы swipe gesture не гасил нажатие. Добавлена тактильная отдача через Vibration API: `10ms` при достижении порога свайпа и `20ms` при нажатии action-кнопки. Мобильная геометрия карточки уточнена: action-слой получил стабильные `width/height`, кнопки фиксированы по 72px, левый сдвиг карточки равен ширине двух кнопок (`144px`).

**Проверка кодировки:** Файлы с кириллицей читались/писались через `[System.IO.File]::ReadAllText/WriteAllText` с UTF-8 без BOM.

**Тест:** `npm run build:css`, `git diff --check`, синтаксическая проверка JS из `index.html` через Node.

**Коммит:** этот коммит.

**Статус:** Ready for QA — проверить на телефоне swipe left/right, кнопки действий и вибрацию.

---
## 2026-06-28 — BACK-019 web swipe actions hidden (Codex)

**Что сделано:** Исправлен web Telegram/browser regression: кнопки `Отменить`, `Перенести`, `Завершить` теперь скрыты по умолчанию через `opacity:0`, `visibility:hidden` и `translateX(...)`. На non-touch устройствах (`@media (pointer:fine)`) swipe-actions полностью отключены через `display:none!important`, чтобы в браузере они не висели статично над карточками.

**Проверка кодировки:** Файлы с кириллицей читались/писались через `[System.IO.File]::ReadAllText/WriteAllText` с UTF-8 без BOM.

**Тест:** `npm run build:css`, `git diff --check`, синтаксическая проверка JS из `index.html` через Node.

**Коммит:** этот коммит.

**Статус:** Ready for QA — проверить web Telegram/browser и touch-свайпы на телефоне.

---
## 2026-06-28 — BACK-019 fix swipe actions visibility (Codex)

**Что сделано:** Исправлен баг, из-за которого кнопки `Завершить`, `Отменить`, `Перенести` отображались статично над каждой карточкой задач. Причина: swipe CSS был завязан на родительский `.tasks-wrap`, которого нет у реального `#home-task-list`; селекторы перенесены на `.task-card-shell`, поэтому action-кнопки снова скрыты под карточкой по умолчанию и видны только при свайпе.

**Проверка кодировки:** Файлы с кириллицей читались/писались через `[System.IO.File]::ReadAllText/WriteAllText` с UTF-8 без BOM.

**Тест:** `npm run build:css`, `git diff --check`, синтаксическая проверка JS из `index.html` через Node.

**Коммит:** этот коммит.

**Статус:** Ready for QA — проверить свайп влево/вправо на телефоне.

---
## 2026-06-28 — BACK-019 улучшенные карточки задач (Codex)

**Что сделано:** В `index.html` добавлен единый `renderTaskCard()` для домашнего списка задач, фильтров и месячного списка. Карточка теперь показывает номер с цветным приоритетом, категорию, дедлайн, двухстрочное название и приглушённую красную подсветку просроченных задач. Добавлены swipe-действия: вправо — `Завершить`, влево — `Отменить` и `Перенести` с date picker и сохранением через `update-task`.

**Проверка кодировки:** Файлы с кириллицей читались/писались через `[System.IO.File]::ReadAllText/WriteAllText` с UTF-8 без BOM; PowerShell `-replace`, `Set-Content`, `Out-File` не использовались.

**Тест:** `npm run build:css`, `git diff --check`, синтаксическая проверка JS из `index.html` через Node.

**Коммит:** этот коммит.

**Статус:** Ready for QA — нужен ручной smoke свайпов и date picker на телефоне.

---
## 2026-06-28 — Ответственный за РКН: Юрий (Codex)

**Что сделано:** По решению Алексея BACK-007 "Уведомление РКН" передан Юрию. Обновлены `shared/ROADMAP.md`, `pm/backlog.md`, `pm/next-actions.md` и список открытых проблем в этом логе: РКН теперь manual task Юрия, а не Алексея.

**Проверка кодировки:** `index.html` не менялся, Шаг 0 не требовался.

**Тест:** Документальная правка; проверка — `git diff --check` и `bash scripts/check-portable-paths.sh`.

**Коммит:** N/A.

**Статус:** локально выполнено, без push/merge.

---

## 2026-06-28 — Смягчение Git-процесса: GitHub Desktop не обязателен для Юры (Codex)

**Что сделано:** По решению Алексея отменена жёсткая формулировка "работать только через GitHub Desktop". `AGENTS.md`, `CLAUDE.md`, `COWORK_INSTRUCTIONS.md`, `shared/ROADMAP.md`, `pm/next-actions.md` и бриф в `pm/agent-inbox/` обновлены: GitHub Desktop оставлен как удобный вариант для Алексея, но не обязательное правило для Юры или опытных участников. `docs/github-desktop-team-rules.md` переименован в `docs/git-team-rules.md`; обязательным остаётся не конкретный инструмент, а согласование рискованных Git-действий: push, merge в `main`, force push, destructive reset/revert и `pull --rebase` при грязном дереве или непонятной ветке.

**Проверка кодировки:** `index.html` не менялся, Шаг 0 не требовался.

**Тест:** Документальная правка; проверка — `git diff --check` и `bash scripts/check-portable-paths.sh`.

**Коммит:** N/A.

**Статус:** локально выполнено, без push/merge.

---

## 2026-06-28 — Командный Git-процесс и план следующих действий (Codex)

**Что сделано:** Обновлены `AGENTS.md`, `CLAUDE.md`, `COWORK_INSTRUCTIONS.md` и `FILE_MAP.md`: старое правило автоматического `pull --rebase` заменено на ручной процесс через GitHub Desktop. Добавлено правило, что исключения из Git-процесса возможны только после явного согласования с Алексеем: какое правило нарушаем, зачем, какой риск и кто подтвердил. Создан `docs/github-desktop-team-rules.md` с понятными правилами для команды и `pm/next-actions.md` с ближайшим PM-планом: Git-процесс, QA, legal/infra blockers, premium positioning, закрытый тест и монетизация.

**Проверка кодировки:** `index.html` не менялся, Шаг 0 не требовался.

**Тест:** Документальная правка; проверка — `git diff --check` и `bash scripts/check-portable-paths.sh`.

**Коммит:** N/A.

**Статус:** локально выполнено, без push/merge. Следующий шаг — Алексей проверяет изменения в GitHub Desktop на ветке `docs/git-branch-protocol` и решает, коммитить ли их.

---

## 2026-06-28 — Пожелание Алексея по Git-процессу в roadmap (Codex)

**Что сделано:** В `shared/ROADMAP.md` добавлен блок "Пожелания / ожидают решения" и пункт по Git-процессу. Зафиксировано, что Алексей поддерживает вариант B: разбирать готовые ветки 1 раз в неделю + срочно для P0/P1. `push`, `merge` и `pull --rebase` не автоматизировать; работа должна идти через GitHub Desktop с явным подтверждением человека.

**Проверка кодировки:** `index.html` не менялся, Шаг 0 не требовался.

**Тест:** Документальная правка; проверка — `git diff --check`.

**Коммит:** N/A.

**Статус:** выполнено как пожелание, а не финальное правило. Следующий шаг — получить мнение Юры / Claude и после решения Алексея оформить правило в командных инструкциях.

---

## 2026-06-28 — Запрос к Claude Юры по правилу merge в main (Codex)

**Что сделано:** Создан координационный бриф `pm/agent-inbox/codex-to-claude-2026-06-28-branch-main-rule.md` с вопросом о правильном ритме разбора веток и merge в `main`. Бриф фиксирует, что речь не об автоматическом merge по расписанию, а о ручном разборе готовых веток через GitHub Desktop.

**Проверка кодировки:** `index.html` не менялся, Шаг 0 не требовался.

**Тест:** Проверен текущий checkout: рабочее дерево было чистым перед правкой, текущая ветка `docs/git-branch-protocol`. Правило не внесено в roadmap / AGENTS.md до ответа Claude Юры и решения Алексея.

**Коммит:** N/A.

**Статус:** выполнено как подготовка к обсуждению. Следующий шаг — Алексей передаёт бриф Юре/Claude и после ответа утверждает финальный вариант правила.

---

## 2026-06-28 — BACK-021: MediaRecorder voice input + Whisper (Codex)

**Что сделано:** В `index.html` голосовой ввод переведён на `MediaRecorder`: приложение запрашивает микрофон через `getUserMedia`, записывает до 10 секунд, отправляет audio blob на Worker `/transcribe` как multipart `audio`, получает текст и передаёт его в `ask-field` / `sendAsk()`. `SpeechRecognition` оставлен fallback, если MediaRecorder недоступен. В `4e-worker` commit `339b301` добавил endpoint `POST /transcribe`: проверка `x-token`, чтение multipart, вызов OpenAI Whisper `whisper-1` через `OPENAI_KEY`, ответ `{ text }`.

**Проверка кодировки:** Шаг 0 до: `index.html CYRILLIC_BEFORE=20210`. После правки: `index.html CYRILLIC_AFTER=20324`; рост ожидаемый из-за новых сообщений MediaRecorder/Whisper flow.

**Тест:** inline JS syntax check для `index.html`; app `git diff --check`; worker `node --check worker.js`; worker `git diff --check`; `wrangler deploy --dry-run --no-bundle --config wrangler.toml`.

**Коммит:** app `feat(voice): add MediaRecorder voice input`; worker `339b301 feat(voice): add Whisper transcription endpoint`

**Статус:** Ready for QA — перед live smoke нужно добавить Worker secret `OPENAI_KEY`, задеплоить Worker/app и проверить голосовой ввод на iPhone Telegram WKWebView и Android.

---

## 2026-06-28 — BACK-020: email verification in profile (Codex)

**Что сделано:** В `index.html` email в расширенном профиле теперь подтверждается через кнопку `Подтвердить`: app запрашивает письмо у Worker, обрабатывает `?verify_email=TOKEN`, вызывает `/auth/verify-email`, обновляет `currentUser.emailVerified` и показывает статус `Подтверждён ✅`. В `4e-worker` commit `e815266` добавил endpoints `/auth/request-email-verification` и `/auth/verify-email`, отправку Resend от `noreply@4-ai.site`, D1 таблицу `app_email_verifications` с KV fallback и проверку конфликта `Этот email уже используется`.

**Проверка кодировки:** Шаг 0 до: `index.html CYRILLIC_BEFORE=19940`. После правки: `index.html CYRILLIC_AFTER=20194`; рост ожидаемый из-за новых русских сообщений email verification flow.

**Тест:** inline JS syntax check для `index.html`; `npm run build:css`; `Portable path check passed`; app `git diff --check`; worker `node --check worker.js`; worker `git diff --check`; `wrangler deploy --dry-run --no-bundle --config wrangler.toml` собрал Worker и attached module `migrations/0004_email_verifications.sql`. Live smoke не выполнялся: нужен merge/deploy worker и применение D1 migration.

**Коммит:** app `feat(auth): add profile email verification`; worker `e815266 feat(auth): add email verification flow`

**Статус:** Ready for QA — после merge/deploy применить D1 migration `0004_email_verifications.sql`, запросить письмо из профиля, открыть ссылку `?verify_email=TOKEN` в залогиненном Telegram-аккаунте и проверить конфликт уже занятого email.

## 2026-06-28 — BACK-017: live notification settings (Codex)

**Что сделано:** В `index.html` экран `notif-settings` очищен от лишних типов (`Файлы и документы`, `Система и безопасность`, `Маркетинг и новости`) и оставляет рабочие каналы Push, Email, Telegram, задачи/напоминания. Добавлены `Утренний брифинг` с time picker default `09:00` и `Просроченные задачи`. Настройки сохраняются в localStorage и синхронизируются через `/notifications/settings`. В `4e-worker` commit `b3aa1d6` добавил D1 таблицу `app_notification_settings`, API GET/PUT, `/briefings/check`, фильтрацию просроченных задач по настройкам и bot scheduler `checkBriefings`.

**Проверка кодировки:** Шаг 0 до: `index.html CYRILLIC_BEFORE=19953`. После правки: `index.html CYRILLIC_AFTER=19940`; снижение ожидаемое, потому что удалены три старых русских пункта уведомлений.

**Тест:** app inline JS syntax check; `npm run build:css`; `git diff --check`; `Portable path check passed`; worker `node --check worker.js`; `node --check src/bot/reminders.js`; `node --check src/bot/index.js`; `wrangler deploy --dry-run --no-bundle --config wrangler.toml`.

**Коммит:** app `feat(notifications): add live notification settings`; worker `b3aa1d6 feat(notifications): add live notification settings`

**Статус:** Ready for QA — перед live smoke нужно применить D1 migration `0003_notification_settings.sql` и задеплоить worker/bot.

---

## 2026-06-28 — BACK-016: extended user profile (Codex)

**Что сделано:** В `index.html` экран профиля расширен карточкой `sub-card`: фото профиля с кнопкой `Изменить фото` и локальным preview/R2 placeholder, редактируемое имя, readonly ID, телефон и email с UI-статусом подтверждения, привязка Telegram, textarea `О себе` до 200 символов со счётчиком и date picker даты рождения. Стили добавлены в `styles/screens/profile.less`; данные формы сохраняются локально до появления backend/R2 profile API.

**Проверка кодировки:** Шаг 0 до: `index.html CYRILLIC_BEFORE=19707`. После правки: `index.html CYRILLIC_AFTER=19953`; рост ожидаемый из-за новых русских подписей профиля.

**Тест:** inline JS syntax check для `index.html`; `npm run build:css`; `git diff --check`; `Portable path check passed`.

**Коммит:** `feat(profile): add extended user profile fields`

**Статус:** Ready for QA — нужен визуальный smoke профиля и последующая backend-задача для R2/profile API.

---

## 2026-06-28 — BACK-010: Telegram Stars subscription flow (Codex)

**Что сделано:** В `index.html` payment flow теперь выбирает Telegram Stars внутри Telegram Mini App: кнопка оплаты показывает сумму в Stars, запрашивает invoice у Worker и открывает `Telegram.WebApp.openInvoice`. В `4e-worker` commit `d57771c` добавил endpoint `/payments/telegram-stars/invoice`, создание `createInvoiceLink` с валютой `XTR`, обработчик `/payments/telegram-stars/complete` и bot-side обработку `pre_checkout_query` / `successful_payment`, чтобы Premium активировался по реальному событию Telegram.

**Проверка кодировки:** Шаг 0 до: `index.html CYRILLIC_BEFORE=19509`. После правки: `index.html CYRILLIC_AFTER=19707`; рост ожидаемый из-за новых русских сообщений Telegram Stars.

**Тест:** `node --check worker.js`; `node --check src/bot/handler.js`; `wrangler deploy --dry-run --no-bundle --config wrangler.toml`; inline JS syntax check для `index.html`; `npm run build:css`; `git diff --check`. Live Telegram Stars smoke не выполнялся локально, потому что нужен запуск внутри Telegram Mini App с активным bot/Worker окружением.

**Коммит:** app `feat(payments): add Telegram Stars payment entrypoint`; worker `d57771c feat(payments): add Telegram Stars subscription flow`

**Статус:** Ready for QA — нужен live smoke в Telegram после merge/deploy.

---

## 2026-06-28 — Фаза 11: относительные даты в карточках задач (Codex)

**Что сделано:** В `index.html` добавлен общий formatter относительных дат для карточек задач. Дедлайны теперь показываются как `сегодня`, `завтра`, `через N дней` или `просрочено на N дней`; обычные даты задач показываются как `сегодня`, `вчера`, `N дней назад` или будущий относительный срок. Форматтер подключён к основному списку задач, месячному фильтру, раскрытию всех задач, home-фильтрам и спискам выполненных задач/обещаний.

**Проверка кодировки:** Шаг 0 до: `index.html CYRILLIC_BEFORE=19355`. После правки: `index.html CYRILLIC_AFTER=19509`; рост ожидаемый из-за новых русских подписей относительных дат.

**Тест:** inline JS syntax check, unit smoke formatter cases через Node, `npm run build:css`, `git diff --check`.

**Коммит:** `feat(tasks): show relative dates in task cards`

**Статус:** выполнено — Фаза 11 закрыта.

---

## 2026-06-28 — BACK-009: VK Pay subscription flow (Codex)

**Что сделано:** В `index.html` payment flow теперь выбирает VK Pay внутри VK Mini App: кнопка оплаты меняет подпись на `Оплатить через VK Pay`, скрывает card badges и вызывает `VKWebAppShowOrderBox`; вне VK сохраняется CloudPayments. В `vk.html` заглушка `Оплата скоро будет доступна` заменена на кнопку `Купить план`, которая открывает `VKWebAppShowOrderBox` и обновляет Premium UI после успешного bridge-ответа.

**Проверка кодировки:** Шаг 0 до: `index.html CYRILLIC_BEFORE=19182`, `vk.html CYRILLIC_BEFORE=3273`. После правки: `index.html CYRILLIC_AFTER=19355`, `vk.html CYRILLIC_AFTER=3364`; рост ожидаемый из-за новых русских сообщений VK Pay.

**Тест:** inline JS syntax check для `index.html`/`vk.html`; `npm run build:css`; `git diff --check`. Live VK Pay smoke не выполнялся локально, потому что нужен запуск внутри VK Mini App/payment окружения.

**Коммит:** `feat(payments): add VK Pay subscription flow`

**Статус:** готово к live QA в VK Mini App.

---
## 2026-06-27 — BACK-014: PostgreSQL prep without production credentials (Codex)

**Что сделано:** В `4e-worker/worker.js` добавлен подготовительный PostgreSQL storage adapter для `app_sessions` и `app_task_lists`. Adapter читает будущие env `POSTGRES_URL`/`POSTGRES_TOKEN`, но production-поведение не меняет: без `POSTGRES_URL` Worker продолжает использовать D1/KV. Добавлен будущий DDL `migrations/postgres_app_state.sql` для ручного применения в Yandex Cloud PostgreSQL во время BACK-008.

**Проверка кодировки:** `index.html` не менялся, Шаг 0 не требовался.

**Тест:** `node --check worker.js`; `wrangler deploy --dry-run --no-bundle --config wrangler.toml`; `git diff --check`; после merge локальный `4e-worker/main` fast-forward до `a97d768`, worker содержит `POSTGRES_URL` и `migrations/postgres_app_state.sql`.

**Коммит:** `37f9dda` (`feat(worker): prepare PostgreSQL storage adapter`), merged as `a97d768`.

**Статус:** выполнено. Фактический перенос ПД остаётся в BACK-008 и ждёт Yandex Cloud credentials от Алексея.

---
## 2026-06-27 — BACK-013: semantic HTML landmarks and aria labels (Codex)

**Что сделано:** В `index.html` добавлены семантические landmark-теги без изменения классов и id: корневой app-контейнер стал `<main id="app">`, нижние навигации `bottom-nav-v2` и `global-nav` стали `<nav>` с `aria-label`, верхняя область главного экрана и шапка voice-экрана стали `<header>`. Для иконочной навигации и кликабельных `div` добавлены `aria-label`, `role="button"` и `tabindex="0"`; для back-кнопок добавлен `aria-label="Назад"`.

**Проверка кодировки:** Шаг 0 до: `CYRILLIC_BEFORE=18793`. После правки: `CYRILLIC_AFTER=19182`; рост ожидаемый, потому что добавлены русские `aria-label`.

**Тест:** `npm run build:css`; проверен баланс semantic-тегов (`main/nav/header` open=close); `git diff --check` без ошибок; вручную проверены критичные закрывающие теги home nav, task detail action bar и global nav.

**Коммит:** `refactor(ui): add semantic HTML landmarks`

**Статус:** выполнено.

---
## 2026-06-27 — Статус от Юры синхронизирован с roadmap/backlog (Codex)

**Что сделано:**
- Зафиксировано, что закрыты BACK-001, BACK-002, BACK-003, BACK-004, BACK-005, BACK-006, BACK-012 и Resend-домен `4-ai.site`.
- `shared/ROADMAP.md` оставлен единым стратегическим файлом; РКН и Yandex Cloud PostgreSQL отмечены как ручные действия Алексея.
| 3 | Подготовка кода под PostgreSQL заранее — можно брать Codex без credentials | средний |
- Конкретные цены убраны из roadmap и вынесены в отдельное решение по монетизации.

**Проверка кодировки:** `index.html` не менялся, Шаг 0 не требовался.

**Тест:** ручная сверка `shared/ROADMAP.md` и `pm/backlog.md` со статусом от Юры; `git diff --check`; `bash scripts/check-portable-paths.sh`.

**Коммит:** N/A — коммит/пуш выполняются отдельно.

**Статус:** выполнено.

---

## 2026-06-27 — Единый roadmap-файл (Codex)

**Что сделано:**
- `pm/roadmap.md` объединён с `shared/ROADMAP.md` и удалён, чтобы в проекте остался один источник дорожной карты.
- В `shared/ROADMAP.md` перенесены рабочие PM-секции Now / Next / Later, стратегические горизонты 2/3, принципы развития, ценовые ориентиры и правило не создавать второй roadmap.
- Обновлены ссылки и навигация в `pm/backlog.md`, `FILE_MAP.md`, `CLAUDE.md`, `COWORK_INSTRUCTIONS.md`, `AGENTS.md`.

**Проверка кодировки:** `index.html` не менялся, Шаг 0 не требовался.

**Тест:** `rg -n "shared/ROADMAP|pm/roadmap|ROADMAP.md|roadmap.md|дорожн|roadmap"` для поиска ссылок; `git diff --check`; `bash scripts/check-portable-paths.sh`.

**Коммит:** N/A — коммит/пуш не выполнялся.

**Статус:** выполнено — единственный актуальный roadmap теперь `shared/ROADMAP.md`.

---

## 2026-06-27 — BACK-012: CSS architecture LESS + BEM + minification (Codex)

**Что сделано:** Inline CSS из `index.html` вынесен в LESS-структуру: `styles/main.less`, `styles/variables.less`, `styles/layout.less`, `styles/screens/home.less`, `styles/screens/profile.less`, `styles/screens/tasks.less`, `styles/screens/voice.less`. В `package.json` добавлены скрипты `build:css` и `watch:css`, dev-зависимости `less` и `clean-css-cli`. `index.html` теперь подключает `styles.min.css` вместо inline `<style>`.

**Проверка кодировки:** `index.html` изменён через `[System.IO.File]::ReadAllText/WriteAllText` с UTF-8 без BOM; кириллица не редактировалась вручную через `Set-Content`/`Out-File`.

**Тест:** `npm install --save-dev less clean-css-cli`; `npm run build:css`; `rg -n "<style|</style>|styles\.min\.css|styles\.css" index.html` подтвердил отсутствие inline CSS и подключение `styles.min.css`. CSS до/после сравнен через сборку и минификацию: отличия только форматные для custom properties (`rgba(...)` с пробелами), визуальные значения сохранены.

**Коммит:** `refactor(css): migrate to LESS + BEM architecture`

**Статус:** выполнено.

---
## 2026-06-27 — BACK-008: Yandex Cloud PostgreSQL migration blocked (Codex)

**Что сделано:** Сессия остановлена до кодовых изменений. BACK-006 KV→D1 подтверждён как Done; BACK-008 не может быть начат, потому что Yandex Cloud PostgreSQL cluster ещё не создан, credentials и connection settings отсутствуют.

**Проверка кодировки:** `index.html` не менялся, Шаг 0 не требовался.

**Тест:** Код не менялся. Проверены `pm/backlog.md`, `shared/ROADMAP.md`, `shared/WORK_LOG.md`, `DEVELOPMENT_LOG.md`; статус BACK-008 переведён в Blocked.

**Коммит:** `docs(process): close BACK-006, mark BACK-008 blocked`

**Статус:** заблокировано — ждёт ручной шаг Юрия: создать Yandex Cloud PostgreSQL cluster и передать credentials/connection settings.

---

## 2026-06-27 — BACK-006: D1 storage for sessions and tasks (Codex)

**Что сделано:** В `4e-worker/worker.js` добавлен D1 storage-layer для `session:*` и `tasks:*`: новые sessions сохраняются в `app_sessions`, task lists — в `app_task_lists`. Старые KV-значения для `session:*` и `tasks:*` остаются read fallback-ом и при первом чтении переносятся в D1. Worker переведён с legacy `addEventListener("fetch")` на ES module `export default { fetch(request, env) }`, потому что Cloudflare D1 binding требует module Worker. В `wrangler.toml` добавлен binding `DB` на `4e-production` (`6107948c-6c67-4c37-baa1-efea6c5c2860`). Добавлены D1 migrations: `0001_sessions_tasks.sql` как no-op note для уже занятой production schema `sessions/tasks`, и `0002_app_kv_state.sql` для `app_sessions`/`app_task_lists`.

**Проверка кодировки:** `index.html` не менялся, Шаг 0 не требовался.

**Тест:** `node --check worker.js`; `git diff --check`; `wrangler d1 migrations apply 4e-production --local --config wrangler.toml`; `wrangler d1 migrations apply 4e-production --remote --config wrangler.toml`; `PRAGMA table_info(app_sessions)` и `PRAGMA table_info(app_task_lists)` подтвердили remote schema; `wrangler deploy --dry-run --config wrangler.toml`; `wrangler deploy --config wrangler.toml` → production version `0b66977a-0b23-4cdf-bd92-c5ec38e2ee1c`. Live smoke: временный email-аккаунт зарегистрирован, `/auth/me` по token прошёл, `x-action: save-task` сохранил задачу, `/tasks` вернул её; D1 показал `session_rows=1` и `task_rows=1`; KV get для новых `session:<token>` и `tasks:<chatId>` вернул 404; временные D1/KV записи удалены, cleanup count вернул `session_rows=0`, `task_rows=0`.

**Коммит:** `0a035c9` (`feat(worker): store sessions and tasks in D1`) в `4e-worker`.

**Статус:** выполнено — BACK-006 закрыт.

---

## 2026-06-27 — BACK-005: unified user identities (Codex)

**Что сделано:** В `4e-worker/worker.js` создана единая server-side модель идентичностей для Email + Telegram + VK. `link-telegram` теперь умеет брать Telegram ID из `initData` и сохраняет `telegramId` в canonical user. Добавлен `/auth/link-vk`, который привязывает VK ID к текущей email-сессии через `vk:<id>` и `vk_rev:<userId>`. `/auth/vk` теперь парсит `vk_user_id` из `launchParams`, использует общий `saveUser/getUser`, создаёт canonical `vk_<id>@vk.local` user только если VK ещё не привязан, и возвращает session с `email`. `publicUser()` возвращает `telegramId`, `telegramUsername`, `vkId`.

**Проверка кодировки:** `index.html` не менялся, Шаг 0 не требовался.

**Тест:** `node --check worker.js`; `git diff --check`; `wrangler deploy --dry-run --config wrangler.toml`; `wrangler deploy --config wrangler.toml` → production version `ff365be0-59d3-4307-9c15-54ab037e2917`; локальный `wrangler dev --config wrangler.toml --ip 127.0.0.1 --port 8787`; smoke создал email-аккаунт, привязал Telegram через `initData`, привязал VK через `launchParams`, затем `/auth/vk` вернул тот же `user.id` и email; `/auth/me` по VK token также вернул тот же `user.id`. На shutdown `wrangler dev` показал временную bundle cleanup/build ошибку, но HTTP-smoke до shutdown прошёл успешно. После merge в `main` production live smoke подтвердил, что email-регистрация, Telegram link, VK link, `/auth/vk` и `/auth/me` возвращают один canonical `user.id`; временные KV-ключи `user:*`, `user_id:*`, `session:*`, `tg:*`, `tg_rev:*`, `vk:*`, `vk_rev:*`, `notifs:*` удалены.

**Коммит:** `1a593fb` (`fix(auth): unify VK Telegram and email identities`) в `4e-worker`.

**Статус:** выполнено — BACK-005 закрыт.

---

## 2026-06-27 — BACK-004: payment webhook live smoke (Codex)

**Что сделано:** Код не менялся. Production Worker `/payment/webhook` проверен end-to-end на временном тестовом пользователе `codex-payment-smoke-1782568866@example.com` и invoice `codex-smoke-1782568866`.

**Проверка кодировки:** `index.html` не менялся, Шаг 0 не требовался.

**Тест:** Через production Worker создан временный аккаунт, до webhook `plan=trial`; отправлен form-urlencoded webhook `Status=Completed`, `AccountId=<test-user-id>`, `Amount=990`, `InvoiceId=codex-smoke-1782568866`, `Description=Smoke 1 month`; webhook вернул `code:0`; после `/auth/me` показал `plan=paid`, `trialEndsAt` увеличился примерно на 30 дней (`trialLeft=60`). После проверки удалены точные KV-ключи `user:codex-payment-smoke-1782568866@example.com`, `user_id:d1ce9837-42b0-4460-a17e-ef16856234b4`, `tx:codex-smoke-1782568866`, `notifs:d1ce9837-42b0-4460-a17e-ef16856234b4`.

**Коммит:** N/A — код не менялся.

**Статус:** выполнено — BACK-004 закрыт.

---

## 2026-06-27 — BACK-002: password reset backend endpoints (Codex)

**Что сделано:** В `4e-worker/worker.js` на ветке `fix/password-reset-endpoints` добавлены новые совместимые endpoint aliases `/auth/reset-request` и `/auth/reset-confirm` поверх существующих `/auth/forgot-password` и `/auth/reset-password`. `handleResetPassword()` теперь принимает `newPassword` из контракта Фазы 12 и старое поле `password` для обратной совместимости. Ссылка в письме исправлена на `https://mrktggod.github.io/4e-app/?reset=TOKEN`.

**Проверка кодировки:** `index.html` не менялся, Шаг 0 не требовался.

**Тест:** `node --check worker.js`; `git diff --check`; `wrangler deploy --dry-run --config wrangler.toml`; локальный `wrangler dev --config wrangler.toml --ip 127.0.0.1 --port 8787`; `POST /auth/reset-request` с несуществующим email вернул `200 {"ok":true}`; `POST /auth/reset-confirm` с невалидным token и `newPassword` вернул контролируемый `400 Bad Request`.

**Коммит:** `a0965de` (`feat(auth): add password reset endpoints`) в `4e-worker`.

**Статус:** выполнено — PR смёржен в `a173ebf`, production deploy выполнен (`729a046c-5849-4a26-9ced-8ee5bc4b1e44`), live API smoke прошёл: `/auth/reset-request` вернул `200 {"ok":true}`, `/auth/reset-confirm` с invalid token вернул контролируемый `400`. Финальный ручной smoke подтверждён 2026-06-27: письмо пришло, кнопка сброса открыла форму, пароль сохранён. Пользователь ввёл тот же пароль, но reset token и backend confirm-flow отработали.

---

## 2026-06-26 — BACK-001: Resend email secret для Worker (Codex)

**Что сделано:** В отдельном worker-репозитории `4e-worker` создана ветка `fix/resend-email-secret` и коммит `086f19b`. Из `worker.js` удалён hardcoded `RESEND_KEY`; `sendEmail()` теперь читает runtime secret `RESEND_KEY`, не падает Worker 1101 при отсутствующем secret, логирует конфигурационную ошибку/ошибку Resend и возвращает `false`. `/auth/forgot-password` теперь не сообщает пользователю ложный успех для существующего аккаунта, если письмо не отправилось, а возвращает контролируемый `502`.

**Проверка кодировки:** `index.html` не менялся, Шаг 0 не требовался.

**Тест:** `node --check worker.js`; `rg -n "re_[A-Za-z0-9_]+" worker.js` не нашёл hardcoded Resend key; `git diff --check` прошёл; `wrangler deploy --dry-run --config wrangler.toml` собрал Worker (`Total Upload: 55.77 KiB / gzip: 10.35 KiB`) и показал binding `env.KV`. Проверка `wrangler secret list` и production deploy заблокированы окружением: Wrangler требует `CLOUDFLARE_API_TOKEN` в non-interactive session. 2026-06-27: `git push -u origin fix/resend-email-secret` completed; PR creation is blocked because local `gh` is not logged in and GitHub connector returned API 404 for `mrktggod/4e-bot`; `wrangler whoami` later succeeded after OAuth login, `wrangler secret list --config wrangler.toml` confirmed `RESEND_KEY`, and production deploy succeeded: Worker `restless-lab-d737`, version `abe182e4-05b5-4c28-9934-9f972e662098`, URL `https://restless-lab-d737.shelckograff.workers.dev`. Safe smoke: `POST /auth/forgot-password` with a non-existing email returned `200 {"ok":true}`. 2026-06-27: live email smoke passed by user confirmation; reset email arrived and Resend marked it delivered. BACK-001 is Done; following the email link and changing the password are BACK-002 scope.

**Коммит:** `086f19b` (`fix(worker): use Resend secret for email delivery`) в `4e-worker`; branch `origin/fix/resend-email-secret` pushed.

---

## 2026-06-26 — PM-roadmap приведён к реальной стратегии продукта (Codex)

**Что сделано:**
- `pm/roadmap.md` явно назначен оперативной версией стратегии из `shared/ROADMAP.md`.
- Убрана неоднозначность с generic-roadmap: добавлено правило не подменять продукт 4 AI-секретарь инструментом управления проектом.
- `pm/backlog.md` помечен как backlog из реальной продуктовой стратегии и связан с Linear `ALE-5` для первичного баг-баша.
- Уточнён статус Фазы 9: Done / QA, потому что реализация есть, но live-сценарий микрофона нужно проверить.

**Проверка кодировки:** `index.html` не изменялся.

**Тест:** ручная сверка `pm/roadmap.md` и `pm/backlog.md` с `shared/ROADMAP.md`, `DEVELOPMENT_LOG.md`, `shared/WORK_LOG.md`.

**Коммит:** N/A — изменения подготовлены локально, коммит/пуш не выполнялся.

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
- ✅ Фаза 11 (relative dates) — закрыта 2026-06-28, см. запись выше
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
| 4 | ANTHROPIC_KEY в worker.js должен быть только PLACEHOLDER — не коммитить реальный ключ | высокий |
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

## 2026-07-01 — BACK-022 Task detail manual MVP (Codex)

**Проблема:** экран `task-detail` оставался на старом prompt-редактировании и не сохранял ручные поля статуса, приоритета, времени, чек-листа и направления.

**Решение:** в `index.html` добавлены ручные controls для статуса, приоритета, времени, быстрых дедлайнов, направления, напоминания и чек-листа; `saveTaskEdits()` отправляет `status`, `priority`, `time`, `checklist`, `directionLabel` и совместимый `deadline`; `styles/screens/tasks.less` и CSS-сборка обновлены.

**Проверка:** `npm.cmd run build:css`, inline JS `node --check`, `git diff --check`, контроль кириллицы `Войти|Задачи`, raw GitHub содержит новый `index.html`; Pages на момент проверки ещё отдавал старый cache/build (`Last-Modified: Tue, 30 Jun 2026 22:10:38 GMT`).

**Production:** frontend commit `b4fa48f`; Worker production deploy `0deb8806-0de6-4471-9350-af38a75595ef`; live Worker `GET /` вернул `200 OK`, CORS preflight для `https://mrktggod.github.io` вернул `204`.

---

## ПАТТЕРНЫ ОШИБОК (для обучения)

1. **Кодировка** — самая частая. Любой PowerShell-агент без явного UTF-8 ломает кириллицу.
2. **KV + chatId** — путаница между `telegramId` и `chatId` при ключах в KV. Правило: передавать chatId явно.
3. **Revert циклы** — 2 раза за один день делали fix → revert → fix. Причина: не тестировали перед коммитом.
4. **VK iframe ограничения** — Google Fonts, внешние ресурсы, Telegram SDK недоступны в VK.
