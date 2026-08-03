> 🔴 КАНОН ПРИЛОЖЕНИЯ — папка `X:\Projects\4-ai-secretary\app`.
> Старый checkout `X:\4\.tmp-4e-app-publish` не трогать: не читать, не менять, не удалять.
> Канон воркера остаётся отдельным репозиторием и не переносится в этом checkout.
> Копии `4e-app`, `4e-bot-repo`, `src\bot`, `.tmp-4e-app-p0`,
> `.tmp-docs-monetization-i18n` каноном не являются — в них не работать.
> Файлы проекта на диске C: не хранятся (см. AGENTS.md, раздел «Диск»).
# Инструкции для Codex — проект 4 AI-секретарь

## НАВИГАЦИЯ ПО ФАЙЛАМ — читай это ПЕРВЫМ

Файлы проекта большие (index.html = 5812 строк). Никогда не читай файл целиком.

**Алгоритм работы с кодом:**
1. Прочитай `FILE_MAP.md` (главный индекс, ~3KB)
2. Если нужны детали конкретного файла — читай соответствующий `FILE_MAP_*.md`
3. Найди нужную секцию (диапазон строк)
4. Читай только эту секцию через `offset` + `limit`

| Файл карты | Для чего |
|-----------|---------|
| `FILE_MAP.md` | Быстрый поиск, список всех файлов, KV-схема |
| `FILE_MAP_UI.md` | index.html (5812 строк) — CSS/HTML/JS по секциям |
| `FILE_MAP_WORKER.md` | статус worker-репозитория, известные API эндпоинты |
| `FILE_MAP_BOT.md` | статус bot-репозитория `mrktggod/4e-bot` |

**После изменений — обновляй FILE_MAP:** если добавил функцию, экран или эндпоинт —
обнови номера строк в соответствующем FILE_MAP_*.md (правила обновления в FILE_MAP.md).

---

## Обязательно читать перед работой

1. `DEVELOPMENT_LOG.md` — детальная история, критические правила, известные проблемы
2. `https://github.com/mrktggod/4pm` — приватная бизнес-документация: roadmap, backlog, bugs, strategy, team sync
3. `pm/inbox/` и `pm/outbox/` — операционный обмен брифами и отчётами
4. `docs/tasks/` — атомарные задачи от команды и архив
5. `docs/tasks/done/` — что уже сделано, если папка существует

---

## ПРАВИЛО СЕССИИ — одна задача за запуск

**Каждый запуск Codex = одна конкретная задача.**

Перед стартом определи: что именно ты делаешь в этой сессии?
Запиши одной строкой. Если задача не умещается в одну строку — раздели на две сессии.

Когда задача выполнена и задеплоена → стоп. Не берись за следующую.

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

### ШАГ 0 — Проверка кодировки (выполнять ДО и ПОСЛЕ любой правки index.html)

Это не рекомендация — это обязательный ритуал. Выполни и покажи результат.

```powershell
# ПРОВЕРИТЬ что файл читается правильно (до правки):
$before = Select-String -Path "4e-app\index.html" -Pattern 'Войти|Задачи|Сегодня'
Write-Host "До правки: $($before.Count) совпадений"

# ЧИТАТЬ файл (единственный допустимый способ):
$content = [System.IO.File]::ReadAllText("4e-app\index.html", [System.Text.Encoding]::UTF8)

# ... вносишь изменения в $content ...

# ПИСАТЬ файл (единственный допустимый способ):
[System.IO.File]::WriteAllText("4e-app\index.html", $content, (New-Object System.Text.UTF8Encoding $false))

# ПРОВЕРИТЬ что кириллица цела (после правки):
$after = Select-String -Path "4e-app\index.html" -Pattern 'Войти|Задачи|Сегодня'
Write-Host "После правки: $($after.Count) совпадений"

# Если after.Count < before.Count — СТОП. git restore "4e-app\index.html". Не коммитить!
```

