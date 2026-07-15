# Team Sync

Обновлено: 2026-07-15

Источник правды: GitHub + этот файл. Подробности живут в `shared/ROADMAP.md`, `pm/backlog.md`, `pm/bugs.md`, `shared/WORK_LOG.md` и `DEVELOPMENT_LOG.md`.

## Как пользоваться

- Алексей спрашивает Codex: `Что там у Юры?`
- Юра спрашивает Claude: `Что там у Лехи?`
- После завершения задачи агент делает commit, push в рабочую ветку и обновляет этот файл.
- Merge в `main` делается отдельно, только после подтверждения Алексея или Юры.

Подробный протокол: `docs/team-sync-protocol.md`.

## Что Алексей передал Юре

### Team Sync protocol

**Статус:** Передано  
**Контекст:** Алексей утвердил общий протокол синхронизации, чтобы Юра мог спрашивать Claude `Что там у Лехи?`, а Алексей мог спрашивать Codex `Что там у Юры?`.  
**Ветка / PR:** `docs/team-sync-protocol`; поправка под Claude-driven Git: `docs/team-sync-yuri-claude-git`  
**Что нужно от Юры:** после получения ветки/коммита попросить Claude безопасно обновить локальный проект из GitHub, затем принять правила из `CLAUDE.md`, `docs/team-sync-protocol.md` и этого файла.  
**Следующий шаг:** Юра запускает фразы для Claude:

```text
Обнови проект из GitHub безопасно: проверь текущую ветку, git status, сделай fetch origin и подтяни main только если нет риска потерять незакоммиченные изменения. Если есть риск или конфликт - остановись и объясни мне простыми словами.
```

```text
Прими правила синхронизации команды: прочитай CLAUDE.md, docs/team-sync-protocol.md и pm/team-sync.md. Дальше при фразе "Что там у Лехи?" работай по этим правилам.
```

## Что Юра сделал / вернул

### Ответ на сообщение Алексея от 2026-07-10 (PR #27 не готов к main)

**Статус:** Готово к повторному ревью
**Контекст:** Сообщение Алексея от 2026-07-10 14:15 (commit `33db2a2`, 117 коммитов вперёд / 11 позади `main`, `mergeable=false`) устарело — с тех пор ветка обновлена.
**Что сделано:**
- 2026-07-12 выполнен запрошенный sync коммитом `a3c9ea1` (`merge(main): sync origin/main into feat/admin-tariff-api`). Сохранены все свежие документы из `main`: `docs/team-sync-protocol.md`, `pm/next-actions.md`, `pm/team-sync.md` (объединён — формат Алексея сохранён как основной, старая сессионная запись Кодекса перенесена отдельным разделом, не удалена), а также `BACK-055`, `BACK-056`, `CAL-001/002/003`, `OMNI-001`, `BETA-001`, `ANALYTICS-001`, `FEEDBACK-001`, `ONBOARD-001` из roadmap/backlog `main`. Конфликтов-маркеров не осталось — проверено Claude напрямую по файлам.
- После sync продолжена работа и запушено ещё 8 коммитов: `NEW-006`/`NEW-008` (safe area / keyboard offset), `NEW-001`/`NEW-017` (закрыты после живого staging smoke), `BACK-030` и `SMART-013` (оба закрыты после живого smoke на реальном staging deployment `https://c4b8195f.4-ai-staging.pages.dev` — Claude независимо проверил, что деплой реальный и рабочий), плюс спека `HOME-001` (редизайн главного экрана, docs-only).
**Ветка / commit / PR:** `feat/admin-tariff-api`, HEAD == `origin/feat/admin-tariff-api` на `d6cf83f` (проверено Claude напрямую по `.git/refs`, не со слов Кодекса). PR #27 — **проверено только что напрямую на GitHub: статус сменился на «Able to merge» (было «Can't automatically merge»)**.
**Про «почему не сохраняешь на GitHub»:** сохраняется постоянно — push идёт после каждого коммита в рабочую сессию, HEAD и origin сверяются Claude вручную после каждого шага в этом чате. Расхождение с тем, что видел Алексей, — просто из-за того, что его снимок состояния был на 2026-07-10, а работа продолжилась после.
**Что проверить:** Алексею стоит обновить локальную информацию о ветке (`git fetch origin`) и заново посмотреть PR #27 — mergeable-статус на GitHub сейчас положительный.
**Блокеры:** нет технических. Сам merge `feat/admin-tariff-api` → `main` — отдельное решение, требует явного подтверждения Юрия и/или Алексея, не входит в автоматическое закрытие задач.
**Следующий шаг:** Алексей проверяет `a3c9ea1` и последующие коммиты; при готовности — отдельное решение о мердже PR #27 в `main`.

