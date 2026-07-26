# REPORT-BRIEF-2026-07-26-78-ai-delete-intent-refuse-fix

status: DONE
date: 2026-07-26
branch: feat/admin-tariff-api

## Задача

Закрыть P0-сценарий, где запрос пользователя в AI-чате вида "удали задачи" мог быть интерпретирован как ближайшее разрешённое действие `complete`, из-за чего задачи могли массово завершаться вместо безопасного отказа.

Решение по брифу: не добавлять удаление через чат и не делать confirm-flow. Нужно честно отказать текстом и не выполнять никаких действий.

## Корень

- `index.html:5765` — в промпт чата внутри карточки задачи добавлено прямое правило: если пользователь просит удалить, убрать или стереть задачу, `actions` не создавать, ответить текстовым отказом.
- `index.html:6911` — в общий AI-чат добавлено такое же правило: на удаление задач отвечать обычным текстом и не добавлять `<task_actions>`.
- `index.html:5577` — добавлен общий allow-list допустимых AI-действий: `show`, `complete`, `reschedule`, `edit`, `remind`.
- `index.html:5587` и `index.html:6607` — оба нормализатора действий теперь сначала проверяют тип через allow-list. Любой неизвестный тип (`delete`, `remove`, `drop` и т.п.) отбрасывается и не может попасть в mutation-путь.

## Что изменено

- `index.html` — только узкий guard и две строки системного промпта.
- `pm/inbox/BRIEF-2026-07-26-78-ai-delete-intent-refuse-fix.md` — статус переведён в `DONE`.
- Этот отчёт добавлен в `pm/outbox/`.

Не трогал:

- `done-task`;
- `postTaskChatMutation`;
- платежи, цены, entitlement;
- `main` и production deploy.

## Проверка

Кодировка `index.html`:

```text
Before index encoding matches: 112
After index encoding matches: 114
```

Рост числа совпадений ожидаемый: в промпт добавлены новые русские строки со словами "задачу/задачи".

Фокусный smoke контракта AI-действий:

```text
AI delete-intent refusal smoke: PASS
taskChat delete/remove normalized actions: []
globalChat delete/remove normalized actions: []
globalChat allowed regression: show,complete,reschedule,edit,remind
taskChat allowed regression: show,complete,reschedule,edit,remind
```

Что проверяет smoke простыми словами:

- если модель всё равно пришлёт action `delete`, `remove` или неизвестный тип, приложение его выбросит;
- неизвестный action не превращается в `complete`;
- старые разрешённые действия (`show`, `complete`, `reschedule`, `edit`, `remind`) продолжают проходить.

Обязательные проверки перед коммитом:

```text
node scripts/check-cp1251-mojibake.mjs
CP1251 mojibake check passed: 0 suspicious tokens

node scripts/check-js-syntax.mjs
JS syntax OK: index.html inline-script#1
JS syntax OK: index.html inline-script#2
JS syntax OK: index.html inline-script#3

git diff --cached --check
PASS

npm run check:portable-paths
Unable to run scripts/check-portable-paths.sh: spawnSync bash ENOENT

PowerShell equivalent of scripts/check-portable-paths.sh
Portable path equivalent check passed.
```

`check:portable-paths` не смог стартовать только потому, что `bash` отсутствует в `PATH` текущей Codex-сессии. Обход через абсолютный путь на C: не использовался. Эквивалентная проверка выполнена тем же `git grep`-паттерном по tracked-файлам.

## Остаток

После деплоя staging желательно один раз вручную проверить живую AI-фразу:

```text
удали все задачи
```

Ожидаемо: текстовый отказ, задачи не меняют статус, кнопки подтверждения действий не появляются.
