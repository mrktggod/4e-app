# Morning command center — 2026-07-17

Цель: один входной файл на утро. Не читать всю ночную историю подряд.

## 1. Сначала проверить core

Открыть:

- `pm/manual-qa-2026-07-17.md`
- `pm/ready-for-qa-triage-2026-07-17.md`
- `docs/tasks/RELEASE-BETA-GATES-2026-07-16.md`

Порядок:

1. Email signup/login.
2. Task create/save/reload.
3. Home visual sanity.
4. Mobile composer/safe-area.
5. Trial/free path не блокируется paywall.
6. Share cards/PWA только после core sanity.

Go для beta invite только если core pass.

## 2. Если core pass

Открыть:

- `pm/beta-run-2026-07.md`
- `pm/beta-invite-pack-2026-07.md`
- `pm/feedback-loop-2026-07.md`

Действие:

1. Выбрать 3-5 первых тестеров, не сразу 10.
2. Отправить короткий invite.
3. Попросить проверить: регистрация -> 3 задачи -> фокус дня -> закрыть одну задачу.
4. Вести feedback в формате `где нажал / что ожидал / что реально произошло`.

## 3. Если core fail

Не звать новых beta-пользователей.

Действие:

1. Завести bug в `pm/bugs.md`.
2. Пометить blocker severity.
3. Не закрывать Ready for QA в `Done`.
4. Не начинать CAL/native/platform.

## 4. Если beta стартовала

Открыть:

- `pm/post-beta-decision-tree-2026-07.md`

Через 2-3 дня классифицировать результат:

- A: core broken -> чинить blockers.
- B: retention weak -> activation/return loop.
- C: time realism -> CAL-002.
- D: outside capture pain -> share sheet/browser/email source.
- E: reminders value -> push/actions later.
- F: team promises dominate -> SMART-011 / workspace later.

## 5. Что не трогать утром

- merge main;
- цену;
- CAL implementation;
- native/platform launches;
- workspace implementation;
- OAuth profile fields without consent;
- VK Pay as paid-ready по одному UI smoke;
- `.pages-dist/privacy.html` build artifact.

## 6. Документы решений

Если нужно понять почему что-то deferred:

- `docs/tasks/PRODUCT-DECISIONS-2026-07-16.md`
- `docs/tasks/NATIVE-PLATFORM-DECISIONS-2026-07-16.md`
- `docs/tasks/MONETIZATION-DECISIONS-2026-07-16.md`
- `docs/tasks/BACK-058-oauth-profile-consent.md`
- `docs/tasks/VIRAL-005-first-ai-plan-wow.md`

## 7. Минимальный отчёт после утренней проверки

```text
Дата:
Поверхность:
Core auth: pass/fail
Task save/reload: pass/fail
Mobile layout: pass/fail
Paywall/trial: pass/fail
Share/PWA: pass/fail
Blockers:
Можно звать beta: да/нет
Следующий шаг:
```