### Payment security P0 (verify-first перепроверка) — 2026-07-15

**Статус:** Частично подтверждено, но payment-path не зелёный
**Контекст:** После ручных прогонов Юрия и отдельной verify-first сессии по брифу codex-session-2026-07-15-payment-p0-verification.md прежний optimistic handoff по payment P0 больше нельзя считать актуальным без оговорок.
**Что подтверждено live:**
- BACK-059 реально зелёный: через staging fixture PUT /admin/users/:id/fixture/expired подтверждён единый entitlement gate. После mode=apply ключевые premium-path (/anthropic, /transcribe, x-action=save-task, x-action=update-task, unsigned bot-style save-task) возвращают 403; после mode=revert entitlement и 	rialActive восстанавливаются.
- CloudPayments negative auth-path подтверждён: bad/missing HMAC режется.
- Telegram Stars negative auth-path подтверждён: bad/missing signature режется.
**Что оказалось красным:**
- CloudPayments signed positive callback на staging сейчас не поднимает entitlement; signed wrong-amount callback premium не активирует, но всё ещё отвечает {"code":0} вместо явного reject. Это переводит BACK-004 в Blocked.
- Telegram Stars signed completion-path на staging сейчас отвечает 404 {"ok":false,"error":"invoice not found"} даже после свежего invoice creation и короткой паузы. Это переводит BACK-010 в Blocked.
- Для active user найден отдельный security gap: worker принимает bot-style x-action=save-task без x-bot-signature / x-bot-timestamp / x-bot-nonce. Это заведено как новый P0 BACK-060 и bug BUG-2026-07-15-005.
**Ручные действия Юрия, уже отражённые в файлах:** Cloudflare secrets для smoke действительно были выставлены вручную, и это помогло добить signed staging-проверки. Отдельно важно: в одном из ручных PowerShell выводов ADMIN_SECRET оказался напечатан в явном виде, поэтому его нужно ротировать как скомпрометированный выводом терминала.
**Что нужно от Юры / Алексея:** не merge в main, а отдельный follow-up на фиксы BACK-004, BACK-010, BACK-060; после этого — повторный signed staging-smoke по тем же сценариям.
### INFRA-005 — RU proxy для VK Mini App через Yandex Cloud — 2026-07-13

**Статус:** Выполнено
**Контекст:** Production VK deploy для surface с `VK_API_BASE_URL=https://d5dg7uthvqp4ebomg3rl.ccx97b51.apigw.yandexcloud.net` дошёл до ручного VK Administration confirm, после чего Юрий подтвердил живой runtime-smoke: приложение открывается и работает внутри VK-приложения.
**Что сделано:**
- `vk-miniapps-deploy` повторно собрал и загрузил новую VK hosting version `1783968473`.
- Во время deploy пройдены интерактивные шаги `update prod urls`, `update dev urls`; test-group URL сознательно не обновлялся.
- Коды из VK Administration переданы в живой deploy-сеанс, после чего ручной runtime-smoke внутри VK подтвердил, что production surface открывается и работает.
**Что проверено:** ручной smoke в VK app без отдельного браузера/VPN: приложение запускается на боевой VK-поверхности и использует Yandex RU proxy вместо прямого Cloudflare API base.
**Блокеры:** нет. Остаток по INFRA-005 закрыт.
**Следующий шаг:** считать `INFRA-005` закрытым, а если понадобится — отдельно записать/подтвердить новый production VK URL из кабинета VK Mini Apps.

## Изменения по проекту

### BACK-034 staging contour — 2026-07-15

**Статус:** Done
**Проверено:** direct Pages `https://88193776.4-ai-staging.pages.dev` and alias `https://4-ai-staging.pages.dev/` both resolve to staging worker in live HTML; `https://restless-lab-d737-staging.shelckograff.workers.dev/` returns `200 OK`.


### HOME-covered legacy NEW closeout — 2026-07-15

**Статус:** Закрыто на staging
**Что подтверждено:** `NEW-010`, `NEW-011`, `NEW-013` больше не воспроизводятся на `https://88193776.4-ai-staging.pages.dev`: old `Завершить` buttons absent, home split into focus/metrics/top rows, focus copy compact.


### Remaining NEW UI closeout — 2026-07-15

