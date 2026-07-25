status: DONE

# SAFE-AREA-RESERVE-2026-07-25 — единый нижний reserve token

Дата проверки: 2026-07-25.
Ветка: `feat/admin-tariff-api`.
Тип работы: узкий CSS/LESS фикс + evidence.

## Что было не так

Нижний запас экрана считался разными способами:

- `--app-bottom-nav-reserve`;
- прямые `calc(... + var(--safe-area-bottom))`;
- прямые `env(safe-area-inset-bottom, ...)`;
- отдельные числа для profile footer, subscription scroll, notifications, chat/ask composer.

Из-за этого невозможно было одним местом понять, сколько места приложение оставляет под нижний UI, safe-area и браузерную панель.

## Что изменено

Введён единый LESS-токен:

```less
@app-viewport-bottom-reserve: var(--app-viewport-bottom-reserve);
```

В корне CSS добавлен единый runtime-токен:

```css
--app-viewport-bottom-reserve: calc(96px + var(--safe-area-bottom));
--app-bottom-nav-reserve: var(--app-viewport-bottom-reserve);
```

Старый `--app-bottom-nav-reserve` оставлен alias-ом, чтобы не ломать существующие места, которые могут использовать его вне проверенного LESS-слоя.

## Где применено

- `styles/layout.less`: общий scroll reserve.
- `styles/screens/voice.less`: subscription scroll, conversation scroll-padding, ask keyboard-open.
- `styles/screens/tasks.less`: ask bar, notifications scroll.
- `styles/screens/profile.less`: profile footer reserve.
- `styles/screens/home.less`: subscription footer reserve.
- `styles/screens/light-redesign.less`: home task-list reserve, замена прямого `env(...)` на `var(--safe-area-bottom)`, адаптивная ширина home artboard.

Состав нижней навигации и action-кнопок не менялся.

## Найденный и исправленный узкий баг

На `390x844` home artboard мог давать видимый риск из-за фиксированной ширины `430px`. Поздний override заменён на:

```css
width: min(430px, 100vw);
```

Также у `#home-task-list` добавлена собственная прокрутка и нижняя граница через `@app-viewport-bottom-reserve`, чтобы последняя карточка не попадала под фиксированный nav.

## Evidence

Артефакты:

- DOM-метрики: `docs/tasks/assets/safe-area-reserve-2026-07-25/SAFE-AREA-RESERVE-2026-07-25-metrics.json`
- Скриншоты: `docs/tasks/assets/safe-area-reserve-2026-07-25/`

Сводка финального прогона:

```text
records: 4
visibleOverflows: 0
bottomOverflows: 0
token: calc(96px + 0px)
```

Портрет `390x844`, home:

```text
last card bottom: 708
nav top: 724
result: карточка не перекрыта
```

Портрет `390x844`, profile:

```text
profile scroll padding-bottom: 132px
bottomOverflows: 0
```

Портрет `390x844`, ask keyboard-open:

```text
ask composer bottomOverflows: 0
padding-bottom: 96px
```

Landscape `844x390`:

```text
visibleOverflows: 0
bottomOverflows: 0
residual: home task-list физически не помещается по высоте старой absolute-композиции и остаётся отдельным кандидатом на landscape-layout brief.
```

## Верификация

```text
npm run build:css
node scripts/check-cp1251-mojibake.mjs
git diff --check
```

`env(safe-area-inset-bottom)` после правки остался только в корневом определении `--safe-area-bottom`.