**НИКОГДА не использовать:** `Set-Content`, `Out-File`, `-replace`, `>>` для файлов с кириллицей.

### Git — согласуемый процесс команды

`main` связан с GitHub Pages, поэтому push/merge может сразу повлиять на live.

**Разрешено:** читать git status/log/diff, делать локальные правки и локальные commit, если Алексей явно попросил.

**Нельзя делать молча:**
- `git pull --rebase`, если есть незакоммиченные изменения или непонятная ветка;
- `git push`;
- merge в `main`;
- force push;
- reset/revert, которые могут потерять чужие изменения.

Перед опасным Git-действием Codex должен коротко написать:
1. Что предлагается сделать.
2. В какой ветке.
3. Что может пойти не так.
4. Что нужно подтвердить человеку.

GitHub Desktop — удобный вариант для Алексея и слабых пользователей Git, но не обязательное правило для Юрия или опытных участников.
Юрий обычно управляет Git через Claude: агент должен сначала проверить ветку и `git status`, затем выполнять fetch/pull/commit/push только если нет риска потерять чужие или незакоммиченные изменения.

### Ветки — стратегия

| Тип изменения | Ветка |
|---|---|
| Багфикс, кодовые правки | `fix/короткое-описание` |
| Новая фича, экран | `feat/короткое-описание` |
| Документация, процесс | `docs/короткое-описание` |
| Hotfix P0, прямо в прод | `main` — только если быстро и понятно, с записью в лог |

После работы: merge ветки в `main` через Pull Request или после проверки командой.

### Team Sync — короткие статусы между Алексеем и Юрой

Если Алексей спрашивает `Что там у Юры?` или `Дай статус проекта`, используй приватный репозиторий `https://github.com/mrktggod/4pm` для team sync, backlog, bugs, roadmap и work log, затем проверь актуальное Git-состояние app.

Завершённая задача должна быть синхронизирована с GitHub: проверка, commit, push в рабочую ветку, обновление team sync в приватном `https://github.com/mrktggod/4pm`, затем короткий отчёт с веткой, commit/PR и следующим шагом.

Merge в `main` не является частью автоматического завершения задачи и требует отдельного подтверждения Алексея или Юрия.

### Как писать отчёты для Юрия

Любой статус, отчёт или brief для Юрия должен быть написан простым языком, без разработческого жаргона. Это правило для всех агентов: Codex, Claude/Cowork и любых помощников команды.

Не используй слова вроде `коммит`, `смоук-тест`, `деплой`, `ветка`, `workflow`, `CI`, если без них можно обойтись. Если технический термин всё-таки нужен, коротко объясни его прямо на месте: например, `ветка разработки — отдельная копия изменений, ещё не включённая в основную версию`.

Обязательная структура отчёта для Юрия:

1. Что сделано по-простому.
2. Нужно ли Юрию что-то сделать руками и что именно.
3. Где и как проверить результат.

Примеры правильного тона:

- "Выполнил задачу по багу 23 — там была нерабочая кнопка. Надо проверить руками в Telegram-приложении."
- "У нас проблема с ветками разработки — часть из них смешалась и надо разобраться. Прочитай по этой ссылке [ссылка] и реши, надо ли их соединять."

### Решения и approval-gate

Новые правила продукта, изменения стратегии, монетизации, юридических обещаний, Git-процесса и значимые P0/P1 решения не уходят в разработку импульсно.

Перед внедрением нужно:
1. Коротко описать вопрос и контекст.
2. Дать 2-3 варианта с плюсами и минусами.
3. Попросить мнение Юрия / Claude, если решение влияет на продукт, стратегию или процесс команды.
4. Сформулировать взвешенную рекомендацию.
5. Получить явное решение Алексея.
6. Только после этого закреплять правило в приватном `https://github.com/mrktggod/4pm` или инструкциях.

Исключение: срочный P0/P1 инцидент можно решать быстрее, но всё равно с явным подтверждением человека и записью в лог после факта.

