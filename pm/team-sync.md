# Team Sync

## 2026-07-21 - Codex - liquid-glass system needs review

- Branch: `feat/admin-tariff-api`.
- Inbox: `BRIEF-2026-07-21-night-liquid-glass-system` marked `NEED-CLAUDE`.
- Result: no runtime code changed; cross-screen liquid-glass implementation is broad redesign architecture work and needs a reviewed pilot plan.
- Report: `pm/outbox/REPORT-BRIEF-2026-07-21-night-liquid-glass-system.md`.
- Next: Claude/Yuri should choose the first target surface and approve token/SVG/click-state handling.

## 2026-07-21 - Codex - FILE_MAP UI sync

- Branch: `feat/admin-tariff-api`.
- Inbox: `BRIEF-2026-07-20-28-file-map-sync-audit` marked `DONE`.
- Result: `FILE_MAP_UI.md` screen anchors and top-level `index.html` ranges synced to current committed file; product code untouched.
- Report: `pm/outbox/REPORT-BRIEF-2026-07-20-28-file-map-sync-audit.md`.
- Next: optional future cleanup can split external script maps for `auth-handlers` and `platform-adapter` semantics.

## 2026-07-21 - Codex - BACK-049 guard evidence

- Branch: `feat/admin-tariff-api`.
- Inbox: `BRIEF-2026-07-20-27-back049-ui-guard-evidence-upgrade` marked `DONE`.
- Result: evidence upgraded with exact guard pattern references, current-HEAD guard output, and a negative scratch test that fails on inline-handler growth.
- Report: `pm/outbox/REPORT-BRIEF-2026-07-20-27-back049-ui-guard-evidence-upgrade.md`.
- Next: treat BACK-049 as proven process/tooling guard, not staging runtime behavior.

## 2026-07-21 - Codex - GPT-QA layout overlaps

- Branch: `feat/admin-tariff-api`.
- Inbox: `BRIEF-2026-07-20-26-layout-overlaps-from-gpt-qa` marked `DONE`.
- Result: CSS-only safe-area/nav fixes for subscription CTA reserve, chat conversation bottom controls, and auth/public nav visibility; CSS artifacts rebuilt.
- Report: `pm/outbox/REPORT-BRIEF-2026-07-20-26-layout-overlaps-from-gpt-qa.md`.
- Next: visual re-check on the next direct staging/preview deployment; no production deploy was performed.

## 2026-07-21 - Codex - preview state flags

- Branch: `feat/admin-tariff-api`.
- Inbox: `BRIEF-2026-07-20-23-preview-state-flags-for-qa` marked `DONE`.
- Result: added gated preview-only `previewUser`, `previewTasks`, `previewApi`, and `previewTheme` flags for GPT visual QA; production/shared staging/runtime entitlement/payment/auth paths are untouched.
- Report: `pm/outbox/REPORT-BRIEF-2026-07-20-23-preview-state-flags-for-qa.md`.
- Next: use a direct `*.4-ai-staging.pages.dev` deployment URL for the QA matrix; shared alias intentionally does not activate these flags.

## 2026-07-21 - Codex - ARCH-001 helper extraction

- Branch: `feat/admin-tariff-api`.
- Inbox: `BRIEF-2026-07-20-22-arch001-continue-split` marked `DONE`.
- Result: moved only the pure inline `esc()` helper to `scripts/platform-adapter.js` as `escapeInlineHandlerValue()`, keeping the existing inline alias and fallback behavior in `index.html`.
- Report: `pm/outbox/REPORT-BRIEF-2026-07-20-22-arch001-continue-split.md`.
- Next: continue NEW inbox briefs; leave broad/global-heavy inline extraction for separate reviewed ARCH-001 slices.

## 2026-07-21 - Codex - daily runner pre-sync

- Branch: `feat/admin-tariff-api`.
- Sync: `git fetch` and `git pull --ff-only` completed after temporarily stashing local PM/documentation edits.
- Result: resolved PM-doc conflicts from local manual QA notes versus fresh origin; preserved both sides and renumbered local collision IDs to `BUG-2026-07-21-005..008` and `BACK-064..066`.
- Report: `pm/outbox/REPORT-4e-pm-inbox-daily-runner-presync-2026-07-21.md`.
- Next: continue processing `pm/inbox` NEW briefs oldest-first; no production/main/payment/entitlement/CAL/secret work.

