# CODEX-001 — Закрыть Gate 0: git remote + KV snapshot + HMAC production

**Приоритет:** блокирующий
**Статус:** в работе — security части выполнены, git remote/структура repo остаётся отдельно
**Предусловие:** ничего, можно начинать

---

## Задача 0 из 4 — Разобраться с git remote в Documents/4

**Проблема:** `Documents/4` — рабочая копия Codex, но у неё нет git remote. Важно: root `Documents/4` сейчас содержит не только frontend, но и `4e-worker/`, `4e-bot-repo/`, `docs/`, `scripts/`, локальные служебные файлы и backup-папку. Поэтому нельзя механически добавить `origin` на весь root и пушить его в `mrktggod/4e-app`, пока не выбран формат репозитория.

**Фактический статус на 2026-06-19:** root `Documents/4` — git repo без коммитов и без remote; `4e-bot-repo/` уже отдельный clone для `mrktggod/4e-bot` и его не нужно смешивать с app.

**Дополнение 2026-06-19:** безопасный frontend publish path временно выполнен через отдельный shallow clone `mrktggod/4e-app` в temp-папке. В `mrktggod/4e-app` запушен commit `5cdfbb945d68209980fba094fb5e5af8f7cd3577` с auth payload fixes. Root `Documents/4` по-прежнему не превращён в frontend repo — это осознанно, чтобы не смешать frontend, worker, bot, docs и backups.

**Что сделать:**

1. Убедиться что локальные файлы в `Documents/4/4e-app/` совпадают с `mrktggod/4e-app` main (или новее)
2. Выбрать один из безопасных вариантов:
   - сделать `4e-app/` отдельным git repo для frontend;
   - или превратить `Documents/4` в осознанный monorepo и не пушить его напрямую в `4e-app`.
3. Только после выбора добавить remote для frontend/app:
   ```
   cd C:\Users\shelc\Documents\4
   git remote add origin https://github.com/mrktggod/4e-app.git
   git fetch origin
   ```
4. Сверить расхождения: `git diff origin/main -- 4e-app/`
5. Если Documents/4 новее — запушить только frontend-изменения, без worker/bot/backups/secrets.
6. Проверить что GitHub Pages обновился (https://mrktggod.github.io/4e-app)

**Для бота** (`mrktggod/4e-bot`) деплой идёт через `4e-bot-repo/` — там уже есть remote, не трогать.

**Ожидаемый результат:** есть понятный и безопасный путь деплоя frontend без попадания worker/bot/backups/secrets в чужой repo.

**После:** Desktop-папку `C:\Users\shelc\Desktop\4\Версия` можно архивировать или удалить.

---

## Задача 1 из 4 — KV snapshot

Запустить `scripts/snapshot-production-kv.ps1` и убедиться что backup прошёл успешно.

**Фактический статус на 2026-06-19:** выполнено.

- Валидный snapshot: `backups/kv-4e-tasks-20260619-001346.json.dpapi`.
- Metadata: `backups/kv-4e-tasks-20260619-001346.metadata.json`.
- Вывод скрипта: `KeyCount=129`, `Encryption=DPAPI CurrentUser`, `Verification=passed`.
- Sanitized analysis report: `backups/kv-4e-tasks-20260619-001718.analysis.json`.
- Содержимое KV в логи и docs не выводилось.

**Ожидаемый результат:**
- Вывод содержит `KeyCount=129`
- Вывод содержит `Verification=passed`
- Зашифрованный файл появился в `backups/`

**Если KeyCount отличается от 129** — зафиксировать новое значение и разобраться почему расхождение.

---

## Задача 2 из 4 — Проверить Railway deployment

Убедиться что коммит `a7fe215` (HMAC-подписывающая версия бота) задеплоен в Railway и бот работает.

**Фактический статус на 2026-06-19:** commit `a7fe215` ранее был запушен в `mrktggod/4e-bot`, но Railway deployment нужно подтвердить в интерфейсе/логах Railway или live-проверкой бота.

**Как проверить:**
- Статус deployment в Railway должен быть `Success` для коммита `a7fe215`
- Отправить `/start` боту `@Denzel89bot` — должен ответить
- В логах Railway не должно быть ошибок импорта

**Фактический статус на 2026-06-19:** выполнено.

- GitHub remote проверен: `mrktggod/4e-bot` `origin/main` указывает на `a7fe215dd735f730b3335c5088566f4d9320433c`.
- Railway deployment/live checkpoint подтверждён пользователем.

**Если Railway не задеплоил:**
- Push коммита `a7fe215` из `4e-bot-repo` в `mrktggod/4e-bot`
- Дождаться деплоя

---

## Задача 3 из 4 — Задеплоить HMAC в production Worker

**Только после того как задачи 1 и 2 выполнены.**

**Фактический статус на 2026-06-19:** выполнено.

- Production Worker deployed: version `5b4624ae-b8d1-43f6-ba31-8030c60c4a50`.
- Smoke-test:
  - `GET /` → `200`
  - `GET /tasks` без сессии → `401`
  - `POST /` с `x-action: save-task` без HMAC → `401`
  - `POST /reminders/check` без HMAC → `401`
  - `POST /anthropic` без сессии → `401`
  - `POST /payment/webhook` → `503`

Включить проверку HMAC-подписи на внутренних маршрутах production Worker.

**Порядок:**
1. Убедиться что в Cloudflare Secrets есть `BOT_API_TOKEN` с тем же значением что `BOT_TOKEN` в Railway
2. Задеплоить обновлённый Worker (`wrangler deploy`)
3. Smoke-test: health `200`, неподписанный `/tasks` возвращает `401`
4. Отправить команду боту — должна выполниться без ошибок

**Зафиксировать в DEVELOPMENT_HISTORY.md:** версию задеплоенного Worker и результат smoke-test.

**Предпроверка на 2026-06-19:** `wrangler secret list` показывает `ANTHROPIC_KEY` и `BOT_API_TOKEN`; `node --check 4e-worker/worker.js` прошёл; `wrangler deploy --dry-run` для production Worker прошёл.

---

## После выполнения

Добавить запись в `DEVELOPMENT_HISTORY.md` и отметить задачу выполненной в `docs/tasks/done/`.
