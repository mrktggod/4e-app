# REPORT — 4e full system roadmap, design, VK and QA tooling audit

Дата: 2026-07-23
Статус: DONE-DOCS / runtime untouched / NEED-CLAUDE и NEED-YURI gates вынесены отдельно
Ветка: feat/admin-tariff-api
Стартовый HEAD: 212dc58
Commit: AUDIT-DOCS-COMMIT — точный SHA фиксируется metadata follow-up после первого commit

## Итог

Система не находится в состоянии «один незакрытый редизайн». Browser baseline главной и существующие smokes зелёные, но release queue удерживают три подтверждённых P1 task-detail дефекта на iPhone/TMA, не закрытый real notification smoke, разный контракт нижней навигации и две auth-adjacent проблемы: сохранённая web-VK сессия и отсутствующие global exports для OAuth helper.

VK line функциональна как отдельная базовая версия, но parity только частичная: home/tasks/auth/theme существуют, task-detail почти read-only, notifications отсутствуют, AI-chat по ручному сигналу сломан, а direct web-VK может удалять valid token при обычном timeout.

Главная инфраструктурная рекомендация: внутренний 4e-qa-lab с детерминированными fixtures и visual matrix + один real-device provider pilot + обязательный короткий Telegram/VK manual gate. План: pm/qa-tooling-plan-2026-07-23.md.

## Что проверено и сколько

| Контур | Объём |
| --- | ---: |
| pm/inbox | 43 файла: 41 реальный brief, BRIEF-TEMPLATE.md и README |
| pm/outbox | 73 файла: 72 report и README |
| Inbox statuses | 30 DONE, 4 NEED-CLAUDE, 4 BLOCKED-CONCURRENT-WORK, 1 NEED-CLAUDE-PENDING-REVIEW, 1 NEED-YURI, 1 HOLD-MANUAL; единственный NEW — template, исполняемых NEW нет |
| Reports с хвостами | 18 NEEDS-REAL, 12 NEED-YURI, 15 NEED-CLAUDE, 11 BLOCKED, 7 SOURCE-ONLY, 13 Ready for QA, 9 PARTIAL, 17 PENDING |
| pm/backlog.md | 157 markdown data rows, 135 уникально идентифицированных задач |
| pm/bugs.md | 54 bug-table records; Active = 49 строк / 46 уникальных ID |
| shared/ROADMAP.md | 107 table records |
| docs/tasks | 65 markdown task docs + 12 assets; docs/tasks/done отсутствует |
| Git | branch/status/remotes, fetch, последние 80 commits, branch divergence и diff против origin/main |
| UI source | index.html 8746 строк, vk.html 1630, targeted LESS/JS/auth/SW sections по FILE_MAP |
| Logs/PM | DEVELOPMENT_LOG, DEVELOPMENT_HISTORY, WORK_LOG, team-sync, QA/release/manual gate docs и свежие reports |

Большие файлы читались через FILE_MAP, targeted ranges, status/ID parsers и точечный поиск, без полного вывода в консоль.

## Git и ветки

- Рабочая ветка на старте была чистой и синхронной с origin/feat/admin-tariff-api.
- HEAD 212dc58, origin/main 57ae1b4; текущая ветка на 51 commit впереди и на 0 позади origin/main.
- Diff origin/main...HEAD: 232 файла, 11 387 additions, 226 deletions.
- Production/main, merge, rebase и deploy не выполнялись.

Незавершённые ancestry-ветки:

| Ветка | Branch-only commits | Вывод |
| --- | ---: | --- |
| codex/redesign-chat-soft-glass | 6 | stale reference, не merge вслепую |
| codex/redesign-dashboard-subscription-soft-glass | 21 | stale reference, текущая реализация уже разошлась |
| codex/redesign-profile-soft-glass | 6 | stale reference |
| codex/redesign-task-detail-soft-glass | 13 | особенно опасно из-за текущих P1 |
| codex/redesign-intake-plan | 1 | docs reference |
| codex/redesign-slice-handoff | 2 | handoff/history |
| docs/qa-calendar-nav-regression-20260720 | 1 | source finding всё ещё релевантен: global center = voice |
| docs/smart-014-voice-multi-task-plan | 2 | product scope, NEED-YURI |