## 2026-07-21 - Codex - pre-dawn inbox/backlog runner

- Branch: `feat/admin-tariff-api`.
- Inbox: no executable `status: NEW` non-template `BRIEF-*.md` files.
- Result: completed 1 safe docs/status whitelist task; synced stale `docs/tasks/BACK-056-home-focus-time-copy.md` from `Todo` to `Done` with closeout evidence.
- Report: `pm/outbox/REPORT-4e-pre-dawn-inbox-and-whitelist-backlog-runner-2026-07-21.md`.
- Next: remaining open rows require manual TMA/device/provider/OAuth/bot/payment QA, Yuri/Claude review, product decisions, CAL/post-beta work, prod/main actions, or broader runtime refactors.

## 2026-07-21 - Codex - night inbox/backlog runner

- Branch: `feat/admin-tariff-api`.
- Inbox: no `status: NEW` non-template `BRIEF-*.md` files.
- Result: completed 1 safe docs/PM whitelist task; synced stale `BACK-021` and `SMART-011` roadmap statuses with current backlog evidence.
- Report: `pm/outbox/REPORT-4e-night-inbox-and-whitelist-backlog-runner-2026-07-21.md`.
- Next: remaining open rows are manual/device/provider/auth-review/payment/CAL/product/prod/main gated or already assigned to Claude/Yuri decisions.

## 2026-07-20 - Codex - auth/avatar diagnose

- Branch: `feat/admin-tariff-api`.
- Scope: diagnosed the requested morning-refine auth/avatar bugs on live staging fresh accounts; did not change auth/password/merge logic.
- Result: added `npm run smoke:auth-avatar`; report status is `NEED-CLAUDE`.
- Root causes: password inline error target misses `#login-pass-error`; profile avatar draft uses global `extendedProfileDraft`; photo save is local-only and not restored in a fresh browser.
- Next: Claude should review and implement a narrow fix plan before app/runtime changes.

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
- Superseded 2026-07-20: evidence upgraded from source QA to LIVE headless proof through `npm run smoke:back055` at 390x844.

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

## BACK-057 offline free mode MVP — 2026-07-16

- `BACK-057` продвинут до `Partial Done`: localStorage-кэш задач и очередь `save/update/done/delete` работают через общий mutation path; при возврате сети queued-изменения синхронизируются. Queued-задачи показывают `ждёт синхронизации` в home meta и task-card badge. До полного Done остаются Free-лимиты, offline AI draft и Premium Sync.

## VIRAL-001 share card MVP — 2026-07-16

- `VIRAL-001` продвинут до `Partial Done`: home получила кнопку `Поделиться планом дня`, canvas генерирует PNG-карточку 1080x1350 с метриками/top задачами/watermark, native share используется при поддержке, иначе fallback на download. Live VK/TG share smoke остаётся ручным.

## VIRAL-004 share card streak — 2026-07-16

- `VIRAL-004` закрыт runtime-правкой: share-card теперь добавляет streak `N дней с планом` и 2–3 достижения на основе локальных created/done timestamps.

## VIRAL-006 weekly share summary — 2026-07-16

- Home получила кнопку `Итоги недели`; weekly-card генерирует PNG mini-Wrapped за последние 7 дней: закрыто, новых задач, дней с планом, ритм по дням, последние закрытые задачи и фокус-бейджи.
- `VIRAL-006` переведён в `Partial Done`: runtime MVP готов, но завтра нужен ручной visual/share smoke на телефоне и отдельное решение, нужна ли AI-текстовка поверх статистики.

## VIRAL-003 restrained 4 persona — 2026-07-16

- Home focus-card и AI planner summary получили единый спокойный голос `4`: `4 рядом`, `я держу фокус`, `я держу спокойный штаб`, next-step copy.
- `VIRAL-003` переведён в `Partial Done`: runtime tone MVP готов; brand bible, аватарные правила и VK Clips остаются отдельным продуктовым хвостом.

