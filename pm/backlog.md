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
| BACK-036 | Web fallback Telegram-входа не открывает Telegram | Bug/Auth | P1 | Codex + Юрий / bot | Regression found | Г1 | В `index.html` заменён `tg://resolve` на `https://t.me/Denzel89bot?start=...`; фронт сохраняет pending token, отправляет `returnUrl` и принимает `?telegram_start=<token>`. Live smoke 2026-07-11 (Юрий, аккаунт с давней историей чата с ботом): `/start` с payload НЕ отправляется автоматически ни при открытии из браузера («Открыть в Telegram Desktop»), ни при клике по той же ссылке из «Избранного» внутри Telegram — открывается просто существующий чат. Причина — платформенное поведение Telegram: диплинк `t.me/bot?start=X` авто-отправляет `/start X` только при ПЕРВОМ открытии бота (когда ещё нет истории чата и показывается отдельная кнопка START); при уже существующей истории чата Telegram просто открывает диалог без выполнения команды. Значит для ЛЮБОГО пользователя, уже писавшего боту хоть раз, текущая схема входа не сработает. Нужно: либо детектировать этот случай и явно показать пользователю текст команды `/start auth_<токен>` для ручной отправки, либо перейти на другой механизм (Telegram Login Widget), не зависящий от истории чата. НЕ помечать Done/Ready for QA, пока не закрыт этот кейс для "старых" пользователей бота. |
| BACK-041 | Bot-side web fallback Telegram-входа: возврат на сайт из `/start auth_*` | Bug/Auth | P1 | Codex + Юрий / bot | Ready for QA | Г1 | В обработчике `/start` payload `auth_*` извлекает `startToken` и шлёт inline-кнопку «Вернуться в 4» → `${APP_BASE_URL}/?telegram_start=<token>`; TTL 10 минут и одноразовость уже обеспечены worker-ом; прод worker задеплоен (`88b3ab16-fc44-4567-b98c-a8ca4125a5f4`), polling bot code запушен в `4e-worker/main`; Алексей проходит сквозной live smoke веб-входа |
| BACK-046 | Ограничить нижнюю панель шириной экрана приложения | Bug/UI | P2 | Юрий | Ready for QA | Г1 | Ветка `fix/bottom-nav-app-width`, commit `748dcfd`: `bottom-nav-v2` и `global-nav` ограничены шириной app-контейнера на desktop/web; нужен ручной smoke Алексея на 1440/1024/390 и проверка safe-area/клавиатуры перед merge |
| BACK-043 | Выровнять мобильную верстку экрана профиля | Bug/UI | P2 | Юрий | Ready for QA | Г1 | Ветка `fix/profile-responsive-ui`, commit `33903b4`: профиль выровнен для mobile web, Telegram/status rows и секции "Дата рождения" / "О себе" переразложены без смены визуального стиля; нужны desktop+mobile скрины Алексею и ручной smoke перед merge |
| BACK-044 | Упростить детальную карточку задачи | Product/UI | P2 | Юрий | Ready for QA | Г1 | Ветка `fix/task-detail-card-cleanup`, commit `250f35b`: описание перенесено под заголовок, вкладка "Описание" убрана, порядок полей упрощён, строки "Направление" и "Человек" скрыты; нужен ручной smoke mobile/web на сохранение и первый экран карточки |

## Next

