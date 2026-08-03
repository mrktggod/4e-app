# REPORT: продление подписки — 2026-08-03

Status: DONE

## Запрос

Алексей попросил продлить подписку на 1 год аккаунту `kudashof@gmail.com`.

## Выполнено

Через штатный admin API выполнено:

1. `GET https://edge.4-ai.site/admin/users?q=kudashof%40gmail.com`
2. `PUT https://edge.4-ai.site/admin/users/{userId}/plan` с телом `{"plan":"paid","days":365}`

Секрет `ADMIN_SECRET` был взят из Windows user-level environment, не выводился и не записывался в файлы.

## Результат API

| Поле | Значение |
| --- | --- |
| ok | `true` |
| user id | `7491fe41-8cda-481b-9ca9-e2dacce176b1` |
| email | `kudashof@gmail.com` |
| telegramId | `null` |
| vkId | `null` |
| plan | `paid` |
| daysLeft | `365` |
| entitlement.status | `active` |
| accessUntil / trialEndsAt | `1817315209231` |

## Guardrails

Runtime-код, production deploy, `main`, цены, платежи, entitlement-логика и секреты не менялись.
