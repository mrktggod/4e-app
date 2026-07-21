# FILE MAP UI — index.html / vk.html / privacy.html

Карта пользовательского интерфейса. Используй её, чтобы читать только нужные участки больших HTML-файлов.

## `index.html` — Telegram Mini App

| Диапазон | Блок | Что внутри |
| --- | --- | --- |
| 1-23 | Head scripts and stylesheet | Telegram SDK, VK bridge, marked, `styles.min.css` |
| 24-1841 | HTML screens and overlays | Все экраны приложения и overlays |
| 1842--1 | JavaScript | Auth, задачи, AI-чат, календарь, профиль, privacy, lock, chats, VK adapter |
| 0-8592 | Biometric consent patch | Screen `biometric-consent`, CSS, localStorage consent gate for voice input |

### HTML screens

| Строка | Screen ID | Назначение |
| ---: | --- | --- |
| 37 | `onboarding` | Первый запуск |
| 185 | `forgot-password` | Запрос сброса пароля |
| 210 | `reset-password` | Новый пароль по токену |
| 240 | `login` | Вход и регистрация; Enter в `login-email`/`login-pass` вызывает `submitLoginOnEnter()` |
| 306 | `home` | Главный экран задач |
| 355 | `write` | Написать сообщение |
| 390 | `ask` | AI-чат |
| 420 | `task-detail` | Детали задачи |
| 480 | `calendar` | Календарь |
| 517 | `statistics` | Статистика |
| 589 | `notifications` | Уведомления |
| 609 | `profile` | Профиль, расширенные поля пользователя |
| 672 | `subscription` | Подписка; feature-list и pricing cards наполняются из `/tariff-config` |
| 752 | `payment` | Оплата; order summary, benefits и payment note зависят от provider + tariff config |
| 805 | `payment-success` | Успешная оплата |
| 829 | `notif-settings` | Живые настройки уведомлений: каналы, брифинг, просрочки |
| 872 | `security` | Безопасность |
| 921 | `privacy-center` | Центр приватности |
| 1001 | `change-password` | Смена пароля |
| 1034 | `sessions` | Сессии |
| 1069 | `devices` | Устройства |
| 1096 | `login-history` | История входов |
| 1129 | `ai-memory` | Экран «Что 4 знает обо мне» |
| 1145 | `theme-settings` | Тема |
| 1180 | `language-settings` | Язык |
| 1229 | `support` | Поддержка |
| 1275 | `faq` | FAQ |
| 1324 | `write-support` | Сообщение в поддержку |
| 1358 | `telegram-support` | Telegram-поддержка |
| 1385 | `chats` | Список чатов |
| 1485 | `chat-conv` | Переписка |
| 1514 | `msng-settings` | Настройки мессенджеров |
| 1564 | `new-task` | Новая задача |
| 1610 | `task-confirm` | Подтверждение задачи |
| 1640 | `task-move` | Перенос задачи |
| 1657 | `task-done` | Завершение задачи |
| 1671 | `voice` | Голосовой режим |
| 8426 | `biometric-consent` | Согласие на обработку голоса по 152-ФЗ |

### JavaScript ranges

| Диапазон | Назначение | Ключевые функции |
| --- | --- | --- |
| 1842-1936 | Config, tokens, helpers | `getToken`, `authHeaders`, `withTimeout`, `readJsonSafe`, Telegram/VK launch helpers |
| 1937-2328 | App init, auth, profile | `initApp`, `doRegister`, `submitLoginOnEnter`, `doLogin`, `loginWithTelegram`, `doLogout`, `renderExtendedProfile`, `saveExtendedProfile` |
| 2329-3019 | Payments and subscription | `DEFAULT_TARIFF_CONFIG`, `loadTariffConfig`, `getPlanConfig`, `renderSubscriptionFeatures`, `renderPricingCards`, `openPayment`, `startPayment`, `launchWidget`, `updateSubscriptionScreen` |
| 3020-5487 | Tasks, home, cards, calendar stats | `loadTasks`, `submitQuickAdd`, `renderTasksForMonth`, `loadStats`, `renderTaskCard`, `markDoneKV` |
| 5488-5850 | Task detail and editing | `loadTaskAdvice`, `openTask`, `completeTask`, `saveTaskEdits`, `setReminderOnWorker` |
| 5851-6492 | Message generation, navigation, notifications | `openWrite`, `aiCall`, `generateMessage`, `copyMsg`, `editMsg`, `showScreen`, `openNotifications` |
| 6493-6735 | AI chat and task creation | `loadAskHistoryRemote`, `createTaskFromChat`, `sendAsk`, `showToast` |
| 6736-6896 | Calendar and voice | `renderCalendar`, `selectCalDay`, `openVoice`, `sendVoiceMessage`; voice uses biometric consent gate |
| 5431-5678 | Subscreens, privacy API, notification prefs | `_showSubScreenBase`, `loadPrivacyCenter`, `loadNotificationSettings`, `saveNotifPref` |
| 5678-5822 | Settings | `savePassword`, `applyTheme`, `setThemeChoice`, `setLanguage`, `filterFaq` |
| 5842-6193 | App lock and password reset | `showLockScreen`, `tryBiometric`, `registerBiometric`, `doForgotPassword`, `doResetPassword` |
| 6897-8376 | Subscreens, settings, app lock, password reset, chats and messages | `_showSubScreenBase`, `openPrivacyPolicy`, `bindPrivacyPolicyLinks`, `savePassword`, `showLockScreen`, `openChats`, `loadChatsList`, `openConv`, `loadConvMessages`, `convSend`, `quickDoneTask` |
| 8377--1 | Task detail soft-glass helpers | `appendDetailHistoryMessage`, detail popover/status/checklist helpers |
| 0-8592 | Biometric consent JS | `biometricConsentRequired`, `revokeBiometricConsent`, checkbox enablement |

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