Старые redesign-ветки не patch-equivalent текущему HEAD. Их нужно закрыть/архивировать как superseded после решения, а не объединять.

## Inbox: актуальная классификация

| Brief | Старый статус | Актуальная классификация |
| --- | --- | --- |
| 30 focus-panel-visible-preview | BLOCKED-CONCURRENT-WORK | READY FOR VISUAL PROOF: ветка чистая, focus commit уже есть |
| 31 task-reminder-time-ios | BLOCKED-CONCURRENT-WORK | READY/FIXABLE отдельным runtime brief, P1 |
| 32 task-tag-popup-ios | BLOCKED-CONCURRENT-WORK | READY/FIXABLE отдельным runtime brief, P1 |
| 33 task-detail-hero-overflow-ios | BLOCKED-CONCURRENT-WORK | READY/FIXABLE отдельным runtime brief, P1 |
| 34 chat-history-over-40 | DONE | корректно; доказано окно 40, не storage loss |
| 35 memory regression | DONE | корректно |
| 36 privacy surface | DONE | корректно source/local; live click остаётся QA |
| 37 CI coverage | DONE | корректно |
| 38 manual gates pack | DONE | корректно |
| 39 ARCH-001 status | NEED-CLAUDE | корректно; backlog должен стать In Progress, не Done |
| 40 BACK-012 inventory | DONE | корректно |
| 41 status consistency | DONE | корректно как audit, но найденные статусы ещё не везде исправлены |

Два brief без matching report:

- BRIEF-2026-07-20-24-codex-self-visual-qa-probe.md — HOLD-MANUAL;
- BRIEF-2026-07-21-morning-refine-03-platform-global-alias-investigate.md — NEED-CLAUDE-PENDING-REVIEW.

Второй brief подтверждён текущим source audit: scripts/auth.js использует window.PLATFORM/window.WORKER, а index.html создаёт FourPlatform и lexical const PLATFORM/WORKER без window exports.

## Противоречия и PM-мусор

1. ARCH-001: pm/backlog.md:117 = Done, shared/ROADMAP.md:74 = In Progress, свежий report 39 = NEED-CLAUDE с рекомендацией In Progress.
2. bugs Active содержит 28 строк со статусом Done; они должны уйти из активного представления, но остаться в истории.
3. BUG-2026-07-20-001/002/003 каждый записан дважды с разными status tails.
4. docs/tasks/BACK-026-account-merge.md:1 ошибочно называется BACK-023.
5. pm/backlog.md:194 говорит «Непокрытых багов нет», хотя текущий реестр содержит новые P1.
6. Четыре BLOCKED-CONCURRENT-WORK brief устарели: audit начался на чистой ветке.
7. Часть reports всё ещё содержит Commit: Pending this task commit после появления реальных commits.
8. docs/tasks/MERGE-READINESS-2026-07-17.md описывает старые blockers/цену и предшествует main/prod deploy 2026-07-21; нужен superseded marker.
9. shared/DEVELOPMENT_HISTORY.md сохраняет уже закрытые reset/email debts как открытые.
10. pm/release-checklist.md требует app.4-ai.site без VPN, но roadmap 2026-07-14 явно отложил этот критерий.
11. shared/ROADMAP.md:179 называет Documents\4 архивом, тогда как текущая automation и чистая синхронная ветка работают именно здесь. Нужен человек, чтобы подтвердить новый canonical workspace.
12. shared/WORK_LOG.md = 9892 строк / 1.38 MB, смешивает верхние и нижние append, повторные entries и pending hashes.
13. docs/tasks/done отсутствует, поэтому исторические Done документы смешаны с активными.
14. Точный binary duplicate среди reports не найден, но semantic duplication и stale tails значительны.
15. CP1251 guard проходит с 0, хотя index.html содержит 823 mojibake-фрагмента box drawing «в”Ђ» в комментариях и один пользовательский «вЊ„» вместо стрелки. Диапазоны checker не включают U+2500–257F/U+2300.

## Актуальная очередь

### P0