### Остальные правила Git
- Перед коммитом запустить `npm run check:portable-paths`; локально это также делает `.githooks/pre-commit`
- После `git reset --hard` нужен `git push --force`
- Конфликты при `git revert` → `git revert --abort` + `git reset --hard <hash>`
- Перед правкой `index.html` — резервная копия: `Copy-Item "index.html" "index.backup_$(Get-Date -f yyyyMMdd_HHmm).html"`
- Заголовки коммитов писать по правилам из приватного `https://github.com/mrktggod/4pm/blob/feat/admin-tariff-api/shared/COMMIT_CONVENTION.md`: `type(scope): что изменилось`
- Не использовать заголовки вроде `fix`, `update`, `правки`, `final`

### PowerShell
- `;` вместо `&&`
- Скачивать файлы: `$bytes = (Invoke-WebRequest -Uri $url).RawContentStream.ToArray()`

---

## Архитектура

| Файл | Назначение |
|------|-----------|
| `index.html` | Telegram Mini App (редизайн санкционирован 2026-06-20) |
| `vk.html` | VK Mini App — устаревший, будет заменён 08_vk_adapter.js |
| `privacy.html` | Политика конфиденциальности — готова к деплою через git push |
| `https://github.com/mrktggod/4pm` | Приватные общие логи, история, roadmap, backlog, bugs, QA, release checklist |
| `pm/inbox`, `pm/outbox` | Операционный обмен брифами и отчётами |
| `4e-worker/worker.js` | Cloudflare Worker — отдельный репозиторий, локально не подключён |
| `4e-bot` | Telegram бот — отдельный репозиторий `mrktggod/4e-bot`, локально не подключён |

### Ключевые эндпоинты Worker
- `/anthropic` — прокси к Claude, требует `x-token` (обязательно!)
- `/tasks` — задачи по токену без chatId
- `/auth/vk` — VK авто-логин

---

## После выполнения задачи

Обязательно добавь записи в **оба** файла:

### 1. `4pm/shared/WORK_LOG.md` — краткая запись для команды

```markdown
### YYYY-MM-DD — Codex

**Задача:** одна строка что делал
**Результат:** что получилось
**Коммит:** `хэш`
**Статус:** ✅ выполнено / ⚠️ частично / ❌ отложено
**Следующий шаг:** (если есть)
```

### 2. `DEVELOPMENT_LOG.md` — детальная техническая запись

```markdown
## ДАТА

### Название изменения

**Что сделано:** конкретно что изменилось

**Проверка кодировки:** совпадений до / после (число из Шага 0)

**Тест:** как проверил что работает

**Коммит:** хэш или сообщение
```

Также добавь краткую запись в приватный `4pm/shared/WORK_LOG.md`:

```markdown
### YYYY-MM-DD — Codex

**Задача:** что делал
**Результат:** что получилось
**Коммит:** `hash` или N/A
**Статус:** ✅ выполнено / ⚠️ частично / ❌ отложено
**Следующий шаг:** (если есть)
```

Если задача связана с багами, QA или планированием — обнови соответствующий файл в приватном `https://github.com/mrktggod/4pm`.

---

## Приоритеты (открытые задачи)

Этот блок не является самостоятельным списком задач. Закрытые техдолги и старые redesign-патчи не использовать как источник работы.

Актуальные источники приоритетов:
- `pm/inbox/` — входящие BRIEF-*.md по протоколу inbox, сначала `status: NEW` по имени файла;
- `https://github.com/mrktggod/4pm` — текущий Now/Next backlog, roadmap и продуктовые ограничения.

Redesign soft-glass cutover идёт только через актуальные согласованные ветки/брифы и NEED-YURI stop point, не через старые `redesign/patches`.
---

## Autonomous Pipeline Guardrails

These stop points are permanent unless Yuri explicitly overrides them in the current brief:

- No production deploy.
- No merge into `main`.
- No CAL tasks.
- No price changes.
- No payment or entitlement refactors.
- No secret rotation, secret removal, or secret disclosure.

