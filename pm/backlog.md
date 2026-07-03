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
| BACK-025 | Настраиваемый утренний AI-дашборд | Product/UI | P1 | Алексей + Codex | Done | Г1 | Первый экран в стиле AI-планера: "План на сегодня", короткая AI-сводка, "Начать с", пульс дня, риски и секции "Сделать первым / Горит / Жду от людей / Можно перенести"; пользователь за 30 секунд понимает главное и может открыть нужное действие |
| BACK-027 | Баги AI-дашборда после smoke | Bug/UI | P2 | Codex | Done | Г1 | (1) Пульс дня показывает >100% — сломан расчёт; (2) кнопка «Свернуть 4» содержит имя приложения вместо просто «Свернуть»; (3) секция «Горит» показывает «Пока пусто» при наличии просроченных задач — фильтр не захватывает overdue. Закрыт: см. bugs.md BUG-2026-07-04-001, headless smoke 2026-07-04 |
| BACK-034 | Staging-контур: D1/KV staging, `wrangler --env staging`, тестовый бот, dev-Pages | Tech/Process | P1 | Codex | In Progress | Г1 | staging D1/KV и worker уже подняты, `dev`-ветка Mini App задеплоена на `4-ai-staging.pages.dev`; осталось добить AI smoke после добавления staging secrets и подтвердить username тестового бота |
| BACK-035 | QA smoke по qa-checklist перед закрытым тестом | QA | P1 | Алексей | Todo | Г1 | Все сценарии qa-checklist пройдены на iOS и Android после фиксов BACK-021/024/027 |

## Next