Подтверждённых открытых P0 в текущих источниках нет. Старые P0 email/reset/entitlement/signature помечены Done и имеют live evidence. Это не разрешение трогать payments/entitlement/security.

### P1 — сначала

1. BUG-2026-07-22-001 — reminder trigger не нажимается на iPhone/TMA.
2. BUG-2026-07-22-002 — tag popup/keyboard перекрывают task-detail.
3. BUG-2026-07-22-003 — long tag/title перекрывают metadata и обрезаются.
4. После UI fixes: BUG-2026-07-21-006 / BACK-064 real notification delivery/salience, NEED-YURI.
5. NAV-CONTRACT-001 — home center AI-chat/long-press voice против global separate voice+AI.
6. PLATFORM-GLOBAL-ALIAS-001 — OAuth globals, NEED-CLAUDE.
7. VK-AUTH-SESSION-001 — web-VK valid token теряется на timeout, NEED-CLAUDE.
8. VK-AI-CHAT-001 — один diagnostic proof и fix, NEED-CLAUDE.
9. BUG-2026-07-21-005 — >40 chat-history/pagination product+API brief.
10. Ready-for-QA manual tails: privacy link, Telegram web fallback, safe area, AI keyboard, accessibility, SMART-004 group flow.

### P2

- Light-theme AI/chat/chats/chat-conv visual sweep.
- Autologin flicker shell.
- Auth legal contrast/touch targets repeat QA.
- Profile/mobile bottom reserve.
- Desktop public shell decision, NEED-YURI.
- SW/cache mixed-version validation.
- QA-ENC-001 mojibake guard gap.
- BACK-012 продолжать только малыми BEM islands после P1.

## Design audit

Полный порядок и atomic briefs: pm/design-roadmap-correction-2026-07-23.md.

Ключевые факты:

- Home smoke 2026-07-23 PASS на 390×844 dark/light, 3 task rows, 4 metric cards, scrollWidth=viewport.
- Focus panel рендерит 3 rows; latest summary нуждается в новом manual screenshot.
- Ручные iPhone screenshots остаются красными для reminder/tag/hero.
- styles/screens/tasks.less содержит 33 selector-вхождения detail-redesign-hero — признак cascade override debt.
- styles/screens/voice.less содержит два разных min-width:768 desktop layers.
- index.html сохраняет два разных nav contracts.
- Profile/home manual screenshots показывают лишний фон/резерв под nav, хотя isolated home smoke зелёный.
- Light home зелёный, но chat/light intake частично устарел: light overrides уже есть, актуального visual proof нет.
- sw.js network-first и versioned, но controllerchange только пишет diagnostics и не делает atomic reload.

Evidence:

- docs/tasks/assets/BUG-2026-07-22-task-detail-hero-overflow-ios.png
- docs/tasks/assets/BUG-2026-07-22-task-detail-tag-popup-ios.png
- docs/tasks/assets/manual-qa-2026-07-22-task-detail-tag-popup-blocked.png
- docs/tasks/assets/manual-qa-2026-07-22-task-detail-tag-popup-keyboard.png
- docs/tasks/assets/manual-qa-2026-07-22-home-bottom-bg.png
- docs/tasks/assets/manual-qa-2026-07-22-profile-bottom-bg.png

## VK parity, autologin и AI-chat

Полная matrix и briefs: pm/vk-parity-plan-2026-07-23.md.

### Autologin

Root-cause candidate высокой уверенности: vk.html:921-935 удаляет vk4_token после любого auth/me exception/timeout, не только 401/403. Direct web-VK не имеет VK Bridge fallback, поэтому требует повторного ручного login. Обычный index.html ведёт себя безопаснее: chetam_token удаляется только при 401/403.

Классификация: NEED-CLAUDE. Нельзя ночью переносить tokens между origins, менять Worker session contract или ослаблять auth.

### AI-chat

vk.html передаёт x-token и использует тот же model family, что Telegram/browser. Главные candidates: неразличимые non-2xx, entitlement/account mapping, surface-dependent API base, route-specific CORS и auth churn. UI не проверяет res.ok и маскирует серверную ошибку fallback-текстом.

Классификация: NEED-CLAUDE до одного redacted safe request. Запрещено обходить x-token/entitlement.

