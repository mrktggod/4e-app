# WORK LOG — Командный журнал задач

> Сюда пишут все участники команды после завершения задачи.  
> Формат: дата — агент — что сделано — статус.  
> Детальный технический лог: `../DEVELOPMENT_LOG.md`

---

## Как добавить запись

```markdown
### YYYY-MM-DD — [Ваше имя / Агент]

**Задача:** что делал  
**Результат:** что получилось  
**Коммит:** `hash` или N/A  
**Статус:** ✅ выполнено / ⚠️ частично / ❌ отложено  
**Следующий шаг:** (если есть)
```

---

## Лог

### 2026-06-28 — Codex

**Задача:** BACK-010 — Telegram Stars / ЮKassa
**Результат:** В `index.html` добавлен Telegram Stars payment flow через `Telegram.WebApp.openInvoice`; worker commit `d57771c` создаёт invoice link и bot подтверждает `successful_payment`, после чего Premium активируется в Worker.
**Коммит:** app `feat(payments): add Telegram Stars payment entrypoint`; worker `d57771c`
**Статус:** ⚠️ Ready for QA
**Следующий шаг:** Смержить/deploy app и worker, затем пройти live smoke внутри Telegram Mini App; YooKassa остаётся следующим card-provider решением.
### 2026-06-28 — Codex

**Задача:** Фаза 11 — относительные даты в карточках задач
**Результат:** В `index.html` добавлен общий formatter дат: карточки задач показывают `сегодня`, `вчера`, `N дней назад`, `завтра`, `через N дней` и `просрочено на N дней` вместо абсолютных дат.
**Коммит:** `feat(tasks): show relative dates in task cards`
**Статус:** ✅ выполнено
**Следующий шаг:** После merge можно продолжать следующую задачу из roadmap/backlog; BACK-008 остаётся заблокированным до credentials, BACK-009 ждёт merchant approval VK.
### 2026-06-28 — Codex

**Задача:** BACK-009 — VK Pay для подписки
**Результат:** В `index.html` VK-контекст переводит payment screen на `VKWebAppShowOrderBox`, а обычный web/TG flow остаётся на CloudPayments. В `vk.html` кнопка `Купить план` теперь открывает VK Pay вместо заглушки и обновляет Premium UI после успешного bridge-ответа.
**Коммит:** `feat(payments): add VK Pay subscription flow`
**Статус:** ⚠️ готово к live QA
**Следующий шаг:** Проверить оплату внутри VK Mini App; после успешного smoke перевести BACK-009 в Done.

---
### 2026-06-27 — Codex

**Задача:** BACK-014 — подготовка кода под PostgreSQL заранее
**Результат:** В `4e-worker` смержен PostgreSQL storage adapter для `app_sessions`/`app_task_lists` и добавлен будущий DDL `migrations/postgres_app_state.sql`. Без `POSTGRES_URL` production продолжает работать через D1/KV; live credentials не требовались.
**Коммит:** `37f9dda` (`feat(worker): prepare PostgreSQL storage adapter`), merge `a97d768`
**Статус:** ✅ выполнено
**Следующий шаг:** BACK-008 остаётся manual blocker: Алексей создаёт Yandex Cloud PostgreSQL cluster и передаёт credentials/connection settings.

---
### 2026-06-27 — Codex

**Задача:** BACK-013 — Семантический HTML + aria-label
**Результат:** В `index.html` добавлены `<main>`, `<header>`, `<nav>` для app/root, главного экрана, voice header и нижней навигации; иконочные nav/action элементы получили `aria-label`, `role="button"` и `tabindex="0"`. Визуальные классы и JS id/onclick сохранены.
**Коммит:** `refactor(ui): add semantic HTML landmarks`
**Статус:** ✅ выполнено
**Следующий шаг:** Следующая Codex-задача без внешних credentials — BACK-014: подготовка кода под PostgreSQL заранее.

---

### 2026-06-27 — Codex

**Задача:** Синхронизировать roadmap/backlog со статусом от Юры
**Результат:** В `shared/ROADMAP.md` и `pm/backlog.md` зафиксированы закрытые BACK-001/002/003/004/005/006/012 и Resend-домен; РКН и Yandex Cloud PostgreSQL отмечены как ручные действия Алексея; Codex-задачи сейчас — семантический HTML и подготовка PostgreSQL-кода
**Коммит:** N/A
**Статус:** ✅ выполнено
**Следующий шаг:** Выбрать следующую Codex-задачу: семантический HTML или подготовка PostgreSQL-кода

