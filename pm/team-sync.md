# Team Sync

Обновлено: 2026-07-14

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

### Payment security P0 (следствие аудита STRAT-001) — 2026-07-13

**Статус:** Production задеплоен и подтверждён живым smoke
**Контекст:** По итогам evidence-first аудита `STRAT-001` (PR #34, `docs/strategy/monetization-analysis-2026-07-13/`) собран отдельный бриф на 4 P0 платёжной безопасности + cleanup. Кодекс отработал в изолированных checkout'ах (`4e-worker-p0`, `.tmp-4e-app-p0`).
**Что сделано:**
- `4e-worker`: `036ac78` unified premium entitlement gate; `c39eeb1` CloudPayments webhook HMAC verification; `5979f38` Telegram Stars bot-signature trust; `3c83e57` VK Pay спрятан за конфиг-флаг; `7411667` честный paywall copy (без «автопродления»); `f57149b` payment funnel analytics events.
- `4e-app`: `d161d17` восстановлен `WORK_LOG.md` после сбойного коммита; `0b6e38d` verified CloudPayments orders; `a94b261` убран Stars client-side fallback; `808535c` VK Pay выключен по умолчанию; `88bf104` убрана локальная self-активация Premium/`simulatePaymentSuccess()`; `c1e3f45` paywall copy; `5b740fc` payment funnel events.
- Секреты `CLOUDPAYMENTS_API_SECRET` (реальный, из личного кабинета CloudPayments) и `TELEGRAM_STARS_WEBHOOK_SECRET`/`PAYMENTS_BOT_SECRET` (сгенерирован) установлены в Cloudflare Workers secrets (production + staging) и в env бота.
**Что подтверждено live:**
- staging worker `https://restless-lab-d737-staging.shelckograff.workers.dev`: независимый shell-smoke Codex подтвердил CloudPayments `positive` (`200` / `{"code":0}` + `accessUntil` вырос), `fake HMAC` (`403` / `{"code":13}`), `badAmount` (`400` / `{"code":11}`) и `idempotency` (повтор того же webhook не продлевает доступ второй раз). Telegram Stars на staging также подтверждены shell-smoke: `positive`, `fake-signature` (`403` / `{"ok":false,"error":"telegram stars signature invalid"}`) и `replay` (`duplicate: true`, `accessUntil` не меняется).
- production worker: выполнен `wrangler deploy` из `4e-worker-p0`, опубликована версия `fa422fd3-3531-4cb2-9bfb-97f0cf6100e0`, custom domain `https://edge.4-ai.site`.
- production smoke на `https://edge.4-ai.site` повторил те же результаты: CloudPayments `positive` (`200` / `{"code":0}` + `accessUntil` вырос с 30 до 60 дней), `fake HMAC` (`403` / `{"code":13}`), `badAmount` (`400` / `{"code":11}`), `idempotency` (повтор того же webhook не меняет `accessUntil`); Telegram Stars `positive`, `fake-signature` (`403`) и `replay` (`duplicate: true`) также зелёные.
- migration-safety для старых пользователей подтверждена чтением кода перед деплоем: entitlement-логика по-прежнему опирается на старый `trialEndsAt`, так что пользователи без нового поля `user.entitlement` доступ не теряют.
**Блокеры:** P0 payment-security блокеров на staging/prod больше нет. Сознательно не покрывали только реальную покупку через живой Telegram client — backend callback path уже подтверждён синтетически, этого достаточно для P0.
**Не трогали:** цена (990 vs 999 ₽ — отдельное решение Юрия и/или Алексея), merge в `main`, дизайн `ONBOARD-001`.

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

### Ручные секреты Юрия — 2026-07-14

**Статус:** Зафиксировано  
**Контекст:** Юрий вручную обновил Cloudflare secrets для живых smoke-сценариев.  
**Что выставлено:** `BOT_TOKEN` в production и staging; `VK_ID_CLIENT_ID` и `VK_ID_CLIENT_SECRET` в production.  
**Что это меняет:** по `BACK-045` VK ID больше не упирается в отсутствие production client credentials; главным внешним блокером для полного live smoke остаются `YANDEX_CLIENT_ID` и `YANDEX_CLIENT_SECRET`.

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
