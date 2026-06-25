# Commit Convention

Коммиты должны быть понятными человеку, который читает историю через неделю или перед релизом.

## Формат заголовка

```text
type(scope): что изменилось
```

## Типы

| Type | Когда использовать |
| --- | --- |
| `fix` | Исправление бага |
| `feat` | Новая функция или пользовательский сценарий |
| `docs` | Документация, карты файлов, инструкции |
| `test` | Тесты, QA-сценарии, проверки |
| `refactor` | Перестройка кода без изменения поведения |
| `chore` | Настройка проекта, служебные файлы |
| `security` | Безопасность, приватность, секреты, юридические риски |

## Scope

Scope должен называть область:

- `ui`
- `vk`
- `auth`
- `tasks`
- `privacy`
- `payments`
- `bot`
- `worker`
- `process`
- `docs`

## Правила

1. Заголовок описывает результат, а не процесс.
2. Не использовать расплывчатые заголовки вроде `fix`, `update`, `правки`, `final`.
3. Один коммит - одна понятная задача.
4. Если коммит рискованный, добавить тело с причиной, проверкой и планом отката.
5. После коммита записать результат в `DEVELOPMENT_LOG.md` и `shared/WORK_LOG.md`.

## Хорошие примеры

```text
fix(vk): warm up auth endpoint before first login
fix(ui): keep home and global navigation in sync
docs(process): add file maps and QA workflow
security(worker): restore Anthropic key placeholder
test(ui): add smoke checklist for login and tasks
```

## Плохие примеры

```text
fix
update
правки
final
changes after test
```