---

### 2026-06-27 — Codex

**Задача:** BACK-012 — CSS-архитектура LESS + BEM + минификация
**Результат:** Inline CSS из `index.html` вынесен в LESS-модули `styles/variables.less`, `styles/layout.less`, `styles/screens/home.less`, `profile.less`, `tasks.less`, `voice.less`; добавлен `styles/main.less`. В `package.json` добавлены `build:css` и `watch:css`, сборка создаёт `styles.css` и `styles.min.css`, а `index.html` подключает минифицированный файл.
**Коммит:** `refactor(css): migrate to LESS + BEM architecture`
**Статус:** ✅ выполнено
**Следующий шаг:** После merge можно продолжать следующую задачу из roadmap/backlog; BACK-008 остаётся заблокированным до Yandex Cloud credentials.

---

### 2026-06-27 — Codex

**Задача:** BACK-008 — перенос ПД в Yandex Cloud PostgreSQL
**Результат:** Задача не стартовала по коду: Yandex Cloud PostgreSQL cluster ещё не создан, credentials/connection settings отсутствуют. BACK-006 KV→D1 уже закрыт и смержен; следующий технический шаг заблокирован ручной подготовкой инфраструктуры.
**Коммит:** `docs(process): close BACK-006, mark BACK-008 blocked`
**Статус:** ⚠️ заблокировано
**Следующий шаг:** Юрий создаёт Yandex Cloud PostgreSQL cluster и передаёт credentials/connection settings; после этого Codex продолжает BACK-008.

---

### 2026-06-27 — Codex

**Задача:** Объединить roadmap-документы в один источник
**Результат:** `pm/roadmap.md` объединён с `shared/ROADMAP.md` и удалён; инструкции и ссылки обновлены, единственный актуальный roadmap теперь `shared/ROADMAP.md`
**Коммит:** N/A
**Статус:** ✅ выполнено
**Следующий шаг:** Проверить, удобно ли команде вести стратегию и PM-план в одном `shared/ROADMAP.md`; затем закоммитить docs-изменения

---

### 2026-06-27 — Codex

**Задача:** BACK-006 — миграция KV → D1 для sessions/tasks
**Результат:** В `4e-worker` добавлен D1 binding `DB`, миграции `0001_sessions_tasks.sql`/`0002_app_kv_state.sql`, Worker переведён на ES module entrypoint для D1. Новые sessions пишутся в `app_sessions`, task lists — в `app_task_lists`; старые KV `session:*`/`tasks:*` читаются fallback-ом и автопереносятся при доступе. Production Worker задеплоен как version `0b66977a-0b23-4cdf-bd92-c5ec38e2ee1c`; live smoke подтвердил D1 rows для session/task и 404 в KV по новым `session:*`/`tasks:*`.
**Коммит:** `0a035c9` (`feat(worker): store sessions and tasks in D1`)
**Статус:** ✅ выполнено
**Следующий шаг:** Следующий backlog item — BACK-007: уведомление РКН; следующий Codex-технический item — BACK-008: перенос ПД в Yandex Cloud PostgreSQL.

---

### 2026-06-27 — Codex

**Задача:** BACK-005 — единая модель пользователя VK + TG + Email
**Результат:** PR `fix/unified-user-identities` смёржен в `main` worker (`d5af7aa`), production Worker задеплоен как version `ff365be0-59d3-4307-9c15-54ab037e2917`. Live smoke прошёл: временный email-аккаунт привязан к Telegram через `initData` и VK через `launchParams`, затем `/auth/vk` и `/auth/me` вернули тот же canonical `user.id`; тестовые KV-ключи удалены.
**Коммит:** `1a593fb` (`fix(auth): unify VK Telegram and email identities`)
**Статус:** ✅ выполнено
**Следующий шаг:** Следующий backlog item — BACK-006: миграция KV → D1.

---

### 2026-06-27 — Codex