Secrets must never be written to code, chat, logs, or reports. Use environment variables only. In reports, use `<redacted>`.

## Диск: проект живёт только на X:

- Канон app — `X:\Projects\4-ai-secretary\app`. Любые файлы app (код, операционные `pm/inbox`, `pm/outbox`, `docs/tasks`, скрипты, бэкапы, worktree, временные деревья) создаются и читаются только внутри `X:\Projects\4-ai-secretary\app`.
- Диск C: для файлов проекта не используется. Папка `Documents\4` на диске C ликвидирована 2026-07-25 и не воссоздаётся ни при каких условиях.
- В коде, конфигах и скриптах запрещены абсолютные пути, начинающиеся с `C:\`. Инструменты (wrangler, node, npm) вызывать через PATH, не по абсолютному пути.
- Исключение: собственные данные приложений (Claude, Codex, npm) на C: — это не файлы проекта, правило их не касается.
- Нарушение = СТОП. Сессия не продолжает работу: фиксирует расхождение в REPORT и ставит NEED-YURI.
Always run `node scripts/check-cp1251-mojibake.mjs` before each app commit and require exit code 0. Do not weaken `.gitattributes`, do not add BOM, use fresh test accounts, avoid Yuri's personal data, keep changes narrow, and include raw evidence in reports. For security fixes, perform a live exploit re-test; code reading alone is not enough.

## Бизнес-документация

Бизнес-документация (roadmap/backlog/bugs/strategy) переехала в приватный репозиторий https://github.com/mrktggod/4pm, 2026-07-26. В этом репозитории остаются только pm/inbox, pm/outbox (обмен брифами) и docs/tasks (архив).

PM file protocol:

- Cowork writes briefs to `pm/inbox/BRIEF-YYYY-MM-DD-slug.md`.
- The first line is `status: NEW`.
- The executor changes status to `IN_PROGRESS`, then `DONE` or `BLOCKED-<reason>`.
- The executor writes `pm/outbox/REPORT-<brief-name>.md`.
- Reports include root cause as `file:line`, changed files, app/worker commit SHA when applicable, raw staging proof, and honest tails marked `NEEDS-REAL`.

If a brief conflicts with `AGENTS.md`, set the brief to `BLOCKED`, explain the conflict in the report, and ask for a decision.

## Ночные сессии: обязательные уроки

До выбора любой ночной задачи сессия читает `LESSONS.md` в корне app-репозитория.
Это обязательный первый входной материал перед inbox, backlog, roadmap, тестами и
выбором работы; уроки не заменяются памятью агента или старым отчётом. В каждом
ночном `pm/outbox/REPORT-*.md` должна быть отдельная строка в точном формате
`lessons_read: <число строк>`, включая `lessons_read: 0`, если файл пуст.

## Autonomous Night Backlog - Selection Rules

At the 23:00 autonomous run, use this order of work:

1. First process `pm/inbox/BRIEF-*.md` files whose first line is `status: NEW`, oldest filename first. Do not treat `BRIEF-TEMPLATE.md` or `README.md` as tasks.
2. Before any private backlog or roadmap whitelist fixes, run the mandatory nightly QA suite for Web, Telegram, VK, and load-safe checks that are available locally. Record the raw commands and results in a QA report.
3. If the nightly QA suite is red, triage each confirmed failure into an atomic `pm/inbox/BRIEF-*.md`, then fix those briefs one at a time. A separate review agent must inspect the fix agent's report/evidence before the runner treats the QA failure as closed.
4. After QA-failure briefs are fixed, re-run the failed QA commands plus `node scripts/check-cp1251-mojibake.mjs`. Only after green QA may the runner proceed to ordinary private backlog or roadmap whitelist work.
5. When the inbox has no `NEW` briefs and QA is green, choose tasks from the private `https://github.com/mrktggod/4pm` backlog and roadmap only when they are explicitly inside the whitelist below.
6. One task equals one commit on `feat/admin-tariff-api` plus one matching `pm/outbox/REPORT-*.md`.
7. Continue while there are eligible tasks and local limits allow it, then finish with a final report.

