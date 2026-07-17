# Release and beta gates — 2026-07-16

Статус: product/release decision.

Цель: отделить "код готов" от "можно звать людей / брать деньги / расширять платформы".

## 1. Closed beta gate

Closed beta можно начинать только если проходят эти минимальные условия:

- email signup/login работает на целевой поверхности;
- Telegram/VK login не блокирует основной email путь;
- home открывается после login;
- создание задачи работает;
- задача сохраняется после reload/reopen;
- AI-chat не падает на первом полезном запросе;
- нижняя навигация и keyboard/composer не ломают mobile flow;
- trial/free path не блокируется paywall;
- есть канал feedback и владелец разбора.

Если один из пунктов ломается у 2+ тестеров — beta не расширять.

## 2. What can ship to beta

Можно включать в beta:

- HOME-001 current home;
- ONBOARD-001 first empty home;
- email auth;
- Telegram/VK entrypoints, если не мешают email path;
- task create/list/done/edit;
- AI-chat/task creation;
- notifications action feed;
- share cards;
- referral link;
- PWA install groundwork, если service worker не мешает деплоям.

## 3. What must stay behind manual QA

Не считать Done без ручного smoke:

- `BACK-035`: полный qa-checklist;
- `BACK-036` / `BACK-041`: Telegram fallback end-to-end;
- `HOME-001`: visual pass на телефоне;
- `BACK-050`: keyboard/mobile accessibility;
- `NEW-006`: Telegram Mini App safe area;
- `NEW-008`: mobile keyboard/composer;
- `NEW-020`: real voice latency numbers;
- `BACK-045`: VK/Yandex live OAuth;
- `SMART-004`: live bot group flow;
- `BACK-009` / `BACK-010`: real payment/provider smoke.

## 4. Payment gate

Деньги не расширяем, пока не выполнены три условия:

1. Positive payment path работает на staging/prod для конкретного provider.
2. Negative tests подтверждены: bad signature, bad amount, replay/idempotency.
3. Entitlement после оплаты реально меняет доступ и не продлевается повторно на replay.

Для VK Pay отдельно:

- UI-entrypoint внутри VK не равен безопасной оплате;
- нужен backend verification/durable entitlement;
- live VK smoke без денег не закрывает money gate.

Для Telegram Stars:

- backend logic уже можно считать сильным staging evidence;
- реальная покупка Stars не обязательна для P0 backend, но нужна перед публичным paid launch.

## 5. Production gate

Production deploy допустим только если:

- staging smoke зелёный;
- HEAD==origin на нужной ветке;
- нет незакоммиченных runtime-файлов, кроме явно исключённых build artifacts;
- WORK_LOG/team-sync обновлены;
- есть rollback path или предыдущий deploy известен;
- secrets не записаны в файлы/коммиты.

## 6. Beta success metrics

Для первых 5-10 пользователей успех — не "нет багов".

Успех:

- 3+ пользователя создали реальные задачи;
- 2+ вернулись на следующий день;
- 1+ использовал AI-chat или voice;
- 1+ закрыл задачу;
- 1+ поделился карточкой/планом или пригласил другого;
- blockers записаны и приоритизированы.

## 7. Stop conditions

Остановить расширение beta, если:

- auth/signup ломается у 2+ пользователей;
- задачи теряются;
- paywall случайно блокирует trial/free path;
- mobile layout мешает создать/закрыть задачу;
- bot/payment/security changes требуют новых секретов или ручного deploy без владельца.

## 8. Morning order

Утром идти в таком порядке:

1. `pm/manual-qa-2026-07-17.md`;
2. auth/signup/login;
3. task create/save/reload;
4. mobile layout/composer;
5. share cards;
6. PWA install only if первые 4 пункта зелёные;
7. beta invite only после фикса P0/P1.

## 9. Anti-patterns

Не делать:

- закрывать Ready for QA по одному source-check;
- запускать paid flow "потому что UI открывается";
- звать beta-пользователей, если signup/login нестабилен;
- начинать CAL/native/platform, пока не понятен repeat usage;
- чинить косметику вместо auth/task-save blockers.