## PLAT-002 PWA wrapper groundwork — 2026-07-16

- Добавлены `manifest.webmanifest`, PWA meta в `index.html`, регистрация `sw.js` и service worker с network-first navigation/offline shell cache.
- `scripts/build-pages-whitelist.mjs` теперь копирует `sw.js` в Pages artifact.
- `PLAT-002` переведён в `Partial Done`: installed-PWA smoke, PNG/maskable icons и публикация в RuStore остаются отдельными шагами.

## BETA-001 closed beta runbook — 2026-07-16

- Добавлен `pm/beta-run-2026-07.md`: кого звать, текст приглашения, smoke перед приглашением, сценарии дня 1/2-3, формат feedback и критерии выхода/остановки.
- `BETA-001` переведён в `Partial Done`: runbook готов, но реальный запуск 5-10 пользователей и перенос blockers в `pm/bugs.md` остаются ручным этапом.

## FEEDBACK-001 beta feedback loop — 2026-07-16

- Добавлен `pm/feedback-loop-2026-07.md`: канал связи, сообщение тестеру, ежедневный разбор, формат bug-записи, daily-сводка и правило не раздувать скоуп.
- `FEEDBACK-001` переведён в `Partial Done`: процесс готов, но реальный beta-feedback и первые blockers в `pm/bugs.md` остаются ручным этапом.

## INFRA-006 workspace unification plan — 2026-07-16

- Добавлен `pm/infra-006-workspace-unification.md`: каноничные app/worker папки, preflight-команды, маркировка `DO_NOT_WORK_HERE`, безопасный аудит копий и критерии Done.
- `INFRA-006` переведён в `Partial Done`: план готов, но ручное архивирование/удаление копий и закрепление правила остаются за Юрием/Алексеем.

## BACK-011 command workspace spec — 2026-07-16

- Добавлен `docs/tasks/BACK-011-command-workspace.md`: MVP/non-goals, роли, data model, API sketch, UI sketch, AI/privacy rules и phased DoD.
- `BACK-011` переведён в `Partial Done`: spec готов, реализация backend/frontend и QA с двумя аккаунтами остаются отдельными этапами.

## PLAT-003 TWA/Capacitor roadmap — 2026-07-16

- Добавлен `docs/tasks/PLAT-003-twa-capacitor-roadmap.md`: PWA prerequisites, Google Play TWA phase, App Store/Capacitor phase, payment-policy risks, non-goals и DoD.
- `PLAT-003` переведён в `Partial Done`: roadmap готов, реальные wrappers/store assets/payment decision/manual smoke остаются следующими этапами.

## Product decisions: calendar / omni / native sequencing — 2026-07-16

- Добавлен `docs/tasks/PRODUCT-DECISIONS-2026-07-16.md`: северная звезда 4, beta gate, решения по calendar/omni/native/growth/workspace и anti-scope rules.
- `CAL-001` и `OMNI-001` переведены в `Partial Done`; `CAL-002` и `CAL-003` переведены в `Deferred` до beta/CAL readiness.
- Ключевое решение: сначала closed beta и retention blockers, затем calendar layer; новые native/platform launches не стартуют до доказанного repeat usage.

## Product decisions: onboarding wow + OAuth profile consent — 2026-07-16

- Добавлены `docs/tasks/VIRAL-005-first-ai-plan-wow.md` и `docs/tasks/BACK-058-oauth-profile-consent.md`.
- `VIRAL-005` переведён в `Partial Done`: wow moment остаётся в first empty home, не отдельный wizard; нужны activation event и fresh-account smoke.
- `BACK-058` переведён в `Deferred`: не просим email/phone/birthdate про запас; каждое поле только с отдельным consent и понятной value после BACK-045/beta.

## Product decisions: native/platform sequencing — 2026-07-16

