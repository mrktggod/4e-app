# PM Backlog — 4 AI-секретарь

Оперативный backlog из реальной стратегии продукта.

**Источник:** `shared/ROADMAP.md`, `DEVELOPMENT_LOG.md`, `shared/WORK_LOG.md`.

**Правило:** не добавлять generic-задачи про “AI-ассистента для управления проектом”. Каждая задача должна вести к продукту 4 AI-секретарь: Telegram/VK Mini App, AI-секретарь, auth, tasks, privacy, payments, bot/worker.

## Правила приоритета

- P0 — блокирует использование продукта или монетизацию.
- P1 — сильно мешает ключевому сценарию, нужен ближайший фикс.
- P2 — заметное улучшение или некритичный баг.
- P3 — идея, полировка, отложенное улучшение.

---

## Now

| ID | Задача | Тип | Приоритет | Ответственный | Статус | Горизонт | Критерий готовности |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BACK-001 | Email через Resend — пользователи не получают писем | Tech | P0 | Codex | Done | Г1 | Worker commit `086f19b` merged in `a436a10`, deployed as version `abe182e4`; live email smoke passed, Resend delivered the reset email |
| BACK-002 | Сброс пароля — бэкенд не реализован | Tech | P0 | Codex | Done | Г1 | Worker commit `a0965de` merged in `a173ebf`, deployed as version `729a046c`; live smoke passed: письмо пришло, ссылка открылась, пароль сохранён |
| BACK-003 | Фаза 9 — биометрическое согласие 152-ФЗ | Legal/UI | P1 | Codex | Done | Г1 | Экран согласия появляется при первом нажатии на микрофон, privacy.html готова к деплою через commit/push |
| BACK-004 | Тестовый платёж — прогнать webhook до конца | Tech | P1 | Codex | Done | Г1 | Live smoke passed: webhook returned `code:0`, test user moved from `trial` to `paid`, paid period extended |
| BACK-021 | Голосовой ввод показывает ошибку микрофона в Telegram WebView | Product/Tech | P1 | Codex + Юрий / worker | Done | Г1 | Smoke passed на iPhone iOS в Telegram app 2026-07-01 — голос работает |
| BACK-022 | Ручной MVP детальной карточки задачи | Product/UI | P1 | Алексей + Codex | Done | Г1 | Поля статус/приоритет/дедлайн/время/направление/напоминание/чек-лист добавлены в task-detail; saveTaskEdits сохраняет все поля; worker обновлён; smoke passed на iOS 2026-07-01 |
| BACK-024 | Telegram вход — убрать тупик между Mini App и ботом | Bug/Auth | P1 | Юрий / bot + Codex / app | Done | Г1 | Вход через Telegram проходит в правильный аккаунт, smoke passed 2026-07-01 |
| BACK-025 | Настраиваемый утренний AI-дашборд | Product/UI | P1 | Алексей + Codex | Todo | Г1 | Первый экран в стиле AI-планера: "План на сегодня", короткая AI-сводка, "Начать с", пульс дня, риски и секции "Сделать первым / Горит / Жду от людей / Можно перенести"; пользователь за 30 секунд понимает главное и может открыть нужное действие |

## Next

| ID | Задача | Тип | Приоритет | Ответственный | Статус | Горизонт | Критерий готовности |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BACK-005 | Единая модель пользователя VK + TG + Email | Tech | P1 | Codex | Done | Г1 | Worker commit `1a593fb` merged in `d5af7aa`, deployed as version `ff365be0`; live smoke passed: Email account, Telegram link and VK login returned the same canonical user id |
| BACK-006 | Миграция KV → D1 | Tech | P2 | Codex | Done | Г1 | Worker commit `0a035c9` stores sessions and task lists in D1 (`app_sessions`, `app_task_lists`), deployed as version `0b66977a`; live smoke passed: D1 rows created, KV `session:*`/`tasks:*` returned 404 |
| BACK-007 | Уведомление РКН | Legal | P1 | Юрий | Manual | Г1 | Юрий подал уведомление, номер внесён в privacy.html |
| BACK-008 | Перенос ПД в Yandex Cloud PostgreSQL | Tech/Legal | P1 | Алексей + Codex | Manual blocker | Г2 | Алексей создаёт Yandex Cloud PostgreSQL cluster и передаёт credentials/connection settings; после этого Codex продолжает перенос |
| BACK-013 | Семантический HTML | Tech/UI | P3 | Codex | Done | Г1 | В `index.html` добавлены `<main>`, `<header>`, `<nav>`, aria-label и роли для иконочной навигации без изменения визуала |
| BACK-014 | Подготовка кода под PostgreSQL заранее | Tech | P2 | Codex | Done | Г2 | Worker commit `37f9dda` добавил PostgreSQL storage adapter и `migrations/postgres_app_state.sql`; production путь остаётся D1/KV до появления credentials |

## Later

