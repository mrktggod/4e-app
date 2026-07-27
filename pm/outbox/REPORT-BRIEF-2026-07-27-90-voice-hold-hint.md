status: DONE

# REPORT-BRIEF-2026-07-27-90-voice-hold-hint

## Что сделано

Добавлена небольшая подсказка над центральной кнопкой главного экрана: `Удерживай для голоса`.

Кнопка связана с подсказкой через `aria-describedby`, поэтому смысл жеста виден и визуально, и для доступности. Логика голосового режима, разрешения микрофона и Premium-gate не менялись.

## Причина

На главном экране центральная кнопка уже имела `aria-label` с текстом про удержание, но видимой подсказки для первого использования не было.

Корень: `index.html:372`.

## Изменённые файлы

- `index.html` - добавлена видимая подсказка и `aria-describedby`.
- `styles/screens/home.less` - добавлены стили подсказки.
- `styles.css`, `styles.min.css` - пересобраны из LESS.
- `scripts/voice-hold-hint-smoke.mjs` - новый 390px DOM/visual smoke.
- `package.json` - добавлен `npm run smoke:voice-hold-hint`.
- `FILE_MAP.md`, `DEVELOPMENT_LOG.md` - синхронизированы с новым smoke.
- `pm/inbox/BRIEF-2026-07-27-90-voice-hold-hint.md` - статус `DONE`.

## Проверка

Raw:

```text
RUN build:css
PASS

RUN smoke:voice-hold-hint
voice hold hint smoke: PASS {"text":"Удерживай для голоса","display":"flex","opacity":1,"hint":{"left":122.46875,"right":267.53125,"top":715,"bottom":739,"width":145.0625,"height":24},"button":{"top":746,"bottom":814},"describedBy":"home-voice-hold-hint"}

RUN smoke:voice-exit-controls
voice exit controls smoke: PASS

RUN smoke:premium-voice-gate
premium voice gate smoke: PASS

RUN smoke:voice-consent-checkbox
voice consent checkbox smoke: PASS

RUN check:cp1251-mojibake
CP1251 mojibake check passed: 0 suspicious tokens

RUN check:js-syntax after staging
JS syntax OK: scripts/voice-hold-hint-smoke.mjs
JS syntax OK: index.html inline-script#1
JS syntax OK: index.html inline-script#2
JS syntax OK: index.html inline-script#3

RUN diff-check
PASS

RUN check:portable-paths
Unable to run scripts/check-portable-paths.sh: spawnSync bash ENOENT

RUN direct portable path equivalent
direct portable path equivalent: PASS

RUN check:ui-architecture
Unable to run scripts/check-ui-architecture.sh: spawnSync bash ENOENT

RUN direct UI architecture equivalent
inline style attributes = 292 / 465
inline event handlers = 401 / 402
style tags = 0 / 0
inline script tags = 3 / 3
styles.min.css link = True
direct UI architecture equivalent: PASS
```

Первый focused smoke нашёл перекрытие подсказки с центральной кнопкой; после поднятия подсказки повторный прогон прошёл.

## Статус

DONE. Нужна только обычная ручная проверка на реальном телефоне, если команда хочет оценить визуальную заметность подсказки в Telegram Mini App.
