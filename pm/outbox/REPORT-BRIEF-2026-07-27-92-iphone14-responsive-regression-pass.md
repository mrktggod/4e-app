status: DONE

# REPORT-BRIEF-2026-07-27-92-iphone14-responsive-regression-pass

## Что сделано

Добавлен focused smoke для iPhone 14-like viewport `390x844`.

Проверены:

- Today task rows;
- task detail;
- statistics;
- date/time popover;
- bottom navigation;
- long task titles;
- отсутствие horizontal overflow.

Runtime UI не менялся: smoke не нашёл узкий воспроизводимый дефект, который нужно чинить в этом брифе.

## Изменённые файлы

- `scripts/iphone14-responsive-regression-smoke.mjs` - новый Playwright smoke.
- `package.json` - добавлен `npm run smoke:iphone14-responsive`.
- `FILE_MAP.md`, `DEVELOPMENT_LOG.md` - синхронизированы с новым smoke.
- `pm/inbox/BRIEF-2026-07-27-92-iphone14-responsive-regression-pass.md` - статус `DONE`.

## Проверка

Raw:

```text
RUN smoke:iphone14-responsive
iphone14 responsive regression smoke: PASS

home documentWidth=390
home rows=2
home firstRow left=19 right=371 width=352
home bottomNav left=14 right=376 width=362

task-detail documentWidth=390
detail hero left=12 right=378 height=416
detail title width=332 scrollWidth=332 clientWidth=332
detail statusGrid top=82 bottom=237
detail chatCard top=677

date popover left=121 right=361 width=240
date input left=132 right=350 width=218

statistics documentWidth=390
statistics activeList left=47 right=343 width=296
globalNav left=16 right=374 width=358

RUN check:js-syntax after staging
JS syntax OK: scripts/iphone14-responsive-regression-smoke.mjs

RUN check:cp1251-mojibake
CP1251 mojibake check passed: 0 suspicious tokens

RUN diff-check
PASS

RUN direct portable path equivalent
direct portable path equivalent: PASS

RUN direct UI architecture equivalent
inline style attributes = 292 / 465
inline event handlers = 401 / 402
style tags = 0 / 0
inline script tags = 3 / 3
direct UI architecture equivalent: PASS
```

## Статус

DONE. Узких новых багов smoke не выявил; follow-up briefs не нужны по результатам этого прогона.
