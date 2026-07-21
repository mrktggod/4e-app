status: DONE

# BRIEF-2026-07-20-20-back012-css-bem-cleanup

## Context
Юрий 2026-07-20 снял стоп «CSS-cleanup до беты» для автономной ночи (BACK-012). Цель — снижать inline-долг, вид не менять.

## Предохранитель (важно)
Юрий вечером доделывает redesign в `index.html`/`styles`. К началу работы проверь `git status`: если в `index.html`/`styles.css`/`styles.min.css`/`styles/screens/*` есть НЕзакоммиченные изменения — НЕ трогай эти файлы (это ручная работа Юрия), пометь задачу `NEED-CLAUDE` и остановись. Работай только когда дерево по ним чистое.

## Task
Снижение inline-стиля по одному BEM-острову за коммит:
1. Найди частые/простые `style="..."` острова (UI-guard сейчас ~366/465 inline style attrs).
2. Вынеси их в соответствующий `styles/screens/*.less`, пересобери `styles.css`/`styles.min.css` (`npm run build:css`). Разметку/вид НЕ менять — только перенос стиля.
3. Один остров = один коммит с понятным сообщением.

## Stop Points
- ❌ Не трогать незакоммиченный redesign (см. Предохранитель).
- ❌ prod, merge в main, CAL, цены, секреты, платёжка/entitlement.
- ❌ Не менять визуал/разметку/семантику — только inline→LESS.

## Verification
- `check-ui-architecture.sh`: inline baseline СНИЗИЛСЯ (не вырос).
- `npm run build:css` exit 0; `node scripts/check-cp1251-mojibake.mjs` = 0.
- Экран визуально не изменился (staging/headless smoke затронутого экрана).

## Report
`pm/outbox/REPORT-BRIEF-2026-07-20-20-back012-css-bem-cleanup.md`: какие острова вынесены, старый→новый baseline, SHA, proof.
