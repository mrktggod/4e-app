# Bugs

## Быстрый формат для чата

Когда находишь баг, не нужно сразу оформлять техническую задачу. Достаточно написать в чат так:

```text
БАГ:
Где: экран / страница / действие
Что сделал:
Что произошло:
Как должно быть:
Насколько мешает: блокирует / сильно / терпимо / косметика
Скрин/видео: если есть
```

Если деталей не хватает, агент задаёт уточняющие вопросы и сам доводит запись до полноценного формата ниже.

## Процесс обработки

1. Пользователь заносит наблюдения в чат или в раздел "Входящие".
2. Агент отделяет баги от улучшений, вопросов и идей.
3. Для каждого бага агент присваивает ID, Severity, Priority и статус `Triaged`.
4. Критичные баги попадают в "Активные" и затем превращаются в задачи для разработки.
5. После исправления баг переносится в "Готовы к проверке".
6. После проверки баг переносится в "Закрытые".
7. Значимые баги и системные проблемы добавляются в roadmap как отдельное направление или риск.

### Когда заводим баг в Linear

Заводим отдельную задачу в Linear, если баг нужно брать в разработку, планировать в спринт или отслеживать до релиза:

- `P0/P1`, блокирует вход, оплату, задачи, AI-чат, сохранение данных или другой ключевой сценарий.
- Баг повторяется, влияет на нескольких пользователей или уже подтверждён тестом.
- Исправление требует кода, деплоя, отдельной ветки или работы нескольких зон: app, worker, bot, база, платежи.
- Нужно назначить владельца, срок, PR, QA-проверку или привязать баг к релизу.

Оставляем только в `pm/bugs.md`, если это входящая заметка, единичное наблюдение без воспроизведения, косметика без влияния на ключевой сценарий, дубль уже заведённой задачи или вопрос, который сначала нужно уточнить. После подтверждения такой баг можно повысить до Linear.

## Входящие

Сюда можно быстро складывать сырые заметки до триажа.

| Дата | Наблюдение | Где | Вложения | Статус |
| --- | --- | --- | --- | --- |

## Как заносить баг

Копируй блок ниже, заполняй фактами и не смешивай несколько проблем в один баг.

```text
ID:
Заголовок:
Дата:
Версия/окружение:
Severity: Critical / High / Medium / Low
Priority: P0 / P1 / P2 / P3
Статус: New / Triaged / In Progress / Ready for QA / Done / Won't Fix

Шаги воспроизведения:
1.
2.
3.

Фактический результат:

Ожидаемый результат:

Вложения/логи:

Решение:

Проверка после фикса:
```

## Активные

| ID | Баг | Severity | Priority | Статус | Владелец | BACK-xxx | Ссылка/заметка |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BUG-2026-07-22-001 | На iPhone/TMA не нажимается выбор времени уведомления в карточке задачи | High | P1 | Ready for re-QA after real-device FAIL | Codex | BACK-064 | Real iPhone acceptance 2026-07-23 показал, что первый structural fix был неполным: в dark trigger фактически не давал выбрать вариант, а в light popup сжимал кнопки до 44px, переносил текст по 1-2 символа и пропускал tap в карточку под ним. Root cause: поздний `.detail-redesign-tags button` применял круглый 44x44 размер к вложенным reminder options; родитель `.detail-redesign-tags` оставался `overflow:hidden`, поэтому popup не участвовал в hit-test за границами строки тегов; light theme отдельно уменьшала bell до 38px. Follow-up fix ограничивает круглый размер прямыми дочерними action-кнопками, поднимает/open-overflow stacking context, делает варианты 140x44 с горизонтальным текстом и возвращает light trigger 44x44. Усиленный `npm run smoke:back067-reminder` проверяет dark/light geometry и `elementFromPoint` hit ownership. Нужен повторный iPhone smoke на `https://qa-reminder-popover.4-ai-staging.pages.dev/`. Report: `pm/outbox/REPORT-BUG-2026-07-22-001-reminder-popover-followup-2026-07-23.md`. |
| BUG-2026-07-22-002 | Tag popup и клавиатура перекрывают карточку задачи в iOS TMA | High | P1 | Ready for QA / headless mobile smoke green | Codex | N/A | Исправлено в app: `index.html:464` больше не использует native `<datalist>` для tag editor; подсказки тегов теперь app-owned `div#detail-tag-options`, есть явная `Отмена`, outside click и Escape close с focus restore. `styles/screens/tasks.less:1477` держит controlled suggestions компактными; `npm run smoke:back068-tag-popup` на 390x844 подтвердил viewport fit, выбор `#Дом`, добавление тега и закрытие. Real iPhone/TMA keyboard smoke остаётся QA-tail. Evidence: `docs/tasks/BUG-2026-07-22-task-detail-ios-regressions.md`; report `pm/outbox/REPORT-BRIEF-2026-07-22-32-task-tag-popup-ios.md`. |
| BUG-2026-07-22-003 | Длинный тег/заголовок перекрывают срок и приоритет, текст обрезается | High | P1 | Ready for QA / headless mobile smoke green | Codex | N/A | Исправлено в CSS: task-detail hero больше не держит title/description на absolute координатах/fixed cap в финальном mobile guard; title/description возвращены в normal flow, long tag держится одной строкой с ellipsis, meta cards получают правый reserve. Raw proof: `npm run smoke:back069-hero` на 390x844 подтвердил no horizontal overflow, tag `nowrap`, title `position=static`, hero height `330`, no overlap with date/priority cards. Real iPhone/TMA visual smoke остаётся QA-tail. Evidence: `docs/tasks/BUG-2026-07-22-task-detail-ios-regressions.md`; report `pm/outbox/REPORT-BRIEF-2026-07-22-33-task-detail-hero-overflow-ios.md`. |
| BUG-2026-07-21-001 | Policy link in auth/register agreement does not open privacy document | High | P1 | Ready for QA | Codex | BACK-061 | QA-001 public smoke on `https://app.4-ai.site/`: direct `/privacy.html` returns the privacy page, but clicking `Политикой конфиденциальности` from login/register agreement keeps the user on app root. App fix added explicit `openPrivacyPolicy()` binding for auth/onboarding legal links; QA needs live click check on next deploy. Source: draft PR `mrktggod/qb2b#1`. |
| BUG-2026-07-21-002 | Auth legal agreement copy has low contrast on dark background | Medium | P2 | Ready for QA | Codex | BACK-062 | QA-001 public smoke: secondary legal text under auth buttons is about 11px and low-contrast (`rgba(242,245,233,0.35)`), below WCAG AA for normal text. App fix raises legal copy to 13px `var(--text2)` and keeps privacy link green. Needs live dark/light auth check. Source: draft PR `mrktggod/qb2b#1`. |
| BUG-2026-07-21-003 | Auth legal/tabs/password-eye hit areas are below mobile touch target | Medium | P2 | Ready for QA | Codex | BACK-062 | QA-001 public smoke: login/register tabs are about 156x33, password-eye about 40x40, policy link visible area about 168x12. App fix gives privacy link, tabs, forgot-link and password-eye at least 44px hit area. Needs browser/touch QA. Source: draft PR `mrktggod/qb2b#1`. |
| BUG-2026-07-21-004 | Desktop public web presents narrow mobile-only column with no desktop guidance | Medium | P2 | NEED-YURI | Юрий + Алексей | BACK-063 | QA-001 public smoke at 1363x936: app stays a narrow mobile column with large empty field. If `app.4-ai.site` is public desktop entrypoint, decide between explicit mobile-only/QR guidance or a desktop shell; no code before product decision. Source: draft PR `mrktggod/qb2b#1`. |
| BUG-2026-07-20-001 | Login wrong password shows toast but leaves password inline error empty | Medium | P1 | NEED-CLAUDE | Claude | N/A | Live staging fresh account: API returns `400 {"ok":false,"error":"Неверный email или пароль"}`, UI stays on login with toast but `#login-pass-error` empty. Root cause candidate: `scripts/auth.js:170-180` searches inside `input.parentElement`, while `index.html:260-267` places password error outside `.password-field`; see `pm/outbox/REPORT-BRIEF-2026-07-20-morning-refine-01-auth-avatar-login-diagnose.md`. |
| BUG-2026-07-20-002 | Profile avatar leaks from one web account to the next in the same browser | High | P1 | NEED-CLAUDE | Claude | N/A | Live staging fresh accounts A/B: after A stores avatar draft and logs out, B logs in with the same `extendedProfileDraft.photoDataUrl` as home avatar. Root cause candidate: global `EXT_PROFILE_K='extendedProfileDraft'` at `index.html:2032` plus `doLogout()` does not clear/scope it; see outbox report. |
| BUG-2026-07-20-003 | Profile avatar saved in web does not persist in a fresh browser | Medium | P1 | NEED-CLAUDE | Claude | N/A | Live staging fresh account A: same browser shows local data-url avatar, fresh browser login for the same account returns no avatar. Root cause candidate: `handleProfilePhotoChange()` stores only local `draft.photoDataUrl` and `saveExtendedProfile()` only writes localStorage; see outbox report. |

