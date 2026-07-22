# VK / web-VK parity plan — 2026-07-23

Статус: AUDIT COMPLETE / auth- и AI-runtime не изменялись

## Какие поверхности нельзя смешивать

1. Telegram/browser app — index.html, token chetam_token, общий platform adapter.
2. VK Mini App на общем app-коде — index.html + signed launch params + FourPlatform.initVkMiniAppAdapter().
3. Standalone VK line — vk.html, отдельный token vk4_token, отдельные screens и auth bootstrap.
4. VK hosting artifact — vk.html переименовывается в index.html, а API base подменяется переменной VK_API_BASE_URL во время сборки.

Успешный smoke одной поверхности не доказывает остальные. Каждый report обязан сохранять surface, origin, build hash, API base без секретов и наличие VK launch params.

## TG ↔ VK matrix

| Область | Telegram/browser | VK Mini / web-VK | Verdict | Следующий шаг |
| --- | --- | --- | --- | --- |
| Auth: сохранённая web-сессия | chetam_token, auth/me; токен удаляется только на 401/403 | vk4_token, auth/me timeout 2.5s; после любого exception токен удаляется | BROKEN web-VK | VK-AUTH-SESSION-001, NEED-CLAUDE |
| Auth: platform autologin | Telegram initData/start-token fallback | signed VK launch params + auth/vk только внутри VK Bridge context | MATCH core / NEEDS-REAL | VK Mini mobile+web smoke |
| VK ID / Yandex OAuth в общем app | UI и endpoints заявлены | scripts/auth.js ждёт window.PLATFORM и window.WORKER, а app создаёт FourPlatform и lexical const WORKER | BROKEN-CANDIDATE | PLATFORM-GLOBAL-ALIAS-001, NEED-CLAUDE |
| Home/dashboard | rich focus, metrics, top-3, summary overlay | упрощённый focus card, metrics и task list | LAGGING | VK-HOME-PARITY-001 |
| Navigation | home nav = 3 actions; global nav = 4 actions | 5-slot nav с AI center, без общего adapter contract | LAGGING / TG CONTRACT BROKEN | NAV-CONTRACT-001 |
| Tasks list | rich metadata, swipe/actions, filters | базовый list + done | LAGGING | после auth/AI |
| Task detail | edit, deadline/time, priority, reminder, tags, checklist, discussion/history | read-only title/meta/status; done; local discussion/history | MISSING P1 | VK-TASK-DETAIL-001 |
| Tag/reminder UI | есть, но текущие iOS P1 regressions | отсутствует | MISSING | после устойчивого TG component contract |
| AI-chat | работает в browser smoke; short history green | ручной сигнал: не работает; ошибки API маскируются fallback-текстом | BROKEN | VK-AI-CHAT-001, NEED-CLAUDE |
| Task discussion | server messages + AI + actions | localStorage, AI call без server history contract | LAGGING | VK-DISCUSSION-001 |
| Chats/chat-conv | admin-only messenger surface | отсутствует | MISSING / scope decision | NEED-YURI |
| Calendar | общий parser, richer lists | простой month grid, exact-date equality | LAGGING | VK-CALENDAR-001 |
| Statistics | extended overview/history/advice | четыре счётчика + простой chart | LAGGING | P2 после beta blockers |
| Profile | expanded profile, notification/privacy/subscription screens | identity panel и theme; notifications/subscription rows показывают «Скоро» | LAGGING | VK-PROFILE-001 |
| Dark/light | покрытие обоих themes, но chat visual proof неполный | базовый dark/light есть | MATCH core / NEEDS-VISUAL | QA-LAB matrix |
| Desktop layout | mobile-column, product decision pending | отдельного responsive desktop contract в vk.html нет; bottom nav fixed full-width | LAGGING | NEED-YURI desktop decision |
| Notifications | in-app feed + settings API | видимый пункт «Скоро», desktop push отсутствует | MISSING | NOTIF-DESKTOP-001 |
| Cache/offline | service worker + offline task queue | standalone vk.html без service worker | MISSING | после parity P1 |

## Web-VK autologin: наиболее вероятная причина

В vk.html:921-935 bootstrap читает vk4_token и даёт auth/me только 2.5 секунды. Любой timeout, DNS/CORS exception или временная сеть попадает в catch, после чего сохранённый token удаляется без проверки HTTP-статуса. В прямом web-VK нет VK Bridge и signed launch params, поэтому автоматического восстановления уже нет — пользователь снова вводит email/password.

