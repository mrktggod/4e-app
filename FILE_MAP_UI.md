# FILE MAP UI — index.html / vk.html / privacy.html

Карта пользовательского интерфейса. Используй её, чтобы читать только нужные участки больших HTML-файлов.

## `index.html` — Telegram Mini App

| Диапазон | Блок | Что внутри |
| --- | --- | --- |
| 1-55 | Head scripts and stylesheet | Telegram SDK, VK bridge, marked, `styles.min.css` |
| 56-1897 | HTML screens and overlays | Все экраны приложения и overlays; focus panel includes daily summary block; AI chat composer includes voice entrypoint |
| 1899-8802 | JavaScript | Auth, задачи, AI-чат, календарь, профиль, privacy, lock, chats, VK adapter |
| 8813-8978 | Biometric consent patch | Screen `biometric-consent`, CSS, localStorage consent gate for voice input |

### HTML screens

| Строка | Screen ID | Назначение |
| ---: | --- | --- |
| 61 | `onboarding` | Первый запуск |
| 209 | `forgot-password` | Запрос сброса пароля |
| 234 | `reset-password` | Новый пароль по токену |
| 264 | `login` | Вход и регистрация; Enter в `login-email`/`login-pass` вызывает `submitLoginOnEnter()` |
| 330 | `home` | Главный экран задач |
| 379 | `write` | Написать сообщение |
| 414 | `ask` | AI-чат; composer has textarea, voice entrypoint and send button |
| 445 | `task-detail` | Детали задачи |
| 505 | `calendar` | Календарь |
| 542 | `statistics` | Статистика |
| 614 | `notifications` | Уведомления |
| 634 | `profile` | Профиль, расширенные поля пользователя |
| 692 | `subscription` | Подписка; feature-list и pricing cards наполняются из `/tariff-config` |
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
| 8837 | `biometric-consent` | Согласие на обработку голоса по 152-ФЗ |

### JavaScript ranges

| Диапазон | Назначение | Ключевые функции |
| --- | --- | --- |
| 1899-2088 | Config, tokens, helpers | `getToken`, `authHeaders`, `withTimeout`, `readJsonSafe`, Premium denial helpers, Telegram/VK launch helpers |
| 2084-2494 | App init, auth, profile | `initApp`, `doRegister`, `submitLoginOnEnter`, `doLogin`, `loginWithTelegram`, `doLogout`, `renderExtendedProfile`, `saveExtendedProfile` |
| 2495-3187 | Payments and subscription | `DEFAULT_TARIFF_CONFIG`, `loadTariffConfig`, `getPlanConfig`, `renderSubscriptionFeatures`, `renderPricingCards`, `openPayment`, `startPayment`, `launchWidget`, `updateSubscriptionScreen` |
| 3188-5055 | Tasks, home, focus panel daily summary, cards, calendar stats | `loadTasks`, `getTaskUiId`, `getTaskCreatedTimestamp`, `formatTaskCreatedMeta`, `getFocusTaskSummary`, `updateHomeDashboardList`, `submitQuickAdd`, `renderFocusPanelSummary`, `renderTasksForMonth`, `loadStats`, `renderTaskCard`, `markDoneKV` |
| 5061-6193 | Task detail and editing | `openTaskById`, `setPendingDetailDeadline`, `confirmDetailDeadline`, `loadTaskAdvice`, `openTask`, `completeTask`, `saveTaskEdits`, `setReminderOnWorker`; return screen is remembered before task-detail open and date/time changes save only on explicit confirm |
| 6194-6282 | Message generation, navigation, notifications | `openWrite`, `aiCall`, `generateMessage`, `copyMsg`, `editMsg`, `showScreen`, `openNotifications` |
| 6283-7105 | AI chat and task creation | `loadAskHistoryRemote`, `normalizeTaskTitle`, `fallbackTaskFromText`, `createTaskFromChat`, `sendAsk`, `showToast` |
| 7106-7346 | Calendar and voice | `renderCalendar`, `selectCalDay`, `openVoice`, `bindAskVoiceEntrypoint`, `sendVoiceMessage`; voice uses Premium and biometric consent gates |
| 7347-8759 | Subscreens, settings, app lock, password reset, chats and messages | `_showSubScreenBase`, `openPrivacyPolicy`, `bindPrivacyPolicyLinks`, `loadPrivacyCenter`, `loadNotificationSettings`, `savePassword`, `showLockScreen`, `openChats`, `loadChatsList`, `openConv`, `loadConvMessages`, `convSend`, `quickDoneTask` completion feedback |
| 8760-8802 | Task detail soft-glass helpers | `appendDetailHistoryMessage`, detail popover/status/checklist/date confirm helpers |
| 8813-8978 | Biometric consent JS | `biometricConsentRequired`, `revokeBiometricConsent`, checkbox enablement |

## `vk.html` — VK Mini App

| Диапазон | Блок | Что внутри |
| --- | --- | --- |
| 1-7 | Head scripts | VK bridge |
| 8-264 | CSS | VK layout, auth, cards, tabs, home focus metadata, profile IA, task-detail summary/edit form, screens |
| 266-589 | HTML | VK auth, home focus/top-task metadata, task detail with summary/edit controls, ask, calendar, stats, profile summary/privacy |
| 591-2022 | JavaScript | VK auth, tasks, profile summary, home parity summary, task detail summary/edit/back behavior, AI chat, local date keys, calendar, stats |

### VK JavaScript ranges

| Диапазон | Назначение |
| --- | --- |
| 569-658 | Config, theme, fetch helpers, auth diagnostics |
| 670-890 | Diagnostics, auth token, D1 sync, launch params, warmup |
| 916-997 | VK bridge init and auto-login |
| 1002-1267 | Enter app, profile/account summary, identities, login/register/logout |
| 1275-1379 | Task loading and shell rendering |
| 1380-1466 | Home focus summary, metric notes, urgent/overdue/next-deadline chips, top task row |
| 1467-1496 | Task list HTML |
| 1497-1588 | Local date-key helpers, task parsing, save task from chat |
| 1641-1795 | Task detail status/priority/return helpers, edit helpers and worker update path |
| 1796-1886 | Task detail render, return behavior, discussion and done action |
| 1887-1960 | Navigation, ask chat, calendar local date grouping, stats |
| 1912-1946 | Stats and home metric notes |
| 1947-1954 | Toast |

## `privacy.html`

| Диапазон | Блок |
| --- | --- |
| 1-116 | Head and styles |
| 117-229 | Privacy content |

## Common UI rules

- При изменении меню в `index.html` проверять оба nav-компонента: `bottom-nav-v2` внутри `#home` и `global-nav`.
- При правке `index.html` проверять кириллицу до и после.
- При добавлении экрана, функции или крупного CSS-блока обновить эту карту.