### Parity verdict

- MATCH core: VK launch auth, theme, basic home/task list.
- LAGGING: dashboard, navigation contract, task metadata, calendar, statistics, profile, desktop.
- MISSING: server-backed task-detail edits/reminder/tags/checklist, messenger chats, notifications, SW/offline.
- BROKEN: manual AI-chat signal; direct web-VK session reliability.
- NEED-YURI: live VK device/account proof, messenger scope, payments and production.

## Desktop notifications

Feasible in two phases:

1. Foreground desktop MVP — explicit permission, existing /notifications feed, deduped system notification while page is open, in-app fallback. NEED-CLAUDE because permission/privacy and surface behavior require review.
2. Background Web Push — Push subscription, service-worker push/click, backend lifecycle, VAPID secret, rate limits. NEED-YURI + security/infra review.

Telegram/VK WebView capability нельзя выводить из browser support. iOS background Web Push относится к Home Screen web app и требует user gesture.

## QA tooling recommendation

### Cheap-now

Current Chrome/CDP smokes + deterministic fixture matrix + Playwright visual regression в pinned environment; Android Emulator на Windows; разовые AWS Device Farm minutes или trial.

### Reliable-next

BrowserStack App Live pilot для установки Telegram/VK и manual real-device flows; TestMu AI как альтернативный pilot; Appium только для пяти критических сценариев. Telegram/VK manual WebView gate остаётся обязательным.

### Ideal-later

4e-qa-lab orchestrator, CI baselines, cloud real-device API, Appium/Maestro после native wrappers; Kobiton/private device lab только при устойчивой потребности.

Первые пять задач: QA-LAB-001 manifest/fixtures, 002 capture matrix, 003 storage/SW reset, 004 PM exporter/redaction, 005 BrowserStack/AWS pilot.

## Что можно почистить только после подтверждения

Безопасно предложить, но не удалено:

- свести duplicate bug IDs в одну canonical row + history note;
- переместить 28 Done rows из Active в closed section;
- добавить superseded markers в старые readiness/intake docs;
- создать docs/tasks/done и перемещать только явно закрытые документы через git history-preserving commit;
- закрыть stale redesign branches после подтверждения, не merge;
- удалить 7 ignored index.backup files (3 518 201 bytes) после подтверждения retention;
- решить судьбу tracked .pages-dist/privacy.html и .vk-hosting-dist/privacy.html: сейчас каталоги выглядят как неполные build artifacts;
- оставить .tmp-design-part3-20260719205054 как design evidence до отдельного retention решения — это 107 tracked files, а не случайный untracked trash;
- разделить WORK_LOG на active index + immutable dated archive без удаления истории.

## Выполненные проверки

- npm run smoke:home001 — PASS.
- npm run smoke:back019 — PASS.
- npm run smoke:back055 — PASS.
- npm run smoke:back050 — PASS.
- npm run smoke:back065 — PASS.
- npm run smoke:back066-vk — PASS.
- npm run smoke:chat-history40 — PASS: UI/API window 40 из fixture 60, pagination отсутствует.
- npm run smoke:privacy-surface — PASS.
- node scripts/check-cp1251-mojibake.mjs — PASS, но audit выявил blind spot, описанный выше.
- node scripts/check-cp1251-mojibake.mjs — PASS, exit code 0.
- git diff --check — PASS.
- C:\Program Files\Git\bin\bash.exe scripts/check-portable-paths.sh — PASS.

Smoke-generated binary screenshots были восстановлены к tracked состоянию; в audit commit входят только документы/PM.

## Почему остановился

Одна задача сессии — полный audit и план — выполнена. Следующие действия требуют отдельных atomic briefs либо ручных решений:

- runtime design fixes не разрешены этим audit;
- auth/session/OAuth/AI entitlement зоны требуют NEED-CLAUDE review;
- real Telegram/VK devices, notifications, desktop product choice, payments и production требуют Юрия/Алексея;
- merge в main и deploy запрещены.

BLOCKED-CONCURRENT-WORK не применим: рабочая копия была чистой. Audit остановлен на безопасном docs-only handoff.
