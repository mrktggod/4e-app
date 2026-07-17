# Ready for QA triage — 2026-07-17

Цель: утром не тонуть в большом backlog, а пройти `Ready for QA` в правильном порядке.

## P0/P1 before beta

Проверить до приглашения beta-пользователей.

| ID | Что проверить | Где | Можно закрыть если |
| --- | --- | --- | --- |
| BACK-035 | qa-checklist smoke | staging/prod target | auth, task create/save/reload, AI-chat, core mobile flow проходят |
| BACK-036 | Telegram web fallback | web + Telegram | пользователь понимает manual `/start auth_*` или fallback реально возвращает на сайт |
| BACK-041 | Bot-side `/start auth_*` return | Telegram bot + web | inline-кнопка возвращает на сайт и токен принимается |
| HOME-001 | home visual/navigation | phone + desktop | home не развален, все entrypoints кликабельны |
| BACK-050 | accessibility baseline | keyboard + mobile | Tab/Escape/focus/toast не ломают critical dialogs |
| NEW-006 | safe area | Telegram Mini App | bottom nav не перекрывает profile/notifications/content |
| NEW-008 | AI-chat composer | phone keyboard | поле ввода остаётся видимым при клавиатуре |
| BACK-045 | VK/Yandex auth | real providers | VK проходит; Yandex только если secrets готовы |

## Bot/group flow

| ID | Что проверить | Где | Можно закрыть если |
| --- | --- | --- | --- |
| SMART-004 | лаконичная фиксация задач в группах | real Telegram group or staging bot runtime | задача создаётся одной строкой, подтверждение короткое, `✏️/✕` работают |
| SMART-011 | умный пинг | bot + assignee | кнопка reminder отправляет сообщение нужному исполнителю и не шлёт без TG ID |

## Payment QA

Не смешивать с beta launch.

| ID | Что проверить | Где | Можно закрыть если |
| --- | --- | --- | --- |
| BACK-009 | VK Pay | VK Mini App + backend verification | есть backend verification, durable entitlement, negative tests, live smoke |
| BACK-010 | Telegram Stars | staging/prod worker + bot | positive, bad amount, replay/idempotency и production smoke записаны |
| BACK-040 | tariff admin | worker/admin + public config | production `/tariff-config` не default, admin write/read audited |

## Product/UI later QA

Можно проверять после core beta sanity.

| ID | Что проверить | Где | Можно закрыть если |
| --- | --- | --- | --- |
| BACK-019 | task cards/swipes | phone | cards readable, swipe actions не конфликтуют с scroll |
| NEW-020 | voice latency | staging phone/browser | сняты реальные `window.__voicePerfLast` numbers и понятно, UI-delay или backend |
| VIRAL-001 | plan share card | phone share sheet | native share/download работает, PNG readable |
| VIRAL-006 | weekly share card | phone share sheet | PNG readable на пустом и непустом аккаунте |
| PLAT-002 | installed PWA | Android Chrome | app installs, opens standalone, offline shell не белый экран |

## Что не закрывать по source-only

- payment tasks;
- Telegram fallback;
- safe-area/keyboard mobile bugs;
- PWA install;
- real provider OAuth;
- bot group flow.

## Что делать с результатом

Если pass:

- обновить соответствующую строку `pm/backlog.md`;
- добавить короткое evidence в `shared/WORK_LOG.md`;
- если было руками, добавить `кто / где / когда`.

Если fail:

- завести bug в `pm/bugs.md`;
- не менять `Ready for QA` на `Done`;
- если fail блокирует beta, добавить в top blockers дня.

## Минимальный beta go/no-go

Beta invite можно отправлять только после pass:

- email signup/login;
- task create/save/reload;
- home visual sanity;
- mobile composer/safe-area sanity;
- paywall не блокирует trial/free;
- feedback channel готов.
