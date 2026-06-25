# FILE MAP UI — index.html / vk.html / privacy.html

Карта пользовательского интерфейса. Используй её, чтобы читать только нужные участки больших HTML-файлов.

## `index.html` — Telegram Mini App

| Диапазон | Блок | Что внутри |
| --- | --- | --- |
| 1-11 | Head scripts | Telegram SDK, VK bridge, marked |
| 12-976 | CSS | Тема, layout, экраны, карточки задач, чаты, профиль, responsive |
| 978-2899 | HTML screens | Все экраны приложения и overlays, auth-result overlay |
| 2901-5903 | JavaScript | Auth, задачи, AI-чат, календарь, профиль, privacy, lock, chats, VK adapter |
| 5904-6220 | Biometric consent patch | Screen `biometric-consent`, CSS, localStorage consent gate for voice input |

### HTML screens

| Строка | Screen ID | Назначение |
| ---: | --- | --- |
| 984 | `onboarding` | Первый запуск |
| 1131 | `forgot-password` | Запрос сброса пароля |
| 1157 | `reset-password` | Новый пароль по токену |
| 1183 | `login` | Вход и регистрация |
| 1235 | `home` | Главный экран задач |
| 1395 | `write` | Написать сообщение |
| 1430 | `ask` | AI-чат |
| 1465 | `task-detail` | Детали задачи |
| 1598 | `calendar` | Календарь |
| 1635 | `statistics` | Статистика |
| 1687 | `notifications` | Уведомления |
| 1707 | `profile` | Профиль |
| 1737 | `subscription` | Подписка |
| 1817 | `payment` | Оплата |
| 1870 | `payment-success` | Успешная оплата |
| 1894 | `notif-settings` | Настройки уведомлений |
| 1942 | `security` | Безопасность |
| 1991 | `privacy-center` | Центр приватности |
| 2071 | `change-password` | Смена пароля |
| 2104 | `sessions` | Сессии |
| 2139 | `devices` | Устройства |
| 2166 | `login-history` | История входов |
| 2199 | `theme-settings` | Тема |
| 2234 | `language-settings` | Язык |
| 2283 | `support` | Поддержка |
| 2329 | `faq` | FAQ |
| 2378 | `write-support` | Сообщение в поддержку |
| 2412 | `telegram-support` | Telegram-поддержка |
| 2439 | `chats` | Список чатов |
| 2539 | `chat-conv` | Переписка |
| 2568 | `msng-settings` | Настройки мессенджеров |
| 2618 | `new-task` | Новая задача |
| 2652 | `task-confirm` | Подтверждение задачи |
| 2682 | `task-move` | Перенос задачи |
| 2699 | `task-done` | Завершение задачи |
| 2713 | `voice` | Голосовой режим |
| 2789 | `forgot-result-overlay` | Надёжное подтверждение отправки ссылки восстановления |
| 5914 | `biometric-consent` | Согласие на обработку голоса по 152-ФЗ |

### JavaScript ranges

| Диапазон | Назначение | Ключевые функции |
| --- | --- | --- |
| 2901-2954 | Config, tokens, helpers | `getToken`, `authHeaders`, `withTimeout`, `readJsonSafe`, `isVkMiniAppContext` |
| 2955-3199 | App init and auth | `initApp`, `doRegister`, `doLogin`, `loginWithTelegram`, `doLogout` |
| 3200-3330 | Payments and subscription | `selectPlan`, `startPayment`, `launchWidget`, `updateSubscriptionScreen` |
| 3331-3438 | Onboarding, system prompt, trial | `obInit`, `obRender`, `obDone`, `checkTrial` |
| 3439-3702 | Tasks, home, calendar stats | `loadTasks`, `submitQuickAdd`, `renderTasksForMonth`, `loadStats`, `markDoneKV` |
| 3703-3986 | Navigation, notifications, lists, contact | `showScreen`, `setNavActive`, `openAsk`, `openNotifications`, `renderNotifs`, `openFilteredTaskList` |
| 3987-4230 | Task detail and editing | `openTask`, `editDetailField`, `completeTask`, `saveTaskEdits`, `setReminderOnWorker` |
| 4231-4306 | Message generation | `openWrite`, `aiCall`, `generateMessage`, `copyMsg`, `editMsg` |
| 4307-4539 | AI chat and task creation | `loadAskHistoryRemote`, `createTaskFromChat`, `sendAsk`, `showToast` |
| 4540-4653 | Calendar and voice | `renderCalendar`, `selectCalDay`, `openVoice`, `sendVoiceMessage`; `openVoice` gated by `biometricConsentRequired` |
| 4654-4831 | Subscreens and privacy API | `_showSubScreenBase`, `syncD1AuthSession`, `loadPrivacyCenter`, `recordPrivacyConsent` |
| 4832-5029 | Settings | `saveNotifPref`, `savePassword`, `applyTheme`, `setThemeChoice`, `setLanguage`, `filterFaq` |
| 5030-5462 | App lock and password reset | `showLockScreen`, `doForgotPassword`, `showForgotPasswordResult`, `finishForgotPasswordFlow`, `retryForgotPasswordFlow` |
| 5463-5864 | Chats and messages | `openChats`, `loadChatsList`, `openConv`, `loadConvMessages`, `quickDoneTask` |
| 5865-5903 | VK adapter inside TG app | VK safe area, haptics, swipe back, storage sync |
| 6137-6190 | Biometric consent JS | `biometricConsentRequired`, `revokeBiometricConsent`, checkbox enablement |

## `vk.html` — VK Mini App

| Диапазон | Блок | Что внутри |
| --- | --- | --- |
| 1-7 | Head scripts | VK bridge |
| 8-222 | CSS | VK layout, auth, cards, tabs, screens |
| 224-481 | HTML | VK auth, home, task detail, ask, calendar, stats, profile |
| 482-1576 | JavaScript | VK auth, tasks, task detail, AI chat, calendar, stats |

### VK JavaScript ranges

| Диапазон | Назначение |
| --- | --- |
| 483-616 | Config, theme, fetch helpers, auth diagnostics |
| 628-848 | Diagnostics, auth token, D1 sync, launch params, warmup |
| 874-955 | VK bridge init and auto-login |
| 960-1218 | Enter app, identities, login/register/logout |
| 1226-1340 | Task loading, rendering, save task from chat |
| 1347-1445 | Task detail discussion |
| 1452-1513 | Navigation and ask chat |
| 1516-1569 | Calendar, stats, toast |

## `privacy.html`

| Диапазон | Блок |
| --- | --- |
| 1-116 | Head and styles |
| 117-229 | Privacy content |

## Common UI rules

- При изменении меню в `index.html` проверять оба nav-компонента: `bottom-nav-v2` внутри `#home` и `global-nav`.
- При правке `index.html` проверять кириллицу до и после.
- При добавлении экрана, функции или крупного CSS-блока обновить эту карту.
