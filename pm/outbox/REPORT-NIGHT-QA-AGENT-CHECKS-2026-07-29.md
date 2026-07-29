status: PROPOSAL
date: 2026-07-29
topic: Усиление ночных проверок агентами

# Проблема

Текущий ночной runner работает как исполнитель backlog/inbox: берёт безопасную задачу, делает маленький фикс, запускает локальные proof-тесты и пушит. Это полезно, но недостаточно для качества продукта перед beta.

Что показал прогон 2026-07-29:

- ночная задача `BACK-012` была корректно ограничена и проверена локально;
- после отдельного большого QA выяснились системные регрессии, которые не были входом для ночной сессии:
  - Web/TG home потерял `Смотреть все`;
  - dark home list частично уходит под bottom nav;
  - AI chat keyboard reserve не даёт фактический padding;
  - task-detail desktop title ломает высоту;
  - VK mobile имеет визуальные хвосты: top tabs/right crop и bottom nav overlap;
  - есть конфликт между Web Playwright expectation по `#global-nav` и Telegram bottom-menu diagnostic.

Вывод: ночью сначала должен идти общий test/QA agent, а уже потом fix agents. Иначе агенты оптимизируют локальные задачи, но не закрывают свежую картину продукта.

# Новый ночной цикл

## 1. Intake/sync agent

Цель: подготовить чистую входную картину.

Обязательные действия:

- sync `app` и `docs-private`;
- забрать `pm/inbox`;
- зафиксировать текущий branch/head/status;
- если рабочее дерево грязное до старта, явно разделить:
  - pre-existing dirty files;
  - files changed by tests;
  - files changed by fixes.

Output:

- `pm/outbox/REPORT-NIGHT-INTAKE-YYYY-MM-DD.md`;
- список допустимых задач и стоп-поинтов.

## 2. QA agent первым, до любых фиксов

Цель: получить общую картину Web / Telegram / VK / static delivery.

Минимальный nightly suite:

```text
npm run build:css
node scripts/check-cp1251-mojibake.mjs
node scripts/check-js-syntax.mjs
PowerShell equivalent: portable paths
PowerShell equivalent: UI architecture
npx playwright test autotests/tests/web --reporter=line --workers=1
npx playwright test autotests/tests/telegram-app --reporter=line --workers=1
npx playwright test autotests/tests/vk-app --reporter=line --workers=1
k6 local static smoke: /index.html, /vk.html, /privacy.html
Focused smokes:
  smoke:home001
  smoke:iphone14-responsive
  smoke:back050
  smoke:back055 with CHROME_PATH fallback
  smoke:privacy-surface
  smoke:viral-share
  smoke:back067-reminder
  smoke:back068-tag-popup
  smoke:back069-hero with CHROME_PATH fallback
  smoke:telegram-dashboard-one-task
  smoke:telegram-bottom-menu
  smoke:vk-task-actions
  smoke:profile-glass
```

QA agent не чинит код. Он только классифицирует.

Output:

- `REPORT-QA-YYYY-MM-DD-playwright-k6-surfaces.md`;
- bug queue by surface:
  - Web;
  - Telegram mock;
  - VK mock;
  - shared UI;
  - infra/test tooling;
  - live/manual tails.

## 3. Triage agent

Цель: превратить красные тесты в атомарные fix briefs.

Правила:

- один баг = один brief;
- каждый brief содержит failing command, expected/actual, screenshot path, surface, allowed files, stop-points;
- если баг общий Web/TG, не создавать два дубля;
- если это live Telegram/VK/payment/auth/prod/main/CAL/secret, ставить `NEED-YURI` или `NEED-CLAUDE`;
- если тест противоречит текущему UX-решению, создать `TEST-CONTRACT` brief, а не runtime fix.

Output:

- новые `pm/inbox/BRIEF-YYYY-MM-DD-*.md` со `status: NEW`;
- приоритетная очередь: P1 release blockers first.

## 4. Fix agents после QA

Цель: чинить только атомарные briefs из triage.

Рекомендуемый порядок по результатам 2026-07-29:

1. `P1 HOME-SHOW-ALL`: вернуть `home-show-all-btn` и убрать dark bottom-nav overlap.
2. `P1 ASK-KEYBOARD-RESERVE`: починить фактический padding/reserve для `.ask-bar--keyboard-open`.
3. `P1 TASK-DETAIL-DESKTOP-TITLE`: исправить desktop long-title wrapping.
4. `P2 NAV-CONTRACT`: решить конфликт `#global-nav` vs hidden inner nav.
5. `P2 VK-MOBILE-VISUAL`: top tabs fit/scroll + bottom list reserve.
6. `P2 TEST-INFRA`: bash/Chrome fallback in scripts.

Каждый fix agent обязан:

- менять только один brief;
- запускать failing command before/after, если возможно;
- запускать shared guards;
- писать отдельный report;
- делать один commit;
- push;
- не брать следующую задачу, пока re-test по текущей не зелёный или честно `NEED-*`.

## 5. Review agent после fix

Цель: проверка агентом другого агента.

Review agent не должен быть тем же исполнителем фикса.

Что проверяет:

- changed files match brief scope;
- нет чужих pre-existing dirty changes в commit;
- failing test now green;
- нет regression in adjacent smoke;
- report contains raw evidence;
- no forbidden actions: prod, main, payment, entitlement, CAL, secrets.

Output:

- `REPORT-REVIEW-<brief>.md`;
- status:
  - `APPROVED`;
  - `NEEDS-FIX`;
  - `NEED-CLAUDE`;
  - `NEED-YURI`.

## 6. Final QA re-run

Цель: доказать, что серия фиксов не сломала другие поверхности.

Минимум:

- all failed commands from initial QA;
- all touched-surface Playwright suites;
- k6 static smoke;
- mojibake + JS syntax + UI/path guard equivalents.

Output:

- final closeout report with before/after matrix.

# Agent Roles

## QA Agent

Не пишет код. Запускает тесты, собирает скриншоты, классифицирует баги.

## Triage Agent

Не пишет код. Делает атомарные briefs из QA.

## Fix Agent

Пишет код строго по одному brief.

## Review Agent

Не пишет новый feature/fix code. Проверяет работу fix agent и может вернуть brief.

## Release Gate Agent

Только собирает итоговую матрицу. Не делает prod deploy и не merge в `main`.

# Что добавить в automation prompt

Перед текущей backlog-фазой добавить обязательный блок:

```text
ШАГ QA-0. До любых whitelist/backlog фиксов запусти nightly QA suite:
- build/css + guards;
- Playwright web/TG/VK отдельно;
- k6 local static smoke;
- focused smokes по home/task-detail/chat/VK/profile/privacy.

Если QA красный:
- не бери случайный backlog;
- создай/обнови QA report;
- создай атомарные BRIEF-* по каждому safe P1/P2 багу;
- затем выполняй эти briefs по одному.

Если QA зелёный:
- переходи к обычному pm/inbox/backlog whitelist.
```

# Практический вывод по 2026-07-29

Следующая ночная сессия не должна начинать с нового backlog cleanup. Она должна начать с фиксов по красной QA-матрице:

1. home show-all / bottom-nav overlap;
2. AI chat keyboard reserve;
3. task-detail desktop title;
4. nav test-contract decision;
5. VK mobile visual reserve/tabs;
6. test infra fallback for bash/Chrome.
