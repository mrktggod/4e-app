# FILE MAP UI — index.html / vk.html / privacy.html

Карта пользовательского интерфейса. Используй её, чтобы читать только нужные участки больших HTML-файлов.

## `index.html` — Telegram Mini App

| Диапазон | Блок | Что внутри |
| --- | --- | --- |
| 1-11 | Head scripts | Telegram SDK, VK bridge, marked |
| 12-970 | CSS | Тема, layout, экраны, карточки задач, чаты, профиль, responsive |
| 972-2844 | HTML screens | Все экраны приложения и overlays |
| 2846-5802 | JavaScript | Auth, задачи, AI-чат, календарь, профиль, privacy, lock, chats, VK adapter |

### HTML screens

| Строка | Screen ID | Назначение |
| ---: | --- | --- |
| 976 | `onboarding` | Первый запуск |
| 1123 | `forgot-password` | Запрос сброса пароля |
| 1146 | `reset-password` | Новый пароль по токену |
| 1172 | `login` | Вход и регистрация |
| 1223 | `home` | Главный экран задач |
| 1383 | `write` | Написать сообщение |
| 1418 | `ask` | AI-чат |
| 1453 | `task-detail` | Детали задачи |
| 1586 | `calendar` | Календарь |
| 1623 | `statistics` | Статистика |
| 1675 | `notifications` | Уведомления |
| 1695 | `profile` | Профиль |
| 1725 | `subscription` | Подписка |
| 1805 | `payment` | Оплата |
| 1858 | `payment-success` | Успешная оплата |
| 1882 | `notif-settings` | Настройки уведомлений |
| 1930 | `security` | Безопасность |
| 1976 | `privacy-center` | Центр приватности |
| 2056 | `change-password` | Смена пароля |
| 2089 | `sessions` | Сессии |
| 2124 | `devices` | Устройства |
| 2151 | `login-history` | История входов |
| 2184 | `theme-settings` | Тема |
| 2219 | `language-settings` | Язык |
| 2268 | `support` | Поддержка |
| 2314 | `faq` | FAQ |
| 2363 | `write-support` | Сообщение в поддержку |
| 2397 | `telegram-support` | Telegram-поддержка |
| 2424 | `chats` | Список чатов |
| 2524 | `chat-conv` | Переписка |
| 2553 | `msng-settings` | Настройки мессенджеров |
| 2603 | `new-task` | Новая задача |
| 2637 | `task-confirm` | Подтверждение задачи |
| 2667 | `task-move` | Перенос задачи |
| 2684 | `task-done` | Завершение задачи |
| 2698 | `voice` | Голосовой режим |

### JavaScript ranges

| Диапазон | Назначение | Ключевые функции |
| --- | --- | --- |
| 2846-2926 | Config, tokens, helpers | `getToken`, `authHeaders`, `withTimeout`, `readJsonSafe`, `isVkMiniAppContext` |
| 2927-3168 | App init and auth | `initApp`, `doRegister`, `doLogin`, `loginWithTelegram`, `doLogout` |
| 3169-3299 | Payments and subscription | `selectPlan`, `startPayment`, `launchWidget`, `updateSubscriptionScreen` |
| 3300-3399 | Onboarding, system prompt, trial | `obInit`, `obRender`, `obDone`, `checkTrial` |
| 3400-3666 | Tasks, home, calendar stats | `loadTasks`, `submitQuickAdd`, `renderTasksForMonth`, `loadStats`, `markDoneKV` |
| 3667-3929 | Navigation, notifications, lists, contact | `showScreen`, `setNavActive`, `openAsk`, `openNotifications`, `renderNotifs`, `openFilteredTaskList` |
| 3930-4198 | Task detail and editing | `openTask`, `editDetailField`, `completeTask`, `saveTaskEdits`, `setReminderOnWorker` |
| 4199-4274 | Message generation | `openWrite`, `aiCall`, `generateMessage`, `copyMsg`, `editMsg` |
| 4275-4507 | AI chat and task creation | `loadAskHistoryRemote`, `createTaskFromChat`, `sendAsk`, `showToast` |
| 4508-4620 | Calendar and voice | `renderCalendar`, `selectCalDay`, `openVoice`, `sendVoiceMessage` |
| 4621-4798 | Subscreens and privacy API | `_showSubScreenBase`, `syncD1AuthSession`, `loadPrivacyCenter`, `recordPrivacyConsent` |
| 4799-4996 | Settings | `saveNotifPref`, `savePassword`, `applyTheme`, `setThemeChoice`, `setLanguage`, `filterFaq` |
| 4997-5362 | App lock and password reset | `showLockScreen`, `tryBiometric`, `registerBiometric`, `doForgotPassword`, `doResetPassword` |
| 5363-5758 | Chats and messages | `openChats`, `loadChatsList`, `openConv`, `loadConvMessages`, `convSend`, `quickDoneTask` |
| 5759-5802 | VK adapter inside TG app | VK safe area, haptics, swipe back, storage sync |

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
