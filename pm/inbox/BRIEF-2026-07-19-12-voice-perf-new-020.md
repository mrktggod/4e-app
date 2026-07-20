status: NEW

# BRIEF-2026-07-19-12-voice-perf-new-020

## Context

NEW-020 (P2, Ready for QA): голосовой ввод субъективно медленный. Телеметрия уже встроена (`window.__voicePerfLast` / `__voicePerfHistory`, console `[voice-perf]`). Статический аудит указал вероятную причину: после `SpeechRecognition.onresult` UI искусственно держит ~3.6с анимационных `setTimeout` до фактического `sendVoiceMessage()` (index.html, voice flow).

## Task

1. Снять реальные числа: headless-прогон на staging с синтетической инъекцией transcript (вызвать обработчик onresult напрямую с фейковым текстом — реальный микрофон не нужен), записать breakdown `recognitionMs/preDispatchUiMs/branchMs/totalMs`.
2. Если подтверждается искусственная UI-задержка ≥2с — узкий фикс: сократить анимационные setTimeout до суммарно ≤800мс, НЕ меняя логику ветвления task/ask и сам `sendVoiceMessage()`.
3. Повторный замер после фикса, до/после в отчёт.
4. Если причина окажется НЕ в UI-задержке (backend/AI latency) — код не трогать, оформить как NEED-CLAUDE с числами.

## Stop Points

- Не трогать auth, платёжку, entitlement, worker. Только UI-timing voice flow в index.html.
- No production deploy. No merge into `main`. No CAL. No price changes. No secrets.

## Verification

- Raw числа `__voicePerfLast` до/после фикса (headless, staging Pages deploy).
- Проверить, что обычный путь ask/task из голоса не сломан (задача создаётся, ответ приходит).
- `node scripts/check-cp1251-mojibake.mjs` → 0.

## Report

`pm/outbox/REPORT-BRIEF-2026-07-19-12-voice-perf-new-020.md`: числа до/после, root cause file:line, commit SHA, staging URL, honest tails (живой микрофонный smoke остаётся NEEDS-REAL за Юрием).
