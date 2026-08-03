# Ручные действия — утро 2026-08-03

Автоматика не выполняет merge, live-проверки и решения владельца.

## Кандидаты на merge

Кандидатов нет: PR #53 имеет `CHANGES_REQUIRED`, PR #54 заблокирован и не имеет `PR_READY`.

## P0/P1

1. [PR #53](https://github.com/mrktggod/4e-app/pull/53): открыть и проверить новые screenshots на head `a820b7c` в Telegram Mini App. Нормальный результат — evidence соответствует SHA; затем человек решает merge. При старых screenshots вернуть на исправление.
2. [PR #54](https://github.com/mrktggod/4e-app/pull/54): Юрию приложить dark screenshots Telegram и web/PWA с устройством/viewport и исправить handoff на точный SHA и `BLOCKED / NEED-YURI`.
3. [4pm PR #22](https://github.com/mrktggod/4pm/pull/22): доставить отсутствующий COWORK night review с brief, PR/SHA, tests, release_state и владельцем.
4. Восстановить [канонический реестр ручных действий](https://github.com/mrktggod/4pm/tree/main/cowork-docs): ожидаемый файл — `РУЧНЫЕ-ДЕЙСТВИЯ.md` по точному пути. Если путь изменён, сообщить Юрию.

## После подтверждённого merge

На следующем проходе проверить SHA в `main`, успешный deployment нужной поверхности и явный человеческий verdict. До этого не ставить `DEPLOYED` или `MANUAL_ACCEPTED`.
