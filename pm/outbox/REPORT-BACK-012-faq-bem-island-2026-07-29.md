status: DONE
task: BACK-012 FAQ BEM island cleanup
date: 2026-07-29
runner: Codex automation

# Что сделано

Закрыт маленький whitelist-срез по `BACK-012`: FAQ search/help card переведены с inline styles на BEM-классы в LESS, а FAQ inline handlers заменены на `bindFaqHandlers()` с обычными `addEventListener`.

Поведение не менялось:

- поиск по FAQ всё ещё вызывает `filterFaq`;
- раскрытие вопросов всё ещё вызывает `toggleFaq`;
- кнопка "Написать в поддержку" всё ещё открывает `write-support`;
- prod deploy, `main`, платежи, entitlement, auth-security, CAL и секреты не трогались.

# Изменённые файлы

- `index.html`
- `styles/screens/voice.less`
- `styles/screens/tasks.less`
- `styles.css`
- `styles.min.css`

# Проверки

```text
npm run build:css
exit 0

node scripts/check-cp1251-mojibake.mjs
CP1251 mojibake check passed: 0 suspicious tokens

node scripts/check-js-syntax.mjs
JS syntax check: no staged JS or HTML files

PowerShell equivalent of scripts/check-portable-paths.sh
Portable path check passed (PowerShell equivalent).

PowerShell equivalent of scripts/check-ui-architecture.sh
UI architecture guard: inline style attributes = 284 / 465
UI architecture guard: inline event handlers = 394 / 402
UI architecture guard: style tags = 0 / 0
UI architecture guard: inline script tags = 3 / 3

git diff --check
exit 0

FAQ BEM island smoke
FAQ BEM island smoke passed
```

`npm run check:portable-paths` и `npm run check:ui-architecture` не стартуют в этой Windows-среде, потому что `bash` не найден в PATH (`spawnSync bash ENOENT`). Поэтому выполнены прямые эквиваленты тех же правил.

`npx playwright test autotests/tests/web/basic.spec.ts --reporter=line --workers=1 --timeout=30000` завис без вывода и был остановлен таймаутом automation. Для этого узкого cleanup основной proof — guard-ы и статический FAQ smoke.

# Результат

`BACK-012` получил один безопасный атомарный cleanup: FAQ блок уменьшил inline-style и inline-handler debt, не меняя пользовательский сценарий.