| BUG-2026-07-21-008 | При автологине кратко показывается экран входа / есть задержка перед приложением | Medium | P2 | Confirmed / brief flicker | Codex | N/A | Ручная проверка Алексея 2026-07-22 на точной сборке `b7076e2`, `https://qa-b7076e2.4-ai-staging.pages.dev/`: сохранённая авторизация работает и приложение входит автоматически, но экран входа очень быстро мелькает перед главным экраном. Это не блокер, но заметный auth-shell скачок. Направление фикса: не рендерить login до завершения раннего auth bootstrap либо показывать нейтральный splash до результата `/auth/me`. |
| BUG-2026-07-21-007 | Кнопка подписки на staging не открывает страницу | Medium | P1 | Done / current preview green | Codex | BACK-010 / BACK-040 | Исходный сбой был замечен Алексеем на общем `https://4-ai-staging.pages.dev/`. Повторная ручная проверка 2026-07-22 на точной сборке `b7076e2`, `https://qa-b7076e2.4-ai-staging.pages.dev/`: кнопка подписки открыла платёжную форму до шага ввода карты. Реальный платёж не выполнялся; payment completion остаётся отдельным manual gate. |
| BUG-2026-07-21-006 | Уведомления плохо видны и иногда не срабатывают | High | P1 | BLOCKED-UI / NEED-YURI after fix | Codex / Yuri QA | BACK-064 | Со слов Алексея: уведомления есть, но их особо не видно, иногда они не срабатывают. Real-device smoke 2026-07-22 остановлен: в iPhone/TMA не нажимается выбор времени уведомления (`BUG-2026-07-22-001`). После UI-фикса всё ещё нужен real Telegram/device delivery smoke, звук/вибрация и проверка правильного пользователя. `BACK-055` закрывал action-feed карточки, но не real delivery/salience. |
| BUG-2026-07-21-005 | Пропадает часть истории чата | High | P1 | Needs extended repro / short persistence green | Codex | N/A | Исходный сигнал Алексея: "стерлась часть чата, пропала просто". Ручная проверка 2026-07-22 на `b7076e2`: тестовое сообщение в AI-чате и видимая история сохранились после полного закрытия и повторного открытия приложения. Короткий persistence-flow зелёный, но длинная история не проверена. Первичный code read: AI-чат ограничен `ASK_HISTORY_MAX = 40` и remote `/ai/messages?limit=40`; task chat также грузится с `limit=40`. Нужен отдельный тест истории длиннее 40 сообщений и уточнение исходной поверхности (`ask`, task chat или group chat) перед закрытием бага. |
| BUG-2026-07-20-001 | Login wrong password shows toast but leaves password inline error empty | Medium | P1 | Ready for QA / manually green once | Claude | N/A | Original live staging fresh account: API returned `400 {"ok":false,"error":"Неверный email или пароль"}`, UI stayed on login with toast but `#login-pass-error` empty. Root cause candidate: `scripts/auth.js:170-180` searches inside `input.parentElement`, while `index.html:260-267` places password error outside `.password-field`; see outbox report. 2026-07-21 Alexey manual recheck on staging: `Неверный пароль: ошибка видна`. Keep one repeat/fresh-account check before Done. |
| BUG-2026-07-20-002 | Profile avatar leaks from one web account to the next in the same browser | High | P1 | NEED-CLAUDE / blocked by disabled avatar UI | Claude | N/A | Live staging fresh accounts A/B: after A stores avatar draft and logs out, B logs in with the same `extendedProfileDraft.photoDataUrl` as home avatar. Root cause candidate: global `EXT_PROFILE_K='extendedProfileDraft'` at `index.html:2032` plus `doLogout()` does not clear/scope it; see outbox report. 2026-07-21 Alexey manual recheck could not set a new avatar: app says the function is not working yet, so leak scenario was not re-tested. |
| BUG-2026-07-20-003 | Profile avatar saved in web does not persist in a fresh browser | Medium | P1 | NEED-CLAUDE / blocked by disabled avatar UI | Claude | N/A | Live staging fresh account A: same browser shows local data-url avatar, fresh browser login for the same account returns no avatar. Root cause candidate: `handleProfilePhotoChange()` stores only local `draft.photoDataUrl` and `saveExtendedProfile()` only writes localStorage; see outbox report. 2026-07-21 Alexey manual recheck could not set a new avatar: app says the function is not working yet, so fresh-browser persistence was not re-tested. |
| BUG-2026-07-14-001 | Staging web auth показывает «Нет соединения» после успешных /auth/register и /auth/login | High | P1 | Done | Codex | N/A | 2026-07-14 ночной staging-smoke добит до конца: свежий browser-run на `https://4-ai-staging.pages.dev/` после уже внесённых фиксов (`getProfileReferralLink()` + полный `window.*` export в `scripts/auth.js`) проходит оба реальных UI-сценария — `Регистрация` и `Войти` — без `ReferenceError` и без toast `Нет соединения`. После submit экран переходит на home (`Сегодня`, avatar, календарь/голос/AI nav), а в console остаются только штатные Telegram warnings про `Changing swipes behavior`, без auth-runtime ошибок. Отдельно подтверждено, что ранний сигнал `typeof window.processOAuthCallback === 'undefined'` был артефактом browser-runtime Codex, а не живым состоянием staging. 2026-07-15 fresh Pages deploy https://44ccd355.4-ai-staging.pages.dev plus browser smoke confirmed auth shell green: /auth/me 200, currentUser/chatId set, screen is home, no ReferenceError and no failed requests. |
| BUG-2026-07-14-002 | Staging worker /analytics/lite-event отвечает 404 | Medium | P1 | Done | Codex | ANALYTICS-001 | На live staging 2026-07-14 баг в текущем состоянии не воспроизводится: Pages `https://4-ai-staging.pages.dev/` сейчас указывает на `const WORKER='https://restless-lab-d737-staging.shelckograff.workers.dev'`, прямой API smoke `register -> login -> POST /analytics/lite-event` возвращает `200 {ok:true}`, а свежий home-browser run не показывает console-ошибок вокруг `trackLiteEvent('plan-view')`. Admin `/analytics/summary` без `x-admin-secret` по-прежнему отвечает `401 Unauthorized`, поэтому доставка в summary остаётся отдельной QA/админ-проверкой, но сам старый `404` больше не подтверждается. |
| BUG-2026-07-14-004 | AI quick action «Статистика» в чате 4 возвращает validation error вместо ответа/экрана | Medium | P2 | Done | Codex | NEW-002 / HOME-001 | Root cause был во фронте: `sendAsk()` отправлял в Anthropic `messages` прямо из `askHistory`, включая запрещённое поле `id`. На 2026-07-15 в `.tmp-4e-app-publish/index.html` добавлена `sanitizeClaudeMessages()`, staging Pages вручную обновлён на `https://73d33de6.4-ai-staging.pages.dev`, и live smoke подтвердил зелёный path: прямой `/anthropic` с тем же prompt даёт `200`, в браузере больше нет `messages.0.id` / `validation_error`, а `Статистика` снова видит реальные задачи аккаунта. |
| BUG-2026-07-14-005 | Календарь не показывает дедлайн задачи даже после явного выбора дня | Medium | P2 | Done | Codex | NEW-021 | Ночной staging-smoke 2026-07-14 воспроизводил баг на задаче, где home уже видел дедлайн, а календарь — нет. На 2026-07-15 подтверждён root cause: calendar path использовал собственный parser и не понимал относительные сроки вроде `сегодня/завтра`, хотя остальной UI уже жил на `parseTaskDate()`. В `parseCalendarTaskDeadline()` добавлен общий parser, staging Pages вручную обновлён на `https://73d33de6.4-ai-staging.pages.dev`, и live smoke с задачей `Smoke calendar task` (`deadline: сегодня`) теперь показывает её в `Все дедлайны` как `сегодня / Я — Smoke calendar task`. 2026-07-15 smoke on https://44ccd355.4-ai-staging.pages.dev confirmed calendar default 'Все дедлайны' contains seeded active deadlines without day click. |
| BUG-2026-07-15-001 | AI-чат уточняет задачу до создания вместо task-first сохранения | High | P1 | Done | Codex | SMART-004 | Root cause был в самом фронтовом flow: в `sendAsk()` task-intent fallback создавал задачу только после ответа модели и дополнительно блокировался локальным clarify-шагом, который запускался до `createTaskFromChat()`. Из-за этого AI мог сначала задавать уточнение и не сохранять сам интент. На 2026-07-15 task-intent path переведён в режим create-first: `<create_task>` и `looksLikeTaskRequest()` теперь создают задачу сразу, а подтверждение prepend-ится перед AI-ответом. Для фразы `сделать текст завтра` live smoke на `https://1103d926.4-ai-staging.pages.dev` дал `✅ Задача «Сделать текст» добавлена`, а тот же аккаунт сразу видит в `/tasks` запись `Сделать текст` с `deadline: завтра`, `source: ai_chat`, `originalMsg: сделать текст завтра`. |
| BUG-2026-07-15-002 | Composer AI-чата уезжает под нижнее меню | Medium | P2 | Done | Codex | N/A | На live mobile smoke root cause подтверждён пиксельно: до отправки сообщения `ask`-экран держал `global-nav` скрытым, а после blur/send keyboard-close path снова снимал `hidden`, хотя экран оставался `ask`; в итоге bottom-nav ложился поверх composer (`overlap=64px` на viewport 390x844). На 2026-07-15 AI-чат помечен как `screen--no-bottom-nav`, JS больше не размораживает nav для `ask`, а `styles.css` / `styles.min.css` получили ask-specific padding без нижнего nav reserve. Повторный live smoke на `https://1103d926.4-ai-staging.pages.dev` показывает `navHidden=true` и `overlap=0` и до, и после отправки. |
| BUG-2026-07-15-003 | `/analytics/summary` не отражает lite-события, хотя `/analytics/lite-event` отвечает `200` | High | P1 | Done | Codex | ANALYTICS-001 / BACK-038 | Root cause подтверждён и исправлен на staging 2026-07-15: email-auth пользователи сохранялись только в KV (`saveUser()`), а analytics-summary / `audit_events` жили в D1, поэтому `recordAuditEvent()` не мог честно собирать e2e activation path. В `4e-worker/worker.js` добавлен узкий D1 shadow-sync профиля из `saveUser()`, staging worker задеплоен, и live smoke на `https://restless-lab-d737-staging.shelckograff.workers.dev` теперь зелёный: до smoke `users.total=10`, `auditEvents.total=0`; после fresh register + `plan-view` + `focus-open` + `statistics-open` summary даёт `users.total=11`, `auditEvents.total=4`, `activation.auth.register.d1=1`, `dailyValue.planView/focusOpen/statisticsOpen = 1/1/1`. Прямой `wrangler d1 execute --env staging` подтвердил `audit_events.total=5`, `register=2`, `lite-plan/focus/statistics = 1/1/1` после репликации. |
| BUG-2026-07-15-004 | На staging нет admin-fixture path для expired-user, из-за чего BACK-059 нельзя честно прогнать | Medium | P1 | Done | Codex | BACK-059 | На staging 2026-07-15 добавлен узкий reversible admin-only fixture path `PUT /admin/users/:id/fixture/expired`, доступный только при staging `APP_BASE_URL`. Endpoint сохраняет backup user-state в KV, переводит `trialEndsAt` и `entitlement.accessUntil` в прошлое, а `mode=revert` откатывает исходные данные. Live smoke подтверждён реальным gated path `POST /auth/link-telegram`: до fixture `200`, после `mode=apply` endpoint возвращает `403`, после `mode=revert` снова `200`. Gate-логика (`hasPremiumAccess` / entitlement decision) не менялась. |
| BUG-2026-07-15-005 | Worker bot-path принимал `x-action=save-task` без `x-bot-signature` / `x-bot-timestamp` / `x-bot-nonce` | High | P1 | Done | Codex | BACK-060 | Original finding: unsigned sessionless bot-style `save-task` with `telegramUserId=7000002294` could create a task for a linked user. Final fix is tracked in `BACK-060`. Fresh staging re-smoke 2026-07-17 proved the exact exploit is closed: fresh linked user `telegramId=7910751623`, unsigned `save-task` with `telegramUserId` returned `403 {"ok":false,"error":"bot signature invalid"}`, and `/tasks` stayed `[]` before/after (`LINKED_UNSIGNED_SAVE_TASK_CREATED: False`). Additional unsigned `done-task` and `delete-task` with `telegramUserId` also returned `403 bot signature invalid`. Sibling unsigned checks for `update-task` and `set-reminder` returned `401 Не авторизован`, with no bot-style effect observed. Evidence doc: `docs/tasks/BUG-2026-07-15-005-staging-resmoke-2026-07-17.md`. |
| BUG-2026-07-14-003 | Staging /auth/telegram падает Worker exception 1101 | High | P1 | Done | Codex | N/A | 2026-07-14 staging tail дал точный stack: merge-ветка `/auth/telegram` падала на `ReferenceError: isPaidUser is not defined` в `betterAccountByPlanOrTrial()` -> `mergeAccounts()` -> `handleTelegramAuth()`. Исправлено в `4e-worker/worker.js` узким helper-ом `isPaidUser(user) { return user.plan === "paid"; }`, staging worker задеплоен как version `d98c7ca9-1300-4e2a-81eb-1ad6a5ced167`. Повторный live smoke после deploy: fresh web-account + `POST /auth/telegram` с тем же Telegram ID теперь возвращает `200`, `accountMerged: true`, а `wrangler tail` показывает `POST /auth/telegram - Ok` без exception. |
| BUG-2026-07-05-002 | Профиль на мобильной веб-версии выглядит неаккуратно: съехали отступы, бейджи и секции формы | Medium | P2 | Ready for QA | Юрий | BACK-043 | Ветка `fix/profile-responsive-ui`, commit `33903b4`; ждёт скрины и ручной smoke Алексея |
| BUG-2026-07-05-001 | Нижняя панель растягивается на ширину браузера, а не экрана приложения | Medium | P2 | Done | Юрий | BACK-046 | Ветка `fix/bottom-nav-app-width`, commit `748dcfd`; проверить все экраны с нижней панелью |
| BUG-2026-07-05-003 | На первом экране после 22:00 показывается отрицательное время до конца дня | Medium | P2 | Done | Codex / Юрий | BACK-056 | В `.tmp-4e-app-publish/index.html` расчёт `22 - hr` заменён на human-friendly tail: после 22:00 home показывает `вечерний фокус`, а не отрицательные часы |
| BUG-2026-07-04-003 | На экране email-входа Enter не запускает авторизацию | Medium | P2 | Done | Codex | N/A | Локальный фикс в `index.html`; проверить на ноутбуке в email и password полях |
| BUG-2026-07-04-002 | В веб-версии кнопка "Войти через Telegram" не открывает Telegram из-за `tg://resolve` | High | P1 | Ready for QA | Codex | BACK-036 | Локальный фикс в `fix/telegram-login-web-fallback`; нужен live smoke после публикации |
| NEW-001 | Уведомления: утренний брифинг не сработал | Medium | P2 | Ready for QA | Юрий + Codex | N/A | Root cause/code fix 2026-07-17: worker cron marked `briefing_sent:<user>:<date>` before Telegram `sendMessage` succeeded, so a transient send failure or missing token could suppress retries for the whole day. `runBriefingsCron()` now collects with `markSent:false` and writes the sent marker only after `sendTelegramBotMessage()` returns `ok`. Needs real Telegram delivery smoke by Yuri before Done. |
| NEW-002 | Статистика: неактуальные данные / не открываются активные задачи | Medium | P2 | Done | Юрий + Codex | N/A | Базовый stats-fix остаётся тем же (`loadStats()` на реальных local выборках, живые `onclick` у active/promises), но ночной regression 2026-07-14 честно вынесен в `BUG-2026-07-14-004`. После `sanitizeClaudeMessages()` и fresh staging deploy `https://73d33de6.4-ai-staging.pages.dev` live smoke 2026-07-15 больше не воспроизводит validation error, а экран `Статистика` снова видит свежесозданную задачу аккаунта. 2026-07-15 smoke on https://44ccd355.4-ai-staging.pages.dev confirmed statistics data and active-list CTA with real seeded tasks. |
| NEW-003 | Профиль: дублируется аватар | Low | P3 | Done | Юрий + Codex | N/A | В `.tmp-4e-app-publish/index.html` удалён второй preview-avatar из profile details card; единственной точкой фото остаётся верхний `#profile-avatar` Live headless smoke 2026-07-15 on https://88193776.4-ai-staging.pages.dev: profile has one visible large avatar (#profile-avatar) and no duplicate #profile-photo-preview. |
| NEW-004 | Профиль: личные данные занимают слишком много места | Low | P3 | Done | Юрий + Codex | N/A | В `.tmp-4e-app-publish/index.html` поле имени перенесено в collapsible section `Личные данные аккаунта`, отдельная card сверху убрана; профиль стал короче без потери полей Live headless smoke 2026-07-15 on https://88193776.4-ai-staging.pages.dev: personal data section is collapsed by default and name field lives inside #profile-pii-section. |
| NEW-005 | Карточка задачи: заголовок/срок обрезаются | Medium | P2 | Done | Юрий + Codex | N/A | В `.tmp-4e-app-publish/scripts/task-ui-renderers.js` task-card рендер переведён на более устойчивый head/title layout: deadline теперь может переноситься, title не зажат в одну строку, tag укорочен Live headless smoke 2026-07-15 on https://88193776.4-ai-staging.pages.dev: long task title with long assignee and deadline renders in filtered active list without horizontal overflow. |
| NEW-006 | Safe area: перекрытие нижним меню | High | P1 | Ready for QA | Юрий + Codex | N/A | Code evidence already exists in backlog: safe-area variables and bottom-nav reserve are implemented, plus headless 390x844 smoke passed. Live TMA checklist: `docs/tasks/NEW-006-tma-safe-area-live-smoke.md`. Needs Yuri real Telegram Mini App smoke before Done. |
| NEW-007 | Карточка задачи: блоки «Обсуждение/Совет/История» требуют переработки | Medium | P2 | Done | Юрий + Codex | N/A | Вкладка `История` теперь показывает непрерывную хронологию задачи: системные события, сообщения обсуждения и summary действий 4 больше не разорваны по разным блокам. Нужен QA-smoke на порядок событий и длинные треды. Live headless smoke 2026-07-15 on https://88193776.4-ai-staging.pages.dev: task detail opens for seeded task and shows detail/history/discussion surface without runtime errors. |
| NEW-008 | AI-чат: поле ввода перекрывается нижним меню | High | P1 | Ready for QA | Юрий + Codex | N/A | Code evidence already exists in backlog: `--app-keyboard-offset` and `.ask-bar--keyboard-open` are implemented, and local keyboard smoke passed. Live checklist: `docs/tasks/NEW-008-chat-keyboard-live-smoke.md`. Needs Yuri real Telegram Mini App/mobile keyboard smoke before Done. |
| NEW-009 | AI-чат: нет быстрых действий голос/вложения | Medium | P2 | Done | Юрий + Codex | N/A | В `.tmp-4e-app-publish/index.html` внизу AI-чата снова видны voice/attachment quick actions; voice ведёт в `openVoice()`, attachment даёт честный placeholder-toast 2026-07-15 smoke on https://44ccd355.4-ai-staging.pages.dev confirmed voice and attachment quick actions are visible and wired. |
| NEW-010 | Главный экран: кнопка «Завершить» непропорциональна | Low | P3 | Done | Юрий + Codex | N/A | Покрыто `HOME-001`: на home-экране старый паттерн с непропорциональной кнопкой убран вместе с прежними карточками, вместо него — top-3 приоритетов с открытием детали задачи. Live headless smoke 2026-07-15 on https://88193776.4-ai-staging.pages.dev: home has top-3 priority rows and no old 'Завершить' buttons on the main screen. |
| NEW-011 | Главный экран: задачи объединены в общий контейнер | Medium | P2 | Done | Юрий + Codex | N/A | Покрыто `HOME-001`: home разбит на отдельные читаемые блоки `Фокус дня`, `метрики`, `top-3 задач`, без слитого общего контейнера. Live headless smoke 2026-07-15 on https://88193776.4-ai-staging.pages.dev: home renders separate focus, 4 metric cards and 3 readable top-list rows (row width 324px), not one merged container. |
| NEW-012 | Статистика: не отображаются завершенные задачи и история | Medium | P2 | Done | Юрий + Codex | N/A | В overview статистики добавлен отдельный блок completed/history, который показывает последние завершённые задачи и строку истории на базе `getTaskHistoryRows()` и done-timestamps Code fix 2026-07-15: loadTasks now keeps all tasks in allTasksCache instead of active-only, so openStatistics can render completed/history. Live smoke on https://88193776.4-ai-staging.pages.dev: done task appears in #stats-done-list and cache contains doneInCache=1. |
| NEW-013 | Главный экран: перегружен «Фокус дня» | Low | P3 | Done | Юрий + Codex | N/A | Покрыто `HOME-001`: блок `Фокус дня` упрощён до короткого основного сообщения и одной подписи, без прежней визуальной перегрузки copy. Live headless smoke 2026-07-15 on https://88193776.4-ai-staging.pages.dev: focus-card copy is compact ('3 задачи требуют внимания' + short subtitle) without old overloaded text. |
| NEW-014 | План дня: нет детальной сводки | Medium | P2 | Done | Юрий + Codex | N/A | Сводка плана дня уже реализована: `Фокус дня` открывает отдельную overlay-панель, а списки по категориям (`Выполнено`, `Активные`, `Обещания`) доступны с home-экрана и со статистики. Нужен только QA-smoke переходов. 2026-07-15 smoke on https://44ccd355.4-ai-staging.pages.dev confirmed focus-day overlay opens and renders real tasks. |
| NEW-015 | План дня: отсутствуют метки направления/даты постановки/дедлайна | Medium | P2 | Done | Юрий + Codex | N/A | Карточки план-потока и связанные списки теперь показывают 3 обязательные метаданные: направление, дату постановки и дедлайн. Нужен только QA-smoke на мобильной читаемости. 2026-07-15 smoke on https://44ccd355.4-ai-staging.pages.dev confirmed unified direction/created/deadline meta in home and focus rows. |
| NEW-016 | Фокус дня: текст наезжает на декоративную планету | Low | P3 | Done | Юрий + Codex | N/A | В `.tmp-4e-app-publish/index.html` увеличен правый reserve у text-block в focus-card и немного уменьшен headline, чтобы текст не наезжал на планету Code fix 2026-07-15: focus-card text layer z-index raised, decorative layer lowered and text safe padding increased to 144px. Live smoke on https://88193776.4-ai-staging.pages.dev: contentRight=209 before decorLeft=237. |
| NEW-017 | Календарь: при первом открытии показываются демо-задачи | Medium | P2 | Done | Юрий + Codex | N/A | Root cause/code fix 2026-07-17: calendar first render used `fetch(WORKER + '/tasks?chatId=' + chatId)`, while global `chatId` starts as `global`; opening calendar before user-scope cache could read a non-user bucket. Calendar now renders from `allTasksCache` only; empty user cache shows honest empty state, and user deadlines appear after `loadTasks()`/task creation. Previous staging smokes already did not reproduce demo tasks; this closes the lingering bugs-table Triaged mismatch. |