**Задача:** BACK-004 — тестовый платёж, прогнать webhook до конца
**Результат:** Production `/payment/webhook` проверен на временном тестовом пользователе: webhook вернул `code:0`, пользователь перешёл `trial` → `paid`, срок Premium увеличился с 30 до 60 дней. Тестовые KV-ключи `user:*`, `user_id:*`, `tx:*`, `notifs:*` удалены после smoke.
**Коммит:** `docs(process): close BACK-006, mark BACK-008 blocked`
**Статус:** ✅ выполнено
**Следующий шаг:** Следующий backlog item — BACK-005: единая модель пользователя VK + TG + Email.

---

### 2026-06-27 — Codex

**Задача:** BACK-002 — сброс пароля, backend reset endpoints
**Результат:** В `4e-worker/worker.js` добавлены совместимые маршруты `/auth/reset-request` и `/auth/reset-confirm`; reset-confirm принимает `newPassword` и старое поле `password`; ссылка в письме ведёт на `https://mrktggod.github.io/4e-app/?reset=TOKEN`.
**Коммит:** `a0965de` (`feat(auth): add password reset endpoints`)
**Статус:** ✅ выполнено
**Следующий шаг:** BACK-002 закрыт: live smoke прошёл, письмо пришло, кнопка сброса открыла форму, пароль сохранён. Пользователь ввёл тот же пароль, но reset token и backend confirm-flow отработали.

---

### 2026-06-26 — Codex

**Задача:** BACK-001 — Email через Resend, пользователи не получают писем
**Результат:** В `4e-worker/worker.js` удалён hardcoded Resend key, отправка теперь использует runtime secret `RESEND_KEY`, ошибки Resend/fetch обрабатываются контролируемо, `/auth/forgot-password` возвращает `502` если письмо существующему пользователю не отправилось
**Коммит:** `086f19b` (`fix(worker): use Resend secret for email delivery`), branch `origin/fix/resend-email-secret`
**Статус:** ✅ выполнено
**Следующий шаг:** BACK-001 закрыт: письмо сброса дошло, Resend доставил. Клик по ссылке и смена пароля относятся к BACK-002.

---

### 2026-06-26 — Codex

**Задача:** Исправить PM-roadmap/backlog по замечанию Юры
**Результат:** `pm/roadmap.md` и `pm/backlog.md` привязаны к реальной стратегии `shared/ROADMAP.md`; добавлено правило не использовать generic-стратегию про управление проектом; backlog связан с Linear `ALE-5`
**Коммит:** N/A
**Статус:** ✅ выполнено
**Следующий шаг:** Проверить live-сценарий Фазы 9 и заводить подтверждённые P0/P1 баги отдельными Linear issues

---

### 2026-06-25 — Codex

**Задача:** BACK-003 — установить Фазу 9: биометрическое согласие 152-ФЗ для голосового ввода
**Результат:** В `index.html` добавлен экран согласия перед первым запуском микрофона, guard в `openVoice()`, ссылка на `privacy.html` в форме входа, строка отзыва согласия в настройках безопасности; карты файлов и PM-статус обновлены
**Коммит:** `legal: biometric consent and privacy policy`
**Статус:** ✅ выполнено
**Следующий шаг:** После push проверить live `mrktggod.github.io/4e-app/privacy.html` и ручной сценарий микрофона в Telegram WebView

---

### 2026-06-25 — Codex

**Задача:** Исправить `BUG-2026-06-25-002` — сброс пароля принимает некорректный email и может вести на пустой экран
**Результат:** Добавлена валидация email и inline-ошибка, серверный ответ обрабатывается без пустого экрана, нижняя навигация скрыта на auth/reset-flow, баг переведён в Ready for QA
**Коммит:** N/A
**Статус:** ✅ выполнено
**Следующий шаг:** Задеплоить через git push и проверить сценарий в Telegram WebView

---

### 2026-06-25 — Codex

**Задача:** Зафиксировать P1-баг восстановления пароля по скринам пользователя
**Результат:** В `pm/bugs.md` добавлен `BUG-2026-06-25-002`, создана задача для разработки, в QA-чеклист добавлены проверки невалидного email и пустого экрана после сброса пароля
**Коммит:** N/A
**Статус:** ✅ выполнено
**Следующий шаг:** Передать задачу разработчику и после фикса проверить auth/regression-сценарии

