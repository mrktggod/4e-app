status: NEW

# BRIEF-2026-07-19-17-arch001-evidence-upgrade

## Context

EVIDENCE-AUDIT-2026-07-17: ARCH-001 (распил index.html: platform-adapter.js для TG/VK/web) — Done, но SOURCE-ONLY: «Architecture item; source/docs only». Это safe whitelist-задача из категории evidence-upgrade — доводим до строгой SOURCE-цитаты, без live QA (архитектурный рефактор не тестируется UI-кликами).

## Task

1. Открыть `scripts/platform-adapter.js` и подтвердить построчно (file:line) все функции, перечисленные в backlog.md ARCH-001: `FourPlatform.initVkMiniAppAdapter()`, Telegram start/return URL helpers, VK launch params, OAuth PKCE/state helpers, referral helpers, dialog/focus helpers, form-error helpers, email-validator, password-toggle helpers, Enter-submit helper.
2. Grep по `index.html`, чтобы подтвердить, что перечисленные функции реально вызываются оттуда через `platform-adapter.js` (не дублируются inline), т.е. вынос настоящий, а не частичный/забытый.
3. Зафиксировать точные file:line ссылки новым supplement-блоком в `docs/tasks/EVIDENCE-AUDIT-2026-07-17.md` (по аналогии с существующим блоком «2026-07-17 supplemental SOURCE-ONLY to LIVE pass») — оставить статус SOURCE-ONLY (это архитектурный пункт, не поведенческий), но с усиленной, проверяемой цитатой вместо общей фразы.
4. Если обнаружится расхождение (функция заявлена вынесенной, а по факту всё ещё дублируется в index.html) — не чинить молча, записать как отдельную находку в отчёт и в `pm/bugs.md`, если это реальный техдолг.

## Stop Points

- Только чтение кода + правка одного docs-файла (`EVIDENCE-AUDIT-2026-07-17.md`). Продуктовый код не менять.
- No production deploy. No merge into `main`. No CAL. No price changes. No payment/entitlement refactors. No secrets.

## Verification

- Все цитаты — реальные file:line из текущего HEAD (не из памяти/предположений).
- `node scripts/check-cp1251-mojibake.mjs` → 0.

## Report

`pm/outbox/REPORT-BRIEF-2026-07-19-17-arch001-evidence-upgrade.md`: список подтверждённых file:line, любые расхождения, commit SHA.
