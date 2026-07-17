# Beta invite ready checklist — 2026-07-17

Purpose: make the next human step small and unambiguous. This file does not start beta and does not send invites.

## Current decision

Not ready to send automatically.

Autonomous staging smoke is green, but closed beta still needs a short manual browser/mobile pass before Yuri sends invites.

## Already green from autonomous QA

| Check | Status | Evidence |
| --- | --- | --- |
| Staging app shell | PASS | `GET https://4-ai-staging.pages.dev/ -> 200` |
| Staging worker wiring | PASS | HTML points to `restless-lab-d737-staging.shelckograff.workers.dev` |
| Browser CORS preflight | PASS | `OPTIONS /auth/login` with staging Origin returned `204` and matching ACAO |
| API auth | PASS | register/login/auth-me returned `200` in `scripts/api-smoke.mjs` |
| Task persistence API | PASS | create/list/receiver/done/delete returned `200` |
| AI endpoint | PASS | `/anthropic` returned `200` |
| Transcribe negative | PASS | no-file returned `400` |

Raw evidence: `docs/tasks/STAGING-AUTOMATED-QA-2026-07-17.md`.

## Manual go/no-go before sending invites

Yuri should do this on the target surface that testers will use first, preferably mobile web or Telegram/VK if that is the invite path.

| Step | Pass condition | If fail |
| --- | --- | --- |
| 1. Fresh registration | New account reaches home, no `Нет соединения` | Stop invites, file P0/P1 bug |
| 2. Login existing account | Correct password reaches home | Stop invites if login is blocked |
| 3. Create task | Task can be created from the main flow | Stop invites if task cannot be saved |
| 4. Reload/reopen | Created task remains visible after reload | Stop invites if task disappears |
| 5. AI/chat first message | First useful message does not crash or trap user | Stop invites if AI blocks first value |
| 6. Mobile composer/safe area | Keyboard/composer/bottom nav do not block task/chat flow | Stop invites if mobile flow is blocked |
| 7. Trial/free path | New tester is not accidentally blocked by paywall | Stop invites if trial/free path is gated |

Go for a tiny beta only if steps 1-7 pass or any failure has a clear workaround that does not block the first day.

## First invite batch

Start with 3-5 people, not 10.

Best first testers:

- they manage real daily tasks or promises;
- they can send a screenshot or short bug note;
- they are comfortable with a closed test;
- at least two use mobile web/Telegram;
- ideally one uses VK if VK is part of the current surface check.

Avoid first:

- users who need workspace/team features immediately;
- users who mainly judge visual polish;
- users who need paid flow right now;
- users who will not report where something broke.

## Ready-to-send short invite

```text
Привет! Дам тебе закрытый доступ к 4 — личному AI-штабу дня.

Проверь, пожалуйста, короткий сценарий:
1. Зарегистрироваться или войти.
2. Добавить 3 реальные задачи на сегодня/неделю.
3. Посмотреть, какой фокус дня соберёт 4.
4. Закрыть одну задачу.

Если что-то ломается — просто пришли скрин и три слова:
где нажал / что ожидал / что вышло.

Это закрытый тест. Оплату и тарифы сейчас не проверяем, мне важнее понять, работает ли базовый дневной сценарий.
```

## Follow-up after 2-4 hours

```text
Получилось зайти и добавить первые задачи?

Если да — попробуй закрыть одну задачу и посмотри, понятно ли, что делать дальше.

Если нет — пришли скрин, я разберу как баг.
```

## Day 2 follow-up

```text
Хочу проверить главное: вернулся ли 4 во второй день.

Открой, пожалуйста, приложение ещё раз:
1. Сохранились ли вчерашние задачи?
2. Понятно ли, что делать сегодня?
3. Есть ли что-то, что мешает пользоваться?

Можно ответить одной фразой.
```

## Feedback intake format

Use one row per signal:

```text
Кто:
Поверхность: web / PWA / Telegram / VK
Сценарий:
Где нажал:
Что ожидал:
Что увидел:
Скрин/видео:
Влияние: blocker / painful / cosmetic / idea
```

## Do not do during invite

- Do not change price.
- Do not start real paid purchase checks.
- Do not open CAL/native/platform work.
- Do not promise workspace/team mode.
- Do not expand to 10 users before first 3-5 complete day-one flow.
