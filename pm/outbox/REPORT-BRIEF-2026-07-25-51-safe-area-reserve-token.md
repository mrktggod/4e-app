status: DONE

# REPORT-BRIEF-2026-07-25-51 — safe-area reserve token

## Итог

Задача выполнена. Введён единый нижний reserve token, CSS пересобран, портретный сценарий `390x844` проверен evidence-метриками.

## Изменённые файлы

- `styles/layout.less`
- `styles/screens/voice.less`
- `styles/screens/tasks.less`
- `styles/screens/profile.less`
- `styles/screens/home.less`
- `styles/screens/light-redesign.less`
- `styles.css`
- `styles.min.css`
- `docs/tasks/SAFE-AREA-RESERVE-2026-07-25-evidence.md`
- `docs/tasks/assets/safe-area-reserve-2026-07-25/`

## Что исправлено

- Добавлен `@app-viewport-bottom-reserve`.
- Добавлен CSS custom property `--app-viewport-bottom-reserve`.
- Старый `--app-bottom-nav-reserve` оставлен alias-ом на новый токен.
- Scroll/footer reserves переведены на новый токен.
- Убран прямой `env(safe-area-inset-bottom)` из feature-LESS, кроме корневого объявления.
- Исправлен узкий home overflow: `dash-artboard` больше не фиксируется в `430px` на 390px viewport.
- `#home-task-list` получил scroll area и нижнюю границу через reserve, чтобы последняя карточка не попадала под nav в portrait.

## Evidence

- Документ: `docs/tasks/SAFE-AREA-RESERVE-2026-07-25-evidence.md`
- Метрики: `docs/tasks/assets/safe-area-reserve-2026-07-25/SAFE-AREA-RESERVE-2026-07-25-metrics.json`
- Скриншоты: `docs/tasks/assets/safe-area-reserve-2026-07-25/`

Финальный summary:

```text
records: 4
visibleOverflows: 0
bottomOverflows: 0
coveredCards: home-landscape-844x390
tokens: calc(96px + 0px)
home portrait: last card bottom 708, nav top 724
```

## Residual

`home-landscape-844x390` остаётся отдельным layout-долгом: старая absolute-композиция home физически не помещает task-list по высоте landscape. В этой задаче не делал широкий landscape redesign, потому пользователь запретил широкий редизайн и nav-contract изменения.

## Верификация

```text
npm run build:css
node scripts/check-cp1251-mojibake.mjs
git diff --check
```

Фактический вывод:

```text
npm run build:css: ok
CP1251 mojibake check passed: 0 suspicious tokens
git diff --check: без вывода
```