## Детали активных багов

### BUG-2026-07-05-003 — На первом экране после 22:00 показывается отрицательное время до конца дня

**Дата:** 2026-07-05
**Версия/окружение:** локальный `main`, mobile viewport `360x800`, `375x667`, `390x844`, Home / первый экран
**Severity:** Medium
**Priority:** P2
**Статус:** Ready for QA
**Метка:** UI / Home / AI planner / Time copy

**Почему существенно:** Home — первый экран продукта и главный сценарий "за 30 секунд понять, что важно сегодня". Отрицательное время в фокус-блоке выглядит как сломанная логика и снижает доверие к AI-планеру, даже если задачи и навигация работают.

**Шаги воспроизведения:**
1. Открыть приложение после 22:00 локального времени.
2. Авторизоваться или открыть Home в QA/mock-состоянии с активными задачами.
3. Посмотреть строку `Фокус дня`.

**Фактический результат:** в фокус-блоке отображается текст вида `2 задач горят · -1 ч до конца дня`.

**Ожидаемый результат:** строка не должна показывать отрицательное время. После 22:00 нужен нейтральный текст, например `до конца дня осталось мало времени`, `вечерний фокус` или расчёт до 23:59 без отрицательных значений.

**Вложения/логи:** Codex mobile QA 2026-07-05, viewport `360x800` и `390x844`.