**Статус:** Закрыто на staging, без production/main
**Что подтверждено:** `NEW-003`, `NEW-004`, `NEW-005`, `NEW-007` прошли live headless smoke на real staging user.
**Что исправлено кодом:** `NEW-012` completed/history stats теперь получают полный `allTasksCache`, а не active-only; `NEW-016` focus-card получил safe text space перед декоративным блоком.
**Fresh deploy / smoke:** `https://88193776.4-ai-staging.pages.dev`; done task отображается в `#stats-done-list`, focus contentRight=209 < decorLeft=237.


### UI Ready-for-QA smoke — 2026-07-15

**Статус:** Частично закрыто, без production/main
**Контекст:** Старый direct Pages deployment `https://c4b8195f.4-ai-staging.pages.dev` ещё отдавал runtime с `ReferenceError: buildReferralLink is not defined`, хотя текущий `origin/feat/admin-tariff-api` уже содержал фикс.
**Что сделано:** Выполнен fresh deploy staging Pages project `4-ai-staging` на `https://44ccd355.4-ai-staging.pages.dev` и headless browser smoke с новым staging user + seeded real tasks.
**Что подтверждено:** `AUTH-SHELL`, `NEW-002`, `NEW-009`, `NEW-014`, `NEW-015`, `NEW-021` зелёные на live staging. `HOME-001` базово зелёный по auth/home/top-3/focus, но оставлен Ready for QA до ручного visual pass в обеих темах. `BACK-056` smoke-only зелёный, но after-22 сценарий не мокался. `ONBOARD-001` также закрыт fresh empty-account smoke: guided-card, steps, quick-add, AI-chat and voice CTA all opened.
**Что важно для QA:** использовать прямой URL `https://44ccd355.4-ai-staging.pages.dev`, alias `https://4-ai-staging.pages.dev/` может отставать.


### Ручные секреты Юрия — 2026-07-14

**Статус:** Зафиксировано  
**Контекст:** Юрий вручную обновил Cloudflare secrets для живых smoke-сценариев.  
**Что выставлено:** `BOT_TOKEN` в production и staging; `VK_ID_CLIENT_ID` и `VK_ID_CLIENT_SECRET` в production.  
**Что это меняет:** по `BACK-045` VK ID больше не упирается в отсутствие production client credentials; главным внешним блокером для полного live smoke остаются `YANDEX_CLIENT_ID` и `YANDEX_CLIENT_SECRET`.
**Локальный runtime note для Юрия:** Cloudflare secrets уже не блокер, но локальный `4e-worker` всё ещё расходится по именам env: `src/bot/config.js` ожидает `BOT_TOKEN` и `ANTHROPIC_API_KEY`, а локальный `4e-worker/.dev.vars` сейчас хранит `BOT_API_TOKEN` и `ANTHROPIC_KEY`. Из-за этого `npm run start` падает с `BOT_TOKEN не задан`, пока не сделать явный mapping этих двух переменных или не унифицировать имена.
**Staging deploy note:** alias `https://4-ai-staging.pages.dev/` может отставать от свежего Pages deploy; для smoke фиксов 2026-07-15 использовался прямой URL `https://73d33de6.4-ai-staging.pages.dev`.

**Roadmap:** обновлялся в нескольких ветках; итог сводится в `shared/ROADMAP.md`.  
**Backlog:** обновлялся параллельно с roadmap и QA-очередью; итог сводится в `pm/backlog.md`.  
**Bugs:** актуальные связи багов и задач живут в `pm/bugs.md`.  
**Процесс:** team-sync протокол и правило «Юрий работает с Git через Claude» уже в `main`.  
**Блокеры:** нет системного блокера по самому протоколу; дальше важна дисциплина commit/push/update.

## Последняя сессионная запись Codex, сохраненная из старого формата

### 2026-07-08

- **Статус:** In Progress
- **Что сделал:**
  - Закрыта Задача 0 процесса: зафиксирована текущая сессионная гигиена в WORK_LOG, подготовлен/обновлён чек-лист по кодировке и UI-архитектуре.
  - Открыт новый `shared/WORK_LOG.md` шаг для 2026-07-08.
  - Подготовлен новый `pm/team-sync.md` с обязательными полями синка.
- **Ветка / commit / PR:** `feat/admin-tariff-api` (локально, до коммита и пуша)
- **Что проверить:**
  - `shared/WORK_LOG.md` содержит запись `2026-07-08`.
  - `AGENTS.md` содержит новый пункт `pm/team-sync.md` в списке обязательного чтения и правило о кодировке.
  - `scripts/check-ui-architecture.sh` содержит дополнительную грубую проверку кодировки.
