# BACK-009 — VK Pay verification plan

Цель: не считать VK Pay paid-ready только потому, что во фронте есть `VKWebAppShowOrderBox`. Для публичной оплаты нужен такой же уровень backend verification, idempotency и entitlement safety, как у CloudPayments / Telegram Stars.

## 1. Текущий статус

| Layer | Status |
| --- | --- |
| VK Mini App UI entrypoint | Implemented: `index.html` / `vk.html` can call `VKWebAppShowOrderBox` |
| Backend payment verification | Not proven |
| Durable entitlement grant | Not proven for VK Pay |
| Negative tests | Not proven |
| Live staging smoke | Not done |
| Production paid launch | Blocked |

## 2. Required backend flow

| Step | Requirement |
| --- | --- |
| Create order | Server knows expected plan, period, amount, currency and user id before payment |
| Receive callback/status | Backend receives trusted VK payment confirmation or verifies payment status through provider-supported path |
| Verify amount | Actual amount must exactly match expected tariff config |
| Verify user/order | Callback must map to one internal user and one order id |
| Idempotency | Repeated callback/status check must not extend entitlement twice |
| Entitlement grant | Access changes only after verified payment, never from front-only success |
| Audit event | Store provider, order id, amount, status, entitlement before/after |

## 3. Negative tests before Ready for paid launch

| Test | Expected |
| --- | --- |
| Front reports success but backend has no verified payment | No entitlement grant |
| Wrong amount | Reject / no entitlement grant |
| Wrong user/order id | Reject / no entitlement grant |
| Replay same payment | Idempotent success, no second extension |
| Missing signature/status proof | Reject / no entitlement grant |
| Expired/cancelled order | No entitlement grant |

## 4. Feature flag rule

| Rule | Decision |
| --- | --- |
| VK Pay button may exist in VK environment | Allowed only as UI-entrypoint/testing surface |
| VK Pay production purchase | Blocked until backend verification and negative tests pass |
| If backend is not ready | Show unavailable/coming-soon copy or route to supported payment method |
| If verification fails | Do not silently fall back to granting Premium |

## 5. Support policy alignment

VK Pay incidents should follow `docs/tasks/BACK-010-payment-support-policy.md`:

| Scenario | Action |
| --- | --- |
| User claims payment succeeded | Check provider/order evidence before manual grant |
| Duplicate callback | Idempotent no-op |
| Amount mismatch | No grant and suspicious event |
| Refund/dispute | Ticket and entitlement review |

## 6. Definition of Done

| Gate | Required result |
| --- | --- |
| Backend verification implemented | Pass |
| Positive staging smoke | Pass |
| Wrong amount negative test | Pass |
| Front-only fake success negative test | Pass |
| Replay/idempotency test | Pass |
| Support/audit path documented | Pass |
| Production release decision | Explicit approval |