**Решение:** в `.tmp-4e-app-publish/index.html` расчёт переведён на human-friendly copy: до 22:00 остаётся обычный хвост вида `N ч до конца дня`, после 22:00 строка переключается на нейтральный статус `вечерний фокус`. Заодно исправлена русская форма `задача/задачи/задач`, чтобы строка не выглядела как `2 задач горят`.

**Проверка после фикса:**
1. До 22:00 строка показывает нормальное положительное время или нейтральный статус.
2. После 22:00 строка не содержит отрицательных чисел.
3. На `360x800`, `375x667`, `390x844` первый экран остаётся без горизонтального скролла.
4. Home с пустым списком задач не получает регрессию.

### BUG-2026-07-05-002 — Профиль на мобильной веб-версии выглядит неаккуратно

**Дата:** 2026-07-05
**Версия/окружение:** веб-версия / мобильная ширина экрана, профиль пользователя
**Severity:** Medium
**Priority:** P2
**Статус:** Ready for QA
**Метка:** UI / Profile / Mobile layout

**Почему существенно:** профиль — экран доверия и настройки аккаунта. Сейчас на мобильной ширине форма выглядит собранной небрежно: статусные бейджи, подписи полей и секции визуально спорят друг с другом, часть элементов почти прилипает к соседним блокам. Это не блокирует сценарий, но снижает ощущение качества продукта перед закрытым тестом.