Дополнительные факторы:

- standalone VK и обычный web используют разные localStorage keys, поэтому сессия не переносится между vk.html и index.html;
- localStorage привязан к origin и может быть partitioned внутри host WebView;
- общий VK adapter синхронизирует в VK Storage только theme, pin, lang и notifications, но не auth token;
- production VK hosting может ходить через инжектированный Yandex API base, тогда как прямой vk.html по умолчанию ходит в edge.4-ai.site;
- service worker относится к index.html/PWA и не является причиной очистки vk4_token в standalone vk.html.

### VK-AUTH-SESSION-001 — NEED-CLAUDE

Scope: только session bootstrap, без изменения entitlement, payments и backend auth contract.

DoD:

1. Network timeout/5xx/offline не удаляет сохранённый token и показывает recoverable state.
2. Только подтверждённый 401/403 очищает token.
3. Отдельно проверены direct web, VK web iframe и VK mobile WebView.
4. Logout по-прежнему удаляет token явно.
5. Решено, нужны ли два token keys или безопасная одноразовая migration; не переносить token между origins без security review.
6. Raw evidence: auth/me status, storage before/after с token value как <redacted>, console/network tail.

## VK/web AI-chat: root-cause candidates

Source audit не доказывает единственную причину, но сокращает поиск:

1. Error masking — vk.html:1533-1543 не проверяет res.ok. Ответ 401/402/403/429/5xx превращается в «Не смог получить ответ», поэтому UI скрывает настоящий класс ошибки.
2. Entitlement/account mapping — auth/vk может выдавать token для VK identity без ожидаемого premium/trial state; это требует безопасного status proof, а не изменения gate.
3. API-base surface drift — hosted VK artifact и direct vk.html могут обращаться к разным bases.
4. CORS/preflight — x-token + JSON вызывают preflight; tasks success снижает вероятность общего CORS-дефекта, но route-specific /anthropic policy надо проверить.
5. Auth churn — ранняя очистка vk4_token может оставлять пользователя на другой/повторно созданной identity.
6. History growth — request отправляет весь in-memory chatHistory, хотя localStorage сохраняет только 20; это будущий size/latency risk, не лучший кандидат для первого отказа.
7. Model не главный кандидат: тот же claude-sonnet-4-6 используется текущим Telegram/browser AI-chat.

### VK-AI-CHAT-001 — NEED-CLAUDE

До кода выполнить один безопасный запрос на fresh test account:

- auth/me;
- текущий plan/entitlement status без персональных данных;
- один короткий /anthropic prompt;
- сохранить status, response shape, CORS headers, API base и surface;
- token и payload пользователя в отчёте заменить на <redacted>.

Разрешённый fix после root cause: проверка res.ok, честные классы ошибок, retry только для transient failures, request-id в diagnostics. Запрещено ослаблять x-token или entitlement.

## Следующие atomic briefs

| Brief | Класс | Scope |
| --- | --- | --- |
| PLATFORM-GLOBAL-ALIAS-001 | NEED-CLAUDE | Явный reviewed export FourPlatform/WORKER для external auth helpers + OAuth regression |
| VK-AUTH-SESSION-001 | NEED-CLAUDE | Не терять valid saved session на timeout/5xx |
| VK-AI-CHAT-001 | NEED-CLAUDE | Найти status/root cause и сделать честный error UX |
| VK-TASK-DETAIL-001 | READY/FIXABLE | Server-backed edit deadline/status/priority с regression smoke, без reminder/payment |
| VK-HOME-PARITY-001 | READY/FIXABLE | Focus summary и metadata parity после стабилизации TG components |
| VK-CALENDAR-001 | READY/FIXABLE | Общий date parser и timezone fixtures |
| VK-PROFILE-001 | READY/FIXABLE | Profile information architecture без payment changes |
| VK-NOTIFICATIONS-001 | NEED-CLAUDE | In-app notification feed contract; push/backend отдельно |

## Что требует Юрия

- Live VK Mini App account/device smoke и подтверждение, какой именно web-VK URL Алексей считает стабильным.
- Решение, нужен ли messenger/chats parity в VK.
- Любая работа с VK Pay, entitlement, production deploy или секретами.