---

### 2026-06-25 — Codex

**Задача:** Закрепить напоминание о синхронизации перед работой
**Результат:** В инструкции добавлено правило: перед началом работы напоминать и выполнять `git fetch origin` + `git pull --rebase`
**Коммит:** N/A
**Статус:** ✅ выполнено
**Следующий шаг:** Применять это правило в начале каждой новой задачи

---

### 2026-06-25 — Codex

**Задача:** Ввести понятные заголовки коммитов для всей команды
**Результат:** Добавлен `shared/COMMIT_CONVENTION.md`, правило подключено в инструкции Codex/Claude/Cowork и README
**Коммит:** N/A
**Статус:** ✅ выполнено
**Следующий шаг:** Использовать формат `type(scope): что изменилось` во всех следующих коммитах

---

### 2026-06-25 — Codex

**Задача:** Убрать локальные абсолютные пути из документации и добавить защиту
**Результат:** Локальные Mac/Windows user-пути заменены на переносимые `<repo-root>` / `<worker-repo-root>` / относительные пути; добавлены `scripts/check-portable-paths.sh`, `.githooks/pre-commit` и GitHub Actions path guard
**Коммит:** `docs: remove local absolute paths from docs`
**Статус:** ✅ выполнено
**Следующий шаг:** Запушить маленький docs-fix

---

### 2026-06-25 — Codex

**Задача:** Исправить пустой экран после reload/logout и подсветку нижнего меню
**Результат:** Главный экран сбрасывает внутренний скролл при показе, пункты меню подсвечиваются через `data-nav`, logout явно открывает экран входа, приватные экраны без token перекидывают на login, VK-адаптер не перехватывает login вне VK-контекста
**Коммит:** `d8aead3`
**Статус:** ✅ выполнено
**Следующий шаг:** Проверить на реальном Telegram WebView после деплоя

---

### 2026-06-25 — Codex

**Задача:** Проверить и подготовить `4e-app` к разработке и тестированию
**Результат:** Добавлены карты файлов, обновлены инструкции агентов, добавлен `.gitignore`, уточнён PM/QA-контур; локальный smoke-test страниц прошёл
**Коммит:** `d8aead3`
**Статус:** ✅ выполнено
**Следующий шаг:** Коммит/пуш подготовленных файлов или переход к сбору первых багов

---

### 2026-06-24 (сессия 2) — Cowork (Claude)

**Задача:** Баги навигации: мессенджер для admin, порядок кнопок, подсветка, баг чатов
**Результат:** Скрыт мессенджер для не-admin; новый порядок кнопок (задачи→календарь→mic→мозг); зелёная подсветка активной кнопки; добавлен 'chats' в noNav; защищены auto-redirect таймеры; `console.log` в openChats для диагностики
**Коммит:** `b1ce786`
**Статус:** ⚠️ частично — баг с кнопкой чатов ещё не протестирован
**Следующий шаг:** Юрий тестирует кнопку мессенджера в Telegram на телефоне

---

### 2026-06-24 — Cowork (Claude)

**Задача:** Создать shared-папку с документацией для нового члена команды  
**Результат:** Созданы `4e-app/CLAUDE.md`, `shared/ROADMAP.md`, `shared/DEVELOPMENT_HISTORY.md`, `shared/WORK_LOG.md`  
**Коммит:** N/A (Юрий пушит вручную)  
**Статус:** ✅ выполнено  
**Следующий шаг:** Юрий пушит файлы в репо и выдаёт доступ новому участнику

---

### 2026-06-24 (сессия 3) — Cowork (Claude)

**Задача:** Патч 10 — починить веб-версию на десктопе (множественные экраны одновременно)  
**Результат:** Добавлен CSS override после `@media(min-width:1440px)` — приложение показывается как mobile-frame 430px по центру браузера; override сбрасывает принудительный `display:flex!important` на `#task-detail`, `#voice`, `#chat-conv` из патча 07  
**Коммит:** `b936f64`  
**Статус:** ✅ выполнено  
**Следующий шаг:** Проверить https://mrktggod.github.io/4e-app в десктопном браузере

---

<!-- Добавляйте новые записи ВЫШЕ этой строки -->