**Шаги воспроизведения:**
1. Открыть веб-версию приложения на мобильной ширине или в mobile viewport.
2. Перейти на экран "Профиль".
3. Проскроллить блок редактирования профиля до полей "Телефон", "Email", "Telegram", "Дата рождения" и "О себе".

**Фактический результат:** у строки Telegram бейдж "Не привязан" визуально прижат к полю и выглядит как случайно наложенный элемент; заголовки "Дата рождения" и "О себе" стоят слишком близко к предыдущим блокам; поле "О себе" и счётчик `0 / 200` не образуют аккуратную единую секцию; общий ритм отступов в форме неровный.

**Ожидаемый результат:** строки профиля выглядят как единая аккуратная форма: одинаковые отступы между секциями, статусные бейджи выровнены и не конфликтуют с input-полями, заголовки секций не прилипают к соседним карточкам, textarea "О себе" и счётчик читаются как один блок.

**Вложения/логи:** два скрина Алексея 2026-07-05 с красными стрелками на проблемные места в профиле.

**Решение:** завести отдельный UI-фикс `BACK-043`. Юре проверить CSS/HTML профиля на мобильной ширине, особенно строки phone/email/telegram, заголовки секций, textarea "О себе", счётчик символов и расстояние до кнопки "Сохранить профиль" / нижней навигации.