- **Блокеры:** нет
- **Следующий шаг:** закрыть текущий процессный хвост и переходить к ZONE 1 — NEW-006 / BACK-049 / BACK-046.


### BACK-060 second pass — 2026-07-15

**Статус:** Ready for QA
**Что произошло:** первый fix-коммит `54583de` попал на staging, но не закрыл дыру: unsigned `get-chat-members` всё ещё давал `200`. Вторым проходом guard был упрощён и перенесён в явные route-level `x-action` ветки worker-а.
**Что подтверждено live:** после second-pass deploy unsigned `get-chat-members` на staging начал возвращать `403 {"ok":false,"error":"bot signature invalid"}`.
**Что осталось:** отдельный QA-проход с signed bot-request (`200`) для полного закрытия `BACK-060`.

### BACK-060 signed smoke complete — 2026-07-15

**Статус:** Done
**Что подтверждено:** после second-pass worker fix `f9e840a` и staging deploy Юрий прогнал signed smoke с реальным `BOT_TOKEN`: signed `get-chat-members` вернул `200 {"ok":true,"members":[]}`. В паре с уже подтверждённым unsigned `403` это закрывает `BACK-060`.

### Payment provider P0 recheck — 2026-07-15

**Статус:** CloudPayments Done, Telegram Stars Ready for QA
**Что подтверждено:** повторный autonomous staging smoke прогнан с правильным provider wire-format. CloudPayments form-urlencoded callback с валидным `Content-HMAC` подтвердил positive activation, `badAmount -> 400 {"code":11}` и replay без повторного продления. Telegram Stars signed completion со строковым `invoice_payload` подтвердил positive activation, wrong amount rejection и replay `duplicate:true`.
**Почему статусы изменились:** прежние красные результаты были артефактами synthetic smoke: CloudPayments отправлялся JSON body вместо CloudPayments form callback, а Stars `payload` отправлялся объектом `{ invoiceId }` вместо строки, которую реально шлёт Telegram bot (`payment.invoice_payload`).
**Остаток:** для `BACK-010` реальная покупка Stars в Telegram всё ещё не выполнялась, поэтому статус не `Done`, а `Ready for QA`.

## BACK-007 RKN/privacy closeout — 2026-07-15

- Проверено на live staging после fresh Pages deploy: direct URL `https://88193776.4-ai-staging.pages.dev/privacy.html` и alias `https://4-ai-staging.pages.dev/privacy.html` после 308 redirect возвращают `200`, содержат `Политика конфиденциальности` и номер РКН `102299/77`.
- В source UI ссылки на `privacy.html` присутствуют на login/register и onboarding. `BACK-007` переведён в Done в backlog/roadmap.

## BACK-038 / ANALYTICS-001 closeout — 2026-07-15

- Live API smoke на staging: fresh register OK, `plan-view`, `focus-open`, `statistics-open` в `/analytics/lite-event` вернули `200 {"ok":true}`.
- Remote D1 `audit_events` подтвердил по marker `codex-back038-closeout`: `lite-plan-view=1`, `lite-focus-open=1`, `lite-statistics-open=1`.
- Admin `/analytics/summary` с действующим header вернул `200` и ненулевые counters: `auditEvents.total=85`, `planView.d1=10`, `focusOpen.d1=4`, `statisticsOpen.d1=6`. `BACK-038` и `ANALYTICS-001` переведены в Done.

## BACK-059 bug-status sync — 2026-07-15

- `BACK-059` уже был `Done` по staging negative tests через reversible expired fixture. Документальная рассинхронизация закрыта: `BUG-2026-07-15-004` переведён в `Done` без изменений runtime-кода.

## Bug status closeout from existing live smoke — 2026-07-15

- По уже записанным live-smoke результатам закрыты `BUG-2026-07-14-004`, `BUG-2026-07-15-001`, `BUG-2026-07-15-002`, `BUG-2026-07-14-003`. Ручные хвосты вроде profile mobile, bottom-nav width, after-22 copy и Telegram fallback не тронуты.

## BACK-051 account merge toast — 2026-07-15

- Email-login и Telegram legacy уже показывали `showAccountMergeToast(d)` при `accountMerged`; OAuth callback VK/Yandex теперь тоже не дублирует обычный welcome-toast после merge. `BACK-051` синхронизирован в backlog как `Done`.

## BACK-056 after-22 focus copy closeout — 2026-07-15

- Current home focus copy no longer has an hour-based branch, so the old after-22 negative-time bug has no runtime path. `BACK-056` and `BUG-2026-07-05-003` moved to `Done`; unrelated demo text containing `до конца дня` was not part of focus-copy.

