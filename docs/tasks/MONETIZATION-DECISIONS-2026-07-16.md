# Monetization decisions — 2026-07-16

Статус: product/payment decision.

Цель: не смешать beta, trial, entitlement security и публичный paid launch.

## Главный принцип

До закрытого beta 4 не оптимизирует цену. 4 оптимизирует доверие:

- пользователь может войти;
- создать и сохранить задачи;
- понять value;
- не потерять доступ;
- не получить ложный paywall.

Деньги включаются только после payment security gate.

## Что считается payment-ready

Provider считается готовым к paid launch только если:

- positive payment callback принят;
- bad signature отклоняется;
- wrong amount отклоняется;
- replay/idempotency не продлевает доступ повторно;
- entitlement меняется durable и читается frontend/paywall;
- есть audit trail;
- есть manual smoke на нужной поверхности.

## Trial / beta policy

Для закрытой beta:

- не ставить оплату как обязательный шаг;
- не ломать trial/free path;
- не менять цену в рамках beta gate;
- собирать value/retention signals до pricing optimization.

Beta invitation может говорить:

```text
На закрытом тесте доступ открыт, чтобы проверить рабочий сценарий. Оплата и тарифы будут проверяться отдельно.
```

## VK Pay decision

`BACK-009` не считать paid-ready по одному UI-entrypoint.

Почему:

- `VKWebAppShowOrderBox` доказывает только, что кнопка оплаты может открыться;
- без backend verification можно получить ложный entitlement;
- live smoke в VK app без реального payment verification не закрывает money gate.

VK Pay можно продвигать только после:

- backend verification design;
- durable entitlement write;
- negative tests;
- staging/prod smoke;
- rollback plan.

## Telegram Stars decision

`BACK-010` имеет сильное backend evidence по staging:

- positive signed path;
- wrong amount;
- replay/idempotency.

Но перед публичным paid launch всё равно нужен:

- финальный production smoke;
- решение по реальной покупке Stars или accepted no-real-money evidence;
- support/reversal handling policy.

## Admin tariff decision

`BACK-040` не должен менять цену сам по себе.

Admin tariff API нужен для:

- убрать hardcode из UI;
- безопасно менять copy/конфиг;
- видеть актуальный tariff config;
- не деплоить frontend ради каждой настройки.

Но:

- цена 990/999 не меняется в рамках текущего продукта без отдельного решения;
- production `/tariff-config` должен быть доказан не default config before paid launch;
- admin changes должны быть audit-able.

## Beta monetization posture

Во время beta показываем:

- понятный trial/free state;
- честный paywall copy;
- отсутствие давления на оплату;
- возможность понять premium value через реальные сценарии.

Не делаем:

- A/B цены;
- новые скидки;
- forced subscription;
- provider switching без security gate.

## Definition of Done

Монетизацию можно считать готовой к расширению, когда:

- один provider прошёл full security gate;
- entitlement verified on production;
- tariff config verified on production;
- beta users не заблокированы paywall случайно;
- WORK_LOG содержит exact provider, date, environment and evidence.
