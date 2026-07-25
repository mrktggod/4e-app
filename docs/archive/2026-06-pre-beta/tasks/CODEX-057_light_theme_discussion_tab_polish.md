# CODEX-057 — Light theme + task discussion tab polish

Дата: 2026-06-20
Статус: опубликовано в GitHub Pages, локальная копия синхронизирована

## Контекст

После параллельного redesign-спринта новый тёмный дизайн VK Mini App уже отображался и анимация планеты работала. Пользователь показал два визуальных состояния:

- целевой светлый экран с белым фоном;
- фактический экран, где карточки уже светлые, но фон главного экрана оставался чёрным.

Дополнительно в карточке задачи вкладку `Комментарии` нужно было переименовать в `Обсудить задачу`, потому что внутри вкладки теперь используется сценарий обсуждения задачи с AI, а не просто комментарии.

## Причина

- В redesign CSS у `#home` был жёсткий фон `#0a0f07`. Это правило сильнее обычных light-переменных и поэтому оставляло фон чёрным даже при `data-theme="light"`.
- VK Bridge при `VKWebAppUpdateConfig` / `VKWebAppGetConfig` напрямую выставлял `data-theme` по схеме VK. Если пользователь явно выбрал светлую тему, хост мог снова перетереть её тёмной схемой.
- В task detail оставались старые labels и empty-state строки для комментариев.

## Решение

В `index.html`:

- light theme variables переведены на белый/молочный фон;
- добавлен явный override `html[data-theme="light"] #home{background:#FFFFFF}`;
- добавлены light overrides для hero/task text в новом home v2, чтобы на белом фоне не оставались полупрозрачные dark-only цвета;
- добавлены `getStoredThemeChoice()`, `shouldFollowHostTheme()` и `applyHostThemeScheme()`;
- VK host scheme теперь применяется только если тема не выбрана явно или стоит `system`;
- VK Storage theme теперь проходит через `applyTheme(t)`, а не напрямую пишет `data-theme`;
- вкладка `Комментарии` переименована в `Обсудить задачу`;
- empty state `Комментариев пока нет` заменён на `Обсуждения пока нет`;
- placeholder заменён на `Написать по задаче...`.

Изменения внесены в:

- `4e-app/index.html` — локальная рабочая копия;
- `.tmp-4e-app-publish/index.html` — publish clone `mrktggod/4e-app`.

## Публикация

- Репозиторий: `mrktggod/4e-app`
- Commit: `f3dc86a`
- Message: `fix: polish light theme discussion tab`
- Push: `ba3b345..f3dc86a main -> main`
- Live URL: `https://mrktggod.github.io/4e-app/index.html`

## Проверка

Пройдены проверки:

- `node scripts\verify-redesign-light-theme-html.mjs`
- `node scripts\verify-redesign-light-theme-html.mjs .tmp-4e-app-publish\index.html`
- `git -c safe.directory=C:/Users/shelc/Documents/4/.tmp-4e-app-publish diff --check`
- Raw GitHub readback:
  - `discussion=true`
  - `lightHome=true`
  - `vkThemeGuard=true`
- GitHub Pages cache-busted readback:
  - `discussion=true`
  - `lightHome=true`
  - `vkThemeGuard=true`

## Ограничения

- Worker, D1 и авторизация не менялись.
- `4-ai.site` не трогался.
- `vk.html` остаётся отдельным legacy/auth-focused экраном и не редиректит на новый redesign `index.html`. Если в настройках VK Mini App всё ещё указан `https://mrktggod.github.io/4e-app/vk.html`, для проверки нового дизайна нужно переключить mobile URL на `https://mrktggod.github.io/4e-app/index.html` или подтвердить, что Клод уже сделал это в VK.

## Ручной smoke

1. Открыть `https://vk.ru/app54636698`.
2. Убедиться, что загружается redesign-экран с планетой/карточками.
3. Переключить тему на светлую.
4. Ожидаемо: фон главного экрана белый/молочный, без чёрной подложки вокруг карточек.
5. Открыть карточку задачи.
6. Ожидаемо: вкладка называется `Обсудить задачу`.
