# BACK-010 — payment support and reversal policy

Цель: подготовить минимальную операционную политику для Telegram Stars / ЮKassa / будущих paid flows до публичного paid launch. Этот документ не меняет цену, не включает production deploy и не заменяет live payment smoke.

## 1. Что уже доказано технически

| Area | Evidence |
| --- | --- |
| Telegram Stars positive path | Signed positive callback on staging returned `200` and moved user `trial -> paid` |
| Wrong amount | Wrong amount returned `400 telegram stars amount mismatch` without entitlement change |
| Replay/idempotency | Replay returned `200 duplicate:true` without extending access again |
| Backend HMAC/signature principle | P0 payment-security work requires signed callbacks and negative tests |

## 2. Что эта политика закрывает

| Scenario | Support decision |
| --- | --- |
| Пользователь оплатил, но Premium не включился | Проверить payment event/idempotency key; если платеж подтвержден provider-ом, вручную выдать entitlement и записать incident |
| Повторный callback/replay | Не продлевать доступ повторно; отвечать idempotent success only if original event already processed |
| Неверная сумма | Не выдавать entitlement; вернуть ошибку; записать suspicious payment event |
| Поддельная подпись | Не выдавать entitlement; вернуть forbidden/error; не раскрывать детали проверки пользователю |
| Пользователь просит возврат | Не обещать автоматический refund до подтверждения provider policy; зафиксировать ticket и статус доступа |
| Provider dispute/chargeback | Заморозить ручные продления по этому payment id до разбора |
| Ошибка в тарифе/цене | Не чинить через ручную выдачу массово; остановить paid launch, обновить тарифный config/release note |

## 3. Минимальные поля incident-записи

| Field | Example / rule |
| --- | --- |
| `incidentId` | `PAY-YYYYMMDD-001` |
| `provider` | `telegram_stars`, `cloudpayments`, `yookassa`, `vk_pay` |
| `userId` | Internal user id, без лишних персональных данных |
| `paymentId` | Provider transaction/payment id |
| `amount` | Expected and actual amount if mismatch |
| `callbackStatus` | positive / wrong_amount / bad_signature / replay / provider_error |
| `entitlementBefore` | free / trial / paid / expired |
| `entitlementAfter` | free / trial / paid / expired |
| `operatorAction` | none / manual_grant / manual_revoke / refund_requested |
| `notes` | Кратко, без секретов и токенов |

## 4. Ручная выдача доступа

| Rule | Decision |
| --- | --- |
| Когда можно | Только если provider подтверждает успешную оплату, а backend не выдал доступ из-за сбоя |
| На сколько | Не больше оплаченного периода; trial bonus отдельно не добавлять без явного правила |
| Что записать | Incident id, оператор, причина, срок доступа до/после |
| Что нельзя | Выдавать доступ по скриншоту без provider-подтверждения |

## 5. Перед production paid launch

| Gate | Required result |
| --- | --- |
| Staging positive payment | Pass |
| Staging wrong amount | Pass |
| Staging bad signature | Pass |
| Staging replay/idempotency | Pass |
| Production dry-run/config check | Pass |
| Support/reversal policy | This document reviewed |
| Price decision | Explicit business decision, not inferred from code |
| Monitoring/log visibility | Operator can find payment event without exposing secrets |

## 6. Backlog implications

| Item | Meaning |
| --- | --- |
| `BACK-010` | Can move closer to Done after production smoke and reviewed support policy |
| `BACK-009` | VK Pay remains not paid-ready until backend verification matches the same policy |
| `BACK-040` | Admin tariff config must not silently change paid terms without release note |