**Проверка после фикса:**
1. Mobile web 390px: строки phone/email/telegram выглядят ровно, бейджи статуса не налезают на поля и не выглядят случайно приклеенными.
2. Заголовки "Дата рождения" и "О себе" имеют нормальный верхний отступ и не прилипают к предыдущей карточке.
3. Поле "О себе" не перекрывается нижней навигацией; счётчик `0 / 200` стоит в понятном месте и не висит отдельно.
4. Кнопка "Сохранить профиль" доступна после прокрутки и не конфликтует с нижней навигацией.
5. Desktop/web и Telegram WebView не получают регрессий на экране профиля.

### BUG-2026-07-05-001 — Нижняя панель растягивается на ширину браузера, а не экрана приложения

**Дата:** 2026-07-05
**Версия/окружение:** веб-версия / desktop browser, приложение открыто как узкий мобильный экран по центру
**Severity:** Medium
**Priority:** P2
**Статус:** Ready for QA
**Метка:** UI / Navigation / Responsive shell

**Почему существенно:** на desktop/web-просмотре интерфейс визуально показывает мобильный экран приложения по центру, но нижняя панель уходит на всю ширину браузера. Это ломает ощущение цельного приложения и может мешать QA, потому что элементы навигации оказываются далеко за пределами рабочего экрана.

**Шаги воспроизведения:**
1. Открыть приложение в desktop browser или широком окне.
2. Попасть на главный экран или любой экран, где видна нижняя панель.
3. Посмотреть на нижнюю навигацию относительно центрального экрана приложения.

**Фактический результат:** нижняя панель занимает почти всю ширину окна браузера, хотя сам экран приложения остаётся узким и центрированным.

**Ожидаемый результат:** нижняя панель должна быть ограничена шириной экрана приложения, центрирована вместе с ним и не выходить за пределы app-контейнера. Это должно работать на всех экранах, где видна нижняя панель.

**Вложения/логи:** скрин от Алексея 2026-07-05 с красной рамкой вокруг нижней панели.

**Решение:** отдельный UI-фикс `BACK-046` уже собран в ветке `fix/bottom-nav-app-width` (commit `748dcfd`). Юре оставалось проверить оба компонента навигации в `index.html`: `bottom-nav-v2` внутри `#home` и `global-nav` для остальных экранов. Дальше нужен ручной smoke Алексея: ширина панели должна совпадать с app-контейнером, а не viewport браузера.

**Проверка после фикса:**
1. Desktop/web: нижняя панель совпадает по ширине с центральным экраном приложения.
2. Home: `bottom-nav-v2` не выходит за границы app-контейнера.
3. Calendar / AI-chat / task-detail / profile и другие экраны с nav: `global-nav` не выходит за границы app-контейнера.
4. Mobile Telegram WebView: нижняя панель остаётся на всю ширину мобильного экрана и не ломает safe-area.
5. При открытии клавиатуры в AI-чате прежнее скрытие nav не регрессирует.

### BUG-2026-07-04-003 — На экране email-входа Enter не запускает авторизацию

**Дата:** 2026-07-04
**Версия/окружение:** веб-версия / ноутбук, экран входа
**Severity:** Medium
**Priority:** P2
**Статус:** Ready for QA
**Метка:** Auth / Keyboard UX

**Почему существенно:** на ноутбуке пользователь ожидает стандартное поведение формы: после ввода email и пароля Enter отправляет вход. Если Enter молчит, сценарий выглядит сломанным, хотя есть обходной путь через кнопку "Войти".