- Добавлен `docs/tasks/NATIVE-PLATFORM-DECISIONS-2026-07-16.md`: порядок NATIVE/PLAT, решения по share sheet/widgets, push actions, voice shortcuts, system calendar, geofencing и MAX.
- `PLAT-001` и `NATIVE-001..005` переведены в `Deferred`: не стартуют до beta/native wrapper/CAL readiness и отдельного брифа.
- Приоритет после beta: share sheet/widgets -> push actions -> voice shortcuts -> system calendar -> geofencing.

## Release and beta gates — 2026-07-16

- Добавлен `docs/tasks/RELEASE-BETA-GATES-2026-07-16.md`: beta gate, manual-QA список, payment gate, production gate, success metrics и stop conditions.
- `BETA-001` обновлён ссылкой на release gate; Ready for QA пункты не закрывались без ручного smoke.
- Утренний порядок: manual QA -> auth/task-save/mobile -> share/PWA -> beta invite только после P0/P1 sanity.

## Monetization decisions — 2026-07-16

- Добавлен `docs/tasks/MONETIZATION-DECISIONS-2026-07-16.md`: payment-ready criteria, trial/beta policy, VK Pay, Telegram Stars, admin tariff и beta monetization posture.
- `BACK-009`, `BACK-010`, `BACK-040` оставлены `Ready for QA`, но получили явные paid-launch gates; цену не меняли.
- Главное: VK Pay UI-entrypoint не равен paid-ready; Telegram Stars backend evidence сильный, но публичный paid launch требует production smoke/support policy.

## Ready for QA triage — 2026-07-16

- Добавлен `pm/ready-for-qa-triage-2026-07-17.md`: P0/P1 before beta, bot/group flow, payment QA, product/UI later QA и правила pass/fail.
- Backlog-статусы не закрывались: документ нужен для завтрашнего ручного smoke и beta go/no-go.

## Beta invite pack — 2026-07-16

- Добавлен `pm/beta-invite-pack-2026-07.md`: кого звать первым, приглашение, follow-up 2-4 часа, follow-up день 2, ответы на blocker/feature request/payment question и daily summary.
- `BETA-001` дополнен ссылкой на invite pack; реальная рассылка остаётся ручным этапом после beta gate.

## Post-beta decision tree — 2026-07-16

- Добавлен `pm/post-beta-decision-tree-2026-07.md`: cases A-F для core broken, weak retention, time realism, outside capture, reminders value и team promises.
- `FEEDBACK-001` дополнен ссылкой на decision tree; реальное применение после beta-feedback остаётся ручным этапом.

## Morning command center — 2026-07-16

- Добавлен `pm/morning-command-center-2026-07-17.md`: единый вход на утро, порядок core QA, beta invite, fail-path, post-beta decision tree, список `не трогать утром` и шаблон отчёта.
- Runtime/backlog статусы не менялись.

## Night handoff — 2026-07-16

- Добавлен `pm/night-handoff-2026-07-16-to-17.md`: HEAD, runtime/doc commit list, что открыть утром, pass/fail path, список `не трогать` и известный dirty artifact.
- Следующий шаг: ручной QA утром по `pm/morning-command-center-2026-07-17.md`.

## BACK-012 CSS architecture plan — 2026-07-16

- Добавлен `docs/tasks/BACK-012-css-architecture-plan.md`: current state, запрет broad refactor до beta, allowed pre-beta fixes, post-beta BEM-island cleanup и DoD.
- `BACK-012` оставлен `Partial Done`; runtime-код не трогали.

## SMART-012 adaptive reminders plan — 2026-07-16

- Добавлен `docs/tasks/SMART-012-adaptive-reminders-plan.md`: current state, запрет расширять reminders до beta, signals, MVP phases, non-goals и DoD.
- `SMART-012` оставлен `Partial Done`; adaptive task reminders deferred until beta proves reminder value.

## BACK-057 offline mode plan — 2026-07-16

- Добавлен `docs/tasks/BACK-057-offline-mode-plan.md`: current state, Free offline scope, Premium Sync separation, manual QA requirements and DoD.
- `BACK-057` оставлен `Partial Done`; manual offline smoke is required before Done.

## 2026-07-17 — next-cycle operating matrix