Use exactly these task outcomes:

- `DONE`: completed autonomously with proof; only for whitelist tasks.
- `NEED-CLAUDE`: gray-zone task. Do not touch code. Write a report with the task, location (`file:line` or area), why it is gray, proposed next step, and risks. Cowork can turn it into a tighter safe brief.
- `NEED-YURI`: requires Yuri specifically. Do not do it at night or in the morning automation. Report what decision or manual action Yuri must provide.

Whitelist for autonomous `DONE` work:

- P1/P2 bugs with clear reproduction, outside payment, entitlement, and auth-security areas.
- Frontend/UI fixes in HTML/LESS/BEM, excluding redesign architecture work and new inline styles.
- Tech debt, narrow refactors, tests, documentation, FILE_MAP/WORK_LOG/bugs updates.
- Evidence upgrades for SOURCE-ONLY items using safe staging tests, without real money or live Telegram actions.
- Current-horizon roadmap tasks.

Gray zone for `NEED-CLAUDE`:

- Sensitive code where exact scope is critical, including auth/security-adjacent work such as bot-signature siblings by analogy with BACK-060, or diagnostics near payments without changing payment logic.
- Medium refactors touching several modules.
- Tasks with a known root cause but a risky or non-obvious fix that needs plan review.

Yuri-only `NEED-YURI` work:

- Real payments with live money, including VK Pay and Telegram Stars; live Telegram/TMA/device QA; VK ID or Yandex ID on live accounts.
- Product decisions: prices, scope, priorities.
- Production deploy, merge into `main`, secret rotation, removal, or disclosure.
- Payment or entitlement refactors that change payment or access logic.
- CAL tasks, major architecture work such as ARCH-001, integration of a new redesign, or next-horizon roadmap work before P0/P1 closure.

When in doubt, do not guess. If a task is not clearly whitelisted, classify it at least as `NEED-CLAUDE`; if it involves money, access, product decisions, production, `main`, secrets, or CAL, classify it as `NEED-YURI`.

## Release handoff

`DONE` в brief не означает, что пользователь уже получил правку. После каждой
ночной задачи с кодом исполнитель обновляет `pm/release-queue.md` и указывает
`release_state: PR_READY`, точный PR/SHA, целевую ветку, нужные проверки и
неавтоматизируемый ручной хвост. Он не делает merge или deploy.

Утренний приёмщик обязан сверить `PR_READY` с GitHub и добавить каждый готовый
кандидат в раздел «Кандидаты на merge» файла
`pm/outbox/MANUAL-ACTIONS-YYYY-MM-DD-morning.md`: ссылка на PR, одна строка о
правке, проверки, целевая ветка и ожидаемый результат после deployment. После
явно зафиксированного человеком merge он проверяет попадание SHA в `main`,
deployment нужной поверхности и ручный verdict, затем обновляет `release_state`
на `DEPLOYED` или `MANUAL_ACCEPTED`. Заблокированные строки не удаляются.

## Ночная непрерывность и процессный ремонт

Ночная цепочка состоит из исполнителя, независимого проверяющего и утреннего
финализатора. Исполнитель оставляет краткий handoff: brief, PR/SHA, проверки,
`release_state`, что осталось сделать и кому. Проверяющий не переписывает код
исполнителя в его ветке: он либо принимает доказательства, либо создаёт точный
follow-up/handoff для отдельной ветки.

Утренний финализатор проверяет, что ни одна начатая задача не исчезла между
отчётом, PR и `pm/release-queue.md`. При доказанном сбое он может исправлять
только процессные документы, очередь и тексты автоматизаций, чтобы следующая
ночь не повторила сбой. Он не меняет runtime-код, не делает merge/deploy и не
подменяет ручную проверку человека.