| ID | Задача | Тип | Приоритет | Ответственный | Статус | Горизонт | Критерий готовности |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BACK-009 | VK Pay — оплата подписки | Monetization | P1 | Codex | Ready for QA | Г2 | `index.html` и `vk.html` запускают `VKWebAppShowOrderBox` в VK Mini App; нужен live smoke внутри VK |
| BACK-010 | Telegram Stars / ЮKassa | Monetization | P1 | Codex | Ready for QA | Г2 | App открывает Telegram Stars invoice через `Telegram.WebApp.openInvoice`; worker commit `d57771c` создаёт invoice и bot подтверждает `successful_payment`; нужен live smoke в TG |
| BACK-011 | Командный Workspace | Product | P2 | Codex | Todo | Г3 | Несколько пользователей в одном workspace |
| BACK-012 | CSS-архитектура LESS + BEM + минификация | Tech | P2 | Codex | Done | Г1 | Стили вынесены в LESS-модули, `styles.min.css` собирается и подключён в `index.html` |
| BACK-015 | Ценовая модель | Strategy/Monetization | P2 | Алексей + Юрий | Later | Г2 | Тарифы согласованы отдельным решением и только после этого внесены в roadmap |
| BACK-016 | Расширенный профиль пользователя | Product/UI | P2 | Codex | Ready for QA | Г2 | В `index.html` добавлены фото-плейсхолдер, имя, ID, телефон/email со статусами, Telegram, о себе и дата рождения |
| BACK-017 | Оживить настройки уведомлений | Product/Tech | P2 | Codex | QA partial | Г2 | Live API smoke passed: `/notifications/settings` GET/PUT сохраняет настройки в D1; D1 migrations актуальны; `/briefings/check` живой; реальная доставка Telegram-ботом ждёт ручного smoke на привязанном аккаунте |
| BACK-018 | Удалить кнопку дашборда из нижнего меню | Product/UI | P2 | Юрий + Codex | Done | Г1 | Иконка `global-nav-tasks` (goHome) удалена из `<nav>`, коммит `7206ca6` |
| BACK-019 | Улучшенные карточки задач | Product/UI | P2 | Codex | Ready for QA | Г2 | `index.html` рендерит новую карточку с номером/приоритетом, тегом, дедлайном, 2 строками названия, подсветкой просрочки и swipe-действиями Завершить/Отменить/Перенести; требуется ручной smoke на телефоне |
| BACK-020 | Подтверждение email в профиле для связки аккаунтов | Product/Tech | P2 | Codex | Done | Г2 | Production smoke passed: migration `0004_email_verifications.sql` applied, verification email request returned 200, app link returned 200, `/auth/verify-email` linked email to user, `used_at` burned token, repeat verify returned 400, occupied email conflict returned 409 |
| BACK-023 | Расширение детальной карточки задачи после MVP | Product/UI | P2 | Алексей + Юрий + Codex | Later | Г2 | После проверки BACK-022 выбрать 1-2 функции следующей волны: повторы, вложения/ссылки, умные списки, поиск и фильтры по тегам, календарная синхронизация, командные комментарии |
| BACK-025 | Вкладка «Выполнено» — список + мини-дашборд | Product/UI | P2 | Codex | Todo | Г2 | Вкладка показывает список выполненных задач; сверху мини-дашборд: сделано за день / за неделю / за месяц; секция за неделю в списке дашборда сворачивается/разворачивается |
| BACK-026 | Слияние аккаунтов с переносом задач | Product/Tech | P1 | Codex | Todo | Г2 | При входе через второй провайдер система находит дубль по telegramId/vkId/email, сливает задачи и plan, удаляет дубль; повторный вход не создаёт новый аккаунт |
| BACK-027 | Admin API управления тарифами | Product/Tech | P2 | Codex | Todo | Г2 | Worker-эндпоинты `/admin/users` (GET список) и `/admin/users/:id/plan` (PUT план+дни); доступ по `ADMIN_SECRET`; основа для будущего веб-интерфейса админ-кабинета |
| BACK-028 | Статистика результативности | Product/UI | P2 | Codex | Todo | Г2 | Вкладка со статистикой задач, обещаний, прогресса; рабочие графики; советы AI по улучшению результативности |
| BACK-029 | Срок через date picker, теги вместо направления | Product/UI | P2 | Codex | Todo | Г2 | Поле срока открывает календарь; «Направление» переименовано в «Теги»; попап тегов: выбор существующих, создание новых, редактирование |
| BACK-030 | Участники задачи + отправка задачи пользователю 4 | Product/Tech | P1 | Codex | Todo | Г2 | Добавлять других пользователей 4 в задачу; связывать аккаунты; задача приходит выбранному пользователю в его 4; подсветка что это пользователь 4 |
| BACK-031 | Быстрые кнопки напоминаний | Product/UI | P2 | Codex | Todo | Г2 | Кнопки «через 15 мин», «через 1 час», «через день» в интерфейсе напоминания вместо только ручного выбора |
| BACK-032 | Чат задачи с AI + комментарии | Product/Tech | P2 | Codex | Todo | Г2 | Отдельный чат с 4 по конкретной задаче; вкладка комментариев с сохранением на задаче; история чата сохраняется |
| BACK-033 | Починить раздел «История» | Product/Tech | P2 | Codex | Todo | Г2 | Раздел «История» показывает реальные выполненные задачи и события; сейчас не работает |

## Связь с Linear

| Backlog | Linear | Комментарий |
| --- | --- | --- |
| Первичный баг-баш | ALE-5 | Сбор багов из ручного тестирования и оформление P0/P1 в отдельные issues |
| P0/P1 из Now | Создавать по мере подтверждения | Каждая подтверждённая проблема получает отдельный Linear issue с labels `P0/P1` и `area:*` |

## Icebox

| ID | Идея | Причина отложить | Вернуться когда |
| --- | --- | --- | --- |
| ICE-001 | WhatsApp Business API | Сложная интеграция, нет спроса пока | Горизонт 3 |
| ICE-002 | Нативные iOS/Android приложения | Mini App достаточно на старте | После 10k пользователей |
| ICE-003 | Proactive mode — 4 сам инициирует общение | Требует зрелой AI-логики | Горизонт 2 |