- Next-cycle matrix added: `pm/next-cycle-matrix-2026-07-17.md`.
- Morning QA should start from the matrix plus `pm/morning-command-center-2026-07-17.md`.
- If morning QA finds auth/task/composer/paywall/analytics regressions, fix those before beta invites or any new product slices.
- CAL remains out of scope for this branch unless explicitly re-opened in a separate branch/brief.
## 2026-07-17 — QA result intake

- Manual QA should record results in `pm/qa-results-2026-07-17.md`.
- Only factual failures from that file should be copied into `pm/bugs.md` and promoted into backlog status changes.
- P0/P1 fixes remain the only runtime work before beta invite decisions.
## 2026-07-17 — docs tail closeout

- Tail closeout added: `pm/tail-closeout-2026-07-17.md`.
- Handoff addendum added: `pm/night-handoff-addendum-2026-07-17.md`.
- Remaining open work is intentionally manual-QA-gated or secret/platform-gated; do not treat it as a coding tail without fresh evidence.
## 2026-07-17 — INFRA-006 preflight checklist

- Before new app work, use `.tmp-4e-app-publish` as the current canonical app folder for `feat/admin-tariff-api` unless a separate migration decision is made.
- Before worker work, confirm whether `4e-worker` or `4e-worker-p0` is authoritative for that exact task.
- New checklist: `pm/infra-006-preflight-checklist.md`.
## 2026-07-17 — Cloudflare secrets installed by Yuri

- Yuri installed these Worker secrets via local PowerShell/Wrangler for staging and production: `BOT_TOKEN`, `VK_ID_CLIENT_ID`, `VK_ID_CLIENT_SECRET`, `YANDEX_CLIENT_ID`, `YANDEX_CLIENT_SECRET`.
- Secret values were not shared in chat and must not be written to repo files.
- `BACK-045` is now unblocked for staging OAuth smoke; it is not Done until browser callback/login is verified.
## 2026-07-17 — BACK-017 notification smoke

- `BACK-017` now has a delivery-smoke checklist: `docs/tasks/BACK-017-notifications-delivery-smoke.md`.
- Do not mark it Done from API/source evidence alone; it needs a real Telegram delivery to the intended linked user.
## 2026-07-17 — BACK-010 payment support policy

- Payment support/reversal policy added: `docs/tasks/BACK-010-payment-support-policy.md`.
- This does not change price or launch production payments; it defines what support should do if a real payment succeeds but entitlement does not, or if callbacks are replayed/bad/wrong amount.
## 2026-07-17 — BACK-009 VK Pay paid-readiness guard

- VK Pay verification plan added: `docs/tasks/BACK-009-vk-pay-verification-plan.md`.
- VK Pay UI entrypoint is not enough for paid launch; entitlement must come only after backend-verified payment and negative tests.
## 2026-07-17 — BACK-040 tariff config readiness

- Tariff config readiness checklist added: `docs/tasks/BACK-040-tariff-config-readiness.md`.
- Do not treat admin tariff API as paid-launch-ready until production `/tariff-config` is proven intentional and payment amount gates match it.
## 2026-07-16 — project workspace moved to X drive

- New canonical project root: `<project-root>`.
- New app path: `<app-repo-root>`.
- New worker path: `<worker-repo-root>`.
- Old `<old-project-root>` copy is retained as rollback/archive and should not be edited for new work unless explicitly doing recovery.
- Migration handoff: `pm/infra-006-x-drive-migration-2026-07-16.md`.
## 2026-07-16 — BACK-019 mobile card QA

- Task-card mobile smoke checklist added: `docs/tasks/BACK-019-task-card-mobile-smoke.md`.
- Superseded 2026-07-19: `BACK-019` is Done after the 390x844 headless mobile smoke verified tap, swipe actions, overflow, title clamp, and bottom-nav clearance.
## 2026-07-16 — SMART-011 group reminder QA

- Waiting-on-people live smoke checklist added: `docs/tasks/SMART-011-waiting-on-people-smoke.md`.
- Do not mark `SMART-011` Done until a real Telegram/group smoke confirms recipient, copy, and no-spam behavior.
## 2026-07-16 — SMART-004 group capture QA