## SMART-001/002/006 status sync — 2026-07-15

- По уже записанным staging-smoke evidence закрыты `SMART-001`, `SMART-002`, `SMART-006`. `SMART-004` сознательно оставлен `Ready for QA`, чтобы не подменять живой bot-flow документальной синхронизацией.

## BACK-060 / BUG-2026-07-15-005 status sync — 2026-07-16

- `BACK-060` уже был `Done` по двум live доказательствам: unsigned `403 bot signature invalid`, signed `200 {"ok":true,"members":[]}`.
- Сверено, что текущие bot runtime paths используют `workerFetch()`, а не прямой unsigned `fetch`. Документальная рассинхронизация закрыта: `BUG-2026-07-15-005` переведён в `Done`.

## BUG-2026-07-04-003 enter-login status sync — 2026-07-16

- Старый bug про Enter на email-входе закрыт по code path: `#form-login` получает `keydown` listener в `platform-adapter.js`, а `submitLoginOnEnter()` вызывает `doLogin()` из обоих полей. Статус переведён в `Done`.

## BUG-2026-07-05-001 bottom nav width status sync — 2026-07-16

- `BACK-046` уже был `Done`; связанный bug про растянутый bottom-nav закрыт по source-check: app/container и оба nav-варианта ограничены шириной app, а не viewport.

## BACK-055 notifications action-feed source QA — 2026-07-16

- `BACK-055` закрыт по source QA: notifications action-feed покрывает filters, empty states, `К задаче`, `Готово`, `Отложить` с quick snooze, `Написать` для waiting-like payload и safe fallback без `taskId`.

## BACK-016 extended profile source QA — 2026-07-16

- `BACK-016` закрыт: extended profile fields и statuses есть в `index.html`; photo preview после удаления duplicate avatar теперь работает через текущий `#profile-avatar`.

## BACK-039 completed tasks dashboard — 2026-07-16

- `BACK-039` закрыт runtime-правкой в `index.html`: вкладка `Выполнено` получила мини-дашборд `Сегодня / 7 дней / 30 дней` и сворачиваемую секцию `За неделю` со списком завершённых задач. Live visual smoke не выполнялся.

## BACK-028 productivity statistics source QA — 2026-07-16

- `BACK-028` закрыт по source/runtime check: статистика считает прогресс и недельный график по `allTasksCache`, показывает активные задачи, обещания, выполненные/историю и советы 4. Заодно поправлен видимый mojibake стрелки периода в stats header через HTML-entity.

## BACK-032 task chat/comments source QA — 2026-07-16

- `BACK-032` закрыт по source QA без runtime-изменений: фронт task-detail отправляет user comment, получает AI reply/actions и сохраняет обе стороны через `/messages/task`; worker authenticated endpoint проверяет ownership задачи и хранит bounded KV history.

## SMART-008 chat actions source QA — 2026-07-16

- `SMART-008` закрыт по source QA: общий AI-chat и task-detail chat показывают action preview и выполняют действия только после подтверждения; поддержаны `complete/reschedule/edit/remind/show`.

## SMART-009 one clarification question — 2026-07-16

- `SMART-009` закрыт runtime-правкой в `index.html`: при создании задачи из AI-chat без дедлайна/исполнителя показывается один clarification question с кнопками, pending draft сохраняется в `askHistory`, а после выбора создаётся задача.

## SMART-010 task dedup source QA — 2026-07-16

- `SMART-010` закрыт по source QA: `saveTaskWithDedup()` применяется в ручном и AI creation path, ищет похожую активную задачу, спрашивает пользователя через confirm и по OK объединяет полезные поля в существующую задачу.

## SMART-012 adaptive briefing source QA — 2026-07-16

- `SMART-012` честно оставлен `Partial Done`: adaptive briefing time реализован через local activity memory и автосохранение `briefingTime`, но adaptive scheduling обычных task-reminders не найден.

## VIRAL-002 referral source QA — 2026-07-16

- `VIRAL-002` закрыт по source QA: frontend строит/копирует referral link и показывает counter; worker начисляет +30 дней обоим, увеличивает `referralCount`, отдаёт code/count в `publicUser()` и принимает `ref` во всех auth paths.

## BACK-037 CI/API smoke source QA — 2026-07-16

- `BACK-037` закрыт: `api-smoke.yml` запускает `npm run api-smoke`, smoke script покрывает auth/tasks/share/transcribe negative path, а `path-guard.yml` гоняет portable path, encoding и UI architecture guards с установленным `ripgrep`.
