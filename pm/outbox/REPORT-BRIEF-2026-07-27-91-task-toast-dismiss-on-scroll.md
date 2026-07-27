status: DONE

# REPORT-BRIEF-2026-07-27-91-task-toast-dismiss-on-scroll

## Что сделано

Success-toast теперь гаснет быстрее и не остаётся поверх task-detail при прокрутке. Ошибки не гаснут от scroll и остаются читаемыми дольше.

Старые вызовы `showToast(message)` сохранены: добавлена общая классификация success/error без изменения логики сохранения задачи.

## Причина

`showToast()` раньше держал все сообщения одинаковые `2200ms` и не реагировал на смену scroll-контекста task-detail. Поэтому `Сохранено ✓` мог визуально висеть поверх контента при прокрутке.

Корень: `index.html:7070`.

## Изменённые файлы

- `index.html` - добавлены `dismissToast()`, более короткий таймер для success, длинный таймер для error/alert и scroll-dismiss для `#task-detail .detail-redesign-scroll`.
- `scripts/task-toast-lifecycle-smoke.mjs` - новый focused smoke на 390px.
- `package.json` - добавлен `npm run smoke:task-toast-lifecycle`.
- `FILE_MAP.md`, `DEVELOPMENT_LOG.md` - синхронизированы с новым smoke.
- `pm/inbox/BRIEF-2026-07-27-91-task-toast-dismiss-on-scroll.md` - статус `DONE`.

## Проверка

Raw:

```text
RUN smoke:task-toast-lifecycle
task toast lifecycle smoke: PASS

RUN smoke:back050
TIMEOUT after 180s in this local shell

RUN check:js-syntax
JS syntax check: no staged JS or HTML files

RUN check:js-syntax after staging
JS syntax OK: scripts/task-toast-lifecycle-smoke.mjs
JS syntax OK: index.html inline-script#1
JS syntax OK: index.html inline-script#2
JS syntax OK: index.html inline-script#3

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
styles.min.css link = True
direct UI architecture equivalent: PASS
```

`smoke:task-toast-lifecycle` проверяет mobile viewport 390x844: success auto-hide, success dismiss-on-scroll в task-detail, error остаётся видимым после scroll и потом тоже auto-hide.

`smoke:back050` не завершился за 180 секунд в этом окружении; это не блокирует бриф, потому что focused smoke покрывает изменённый lifecycle, а staged JS/mojibake/diff-check прошли.

## Статус

DONE. Ручной шаг не требуется, кроме обычной визуальной проверки на телефоне, если нужно оценить субъективную длительность success-toast.