- Group task capture smoke checklist added: `docs/tasks/SMART-004-group-task-capture-smoke.md`.
- Do not mark `SMART-004` Done until a real Telegram group confirms correct user/context mapping and no-spam behavior.
## 2026-07-16 — BACK-050 accessibility QA

- Accessibility smoke checklist added: `docs/tasks/BACK-050-accessibility-smoke-checklist.md`.
- Do not mark `BACK-050` Done until keyboard/focus/error/live-region behavior is checked manually.
## 2026-07-17 — NEW-006 TMA safe-area QA

- Telegram Mini App safe-area smoke checklist added: `docs/tasks/NEW-006-tma-safe-area-live-smoke.md`.
- Do not mark `NEW-006` Done from browser/headless evidence alone; it needs real Telegram Mini App confirmation.
## 2026-07-17 — NEW-008 chat keyboard QA

- Chat keyboard live smoke checklist added: `docs/tasks/NEW-008-chat-keyboard-live-smoke.md`.
- Do not mark `NEW-008` Done from local/headless evidence alone; it needs live mobile keyboard/TMA confirmation.
## 2026-07-17 — BACK-057 scope question before further offline work

- Before touching Offline Free Mode runtime again, resolve whether the existing `BACK-057` runtime MVP was explicitly briefed/approved after the 2026-07-14 no-touch guard.
- Scope audit doc: `docs/tasks/BACK-057-offline-runtime-scope-audit.md`.
- Until answered: no offline runtime expansion, no blind revert; only docs/QA planning is safe.
## 2026-07-17 — CRLF incident guardrail

- Worker CRLF incident documented: `docs/tasks/INFRA-006-worker-line-ending-incident-2026-07-17.md`.
- `<worker-repo-root>` is fixed with `.gitattributes` and local `core.autocrlf=false`.
- `<app-repo-root>` and `<worker-p0-archive>` still have the same line-ending risk (`core.autocrlf=true`, no `.gitattributes`), so avoid broad checkout/pull/renormalize there until a separate policy commit is made.
## 2026-07-17 — BUG-005 old brief reconciled

- Old BUG-005 brief reviewed against current worker/backlog state.
- `BACK-060` is the current owner and is already Done with route-level bot signature guard plus staging signed/unsigned smoke evidence.
- New reconciliation doc: `docs/tasks/BACK-060-bot-path-signature-reconciliation.md`.
- No worker deploy, prod deploy, main merge, CAL, or price change was made in this reconciliation.

## 2026-07-17 — BUG-005 exact exploit re-smoke

- Fresh staging smoke against `restless-lab-d737-staging` proved the original unsigned `save-task` exploit is closed for a freshly linked Telegram user.
- Exact result: unsigned `save-task` with `telegramUserId=7910751623` returned `403 {"ok":false,"error":"bot signature invalid"}`; `/tasks` stayed `[]` before and after.
- Additional unsigned `done-task` / `delete-task` with `telegramUserId` also returned `403`.
- Sibling checks `update-task` and `set-reminder` with bot-style `telegramUserId` returned `401 Не авторизован`, so no unsigned effect was observed there.
- `pm/bugs.md` CP1251 mojibake was repaired and `scripts/check-cp1251-mojibake.mjs` now passes with `0 suspicious tokens`.
- Signed positive path was not re-run from Codex because this process had no local `BOT_TOKEN`; earlier Юрий signed smoke remains the BACK-060 positive evidence.

## 2026-07-17 — worker canonical path and BACK-057 scope answer

- Canonical worker repo is now fixed: `<worker-repo-root>`.
- `<worker-p0-archive>` was confirmed as a duplicate clone of `mrktggod/4e-worker` and archived to `<worker-p0-archive>`.
- The archive contains `DO_NOT_WORK_HERE.txt`; do not run git, edit, deploy or smoke from it except for explicit recovery.
- BACK-057 scope audit answered from repo traces: no explicit authorization brief was found after the 2026-07-14 no-touch guard. Treat the existing Offline Free Mode runtime MVP as unauthorized scope expansion until Yuri decides keep vs quarantine/revert.
- No runtime code was changed in this scope decision.

