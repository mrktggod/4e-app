# Матрица следующего цикла — 2026-07-17

Цель: не смешивать утренний ручной QA, безопасные docs/product-решения и большие runtime-изменения. Этот файл фиксирует порядок после ночной подготовки и помогает не трогать лишнее в платежной/security ветке.

## 1. Утром сначала ручной QA

| Блок | Что проверить | Что делать по результату |
| --- | --- | --- |
| Auth / registration | Регистрация, вход, неверный пароль, повторная регистрация, staging CORS/worker URL | Если ломается — заводить P0/P1 баг и чинить первым |
| Task-first flow | Создание задачи, confirm, сохранение, перезагрузка, перенос срока | Если ломается — чинить до beta invite |
| Chat composer | Клавиатура, мобильная верстка, send/voice entry, возврат после task flow | Если ломается — чинить до beta invite |
| Entitlement / paywall | Free/trial/premium copy, доступ к premium-only действиям, expired fixture | Если ломается — чинить до платного smoke |
| Analytics | Ключевые события после реальных действий, отсутствие дублей | Если ломается — чинить до запуска beta loop |

## 2. Если утренний QA зеленый

| Направление | Статус | Следующий шаг |
| --- | --- | --- |
| BETA-001 | Partial Done | Запускать закрытую beta по runbook, без расширения scope |
| FEEDBACK-001 | Partial Done | Включить ежедневную разборку feedback intake |
| RELEASE-BETA-GATES | Docs ready | Использовать как go/no-go чеклист перед приглашениями |
| Morning command center | Docs ready | Вести утреннюю проверку оттуда, не из переписки |

## 3. Ready for QA, не закрывать по исходникам

| Группа | Задачи | Правило |
| --- | --- | --- |
| Auth / OAuth | BACK-035, BACK-036, BACK-041, BACK-045 | Закрывать только после живого staging/prod smoke |
| Home / task flow | HOME-001, BACK-050, NEW-006, NEW-008, NEW-020 | Закрывать только руками в браузере |
| Monetization | BACK-009, BACK-010, BACK-019, BACK-040 | Не менять цену, только проверять gates/copy/access |
| Smart / infra | SMART-004, SMART-011, INFRA-001, INFRA-002 | Не считать Done без наблюдаемого runtime-подтверждения |

## 4. Partial Done, не лезть в runtime до beta QA

| Группа | Задачи | Почему не трогаем ночью |
| --- | --- | --- |
| Offline / PWA / Native | BACK-057, PLAT-002, PLAT-003 | Нужны отдельные device-smoke и упаковка решений |
| Architecture | BACK-012, BACK-011, INFRA-006 | Сначала стабилизировать одну рабочую копию и CSS-план |
| Smart value | SMART-012, VIRAL-001, VIRAL-003, VIRAL-005, VIRAL-006 | Есть product/docs/value groundwork, но нужна проверка UX |
| Product surfaces | OMNI-001, CAL-001 | Есть decision groundwork, но CAL implementation в карантине |

## 5. Deferred до отдельного решения

| Группа | Задачи | Условие возврата |
| --- | --- | --- |
| Native launch | PLAT-001, NATIVE-001, NATIVE-002, NATIVE-003, NATIVE-004, NATIVE-005 | Возвращаться после beta gates и платформенного go/no-go |
| OAuth profile | BACK-058 | Возвращаться только с явным consent/copy решением |
| Calendar implementation | CAL-002, CAL-003 | Возвращаться после отдельной ветки/брифа, не в payment/security ветке |

## 6. Явно не трогать в этом цикле

| Запрет | Причина |
| --- | --- |
| Merge в main | Требует отдельного release window |
| Цена 990/999 | Отдельное бизнес-решение |
| Новая реализация CAL | Была уже карантинирована из этой ветки |
| Native store launches | Требуют ручных аккаунтов/платформ |
| Workspace implementation | Сначала только план унификации, без переноса кода ночью |
| OAuth profile fields без consent | Риск приватности и UX |
| .pages-dist/privacy.html | Dirty build-артефакт, не часть текущих docs-срезов |

## 7. Порядок после утра

| Приоритет | Действие | Выход |
| --- | --- | --- |
| 1 | Пройти manual QA checklist | Список pass/fail и P0/P1 баги |
| 2 | Починить только P0/P1 из QA | Малые коммиты с push и WORK_LOG |
| 3 | Если P0/P1 нет — beta invite | Запущен closed beta loop |
| 4 | После первых отзывов — выбрать один product slice | Не больше одного runtime-направления за раз |