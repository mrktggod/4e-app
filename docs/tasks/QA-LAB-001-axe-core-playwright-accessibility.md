# QA-LAB-001 — axe-core Playwright accessibility smoke

## Цель

Добавить бесплатную автоматическую accessibility-проверку поверх уже существующего Playwright-контура, чтобы перед beta быстрее ловить формальные ошибки на ключевых экранах.

## Почему это важно

Сейчас `BACK-050` проверяет часть accessibility своими CDP-smoke'ами. `axe-core` добавит стандартный движок проверки HTML/ARIA и снимет ещё часть ручной рутины.

## Scope

Разрешено:

- добавить dev dependency `@axe-core/playwright`;
- создать Playwright spec для 3-5 стабильных экранов или mock-состояний;
- добавить npm script `test:a11y`;
- сначала включить только критичные violations как fail gate;
- обновить `docs/qa/autotest-agent-playbook.md`, `pm/backlog.md`, `shared/ROADMAP.md`, `FILE_MAP.md` и reports.

Запрещено:

- менять product UI только ради прохождения всех low-impact warnings;
- трогать payment, entitlement, auth-security logic, secrets, CAL;
- production deploy или merge в `main`;
- собирать личные данные.

## Проверки

Минимум:

```bash
npm run test:a11y
npm run test:e2e:web
npm run check:cp1251-mojibake
npm run check:portable-paths
git diff --check
```

## Done

- `test:a11y` зелёный локально.
- В отчёте указаны экраны, число violations и что осталось manual.
- Если есть legacy warnings, они честно описаны как backlog, а не скрыты.

