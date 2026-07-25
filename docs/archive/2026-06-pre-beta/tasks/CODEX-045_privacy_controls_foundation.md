# CODEX-045 — privacy controls foundation

Done: добавлен минимальный D1-фундамент для юридически безопасного обращения с пользовательскими данными.

## Контекст

- Claude расширил общий план блоком юридической безопасности и персональных данных.
- Для беты недостаточно просто хранить D1-данные: нужен проверяемый слой согласий, настроек приватности, export/delete заявок и retention-оснований.
- Этот шаг не является юридическим заключением и не заменяет политику конфиденциальности/оферту/консультацию юриста; это инженерный фундамент под такие документы и пользовательские сценарии.

## Решение

- Добавлена миграция `4e-worker/migrations/0006_privacy_controls.sql`.
- Добавлены таблицы:
  - `user_privacy_settings`;
  - `user_consents`;
  - `data_subject_requests`.
- Добавлен D1-compatible repository:
  - `4e-worker/src/worker/data/privacy-repository.mjs`.
- Добавлен synthetic verifier:
  - `scripts/verify-privacy-controls-repository.mjs`.
- `scripts/verify-d1-schema.js` обновлён на новые таблицы.

## Что закрывает для пользователя и команды

- Пользователь сможет явно управлять AI-памятью, AI-обработкой, импортом/отправкой сообщений и сроком хранения raw messages.
- Команда получает проверяемую историю согласий: grant/revoke не перетираются, а записываются как события.
- Экспорт/удаление данных становятся отдельными заявками, которые можно обработать, залогировать и проверить.
- Мессенджер-интеграции можно подключать через opt-in permissions, не смешивая “прочитать переписку”, “отправлять сообщения” и “анализировать ИИ”.

## Проверка

- `node --check 4e-worker/src/worker/data/privacy-repository.mjs` прошёл.
- `node --check scripts/verify-privacy-controls-repository.mjs` прошёл.
- `node scripts/verify-privacy-controls-repository.mjs` прошёл:
  - defaults `ok`;
  - settings upsert `ok`;
  - consent grant/revoke history `ok`;
  - data subject requests `ok`;
  - cascade delete `ok`;
  - synthetic-only privacy notice `ok`.
- `node scripts/verify-d1-schema.js` прошёл:
  - tables `24`;
  - indexes `31`;
  - foreign keys `ok`;
  - user cascade delete `ok`.

## Ограничения

- Production D1 не менялся и миграция не применялась remote.
- UI и HTTP routes для privacy center ещё не добавлены.
- Автоматический retention job ещё не реализован.
- Юридические тексты и версии документов нужно подготовить отдельно.

## Следующий безопасный шаг

- Добавить `/v2/privacy` read/write routes поверх `privacy-repository`:
  - `GET /v2/privacy/settings`;
  - `PUT /v2/privacy/settings`;
  - `POST /v2/privacy/consents`;
  - `POST /v2/privacy/data-requests`.
- После routes — экран “Данные и память” в редизайне.
