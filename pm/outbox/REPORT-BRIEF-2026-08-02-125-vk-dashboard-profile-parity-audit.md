# REPORT — BRIEF-2026-08-02-125-vk-dashboard-profile-parity-audit

## Итог

Аудит завершён. Редизайн не выполнялся: продукт ещё не выбрал, должен ли VK получить
тот же dashboard shell, отдельный VK shell или общий shell для всех поверхностей.

## Gap matrix

| Область | Что подтверждено локально | Разрыв / ручной хвост |
| --- | --- | --- |
| Dashboard shell | `vk.html` содержит свой compact card shell, focus summary и task list; header-logo smoke PASS | Не доказано визуальное совпадение с текущим Telegram/web soft-glass; live QA сообщает про старую центровку logo. Нужен выбор Юрия, не автоматический перенос. |
| Dashboard cards и navigation | E2E проходит home → detail → ask → calendar → stats → profile; task-card открывает detail | E2E не нажимает metric cards, focus chips или dashboard counters. Их контракт клика не задан. |
| Focus/day chips | `smoke:vk-home-parity` подтверждает focus, urgent, overdue, next deadline и top task | Есть текстовые chips, но нет доказательства, что пользовательские ожидания «кликабельны» должны вести на конкретные экраны. |
| Profile | profile parity smoke и E2E подтверждают account/identity summary и экран profile | Privacy/support links не проверялись в live VK контейнере; auth/session и внешняя навигация остаются отдельными границами. |
| Tasks | task detail edit, completion, actions, calendar date keys и AI chat smokes PASS | Live VK task persistence и session identity не покрыты mock-тестами; BRIEF-126 закрывает только локальное stale-refresh состояние в отдельном PR. |
| Покрытие | 10 targeted VK smokes PASS; `test:e2e:vk` PASS 4/4 на mobile и desktop mocked fixtures | Нет Playwright-контракта для metric-card click routes, focus-chip routes, profile external links, реального VK WebView и визуального сравнения с Telegram/web. k6 не заменяет эти проверки. |

## Предлагаемые малые follow-up briefs

Эти кандидаты не активны без явного решения человека:

1. `VK-DASH-CLICK-001`: согласовать и покрыть кликами metric cards / focus chips, только после product contract.
2. `VK-PROFILE-LINKS-001`: изолированно проверить privacy/support/profile actions в mocked и ручном VK контейнере, без auth changes.
3. `VK-SHELL-DECISION-001`: Юрий выбирает visual direction для dashboard shell; только после этого возможен отдельный implementation brief.

## Проверки

- `smoke:vk-header-logo`, `smoke:vk-home-parity`, `smoke:vk-profile-parity`, `smoke:vk-task-detail-edit`, `smoke:vk-task-complete`, `smoke:vk-task-actions`, `smoke:vk-calendar-date-key`, `smoke:vk-ai-chat-errors`, `smoke:vk-ai-chat-parity`, `smoke:vk-auth-session` — PASS.
- `npm run test:e2e:vk` — PASS, 4/4 (mobile + desktop mocked VK/Worker).
- `node scripts/check-cp1251-mojibake.mjs` — PASS, 0 suspicious tokens.

## Уровень доказательства и ручной хвост

Доказательство local/mock. Оно не подтверждает визуальный parity, кликабельность в VK
WebView, внешний переход profile links или persistence на реальном VK session. Юрию нужно
сначала выбрать контракт dashboard shell и кликов, QA — дать screenshots/viewport live VK
для подтверждения ручных находок.
