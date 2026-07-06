# FILE MAP UI — index.html / vk.html / privacy.html

Карта пользовательского интерфейса. Используй её, чтобы читать только нужные участки больших HTML-файлов.

## `index.html` — Telegram Mini App

| Диапазон | Блок | Что внутри |
| --- | --- | --- |
| 1-13 | Head scripts and stylesheet | Telegram SDK, VK bridge, marked, `styles.min.css` |
| 14-2054 | HTML screens and overlays | Все экраны приложения и overlays |
| 2055-6722 | JavaScript | Auth, задачи, AI-чат, календарь, профиль, privacy, lock, chats, VK adapter |
| 6723-6877 | Biometric consent patch | Screen `biometric-consent`, CSS, localStorage consent gate for voice input |

### HTML screens

| Строка | Screen ID | Назначение |
| ---: | --- | --- |
| 18 | `onboarding` | Первый запуск |
| 166 | `forgot-password` | Запрос сброса пароля |
| 190 | `reset-password` | Новый пароль по токену |
| 216 | `login` | Вход и регистрация; Enter в `login-email`/`login-pass` вызывает `submitLoginOnEnter()` |
| 268 | `home` | Главный экран задач |
| 488 | `write` | Написать сообщение |
| 523 | `ask` | AI-чат |
| 558 | `task-detail` | Детали задачи |
| 736 | `calendar` | Календарь |
| 773 | `statistics` | Статистика |
| 825 | `notifications` | Уведомления |
| 845 | `profile` | Профиль, расширенные поля пользователя |
| 911 | `subscription` | Подписка; feature-list и pricing cards наполняются из `/tariff-config` |
| 991 | `payment` | Оплата; order summary, benefits и payment note зависят от provider + tariff config |
| 1044 | `payment-success` | Успешная оплата |
| 1068 | `notif-settings` | Живые настройки уведомлений: каналы, брифинг, просрочки |
| 1107 | `security` | Безопасность |
| 1156 | `privacy-center` | Центр приватности |
| 1236 | `change-password` | Смена пароля |
| 1269 | `sessions` | Сессии |
| 1304 | `devices` | Устройства |
| 1331 | `login-history` | История входов |
| 1364 | `ai-memory` | Экран «Что 4 знает обо мне» |
| 1380 | `theme-settings` | Тема |
| 1415 | `language-settings` | Язык |
| 1464 | `support` | Поддержка |
| 1510 | `faq` | FAQ |
| 1559 | `write-support` | Сообщение в поддержку |
| 1593 | `telegram-support` | Telegram-поддержка |
| 1620 | `chats` | Список чатов |
| 1720 | `chat-conv` | Переписка |
| 1749 | `msng-settings` | Настройки мессенджеров |
| 1799 | `new-task` | Новая задача |
| 1845 | `task-confirm` | Подтверждение задачи |
| 1875 | `task-move` | Перенос задачи |
| 1892 | `task-done` | Завершение задачи |
| 1906 | `voice` | Голосовой режим |
| 6733 | `biometric-consent` | Согласие на обработку голоса по 152-ФЗ |

### JavaScript ranges

| Диапазон | Назначение | Ключевые функции |
| --- | --- | --- |
| 2055-2224 | Config, tokens, helpers | `getToken`, `authHeaders`, `withTimeout`, `readJsonSafe`, `isVkMiniAppContext`, Telegram/VK launch helpers |
| 2225-2800 | App init, auth, profile | `initApp`, `doRegister`, `submitLoginOnEnter`, `doLogin`, `loginWithTelegram`, `doLogout`, `renderExtendedProfile`, `saveExtendedProfile` |
| 2808-3220 | Payments and subscription | `DEFAULT_TARIFF_CONFIG`, `loadTariffConfig`, `getPlanConfig`, `renderSubscriptionFeatures`, `renderPricingCards`, `openPayment`, `startPayment`, `launchWidget`, `updateSubscriptionScreen` |
| 3232-3332 | Onboarding and trial | `obInit`, `obRender`, `obDone`, `checkTrial` |
| 3341-4178 | Tasks, home, cards, calendar stats | `loadTasks`, `submitQuickAdd`, `renderTasksForMonth`, `loadStats`, `renderTaskCard`, `markDoneKV` |
| 4180-4552 | Navigation, notifications, lists, contact | `showScreen`, `setNavActive`, `openAsk`, `openNotifications`, `renderNotifs`, `openFilteredTaskList`, `openDetailContactPanel` |
| 4552-4903 | Task detail and editing | `loadTaskAdvice`, `openTask`, `completeTask`, `saveTaskEdits`, `setReminderOnWorker` |
| 4919-4955 | Message generation | `openWrite`, `aiCall`, `generateMessage`, `copyMsg`, `editMsg` |
| 4963-5299 | AI chat and task creation | `loadAskHistoryRemote`, `createTaskFromChat`, `sendAsk`, `showToast` |
| 5322-5428 | Calendar and voice | `renderCalendar`, `selectCalDay`, `openVoice`, `sendVoiceMessage`; voice uses biometric consent gate |
| 5431-5678 | Subscreens, privacy API, notification prefs | `_showSubScreenBase`, `loadPrivacyCenter`, `loadNotificationSettings`, `saveNotifPref` |
| 5678-5822 | Settings | `savePassword`, `applyTheme`, `setThemeChoice`, `setLanguage`, `filterFaq` |
| 5842-6193 | App lock and password reset | `showLockScreen`, `tryBiometric`, `registerBiometric`, `doForgotPassword`, `doResetPassword` |
| 6229-6659 | Chats and messages | `openChats`, `loadChatsList`, `openConv`, `loadConvMessages`, `convSend`, `quickDoneTask` |
| 6792-6854 | Biometric consent JS | `biometricConsentRequired`, `revokeBiometricConsent`, checkbox enablement |

## `vk.html` — VK Mini App

| Диапазон | Блок | Что внутри |
| --- | --- | --- |
| 1-7 | Head scripts | VK bridge |
| 8-222 | CSS | VK layout, auth, cards, tabs, screens |
| 224-481 | HTML | VK auth, home, task detail, ask, calendar, stats, profile |
| 482-1622 | JavaScript | VK auth, tasks, task detail, AI chat, calendar, stats |

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
