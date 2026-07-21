status: DONE

# BRIEF-2026-07-20-26-layout-overlaps-from-gpt-qa

## Context
GPT-QA 2026-07-20 нашёл 3 layout-бага (verstka/safe-area, не логика). Узкие CSS/условный-рендер фиксы. Родня NEW-006/008/BACK-046 (safe-area).

## Предохранитель (важно)
subscription/chat/профильные экраны — часть АКТИВНОГО redesign Юрия (index.html/styles могут быть незакоммичены). Перед правкой `git status`: если затронутый экран в незакоммиченном redesign — НЕ трогай, пометь NEED-CLAUDE (Юрий учтёт в ручной доработке или Codex после коммита redesign). Не затирать ручную работу.

## Task (узкие layout-фиксы)
1. 🟠 **Subscription CTA перекрыт нижней навигацией** (риск для оплаты — highest product risk у GPT). Нижняя nav не должна перекрывать основную кнопку оплаты. Резерв safe-area/отступ под CTA. НЕ трогать цены/платёжную ЛОГИКУ — только layout кнопки.
2. 🟠 **Chat quick-actions налезают на bottom-nav** (конкурируют за тап). Отступ/safe-area, как в NEW-008.
3. 🟠 **Глобальная навигация видна на login/auth экранах** (не должна). Скрыть nav на auth/login/onboarding экранах — условный рендер/CSS, НЕ трогая auth-логику (только видимость элемента).
4. 🟡 (мелочь, если по пути) Telegram SDK warning «changing swipes behavior unsupported in 6.0» — приглушить/обработать, если тривиально; иначе пропустить.

## Stop Points
- ❌ Не менять цены/платёжную/auth логику — только вёрстку/видимость.
- ❌ prod, merge в main, CAL, секреты.
- ❌ Незакоммиченный redesign (см. Предохранитель) — экран в работе Юрия не трогать.
- HTML/LESS/BEM без инлайна, accessibility baseline держать.

## Verification
- Staging: subscription CTA не перекрыт nav; chat quick-actions не под nav; на login нет глобальной nav. Скрин/DOM-описание.
- `check-ui-architecture.sh` inline не вырос; `check-cp1251-mojibake` = 0.

## Report
`pm/outbox/REPORT-BRIEF-2026-07-20-26-layout-overlaps-from-gpt-qa.md`: по каждому пункту file:line, что изменено, staging-proof, что отложено в NEED-CLAUDE (redesign-конфликт), SHA.