## 2026-07-17 — automated staging QA slice

- Autonomous QA slice from `pm/next-cycle-matrix-2026-07-17.md` passed for staging app shell, worker wiring, CORS preflight and `scripts/api-smoke.mjs`.
- Raw evidence: `docs/tasks/STAGING-AUTOMATED-QA-2026-07-17.md`.
- No new P0/P1 bug was found in the automated layer.
- Manual-only gates remain open: real browser/mobile/TMA visual checks, Telegram fallback/history behavior, OAuth provider callback, payment purchase/support gates, Telegram group flows, and Russia/no-VPN checks.
- No runtime code, price, main merge, CAL, native/store or production payment work was touched.

## 2026-07-17 — beta invite ready checklist prepared

- Prepared `pm/beta-invite-ready-checklist-2026-07-17.md` as the small human go/no-go sheet after automated staging QA.
- It does not approve or send beta invites automatically: Yuri still needs the manual browser/mobile gate from the checklist.
- The invite copy is ready, with explicit note that payment/tariffs are not being tested in this first closed beta batch.
- Recommended first batch remains 3-5 testers, not 10.

## 2026-07-17 — Partial Done runtime freeze audit

- Added `pm/partial-done-runtime-freeze-audit-2026-07-17.md` to execute the safe Section 4 part of the next-cycle matrix.
- No Partial Done item was promoted to Done from source/docs evidence alone.
- Runtime remains frozen for `BACK-057`, `PLAT-002/003`, `BACK-012/011`, `SMART-012`, `VIRAL-*`, `OMNI-001`, `CAL-001` until the required manual/device/product gate exists.
- Deferred items remain deferred: `PLAT-001`, `NATIVE-001..005`, `BACK-058`, `CAL-002/003`.
- No code, deploy, price, main merge, beta sending or production payment work was performed.

## 2026-07-17 — cycle execution report

- Added `pm/cycle-execution-report-2026-07-17.md` as a one-page handoff for the autonomous cycle.
- Latest pushed HEAD at the time of the report: `fe63484820e7c569a330a60c18d2c667adcfb981`.
- The report lists the cycle commits, automated staging evidence, manual gates still open, and the morning recommendation.
- No new runtime work was introduced by the report.

## 2026-07-17 — app gitattributes binary guard

- Reconciled stale `codex-2026-07-17-gitattributes-guard.md` with current workspace state.
- Active app repo already had `.gitattributes` and `core.autocrlf=false`; guard was expanded with binary patterns for image/pdf/zip assets without `git add --renormalize`.
- `4e-worker` canonical repo already has `.gitattributes` and `core.autocrlf=false`; only allowed untracked `kv-backups/` remains.
- `4e-worker-p0` is no longer an active repo; it is archived at `<worker-p0-archive>` with `DO_NOT_WORK_HERE.txt`, so no git/config changes were made there.
- Mojibake guard passed with `0 suspicious tokens`.

## 2026-07-17 - Evidence audit and merge-readiness gate

- Added `docs/tasks/EVIDENCE-AUDIT-2026-07-17.md`: classified audited P0/P1 `Done` / `Ready for QA` rows as `LIVE`, `SOURCE-ONLY`, `NEEDS-REAL`, or `PARTIAL`.
- Added `docs/tasks/MERGE-READINESS-2026-07-17.md`: merge/prod remains blocked by production `ANTHROPIC_API_KEY` naming mismatch, failing worker `main` deploy CI, and tariff year-price decision (`9504` source vs `9950` expected).
- No `main` merge, production deploy, price change, CAL/native change, or runtime code change was made.
## 2026-07-17 - CI token env fix prepared, price map, evidence promotion

