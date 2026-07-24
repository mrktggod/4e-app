# QA-LAB-002 — Playwright visual screenshots для glass/design QA

## Цель

Сделать визуальные проверки полезными для glass-дизайна, но не превратить их в flaky-тормоз.

## Подход

Первый этап: screenshots как evidence в reports.

Второй этап: component-level baselines для стабильных блоков:

- notification card;
- task card;
- reminder popup;
- auth legal block;
- один VK safe panel.

Не начинать с full-page baseline всего приложения.

## Проверки

```bash
npm run test:e2e:web
npm run smoke:home001
npm run smoke:back067-reminder
```

Плюс новый visual script/spec после реализации.

## Done

- Есть папка/правило хранения эталонных screenshots.
- В отчёте объяснено, какие элементы сравниваются строго, а какие пока только прикладываются как evidence.
- Glass briefs получают понятный visual handoff.