**Шаги воспроизведения:**
1. Открыть экран входа.
2. Ввести email и пароль.
3. Нажать Enter в поле email или пароля.

**Фактический результат:** Enter не запускает вход, нужно кликать кнопку "Войти".

**Ожидаемый результат:** Enter в полях email/пароля запускает тот же `doLogin()`, что и кнопка "Войти"; повторный запуск не происходит, если кнопка уже заблокирована.

**Вложения/логи:** скрин от Алексея 2026-07-04, поле пароля в фокусе.

**Решение:** в `index.html` добавлен обработчик `submitLoginOnEnter(event)` для `login-email` и `login-pass`. Он перехватывает Enter, отменяет дефолтное поведение и вызывает `doLogin()`, если кнопка входа не заблокирована.

**Проверка после фикса:**
1. Enter в поле пароля запускает вход.
2. Enter в поле email запускает вход, если пароль уже заполнен.
3. При пустом email/пароле остаётся прежний toast "Введи email и пароль".
4. Клик по кнопке "Войти" работает как раньше.

### BUG-2026-07-04-002 — В веб-версии кнопка "Войти через Telegram" не открывает Telegram из-за `tg://resolve`

**Дата:** 2026-07-04
**Версия/окружение:** веб-версия / browser DevTools, экран входа
**Severity:** High
**Priority:** P1
**Статус:** Ready for QA
**Метка:** Auth / Telegram / Web fallback regression

**Почему существенно:** пользователь нажимает ключевую кнопку входа и не получает видимого продолжения. Для внешнего теста это выглядит как неработающий вход, даже если email-вход остаётся доступен.

**Шаги воспроизведения:**
1. Открыть веб-версию приложения на экране входа.
2. Нажать "Войти через Telegram".
3. Открыть консоль браузера.

**Фактический результат:** видимой реакции нет. В консоли ошибка Telegram WebApp SDK: `Url protocol is not supported tg://resolve?...` и `WebAppTgUrlInvalid`.

**Ожидаемый результат:** в обычной веб-версии кнопка должна открыть HTTPS-ссылку `https://t.me/Denzel89bot?start=...` или хотя бы показать понятное действие. Telegram SDK `openTelegramLink()` не должен вызываться вне реального Mini App-контекста с `initData`. После START в боте пользователь должен получить ссылку назад на сайт, например `https://app.4-ai.site/?telegram_start=<startToken>`.

**Вложения/логи:** скрин консоли от Алексея 2026-07-04.

**Решение:** в `index.html` web fallback переведён с `tg://resolve?...` на `https://t.me/Denzel89bot?start=...`. `Telegram.WebApp.openTelegramLink()` теперь вызывается только при наличии Telegram `initData`; обычная веб-версия делает HTTPS-переход. Фронт сохраняет pending `startToken`, отправляет `returnUrl` в Worker и умеет завершить вход после возврата на сайт с `telegram_start`/`startToken`. Битые русские сообщения в Telegram auth-ветке исправлены. Осталась обязательная bot-side часть: бот должен прислать ссылку/кнопку назад на сайт.

**Проверка после фикса:**
1. В веб-версии нажать "Войти через Telegram" — открывается `https://t.me/Denzel89bot?...`, ошибки `WebAppTgUrlInvalid` нет.
2. После START в боте появляется ссылка/кнопка назад на сайт.
3. Возврат на сайт с `?telegram_start=<startToken>` завершает авторизацию.
4. В Telegram Mini App вход через Telegram не регрессирует.
5. Если Worker не выдаёт `startToken`, кнопка открывает базовую ссылку `https://t.me/Denzel89bot`.
6. Email-вход остаётся доступен.

### BUG-2026-06-29-002 — Голосовой режим открывается с ошибкой микрофона и не начинает запись

**Дата:** 2026-06-29
**Версия/окружение:** Telegram Mini App / Telegram WebView, устройство Алексея
**Severity:** High
**Priority:** P1
**Статус:** Triaged
**Метка:** Voice / Core flow / Telegram WebView

**Почему существенно:** голосовой ввод является заметным обещанием продукта и частью быстрого создания задач. Если пользователь нажимает микрофон и сразу видит "Ошибка микрофона", сценарий не имеет логического продолжения и снижает ценность закрытого теста.

**Шаги воспроизведения:**
1. Открыть Telegram Mini App.
2. Нажать кнопку микрофона / открыть "Голосовой режим".
3. Дождаться старта записи.

**Фактический результат:** экран голосового режима показывает "Ошибка микрофона"; этап "Распознаю речь" не стартует, голосовая задача не создаётся.

**Ожидаемый результат:** приложение запрашивает доступ к микрофону, начинает запись, распознаёт речь и передаёт текст в AI-чат/создание задачи. Если микрофон недоступен, пользователь видит понятную причину и запасной путь через текстовый ввод.

**Вложения/логи:** скрин от Алексея в текущем чате: экран "Голосовой режим" с заголовком "Ошибка микрофона".

**Диагностика 2026-06-29:** текущий `main` использует `SpeechRecognition` в `openVoice()`. В истории есть ветка/коммит `origin/feat/voice-mediarecorder` / `70a051f` с MediaRecorder + `/transcribe`, но в `main` после этого был откат `e970d33` обратно к SpeechRecognition. Это похоже не на поломку микрофона пользователя, а на известную несовместимость SpeechRecognition в Telegram/iOS WebView.

**Решение:** не чинить импульсно в `main`. Вернуть BACK-021 в ближайший контур: проверить готовность Worker `/transcribe`, наличие `OPENAI_KEY`, затем в отдельной ветке `fix/voice-mediarecorder` восстановить или аккуратно повторить MediaRecorder-flow с fallback и запасным текстовым путём.

**Проверка после фикса:**
1. iPhone / Telegram WebView: нажатие микрофона начинает запись без "Ошибка микрофона".
2. После остановки записи текст появляется в AI-чате или задаче.
3. Android / Telegram WebView: голосовой ввод работает.
4. Если доступ к микрофону запрещён, экран показывает понятную ошибку и кнопку/переход к текстовому вводу.

### BUG-2026-06-29-001 — Вход через Telegram показывает тупиковую подсказку, бот не предлагает действие

**Дата:** 2026-06-29
**Версия/окружение:** Telegram Mini App / Telegram WebView
**Severity:** High
**Priority:** P1
**Статус:** Triaged
**Метка:** Auth / Access blocker risk / Bot handoff

**Почему существенно:** сценарий входа через Telegram может остановить пользователя до попадания в продукт. Это противоречит принципу "нулевой барьер входа" и мешает закрытому тесту/монетизации, если новый пользователь не понимает, как получить рабочую ссылку входа.

**Шаги воспроизведения:**
1. Открыть экран входа.
2. Нажать "Войти через Telegram".
3. Получить сообщение "Открой бота и нажми Start — получишь ссылку для входа".
4. Перейти в Telegram/бота.

