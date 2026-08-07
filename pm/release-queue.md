# Release queue

Этот файл отвечает только на вопрос: дошла ли согласованная правка до нужной
поверхности пользователя. `DONE` в brief означает, что работа исполнителя
закончена, но не заменяет `DEPLOYED` и ручную приёмку.

## Правила

1. Ночной исполнитель добавляет или обновляет строку сразу после создания PR.
2. Утренний приёмщик сверяет PR, `main`, deployment и ручной verdict.
3. В `pm/outbox/MANUAL-ACTIONS-YYYY-MM-DD-morning.md` всегда есть блок
   «Кандидаты на merge» для строк `PR_READY`; решение о merge принимает человек.
4. Строка может стать `DEPLOYED` только после успешного deployment нужной
   поверхности. Статус `MANUAL_ACCEPTED` ставится только после явного вердикта
   человека.
5. Не удалять строки `BLOCKED` или `NEED-YURI`: указывать конкретное следующее
   действие и владельца.

## Порядок ночи 2026-08-02

1. `BRIEF-2026-08-02-119-remove-home-show-all-button`
2. `BRIEF-2026-08-02-120-telegram-web-menu-and-voice-buttons-regression`
3. `BRIEF-2026-08-02-126-vk-chat-created-task-not-on-dashboard`
4. `BRIEF-2026-08-02-125-vk-dashboard-profile-parity-audit`
5. `MAN-013` / `BRIEF-2026-08-02-evening-05-old-clone-reconciliation`
6. `BRIEF-2026-08-02-122-notifications-functional-audit`

`BRIEF-2026-08-02-121-web-oauth-route-and-test-link-popup` и
`BRIEF-2026-08-02-124-vk-auth-session-persistence` допускаются только как
диагностика с точным ручным/Claude хвостом; автономно не менять auth-код.

## Текущая очередь app

| Brief | Поверхность | Состояние выпуска | Что есть сейчас | Следующее действие |
| --- | --- | --- | --- | --- |
| BRIEF-2026-08-02-119-remove-home-show-all-button | Telegram Mini App dashboard | IMPLEMENTATION_QUEUED | `status: NEW`, PR и отчёта нет | Ночной runner: отдельный PR с обновлённым smoke; затем человек решает merge |
| BRIEF-2026-08-02-120-telegram-web-menu-and-voice-buttons-regression | Telegram Mini App и web/PWA | IMPLEMENTATION_QUEUED | `status: NEW`, PR и отчёта нет | Ночной runner: отдельный PR с раздельной проверкой двух поверхностей; затем человек решает merge |
| BRIEF-2026-08-02-121-web-oauth-route-and-test-link-popup | web/PWA OAuth | IMPLEMENTATION_QUEUED | `status: NEW`, PR и отчёта нет | Ночной runner: сначала узкая диагностика; live OAuth остаётся ручным хвостом |
| BRIEF-2026-08-02-122-notifications-functional-audit | Telegram Mini App / web notifications | IMPLEMENTATION_QUEUED | `status: NEW`, PR и отчёта нет | Ночной runner: диагностика и evidence без догадок о runtime-контракте |
| BRIEF-2026-08-02-123-telegram-group-bot-no-response | Telegram bot | NEED-YURI | Brief уже помечен NEED-YURI | Отдельная bot-сессия после доступной live-group проверки |
| BRIEF-2026-08-02-124-vk-auth-session-persistence | VK Mini App / web | IMPLEMENTATION_QUEUED | `status: NEW`, PR и отчёта нет | Ночной runner: отдельный PR, live VK login остаётся ручным хвостом |
| BRIEF-2026-08-02-125-vk-dashboard-profile-parity-audit | VK Mini App | IMPLEMENTATION_QUEUED | `status: NEW`, PR и отчёта нет | Ночной runner: audit/атомарные follow-up briefs, не широкий редизайн |
| BRIEF-2026-08-02-126-vk-chat-created-task-not-on-dashboard | VK Mini App chat → dashboard | PR_READY | PR #63, code `e82dad9`, target `feat/admin-tariff-api`; `smoke:vk-ai-chat-parity`, `smoke:vk-home-parity`, `test:e2e:vk` (4/4), encoding/path/syntax guards green | Человек: проверить создание и видимость задачи в живой VK Mini App-сессии; затем решить merge и deployment |
