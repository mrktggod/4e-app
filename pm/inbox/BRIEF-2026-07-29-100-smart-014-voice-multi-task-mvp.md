status: NEW

# BRIEF-2026-07-29-100-smart-014-voice-multi-task-mvp

## Context

Алексей 2026-07-29 одобрил передачу SMART-014 в разработку.

Проблема: текущий `sendVoiceMessage()` может превратить длинное голосовое перечисление в одну задачу. Пользователь после диктовки вынужден вручную разделять дела, поэтому голос работает как замена клавиатуры, а не как AI-планировщик.

Полное ТЗ и источник требований:

- `docs/tasks/SMART-014-voice-multi-task-day-plan.md`

Приоритет: P1. Это следующий доступный продуктовый слот после текущих P0 и релизных блокеров, а не аварийная задача.

## Task

Реализовать MVP голосового разбора 2–12 самостоятельных дел из одного сообщения.

Обязательный сценарий:

1. Пользователь называет несколько дел одной голосовой фразой.
2. AI возвращает валидируемый структурированный план, а не свободный текст.
3. Приложение показывает отдельные задачи, один предложенный главный фокус и группы только как подсказку.
4. До подтверждения пользователя ни одна задача не сохраняется.
5. После нажатия `Добавить N задач` все задачи сохраняются идемпотентным batch-действием.
6. Пользователь может выбрать другой фокус или добавить задачи без приоритета.
7. Если распознано одно дело, сохраняется существующий одиночный voice-flow.
8. При ошибке AI или валидации исходный текст не теряется и предлагается безопасный повтор без скрытых записей.

Ключевые ограничения:

- не выдумывать сроки, длительность, адрес, исполнителя или договорённости;
- не склеивать связанные, но самостоятельные дела;
- не запускать `SMART-013` и не превращать одно дело в чек-лист;
- не добавлять календарные слоты, маршруты и географическую оптимизацию;
- не логировать сырые аудиозаписи и полный пользовательский текст;
- сохранить Premium-gate и согласие на обработку голоса;
- не выполнять последовательные скрытые сохранения вместо честного batch-контракта.

Техническая последовательность:

1. Создать feature-ветку `feat/smart-014-voice-multi-task-plan` от свежего `origin/main`.
2. Проверить текущие app-пути `sendVoiceMessage()`, `fallbackTaskFromText()`, `createTaskFromChat()` и task mutations.
3. Подключить актуальный Worker-репозиторий и проверить реальные `/anthropic`, `/transcribe` и task handlers.
4. Добавить строгую схему ответа `<task_plan>` и серверную валидацию.
5. Добавить идемпотентное batch-сохранение без скрытого partial success.
6. Добавить preview и явные действия подтверждения в Mini App.
7. Закрыть сценарии focused smoke и staging-проверкой под feature flag.

## Stop Points

- Если Worker-репозиторий недоступен, поставить `status: BLOCKED-WORKER-ACCESS` и написать отчёт. Не делать небезопасный frontend-only обход.
- Если для MVP требуется менять цены, платежи, entitlement, privacy-тексты или календарную архитектуру, остановиться с `NEED-YURI`.
- Не включать feature flag в production.
- Не делать production deploy.
- Не объединять изменения в `main`.
- Не использовать личные данные Юрия или других реальных пользователей в тестовых примерах.

## Acceptance Criteria

- Фраза из пяти дел создаёт preview из пяти отдельных задач.
- Звонок поставщику и сообщение Юре остаются двумя задачами.
- Не названные пользователем сроки отсутствуют и в preview, и в сохранённых данных.
- До подтверждения число новых задач в хранилище равно нулю.
- Повтор одного batch-запроса с тем же idempotency key не создаёт дубликаты.
- Ошибка одной записи не маскируется как полный успех.
- Кнопки содержат конкретные действия: `Добавить N задач`, `Выбрать другой фокус`, `Добавить без приоритета`.
- Одиночная голосовая задача продолжает работать по существующему пути.
- Premium, voice consent, cancel/back и task-title smokes остаются зелёными.
- Сырые аудиоданные и полный текст диктовки отсутствуют в аналитических событиях и отчётах.

## Verification

- Добавить `scripts/smart-014-voice-multi-task-smoke.mjs` минимум с 10 обезличенными fixtures.
- Проверить 1, 2, 5 и 12 дел; неоднозначную фразу; дубли; AI schema error; повтор idempotency key; partial failure.
- `node scripts/check-cp1251-mojibake.mjs`
- `npm run check:js-syntax`
- `npm run check:portable-paths`
- `npm run check:ui-architecture`
- `npm run smoke:premium-voice-gate`
- `npm run smoke:voice-consent-checkbox`
- `npm run smoke:voice-exit-controls`
- `npm run smoke:back065`
- Worker unit/integration tests and dry-run deploy without production publication.
- Staging smoke on 390×844 with a fresh synthetic account and raw proof without personal data.

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-29-100-smart-014-voice-multi-task-mvp.md`.

The report must include:

- app and Worker branch names and commit SHAs;
- changed files and actual endpoint contract;
- raw results of focused tests and staging smoke;
- confirmation that no production deploy or merge into `main` happened;
- honest remaining tails marked `NEEDS-REAL`, `NEED-YURI` or `BLOCKED-*`.
