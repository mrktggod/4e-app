status: DONE

Done report: `pm/outbox/REPORT-BRIEF-2026-07-19-11-save-badge-copy-sync.md`

# BRIEF-2026-07-19-11-save-badge-copy-sync

## Context

Утверждённые цены: 990₽/мес, 9950₽/год (НЕ менять). Математика выгоды: 990×12=11880; (11880−9950)/11880 ≈ 16%. Живой `/tariff-config` уже отдаёт «Выгода 16%», но в `index.html` остались устаревшие fallback-копирайты «Выгода 20%» (наследие старой цены 9504). Рассинхрон виден на staging subscription-экране.

## Task

Узкая копирайт-синхронизация, только строки badge:

- `index.html:729` — статический `<div id="pricing-year-badge">Выгода 20%</div>` → `Выгода 16%`.
- `index.html:2374` — frontend-default `saveBadge: 'Выгода 20%'` → `'Выгода 16%'`.
- `rg -n "Выгода 20" по всему app-репо и X:\4\4e-worker` — если есть другие вхождения (vk.html, worker default config), выровнять их тоже на «Выгода 16%».

ЗАПРЕЩЕНО: менять любые числовые цены (990/9950/829), stars, trial, tariff-config в KV через admin API, логику расчёта.

## Stop Points

- No price changes (числа цен не трогать — только текст badge «20%»→«16%»).
- No production deploy. No merge into `main`. No CAL. No payment/entitlement refactors. No secrets.

## Verification

- `rg -n "Выгода 20"` → 0 вхождений в обоих репо после правки.
- `node scripts/check-cp1251-mojibake.mjs` → 0.
- Staging Pages deploy + скрин/DOM-проверка: badge на paywall = «Выгода 16%», цены прежние 990/9950.

## Report

`pm/outbox/REPORT-BRIEF-2026-07-19-11-save-badge-copy-sync.md`: список правок file:line, raw grep до/после, staging-proof, commit SHA.
