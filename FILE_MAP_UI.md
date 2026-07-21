# FILE MAP UI — index.html / vk.html / privacy.html

Карта пользовательского интерфейса. Используй её, чтобы читать только нужные участки больших HTML-файлов.

## `index.html` — Telegram Mini App

| Диапазон | Блок | Что внутри |
| --- | --- | --- |
| 1-55 | Head scripts and stylesheet | Telegram SDK, VK bridge, marked, `styles.min.css` |
| 56-1858 | HTML screens and overlays | Все экраны приложения и overlays |
| 1860-8485 | JavaScript | Auth, задачи, AI-чат, календарь, профиль, privacy, lock, chats, VK adapter |
| 8486-8660 | Biometric consent patch | Screen `biometric-consent`, CSS, localStorage consent gate for voice input |

### HTML screens

| Строка | Screen ID | Назначение |
| ---: | --- | --- |
| 61 | `onboarding` | Первый запуск |
| 209 | `forgot-password` | Запрос сброса пароля |
| 234 | `reset-password` | Новый пароль по токену |
| 264 | `login` | Вход и регистрация; Enter в `login-email`/`login-pass` вызывает `submitLoginOnEnter()` |
| 330 | `home` | Главный экран задач |
| 379 | `write` | Написать сообщение |
| 414 | `ask` | AI-чат |
| 444 | `task-detail` | Детали задачи |
| 504 | `calendar` | Календарь |
| 541 | `statistics` | Статистика |
| 613 | `notifications` | Уведомления |
| 633 | `profile` | Профиль, расширенные поля пользователя |
| 696 | `subscription` | Подписка; feature-list и pricing cards наполняются из `/tariff-config` |
| 776 | `payment` | Оплата; order summary, benefits и payment note зависят от provider + tariff config |
| 829 | `payment-success` | Успешная оплата |
| 853 | `notif-settings` | Живые настройки уведомлений: каналы, брифинг, просрочки |
| 896 | `security` | Безопасность |
| 945 | `privacy-center` | Центр приватности |
| 1025 | `change-password` | Смена пароля |
| 1058 | `sessions` | Сессии |
| 1093 | `devices` | Устройства |
| 1120 | `login-history` | История входов |
| 1153 | `ai-memory` | Экран «Что 4 знает обо мне» |
| 1169 | `theme-settings` | Тема |
| 1204 | `language-settings` | Язык |
| 1253 | `support` | Поддержка |
| 1299 | `faq` | FAQ |
| 1348 | `write-support` | Сообщение в поддержку |
| 1382 | `telegram-support` | Telegram-поддержка |
| 1409 | `chats` | Список чатов |
| 1509 | `chat-conv` | Переписка |
| 1538 | `msng-settings` | Настройки мессенджеров |
| 1588 | `new-task` | Новая задача |
| 1634 | `task-confirm` | Подтверждение задачи |
| 1664 | `task-move` | Перенос задачи |
| 1681 | `task-done` | Завершение задачи |
| 1695 | `voice` | Голосовой режим |
| 8496 | `biometric-consent` | Согласие на обработку голоса по 152-ФЗ |

### JavaScript ranges

| Диапазон | Назначение | Ключевые функции |
| --- | --- | --- |
| 1860-2011 | Config, tokens, helpers | `getToken`, `authHeaders`, `withTimeout`, `readJsonSafe`, Telegram/VK launch helpers |
| 2012-2358 | App init, auth, profile | `initApp`, `doRegister`, `submitLoginOnEnter`, `doLogin`, `loginWithTelegram`, `doLogout`, `renderExtendedProfile`, `saveExtendedProfile` |
| 2359-3019 | Payments and subscription | `DEFAULT_TARIFF_CONFIG`, `loadTariffConfig`, `getPlanConfig`, `renderSubscriptionFeatures`, `renderPricingCards`, `openPayment`, `startPayment`, `launchWidget`, `updateSubscriptionScreen` |
| 3020-5489 | Tasks, home, cards, calendar stats | `loadTasks`, `submitQuickAdd`, `renderTasksForMonth`, `loadStats`, `renderTaskCard`, `markDoneKV` |
| 5490-5852 | Task detail and editing | `loadTaskAdvice`, `openTask`, `completeTask`, `saveTaskEdits`, `setReminderOnWorker` |
| 5853-6048 | Message generation, navigation, notifications | `openWrite`, `aiCall`, `generateMessage`, `copyMsg`, `editMsg`, `showScreen`, `openNotifications` |
| 6049-6869 | AI chat and task creation | `loadAskHistoryRemote`, `normalizeTaskTitle`, `fallbackTaskFromText`, `createTaskFromChat`, `sendAsk`, `showToast` |
| 6870-7056 | Calendar and voice | `renderCalendar`, `selectCalDay`, `openVoice`, `sendVoiceMessage`; voice uses biometric consent gate |
| 7057-8446 | Subscreens, settings, app lock, password reset, chats and messages | `_showSubScreenBase`, `openPrivacyPolicy`, `bindPrivacyPolicyLinks`, `loadPrivacyCenter`, `loadNotificationSettings`, `savePassword`, `showLockScreen`, `openChats`, `loadChatsList`, `openConv`, `loadConvMessages`, `convSend`, `quickDoneTask` |
| 8447-8485 | Task detail soft-glass helpers | `appendDetailHistoryMessage`, detail popover/status/checklist helpers |
| 8486-8660 | Biometric consent JS | `biometricConsentRequired`, `revokeBiometricConsent`, checkbox enablement |

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