- Worker branch fix prepared in `<worker-repo-root>\.github\workflows\deploy.yml`: `CLOUDFLARE_API_TOKEN` is now exported from repo secret `CF_API_TOKEN` for the `cloudflare/wrangler-action@v3` step. No merge to `main` and no production deploy were run; final proof is a green run after Yuri merges later.
- Added `docs/tasks/PRICE-MAP-2026-07-17.md` as a read-only map of all known `990` / `9504` RUB and Stars locations. Price was not changed.
- Extended `docs/tasks/EVIDENCE-AUDIT-2026-07-17.md`: fresh staging `telegram-merge-smoke` promotes `BACK-026` and `BUG-2026-07-14-003` to `LIVE`; UI/provider rows remain unpromoted.

## 2026-07-17 - Open bugs status sync

- `NEW-017` calendar demo/global-task risk fixed in app source and bugs table moved to `Done`.
- `NEW-001` morning briefing retry bug fixed in worker source; status is `Ready for QA` pending real Telegram delivery smoke.
- `NEW-006` and `NEW-008` bugs table synchronized to `Ready for QA`; both remain manual TMA/device checks before `Done`.

## 2026-07-17 - Staging tariff-config reseed

- Beta blocker fixed in staging data: /tariff-config now matches prod known-good runtime config for paywall text and yearly price.
- Verification after reseed: month=990/990 stars, year=9950/9950 stars, questionRuns=0.
- Source defaults still remain mapped separately in docs/tasks/PRICE-MAP-2026-07-17.md; no production/main/source price change was made here.

## 2026-07-19 - BACK-019 task cards Done

- `BACK-019` moved to `Done` after local headless Chrome mobile smoke at 390x844.
- Fixed the task-card title clamp by removing the renderer inline style that overrode `.task-card-title` CSS.
- Added `npm run smoke:back019` for repeatable checks of overflow, two-line title clamp, tap, swipe left/right, done/move actions, and bottom-nav clearance.

## 2026-07-20 - HOME-001 dashboard smoke Done

- `HOME-001` moved to `Done` after repeatable local headless Chrome/CDP smoke at 390x844.
- Added `npm run smoke:home001` for dashboard/home regressions: top-3 rows, 4 metrics, 3 bottom nav buttons, focus overlay, profile/notifications/statistics/ask/calendar routes, dark/light screenshots.
- Evidence: `docs/tasks/assets/HOME-001-dashboard-smoke-2026-07-20-dark.png`, `docs/tasks/assets/HOME-001-dashboard-smoke-2026-07-20-light.png`, report `pm/outbox/REPORT-HOME-001-dashboard-smoke-2026-07-20.md`.
- Separate manual gates remain open for TMA/device/provider/payment/auth flows; this task did not deploy, merge to `main`, touch prices, secrets, CAL, payment, or entitlement.

## 2026-07-20 - BACK-034 staging resmoke Done

- `BACK-034` automated staging contour is green again after the redesign cutover tail.
- Raw proof: `WORKER_BASE_URL=https://restless-lab-d737-staging.shelckograff.workers.dev npm run api-smoke` passed through register/login/auth-me, two-user linked task flow, task create/list/done/delete, `/anthropic`, and `/transcribe` negative.
- App shell proof: `GET https://4-ai-staging.pages.dev/ -> 200`, staging worker marker found, CORS preflight `/auth/login` from staging origin returned `204`.
- No deploy, `main` merge, prod, secrets, prices, payment, entitlement or CAL work was touched.

## 2026-07-20 - BACK-050 accessibility smoke

- Added `npm run smoke:back050` for repeatable local Chrome/CDP checks of auth labels/errors, toast status/alert live-region behavior, and quick-add/contact/focus dialog ARIA/focus at 390x844.
- Fixed critical toast detection for Cyrillic phrases: `Нет соединения` now becomes `role=alert` with `aria-live=assertive`.
- `BACK-050` stays `Ready for QA`; manual keyboard/mobile smoke remains the Done gate.

## 2026-07-20 - SMART-007 memory fixture smoke

- `SMART-007` evidence upgraded from `SOURCE-ONLY` to `LIVE` using safe staging fixture `npm run smoke:smart007`.
- Fresh synthetic account produced 4 AI-memory facts, local `#ai-memory-list` rendered them at 390x844, delete-one left 3, clear-all left 0.
- No prod, `main`, CAL, price, payment, entitlement, secrets, live Telegram/device, or real user data was touched.
