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

| ID | Задача | Тип | Приоритет | Ответственный | Статус | Критерий готовности |
| --- | --- | --- | --- | --- | --- | --- |
| BACK-001 | Email через Resend — пользователи не получают писем | Tech | P0 | Codex | Done | Worker commit `086f19b` merged in `a436a10`, deployed as version `abe182e4`; live email smoke passed, Resend delivered the reset email |
| BACK-002 | Сброс пароля — бэкенд не реализован | Tech | P0 | Codex | Done | Worker commit `a0965de` merged in `a173ebf`, deployed as version `729a046c`; live smoke passed: письмо пришло, ссылка открылась, пароль сохранён |
| BACK-003 | Фаза 9 — биометрическое согласие 152-ФЗ | Legal/UI | P1 | Codex | Done | Экран согласия появляется при первом нажатии на микрофон, privacy.html готова к деплою через commit/push |
| BACK-004 | Тестовый платёж — прогнать webhook до конца | Tech | P1 | Codex | Done | Live smoke passed: webhook returned `code:0`, test user moved from `trial` to `paid`, paid period extended |

## Next

| ID | Задача | Тип | Приоритет | Ответственный | Статус | Критерий готовности |
| --- | --- | --- | --- | --- | --- | --- |
| BACK-005 | Единая модель пользователя VK + TG + Email | Tech | P1 | Codex | Done | Worker commit `1a593fb` merged in `d5af7aa`, deployed as version `ff365be0`; live smoke passed: Email account, Telegram link and VK login returned the same canonical user id |
| BACK-006 | Миграция KV → D1 | Tech | P2 | Codex | Done | Worker commit `0a035c9` stores sessions and task lists in D1 (`app_sessions`, `app_task_lists`), deployed as version `0b66977a`; live smoke passed: D1 rows created, KV `session:*`/`tasks:*` returned 404 |
| BACK-007 | Уведомление РКН | Legal | P1 | Алексей | Manual | Уведомление подано, номер внесён в privacy.html |
| BACK-008 | Перенос ПД в Yandex Cloud PostgreSQL | Tech/Legal | P1 | Алексей + Codex | Manual blocker | Алексей создаёт Yandex Cloud PostgreSQL cluster и передаёт credentials/connection settings; после этого Codex продолжает перенос |
| BACK-013 | Семантический HTML | Tech/UI | P3 | Codex | Done | В `index.html` добавлены `<main>`, `<header>`, `<nav>`, aria-label и роли для иконочной навигации без изменения визуала |
| BACK-014 | Подготовка кода под PostgreSQL заранее | Tech | P2 | Codex | Done | Worker commit `37f9dda` добавил PostgreSQL storage adapter и `migrations/postgres_app_state.sql`; production путь остаётся D1/KV до появления credentials |

## Later

| ID | Задача | Тип | Приоритет | Ответственный | Статус | Критерий готовности |
| --- | --- | --- | --- | --- | --- | --- |
| BACK-009 | VK Pay — оплата подписки | Monetization | P1 | Codex | Ready for QA | `index.html` и `vk.html` запускают `VKWebAppShowOrderBox` в VK Mini App; нужен live smoke внутри VK |
| BACK-010 | Telegram Stars / ЮKassa | Monetization | P1 | Codex | Ready for QA | App открывает Telegram Stars invoice через `Telegram.WebApp.openInvoice`; worker commit `d57771c` создаёт invoice и bot подтверждает `successful_payment`; нужен live smoke в TG |
| BACK-011 | Командный Workspace | Product | P2 | Codex | Todo | Несколько пользователей в одном workspace |
| BACK-012 | CSS-архитектура LESS + BEM + минификация | Tech | P2 | Codex | Done | Стили вынесены в LESS-модули, `styles.min.css` собирается и подключён в `index.html` |
| BACK-015 | Ценовая модель | Strategy/Monetization | P2 | Алексей + Юрий | Later | Тарифы согласованы отдельным решением и только после этого внесены в roadmap |
| BACK-016 | Расширенный профиль пользователя | Product/UI | P2 | Codex | Ready for QA | В `index.html` добавлены фото-плейсхолдер, имя, ID, телефон/email со статусами, Telegram, о себе и дата рождения |
| BACK-017 | Оживить настройки уведомлений | Product/Tech | P2 | Codex | Ready for QA | App сохраняет настройки каналов/брифинга/просрочек; worker commit `b3aa1d6` добавил D1 storage и bot checks |
| BACK-020 | Подтверждение email в профиле для связки аккаунтов | Product/Tech | P2 | Codex | Ready for QA | App обрабатывает `?verify_email=TOKEN`; worker commit `e815266` добавил Resend письмо, D1 token storage и конфликт `Этот email уже используется`; нужен deploy, D1 migration `0004_email_verifications.sql` и live smoke |

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