| ID | Задача | Тип | Приоритет | Ответственный | Статус | Горизонт | Критерий готовности |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BACK-005 | Единая модель пользователя VK + TG + Email | Tech | P1 | Codex | Done | Г1 | Worker commit `1a593fb` merged in `d5af7aa`, deployed as version `ff365be0`; live smoke passed: Email account, Telegram link and VK login returned the same canonical user id |
| BACK-006 | Миграция KV → D1 | Tech | P2 | Codex | Done | Г1 | Worker commit `0a035c9` stores sessions and task lists in D1 (`app_sessions`, `app_task_lists`), deployed as version `0b66977a`; live smoke passed: D1 rows created, KV `session:*`/`tasks:*` returned 404 |
| BACK-007 | Уведомление РКН | Legal | P1 | Юрий + Codex | Ready for QA | Г1 | Номер РКН внесён в `privacy.html`, ссылка на `privacy.html` видна на login/register и onboarding, GitHub Pages `privacy.html` открывается и содержит `102299/77` |
| BACK-008 | Перенос ПД в Yandex Cloud PostgreSQL | Tech/Legal | P1 | Алексей + Codex | Manual blocker | Г2 | Алексей создаёт Yandex Cloud PostgreSQL cluster и передаёт credentials/connection settings; после этого Codex продолжает перенос |
| BACK-013 | Семантический HTML | Tech/UI | P3 | Codex | Done | Г1 | В `index.html` добавлены `<main>`, `<header>`, `<nav>`, aria-label и роли для иконочной навигации без изменения визуала |
| BACK-014 | Подготовка кода под PostgreSQL заранее | Tech | P2 | Codex | Done | Г2 | Worker commit `37f9dda` добавил PostgreSQL storage adapter и `migrations/postgres_app_state.sql`; production путь остаётся D1/KV до появления credentials |
| BACK-047 | Вшить v2 auth/privacy routes в worker и убрать фронтовые fallback | Tech/Auth | P1 | Codex | Done | Г1 | Worker commit `21ddb48` + app commit `e85cd50`: live routes `/v2/auth/legacy-session`, `/auth/identities`, `/v2/privacy/settings` отвечают `200/401` как ожидается; staging и prod smoke зелёные, фронтовые fallback сняты после live `200` |
| BACK-045 | Авторизация через сервисы РФ: VK ID + Яндекс ID | Product/Auth | P1 | Алексей + Юрий + Codex | Todo | Г1–Г2 | На экранах входа и регистрации есть понятные варианты входа через VK ID и Яндекс ID; вход не создаёт дубль, если пользователь уже есть по email/telegram/vk/yandex; пользователь понимает, какой аккаунт привязан; сценарий покрыт smoke для web, VK Mini App и Telegram Mini App |
| SMART-006 | Профиль пользователя в контексте AI-чата | Product/AI | P1 | Codex | In Progress | Г1 | System prompt получает имя, локальное время, тариф, статистику задач и топ людей; staging smoke ждёт `ANTHROPIC_KEY`, чтобы проверить ответы «что у меня горит?» и «кому я больше всего должен?» |
| SMART-004 | Лаконичная фиксация задач в группах | Product/Bot | P1 | Codex | Ready for QA | Г1 | Локальный bot runtime стартует на staging-секретах; smoke против staging-worker пройден: однострочное подтверждение, мгновенное сохранение и `✏️/✕` через `delete-task` |
| SMART-001 | Ростер участников группового чата | Tech/Bot | P1 | Codex | Ready for QA | Г1 | Smoke против staging-worker пройден: roster хранится в D1 `chat_members` через `upsert/get/mark-chat-members-left`; по итогам smoke исправлен сценарий `left_chat_member`, миграция `0007_chat_members.sql` уже на staging |
| SMART-002 | Исполнитель с TG ID в задаче | Product/Bot | P1 | Codex | Ready for QA | Г1 | Smoke против staging-worker пройден: bot source пишет `assigneeTgId`/`assigneeUsername` из entities, reply и roster-fuzzy; проверены `@username` и reply-задача |
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
| SMART-013 | «Задача — это промпт»: AI-декомпозиция на этапы | Product/AI | P2 | Codex | Todo | Г2 | Кнопка «Разбить на этапы» в карточке задачи: AI разворачивает задачу в чек-лист шагов; в чате задачи (BACK-032) можно углубиться в любой шаг; стартовый набор шаблонов декомпозиции (запуск, отчёт, событие, переезд и т.п.). Идея Юрия 2026-07-04; основа сценария ролика 2Б |
| VIRAL-001 | Шеринг-карточка «План дня / Итоги дня» | Growth | P2 | Мимо → Codex | Todo | Г2 | Красивое изображение (glass, водяной знак) шерится в VK Stories и TG |
| VIRAL-002 | Реферальная ссылка +30 дней обоим | Growth | P2 | Codex | Todo | Г2 | Требует BACK-026 и BACK-038; инвайт-ссылка, начисление дней, счётчик |
| VIRAL-003 | AI-персонаж в приложении | Growth/Brand | P2 | Юрий (bible) → Мимо | Todo | Г2 | Сдержанная версия персонажа AI-блогера: аватар, тон сводок; связка с VK Клипами |
| VIRAL-004 | Streak + достижения в шеринг-карточке | Growth | P3 | Мимо → Codex | Todo | Г2 | «N дней с планом» + 2–3 достижения внутри VIRAL-001 |
| VIRAL-005 | Онбординг с wow-моментом: первый AI-план за 60 сек | Growth/UX | P2 | Мимо | Todo | Г2 | Новый пользователь надиктовывает 3 задачи и сразу получает план |
| VIRAL-006 | Еженедельная AI-сводка «Твоя неделя» | Growth | P3 | Мимо → Codex | Todo | Г2 | Персональная статистика недели в шерабельном формате (мини-Wrapped) |
| PLAT-001 | Мини-апп + бот в MAX | Platform | P2 | Юрий (профиль ИП) + Codex | Todo | Г2 | Четвёртый адаптер на MAX Bridge (dev.max.ru); требует BACK-036 и верифицированный профиль на платформе MAX |
| PLAT-002 | RuStore: PWA-обёртка | Platform | P2 | Codex | Todo | Г2 | Standalone-режим без TG/VK SDK на домене 4-ai.site, публикация в RuStore |
| PLAT-003 | Google Play (TWA) → App Store (Capacitor) | Platform | P3 | Codex | Todo | Г3 | После PLAT-002; Apple потребует нативных элементов и учёта правил платежей; заменяет ICE-002 |
| NATIVE-001 | Системный календарь: двусторонняя синхронизация | Platform/Product | P2 | Codex | Todo | Г3 (после PLAT-003) | Задачи с датой видны в календаре телефона, события календаря — в «Плане на сегодня»; AI учитывает занятость при планировании («в 15:00 не успеешь — у тебя встреча»). Идея Юрия 2026-07-04 |
| NATIVE-002 | Нативные push с действиями | Platform/Product | P1 | Codex | Todo | Г3 (после PLAT-003) | Напоминание приходит как системный push с кнопками «Готово / +1 час / Открыть» — реакция без открытия приложения. Заменяет зависимость от Telegram-уведомлений |
| NATIVE-003 | Голос без открытия приложения: Siri Shortcuts / App Intents + Google Assistant | Platform/Product | P2 | Codex | Todo | Г3 | «Привет Siri, скажи 4: перезвонить Ане завтра» → задача создана в фоне. Легальный путь к эффекту «Алисы» на чужих платформах |
| NATIVE-004 | Виджеты и share sheet | Platform/Product | P2 | Codex | Todo | Г3 | Виджет «План на сегодня» на домашнем экране; «Поделиться» из любого приложения (текст, скрин переписки) в 4 → AI извлекает задачу |
| NATIVE-005 | Гео-напоминания (geofencing) | Platform/Product | P3 | Codex | Todo | Г3 | «Напомни про посылку, когда буду рядом с пунктом выдачи» — фоновое срабатывание по месту; связка с гео-этапом продуктового видения. Требует явного согласия (152-ФЗ: геоданные = ПД) |
| NATIVE-006 | Фоновый сбор контекста с телефона (аккуратно) | Platform/AI | P3 | Юрий (политика) + Codex | Icebox | Г3+ | Только opt-in и по одному источнику: календарь, гео. НЕ делать: чтение уведомлений/прослушивание — риск бана в сторах и токсично для доверия. Каждый источник — отдельное согласие, отражается в «Что 4 знает обо мне» (SMART-007) |
| INFRA-001 | Фронт на Workers Static Assets + app.4-ai.site на Worker | Infra | P0 | Codex | In Progress | Г0 | Диагноз 2026-07-05: Cloudflare Pages (pages.dev + кастомные домены Pages) блокируется в РФ без VPN; Workers (edge.4-ai.site, workers.dev) доступны. Перенести whitelist-сборку фронта на static assets воркера, домен app.4-ai.site перевязать с Pages на Worker. Проверка Юрием без VPN. Fallback: фронт остаётся на github.io |
| INFRA-002 | Чек РФ-доступности без VPN в release-checklist | QA/Process | P1 | Codex (docs) + Алексей | Todo | Г0 | Обязательный пункт: все прод-URL проверяются из РФ-сети без VPN перед любым переключением хостинга/домена. Проверять минимум с двух независимых точек/операторов: сеть Юрия под жёсткими ограничениями не может быть единственным критерием. Урок миграции 2026-07-05 |
| INFRA-004 | VK-версия на хостинге VK Mini Apps | Infra/Platform | P1 | Codex | Done | Г0 | `vk-miniapps-deploy` завершён, production URL привязан к приложению `54636698`; телефонный smoke без VPN пройден. Production: `https://prod-app54636698-c3cd4413b138.pages-ac.vk-apps.com/index.html` |
| INFRA-005 | RU API proxy для VK Mini App через Yandex Cloud | Infra/Platform | P0 | Codex + Алексей | In Progress | Г0 | Gateway `ai-ru-proxy` создан в Yandex Cloud, домен `https://d5dg7uthvqp4ebomg3rl.ccx97b51.apigw.yandexcloud.net`; VK artifact собирается с этим `VK_API_BASE_URL`; version `1783760421` загружена, dev URL обновлён; blocker — production confirm code из VK Administration и phone-smoke без VPN |
| INFRA-006 | Единая рабочая копия репозитория | Tech/Process | P1 | Юрий + Алексей | Todo | Г0 | Сейчас есть минимум 2 независимые локальные копии (`Documents/4/.tmp-4e-app-publish` и `Desktop/4/Версия/4e-app`), обмен не всегда через git — 2026-07-11 подтверждён реальный случай расхождения (`privacy.html` с разными email в двух копиях одновременно). Нужно решение: выбрать одну каноничную рабочую папку, вторую либо удалить, либо превратить в чистый `git clone` того же репозитория без ручного редактирования напрямую. Решение workflow — за Юрием/Алексеем, не код-задача для Кодекса. |
| INFRA-003 | Приватизация реп — ТОЛЬКО после ухода фронта с GitHub Pages | Process | P1 | Юрий | Blocked by INFRA-001 | Г0 | ⚠️ Пока фронт живёт на mrktggod.github.io (Free-тариф), репо ОБЯЗАН оставаться публичным — private убьёт GitHub Pages и прод. Утечка закрыта whitelist-сборкой. Private делать только когда app.4-ai.site на Workers станет продом и github.io останется лишь редиректом |

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