**Фактический результат:** приложение показывает подсказку, но не открывает бота и не даёт явную кнопку/ссылку. По наблюдению Алексея, в самом Telegram действий не предлагается.

**Ожидаемый результат:** пользователь получает понятное продолжение: приложение открывает `@Denzel89bot` или показывает кнопку "Открыть бота", а бот после `/start` выдаёт ссылку Mini App/логина. Если Telegram-login недоступен, экран должен прямо предложить email-вход как запасной путь.

**Вложения/логи:** скрин от Алексея в текущем чате: login-экран с toast-подсказкой про Start.

**Решение:** проверить связку app + bot. В `4e-app` нужна UX-страховка на случай отсутствия `Telegram.WebApp.initData`: явная кнопка/ссылка на `@Denzel89bot` и запасной email-вход. В `4e-bot` проверить обработчик `/start`, выдачу Mini App-ссылки и Railway-деплой.

**Проверка после фикса:**
1. Нажать "Войти через Telegram" вне валидной Mini App-сессии — появляется явная кнопка/ссылка "Открыть бота", без тупика.
2. Открыть `@Denzel89bot`, нажать Start или отправить `/start` — бот присылает рабочую ссылку входа/Mini App.
3. Открыть ссылку из бота — вход проходит через `/auth/telegram`, пользователь попадает на главный экран.
4. Если bot/Telegram недоступен — пользователь видит запасной путь через email.

### BUG-2026-06-25-002 — Сброс пароля принимает некорректный email и переводит пользователя на пустой экран

**Дата:** 2026-06-25
**Версия/окружение:** Telegram Mini App
**Severity:** High
**Priority:** P1
**Статус:** Done
**Метка:** Auth / Access blocker risk

**Почему существенно:** проблема находится в сценарии восстановления доступа. Если пользователь не может корректно сбросить пароль или после попытки попадает на пустой экран, это может помешать ему залогиниться и получить доступ к приложению.

**Шаги воспроизведения:**
1. Открыть экран входа.
2. Перейти на экран "Сброс пароля".
3. Ввести в поле email невалидное значение, например `fff`.
4. Нажать "Отправить ссылку".

**Фактический результат:** приложение принимает невалидное значение, как будто email корректный, и переходит на следующий экран. Следующий экран оказывается пустым, при этом видна нижняя навигация.

**Ожидаемый результат:** кнопка не должна отправлять форму, пока не введён корректный email. Пользователь должен увидеть понятную ошибку рядом с полем, например "Введите корректный email". Перехода на пустой экран быть не должно.

**Вложения/логи:** скрин 1 — введено `fff` на экране сброса пароля; скрин 2 — после нажатия открывается пустой экран с нижней навигацией.

**Решение:** в `index.html` добавлена клиентская валидация email до отправки формы. При пустом или невалидном email показывается понятная ошибка и запрос не отправляется. Для ответа сервера показывается состояние успеха или ошибка без перехода на пустой экран. Auth/reset-экраны скрывают нижнюю навигацию, если пользователь не авторизован.

**Проверка после фикса:**
1. Ввести `fff` — форма не отправляется, появляется ошибка.
2. Оставить поле пустым — форма не отправляется, появляется ошибка.
3. Ввести email правильного формата, но несуществующего пользователя — пустой экран не появляется.
4. Ввести email существующего пользователя — пользователь видит понятный экран успеха или ошибку сервера.

## Отчёт для разработки

Когда набирается пачка багов, агент формирует короткий отчёт:

```text
Период:
Проверяемая версия/среда:
Всего найдено:
P0/P1:
Главные риски:

Баги к исправлению:
1. [ID] Заголовок — Priority — коротко почему важно

Что добавить в roadmap:
- Направление / риск / зависимость

Что проверить после фиксов:
- Сценарии регрессии
```

## Готовы к проверке

| ID | Баг | Что проверить | Проверяющий | BACK-xxx | Результат |
| --- | --- | --- | --- | --- | --- |
| BUG-2026-06-25-002 | Сброс пароля принимает некорректный email и переводит пользователя на пустой экран | Пустой email, `fff`, корректный формат с несуществующим/существующим пользователем; отсутствие пустого экрана и нижней навигации на auth/reset-flow | Юрий | BACK-002 | ✅ Pass 2026-06-25 |

## Закрытые

| ID | Баг | Дата закрытия | BACK-xxx | Как проверили |
| --- | --- | --- | --- | --- |
| BUG-2026-06-29-001 | Вход через Telegram показывал тупиковую подсказку, бот не предлагал действие | 2026-07-04 (фикс и smoke 2026-07-01) | BACK-024 | По pm/backlog.md: вход через Telegram проходит в правильный аккаунт, smoke passed 2026-07-01. Детали: `docs/tasks/BUG-2026-06-29-001_telegram_login_dead_end.md` |
| BUG-2026-06-29-002 | Голосовой режим открывался с ошибкой микрофона и не начинал запись | 2026-07-04 (фикс и smoke 2026-07-01) | BACK-021 | По pm/backlog.md: голос работает на iPhone iOS в Telegram app, smoke passed 2026-07-01. Детали: `docs/tasks/BACK-021-voice-mediarecorder.md` |
| BUG-2026-07-04-001 | AI-дашборд мог показывать `Пульс дня` выше 100%, кнопка compact-mode содержала `4`, а секция `Горит` пропускала задачи `просрочено на X дней` | 2026-07-04 | BACK-027 | Локальный headless smoke на `index.html`: `Пульс дня: 67%`, кнопка `Свернуть`, в `Горит` видны overdue-задачи на 5 и 1 день, пустое состояние не показывается |
| BUG-2026-06-25-001 | После reload/logout появлялся пустой экран, пункты нижнего меню не подсвечивались, profile мог показывать дефолтного пользователя без token | 2026-06-25 | — | Локальный smoke в in-app browser: home `scrollTop=0`, `voice` скрыт, active menu зелёный, logout и direct profile без token показывают `login` |
## 2026-07-18 security re-check notes

### BACK-060 / BUG-2026-07-15-005 sibling actions

Fresh staging target: `https://restless-lab-d737-staging.shelckograff.workers.dev`
Worker staging version: `6cf4e558-9681-46a7-ae60-20f51375d505`

RAW:

```text
UNSIGNED update-task with foreign telegramUserId
STATUS: 401
BODY: {"ok":false,"error":"Не авторизован"}

UNSIGNED set-reminder with foreign telegramUserId
STATUS: 401
BODY: {"ok":false,"error":"Не авторизован"}
```

Result: no new sibling P1 bug opened. Both paths rejected the sessionless foreign-`telegramUserId` request before mutation.