| ID | Задача | Тип | Приоритет | Ответственный | Статус | Горизонт | Критерий готовности |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BACK-005 | Единая модель пользователя VK + TG + Email | Tech | P1 | Codex | Done | Г1 | Worker commit `1a593fb` merged in `d5af7aa`, deployed as version `ff365be0`; live smoke passed: Email account, Telegram link and VK login returned the same canonical user id |
| BACK-006 | Миграция KV → D1 | Tech | P2 | Codex | Done | Г1 | Worker commit `0a035c9` stores sessions and task lists in D1 (`app_sessions`, `app_task_lists`), deployed as version `0b66977a`; live smoke passed: D1 rows created, KV `session:*`/`tasks:*` returned 404 |
| BACK-007 | Уведомление РКН | Legal | P1 | Юрий | Manual | Г1 | Юрий подал уведомление, номер внесён в privacy.html |
| BACK-008 | Перенос ПД в Yandex Cloud PostgreSQL | Tech/Legal | P1 | Алексей + Codex | Manual blocker | Г2 | Алексей создаёт Yandex Cloud PostgreSQL cluster и передаёт credentials/connection settings; после этого Codex продолжает перенос |
| BACK-013 | Семантический HTML | Tech/UI | P3 | Codex | Done | Г1 | В `index.html` добавлены `<main>`, `<header>`, `<nav>`, aria-label и роли для иконочной навигации без изменения визуала |
| BACK-014 | Подготовка кода под PostgreSQL заранее | Tech | P2 | Codex | Done | Г2 | Worker commit `37f9dda` добавил PostgreSQL storage adapter и `migrations/postgres_app_state.sql`; production путь остаётся D1/KV до появления credentials |
| SMART-006 | Профиль пользователя в контексте AI-чата | Product/AI | P1 | Codex | In Progress | Г1 | System prompt получает имя, локальное время, тариф, статистику задач и топ людей; staging smoke ждёт `ANTHROPIC_KEY`, чтобы проверить ответы «что у меня горит?» и «кому я больше всего должен?» |
| SMART-004 | Лаконичная фиксация задач в группах | Product/Bot | P1 | Codex | Todo | Г1 | Подтверждение — одна строка `✓ Имя: задача — срок` + кнопки ✏️/✕; сохранение сразу, без 2-минутного setTimeout |
| SMART-001 | Ростер участников группового чата | Tech/Bot | P1 | Codex | Todo | Г1 | Бот копит участников (tg_id, имя, username) из сообщений и new_chat_members в D1; per chat_id |
| SMART-002 | Исполнитель с TG ID в задаче | Product/Bot | P1 | Codex | Todo | Г1 | Задача получает assigneeTgId/assigneeUsername из entities (mention/text_mention), reply или fuzzy-матча имени против ростера; связан с BACK-030 |
| SMART-003 | Кнопка «Написать» исполнителю | Product/UI | P1 | Codex | Todo | Г1 | В карточке задачи и сообщении бота кнопка открывает чат: t.me/username или tg://user?id; фолбэк при закрытом профиле |
| SMART-007 | Память фактов между сессиями (AI-память v1) | Product/AI | P1 | Codex | Todo | Г1 | Фоновое извлечение фактов (Haiku) → D1 `user_facts`, топ-15 в system prompt; экран «Что 4 знает обо мне» с удалением (152-ФЗ) |
| SMART-005 | Утренняя сводка по чату | Product/Bot | P2 | Codex | Todo | Г1 | Подключить готовый `checkBriefings()` + per-group сводка; расписание через Cloudflare Cron Triggers; связан с BACK-017 |
| BACK-036 | Распил index.html: общее ядро + адаптеры TG/VK | Tech | P1 | Codex, поэтапно | Todo | Г1–Г2 | CSS/JS вынесены в модули, vk.html использует общее ядро; готовит MAX и сторы; снимает проблему кириллицы при правках |
| BACK-037 | CI + смоук-тесты API | Tech | P2 | Codex | Todo | Г1–Г2 | GitHub Actions: проверка кодировки, линт, минификация; автотесты auth/tasks CRUD//transcribe |
| BACK-038 | Аналитика событий + D1/D7 retention | Tech/Product | P2 | Codex | Todo | Г1–Г2 | События: вход, создание задачи, шеринг; дашборд retention для оценки беты и виральности |

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
| BACK-039 | Вкладка «Выполнено» — список + мини-дашборд (быв. дубликат BACK-025) | Product/UI | P2 | Codex | Ready for QA | Г2 | Вкладка показывает список выполненных задач; сверху мини-дашборд: сделано за день / за неделю / за месяц; секция за неделю в списке дашборда сворачивается/разворачивается |
| BACK-026 | Слияние аккаунтов с переносом задач | Product/Tech | P1 | Codex | Todo | Г2 | При входе через второй провайдер система находит дубль по telegramId/vkId/email, сливает задачи и plan, удаляет дубль; повторный вход не создаёт новый аккаунт |
| BACK-040 | Admin API управления тарифами (быв. дубликат BACK-027) | Product/Tech | P2 | Codex | Todo | Г2 | Worker-эндпоинты `/admin/users` (GET список) и `/admin/users/:id/plan` (PUT план+дни); доступ по `ADMIN_SECRET`; основа для будущего веб-интерфейса админ-кабинета |
| BACK-028 | Статистика результативности | Product/UI | P2 | Codex | Todo | Г2 | Вкладка со статистикой задач, обещаний, прогресса; рабочие графики; советы AI по улучшению результативности |
| BACK-029 | Срок через date picker, теги вместо направления | Product/UI | P2 | Codex | Todo | Г2 | Поле срока открывает календарь; «Направление» переименовано в «Теги»; попап тегов: выбор существующих, создание новых, редактирование |
| BACK-030 | Участники задачи + отправка задачи пользователю 4 | Product/Tech | P1 | Codex | Todo | Г2 | Добавлять других пользователей 4 в задачу; связывать аккаунты; задача приходит выбранному пользователю в его 4; подсветка что это пользователь 4 |
| BACK-031 | Быстрые кнопки напоминаний | Product/UI | P2 | Codex | Todo | Г2 | Кнопки «через 15 мин», «через 1 час», «через день» в интерфейсе напоминания вместо только ручного выбора |
| BACK-032 | Чат задачи с AI + комментарии | Product/Tech | P2 | Codex | Todo | Г2 | Отдельный чат с 4 по конкретной задаче; вкладка комментариев с сохранением на задаче; история чата сохраняется |
| BACK-033 | Починить раздел «История» | Product/Tech | P2 | Codex | Todo | Г2 | Раздел «История» показывает реальные выполненные задачи и события; сейчас не работает |
| SMART-008 | Действия из чата: перенести/закрыть/изменить/показать | Product/AI | P2 | Codex | Todo | Г2 | AI возвращает массив действий, приложение показывает превью и выполняет после подтверждения; связан с BACK-032 |
| SMART-009 | Один уточняющий вопрос с кнопками | Product/AI | P2 | Codex | Todo | Г2 | При отсутствии дедлайна/исполнителя — короткий вопрос с кнопками-вариантами, максимум один |
| SMART-011 | Умный пинг «Жду от людей» | Product/Bot | P2 | Codex | Todo | Г2 | Кнопка «Напомнить N» шлёт исполнителю вежливое напоминание; требует SMART-002; шаг к ICE-003 Proactive mode |
| SMART-010 | Дедупликация задач | Product/AI | P3 | Codex | Todo | Г2 | При создании — чек похожести с активными, предложение объединить |
| SMART-012 | Адаптивное время напоминаний | Product/AI | P3 | Codex | Todo | Г2 | Время брифинга/напоминаний подстраивается под активность пользователя (AI-память v2) |
| VIRAL-001 | Шеринг-карточка «План дня / Итоги дня» | Growth | P2 | Мимо → Codex | Todo | Г2 | Красивое изображение (glass, водяной знак) шерится в VK Stories и TG |
| VIRAL-002 | Реферальная ссылка +30 дней обоим | Growth | P2 | Codex | Todo | Г2 | Требует BACK-026 и BACK-038; инвайт-ссылка, начисление дней, счётчик |
| VIRAL-003 | AI-персонаж в приложении | Growth/Brand | P2 | Юрий (bible) → Мимо | Todo | Г2 | Сдержанная версия персонажа AI-блогера: аватар, тон сводок; связка с VK Клипами |
| VIRAL-004 | Streak + достижения в шеринг-карточке | Growth | P3 | Мимо → Codex | Todo | Г2 | «N дней с планом» + 2–3 достижения внутри VIRAL-001 |
| VIRAL-005 | Онбординг с wow-моментом: первый AI-план за 60 сек | Growth/UX | P2 | Мимо | Todo | Г2 | Новый пользователь надиктовывает 3 задачи и сразу получает план |
| VIRAL-006 | Еженедельная AI-сводка «Твоя неделя» | Growth | P3 | Мимо → Codex | Todo | Г2 | Персональная статистика недели в шерабельном формате (мини-Wrapped) |
| PLAT-001 | Мини-апп + бот в MAX | Platform | P2 | Юрий (профиль ИП) + Codex | Todo | Г2 | Четвёртый адаптер на MAX Bridge (dev.max.ru); требует BACK-036 и верифицированный профиль на платформе MAX |
| PLAT-002 | RuStore: PWA-обёртка | Platform | P2 | Codex | Todo | Г2 | Standalone-режим без TG/VK SDK на домене 4-ai.site, публикация в RuStore |
| PLAT-003 | Google Play (TWA) → App Store (Capacitor) | Platform | P3 | Codex | Todo | Г3 | После PLAT-002; Apple потребует нативных элементов и учёта правил платежей; заменяет ICE-002 |

