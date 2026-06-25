# FILE MAP UI — index.html / vk.html / privacy.html

Карта пользовательского интерфейса. Используй её, чтобы читать только нужные участки больших HTML-файлов.

## `index.html` — Telegram Mini App

| Диапазон | Блок | Что внутри |
| --- | --- | --- |
| 1-11 | Head scripts | Telegram SDK, VK bridge, marked |
| 12-973 | CSS | Тема, layout, экраны, карточки задач, чаты, профиль, responsive |
| 975-2850 | HTML screens | Все экраны приложения и overlays |
| 2852-5845 | JavaScript | Auth, задачи, AI-чат, календарь, профиль, privacy, lock, chats, VK adapter |

### HTML screens

| Строка | Screen ID | Назначение |
| ---: | --- | --- |
| 981 | `onboarding` | Первый запуск |
| 1128 | `forgot-password` | Запрос сброса пароля |
| 1152 | `reset-password` | Новый пароль по токену |
| 1178 | `login` | Вход и регистрация |
| 1229 | `home` | Главный экран задач |
| 1389 | `write` | Написать сообщение |
| 1424 | `ask` | AI-чат |
| 1459 | `task-detail` | Детали задачи |
| 1592 | `calendar` | Календарь |
| 1629 | `statistics` | Статистика |
| 1681 | `notifications` | Уведомления |
| 1701 | `profile` | Профиль |
| 1731 | `subscription` | Подписка |
| 1811 | `payment` | Оплата |
| 1864 | `payment-success` | Успешная оплата |
| 1888 | `notif-settings` | Настройки уведомлений |
| 1936 | `security` | Безопасность |
| 1982 | `privacy-center` | Центр приватности |
| 2062 | `change-password` | Смена пароля |
| 2095 | `sessions` | Сессии |
| 2130 | `devices` | Устройства |
| 2157 | `login-history` | История входов |
| 2190 | `theme-settings` | Тема |
| 2225 | `language-settings` | Язык |
| 2274 | `support` | Поддержка |
| 2320 | `faq` | FAQ |
| 2369 | `write-support` | Сообщение в поддержку |
| 2403 | `telegram-support` | Telegram-поддержка |
| 2430 | `chats` | Список чатов |
| 2530 | `chat-conv` | Переписка |
| 2559 | `msng-settings` | Настройки мессенджеров |
| 2609 | `new-task` | Новая задача |
| 2643 | `task-confirm` | Подтверждение задачи |
| 2673 | `task-move` | Перенос задачи |
| 2690 | `task-done` | Завершение задачи |
| 2704 | `voice` | Голосовой режим |

### JavaScript ranges

| Диапазон | Назначение | Ключевые функции |
| --- | --- | --- |
| 2852-2933 | Config, tokens, helpers | `getToken`, `authHeaders`, `withTimeout`, `readJsonSafe`, `isVkMiniAppContext` |
| 2934-3178 | App init and auth | `initApp`, `doRegister`, `doLogin`, `loginWithTelegram`, `doLogout` |
| 3179-3309 | Payments and subscription | `selectPlan`, `startPayment`, `launchWidget`, `updateSubscriptionScreen` |
| 3310-3417 | Onboarding, system prompt, trial | `obInit`, `obRender`, `obDone`, `checkTrial` |
| 3418-3681 | Tasks, home, calendar stats | `loadTasks`, `submitQuickAdd`, `renderTasksForMonth`, `loadStats`, `markDoneKV` |
| 3682-3964 | Navigation, notifications, lists, contact | `showScreen`, `setNavActive`, `openAsk`, `openNotifications`, `renderNotifs`, `openFilteredTaskList` |
| 3965-4208 | Task detail and editing | `openTask`, `editDetailField`, `completeTask`, `saveTaskEdits`, `setReminderOnWorker` |
| 4209-4284 | Message generation | `openWrite`, `aiCall`, `generateMessage`, `copyMsg`, `editMsg` |
| 4285-4517 | AI chat and task creation | `loadAskHistoryRemote`, `createTaskFromChat`, `sendAsk`, `showToast` |
| 4518-4630 | Calendar and voice | `renderCalendar`, `selectCalDay`, `openVoice`, `sendVoiceMessage` |
| 4631-4808 | Subscreens and privacy API | `_showSubScreenBase`, `syncD1AuthSession`, `loadPrivacyCenter`, `recordPrivacyConsent` |
| 4809-5006 | Settings | `saveNotifPref`, `savePassword`, `applyTheme`, `setThemeChoice`, `setLanguage`, `filterFaq` |
| 5007-5404 | App lock and password reset | `showLockScreen`, `tryBiometric`, `registerBiometric`, `doForgotPassword`, `doResetPassword` |
| 5405-5806 | Chats and messages | `openChats`, `loadChatsList`, `openConv`, `loadConvMessages`, `convSend`, `quickDoneTask` |
| 5807-5845 | VK adapter inside TG app | VK safe area, haptics, swipe back, storage sync |

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