## Соответствие багов задачам (аудит 2026-07-04)

| Баг (pm/bugs.md) | Покрыт задачей | Статус задачи | Вывод |
| --- | --- | --- | --- |
| BUG-2026-06-29-001 (тупик TG-входа) | BACK-024 | Done, smoke 2026-07-01 | ✅ закрыт — bugs.md обновлён 2026-07-04 |
| BUG-2026-06-29-002 (ошибка микрофона) | BACK-021 | Done, smoke iOS 2026-07-01 | ✅ закрыт — bugs.md обновлён 2026-07-04 |
| BUG-2026-06-25-002 (сброс пароля) | BACK-002 | Done, Pass 2026-06-25 | ✅ закрыт |
| BUG-2026-06-25-001 (пустой экран после logout) | фикс без BACK | Закрыт 2026-06-25 | ✅ |
| BUG-2026-07-04-001 (Пульс дня >100% и др.) | BACK-027 (Now) | Done, smoke 2026-07-04 | ✅ закрыт |

Непокрытых багов нет. Коллизия ID устранена 2026-07-04: Later-дубликаты переименованы — вкладка «Выполнено» BACK-025 → **BACK-039**, Admin API BACK-027 → **BACK-040**. Номера BACK-025 (AI-дашборд) и BACK-027 (баги дашборда) остаются за Now-задачами, на которые ссылаются bugs.md и коммиты. Файлы задач переименованы в `docs/tasks/BACK-039-completed-tasks-week.md` и `docs/tasks/BACK-040-admin-tariff-map.md`.

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
