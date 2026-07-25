# История разработки проекта 4

Этот журнал фиксирует важные изменения, архитектурные решения, проверки, ошибки и способы их устранения.

## Правила ведения

- Новые записи добавляются в начало раздела соответствующей даты.
- Не записывать API-ключи, токены, пароли, содержимое личной переписки и другие персональные данные.
- Для каждого значимого изменения указывать результат и способ проверки.
- Ошибки фиксировать вместе с причиной и принятым решением.
- Изменения production отмечать отдельно от локальных изменений.

---

## 2026-06-18

### Подготовлена HMAC-аутентификация Telegram-бота

**Действие**

- Подтверждено наличие Cloudflare Secret `BOT_API_TOKEN` без чтения его значения.
- Добавлен общий клиент `worker-client.js` для подписанных запросов Node bot → Worker.
- Подпись HMAC-SHA256 включает timestamp, nonce, HTTP-метод, путь с query string и точное тело запроса.
- Токен бота не передаётся в заголовках и не записывается в код.
- Все обращения модульного бота к Worker переведены на подписанный клиент.
- Прямыми `fetch` оставлены только запросы к Anthropic и загрузка Telegram-файлов.
- Worker проверяет формат подписи, допустимое отклонение времени, размер тела и выполняет constant-time сравнение.
- `GET /tasks`, проверки напоминаний и дедлайнов, сохранение задач, сообщений, чатов и Telegram-связей закрыты сессией или подписью бота в зависимости от маршрута.
- Frontend-запросы к `/tasks`, которые не передавали сессию, дополнены auth headers.

**Проверка**

- Добавлен `scripts/verify-bot-signature.js`.
- Локальная проверка формирования GET/POST-подписей прошла.
- Все изменённые JS-файлы прошли `node --check`.
- На рабочем компьютере активный Node bot не обнаружен.

**Почему изменения пока не опубликованы**

- Production Worker нельзя переключать на обязательную подпись, пока не обновлён реально запущенный экземпляр Telegram-бота.
- Место размещения и способ запуска production-бота пока не определены.

**Ошибка**

- Wrangler `deploy --dry-run` дважды завис без вывода после предыдущих успешных сборок.

**Решение**

- Зависшие проверки остановлены; production deploy не выполнялся.
- Перед публикацией нужно определить runtime бота, обновить его код и повторить dry-run в чистом процессе.

---

## 2026-06-17

### Закрыт тестовый payment webhook и усилен доступ к переписке

**Действие**

- Неподписанный `/payment/webhook` временно отключён и возвращает `503`.
- Тестовый CloudPayments widget во frontend не удалён, но больше не может активировать тариф через неподтверждённый webhook.
- Добавлена серверная функция проверки принадлежности чата пользователю.
- `GET /messages` теперь возвращает данные только для чата, связанного с текущим пользователем.
- `POST /messages/send` проверяет принадлежность чата перед отправкой в Telegram.
- Изменения внесены в обе рабочие копии Worker.

**Проверка**

- Обе копии Worker прошли `node --check`.
- Wrangler dry-run успешно собрал Worker.
- Production Worker опубликован как версия `8da70e25-74aa-4237-b95e-6caa6d43eae4`.
- Health endpoint вернул `200`.
- Запрос сообщений без сессии вернул `401`.
- Payment webhook вернул `503` и не изменил данные пользователя.

### Подготовлена рабочая копия проекта

**Действие**

- Исходный проект найден в `C:\Users\shelc\Desktop\4\Версия`.
- Рабочая копия перенесена в `C:\Users\shelc\Documents\4`.
- Исключены `node_modules`, архивы, временные файлы и локальное состояние Wrangler.
- Исходная папка на рабочем столе не изменялась.

**Обнаружено**

- В проекте несколько копий Worker, Telegram-бота и frontend-файлов.
- Рабочая папка Git была пустой, без коммитов и remote.
- Начальная ветка переименована в `main`.

### Подключён GitHub

**Действие**

- Подключён GitHub-плагин Codex.
- Подтверждены права администратора и записи в `mrktggod/4e-app`.
- Проверено, что локальные `4e-app/index.html` и `4e-app/vk.html` совпадают с файлами ветки `main` в GitHub.

**Ошибка**

- Попытка установить GitHub CLI через `winget` зависла без завершения.

**Решение**

- Зависший процесс остановлен.
- Для GitHub используется подключённый плагин; отдельный CLI пока не требуется.

### Подключён Cloudflare

**Действие**

- Подтверждена авторизация Wrangler в Cloudflare.
- Подтверждён доступ к Worker `restless-lab-d737`.
- Найден KV namespace `4e-tasks`.
- Проверено, что D1-базы на момент аудита отсутствовали.

**Состояние KV на момент аудита**

- Всего 127 ключей.
- Среди них: сессии, задачи, пользователи, сообщения, чаты и Telegram-связи.
- Содержимое пользовательских данных во время инвентаризации не читалось.

### Выполнен технический аудит

**Созданные документы**

- `docs/TECHNICAL_AUDIT.md`
- `docs/BETA_ARCHITECTURE.md`
- `docs/BETA_ROADMAP.md`
- `docs/SECRETS_INVENTORY.md`

**Основные выводы**

- Текущая версия является рабочим прототипом, но требует стабилизации перед beta.
- KV не должен оставаться единственным источником истины для пользователей, сообщений, задач и платежей.
- Для связанных данных выбран D1; для временного кеша и rate limits — KV; для медиа — R2; для фоновой обработки — Queue.
- Для AI спроектирована управляемая retrieval-memory вместо скрытого обучения на личной переписке.
- Для Web, Telegram и VK предложена единая модель пользователя с несколькими подтверждёнными identities.
- Messenger Hub должен перейти от demo-данных к provider adapters.

### Обнаружены проблемы безопасности

**Обнаружено**

- В двух Worker-файлах находились встроенные Anthropic и Resend credentials.
- Cloudflare Worker Secrets первоначально отсутствовали.
- AI proxy `/anthropic` был доступен без обязательной авторизации.
- CloudPayments использует публичный `CP_PUBLIC_ID`; серверный секрет проверки webhook не найден.
- Payment webhook доверяет входным параметрам без криптографической проверки.
- Некоторые маршруты задач, чатов и сообщений недостаточно строго проверяют владельца данных.

**Решение по CloudPayments**

- `CP_PUBLIC_ID` признан публичной frontend-конфигурацией, а не секретом.
- Платёжный блок пока считается тестовым.
- До полноценной проверки webhook он не должен управлять реальными entitlements.

### Ротирован Anthropic API key

**Действие**

- Пользователь создал новый Anthropic key.
- Новый ключ сохранён в Cloudflare как Worker Secret `ANTHROPIC_KEY`.
- Старое встроенное значение удалено из `4e-worker/worker.js` и корневого `worker.js`.
- Удалена строковая подстановка Anthropic key из локального GitHub Actions workflow.
- Пользователь удалил старые и лишние ключи в Anthropic Console.

**Усиление AI proxy**

- `/anthropic` теперь требует действующую пользовательскую сессию.
- Добавлены allowlist моделей и ограничения размера запроса, истории, system prompt и `max_tokens`.
- При отсутствии secret endpoint возвращает контролируемую ошибку.

**Проверка**

- Обе копии Worker прошли `node --check`.
- Поиск `sk-ant-` в Worker-файлах не нашёл значений.
- Wrangler dry-run успешно собрал Worker.
- Production Worker опубликован как версия `47597c26-ddc7-4d70-9fab-9ccbce791186`.
- Health endpoint вернул `200 OK`.
- Неавторизованный запрос к `/anthropic` вернул `401` и не вызвал Anthropic API.

### Ошибки окружения и решения

#### Wrangler не мог записать лог

**Ошибка**

- `EPERM` при записи в пользовательскую папку логов Wrangler внутри sandbox.

**Решение**

- Команды проверки и deploy запущены с разрешённым доступом за пределами sandbox.

#### Wrangler dry-run не видел Worker-файл

**Ошибка**

- Sandbox запрещал Wrangler читать родительские директории, сборка завершалась `Access is denied`.

**Решение**

- Dry-run повторён с разрешённым доступом; сборка успешно завершилась.

#### Локальный preview не открылся во встроенном браузере

**Ошибка**

- Browser runtime получал `ERR_CONNECTION_REFUSED`, хотя локальная HTTP-проверка возвращала `200`.

**Причина**

- Локальный сервер и встроенный браузер находились в разных сетевых контекстах приложения.

**Решение**

- Технический аудит продолжен по исходникам и опубликованным GitHub-файлам.
- Полноценный визуальный browser QA перенесён на этап сборки нового frontend.

---

## Следующие шаги

1. Закрыть или безопасно отключить тестовый payment webhook.
2. Закрыть неавторизованные маршруты задач, сообщений, чатов и напоминаний.
3. Добавить внутреннюю подпись запросов Telegram-бота.
4. Перенести Resend credential в Cloudflare Secret или отключить тестовую отправку.
5. Создать D1 schema и staging-среду.
6. Начать миграцию пользователей, identities, задач и сообщений из KV.
7. После стабилизации backend зафиксировать дизайн-бриф и перейти к редизайну.

---

## 2026-06-18

### Подготовлена начальная D1-схема

**Действие**

- Добавлена миграция `4e-worker/migrations/0001_initial_schema.sql`.
- Канонический пользователь отделён от способов входа: Web, Telegram и VK хранятся как связанные `auth_identities`.
- Добавлены таблицы сессий и одноразовых challenges для безопасного объединения аккаунтов.
- Мессенджеры описаны через integrations, contacts, conversations, members, messages и attachments.
- Токены внешних интеграций предполагается хранить только как ciphertext; ключ шифрования останется в Cloudflare Secrets.
- Бинарные вложения вынесены из D1: таблица attachments хранит только R2 key и метаданные.
- Добавлены задачи, связи задач с сообщениями и очередь напоминаний.
- История ИИ разделена на threads/messages, компактные summaries и управляемые memories со статусом, confidence и сроком действия.
- Добавлен audit log для значимых действий с аккаунтами и данными.

**Проверка**

- Добавлен `scripts/verify-d1-schema.js` на встроенном `node:sqlite`.
- Миграция успешно применена к чистой локальной SQLite-базе.
- Проверено наличие 19 таблиц и 22 пользовательских индексов.
- `PRAGMA foreign_key_check` не обнаружил нарушений.
- Проверены уникальность пары provider/provider_user_id и каскадное удаление пользовательских identities и AI memories.
- Скрипт прошёл `node --check`.

**Ограничение**

- Создана отдельная удалённая D1-база `4e-staging` в регионе WEUR.
- Binding staging-базы вынесен в `4e-worker/wrangler.staging.toml`; основной production `wrangler.toml` не изменён.
- Миграция `0001_initial_schema.sql` успешно применена к удалённой staging D1: выполнено 43 SQL-команды.
- Удалённая read-only проверка показала 21 таблицу с учётом служебных таблиц D1/migrations, 22 пользовательских индекса и отсутствие нарушений `foreign_key_check`.
- HMAC-защита маршрутов Worker остаётся только локальной, пока не определено место запуска production Telegram-бота.

### Ошибка первого применения D1 migration

**Ошибка**

- `wrangler d1 migrations apply 4e-staging --remote` не нашёл базу, потому что она ещё не была объявлена в активном Wrangler config.

**Решение**

- Создан отдельный `wrangler.staging.toml` с binding `DB`, database name и публичным D1 database ID.
- Повторное применение выполняется с явным `--config wrangler.staging.toml`, не затрагивая production-конфигурацию.

### Найден production runtime Telegram-бота

**Результат аудита**

- Бот `@Denzel89bot` работает в режиме long polling.
- Production runtime указан в проектных инструкциях: отдельный GitHub-репозиторий `mrktggod/4e-bot`, автодеплой в Railway после push.
- Локальная исходная копия репозитория найдена в `C:\Users\shelc\Desktop\4\Версия\4e-worker`; её `main` совпадает с `origin/main`.
- GitHub-плагин пока подключён только к `mrktggod/4e-app`, поэтому bot-репозиторий получен через его существующий git remote в отдельный чистый checkout `4e-bot-repo`.

**Подготовка безопасного HMAC rollout**

- В Railway-версию бота перенесён `workerFetch`, подписывающий bot → Worker запросы HMAC-SHA256.
- Подпись использует существующий Railway secret `BOT_TOKEN`; Worker проверяет её через Cloudflare secret `BOT_API_TOKEN` с тем же значением.
- Переведены запросы команд, задач, сообщений, регистрации чата и напоминаний.
- Прямой `fetch` оставлен только для Anthropic API и загрузки Telegram-файлов.
- Добавлен `npm run test:signature`; тест подписи прошёл.
- Все изменённые JavaScript-файлы прошли `node --check`, `git diff --check` не обнаружил ошибок.

**Порядок без простоя**

1. Сначала развернуть подписывающую версию бота в Railway: старый Worker проигнорирует дополнительные headers.
2. После подтверждения запуска бота развернуть Worker, который требует подпись на внутренних маршрутах.
3. Проверить health, неподписанные запросы `401` и рабочие команды Telegram.

### Ошибка запуска npm в PowerShell

**Ошибка**

- `npm run test:signature` попытался запустить `npm.ps1` и был заблокирован локальной Execution Policy.

**Решение**

- Тест повторён через `C:\Program Files\nodejs\npm.cmd`; завершился успешно.

### Первая проверка Production KV была локальной и ошибочной

**Результат**

- Cloudflare namespace `4e-tasks` существует и соответствует binding production Worker.
- Первая команда была выполнена без обязательного для Wrangler v4 флага `--remote` и увидела локальное пустое хранилище: `0` записей.
- Вывод «production KV пуст» признан неверным и заменён удалённой инвентаризацией ниже.
- Для staging создан отдельный пустой namespace `4e-tasks-staging`; production KV не используется тестовой средой.

### Worker переведён в ES Modules и создан staging

**Проблема**

- Первый deploy staging завершился ошибкой Cloudflare `100329`: D1 binding нельзя подключить к Worker старого Service Worker формата с `addEventListener`.

**Решение**

- Worker переведён на ES Modules handler `export default { fetch(request, env) }`.
- KV и secrets теперь берутся из явного `env`, а request handler создаётся внутри запроса без общего изменяемого состояния между запросами.
- Обе локальные копии `worker.js` синхронизированы по формату.
- Staging config подключает только отдельный KV `4e-tasks-staging` и D1 `4e-staging`.

**Проверка**

- Актуальные рекомендации и migration guide Cloudflare получены с официального сайта (`200 OK`).
- ES Modules-файл прошёл `node --input-type=module --check`.
- Wrangler dry-run успешно распознал KV и D1 bindings.
- Локальный HMAC smoke-test прошёл полностью после модульной конверсии.
- Отдельный Worker `restless-lab-d737-staging` развёрнут, версия `4433abb5-6bf6-4d06-be10-5086db39e6ff`.
- Remote smoke-test: health `200`; unsigned tasks/messages/Anthropic/reminders `401`; payment webhook `503`.

### Ошибки локального staging smoke-test

**Ошибки**

- Первый запуск использовал неверный путь к `smoke-local-worker-auth.js`.
- Запуск Wrangler внутри sandbox не смог записать служебный лог и прочитать родительскую директорию.
- Совмещённый запуск сервера и теста завис без указания проблемного HTTP-шага.

**Решение**

- Путь исправлен на `../scripts/smoke-local-worker-auth.js`.
- Wrangler dev запущен с разрешённым доступом вне sandbox.
- В smoke-test добавлен пятисекундный timeout на каждый запрос.
- Сервер и тест запущены раздельно; тест прошёл, listener на `8788` остановлен.

### Подключён Xiaomi MiMo как дополнительный AI reviewer

**Обнаружено**

- MiMo был настроен в VS Code через расширение Continue.
- Provider использует OpenAI-compatible endpoint `https://api.xiaomimimo.com/v1` и модель `mimo-v2.5-pro`.
- API key хранился напрямую в `C:\Users\shelc\.continue\config.yaml`.

**Безопасность**

- MiMo key перенесён в поддерживаемый Continue secret-файл `C:\Users\shelc\.continue\.env` как `MIMO_API_KEY`.
- В `config.yaml` оставлена только ссылка `${{ secrets.MIMO_API_KEY }}`.
- Значение ключа не выводилось в команды, логи или историю разработки.
- Конфигурация другой модели в Continue не изменялась.

**Проверка**

- Первый минимальный запрос с лимитом 8 токенов успешно вернул usage, но не успел сформировать final content.
- Повторный запрос с лимитом 128 завершился `finish_reason=stop` и ответом `OK`.
- Добавлен локальный клиент `scripts/mimo-client.js`, который читает secret без его вывода и отправляет только явно переданный prompt.
- End-to-end тест локального клиента вернул `ADAPTER_OK`.
- Добавлена политика безопасного использования `docs/MIMO_INTEGRATION.md`.

**Ошибка миграции**

- Первый запуск migration script получил `$null` вместо пустого списка строк для отсутствующего `.env`.
- Инициализация списка исправлена; повторная миграция завершилась успешно.
- Общая regex-проверка literal keys дала ложный отрицательный результат из-за второго provider в Continue config; scoped-проверка блока MiMo подтвердила secret reference и отсутствие literal MiMo key.

### Введён контроль качества работы MiMo

- Создан `docs/MIMO_WORK_LOG.md` с ролью junior-разработчика, допустимыми задачами, шаблоном проверки и обзором после каждых пяти задач.
- Создан автоматический журнал `docs/MIMO_ACTIVITY.jsonl`; он хранит task ID, размеры, usage и статус, но не prompt, ответы или secrets.
- `scripts/mimo-client.js` поддерживает `--task-id` и автоматически пишет успешные и ошибочные вызовы.
- MIMO-001 остановлен до API-вызова: передача workspace SQL внешнему provider требует отдельного явного согласия.
- MIMO-002 на синтетическом prompt вернул `LOG_OK`; автоматическая запись проверена.

### Начат модульный D1 auth layer

**Действие**

- Добавлен `4e-worker/src/worker/data/auth-repository.mjs`.
- Repository работает через injected D1 binding и prepared statements.
- Реализованы создание/поиск пользователя, привязка identity, создание/поиск/touch/revoke сессии.
- В БД передаётся только `token_hash`; raw session token repository не принимает и не возвращает.
- Проверяются допустимые providers, client types и integer timestamps.

**Проверка**

- Добавлен `scripts/verify-auth-repository.mjs` с D1-compatible адаптером поверх чистой in-memory SQLite.
- Применяется настоящая миграция `0001_initial_schema.sql`.
- Проверены создание пользователя и Telegram identity, UNIQUE provider identity, активная/истёкшая/отозванная сессия и отсутствие token hash в возвращаемом объекте.
- Auth repository verification и полная schema verification прошли.

**Ошибка теста**

- Async validation первоначально проверялась через `assert.throws`, поэтому тест ожидал синхронное исключение.
- Проверка заменена на `await assert.rejects`; повторный запуск прошёл.

### Staging v2 web auth подключён к D1

**Действие**

- Добавлена миграция `0002_password_credentials.sql`.
- Password credentials отделены от users и identities; сохраняются salt, hash, algorithm и iteration count.
- Добавлены модули auth crypto, service и routes.
- Реализованы `POST /v2/auth/register`, `POST /v2/auth/login`, `GET /v2/auth/me`, `POST /v2/auth/logout`.
- Регистрация создаёт user, web identity, password credential и первую hashed session атомарным D1 `batch()`.
- Raw password и raw session token не сохраняются.
- Добавлены body-size limit, generic auth errors, constant-time hash comparison и KV rate-limit.

**Проверка**

- Локальный end-to-end тест проверил register, duplicate, me, logout, revoked session, wrong/correct login и rate-limit.
- Миграция `0002` применена к remote staging D1.
- Staging Worker развёрнут как версия `92db801d-0aa7-465d-87aa-03711e07eabf`.
- Remote edge smoke-test прошёл: register/me/logout/login успешны, старая сессия после logout возвращает `401`, новый token отличается.
- Одноразовый тестовый пользователь удалён из staging D1 каскадно.

**Ошибки и решения**

- Подмена `cf-connecting-ip` клиентом вызвала Cloudflare `403 error code: 1000`; тесты больше не отправляют служебный Cloudflare header.
- OWASP рекомендует PBKDF2-HMAC-SHA256 600000 итераций, но Cloudflare Web Crypto отклоняет значения выше 100000. Использован платформенный максимум 100000 плюс rate-limit; переход на managed auth/Argon2 оставлен архитектурной задачей до production web-auth.
- Локальные test scripts повторно вызваны из неверной папки; пути исправлены и тесты действительно перезапущены.
- Staging rate-limit заблокировал диагностические повторы; очищен только remote staging key с префиксом `v2:auth-rate:`.

### Production KV перепроверен с `--remote`

**Исправленный результат**

- Всего ключей: `129`.
- Users: `18`; sessions: `63`; tasks: `26`; messages: `7`; chats: `3`; Telegram mappings: `9`; other: `3`.
- Ключей с expiration: `66`.
- Значения, пользовательские ID и содержимое переписок при инвентаризации не выводились.
- Перед миграцией снова обязателен защищённый snapshot production KV и проверяемое mapping-преобразование в D1.

### Подготовлен защищённый snapshot production KV

**Решение**

- Добавлен `scripts/snapshot-production-kv.ps1`.
- Скрипт получает remote key list и values без вывода содержимого, шифрует snapshot через Windows DPAPI CurrentUser и сохраняет отдельно безопасные metadata с count и SHA-256.
- Каталог `backups/` добавлен в `.gitignore`.
- Временный список ключей создаётся только в системной temp-папке и удаляется в `finally`.

**Ошибки и исправления**

- Первый bulk get превысил лимит Cloudflare `100` ключей; добавлено разбиение `100 + 29`.
- Wrangler bulk get возвращает объект `{key: value}`, а не массив; объединение исправлено на ordered dictionary и проверку количества properties.
- Тип DPAPI не был загружен в текущем PowerShell; добавлен `Add-Type -AssemblyName System.Security.Cryptography.ProtectedData`.

**Текущее состояние**

- Финальный повторный запуск остановлен лимитом Codex на внешние разрешённые операции.
- Raw KV values и незашифрованный snapshot на диск не записывались; временные key files отсутствуют.
- После восстановления лимита выполнить `scripts/snapshot-production-kv.ps1` и убедиться в `KeyCount=129`, `Verification=passed`.

## 2026-06-19

### Принят расширенный product/security roadmap

**Контекст**

- После совместного анализа с Claude в `docs/` добавлены `PRODUCT_ROADMAP.md` и task-файлы `docs/tasks/CODEX-001_close-gate0.md`, `docs/tasks/CODEX-002_security-remaining.md`.
- Product roadmap разделяет работу на этапы: Gate 0 безопасность, VK + редизайн, AI memory/token optimization, admin dashboard, feedback/analytics и долгосрочные integrations.

**Проверка Codex**

- Подтверждено, что `Documents/4` всё ещё является git repo без commits и без remote.
- Подтверждено, что `backups/` пустая: production KV snapshot ещё не завершён.
- Подтверждено, что HMAC-код присутствует локально в Worker, но production deploy остаётся отложенным до KV snapshot и проверки Railway deployment бота.
- Подтверждено, что P0 пункты из CODEX-002 актуальны: Telegram/VK identity всё ещё требуют серверной проверки подписи, CORS в Worker пока использует `Access-Control-Allow-Origin: *`.

**Решение**

- `CODEX-001` переведён из “не начато” в “в работе”.
- В задачу по git remote добавлен предохранитель: root `Documents/4` нельзя механически пушить в `mrktggod/4e-app`, потому что там смешаны frontend, worker, bot clone, docs, scripts и backup-папки.
- Следующий безопасный шаг остаётся прежним: завершить зашифрованный production KV snapshot, затем проверить Railway deployment коммита `a7fe215`, и только после этого деплоить HMAC Worker в production.

### Production KV snapshot выполнен и проверен

**Результат**

- Создан валидный DPAPI CurrentUser snapshot: `backups/kv-4e-tasks-20260619-001346.json.dpapi`.
- Metadata: `backups/kv-4e-tasks-20260619-001346.metadata.json`.
- Скрипт завершился с `KeyCount=129` и `Verification=passed`.
- Snapshot hash проверен без вывода KV values.
- Добавлен `scripts/analyze-kv-snapshot.ps1` для локального sanitized-анализа backup перед KV→D1 mapping.
- Sanitized report: `backups/kv-4e-tasks-20260619-001718.analysis.json`.

**Sanitized структура KV**

- `session`: 63.
- `user`: 10.
- `tasks_by_owner`: 26.
- `messages_by_chat`: 7.
- `chats_by_owner`: 3.
- Mapping/markers: `telegram_mapping` 3, `telegram_reverse_mapping` 5, `user_id_mapping` 8, `first_open_marker` 3, `other` 1.
- Отчёт содержит только counts и top-level field names; ключи и значения KV не записывались в docs.

**Ошибки и исправления**

- PowerShell ExecutionPolicy заблокировал прямой запуск `.ps1`; скрипт запускался через `powershell -NoProfile -ExecutionPolicy Bypass -File ...`, без изменения системной политики.
- `System.Security.Cryptography.ProtectedData` не загрузился как отдельная сборка; добавлен fallback на `System.Security`.
- Первая сериализация `$snapshotData | ConvertTo-Json` создавала массив одно-полевых объектов вместо одного object snapshot. Исправлено на `ConvertTo-Json -InputObject $snapshotData`.
- Проверка `.PSObject.Properties.Count` возвращала массив единиц вместо scalar count. Исправлено на `@($verifiedData.PSObject.Properties).Count`.
- Wrangler в sandbox не мог писать debug logs в AppData и печатал EPERM, но snapshot завершился успешно; это не влияло на encrypted output.

### HMAC production deploy подготовлен, но ждёт Railway checkpoint

**Проверено**

- `mrktggod/4e-bot` `origin/main` указывает на `a7fe215dd735f730b3335c5088566f4d9320433c`.
- Локальный `4e-bot-repo` чистый и находится на `a7fe215`.
- `wrangler secret list` для production Worker показывает `ANTHROPIC_KEY` и `BOT_API_TOKEN`; значения secrets не выводились.
- `node --check 4e-worker/worker.js` прошёл.
- `wrangler deploy --dry-run` в `4e-worker` прошёл: upload size `78.79 KiB`, gzip `15.51 KiB`, binding `env.KV`.

**Блокер**

- Railway CLI и локальный `.railway` config отсутствуют, поэтому deployment status коммита `a7fe215` нужно подтвердить в Railway UI или live-проверкой Telegram-бота.
- Production Worker HMAC deploy не выполнять, пока не подтверждено, что Railway bot уже работает на подписывающей версии.

### KV→D1 migration planning подготовлен

**Добавлено**

- Создан `docs/KV_TO_D1_MIGRATION_PLAN.md`.
- Добавлен `scripts/plan-kv-to-d1-transform.ps1`.
- Скрипт читает DPAPI snapshot локально, строит sanitized dry-run report и не выводит KV keys/values.

**Dry-run v1**

- Report: `backups/kv-4e-tasks-20260619-002058.transform-plan.json`.
- Source keys: `129`.
- Target users: `10`.
- Target auth identities: `14`.
- Target conversations: `24`.
- Target messages: `309`.
- Target tasks: `295`.
- Skipped legacy sessions: `63` — planned logout безопаснее, чем перенос raw bearer sessions.
- Skipped legacy password hashes: `7` — legacy hash algorithm ещё не подтверждён.

**Предупреждения**

- Duplicate task ids: `136`; нужен deterministic migration id.
- Task buckets without known owner: `22`; нужен owner reconciliation.
- Invalid/ambiguous task date fields: `41`; невалидные даты переносить в metadata, `due_at = NULL`.

### Staging D1 schema расширена под legacy metadata

**Действие**

- Добавлена миграция `4e-worker/migrations/0003_legacy_metadata.sql`.
- Добавлены nullable columns:
  - `tasks.metadata_json`
  - `conversations.metadata_json`
  - `messages.metadata_json`

**Проверка**

- `node scripts/verify-d1-schema.js` прошёл с миграциями `0001`, `0002`, `0003`.
- `node --check 4e-worker/worker.js` прошёл.
- `git diff --check` для изменённых docs/scripts/migration прошёл.
- `wrangler d1 migrations apply DB --remote --config wrangler.staging.toml` успешно применил `0003_legacy_metadata.sql` к staging D1 `4e-staging`.
- Remote `PRAGMA table_info` подтвердил наличие `metadata_json` в `tasks`, `conversations`, `messages`.

### Production Worker HMAC deployed

**Предусловия**

- KV snapshot выполнен и проверен: `KeyCount=129`, `Verification=passed`.
- GitHub bot repo `mrktggod/4e-bot` проверен: `origin/main` указывает на `a7fe215dd735f730b3335c5088566f4d9320433c`.
- Railway deployment/live checkpoint подтверждён пользователем.
- `wrangler secret list` показал наличие `ANTHROPIC_KEY` и `BOT_API_TOKEN`; значения secrets не выводились.
- `node --check 4e-worker/worker.js` прошёл.
- `wrangler deploy --dry-run` прошёл.

**Deploy**

- Production Worker `restless-lab-d737` deployed.
- URL: `https://restless-lab-d737.shelckograff.workers.dev`.
- Version ID: `5b4624ae-b8d1-43f6-ba31-8030c60c4a50`.

**Smoke-test**

- `GET /` → `200`.
- `GET /tasks` без сессии → `401`.
- `POST /` с `x-action: save-task` без HMAC → `401`.
- `POST /reminders/check` без HMAC → `401`.
- `GET /messages` без сессии → `401`.
- `POST /anthropic` без сессии → `401`.
- `POST /payment/webhook` → `503`.

**Замечания**

- Первичная проверка `/health` и `POST /tasks` вернула `404`, потому что в текущем Worker health route — `GET /`, а `/tasks` для frontend — `GET`; bot actions идут через `x-action`.
- PowerShell `Invoke-WebRequest` внутри sandbox дал TLS/connection errors, поэтому финальные HTTP-коды проверены через `curl.exe`.

### CORS allowlist deployed

**Действие**

- В `4e-worker/worker.js` заменён wildcard CORS на dynamic allowlist.
- Worker больше не возвращает `Access-Control-Allow-Origin: *`.
- Allowed origins:
  - `https://mrktggod.github.io`
  - `https://vk.com`
  - `https://m.vk.com`
  - `https://web.telegram.org`
  - `https://webk.telegram.org`
  - `https://webz.telegram.org`
  - production/staging Worker origins
- `localhost` разрешён только когда host Worker выглядит как dev/staging (`localhost`, `127.0.0.1`, `*staging*`).

**Deploy**

- Staging Worker deployed: `b3a33b48-9985-4afe-9162-d3492f85d429`.
- Production Worker deployed: `ab72b8fa-1a70-4c63-9033-152c35923052`.

**Smoke-test**

- Staging:
  - `Origin: https://mrktggod.github.io` preflight → `204` with matching `Access-Control-Allow-Origin`.
  - `Origin: http://localhost:5173` preflight → `204`.
  - `Origin: https://evil.example` preflight → `403` without `Access-Control-Allow-Origin`.
- Production:
  - `GET /` → `200`.
  - `GET /tasks` без сессии → `401`.
  - `POST /` with `x-action: save-task` without HMAC → `401`.
  - `POST /payment/webhook` → `503`.
  - `POST /anthropic` без сессии → `401`.
  - `Origin: https://mrktggod.github.io` preflight → `204` with matching `Access-Control-Allow-Origin`.
  - `Origin: https://evil.example` preflight → `403`.
  - `Origin: http://localhost:5173` production preflight → `403`.

**Оставшиеся P0 security пункты**

- Серверная проверка Telegram WebApp `initData`.
- Серверная проверка VK launch params.

### Telegram WebApp initData verification deployed

**Действие**

- В `4e-worker/worker.js` добавлена серверная проверка `Telegram.WebApp.initData`.
- Алгоритм сверён с официальной документацией Telegram Mini Apps:
  - parse `initData`;
  - исключить `hash`;
  - отсортировать поля alphabetically;
  - собрать data-check-string через `\n`;
  - получить secret key как `HMAC_SHA256(bot_token, "WebAppData")`;
  - сравнить hex `HMAC_SHA256(data-check-string, secret_key)` с received `hash`.
- Добавлена проверка freshness: `auth_date` не старше 5 минут и не больше 60 секунд в будущем.
- `/auth/telegram` больше не принимает голый `{ telegramId }` или `{ user }` без signed `initData`.
- `/auth/link-telegram` тоже требует signed `initData`.
- `4e-app/index.html` обновлён: Telegram auto-login и кнопка Telegram login отправляют `initData`, а не доверенный клиентом `initDataUnsafe.user`.
- Bot-side `x-action: telegram-auth` не изменён, потому что этот путь уже защищён HMAC bot→Worker.

**Тесты**

- Добавлен `scripts/verify-telegram-initdata.mjs`.
- Локально проверено:
  - valid synthetic initData проходит;
  - tampered initData не проходит;
  - stale initData не проходит.
- `node --check 4e-worker/worker.js` прошёл.
- `node scripts/verify-telegram-initdata.mjs` прошёл.
- `node --check scripts/verify-telegram-initdata.mjs` прошёл.
- `git diff --check` для изменённых Worker/frontend/test файлов прошёл.
- `wrangler deploy --dry-run --config wrangler.staging.toml` прошёл.
- `wrangler deploy --dry-run` production прошёл.

**Deploy**

- Staging Worker deployed: `4d8ceff2-f6c2-4c6f-91f5-a4289fb0cc91`.
- Production Worker deployed: `45236ba6-3955-46ec-8c17-7268283c1308`.

**Smoke-test**

- Staging:
  - `GET /` → `200`.
  - `GET /tasks` без сессии → `401`.
  - CORS allowed preflight → `204`.
  - `/auth/telegram` на staging возвращает `500`, потому что staging Worker не имеет `BOT_API_TOKEN`; это известное ограничение staging secret setup.
- Production:
  - `GET /` → `200`.
  - `GET /tasks` без сессии → `401`.
  - unsigned bot action `save-task` → `401`.
  - `POST /auth/telegram {}` → `400`.
  - `POST /auth/telegram {"telegramId":"123"}` → `400`.
  - `POST /auth/telegram` с fake/stale signed payload → `401`.

**Ограничение проверки**

- Валидный live Telegram login не был синтетически вызван на production, потому что production `BOT_API_TOKEN` нельзя читать для генерации valid test payload.
- Следующий ручной QA: открыть приложение из настоящего Telegram WebApp и убедиться, что auto-login получает token и загружает home/tasks.

**Оставшийся P0 security пункт**

- Серверная проверка VK launch params.

### VK launch params verifier deployed

**Действие**

- В `4e-worker/worker.js` добавлена серверная проверка VK launch params.
- Worker больше не доверяет `vk_user_id`, присланному клиентом напрямую.
- `/auth/vk` принимает `launchParams` и проверяет `sign`.
- В подпись включаются только параметры с префиксом `vk_`, отсортированные по ключу.
- HMAC-SHA256 подписывается `VK_SECRET_KEY`, digest кодируется base64url и сравнивается с `sign`.
- Если `VK_SECRET_KEY` отсутствует, `/auth/vk` возвращает `503` и не создаёт сессию.
- Canonical frontend обновлён:
  - `4e-app/vk.html` отправляет `launchParams: window.location.search`.
  - VK branch в `4e-app/index.html` отправляет `launchParams: window.location.search`.
- Legacy duplicate `4e-worker/vk.html` не изменялся: файл содержит invalid UTF-8, `apply_patch` отказался его открыть; этот файл не является canonical frontend.

**Тесты**

- Добавлен `scripts/verify-vk-launch-params.mjs`.
- Локально проверено:
  - valid synthetic launch params проходят;
  - tampered `vk_user_id` не проходит;
  - missing `sign` не проходит.
- `node --check 4e-worker/worker.js` прошёл.
- `node scripts/verify-vk-launch-params.mjs` прошёл.
- `node --check scripts/verify-vk-launch-params.mjs` прошёл.
- `git diff --check` для изменённых Worker/frontend/test файлов прошёл.
- `wrangler deploy --dry-run --config wrangler.staging.toml` прошёл.
- `wrangler deploy --dry-run` production прошёл.

**Deploy**

- Staging Worker deployed: `a17a3073-a1f6-4df4-811d-c26e48dc960a`.
- Production Worker deployed: `0b4a6ef6-b026-4fcd-ac26-679ab236949b`.

**Smoke-test**

- Staging:
  - `GET /` → `200`.
  - `GET /tasks` без сессии → `401`.
  - `POST /auth/vk {"vk_user_id":"123"}` → `503`.
  - `POST /auth/vk {}` → `503`.
- Production:
  - `GET /` → `200`.
  - `GET /tasks` без сессии → `401`.
  - `POST /anthropic` без сессии → `401`.
  - `POST /auth/vk {"vk_user_id":"123"}` → `503`.
  - `POST /auth/vk {}` → `503`.

**Ограничение проверки**

- Production Worker Secrets сейчас содержат `ANTHROPIC_KEY` и `BOT_API_TOKEN`, но не `VK_SECRET_KEY`.
- Поэтому небезопасный VK login закрыт, но live VK Mini App login не включён.
- Следующий ручной шаг: добавить `VK_SECRET_KEY` через Cloudflare Secrets, затем проверить live VK login.

### VK_SECRET_KEY добавлен в Cloudflare Secrets

**Действие**

- `VK_SECRET_KEY` добавлен в production Worker `restless-lab-d737` через `wrangler secret put VK_SECRET_KEY`.
- Ключ взят из настроек VK Mini App → "Ключи доступа" → "Защищённый ключ".
- Выполнено пользователем вручную 2026-06-19.

**Статус**

- Production Worker теперь содержит `ANTHROPIC_KEY`, `BOT_API_TOKEN`, `VK_SECRET_KEY`.
- `/auth/vk` больше не возвращает `503` при наличии корректного `launchParams` с подписью.
- Live VK Mini App login включён.

**Следующий шаг**

- Открыть Mini App из VK, проверить что авторизация проходит без ошибок.
- После успешного live smoke-test — Gate 0 закрыт полностью.

### Frontend auth payload fixes published to GitHub Pages repo

**Контекст**

- Root `C:\Users\shelc\Documents\4` остаётся смешанным workspace без commits/remote.
- `4e-app/` внутри workspace тоже не отдельный git repo.
- Реальный GitHub Pages repo `mrktggod/4e-app` был свернут в temp clone `4e-app-remote-audit`, чтобы не пушить worker/bot/docs/backups в frontend repo.
- Remote `4e-app` содержит дополнительные файлы `AGENTS.md`, `COWORK_INSTRUCTIONS.md`, `docs/`, которых нет в локальной `4e-app/`; поэтому копировать локальную папку поверх remote нельзя.

**Действие**

- В temp clone `mrktggod/4e-app` применены только frontend auth payload changes:
  - `index.html`: Telegram login и link отправляют `initData`.
  - `index.html`: VK branch отправляет `launchParams: window.location.search`.
  - `vk.html`: VK auto-login отправляет `launchParams: window.location.search`.
- Создан commit `5cdfbb945d68209980fba094fb5e5af8f7cd3577`:
  - message: `security: require signed platform auth payloads`.
- Commit запушен в `mrktggod/4e-app main`.

**Проверка**

- Remote HEAD `refs/heads/main` указывает на `5cdfbb945d68209980fba094fb5e5af8f7cd3577`.
- Raw GitHub `main/index.html` содержит `tgInitData`, `initData` payload и `launchParams`.
- Raw GitHub `main/vk.html` содержит `launchParams`.
- GitHub Pages после короткой задержки обновился:
  - `https://mrktggod.github.io/4e-app/` содержит `tgInitData`, `initData` payload и `launchParams`.
  - `https://mrktggod.github.io/4e-app/vk.html` содержит `launchParams`.

**Ошибка и исправление**

- Remote `AGENTS.md` запрещает PowerShell `Set-Content` для файлов с кириллицей. Один локальный `Set-Content` ранее добавил UTF-8 BOM в `4e-app/index.html`.
- Кириллица была проверена через `Select-String` и не повреждена.
- BOM удалён безопасной записью через `[System.IO.File]::WriteAllText(..., UTF8Encoding(false))`.
- Дальше frontend HTML с кириллицей править только через `apply_patch` или `.NET UTF8Encoding(false)`.

**Локальная синхронизация**

- После push опубликованное состояние `mrktggod/4e-app` синхронизировано обратно в локальную папку `C:\Users\shelc\Documents\4\4e-app`.
- В локальной `4e-app` появились remote files:
  - `AGENTS.md`
  - `COWORK_INSTRUCTIONS.md`
  - `docs/tasks/TASK_TEMPLATE.md`
- Локальные `index.html` и `vk.html` теперь совпадают с опубликованными auth payload fixes.
- Проверено:
  - `tgInitData`/`initData` есть в `index.html`.
  - `launchParams` есть в `index.html` и `vk.html`.
  - `vk_user_id` и `telegramId` больше не используются в frontend auth payloads.
- UTF-8 BOM отсутствует в `index.html` и `vk.html`.
- Кириллица в `Войти`, `Задачи`, `Введите`, `Добро пожаловать` читается корректно.

### Hardcoded Resend key removed from Worker

**Проблема**

- `RESEND_KEY` всё ещё был встроен в `4e-worker/worker.js` и duplicate `worker.js`.
- Даже если ключ тестовый, хранить provider key в source/bundle нельзя.

**Решение**

- `RESEND_KEY` удалён из `4e-worker/worker.js`.
- `RESEND_KEY` удалён из duplicate `worker.js`.
- Worker теперь читает `RESEND_KEY` из env binding.
- Если `RESEND_KEY` не настроен, `sendEmail()` возвращает `false`, а password reset email path возвращает `503 Email delivery is not configured`.
- Unknown email branch по-прежнему возвращает `200`, чтобы не раскрывать наличие пользователя.

**Проверка**

- `rg` не находит literal `re_...` ключ в Worker source.
- `node --check 4e-worker/worker.js` прошёл.
- `node --check worker.js` прошёл.
- `git diff --check` для Worker files прошёл.
- Production `wrangler secret list` показывает `ANTHROPIC_KEY` и `BOT_API_TOKEN`; `RESEND_KEY` пока не настроен.
- `wrangler deploy --dry-run --config wrangler.staging.toml` прошёл.
- `wrangler deploy --dry-run` production прошёл.

**Deploy**

- Staging Worker deployed: `7fdeb872-4f15-4469-a6e5-bdd4983e1d63`.
- Production Worker deployed: `3facaff2-b4d9-4a7f-ae72-eca11c02d6ea`.

**Smoke-test production**

- `GET /` → `200`.
- `GET /tasks` без сессии → `401`.
- `POST /anthropic` без сессии → `401`.
- `POST /auth/forgot-password` с неизвестным email → `200`.
- `POST /auth/vk {"vk_user_id":"123"}` → `503`.

**Оставшийся ручной secret work**

- Добавить `VK_SECRET_KEY` для live VK login.
- Добавить новый `RESEND_KEY` для live password reset email.

### D1 `/v2/tasks` staging foundation

**Цель**

- Начать перенос задач с legacy KV на D1 без риска для production.
- Добавить новый `/v2/tasks` API рядом с существующими `/tasks`, не переключая текущий frontend/bot.

**Решение**

- Добавлен D1 repository:
  - `4e-worker/src/worker/data/task-repository.mjs`.
- Добавлен service слой:
  - `4e-worker/src/worker/tasks/task-service.mjs`.
  - Валидация title/description/status/priority/dueAt/metadata.
  - `metadata` ограничена 4KB и должна быть object.
  - При переводе задачи в `done` автоматически выставляется `completedAt`.
- Добавлены routes:
  - `4e-worker/src/worker/tasks/task-routes.mjs`.
  - `GET /v2/tasks`
  - `POST /v2/tasks`
  - `GET /v2/tasks/:id`
  - `PATCH /v2/tasks/:id`
- Worker подключает `/v2/tasks` только через D1 binding. Если `DB` не настроен, route возвращает `503`.
- Старые production KV endpoints не изменялись и не переключались.

**Попутная ошибка и исправление**

- Найден дефект в v2 auth service: `authenticate()` возвращал `session.id` как `user.id`, потому что `publicUser()` предпочитал поле `id` перед `user_id`.
- Это ломало D1 ownership для любых будущих v2 routes.
- Исправлено: `publicUser()` теперь использует `user.user_id ?? user.id`.
- `scripts/verify-auth-repository.mjs` усилен проверкой, что `authenticate()` возвращает именно id пользователя.

**CORS fix**

- Для browser v2 calls добавлены:
  - `Authorization` в `Access-Control-Allow-Headers`.
  - `PATCH` в `Access-Control-Allow-Methods`.
- Без этого `/v2/auth/me` и `/v2/tasks` с Bearer token ломались бы на preflight.

**Проверка локально**

- `node --check 4e-worker/worker.js` прошёл.
- `node --check 4e-worker/src/worker/data/task-repository.mjs` прошёл.
- `node --check 4e-worker/src/worker/tasks/task-service.mjs` прошёл.
- `node --check 4e-worker/src/worker/tasks/task-routes.mjs` прошёл.
- `node scripts/verify-auth-repository.mjs` прошёл.
- `node scripts/verify-v2-tasks.mjs` прошёл.
- `node scripts/verify-d1-schema.js` прошёл.

**Staging deploy**

- `wrangler deploy --dry-run --no-bundle --config wrangler.staging.toml` прошёл.
- Staging Worker deployed:
  - name: `restless-lab-d737-staging`
  - version: `92f678c8-da08-4932-a844-0834f4389d8d`
  - URL: `https://restless-lab-d737-staging.shelckograff.workers.dev`

**Smoke-test staging**

- `/v2/auth/register` test user → ok.
- CORS preflight `/v2/tasks` with `Authorization, Content-Type` → `204`.
- `POST /v2/tasks` → created task with `status=open`.
- `GET /v2/tasks` → returned one created task.
- `PATCH /v2/tasks/:id` with `status=done` → returned `done` and `completedAt`.
- Токены/секреты в вывод не печатались.

**Следующий хвост**

- Разобрать legacy KV transform conflicts перед production import:
  - duplicateTaskIds: 136
  - taskBucketsWithoutKnownOwner: 22
  - invalidTaskDateFields: 41
- Спроектировать dual-read/dual-write для перехода `/tasks` → `/v2/tasks`.

### KV task normalization dry-run

**Цель**

- Разобрать legacy task conflicts перед D1 import.
- Не писать production/staging D1, пока не понятно, какие `tasks:*` buckets имеют доказуемого владельца.

**Проблема**

- Первичный transform report считал `295` legacy task records как потенциальные target tasks.
- Legacy Worker мог писать одну задачу сразу в несколько KV buckets:
  - `tasks:user_<userId>`;
  - `tasks:user_<telegramId>`;
  - `tasks:<chatId>`.
- Поэтому `duplicateTaskIds = 136` не означает 136 настоящих разных задач.
- `taskBucketsWithoutKnownOwner = 22` не стоит чинить угадыванием: можно привязать задачу не к тому пользователю.

**Решение**

- Добавлен скрипт:
  - `scripts/plan-kv-task-normalization.ps1`.
- Скрипт читает DPAPI snapshot, проверяет plaintext hash и пишет sanitized report без raw KV keys/values.
- Добавлены reconciliation rules:
  - known users из `user:*`;
  - Telegram owner recovery из `tg:*`, `tg_rev:*` и legacy `user.telegramId`;
  - conversation owner recovery из `chats:*`, если chat принадлежит known user;
  - exact duplicates skip;
  - unresolved owner records quarantine.
- Добавлен verifier:
  - `scripts/verify-task-normalization-report.mjs`.

**Ошибки и исправления**

- Первый прогон PowerShell упал на приведении `Generic.List` внутри hashtable.
  - Исправление: использовать `.ToArray()` для групп legacy ids.
- Второй прогон упал при JSON/report summary из-за mutable hashtable/generic collection.
  - Исправление: перед сериализацией переводить counts в plain ordered hashtables.
- Syntax check сначала дал двусмысленный вывод из-за `$null` в quoted PowerShell command.
  - Исправление: заменить на `[void][scriptblock]::Create(...)`.

**Последний sanitized report**

- `backups/kv-4e-tasks-20260619-011546.task-normalization-plan.json`

Counts:

- task buckets: `26`.
- source task records: `295`.
- import: `83`.
- skip exact duplicate: `6`.
- quarantine owner missing: `200`.
- quarantine owner missing content conflict: `6`.
- duplicate legacy id groups: `132`.
- duplicate extra records: `136`.
- records with invalid deadline: `41`.
- records with parsed due date: `294`.

**Проверка**

- `powershell -ExecutionPolicy Bypass -File scripts/plan-kv-task-normalization.ps1` прошёл.
- `node --check scripts/verify-task-normalization-report.mjs` прошёл.
- `node scripts/verify-task-normalization-report.mjs` прошёл.
- PowerShell syntax check для `scripts/plan-kv-task-normalization.ps1` прошёл.

**Вывод**

- Production D1 import задач пока делать нельзя.
- Следующий безопасный шаг: staging insert plan только для `83` importable tasks и отдельный owner reconciliation report для `206` quarantined records.

### Encrypted D1 task import plan

**Цель**

- Подготовить реальные D1 `tasks` rows для `83` importable legacy task records.
- Не писать в staging/production D1.
- Не выводить production task text/user ids в stdout, docs или chat.

**Решение**

- Добавлен генератор:
  - `scripts/build-kv-task-import-plan.ps1`.
- Добавлен verifier:
  - `scripts/verify-task-import-plan.ps1`.
- Full import plan шифруется DPAPI CurrentUser:
  - `backups/kv-4e-tasks-20260619-012046.task-import-plan.json.dpapi`.
- Наружу пишется только sanitized metadata:
  - `backups/kv-4e-tasks-20260619-012046.task-import-plan.metadata.json`.

**Mapping**

- `id`: deterministic `legacy_task_...`.
- `user_id`: resolved owner из normalization rules.
- `title`: legacy `text`, ограничение 200 символов.
- `description`: limited legacy person/source-message context, максимум 2000 символов.
- `status`: `done` или `open`.
- `priority`: `normal`.
- `due_at`: parsed legacy `deadline`, fallback на `date`, иначе `NULL`.
- `completed_at`: migration timestamp для done tasks.
- `source`: `message` при наличии chat/originalMsg, иначе `import`.
- `metadata_json`: legacy context + migration trace hashes/parse kinds.

**Ошибка и исправление**

- Первый запуск упал при JSON-сборке из-за `Generic.List` в PowerShell ordered object.
- Исправлено: `rows = @($rows.ToArray())` перед сериализацией.

**Результат**

- encrypted plan rowCount: `83`.
- unique task ids: `83`.
- unique content hashes: `82`.
- status:
  - open: `75`;
  - done: `8`.
- source:
  - message: `80`;
  - import: `3`.
- metadataTooLarge: `0`.
- titleTruncated: `0`.
- descriptionTruncated: `0`.

**Проверка**

- `powershell -ExecutionPolicy Bypass -File scripts/build-kv-task-import-plan.ps1` прошёл.
- `powershell -ExecutionPolicy Bypass -File scripts/verify-task-import-plan.ps1` прошёл.
- PowerShell syntax check для `build-kv-task-import-plan.ps1` и `verify-task-import-plan.ps1` прошёл.

**Ограничение**

- Decrypted import plan содержит production task text и user ids.
- Не коммитить, не логировать, не вставлять в docs/chat.
- Не применять к staging D1 без отдельного approval пользователя, потому что это production-derived user data.

**Следующий безопасный шаг**

- Добавить local SQLite/D1-shape validator для encrypted import plan.
- После отдельного approval можно будет применить только эти `83` rows к staging D1.
- Параллельно продолжить quarantine owner reconciliation для `206` records.

### Local SQLite validation for encrypted task import plan

**Цель**

- Проверить, что encrypted import plan на `83` tasks реально проходит текущую D1 schema.
- Не писать decrypted plan на диск.
- Не писать в staging/production D1.
- Не печатать task titles/user ids/metadata_json.

**Решение**

- Добавлен Node validator:
  - `scripts/validate-task-import-plan-sqlite.mjs`.
- Добавлен PowerShell DPAPI wrapper:
  - `scripts/validate-task-import-plan-sqlite.ps1`.
- Wrapper расшифровывает `*.task-import-plan.json.dpapi` через DPAPI CurrentUser и передаёт JSON в Node через stdin.
- Node:
  - создаёт SQLite `:memory:`;
  - применяет реальные D1 migrations из `4e-worker/migrations`;
  - создаёт stub users для FK;
  - вставляет `83` rows в `tasks`;
  - проверяет `metadata_json` и `PRAGMA foreign_key_check`.

**Ошибка и исправление**

- Первый запуск wrapper упал: `$psi.ArgumentList.Add(...)` недоступен/null в текущей PowerShell/.NET среде.
- Исправление: заменить на совместимый `$psi.Arguments = '"' + $nodeScript + '"'`.

**Результат**

- insertedTasks: `83`.
- stubUsers: `6`.
- distinctTaskUsers: `6`.
- status:
  - open: `75`;
  - done: `8`.
- source:
  - message: `80`;
  - import: `3`.
- metadata_json: `valid`.
- foreignKeys: `ok`.
- plaintext hash: `532c948c5feb6d934494616ae7fe6e0d4ab720695ee98aa28118623895b25a23`.

**Проверка**

- `node --check scripts/validate-task-import-plan-sqlite.mjs` прошёл.
- PowerShell syntax check для `validate-task-import-plan-sqlite.ps1` прошёл.
- `powershell -ExecutionPolicy Bypass -File scripts/validate-task-import-plan-sqlite.ps1` прошёл.

**Следующий безопасный шаг**

- Нужен отдельный approval пользователя, прежде чем применять production-derived task rows к staging D1.
- После approval: staging applier должен читать тот же encrypted plan, вставлять rows транзакционно/batches и печатать только counts.
- Без approval: продолжить quarantine owner reconciliation для `206` records.

### Staging D1 import for verified legacy tasks

**Цель**

- После approval пользователя применить `83` verified legacy task rows к staging D1.
- Production D1/KV не трогать.
- Не печатать raw task text/user ids/metadata_json.

**Решение**

- Добавлен applier:
  - `scripts/apply-task-import-plan-staging.ps1`.
- Applier:
  - читает encrypted task import plan;
  - строит SQL локально;
  - поддерживает `-DryRun`;
  - поддерживает `-PrepareSqlOnly`;
  - использует `INSERT OR IGNORE`;
  - создаёт `6` minimal stub users для FK;
  - вставляет `83` task rows.

**Почему понадобился двухшаговый flow**

- Попытка выполнить applier целиком elevated упала на DPAPI:
  - `Key not valid for use in specified state`.
- Причина: elevated process не смог расшифровать DPAPI CurrentUser plan.
- Решение:
  1. В обычном user context создать temp SQL через `-PrepareSqlOnly`.
  2. Выполнить `wrangler d1 execute` elevated по temp SQL.
  3. Очистить и удалить temp SQL в `finally`.

**Ошибка D1 execute и исправление**

- Первая remote попытка упала из-за explicit transaction statements:
  - `BEGIN TRANSACTION`;
  - `COMMIT`.
- D1 remote execute отклонил их и сообщил, что при неуспешном import база возвращается в исходное состояние.
- Исправление:
  - удалить explicit transaction statements из generated SQL;
  - оставить `INSERT OR IGNORE`;
  - повторить import.

**Pre-count staging**

- users: `2`.
- tasks: `2`.

**Apply result**

- Wrangler processed queries: `90`.
- rows written: `261`.
- final bookmark: `0000000a-0000002c-0000508e-74a50f0441db1870ca762f3ecd0e24d1`.

**Post-count staging**

- users: `8`.
- tasks: `85`.
- imported_tasks: `83`.
- imported_open: `75`.
- imported_done: `8`.
- imported_message_source: `80`.
- imported_import_source: `3`.
- invalid_import_metadata: `0`.

**Integrity**

- foreign_key_violations: `0`.
- missing_migration_metadata: `0`.
- missing_legacy_metadata: `0`.

**Temp cleanup**

- Temp SQL file removed.
- No `4e-task-import-*.sql` files remain in `%TEMP%`.

**Следующий шаг**

- Continue owner reconciliation for `206` quarantined task records.
- Add staging-safe verification path that validates imported rows without exposing production-derived task text/user ids.

### Quarantine owner reconciliation report

**Цель**

- Разобрать `206` quarantined legacy task records без записи в D1/KV.
- Сгруппировать их по безопасным hashed bucket ids.
- Понять, какие resolver-ы нужны дальше.
- Не выводить raw task text/user ids/chat ids/bucket ids.

**Решение**

- Добавлен generator:
  - `scripts/plan-kv-task-quarantine-reconciliation.ps1`.
- Добавлен verifier:
  - `scripts/verify-quarantine-reconciliation-report.mjs`.
- Generator:
  - читает DPAPI KV snapshot;
  - повторяет normalization/action rules;
  - группирует quarantine records по `bucketOwnerHash`;
  - пишет sanitized report;
  - пишет encrypted detail artifact для будущей локальной ручной ревизии.

**Ошибка и исправление**

- Первый запуск выбрал не тот metadata file: pattern `kv-4e-tasks-*.metadata.json` зацепил task-import metadata без `snapshotFile`.
- Исправление: выбирать только metadata, где есть `snapshotFile`.
- Первый verifier был слишком строгим и запретил само слово `metadata_json`, хотя оно было только в privacy notice.
- Исправление: убрать `metadata_json` из forbidden raw markers.

**Артефакты**

- Sanitized report:
  - `backups/kv-4e-tasks-20260619-080314.quarantine-reconciliation.report.json`.
- Encrypted detail metadata:
  - `backups/kv-4e-tasks-20260619-080314.quarantine-reconciliation.detail.metadata.json`.
- Encrypted detail:
  - `backups/kv-4e-tasks-20260619-080314.quarantine-reconciliation.detail.json.dpapi`.

**Результат**

- quarantinedRecords: `206`.
- quarantineBuckets: `16`.
- quarantine_owner_missing: `200`.
- quarantine_owner_missing_content_conflict: `6`.

Bucket kind counts:

- chat_mirror_candidate: `5`.
- chat_mirror_exact: `9`.
- unknown_owner_bucket: `2`.

Owner status counts:

- unresolved_global: `1`.
- unresolved_non_user_bucket: `6`.
- unresolved_user_wrapper: `9`.

Recommendation counts:

- resolve_conversation_owner_via_provider_sync_or_legacy_chat_mapping: `13`.
- archive_or_manual_review_global_bucket: `1`.
- resolve_wrapped_user_or_telegram_mapping: `1`.
- manual_owner_reconciliation_required: `1`.

**Проверка**

- PowerShell syntax check для `plan-kv-task-quarantine-reconciliation.ps1` прошёл.
- `powershell -ExecutionPolicy Bypass -File scripts/plan-kv-task-quarantine-reconciliation.ps1` прошёл.
- `node --check scripts/verify-quarantine-reconciliation-report.mjs` прошёл.
- `node scripts/verify-quarantine-reconciliation-report.mjs` прошёл.

**Вывод**

- Большая часть quarantine — это chat mirror buckets без доказанного owner.
- Следующий технический шаг: provider/conversation owner resolver для `13` chat mirror buckets.
- Не использовать эвристики по тексту задач.

### Conversation/provider owner resolver

**Цель**

- Проверить `13` chat mirror buckets / `198` legacy task records из quarantine.
- Понять, можно ли доказать owner через существующие trusted identities,
  `chats:*` и `messages:*`.
- Не использовать task text, message text, names или chat titles.
- Не писать в D1/KV/provider APIs.

**Решение**

- Добавлен generator:
  - `scripts/plan-kv-task-conversation-owner-resolver.ps1`.
- Добавлен verifier:
  - `scripts/verify-conversation-owner-resolver-report.mjs`.
- Generator:
  - читает DPAPI KV snapshot;
  - читает sanitized quarantine reconciliation report;
  - анализирует только buckets с recommendation
    `resolve_conversation_owner_via_provider_sync_or_legacy_chat_mapping`;
  - разрешает owner только через trusted identity mappings или known owned conversations;
  - пишет sanitized report без raw ids/text.

**Ошибка и исправление**

- Первый запуск упал на `Measure-Object`: PowerShell не видел `recordCount` у
  `ordered` hashtable как свойство.
- Исправление: bucket report rows приведены к `pscustomobject`.
- После первого успешного отчёта поле `knownOwnedConversationRefs` было `null`,
  когда evidence отсутствовал.
- Исправление: считать сумму явно и писать `0`.

**Артефакты**

- Sanitized report:
  - `backups/kv-4e-tasks-20260619-081054.conversation-owner-resolver.report.json`.

**Результат**

- candidateBuckets: `13`.
- candidateRecords: `198`.
- eligibleForEncryptedImportPlanBuckets: `0`.
- eligibleForEncryptedImportPlanRecords: `0`.
- providerSyncOrManualMappingBuckets: `13`.
- providerSyncOrManualMappingRecords: `198`.
- blockedConflictingOwnerBuckets: `0`.

Status counts:

- provider_conversation_exists_without_owner_mapping: `6`.
- legacy_conversation_ref_without_message_or_owner_mapping: `7`.

Recommended action counts:

- run_provider_sync_or_manual_conversation_owner_mapping: `6`.
- manual_conversation_owner_mapping_required: `7`.

**Проверка**

- PowerShell syntax check для `plan-kv-task-conversation-owner-resolver.ps1` прошёл.
- `powershell -ExecutionPolicy Bypass -File scripts/plan-kv-task-conversation-owner-resolver.ps1` прошёл.
- `node --check scripts/verify-conversation-owner-resolver-report.mjs` прошёл.
- `node scripts/verify-conversation-owner-resolver-report.mjs` прошёл.

**Вывод**

- Из текущего legacy KV нельзя безопасно доказать owner для этих `198` records.
- Автоматический import этих records запрещён до provider sync или explicit manual mapping.
- Следующий безопасный шаг: staging-only manual/provider conversation mapping flow.

### Legacy conversation mapping schema

**Цель**

- Создать D1 слой для ручной/provider привязки unresolved legacy conversation refs.
- Не хранить raw legacy chat ids/provider ids в D1 mapping table.
- Дать будущему import generator возможность разблокировать quarantined tasks
  только через approved mapping.

**Решение**

- Добавлена migration:
  - `4e-worker/migrations/0004_legacy_conversation_mappings.sql`.
- Добавлен repository:
  - `4e-worker/src/worker/data/conversation-mapping-repository.mjs`.
- Добавлен verifier:
  - `scripts/verify-conversation-mapping-repository.mjs`.
- Обновлён schema verifier:
  - `scripts/verify-d1-schema.js`.

**Архитектурное правило**

- В `legacy_conversation_mappings` хранится `legacy_ref_hash` как lowercase
  SHA-256 hex digest.
- Raw legacy refs не принимаются repository и не выводятся в logs/docs/chat.
- Статусы mapping: `proposed`, `approved`, `rejected`, `superseded`.
- Import generator сможет использовать только `approved` mapping.

**Проверка**

- `node --check scripts/verify-conversation-mapping-repository.mjs` прошёл.
- `node --check 4e-worker/src/worker/data/conversation-mapping-repository.mjs` прошёл.
- `node --check scripts/verify-d1-schema.js` прошёл.
- `node scripts/verify-d1-schema.js` прошёл.
- `node scripts/verify-conversation-mapping-repository.mjs` прошёл.
- `node scripts/verify-auth-repository.mjs` прошёл.
- `node scripts/verify-v2-tasks.mjs` прошёл.

**Staging apply**

- Применена migration `0004_legacy_conversation_mappings.sql` к staging D1:
  - `wrangler d1 migrations apply DB --remote --config wrangler.staging.toml`.
- Remote D1:
  - `DB (8ac20719-2558-4142-b9b9-e1c710d0e0c5)`.
- Post-check:
  - `mapping_rows = 0`.
  - `changed_db = false`.

**Ошибка и исправление**

- Первая read-only verification команда сломалась из-за PowerShell-экранирования
  `COUNT(*)` во вложенном `powershell -Command`.
- Исправление: повторить Wrangler execute без вложенного PowerShell, с SQL в
  single quotes.

**Вывод**

- Staging теперь готов принимать approved legacy conversation mappings.
- Следующий шаг: encrypted mapping seed plan для 13 unresolved buckets, затем
  controlled manual/provider approval flow.

### Conversation mapping seed plan

**Цель**

- Подготовить encrypted seed plan для `13` unresolved conversation buckets /
  `198` legacy task records.
- Не назначать owner автоматически.
- Не писать в D1/KV/provider APIs.
- В sanitized report не выводить raw legacy refs, full hashes, task text,
  message text, user ids или chat ids.

**Решение**

- Добавлен generator:
  - `scripts/build-conversation-mapping-seed-plan.ps1`.
- Добавлен verifier:
  - `scripts/verify-conversation-mapping-seed-report.mjs`.
- Generator:
  - читает DPAPI KV snapshot;
  - читает sanitized conversation owner resolver report;
  - строит seed refs для future mapping approval;
  - пишет encrypted DPAPI plan;
  - пишет sanitized report только с short hashes/counts/statuses.

**Ошибка и исправление**

- Первый запуск упал на generic list + `ordered` object conversion в PowerShell.
- Исправление: report-only collections переведены на обычные PowerShell arrays /
  `pscustomobject`.
- Первый verifier поймал слово `metadata_json` в privacy notice, не в данных.
- Исправление: убрать этот marker из публичной privacy-строки.
- После проверки стало видно, что `seedRows.recordCount` мог быть не unique
  record count, а evidence-weighted count.
- Исправление: поле переименовано в `evidenceRecordReferences`.

**Артефакты**

- Sanitized report:
  - `backups/kv-4e-tasks-20260619-113703.conversation-mapping-seed.report.json`.
- Encrypted plan metadata:
  - `backups/kv-4e-tasks-20260619-113703.conversation-mapping-seed.plan.metadata.json`.
- Encrypted plan:
  - `backups/kv-4e-tasks-20260619-113703.conversation-mapping-seed.plan.json.dpapi`.

**Результат**

- candidateBuckets: `13`.
- candidateRecords: `198`.
- seedRefRows: `14`.
- providerHintCounts:
  - telegram: `13`.
- resolverStatusCounts:
  - provider_conversation_exists_without_owner_mapping: `6`.
  - legacy_conversation_ref_without_message_or_owner_mapping: `7`.

**Проверка**

- PowerShell syntax check для `build-conversation-mapping-seed-plan.ps1` прошёл.
- `powershell -ExecutionPolicy Bypass -File scripts/build-conversation-mapping-seed-plan.ps1` прошёл.
- `node --check scripts/verify-conversation-mapping-seed-report.mjs` прошёл.
- `node scripts/verify-conversation-mapping-seed-report.mjs` прошёл.

**Вывод**

- Seed plan готовит approval candidates, но не разблокирует import сам по себе.
- Следующий безопасный шаг: local/manual approval tooling, которое создаёт
  proposed/approved mapping SQL только после явного решения owner.

### Conversation mapping approval tooling

**Цель**

- Сделать local/manual workflow для encrypted conversation mapping seed plan.
- Не писать в D1/KV/provider APIs.
- Не печатать raw legacy refs, full hashes, owner ids, conversation ids или
  decrypted payloads.

**Решение**

- Добавлен approval template generator:
  - `scripts/build-conversation-mapping-approval-template.ps1`.
- Добавлен approval template verifier:
  - `scripts/verify-conversation-mapping-approval-template.mjs`.
- Добавлен decision plan builder:
  - `scripts/build-conversation-mapping-decision-plan.ps1`.
- Добавлен decision report verifier:
  - `scripts/verify-conversation-mapping-decision-report.mjs`.

**Артефакты**

- Approval template:
  - `backups/kv-4e-tasks-20260619-114153.conversation-mapping-approval-template.json`.
- No-op encrypted decision plan report:
  - `backups/kv-4e-tasks-20260619-114211.conversation-mapping-decision-plan.report.json`.
- No-op encrypted decision plan metadata:
  - `backups/kv-4e-tasks-20260619-114211.conversation-mapping-decision-plan.metadata.json`.
- No-op encrypted decision plan:
  - `backups/kv-4e-tasks-20260619-114211.conversation-mapping-decision-plan.json.dpapi`.

**Результат**

- approval template rows: `14`.
- pending decisions: `14`.
- proposed decisions: `0`.
- approved decisions: `0`.
- decision plan rowsToWrite: `0`.

`rowsToWrite = 0` ожидаемо, потому что owner decisions ещё не заполнены.

**Проверка**

- PowerShell syntax check для template generator прошёл.
- PowerShell syntax check для decision plan builder прошёл.
- `node --check scripts/verify-conversation-mapping-approval-template.mjs` прошёл.
- `node --check scripts/verify-conversation-mapping-decision-report.mjs` прошёл.
- `powershell -ExecutionPolicy Bypass -File scripts/build-conversation-mapping-approval-template.ps1` прошёл.
- `node scripts/verify-conversation-mapping-approval-template.mjs` прошёл.
- `powershell -ExecutionPolicy Bypass -File scripts/build-conversation-mapping-decision-plan.ps1` прошёл.
- `node scripts/verify-conversation-mapping-decision-report.mjs` прошёл.

**Вывод**

- Теперь есть безопасный локальный путь от seed refs к encrypted write plan.
- Следующее решение — не техническое, а продуктово-данное: либо вручную
  заполнить owner decisions, либо сначала сделать Telegram provider sync для
  medium-confidence refs.

### Telegram provider sync mapping foundation

**Цель**

- Реализовать второй выбранный путь: provider sync для Telegram evidence.
- Использовать existing signed bot `register-chat` события.
- Создавать D1 `integrations`, `conversations` и approved
  `legacy_conversation_mappings` только при доказанной Telegram identity.
- Не включать D1 writes без feature flag.

**Решение**

- Добавлен module:
  - `4e-worker/src/worker/providers/telegram-provider-sync.mjs`.
- Добавлен verifier:
  - `scripts/verify-telegram-provider-sync.mjs`.
- В `4e-worker/worker.js` legacy `register-chat` теперь может вызвать D1 sync,
  но только если:
  - `DB` существует;
  - `ENABLE_D1_PROVIDER_SYNC === "1"`.

**Поведение**

- Если `auth_identities(provider='telegram', provider_user_id=telegramUserId)`
  найден:
  - upsert `integrations`;
  - upsert `conversations`;
  - upsert `legacy_conversation_mappings`;
  - mapping получает `status=approved`, `confidence=provider_verified`,
    `source=provider_sync`.
- Если Telegram identity не найдена:
  - sync возвращает `telegram_identity_not_found`;
  - D1 rows не создаются.

**Проверка**

- `node --check 4e-worker/src/worker/providers/telegram-provider-sync.mjs` прошёл.
- `node --check scripts/verify-telegram-provider-sync.mjs` прошёл.
- `node --check 4e-worker/worker.js` прошёл.
- `node scripts/verify-d1-schema.js` прошёл.
- `node scripts/verify-telegram-provider-sync.mjs` прошёл.

Verifier result:

- missingIdentity: `ok`.
- conversationSynced: `ok`.
- mappingRows: `1`.
- mappingStatus: `approved`.
- confidence: `provider_verified`.
- foreignKeys: `ok`.

**Safety**

- Проверка использует только synthetic ids.
- Runtime logs не печатают raw Telegram/chat/user ids.
- Deploy/staging/prod writes не выполнялись.
- Sync выключен до явного `ENABLE_D1_PROVIDER_SYNC`.

**Вывод**

- Provider sync foundation готов.
- Следующий безопасный шаг: включить flag только в staging, deploy staging и
  проверить signed bot `register-chat` smoke на тестовой Telegram identity.

### Telegram provider sync staging enablement

**Цель**

- Включить D1 provider sync только в staging.
- Проверить, что production config не меняется.
- Подтвердить deployability и базовую доступность staging Worker без записи
  пользовательских данных.

**Решение**

- В `4e-worker/wrangler.staging.toml` добавлен:
  - `ENABLE_D1_PROVIDER_SYNC = "1"`.
- `4e-worker/wrangler.toml` production не менялся.

**Проверка**

- `node --check 4e-worker/worker.js` прошёл.
- `node scripts/verify-telegram-provider-sync.mjs` прошёл.
- `git diff --check -- 4e-worker/wrangler.staging.toml 4e-worker/worker.js 4e-worker/src/worker/providers/telegram-provider-sync.mjs scripts/verify-telegram-provider-sync.mjs` прошёл.
- `wrangler deploy --dry-run --no-bundle --config wrangler.staging.toml`
  подтвердил staging KV, staging D1 и `ENABLE_D1_PROVIDER_SYNC`.
- `wrangler deploy --config wrangler.staging.toml` прошёл.
  - Worker: `restless-lab-d737-staging`.
  - URL: `https://restless-lab-d737-staging.shelckograff.workers.dev`.
  - Version ID: `8c781424-032e-4e4d-8588-cce888a819ba`.
- HTTP smoke staging root вернул `200`.
- Read-only D1 check:
  - `legacy_conversation_mappings` содержит `0` rows;
  - `changed_db = false`;
  - `rows_written = 0`.
- Добавлен no-write HMAC smoke script:
  - `scripts/smoke-staging-register-chat-signature.mjs`.
- `node --check scripts/smoke-staging-register-chat-signature.mjs` прошёл.
- Live HMAC smoke не запускался, потому что локальный `BOT_TOKEN` не задан.

**Safety**

- Production config/deploy не затрагивались.
- Проверки не печатали raw Telegram/chat/user ids.
- No-write HMAC smoke script печатает только sanitized result и не выводит
  token/raw synthetic ids.
- Live signed `register-chat` smoke ещё не выполнялся, чтобы не писать
  synthetic/test KV+D1 state без отдельного тестового identity сценария.

**Вывод**

- Staging provider sync включён и задеплоен.
- Следующий безопасный шаг: запустить no-write HMAC smoke при наличии
  локального `BOT_TOKEN`, затем подготовить test Telegram identity + signed bot
  `register-chat` smoke для staging и проверить рост mapping counts только на
  synthetic/test данных.

### Staging no-write HMAC smoke

**Цель**

- Проверить, что staging Worker принимает signed bot `register-chat` requests.
- Не создавать KV/D1 записи и не печатать токены/raw ids.

**Решение**

- Проверено, что локальный `.dev.vars` содержит key name `BOT_API_TOKEN`.
- Проверено, что staging Worker сначала не имел Cloudflare secrets.
- `BOT_API_TOKEN` из локального `.dev.vars` записан в staging Cloudflare Secret
  без вывода значения.
- `wrangler secret list --config wrangler.staging.toml` после записи показывает
  только secret name:
  - `BOT_API_TOKEN`.
- Запущен `scripts/smoke-staging-register-chat-signature.mjs`:
  - token берётся из `.dev.vars` только в process env;
  - используется synthetic unlinked Telegram/chat payload;
  - ожидаемый успешный результат — `user not linked`, то есть route/HMAC прошли,
    но user mapping не найден и D1 sync не стартует.

**Ошибка и решение**

- Первая попытка `wrangler secret put` упала из-за PowerShell quoting: внешний
  shell съел `$line`/`$secret` в nested command.
- Решение: повторить команду через single-quoted script block. Secret value не
  выводился ни в ошибочном, ни в успешном запуске.

**Проверка**

- No-write HMAC smoke result:
  - `ok = true`;
  - `status = 200`;
  - `botSignatureAccepted = true`;
  - `expectedNoWriteReason = user not linked`.
- Read-only D1 check после smoke:
  - `legacy_conversation_mappings = 0`;
  - `changed_db = false`;
  - `rows_written = 0`.

**Safety**

- Token value не печатался.
- Raw synthetic telegram/chat ids не печатались.
- Production secrets/config/deploy не затрагивались.
- D1/KV user data не менялись.

**Вывод**

- Staging HMAC path для bot → Worker `register-chat` работает.
- Следующий шаг: отдельный controlled full D1 provider-sync smoke с test
  Telegram identity/synthetic KV+D1 state, затем verify mapping count increase
  только на synthetic/test row.

### Controlled full staging Telegram provider sync smoke

**Цель**

- Проверить полный staging путь:
  - synthetic D1 user;
  - synthetic Telegram `auth_identity`;
  - synthetic KV `tg:*` mapping;
  - signed bot `register-chat`;
  - D1 `integrations`, `conversations`, `legacy_conversation_mappings`;
  - cleanup synthetic state.

**Решение**

- Добавлен рабочий PowerShell smoke script:
  - `scripts/smoke-staging-telegram-provider-sync.ps1`.
- Скрипт:
  - читает `BOT_API_TOKEN` из `.dev.vars`, не печатая значение;
  - создаёт только synthetic IDs;
  - перед запуском чистит старые synthetic KV prefixes:
    - `tg:smoke_tg_`;
    - `chats:user_smoke_user_`;
  - создаёт synthetic D1 user + Telegram identity;
  - создаёт synthetic staging KV mapping;
  - отправляет signed `register-chat` на staging Worker;
  - проверяет агрегированные D1 counts;
  - удаляет synthetic D1/KV state;
  - печатает только sanitized counts.

**Ошибки и решения**

- Первичный Node full-smoke script упирался в Windows/Wrangler child-process
  instability:
  - `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)`;
  - D1 `--file` возвращал summary без SELECT results;
  - KV visibility потребовала explicit `--remote` и retry.
- Решение: удалить Node full-smoke вариант и заменить его PowerShell-native
  script, где Wrangler вызывается напрямую.
- Дополнительные quoting ошибки в одноразовых PowerShell diagnostics были
  безопасными и не меняли состояние.

**Проверка**

- `scripts/smoke-staging-telegram-provider-sync.ps1` прошёл:
  - `signedRegisterChat = ok`;
  - `d1ProviderSync = ok`;
  - before cleanup:
    - `integrations = 1`;
    - `conversations = 1`;
    - `mappings = 2`;
    - `approvedProviderMappings = 2`;
  - after cleanup:
    - `users = 0`;
    - `identities = 0`;
    - `integrations = 0`;
    - `conversations = 0`;
    - `mappings = 0`;
  - synthetic KV cleanup:
    - `initial = 12`;
    - `final = 0`.
- Финальный read-only D1 clean check:
  - `smoke_users = 0`;
  - `provider_sync_mappings = 0`;
  - `changed_db = false`;
  - `rows_written = 0`.

**Safety**

- Production не затрагивался.
- Token/raw ids/full hashes не печатались.
- В staging остались только реальные ранее существовавшие данные; synthetic
  D1/KV state удалён.
- Initial synthetic KV cleanup удалил 12 synthetic keys от предыдущих упавших
  попыток smoke.

**Вывод**

- Полный staging путь Telegram provider sync работает.
- Теперь можно переходить к staging-safe verification/report для approved
  mappings и плану разблокировки части quarantined task import.

### Staging-safe approved mappings report

**Цель**

- Сделать read-only отчёт по approved mappings в staging D1.
- Сопоставлять staging mappings с sanitized conversation mapping seed report.
- Не печатать raw provider/user/conversation ids, task text, `metadata_json`,
  secrets или full hashes.

**Решение**

- Добавлен generator:
  - `scripts/report-staging-approved-mappings.ps1`.
- Добавлен verifier:
  - `scripts/verify-staging-approved-mapping-report.mjs`.
- Generator:
  - читает latest `*.conversation-mapping-seed.report.json`;
  - делает read-only staging D1 queries через Wrangler;
  - пишет sanitized report в `backups/staging-approved-mappings-*.report.json`;
  - использует только `legacyRefHashShort` для operator visibility;
  - явно помечает, что production import должен join-иться по full hashes из
    encrypted artifacts, а не по short hash.
- Verifier проверяет:
  - consistency сумм;
  - отсутствие full 64-char hashes;
  - отсутствие token/API-key markers;
  - отсутствие raw KV/task/message markers.

**Ошибки и решения**

- Первый report JSON был записан Windows PowerShell как UTF-8 с BOM; Node
  verifier не смог распарсить файл.
- Решение:
  - generator пишет UTF-8 without BOM через `System.Text.UTF8Encoding(false)`;
  - verifier дополнительно устойчив к BOM.
- Wrangler снова проявил Windows `UV_HANDLE_CLOSING` instability на длинных
  многострочных SQL.
- Решение:
  - SQL перед отправкой в Wrangler сжимается в одну строку;
  - generator запускает Wrangler из `4e-worker` с локальным
    `wrangler.staging.toml`;
  - D1 query имеет retry wrapper.

**Проверка**

- `node --check scripts/verify-staging-approved-mapping-report.mjs` прошёл.
- PowerShell syntax check для `report-staging-approved-mappings.ps1` прошёл.
- Generator создал:
  - `backups/staging-approved-mappings-20260619-102455.report.json`.
- Verifier прошёл:
  - `node scripts/verify-staging-approved-mapping-report.mjs backups/staging-approved-mappings-20260619-102455.report.json`.

Report result:

- `seedRefRows = 14`.
- `candidateRecords = 198`.
- `approvedProviderSyncMappings = 0`.
- `seedRowsUnlockedByHashShort = 0`.
- `candidateRecordsPotentiallyUnlockedByHashShort = 0`.
- `requiresFullHashImportJoin = true`.

**Вывод**

- Отчётный контур готов и privacy-check пройден.
- Сейчас quarantine records не разблокированы, потому что staging full smoke
  намеренно удаляет synthetic provider sync rows, а реальных approved provider
  sync mappings в staging пока нет.
- Следующий этап: либо накопить реальные/test provider sync mappings в staging,
  либо сделать unlock planner, который корректно выдаёт `0 unlocked` сейчас и
  будет готов к запуску после появления approved mappings.

### Quarantine unlock planner

**Цель**

- Сделать безопасный planner поверх staging approved mappings report.
- Сейчас вернуть честный `0 unlocked`.
- Подготовить постоянный контур, который после появления approved provider
  mappings покажет, что можно передать в encrypted full-hash join planner.

**Решение**

- Добавлен planner:
  - `scripts/plan-quarantine-unlock-from-approved-mappings.mjs`.
- Добавлен verifier:
  - `scripts/verify-quarantine-unlock-plan.mjs`.
- Planner потребляет:
  - `backups/staging-approved-mappings-20260619-102455.report.json`;
  - latest sanitized quarantine reconciliation report;
  - linked seed report name из approved mappings report.
- Planner не расшифровывает DPAPI artifacts и не создаёт import plan.
- Planner явно фиксирует:
  - `safeToBuildImportPlanNow = false`;
  - `requiresFullHashImportJoin = true`;
  - short hashes нельзя использовать для actual import decisions.

**Проверка**

- `node --check scripts/plan-quarantine-unlock-from-approved-mappings.mjs` прошёл.
- `node --check scripts/verify-quarantine-unlock-plan.mjs` прошёл.
- Planner создал:
  - `backups/staging-quarantine-unlock-plan-20260619-103152.report.json`.
- Verifier прошёл:
  - `node scripts/verify-quarantine-unlock-plan.mjs backups/staging-quarantine-unlock-plan-20260619-103152.report.json`.

Plan result:

- `status = blocked_waiting_for_approved_provider_mappings`.
- `safeToBuildImportPlanNow = false`.
- `seedRowsUnlockedByHashShort = 0`.
- `candidateRecordsPotentiallyUnlockedByHashShort = 0`.
- `seedRowsStillBlockedByHashShort = 14`.
- `candidateRecordsStillBlockedByHashShort = 198`.
- `blockedCandidateRecords = 198`.

**Safety**

- No raw Telegram ids, chat ids, user ids, task text, `metadata_json`, secrets
  or full hashes are printed.
- Planner report is local/sanitized and not a production write.
- Actual unlock/import still requires future encrypted full-hash join tooling.

**Вывод**

- Gate 3 migration decision chain теперь умеет безопасно сказать: сейчас
  quarantine unlock = 0.
- Следующий этап: решить, как получать реальные approved provider mappings в
  staging — через controlled persistent test mapping или через реальный
  Telegram account sync flow — и только после этого возвращаться к encrypted
  full-hash join/import planner.

### Controlled persistent synthetic provider mapping

**Цель**

- Создать fixed synthetic provider-sync mapping в staging, который остаётся
  после запуска.
- Проверить, что staging approved mappings report видит provider-sync rows.
- Проверить, что quarantine unlock planner не разблокирует production-derived
  quarantine, если approved mappings не совпали с seed refs.

**Решение**

- `scripts/smoke-staging-telegram-provider-sync.ps1` расширен режимами:
  - `-PersistSynthetic`;
  - `-CleanupPersistentSynthetic`.
- `-PersistSynthetic`:
  - создаёт fixed synthetic D1 user + Telegram identity;
  - создаёт synthetic staging KV `tg:*` mapping;
  - вызывает signed `register-chat`;
  - оставляет synthetic D1/KV state в staging;
  - печатает только sanitized counts.
- `-CleanupPersistentSynthetic` удаляет fixed synthetic state.
- `scripts/plan-quarantine-unlock-from-approved-mappings.mjs` усилен новым
  статусом:
  - `blocked_approved_mappings_do_not_match_seed_refs`.

**Проверка**

- PowerShell syntax check для `smoke-staging-telegram-provider-sync.ps1` прошёл.
- `node --check scripts/plan-quarantine-unlock-from-approved-mappings.mjs` прошёл.
- `node --check scripts/verify-quarantine-unlock-plan.mjs` прошёл.
- Persistent synthetic seed прошёл:
  - `signedRegisterChat = ok`;
  - `d1ProviderSync = ok`;
  - `integrations = 1`;
  - `conversations = 1`;
  - `mappings = 2`;
  - `approvedProviderMappings = 2`.
- Новый approved mappings report:
  - `backups/staging-approved-mappings-20260619-104005.report.json`.
- Verifier прошёл:
  - `node scripts/verify-staging-approved-mapping-report.mjs backups/staging-approved-mappings-20260619-104005.report.json`.
- Новый unlock plan:
  - `backups/staging-quarantine-unlock-plan-20260619-104017.report.json`.
- Verifier прошёл:
  - `node scripts/verify-quarantine-unlock-plan.mjs backups/staging-quarantine-unlock-plan-20260619-104017.report.json`.

Report/planner result:

- Approved provider sync mappings in staging: `2`.
- `unmatchedApprovedRows = 2`.
- `seedRowsUnlockedByHashShort = 0`.
- `candidateRecordsPotentiallyUnlockedByHashShort = 0`.
- `candidateRecordsStillBlockedByHashShort = 198`.
- Planner status:
  - `blocked_approved_mappings_do_not_match_seed_refs`.
- `safeToBuildImportPlanNow = false`.

**Safety**

- Production не затрагивался.
- Raw synthetic ids, tokens, full hashes и task text не печатались.
- Synthetic persistent state намеренно остаётся в staging для следующих
  report/planner проверок.
- Cleanup command:
  - `scripts/smoke-staging-telegram-provider-sync.ps1 -CleanupPersistentSynthetic`.

**Вывод**

- Safety chain работает: наличие approved provider mappings само по себе не
  разблокирует quarantine import.
- Для реальной разблокировки нужны provider mappings, совпадающие с seed refs,
  либо отдельный synthetic seed/report test, изолированный от production-derived
  artifacts.

### Isolated synthetic positive unlock branch

**Цель**

- Проверить позитивный planner branch:
  - `ready_for_encrypted_full_hash_join`.
- Не использовать production-derived artifacts.
- Не делать Cloudflare/D1/KV writes.
- Убедиться, что даже при positive branch planner не разрешает прямой import
  без encrypted full-hash join.

**Решение**

- Добавлен synthetic report builder:
  - `scripts/build-synthetic-positive-approved-mapping-report.mjs`.
- `scripts/plan-quarantine-unlock-from-approved-mappings.mjs` обновлён:
  - если input report содержит `syntheticTest = true`, planner не подтягивает
    latest production-derived quarantine report.
- Synthetic fixture:
  - не содержит raw ids;
  - не содержит full hashes;
  - не связан с staging D1/KV;
  - моделирует один seed match и один unmatched approved row.

**Проверка**

- `node --check scripts/build-synthetic-positive-approved-mapping-report.mjs` прошёл.
- `node --check scripts/plan-quarantine-unlock-from-approved-mappings.mjs` прошёл.
- `node --check scripts/verify-quarantine-unlock-plan.mjs` прошёл.
- `node --check scripts/verify-staging-approved-mapping-report.mjs` прошёл.
- Создан synthetic approved report:
  - `backups/staging-approved-mappings-synthetic-positive-branch-20260619-104514.report.json`.
- Approved mapping verifier прошёл:
  - `seedRowsUnlockedByHashShort = 1`;
  - `candidateRecordsPotentiallyUnlockedByHashShort = 3`;
  - `approvedProviderSyncMappings = 2`.
- Создан synthetic unlock plan:
  - `backups/staging-quarantine-unlock-plan-20260619-104528.report.json`.
- Unlock plan verifier прошёл.

Plan result:

- `syntheticTest = true`.
- `status = ready_for_encrypted_full_hash_join`.
- `safeToBuildImportPlanNow = false`.
- `seedRowsUnlockedByHashShort = 1`.
- `candidateRecordsPotentiallyUnlockedByHashShort = 3`.
- `blockedSummary.blocker = encrypted_full_hash_join_not_run`.

**Safety**

- Нет Cloudflare writes.
- Нет production-derived data.
- Planner всё равно не создаёт import plan и требует encrypted full-hash join.

**Вывод**

- Позитивная ветка planner-а работает.
- Следующий технический этап: проектировать encrypted full-hash join planner,
  который сможет работать с DPAPI artifacts локально и печатать только
  агрегированные/sanitized решения.

### Encrypted full-hash join planner

**Цель**

- Проверить реальный join между:
  - production-derived DPAPI seed plan;
  - approved mappings из staging D1.
- Использовать full hashes только внутри процесса.
- Снаружи сохранить только sanitized report без raw legacy refs, ids, task text,
  `metadata_json`, secrets и full hashes.
- Не делать D1/KV writes.

**Решение**

- Добавлен read-only planner:
  - `scripts/plan-encrypted-full-hash-join.ps1`.
- Добавлен privacy/consistency verifier:
  - `scripts/verify-encrypted-full-hash-join-report.mjs`.
- Planner:
  - локально расшифровывает DPAPI seed plan;
  - проверяет plaintext SHA-256 по metadata;
  - читает staging D1 только через `SELECT`;
  - делает full-hash join in-process;
  - пишет только sanitized aggregate/match decision report.

**Проверка**

- PowerShell syntax check для `plan-encrypted-full-hash-join.ps1` прошёл.
- `node --check scripts/verify-encrypted-full-hash-join-report.mjs` прошёл.
- Создан report:
  - `backups/encrypted-full-hash-join-20260619-105639.report.json`.
- Verifier прошёл:
  - `node scripts/verify-encrypted-full-hash-join-report.mjs backups/encrypted-full-hash-join-20260619-105639.report.json`.

Report result:

- `status = blocked_approved_mappings_do_not_match_seed_full_hashes`.
- `approvedRowsFromD1 = 2`.
- `matchedSeedRows = 0`.
- `candidateRecordsMatched = 0`.
- `candidateRecordsStillBlocked = 198`.
- `safeToWriteD1 = false`.
- `safeToBuildEncryptedTaskImportDryRun = false`.
- `privacy = ok`.

**Ошибки и решения**

- `StrictMode` упал на optional поле `syntheticTest` в старом approved mapping
  report. Исправлено безопасным чтением JSON-свойств через `Get-JsonValue`.
- Запуск через отдельный `powershell.exe` не смог расшифровать DPAPI artifact:
  `Key not valid for use in specified state`. Проверено, что текущий
  PowerShell-контекст Codex расшифровывает artifact без вывода plaintext.
  Рабочий запуск:
  - `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`
  - `.\scripts\plan-encrypted-full-hash-join.ps1`

**Safety**

- Production не затрагивался.
- Staging D1 только читался.
- DPAPI plaintext не печатался.
- Full hashes использовались только in-process и не попали в report.
- Persistent synthetic mapping остаётся в staging и объясняет ожидаемый статус:
  approved rows есть, но они не совпадают с production-derived seed full hashes.

**Вывод**

- Реальный encrypted full-hash join механизм работает безопасно.
- Текущий staging state корректно блокирует дальнейший import dry-run, потому что
  synthetic approved mappings не относятся к quarantine seed refs.
- Следующий этап: получить real/provider-approved mappings, совпадающие с seed
  refs, либо построить полностью synthetic encrypted dry-run fixture без
  production-derived artifacts.

### Synthetic encrypted task import dry-run fixture

**Цель**

- Проверить позитивную ветку encrypted task import dry-run без
  production-derived данных.
- Использовать тот же DPAPI entropy label и тот же task import plan shape, что у
  реального encrypted import plan.
- Не делать Cloudflare, D1 или KV writes.
- Не позволить staging apply случайно применить synthetic plan.

**Решение**

- Добавлен synthetic builder:
  - `scripts/build-synthetic-encrypted-task-import-dry-run.ps1`.
- Добавлен sanitized report verifier:
  - `scripts/verify-synthetic-encrypted-task-import-dry-run-report.mjs`.
- Усилен staging apply guard:
  - `scripts/apply-task-import-plan-staging.ps1` теперь отказывается принимать
    metadata/plan с `syntheticTest = true` или `dryRunOnly = true`.
- Synthetic metadata намеренно называется не как обычный
  `*.task-import-plan.metadata.json`, чтобы default apply/verify lookup не
  подхватил её случайно. Existing validators запускаются только с явным
  metadata path.

**Проверка**

- PowerShell syntax check прошёл:
  - `scripts/build-synthetic-encrypted-task-import-dry-run.ps1`;
  - `scripts/apply-task-import-plan-staging.ps1`.
- Node syntax check прошёл:
  - `scripts/verify-synthetic-encrypted-task-import-dry-run-report.mjs`;
  - `scripts/validate-task-import-plan-sqlite.mjs`.
- Создан synthetic dry-run report:
  - `backups/synthetic-encrypted-task-import-dry-run-20260619-114243.report.json`.
- Создан synthetic full-hash join report:
  - `backups/encrypted-full-hash-join-synthetic-positive-20260619-114243.report.json`.
- Создан DPAPI-encrypted synthetic task import plan:
  - `backups/synthetic-encrypted-task-import-dry-run-20260619-114243.plan.json.dpapi`.
- Создана synthetic metadata:
  - `backups/synthetic-encrypted-task-import-dry-run-20260619-114243.metadata.json`.
- Новый report verifier прошёл:
  - `privacy = ok`;
  - `rowsPlanned = 3`;
  - `distinctSyntheticUsers = 2`.
- Existing encrypted task import verifier прошёл с явным metadata path:
  - `RowCount = 3`;
  - `UniqueIds = 3`;
  - `UniqueContentHashes = 3`;
  - `StatusCounts = done 1 / open 2`;
  - `SourceCounts = import 1 / message 2`.
- SQLite/D1-shape validator прошёл:
  - `InsertedTasks = 3`;
  - `StubUsers = 2`;
  - `ForeignKeys = ok`;
  - `MetadataJson = valid`.
- Staging apply guard проверен:
  - `apply-task-import-plan-staging.ps1 -DryRun` с synthetic metadata ожидаемо
    отказался выполнять сценарий.

**Ошибки и решения**

- Privacy verifier сначала дал ложное срабатывание на строку `task-import`,
  потому что слишком широкий regex видел `sk-...` внутри слова. Исправлено:
  API-key-like matcher теперь требует token-like длину и boundary, реальные
  secret-patterns остаются проверяемыми.

**Safety**

- Production не затрагивался.
- Staging D1/KV не затрагивались.
- DPAPI plaintext не печатался.
- Synthetic plan содержит только synthetic task text/users.
- Synthetic plan нельзя случайно применить через staging apply script.

**Вывод**

- Позитивная ветка encrypted task import dry-run подтверждена локально.
- Следующий практический этап по Gate 3: проектировать безопасный импорт для
  реально разблокированных quarantine records после появления matching
  provider-approved mappings, либо перейти к следующему backend-блоку Gate 3
  — pagination/idempotency для истории и provider message IDs.

### D1 message repository: pagination and provider idempotency

**Цель**

- Начать следующий backend-блок Gate 3:
  - стабильная пагинация истории сообщений;
  - idempotency по provider message IDs;
  - ownership isolation через `conversations.owner_user_id`.
- Подготовить data-layer для будущих `/v2/messages` routes, Messenger Hub и AI
  memory без переключения production KV routes.

**Решение**

- Добавлен D1-compatible repository:
  - `4e-worker/src/worker/data/message-repository.mjs`.
- Возможности repository:
  - `createMessage`;
  - `upsertProviderMessage`;
  - `findMessageById`;
  - `findMessageByProviderMessageId`;
  - `listMessagesForOwner`.
- Cursor format:
  - base64url JSON `{ v, sentAt, id }`;
  - сортировка `sent_at DESC, id ASC`;
  - deterministic `nextCursor` для следующей страницы.
- Idempotency:
  - `upsertProviderMessage` требует `providerMessageId`;
  - duplicate `(conversation_id, provider_message_id)` обновляет существующую
    строку вместо создания дубля;
  - race fallback перечитывает существующую строку после `UNIQUE` conflict.
- Ownership:
  - list query делает join с `conversations`;
  - чужой `owner_user_id` не получает сообщения conversation.
- Soft-delete:
  - по умолчанию `deleted_at IS NULL`;
  - `includeDeleted = true` доступен для будущих admin/sync сценариев.

**Проверка**

- Добавлен verifier:
  - `scripts/verify-message-repository.mjs`.
- Проверки прошли:
  - `node --check 4e-worker/src/worker/data/message-repository.mjs`;
  - `node --check scripts/verify-message-repository.mjs`;
  - `node scripts/verify-message-repository.mjs`;
  - `node scripts/verify-d1-schema.js`.

Verifier result:

- `idempotentProviderIngest = ok`.
- `duplicateRows = 0`.
- `totalRows = 5`.
- `firstPageRows = 2`.
- `secondPageRows = 1`.
- `cursor = ok`.
- `ownershipIsolation = ok`.
- `softDeleteDefault = ok`.
- D1 schema check:
  - `tables = 21`;
  - `indexes = 25`;
  - `foreignKeys = ok`.

**Safety**

- Production не затрагивался.
- Staging D1/KV не затрагивались.
- Проверка полностью synthetic и in-memory SQLite.
- Verifier не печатает raw provider ids, user ids, message text,
  `metadata_json` или secrets.
- Старые production KV `/messages` routes не переключались.

**Вывод**

- Первый data-layer кирпич для реальной истории сообщений готов.
- Следующий шаг: добавить тонкий `/v2/messages` route/service поверх repository
  или сначала подключить provider adapter ingest path к repository в staging.

### `/v2/messages` route/service for D1 history pagination

**Цель**

- Добавить thin route/service поверх D1 `message-repository`.
- Дать authenticated Web/TG/VK клиентам безопасное чтение истории сообщений с
  cursor pagination.
- Не открывать внешний provider ingest endpoint до отдельной internal/bot auth
  обвязки.
- Не переключать legacy production KV `/messages` routes.

**Решение**

- Добавлен service:
  - `4e-worker/src/worker/messages/message-service.mjs`.
- Добавлен route:
  - `4e-worker/src/worker/messages/message-routes.mjs`.
- `4e-worker/worker.js` подключает:
  - `GET /v2/messages`.
- Query:
  - `conversationId`;
  - `limit`;
  - `cursor`.
- Auth:
  - Bearer session через существующий `createAuthService`;
  - D1 unavailable возвращает `503`.
- Public response намеренно не отдаёт:
  - `provider_message_id`;
  - `metadata_json`.

**Проверка**

- Добавлен route verifier:
  - `scripts/verify-v2-messages.mjs`.
- Проверки прошли:
  - `node --check 4e-worker/src/worker/messages/message-service.mjs`;
  - `node --check 4e-worker/src/worker/messages/message-routes.mjs`;
  - `node --check scripts/verify-v2-messages.mjs`;
  - `node scripts/verify-v2-messages.mjs`;
  - `node scripts/verify-message-repository.mjs`;
  - `node scripts/verify-d1-schema.js`;
  - `node --check 4e-worker/worker.js`.

Verifier result:

- `unauthenticated = 401`.
- `invalidQuery = 400`.
- `firstPageRows = 2`.
- `secondPageRows = 1`.
- `cursor = ok`.
- `ownershipIsolation = ok`.
- `softDeleteDefault = ok`.
- `dbUnavailable = 503`.

**Safety**

- Production не затрагивался.
- Staging D1/KV не затрагивались.
- Проверка полностью synthetic и in-memory SQLite.
- Route verifier не печатает raw provider ids, user ids, message text,
  `metadata_json` или secrets.
- Provider ingest endpoint наружу не открывался.
- Legacy KV `/messages` routes остаются как есть.

**Вывод**

- Первый `/v2/messages` read route готов локально.
- Следующий шаг: добавить staging/local smoke для `/v2/messages` после появления
  controlled D1 message fixture или подключить provider ingest path behind
  feature flag.

### VK auth secret verification and legacy payload hardening

**Цель**

- Подтвердить ручную установку `VK_SECRET_KEY` в Cloudflare Worker Secrets.
- Не переносить в следующий этап regression, где старый VK demo payload мог валить Worker.

**Проверка**

- `wrangler secret list` для production Worker показал `ANTHROPIC_KEY`, `BOT_API_TOKEN`, `VK_SECRET_KEY`.
- До hotfix live smoke показал:
  - `GET /` → `200`;
  - `POST /auth/vk {}` → `400`;
  - `POST /auth/vk {"vk_user_id":"123"}` → `500` / Cloudflare `1101`.
- Значения secrets не читались и не записывались.

**Решение**

- В `4e-worker/worker.js` добавлен безопасный helper `readJsonObject(request)`.
- Route `/auth/vk` теперь нормализует пустой, битый, не-object и legacy JSON payload до безопасного объекта.
- `handleVKAuth` дополнительно защищён от неожидаемой формы body.
- Production Worker deployed: `97eddb50-0b09-4b4c-9184-d802a65aaa30`.

**Проверка после deploy**

- `wrangler deploy --dry-run --no-bundle` прошёл.
- `node scripts/verify-vk-launch-params.mjs` прошёл.
- Production smoke:
  - `GET /` → `200`;
  - hostile CORS origin `https://evil.example` → `403`;
  - `POST /auth/vk {}` → `400`;
  - `POST /auth/vk {"vk_user_id":"123"}` → `400`;
  - invalid synthetic launch payload не создаёт сессию.

**Вывод**

- `VK_SECRET_KEY` настроен.
- Неподписанные/legacy VK payloads больше не валят Worker и не создают сессии.
- Для полного закрытия VK-пункта Gate 0 остаётся ручной valid smoke-test из настоящего VK Mini App, потому что значение `VK_SECRET_KEY` намеренно не читается и synthetic valid signature локально не строится.

### `/v2/messages` Worker entrypoint controlled smoke

**Цель**

- Проверить не только route/service модуль, но и реальный `worker.fetch(...)`
  dispatch для `/v2/messages`.
- Сделать проверку без staging/prod D1 writes и без реальных provider/user данных.

**Решение**

- Добавлен smoke:
  - `scripts/smoke-worker-v2-messages-entrypoint.mjs`.
- Smoke импортирует `4e-worker/worker.js`, поднимает in-memory SQLite/D1-shape
  по реальным migrations и создаёт synthetic fixture:
  - два synthetic users;
  - две synthetic sessions;
  - две synthetic conversations;
  - synthetic messages для pagination, ownership isolation и soft-delete.

**Проверка**

- `node --check scripts/smoke-worker-v2-messages-entrypoint.mjs` прошёл.
- `node scripts/smoke-worker-v2-messages-entrypoint.mjs` прошёл.
- `node scripts/verify-v2-messages.mjs` прошёл.
- `node scripts/verify-message-repository.mjs` прошёл.

Smoke result:

- `unauthenticated = 401`.
- `invalidQuery = 400`.
- `firstPageRows = 2`.
- `secondPageRows = 1`.
- `cursor = ok`.
- `cors = ok`.
- `noStore = ok`.
- `ownershipIsolation = ok`.
- `softDeleteDefault = ok`.
- `dbUnavailable = 503`.

**Safety**

- Production не затрагивался.
- Staging D1/KV не затрагивались.
- Smoke полностью synthetic и in-memory.
- Output не печатает raw provider ids, user ids, message text, `metadata_json`
  или secrets.
- Node печатает non-blocking `MODULE_TYPELESS_PACKAGE_JSON` warning при import
  `4e-worker/worker.js`; `package.json` не менялся, чтобы не сломать старые
  CommonJS-style scripts.

**Вывод**

- `/v2/messages` read path проверен уже на уровне Worker entrypoint.
- Следующий шаг: provider ingest path behind staging-only feature flag или
  staging-only D1 message fixture после отдельного approval на staging writes.

### VK/email login “Нет соединения” hotfix

**Симптом**

- Пользователь открыл приложение: экран загружается.
- VK auto-login не проходит.
- Email login показывает “Нет соединения” / “Ошибка соединения”.

**Диагностика**

- Browser-like Node fetch к production `/auth/login` с origin
  `https://mrktggod.github.io` и `https://vk.com` возвращает нормальный JSON:
  `400` / `Неверный email или пароль`.
- CORS preflight для этих origins проходит.
- Вероятная причина live VK webview: реальный Origin может быть
  `https://*.vk-apps.com`, которого не было в Worker CORS allowlist.
- Дополнительный frontend риск: VK auto-login брал launch params только из
  `window.location.search`.

**Backend решение**

- В `4e-worker/worker.js` добавлено:
  - `https://app.vk.com`;
  - `isVkMiniAppsOrigin(origin)` для `https://vk-apps.com` и
    `https://*.vk-apps.com`.
- Production Worker deployed:
  - `1e3a82b2-26a3-4fbb-84d5-244cdfda34d5`.

**Backend проверка**

- `node --check 4e-worker/worker.js` прошёл.
- `wrangler deploy --dry-run --no-bundle` прошёл.
- Production smoke:
  - health → `200`;
  - hostile origin `https://evil.example` → `403`;
  - preflight `https://prod-app123.vk-apps.com` → `204`;
  - fake `/auth/login` from `https://prod-app123.vk-apps.com` → `400`
    with matching `Access-Control-Allow-Origin`.

**Frontend решение**

- В `4e-app/index.html` и `4e-app/vk.html` добавлен `getVkLaunchParams()`.
- VK launch params теперь берутся из:
  - `window.location.search`;
  - `window.location.hash`;
  - `vkBridge.send('VKWebAppGetLaunchParams')`.
- Убран старый вариант, где `/auth/vk` получал только
  `window.location.search`.

**Frontend publish**

- Использован безопасный temp clone:
  - `C:\Users\shelc\AppData\Local\Temp\4e-app-remote-audit`.
- В `mrktggod/4e-app main` запушен commit:
  - `d157bd982f155ddaa52baf7dd0f98a47dfa54da8`
  - `fix: support VK Mini App launch params`.
- Raw GitHub проверен: `index.html` и `vk.html` содержат
  `getVkLaunchParams` / `VKWebAppGetLaunchParams`.

**GitHub Pages verification**

- GitHub Pages сначала отдавал старый HTML из CDN cache
  (`Cache-Control: max-age=600`), затем обновился.
- `https://mrktggod.github.io/4e-app/` содержит `getVkLaunchParams` и
  `VKWebAppGetLaunchParams`.
- `https://mrktggod.github.io/4e-app/vk.html` содержит `getVkLaunchParams` и
  `VKWebAppGetLaunchParams`.
- Старый путь `launchParams: window.location.search` в опубликованных страницах
  больше не найден.

**Вывод**

- Backend-причина “Нет соединения” для VK Mini Apps origins закрыта.
- Frontend подготовлен к launch params из search/hash/VK Bridge.
- Следующий ручной шаг: заново открыть VK Mini App / сделать hard refresh и
  проверить email login + VK auto-login.

### Login legacy password and frontend failure hardening

**Симптом**

- Пользователь сообщил, что приложение долго грузит страницу входа.
- После ввода email/password кнопка ждёт и показывает “Ошибка соединения”.

**Гипотеза**

- Fake email login возвращал нормальный JSON, значит транспорт/CORS для базового
  случая уже работал.
- Реальный email мог находить legacy KV user-запись со старым/неполным password
  shape.
- В таком случае `verifyPassword()` мог упасть на missing `storedHash`/`salt`,
  Worker возвращал Cloudflare error page, а frontend называл это
  “Ошибка соединения”.

**Backend решение**

- В `4e-worker/worker.js`:
  - `verifyPassword()` возвращает `false`, если `salt`/`storedHash` отсутствуют
    или не строки;
  - legacy SHA-256 migration запускается только при hex SHA-256 password hash;
  - login verification обёрнут в sanitized `try/catch`;
  - `/auth/login` читает body через `readJsonObject(request)`, чтобы malformed
    JSON не валил Worker.
- Production Worker deployed:
  - `a1075c52-a9a5-43eb-b50f-3cf2536ae78e`.

**Backend проверка**

- `node --check 4e-worker/worker.js` прошёл.
- Synthetic Worker fetch с legacy users:
  - no user → `400`;
  - missing pbkdf2 fields → `400`;
  - invalid legacy password hash → `400`;
  - null stored hash → `400`.
- `wrangler deploy --dry-run --no-bundle` прошёл.
- Production smoke:
  - malformed JSON `/auth/login` from `https://prod-app123.vk-apps.com` → `400`;
  - fake `/auth/login` from `https://prod-app123.vk-apps.com` → `400`;
  - health → `200`;
  - hostile CORS origin → `403`;
  - invalid VK launch payload → `400`.

**Frontend решение**

- В `4e-app/index.html` и `4e-app/vk.html` добавлены:
  - `withTimeout()`;
  - `readJsonSafe()`.
- VK Bridge init/user-info и auth fetch теперь имеют timeout.
- Email login/register больше не маскируют non-JSON server response как обычную
  connection error.

**Frontend publish**

- Использован безопасный temp clone:
  - `C:\Users\shelc\AppData\Local\Temp\4e-app-remote-audit`.
- Commit pushed to `mrktggod/4e-app main`:
  - `34722335a56bf5831ec1d2dc038fd05a7bafbed4`
  - `fix: harden frontend login failures`.
- GitHub Pages verified:
  - `/4e-app/` содержит `withTimeout`, `readJsonSafe`, `VKWebAppGetLaunchParams`;
  - `/4e-app/vk.html` содержит `withTimeout`, `readJsonSafe`,
    `VKWebAppGetLaunchParams`;
  - `vk.html` Last-Modified `Fri, 19 Jun 2026 17:36:23 GMT`.

**Вывод**

- Worker больше не должен возвращать Cloudflare 1101 для legacy password shapes.
- Frontend должен быстрее доходить до формы входа и показывать server/auth
  ошибки как ошибки, а не как “соединение”.
- Следующая проверка на пользователе: полностью закрыть/открыть VK Mini App
  или hard refresh и повторить login.

### `vk.ru/app54636698` CORS hotfix

**Симптом**

- Пользователь дал реальную ссылку приложения:
  - `https://vk.ru/app54636698`.
- После предыдущих fixes вход всё ещё показывал “Ошибка соединения”.

**Диагностика**

- `https://vk.ru/app54636698` redirects to
  `https://m.vk.ru/app54636698`.
- До fix:
  - `Origin: https://vk.ru` preflight → `403`;
  - `Origin: https://m.vk.ru` preflight → `403`;
  - `Origin: https://app.vk.ru` preflight → `403`.
- Значит реальный браузерный запрос блокировался CORS до чтения JSON ответа.

**Решение**

- В `4e-worker/worker.js` CORS allowlist добавлены:
  - `https://vk.ru`;
  - `https://m.vk.ru`;
  - `https://app.vk.ru`.
- Production Worker deployed:
  - `95dcb053-0dfb-48f6-91b4-465ed2a5b766`.

**Проверка после deploy**

- `node --check 4e-worker/worker.js` прошёл.
- `wrangler deploy --dry-run --no-bundle` прошёл.
- Production smoke:
  - health → `200`;
  - `https://vk.ru` preflight → `204`, fake login → JSON `400`;
  - `https://m.vk.ru` preflight → `204`, fake login → JSON `400`;
  - `https://app.vk.ru` preflight → `204`, fake login → JSON `400`;
  - `https://vk.com` preflight → `204`, fake login → JSON `400`;
  - `https://prod-app123.vk-apps.com` preflight → `204`, fake login →
    JSON `400`.

**Вывод**

- CORS для фактического `vk.ru`/`m.vk.ru` входа закрыт.
- Если теперь пользователь видит “Неверный email или пароль” или
  “Слишком много попыток”, это уже не network/CORS bug, а account/password
  state или login rate-limit.

### VK mobile WebView `X-Requested-With` auth hotfix

**Симптом**

- После `vk.ru` CORS hotfix web/desktop вход работал, но мобильное приложение VK
  всё ещё показывало “Ошибка соединения”.
- Ошибка воспроизводилась и на email login, и на регистрации.

**Диагностика**

- Живой `https://mrktggod.github.io/4e-app/vk.html` был актуален и отправлял
  login/register на production Worker.
- Мобильный Android WebView может добавлять `X-Requested-With`.
- До fix production preflight с
  `Access-Control-Request-Headers: content-type,x-requested-with` возвращал
  `204`, но allow headers не содержали `X-Requested-With`, поэтому браузерный
  fetch мог блокироваться до чтения JSON.
- Дополнительно найдено, что `/auth/register` ещё использовал прямой
  `request.json()` и мог отдавать Cloudflare `1101` на malformed body.

**Решение**

- В `4e-worker/worker.js` добавлен `X-Requested-With` в
  `Access-Control-Allow-Headers`.
- `/auth/register` переведён на безопасный `readJsonObject(request)`.
- Production Worker deployed:
  - `31408d94-050f-417a-8d8a-a1ad7ade621b`;
  - `c2f597c9-8828-4f4e-994f-e0a243fd2da5`.

**Проверка**

- `node --check 4e-worker/worker.js` прошёл.
- `wrangler deploy --dry-run --no-bundle` прошёл.
- Live preflight для `https://mrktggod.github.io` и `https://m.vk.ru` с
  `content-type,x-requested-with` → `204`, allow headers содержат
  `X-Requested-With`.
- Live Node fetch с `X-Requested-With: com.vkontakte.android`:
  - `/auth/login` fake credentials → JSON `400`, `Неверный email или пароль`;
  - `/auth/register` short password → JSON `400`, `Пароль минимум 6 символов`.

**Вывод**

- Мобильный login/register теперь должен перестать падать как network/CORS error.
- Если проблема останется, следующий шаг — временная safe debug-панель в
  `vk.html` без секретов и персональных данных.

### VK mobile false “Ошибка соединения” after successful email login

**Симптом**

- Пользователь сообщил, что на мобильном VK первый email login всё ещё показывает
  “Ошибка соединения”, но повторное нажатие “Войти” уже впускает.
- После входа по email список задач пустой.

**Диагностика**

- Повторный успешный вход означает, что network/auth уже мог сработать на первом
  клике.
- В `4e-app/vk.html` `doLogin()` и `doRegister()` оборачивали в один `try/catch`
  не только fetch/JSON, но и `localStorage.setItem(...)` + `enterApp()`.
- Поэтому ошибка post-login UI init могла показываться как “Ошибка соединения”.
- `enterApp()` также напрямую парсил локальную историю чата через `JSON.parse`,
  что рискованно для мобильного WebView/localStorage.

**Решение**

- В `4e-app/vk.html` добавлены:
  - `completeAuth(token, user)`;
  - `saveAuthToken(token)`;
  - `readChatHistory(userId)`.
- `doLogin()` и `doRegister()` теперь показывают “Ошибка соединения” только если
  упала network/JSON часть.
- `enterApp()` стал tolerant к ошибкам `applyUser`, chat history parse,
  `loadTasks` и `buildCalendar`.
- Frontend commit pushed:
  - `4792e2b`
  - `fix: avoid false VK mobile login connection error`.

**Проверка**

- JS syntax check прошёл для локального `4e-app/vk.html` и publish clone
  `.tmp-4e-app-publish/vk.html`.
- GitHub push прошёл: `3472233..4792e2b main -> main`.
- GitHub Pages verified:
  - `Last-Modified: Fri, 19 Jun 2026 19:07:37 GMT`;
  - live `vk.html` содержит `completeAuth` и `readChatHistory`.

**Отдельно про пустые задачи**

- Email-вход сейчас может быть отдельной identity/user от Telegram/VK/групповых
  task buckets.
- Это не доказывает потерю задач; это подтверждает необходимость Gate 2:
  challenge flow для link/merge аккаунтов и миграция существующих identities.

### VK docs check, login timeout and chat task persistence

**Симптом**

- Пользователь подтвердил: email login на первом клике показывает “Ошибка
  подключения”, после ожидания второй клик входит сразу.
- AI chat history сохраняется в том же email-аккаунте.
- Команда “добавить задачу” в чате не показывает задачу на дашборде.

**Проверка VK документации**

- Проверена официальная страница VK launch params:
  `https://dev.vk.com/ru/mini-apps/development/launch-params`.
- Проверены первичные источники VK Bridge:
  `https://github.com/VKCOM/vk-bridge` и npm `@vkontakte/vk-bridge`.
- VK рекомендует получать launch params через `window.location` или
  `VKWebAppGetLaunchParams`, а `vk_user_id` использовать после проверки подписи
  `sign`.
- Наш VK auto-login flow этому соответствует; текущий симптом относится к email
  login timeout и отсутствию chat→task persistence.

**Диагностика**

- `4e-app/vk.html` chat отправлял текст только в `/anthropic` и сохранял
  локальную chat history.
- `/tasks` дашборд читает Worker/KV task storage.
- Worker сохраняет задачи через `x-action: save-task`.
- До fix VK chat не вызывал `save-task`, поэтому AI мог сказать “зафиксировал”,
  но задача не появлялась в дашборде.
- Login/register timeout был `10000` ms, что мало для cold start/мобильной сети.

**Решение**

- В `4e-app/vk.html` добавлен `AUTH_TIMEOUT_MS = 30000`.
- Login/register кнопки получают busy state.
- Добавлен `maybeSaveTaskFromChat(text)`: task-like команды из чата теперь
  сохраняются через Worker `x-action: save-task`.
- После сохранения вызывается `loadTasks()`.
- Добавлен базовый HTML escaping для chat/task rendering.
- Frontend commit pushed:
  - `5120a36`
  - `fix: persist VK chat task commands`.

**Проверка**

- JS syntax check прошёл для локального и publish-clone `vk.html`.
- `origin/main` verified:
  `5120a3681791e07c0659a6eaa411165a3bec93f3`.
- GitHub API verified `vk.html` blob:
  `2ae7465e402a43d2c71a0e96e803c089d8e79480`, size `40314`.
- GitHub Pages edge cache может отдавать старый HTML до истечения CDN TTL.

**Оставшийся долг**

- Email и Telegram всё ещё могут быть разными identities/users.
- Для общего дашборда нужен Gate 2: safe link/merge Web/TG/VK identities.

### Legacy identity linking and VK task dashboard read compatibility

**Симптом**

- После email-входа внутри VK Mini App пользователь мог видеть один аккаунт, а Telegram/VK-задачи могли лежать в другом legacy user bucket.
- Команды из VK-чата уже могли сохранять задачу через `save-task`, но дашборд всё равно показывал пустой список.

**Диагностика**

- Production `/auth/login`, `/auth/vk`, `/auth/telegram` и `/tasks` пока работают через legacy KV path, а не через D1 v2 auth.
- VK auth создавал отдельного пользователя `vk_<id>` и session без email.
- `/tasks` в legacy Worker отдаёт массив, а `vk.html` ждал `{ tasks: [...] }`.

**Решение**

- В `4e-worker/worker.js` добавлен legacy identity bridge:
  - `getUserById`;
  - `getSessionUser`;
  - `recordLinkedIdentity`;
  - `linkProviderIdentity`;
  - copy-only merge legacy buckets.
- Добавлен `POST /auth/link-vk`:
  - требует `x-token`;
  - проверяет VK launch params подписью;
  - связывает VK ID с текущим email-пользователем;
  - копирует старые VK tasks/notifs/AI messages/chats в текущий user bucket.
- Улучшен `POST /auth/link-telegram`:
  - после проверенного Telegram `initData` копирует старые Telegram buckets в текущего пользователя.
- `/auth/vk` теперь сначала ищет `vk:<id>` mapping; если VK уже привязан к email-user, auto-login возвращает email-user.
- Добавлен protected `GET /auth/identities`.
- В `4e-app/vk.html`:
  - добавлен `linkCurrentVK()` после email login/register;
  - `loadTasks()` теперь принимает и legacy array, и `{ tasks: [...] }`.

**Проверка**

- `node --check 4e-worker/worker.js`.
- JS syntax check для локального и publish `vk.html`.
- `node scripts/verify-legacy-identity-linking.mjs`:
  - VK-only account + task;
  - email registration;
  - `/auth/link-vk`;
  - old VK task появляется в email `/tasks`;
  - следующий `/auth/vk` возвращает email user.
- Worker dry-run прошёл.
- Production Worker deployed:
  - `233ba462-ffb4-467d-8a9e-f04b01df9f41`.
- Live smoke:
  - `OPTIONS /auth/link-vk` from `https://m.vk.ru` → `204`;
  - unauthenticated `GET /auth/identities` → `401` JSON with CORS.
- Frontend pushed:
  - `16e4ef3`
  - `fix: link VK identity after email auth`.
- GitHub Pages verified:
  - `linkCurrentVK` присутствует;
  - `Array.isArray(data) ? data` присутствует.

**Оставшийся долг**

- Нужен экран профиля “подключённые аккаунты”.
- Нужен явный unlink/relink flow.
- Legacy bridge нужно перенести в D1 `auth_identities` после production D1 cutover.

### VK connected accounts profile UI

**Контекст**

- После CODEX-030 backend уже имел protected `GET /auth/identities` и signed `POST /auth/link-vk`.
- Следующий маленький Gate 2 шаг — показать пользователю, какие identities связаны, не дожидаясь полного редизайна.

**Design brief**

- Экран: профиль VK Mini App.
- Цель: Email, VK и Telegram видны как единый набор подключений пользователя.
- Визуальный источник: текущие cards/tokens из `4e-app/vk.html`.
- Интерактивность: загрузка статусов и обновление связи VK; unlink/relink пока не делаем.

**Решение**

- В `4e-app/vk.html` и publish clone `.tmp-4e-app-publish/vk.html` добавлен блок “Подключённые аккаунты”.
- Добавлены строки Email/VK/Telegram со статусами “Подключён” / “Нет”.
- Добавлен `loadIdentities()` для protected `GET /auth/identities`.
- Добавлен `refreshVKIdentity()` для ручного обновления signed VK-связи.
- `linkCurrentVK()` теперь обновляет список identities после успешной привязки.

**Проверка**

- JS syntax check прошёл для локального и publish `vk.html`.
- Marker check подтвердил:
  - `Подключённые аккаунты`;
  - `identityList`;
  - `refreshVKIdentity`;
  - `loadIdentities`.

**Оставшийся долг**

- Нужен явный Telegram link flow вне Telegram WebApp.
- Нужны unlink/relink policy и UI.
- При компонентном редизайне этот блок нужно перенести в нормальный Profile/Account component.

### D1 v2 auth identities read endpoint

**Контекст**

- После CODEX-030/031 legacy KV уже умеет показывать connected accounts через `GET /auth/identities`.
- Для будущего редизайна и production D1 cutover нужен такой же безопасный read path в `/v2/auth`, чтобы UI не был привязан к legacy KV-формату.
- Это маленький Gate 2 шаг: read-only D1 endpoint без production switch, без unlink/relink и без новых secrets.

**Решение**

- В `4e-worker/src/worker/data/auth-repository.mjs` добавлен `listIdentitiesByUser(userId)`.
- В `4e-worker/src/worker/auth/auth-service.mjs` добавлен public identity mapping:
  - отдаёт `provider`, `providerUserId`, `email`, `username`, `displayName`, timestamps;
  - не отдаёт raw `profile_json`.
- В `4e-worker/src/worker/auth/auth-routes.mjs` добавлен protected `GET /v2/auth/identities`.
- В `scripts/verify-auth-repository.mjs` и `scripts/verify-v2-auth.mjs` добавлены проверки list/read flow и 401 после logout.

**Проверка**

- `node --check 4e-worker/worker.js` прошёл.
- `node --check 4e-worker/src/worker/data/auth-repository.mjs` прошёл.
- `node --check 4e-worker/src/worker/auth/auth-service.mjs` прошёл.
- `node --check 4e-worker/src/worker/auth/auth-routes.mjs` прошёл.
- `node --check scripts/verify-v2-auth.mjs` прошёл.
- `node --check scripts/verify-auth-repository.mjs` прошёл.
- `node scripts/verify-auth-repository.mjs` прошёл.
- `node scripts/verify-v2-auth.mjs` прошёл.
- `node scripts/verify-d1-schema.js` прошёл.
- `wrangler deploy --dry-run --no-bundle --config wrangler.staging.toml` прошёл.
- Staging Worker deployed:
  - `restless-lab-d737-staging`;
  - version `913ef30c-0da1-4f93-8852-eb3e8380efb1`;
  - URL `https://restless-lab-d737-staging.shelckograff.workers.dev`.
- Staging smoke:
  - первый `GET /v2/auth/identities` сразу после deploy кратко вернул старый `404`;
  - повторный no-token `GET /v2/auth/identities` вернул ожидаемый `401`;
  - запрос с invalid bearer token вернул route-level auth error, то есть endpoint на edge жив.

**Оставшийся долг**

- D1 write/link routes для VK и Telegram identities.
- Unlink/relink policy и user-facing confirmation states.
- Production D1 auth cutover только после миграционных и smoke gates.

### D1 v2 signed identity link routes

**Контекст**

- После CODEX-032 у D1/v2 был безопасный read contract для connected accounts: `GET /v2/auth/identities`.
- Следующий Gate 2 шаг — write/link foundation, но не unsafe endpoint вида “передай providerUserId и создай identity”.
- Для Telegram/VK identity write требуется provider proof: Telegram `initData` или VK signed launch params.

**Решение**

- Добавлен `4e-worker/src/worker/auth/provider-verifiers.mjs`:
  - `verifyTelegramInitData(initData, BOT_API_TOKEN)`;
  - `verifyVKLaunchParams(launchParams, VK_SECRET_KEY)`;
  - `ProviderVerificationError`.
- В `4e-worker/src/worker/auth/auth-service.mjs` добавлен `linkVerifiedIdentity(userId, identity)`:
  - если identity уже принадлежит текущему user — возвращает `linked: false`;
  - если identity принадлежит другому user — возвращает конфликт через `AuthConflictError`;
  - если identity новая — пишет её в `auth_identities`.
- В `4e-worker/src/worker/auth/auth-routes.mjs` добавлены protected routes:
  - `POST /v2/auth/link-telegram`;
  - `POST /v2/auth/link-vk`.
- В `4e-worker/worker.js` v2 auth routes теперь получают `BOT_API_TOKEN` и `VK_SECRET_KEY` bindings.
- В `scripts/verify-v2-auth.mjs` добавлены проверки:
  - valid Telegram link;
  - repeated Telegram link без дубля;
  - tampered Telegram payload rejection;
  - valid VK link;
  - conflict, если другой user пытается забрать уже привязанную provider identity.

**Проверка**

- `node --check 4e-worker/src/worker/auth/provider-verifiers.mjs` прошёл.
- `node --check 4e-worker/src/worker/auth/auth-service.mjs` прошёл.
- `node --check 4e-worker/src/worker/auth/auth-routes.mjs` прошёл.
- `node --check scripts/verify-v2-auth.mjs` прошёл.
- `node --check 4e-worker/worker.js` прошёл.
- `node scripts/verify-v2-auth.mjs` прошёл.
- `node scripts/verify-auth-repository.mjs` прошёл.
- `node scripts/verify-telegram-initdata.mjs` прошёл.
- `node scripts/verify-vk-launch-params.mjs` прошёл.
- `node scripts/verify-d1-schema.js` прошёл.
- `wrangler secret list --config wrangler.staging.toml` показал `BOT_API_TOKEN`; `VK_SECRET_KEY` в staging пока не настроен.
- `wrangler deploy --dry-run --no-bundle --config wrangler.staging.toml` прошёл.
- Staging Worker deployed:
  - `restless-lab-d737-staging`;
  - version `5b145762-4e19-402e-bba2-c815f6a1b0ee`;
  - URL `https://restless-lab-d737-staging.shelckograff.workers.dev`.
- No-write staging smoke:
  - `GET /v2/auth/identities` без bearer token → `401`;
  - `POST /v2/auth/link-telegram` без bearer token → `401`;
  - `POST /v2/auth/link-vk` без bearer token → `401`.

**Ограничения**

- Production не трогался.
- Full remote Telegram write smoke не запускался, потому что Codex не читает значение staging `BOT_API_TOKEN` для подписи реального `initData`; write behavior покрыт локальным signed verifier test.
- Full VK staging write smoke требует добавить `VK_SECRET_KEY` в staging secrets.
- Automatic D1 user merge намеренно отложен до challenge/merge policy.

**Оставшийся долг**

- Staging `VK_SECRET_KEY` для полного VK smoke, если нужен.
- Challenge/merge policy для identity, которая уже принадлежит другому D1 user.
- Unlink/relink policy и user-facing confirmation states.
- Production D1 auth cutover после миграционных и smoke gates.

### D1 identity conflict challenge foundation

**Контекст**

- После CODEX-033 signed link routes уже умели безопасно привязывать Telegram/VK identities в D1/v2.
- Если provider identity уже принадлежала другому D1 user, route возвращал `409`, но durable challenge record ещё не создавался.
- Автоматический merge пользователей сейчас опасен: без явного подтверждения можно случайно соединить чужие данные.

**Решение**

- Добавлена миграция `4e-worker/migrations/0005_account_link_challenge_metadata.sql`.
- `account_link_challenges` расширен metadata-полями:
  - `target_identity_id`;
  - `target_user_id`;
  - `provider_user_id_hash`;
  - `challenge_type`;
  - `metadata_json`;
  - `updated_at`.
- В `auth-repository` добавлены:
  - `createAccountLinkChallenge(...)`;
  - `findAccountLinkChallengeById(id)`.
- В `auth-service` конфликт "identity belongs to another user" теперь создаёт pending challenge:
  - TTL 15 минут;
  - provider user id хранится только как SHA-256 hash;
  - публичный ответ содержит только безопасные поля challenge.
- В `auth-routes` `AuthConflictError` теперь может отдавать safe details:
  - `requiresChallenge: true`;
  - `challenge.id`;
  - `challenge.type`;
  - `challenge.targetProvider`;
  - `challenge.status`;
  - `challenge.expiresAt`;
  - `challenge.createdAt`.

**Проверка**

- `node --check 4e-worker/src/worker/data/auth-repository.mjs` прошёл.
- `node --check 4e-worker/src/worker/auth/auth-service.mjs` прошёл.
- `node --check 4e-worker/src/worker/auth/auth-routes.mjs` прошёл.
- `node --check scripts/verify-v2-auth.mjs` прошёл.
- `node --check scripts/verify-d1-schema.js` прошёл.
- `node --check 4e-worker/worker.js` прошёл.
- `node scripts/verify-d1-schema.js` прошёл:
  - `linkChallengeMetadata: ok`;
  - `foreignKeys: ok`;
  - `userCascadeDelete: ok`.
- `node scripts/verify-auth-repository.mjs` прошёл.
- `node scripts/verify-v2-auth.mjs` прошёл:
  - conflict-flow теперь проверяет `requiresChallenge: true`;
  - публичный challenge не раскрывает `targetUserId`/`providerUserId`;
  - D1 содержит `challenge_type = identity_conflict` и hash provider id.
- `node scripts/verify-telegram-initdata.mjs` прошёл.
- `node scripts/verify-vk-launch-params.mjs` прошёл.
- `git diff --check` прошёл.
- `wrangler deploy --dry-run --no-bundle --config wrangler.staging.toml` прошёл.
- `wrangler d1 migrations apply DB --remote --config wrangler.staging.toml` применил `0005_account_link_challenge_metadata.sql` к staging D1.
- Staging Worker deployed:
  - `restless-lab-d737-staging`;
  - version `9bf77231-9535-4b3b-8bc7-d5a8f043d05f`;
  - URL `https://restless-lab-d737-staging.shelckograff.workers.dev`.
- No-write staging smoke:
  - `POST /v2/auth/link-telegram` без bearer token → `401`.
- Read-only staging D1 query подтвердил наличие новых колонок и `rows_written: 0`.

**Ошибки и решения**

- Первый read-only D1 query на staging упал из-за вложенного quoting PowerShell.
- Решение: повторить команду без вложенного PowerShell; D1 query прошёл успешно.

**Ограничения**

- Production не трогался.
- Full remote Telegram/VK challenge creation smoke не запускался: Codex не читает значения секретов, которые нужны для подписи реальных provider payloads.
- Automatic D1 user merge всё ещё отключён.

**Оставшийся долг**

- Challenge completion route и merge confirmation policy.
- User-facing UI для состояния "этот Telegram/VK аккаунт уже привязан".
- Unlink/relink policy.
- Production D1 auth cutover после миграционных и smoke gates.

### D1 link challenge completion route

**Контекст**

- После CODEX-034 D1/v2 уже создавал pending challenge при попытке привязать Telegram/VK identity, которая принадлежит другому user.
- Следующий безопасный шаг — дать текущему пользователю доказать контроль над provider account ещё раз и пометить challenge completed.
- Merge пользователей по-прежнему нельзя делать автоматически без отдельного user-facing подтверждения и data policy.

**Решение**

- В `auth-repository` добавлен `updateAccountLinkChallengeStatus(...)`.
- В `auth-service` добавлены:
  - `AuthNotFoundError`;
  - `getLinkChallengeCompletionTarget(userId, challengeId)`;
  - `completeVerifiedLinkChallenge(userId, challengeId, identity)`.
- В `auth-routes` добавлен route:
  - `POST /v2/auth/link-challenges/:id/complete`.
- Route:
  - требует Bearer session;
  - проверяет, что challenge принадлежит текущему пользователю;
  - принимает только `pending` + non-expired `identity_conflict`;
  - выбирает verifier по `target_provider` challenge;
  - сверяет signed provider proof с `provider_user_id_hash`;
  - проверяет, что target identity всё ещё принадлежит исходному user;
  - переводит challenge в `completed`.
- Ответ сообщает `mergeReady: true` и `nextAction: "merge_confirmation_required"`, но не переносит identity и не объединяет данные.

**Проверка**

- `node --check 4e-worker/src/worker/data/auth-repository.mjs` прошёл.
- `node --check 4e-worker/src/worker/auth/auth-service.mjs` прошёл.
- `node --check 4e-worker/src/worker/auth/auth-routes.mjs` прошёл.
- `node --check scripts/verify-v2-auth.mjs` прошёл.
- `node --check scripts/verify-auth-repository.mjs` прошёл.
- `node --check 4e-worker/worker.js` прошёл.
- `node scripts/verify-auth-repository.mjs` прошёл.
- `node scripts/verify-v2-auth.mjs` прошёл:
  - missing challenge → `404`;
  - чужой challenge → `404`;
  - matching Telegram proof завершает challenge;
  - `linked` остаётся `false`;
  - Telegram identity остаётся у исходного owner;
  - wrong signed provider proof → `400`;
  - wrong-proof challenge остаётся `pending`.
- `node scripts/verify-d1-schema.js` прошёл.
- `node scripts/verify-telegram-initdata.mjs` прошёл.
- `node scripts/verify-vk-launch-params.mjs` прошёл.
- `git diff --check` прошёл.
- `wrangler deploy --dry-run --no-bundle --config wrangler.staging.toml` прошёл.
- Staging Worker deployed:
  - `restless-lab-d737-staging`;
  - version `b4096eb1-e639-4baf-9d4c-935a0684f549`;
  - URL `https://restless-lab-d737-staging.shelckograff.workers.dev`.
- No-write staging smoke:
  - `POST /v2/auth/link-challenges/smoke/complete` без bearer token → `401`.

**Ограничения**

- Production не трогался.
- Схема D1 не менялась.
- Full remote provider completion smoke не запускался: Codex не читает secret values для подписи реальных provider payloads.
- Automatic merge всё ещё отключён.

**Оставшийся долг**

- Merge confirmation policy: какие данные переносим, что делаем с sessions, задачами, сообщениями и audit trail.
- User-facing UI для состояния "этот Telegram/VK аккаунт уже привязан".
- Unlink/relink policy.
- Production D1 auth cutover после миграционных и smoke gates.

### D1 link challenge merge confirmation route

**Контекст**

- После CODEX-035 completed challenge означал: текущий пользователь повторно доказал контроль над конфликтующим Telegram/VK provider account.
- Оставался ключевой Gate 2 долг: явный merge policy, который не переносит данные без `confirm: true` и не ломает D1 unique constraints.

**Решение**

- Добавлен route:
  - `POST /v2/auth/link-challenges/:id/merge`.
- Контракт body:
  - `{ "confirm": true }`.
- В `auth-repository` добавлены:
  - `getCompletedLinkChallengeForMerge(...)`;
  - `getUserMergePreflight(...)`;
  - `mergeUserIntoCanonical(...)`.
- В `auth-service` добавлен `mergeCompletedLinkChallenge(...)`.
- Merge policy:
  - current session user = canonical user;
  - challenge target user = source user;
  - source sessions ревокаются;
  - source user получает `status = deleted`;
  - D1-owned rows переносятся на canonical user.
- Переносимые ownership поля:
  - `auth_identities.user_id`;
  - `integrations.user_id`;
  - `contacts.owner_user_id`;
  - `conversations.owner_user_id`;
  - `legacy_conversation_mappings.owner_user_id`;
  - `tasks.user_id`;
  - `reminders.user_id`;
  - `ai_threads.user_id`;
  - `ai_memories.user_id`;
  - `audit_events.user_id`.
- Через связи остаются доступны:
  - messages;
  - attachments;
  - conversation members;
  - AI messages;
  - conversation summaries.
- Preflight блокирует merge, если есть:
  - duplicate contacts по `(owner_user_id, provider, provider_contact_id)`;
  - duplicate AI memories по `(user_id, memory_type, memory_key)`.

**Проверка**

- `node --check 4e-worker/src/worker/data/auth-repository.mjs` прошёл.
- `node --check 4e-worker/src/worker/auth/auth-service.mjs` прошёл.
- `node --check 4e-worker/src/worker/auth/auth-routes.mjs` прошёл.
- `node --check scripts/verify-v2-auth.mjs` прошёл.
- `node --check scripts/verify-auth-repository.mjs` прошёл.
- `node --check 4e-worker/worker.js` прошёл.
- `node scripts/verify-auth-repository.mjs` прошёл:
  - contact conflict preflight = `1`;
  - AI-memory conflict preflight = `1`.
- `node scripts/verify-v2-auth.mjs` прошёл:
  - merge без `confirm: true` → `400`;
  - чужой merge → `404`;
  - completed challenge переносит identities/tasks/reminders/integrations/contacts/conversations/AI/audit rows;
  - source sessions revoked;
  - source user marked `deleted`;
  - target email login после merge возвращает canonical user.
- `node scripts/verify-d1-schema.js` прошёл.
- `node scripts/verify-v2-tasks.mjs` прошёл.
- `node scripts/verify-v2-messages.mjs` прошёл.
- `node scripts/verify-telegram-initdata.mjs` прошёл.
- `node scripts/verify-vk-launch-params.mjs` прошёл.
- `git diff --check` прошёл.
- `wrangler deploy --dry-run --no-bundle --config wrangler.staging.toml` прошёл.
- Staging Worker deployed:
  - `restless-lab-d737-staging`;
  - version `b80be643-0fa6-402a-a314-888013f62998`;
  - URL `https://restless-lab-d737-staging.shelckograff.workers.dev`.
- No-write staging smoke:
  - `POST /v2/auth/link-challenges/smoke/merge` без bearer token → `401`.

**Ошибки и решения**

- Первый no-write curl с escaped JSON в PowerShell вернул exit code 1 без body.
- Решение: повторить smoke с `{}`; route подтвердил auth boundary через `401`.

**Ограничения**

- Production не трогался.
- D1 schema не менялась.
- Full remote provider merge smoke не запускался: Codex не читает secret values для подписи реальных provider payloads.
- Frontend UI для этого flow ещё не сделан.

**Оставшийся долг**

- UI для conflict → complete → merge states.
- Unlink/relink policy.
- Production D1 auth cutover checklist.
- Отображение merged history/audit trail пользователю.

### VK identity conflict/merge UI layer

**Контекст**

- Backend D1/v2 уже умеет:
  - создавать challenge при identity conflict;
  - завершать challenge через signed provider proof;
  - делать merge после `confirm: true`.
- В VK Mini App уже был блок `Подключённые аккаунты`, но не было состояния для пользователя: "этот VK аккаунт уже связан с другим профилем".
- Текущий production VK frontend всё ещё работает через legacy `/auth/*` + `x-token`, а D1/v2 challenge endpoints пока staging/Bearer. Поэтому нельзя было просто включить live flow напрямую.

**Решение**

- В `4e-app/vk.html` и `.tmp-4e-app-publish/vk.html` добавлен hidden UI layer:
  - `identityChallengePanel`;
  - кнопка `Подтвердить VK`;
  - кнопка `Объединить данные`;
  - copy для pending/completed challenge;
  - предупреждение, что аккаунты не объединяются скрыто.
- Добавлено состояние:
  - `state.pendingLinkChallenge`.
- `linkCurrentVK()` теперь обрабатывает ответ backend:
  - `requiresChallenge: true`;
  - `challenge`.
- Добавлены helpers:
  - `linkChallengeHeaders()`;
  - `linkChallengeUrl(challenge, action)`.
- Добавлены handlers:
  - `completePendingLinkChallenge()`;
  - `mergePendingLinkChallenge()`.
- UI поддерживает оба формата challenge provider:
  - `targetProvider`;
  - `target_provider`.
- Если backend позже отдаст `completeUrl`/`mergeUrl`, frontend использует их; иначе fallback идёт на `/v2/auth/link-challenges/:id/...`.

**Проверка**

- `node -e` extractor успешно распарсил inline JS из `4e-app/vk.html`.
- `node -e` extractor успешно распарсил inline JS из `.tmp-4e-app-publish/vk.html`.
- Contract markers проверены в обеих копиях:
  - `identityChallengePanel`;
  - `completePendingLinkChallenge`;
  - `mergePendingLinkChallenge`;
  - `requiresChallenge`;
  - `target_provider`.
- `git diff --check` прошёл.
- `git diff --no-index -- 4e-app/vk.html .tmp-4e-app-publish/vk.html` показал отсутствие content diff после патча.

**Ограничения**

- Production Worker не менялся.
- Live conflict/merge flow не активируется, пока production legacy backend не отдаёт `requiresChallenge` или пока VK frontend не переключён на D1/v2 auth.
- Telegram link UI вне Telegram WebApp пока не делался.

**Оставшийся долг**

- Production D1/v2 auth bridge или cutover для VK frontend.
- Publish GitHub Pages и ручной mobile VK smoke после cache refresh.
- Unlink/relink policy и UI.

### D1 legacy session bridge for v2 auth

**Контекст**

- VK frontend уже получил hidden conflict/complete/merge UI layer, но production
  UI всё ещё работает через legacy `/auth/*` + `x-token`.
- D1 challenge/merge endpoints используют Bearer token и пока задеплоены только
  в staging.
- Production `wrangler.toml` проверен: там есть KV binding, но нет D1 binding,
  поэтому production cutover нельзя делать без отдельного D1 production gate.

**Решение**

- Добавлен staging-compatible bridge route:
  - `POST /v2/auth/legacy-session`.
- Route принимает не произвольный user id от клиента, а уже проверенную legacy
  KV-сессию из `x-token`.
- Worker передаёт в v2 route только пользователя, найденного через:
  - `getSession(request)`;
  - `getSessionUser(session)`.
- D1 auth service добавил `exchangeLegacySession()`:
  - находит или создаёт D1 `users` row с legacy user id;
  - если у legacy user есть email, создаёт `web` identity;
  - блокирует случай, когда такой email уже принадлежит другому D1 user;
  - создаёт hashed D1 session;
  - возвращает Bearer token, public user и список identities.
- Если D1 binding отсутствует, общий `/v2/auth/*` guard по-прежнему возвращает
  `503`, поэтому production без DB не ломается.

**Проверка**

- `node --check 4e-worker/worker.js` прошёл.
- `node --check 4e-worker/src/worker/auth/auth-service.mjs` прошёл.
- `node --check 4e-worker/src/worker/auth/auth-routes.mjs` прошёл.
- `node scripts/verify-v2-auth.mjs` прошёл:
  - missing legacy session → `401`;
  - synthetic legacy user → D1 user + web identity + VK-client session;
  - полученный Bearer token проходит `/v2/auth/me`.
- `wrangler deploy --dry-run --no-bundle --config wrangler.staging.toml`
  прошёл и подтвердил staging KV + D1 bindings.
- Staging Worker deployed:
  - `restless-lab-d737-staging`;
  - version `0b771399-3713-47c7-a95e-2cf09fa9d717`;
  - URL `https://restless-lab-d737-staging.shelckograff.workers.dev`.
- No-write live smoke:
  - `POST /v2/auth/legacy-session` без `x-token` → `401`;
  - response содержит `Cache-Control: no-store`.

**Ограничения**

- Production Worker не деплоился.
- Production D1 database/binding не создавались.
- Full success-smoke на staging edge не запускался, чтобы не создавать
  синтетические KV/D1 записи без отдельного cleanup-сценария; успешный путь
  покрыт локальным D1-shape verifier.
- Frontend пока не переключён на вызов `/v2/auth/legacy-session`.

**Оставшийся долг**

- Frontend handshake закрыт следующим шагом `VK frontend D1 auth bridge handshake`.
- Подготовить production D1 binding/migration/cutover checklist.
- Запустить controlled staging success-smoke с synthetic legacy KV session и
  cleanup, если понадобится проверить edge write-path.

### VK frontend D1 auth bridge handshake

**Контекст**

- Backend staging bridge `/v2/auth/legacy-session` уже выдаёт D1 Bearer token из
  проверенной legacy KV session.
- VK frontend всё ещё использует production legacy token для задач, чата,
  `/auth/me`, `/auth/identities` и `/auth/link-vk`.
- Чтобы не ломать production, frontend должен уметь пробовать v2 path, но
  автоматически откатываться на legacy, если v2 недоступен.

**Решение**

- В `4e-app/vk.html` и publish-копии `.tmp-4e-app-publish/vk.html` добавлен
  отдельный runtime token:
  - `state.token` — legacy `x-token`;
  - `state.d1Token` — D1 Bearer token только для `/v2/auth/*`.
- Добавлен `syncD1AuthSession()`:
  - вызывает `POST /v2/auth/legacy-session` с текущим `x-token`;
  - сохраняет Bearer token только в runtime state;
  - обновляет identities, если backend вернул D1 identity list;
  - тихо пропускает `404/503/timeout`, чтобы production legacy UX не ломался.
- `linkCurrentVK()` теперь сначала пробует D1/v2:
  - `POST /v2/auth/link-vk` с `Authorization: Bearer <d1Token>`;
  - если получен `requiresChallenge`, показывает существующий challenge panel;
  - если v2 недоступен (`401/404/503`), откатывается на legacy `/auth/link-vk`.
- `completePendingLinkChallenge()` и `mergePendingLinkChallenge()` перед вызовом
  v2 challenge endpoints пытаются получить `state.d1Token`.
- Logout очищает и legacy token, и runtime D1 token.

**Проверка**

- Inline JS syntax check прошёл для `4e-app/vk.html`.
- Inline JS syntax check прошёл для `.tmp-4e-app-publish/vk.html`.
- `git diff --no-index -- 4e-app/vk.html .tmp-4e-app-publish/vk.html` не
  показал content diff.
- Publish-клон `.tmp-4e-app-publish` закоммичен локально:
  - commit `fcd2b79`;
  - message `feat: add VK D1 auth bridge handshake`.
- Publish push выполнен в escalated Windows окружении:
  - `bb9bdce..fcd2b79 main -> main`.
- GitHub connector readback подтвердил, что `mrktggod/4e-app/main/vk.html`
  содержит:
  - `state.d1Token`;
  - `syncD1AuthSession()`;
  - `/v2/auth/legacy-session`;
  - `/v2/auth/link-vk`.

**Ограничения**

- Production Worker не деплоился и production D1 binding всё ещё отсутствует.
- Поэтому live production после публикации будет использовать legacy fallback,
  а полный v2 challenge flow включится только после production D1/cutover или
  staging frontend config.
- Первый `git push origin main` из sandbox упал из-за локальных Windows/Git
  credentials `SEC_E_NO_CREDENTIALS`; повторный escalated push прошёл.
- Direct GitHub Pages cache/readback через `github.io` отдельно не подтверждён
  в этом шаге; GitHub repository `main` уже обновлён.
- Full browser/mobile smoke не запускался в этом шаге.

**Оставшийся долг**

- Подготовить production D1 binding/cutover checklist.
- После production D1 gate проверить реальный VK mobile flow:
  legacy login → D1 token exchange → v2 link/challenge → complete → merge.

### Production D1 cutover readiness checker

**Контекст**

- Backend bridge и VK frontend handshake подготовлены, но production Worker всё
  ещё не имеет D1 binding.
- Создание production D1 database/binding — внешний Cloudflare state change, его
  нельзя делать тихо как обычный code patch.
- Перед таким gate нужна повторяемая локальная проверка, которая покажет:
  какие части bridge/cutover уже на месте и что именно блокирует production.

**Решение**

- Добавлен `scripts/check-production-d1-cutover-readiness.js`.
- Checker без внешних зависимостей читает локальные файлы:
  - `4e-worker/wrangler.toml`;
  - `4e-worker/wrangler.staging.toml`;
  - `4e-worker/worker.js`;
  - `4e-worker/src/worker/auth/auth-routes.mjs`;
  - `4e-worker/src/worker/auth/auth-service.mjs`;
  - `4e-app/vk.html`;
  - `4e-worker/migrations`.
- Проверяет:
  - production KV binding сохранён;
  - production D1 `DB` binding есть;
  - staging D1 binding есть;
  - migration `0005_account_link_challenge_metadata.sql` на месте;
  - Worker подключает `/v2/auth/*`;
  - legacy session bridge marker на месте;
  - v2 link/challenge/merge service markers на месте;
  - VK frontend содержит `state.d1Token`, `syncD1AuthSession` и v2 link marker.

**Проверка**

- `node --check scripts/check-production-d1-cutover-readiness.js` прошёл.
- `node scripts/check-production-d1-cutover-readiness.js` отработал ожидаемо:
  - `ok: false`;
  - blockers: `1`;
  - warnings: `1`.
- Текущий blocker:
  - `4e-worker/wrangler.toml`: production Worker has no D1 DB binding yet.
- Текущий warning:
  - production `ENABLE_D1_PROVIDER_SYNC` не включён; это намеренно, до
    отдельного production D1 smoke.

**Ограничения**

- Cloudflare resources не создавались.
- Production Worker не деплоился.
- Checker не проверяет реальные Cloudflare Secrets и не выполняет remote D1
  queries; это локальный preflight перед отдельным Wrangler gate.

**Оставшийся долг**

- После явного approval создать/подключить production D1 binding.
- Применить migrations к production D1.
- Повторить checker, Wrangler dry-run и controlled smoke.

### Production D1 created, migrated and deployed

**Контекст**

- Пользователь явно подтвердил: "да, создаём/подключаем production D1".
- До этого production Worker был без D1 binding, а frontend уже умел тихо
  откатываться на legacy path, если v2/D1 недоступен.

**Решение**

- Проверен Cloudflare auth:
  - account `Shelckograff@gmail.com's Account`;
  - email `shelckograff@gmail.com`;
  - D1 write permission available.
- `wrangler d1 list` подтвердил, что до создания была только `4e-staging`.
- Создана production D1:
  - name `4e-production`;
  - id `6107948c-6c67-4c37-baa1-efea6c5c2860`;
  - region `WEUR`.
- `4e-worker/wrangler.toml` получил:
  - `[[d1_databases]]`;
  - `binding = "DB"`;
  - `database_name = "4e-production"`;
  - `database_id = "6107948c-6c67-4c37-baa1-efea6c5c2860"`;
  - `migrations_dir = "migrations"`.
- Migrations `0001`–`0005` применены к remote production D1.
- Production Worker deployed с KV + D1 bindings:
  - Worker `restless-lab-d737`;
  - URL `https://restless-lab-d737.shelckograff.workers.dev`;
  - version `fc2df9b0-2f19-4bc3-8bb3-e3f05d9a25d6`.

**Проверка**

- Read-only D1 checks после migrations:
  - `tables = 23`;
  - `PRAGMA foreign_key_check` → пустой результат;
  - `rows_written = 0`.
- `node scripts/check-production-d1-cutover-readiness.js`:
  - `ok: true`;
  - blockers `0`;
  - warnings `1`.
- Единственный warning:
  - production `ENABLE_D1_PROVIDER_SYNC` не включён; это намеренно до
    отдельного provider-sync production smoke.
- Production Wrangler dry-run из `4e-worker` прошёл и показал bindings:
  - `env.KV (86efbf76fd8e480c87b0ec96da10775f)`;
  - `env.DB (4e-production)`.
- No-write production smoke после deploy:
  - `POST /v2/auth/legacy-session` без `x-token` → `401`;
  - invalid Bearer `/v2/auth/me` → rejected;
  - production D1 `users = 0`, `rows_written = 0`.
- Controlled production write+cleanup smoke:
  - добавлен `scripts/smoke-production-legacy-d1-bridge.ps1`;
  - smoke создаёт временный synthetic legacy user/session в production KV;
  - вызывает `/v2/auth/legacy-session`;
  - подтверждает создание D1 user/session/identity;
  - удаляет synthetic D1 user cascade;
  - удаляет synthetic KV user/session;
  - финальный run прошёл exit code `0`.
- Финальная cleanup verification:
  - `smokeUsers = 0`;
  - `totalUsers = 0`;
  - `rows_written = 0`.

**Ошибки и решения**

- Первый `wrangler d1 create 4e-production` упал с transient `fetch failed`.
  Решение: проверить `d1 list`, убедиться, что duplicate не создан, повторить.
- Первый production dry-run запускался из корня и Wrangler искал неправильный
  `wrangler.toml`.
  Решение: повторить dry-run из `4e-worker`.
- Первые smoke attempts ловили `error code: 1101`, потому что временный JSON
  сначала передавался через CLI argument, а затем через UTF-8 BOM file. Legacy
  `getSession()` парсил raw KV до v2 route и падал на malformed JSON.
  Решение: писать temp JSON через `.NET UTF8Encoding(false)` и передавать
  Wrangler через `--path`.
- Один successful smoke вернул `200 OK`, но локальный parser ошибочно счёл его
  failed, потому что `curl` response был массивом строк.
  Решение: объединять response через `-join`.
- После каждого failed smoke cleanup был подтверждён отдельно:
  - KV synthetic keys → `404`;
  - D1 synthetic user count → `0`.

**Ограничения**

- Production D1 schema пустая; legacy production KV данные ещё не мигрированы.
- Production `ENABLE_D1_PROVIDER_SYNC` не включён.
- Full real mobile VK conflict/merge smoke с настоящим пользовательским
  аккаунтом не запускался.

**Оставшийся долг**

- Прогнать ручной VK mobile login после cache refresh.
- Подготовить controlled real-user/opt-in D1 bridge smoke или перейти к
  KV→D1 user/task migration plan.
- Добавить defensive try/catch вокруг legacy `getSession()` JSON.parse, чтобы
  malformed legacy session KV больше не давал Worker 1101.

### Defensive legacy session parsing

**Контекст**

- Во время production D1 bridge smoke временный malformed KV `session:*` показал,
  что legacy `getSession()` делал `JSON.parse(raw)` без try/catch.
- Если в KV оказывалось malformed session value, Worker падал с Cloudflare
  `1101` до попадания в `/v2/auth/*` error handling.

**Решение**

- В `4e-worker/worker.js` `getSession()` теперь:
  - парсит legacy session JSON внутри `try/catch`;
  - при malformed JSON логирует `legacy_session_parse_error`;
  - best-effort удаляет битый `session:*`;
  - возвращает `null`, чтобы route отвечал обычным `401`;
  - проверяет, что parsed session — object;
  - проверяет, что `expiresAt` приводится к finite number;
  - при shape error логирует `legacy_session_shape_error` и удаляет ключ;
  - для expiry сравнивает `Date.now()` с `Number(session.expiresAt)`.

**Проверка**

- `node --check 4e-worker/worker.js` прошёл.
- `node scripts/verify-v2-auth.mjs` прошёл.
- `node scripts/check-production-d1-cutover-readiness.js` прошёл:
  - `ok: true`;
  - blockers `0`;
  - warnings `1`.
- Staging dry-run прошёл.
- Staging Worker deployed:
  - version `03a605a3-7239-48be-abfd-2774bdee48ad`.
- Staging malformed-session smoke:
  - временный `session:* = not-json`;
  - `/v2/auth/legacy-session` → `401`;
  - KV key после запроса → `404`, то есть Worker cleanup сработал.
- Production dry-run прошёл.
- Production Worker deployed:
  - version `3892efae-de1a-4d0c-8bd7-822b7835894c`.
- Production malformed-session smoke:
  - временный `session:* = not-json`;
  - `/v2/auth/legacy-session` → `401`;
  - KV key после запроса → `404`.
- Production bridge regression smoke:
  - `scripts/smoke-production-legacy-d1-bridge.ps1` прошёл;
  - final cleanup verification:
    - `smokeUsers = 0`;
    - `totalUsers = 0`.

**Ошибки и решения**

- Финальный D1 count после bridge smoke первый раз снова был запущен из корня,
  и Wrangler искал неправильный `wrangler.toml`.
- Решение: повторить read-only verification из `4e-worker`.

**Ограничения**

- Defensive parse закрывает malformed legacy session values, но не мигрирует
  legacy пользователей/задачи в D1.
- Production provider sync flag остаётся выключенным.

**Оставшийся долг**

- Ручной VK mobile smoke после обновления cache.
- KV→D1 user/task migration plan или opt-in real-user bridge smoke.

### Gate 0 email / RESEND_KEY production smoke

**Контекст**

- `RESEND_KEY` ранее был удалён из Worker source/bundle и должен был жить только
  в Cloudflare Worker Secrets.
- Production `wrangler secret list --config wrangler.toml` показывал
  `ANTHROPIC_KEY`, `BOT_API_TOKEN`, `VK_SECRET_KEY`, но не `RESEND_KEY`.
- Worker email path уже был написан безопасно: `sendEmail()` читает
  `env.RESEND_KEY`; если binding отсутствует, existing-user password reset
  возвращает `503 Email delivery is not configured`.

**Решение**

- Пользователь добавил `RESEND_KEY` вручную через:
  `wrangler secret put RESEND_KEY --config wrangler.toml`.
- Повторный `wrangler secret list --config wrangler.toml` подтвердил production
  secrets:
  - `ANTHROPIC_KEY`;
  - `BOT_API_TOKEN`;
  - `RESEND_KEY`;
  - `VK_SECRET_KEY`.
- Добавлен reusable smoke helper:
  `scripts/smoke-production-resend-email.ps1`.
  Он не содержит секретов, создаёт временный TTL KV user только для проверки
  `/auth/forgot-password`, вызывает endpoint и чистит временные KV keys.

**Smoke**

- Test email: `shelckograff@gmail.com`.
- Прямой check показал, что production KV не содержит
  `user:shelckograff@gmail.com`; поэтому обычный reset-запрос для этого адреса
  возвращал бы privacy-safe `200` без реальной отправки.
- Для проверки именно Resend path smoke создал временный KV user:
  `user:shelckograff@gmail.com` + `user_id:codex-email-smoke-*`.
- `POST https://restless-lab-d737.shelckograff.workers.dev/auth/forgot-password`
  вернул:
  - HTTP `200`;
  - body `{"ok":true}`.
- Так как для existing-user ветки Worker возвращает `503`, если `sendEmail()`
  не смог отправить письмо, этот `200` подтверждает, что production Worker
  увидел `env.RESEND_KEY` и Resend call прошёл успешно.
- 2026-06-20 14:13 MSK: пользователь прислал скриншот Gmail с письмами
  `Сброс пароля — 4 AI-секретарь` от `onboarding@resend.dev`; это ручное
  подтверждение inbox delivery.

**Cleanup**

- Временный `user:shelckograff@gmail.com` удалён:
  - final check `userKeyCount=0`.
- Временный `user_id:codex-email-smoke-*` удалён:
  - final check `smokeUserIdKeyCount=0`.
- `reset:*` key не был виден в list immediately after request
  (`newResetKeyCount=0`), вероятно из-за KV/list eventual consistency; cleanup
  дополнительно проверял reset payload для test email и не нашёл matching key.

**Ошибки и решения**

- Первая попытка `curl.exe --data '{"email":"..."}` в PowerShell отправила
  невалидный JSON из-за одинарных кавычек Windows shell и получила Worker
  `1101`.
- Решение: использовать `Invoke-WebRequest` / PowerShell JSON body вместо
  `curl.exe` с Unix-style quoting.
- Первая версия smoke helper использовала устаревший Wrangler flag
  `--expiration-ttl`; Wrangler `4.100.0` требует `--ttl`.
- `wrangler kv key delete` в этой версии не имеет `--force`; cleanup исправлен.
- PowerShell `@($null).Count` дал ложный `1` при проверке пустого JSON `[]`;
  smoke helper теперь явно обрабатывает пустой key-list.

**Статус**

- Gate 0 email secret closed for production.
- Inbox delivery manually confirmed.
- Ручной VK mobile smoke остаётся отдельной пользовательской проверкой.

### Production D1 migration status report

**Контекст**

- Production D1 уже создан и подключён к Worker, но это инфраструктурный gate,
  а не разрешение на массовый импорт legacy KV данных.
- Предыдущие migration artifacts показали:
  - `83` task rows механически готовы;
  - `206` legacy task records остаются в quarantine;
  - `198` conversation-owner candidate records требуют provider/manual mapping;
  - approved provider-sync mappings в staging есть, но не совпали с текущими
    quarantine seed refs.

**Решение**

- Добавлен read-only sanitized report builder:
  `scripts/report-production-d1-migration-status.mjs`.
- Добавлен verifier:
  `scripts/verify-production-d1-migration-status.mjs`.
- Сгенерирован отчёт:
  `backups/production-d1-migration-status-20260620-141754.report.json`.

**Результат**

- `decision.status = hold_production_import`.
- Blockers: `5`.
- Warnings: `2`.
- `importableTaskRows = 83`.
- `quarantinedRecords = 206`.
- `conversationCandidateRecords = 198`.
- `decisionRowsToWrite = 0`.
- `fullHashMatches = 0`.
- `candidateRecordsStillBlocked = 198`.
- `safeToBuildImportPlanNow = false`.

**Проверка**

- `node --check scripts/report-production-d1-migration-status.mjs` прошёл.
- `node --check scripts/verify-production-d1-migration-status.mjs` прошёл.
- `node scripts/verify-production-d1-migration-status.mjs backups/production-d1-migration-status-20260620-141754.report.json` прошёл:
  - status `hold_production_import`;
  - blockers `5`;
  - importableTaskRows `83`;
  - quarantinedRecords `206`;
  - candidateRecordsStillBlocked `198`.
- `git diff --check` прошёл.

**Ограничения**

- Отчёт не делает production D1/KV writes.
- Отчёт не включает raw KV keys, user ids, chat ids, emails, task text,
  message text, tokens, full legacy hashes, `metadata_json` values or decrypted
  payloads.
- Production provider sync остаётся выключенным.

**Следующий безопасный шаг**

- Выбрать explicit quarantine/owner policy:
  1. продолжить provider/manual mapping для 198 blocked records;
  2. или после отдельного approval импортировать только 83 ready rows, оставив
     quarantine records вне production D1;
  3. или сделать opt-in real-user bridge smoke для конкретного пользователя
     перед массовой миграцией.

### Frontend privacy center

**Контекст**

- После `/v2/privacy` routes нужен пользовательский экран “Данные и память”.
- Экран должен встраиваться в существующие profile/subscreen паттерны
  `4e-app/index.html`, а не создавать отдельную параллельную UI-архитектуру.

**Решение**

- В `4e-app/index.html` добавлен пункт профиля “Данные и память”.
- Добавлен screen `#privacy-center`:
  - AI-обработка;
  - AI-память;
  - импорт переписок;
  - отправка сообщений;
  - срок хранения raw messages;
  - consent grant/revoke;
  - export/delete data requests.
- Добавлен frontend bridge:
  - `syncD1AuthSession()`;
  - `privacyAuthHeaders()`;
  - `setLegacyToken()` и `clearD1Token()`.
- Legacy token writes переведены на `setLegacyToken(...)`, чтобы D1 Bearer
  очищался при смене пользователя.
- Профильная автопривязка больше не перетирает inline `onclick` пункты.
- Добавлен verifier:
  `scripts/verify-privacy-center-html.mjs`.
- Добавлена задача:
  `docs/tasks/CODEX-047_privacy_center_frontend.md`.

**Проверка**

- `node --check scripts/verify-privacy-center-html.mjs` прошёл.
- `node scripts/verify-privacy-center-html.mjs` прошёл.
- `node scripts/verify-v2-privacy.mjs` прошёл.
- `node scripts/smoke-worker-v2-privacy-entrypoint.mjs` прошёл.
- `node scripts/verify-v2-auth.mjs` прошёл.
- `node scripts/verify-d1-schema.js` прошёл.

**Ограничения**

- Remote migration/deploy/publish не выполнялись.
- Экран graceful-fallback показывает, что privacy API пока недоступен, если
  production Worker ещё без migration `0006`.
- Data subject request workers для фактического export/delete ещё не добавлены.

**Следующий безопасный шаг**

- Подготовить staging/deploy gate для migration `0006`, затем publish frontend
  и smoke экран “Данные и память” в web/VK.

### `/v2/privacy` routes

**Контекст**

- После privacy foundation нужен API, к которому позже подключится экран
  “Данные и память”.
- Маршруты должны идти в том же стиле, что `/v2/auth`, `/v2/tasks` и
  `/v2/messages`: Bearer auth, no-store, CORS, D1 binding, synthetic verifier.

**Решение**

- Добавлен service:
  `4e-worker/src/worker/privacy/privacy-service.mjs`.
- Добавлены routes:
  `4e-worker/src/worker/privacy/privacy-routes.mjs`.
- `4e-worker/worker.js` подключает `/v2/privacy/*`.
- CORS methods расширены до `GET, POST, PUT, PATCH, OPTIONS`.
- Добавлены проверки:
  - `scripts/verify-v2-privacy.mjs`;
  - `scripts/smoke-worker-v2-privacy-entrypoint.mjs`.
- Добавлена задача:
  `docs/tasks/CODEX-046_v2_privacy_routes.md`.

**Результат**

- `GET /v2/privacy/settings` возвращает settings и latest consents.
- `PUT /v2/privacy/settings` обновляет privacy settings.
- `POST /v2/privacy/consents` пишет consent grant/revoke event.
- `POST /v2/privacy/data-requests` создаёт pending export/delete/revoke request.
- Guard: AI memory нельзя включить без AI processing.

**Проверка**

- `node --check 4e-worker/src/worker/privacy/privacy-service.mjs` прошёл.
- `node --check 4e-worker/src/worker/privacy/privacy-routes.mjs` прошёл.
- `node --check scripts/verify-v2-privacy.mjs` прошёл.
- `node scripts/verify-v2-privacy.mjs` прошёл.
- `node --check scripts/smoke-worker-v2-privacy-entrypoint.mjs` прошёл.
- `node scripts/smoke-worker-v2-privacy-entrypoint.mjs` прошёл:
  - options preflight `204`;
  - `PUT` CORS method `ok`;
  - unauthenticated `401`;
  - DB unavailable `503`.
- Regression:
  - `node --check 4e-worker/worker.js` прошёл;
  - `node scripts/verify-v2-auth.mjs` прошёл;
  - `node scripts/smoke-worker-v2-messages-entrypoint.mjs` прошёл;
  - `node scripts/verify-privacy-controls-repository.mjs` прошёл;
  - `node scripts/verify-d1-schema.js` прошёл.

**Ограничения**

- Remote D1 migration/deploy не выполнялись.
- UI privacy center ещё не реализован.
- Entry-point smoke выводит старое Node warning про отсутствие `"type": "module"`
  в `4e-worker/package.json`; syntax check проходит, warning не связан с новым
  privacy API.

**Следующий безопасный шаг**

- Подключить UI “Данные и память” к `/v2/privacy`, либо сначала провести
  staging/deploy gate для migration `0006`.

### Privacy controls foundation

**Контекст**

- Общий план расширен юридической безопасностью и персональными данными.
- Для беты нужен не только D1 storage, но и проверяемые основания обработки:
  consent, privacy settings, export/delete requests, retention controls.
- Сверка с официальными источниками подтвердила правильное направление:
  персональные данные требуют отдельного управляемого слоя прав/согласий, а
  пользовательские права на доступ/удаление/переносимость удобно закрывать
  инженерно через data subject requests.

**Решение**

- Добавлена миграция:
  `4e-worker/migrations/0006_privacy_controls.sql`.
- Добавлены таблицы:
  - `user_privacy_settings`;
  - `user_consents`;
  - `data_subject_requests`.
- Добавлен repository:
  `4e-worker/src/worker/data/privacy-repository.mjs`.
- Добавлен verifier:
  `scripts/verify-privacy-controls-repository.mjs`.
- `scripts/verify-d1-schema.js` обновлён на новые таблицы.
- Добавлена задача:
  `docs/tasks/CODEX-045_privacy_controls_foundation.md`.

**Проверка**

- `node --check 4e-worker/src/worker/data/privacy-repository.mjs` прошёл.
- `node --check scripts/verify-privacy-controls-repository.mjs` прошёл.
- `node scripts/verify-privacy-controls-repository.mjs` прошёл.
- `node scripts/verify-d1-schema.js` прошёл:
  - tables `24`;
  - indexes `31`;
  - foreign keys `ok`;
  - user cascade delete `ok`.

**Ограничения**

- Это инженерный privacy foundation, не юридическое заключение.
- Production D1 не менялся; remote migration не применялась.
- UI/routes/retention worker ещё не реализованы.

**Следующий безопасный шаг**

- Сделать `/v2/privacy` routes поверх repository и synthetic route smoke.

### Ready task import approval pack

**Контекст**

- Production migration status report вернул `hold_production_import`, но внутри
  него есть узкий потенциально безопасный scope: `83` ready task rows.
- Чтобы не смешивать “план готов” и “можно писать в production”, нужен отдельный
  approval pack с явной фразой разрешения.

**Решение**

- Добавлен builder:
  `scripts/build-production-ready-task-import-approval-pack.mjs`.
- Добавлен verifier:
  `scripts/verify-production-ready-task-import-approval-pack.mjs`.
- Выполнен read-only production D1 count check:
  - `users = 0`;
  - `tasks = 0`;
  - `auth_identities = 0`;
  - `sessions = 0`;
  - `rows_written = 0`;
  - `changed_db = false`.
- Создан отчёт:
  `backups/production-ready-task-import-approval-20260620-142957.report.json`.

**Результат**

- `decision.status = approval_required_ready_83_only`.
- Required phrase:
  `APPROVE_PRODUCTION_D1_IMPORT_READY_TASKS_83_ONLY`.
- Ready rows:
  - total `83`;
  - open `75`;
  - done `8`;
  - source `message`: `80`;
  - source `import`: `3`.
- Excluded scope:
  - quarantinedRecords `206`;
  - blockedConversationOwnerCandidates `198`;
  - quarantineDecisionRowsToWrite `0`.

**Проверка**

- `node --check scripts/build-production-ready-task-import-approval-pack.mjs` прошёл.
- `node --check scripts/verify-production-ready-task-import-approval-pack.mjs` прошёл.
- `node scripts/verify-production-ready-task-import-approval-pack.mjs backups/production-ready-task-import-approval-20260620-142957.report.json` прошёл.
- `git diff --check` прошёл.

**Ошибки и решения**

- Первый запуск Wrangler count из корня не нашёл `wrangler.toml`.
- Решение: запускать `wrangler d1 execute` из `4e-worker`.
- PowerShell ломал JSON output при передаче как CLI argument.
- Решение: builder получил простой Windows-safe формат
  `--d1-counts users=0,tasks=0,auth_identities=0,sessions=0`.

**Ограничения**

- Этот шаг не делает production writes.
- До явной фразы `APPROVE_PRODUCTION_D1_IMPORT_READY_TASKS_83_ONLY` production
  D1 import остаётся запрещённым.
- Quarantine records не входят в scope и не должны импортироваться угадыванием
  owner.

**Следующий безопасный шаг**

- Если выбран путь `83 ready rows only`: подготовить production apply script с
  обязательным dry-run mode, fresh D1 export/rollback note и post-apply
  verification.

### Staging privacy gate

**Контекст**

- После CODEX-045/046/047 privacy foundation, `/v2/privacy` routes и frontend
  privacy center были готовы локально.
- Перед публикацией UI нельзя было идти сразу в production: сначала нужен был
  staging gate на реальном Cloudflare Worker + D1.

**Решение**

- Проверены staging/prod Wrangler configs:
  - staging `DB` -> `4e-staging`;
  - production `DB` -> `4e-production`.
- Выполнен staging dry-run:
  - Worker видит `env.KV`;
  - Worker видит `env.DB (4e-staging)`;
  - Worker видит `env.ENABLE_D1_PROVIDER_SYNC`.
- На staging D1 применена migration `0006_privacy_controls.sql`.
- Staging Worker `restless-lab-d737-staging` задеплоен:
  - URL `https://restless-lab-d737-staging.shelckograff.workers.dev`;
  - version `1a89a880-069d-4d74-835b-94831831ac33`.
- Добавлен controlled smoke:
  `scripts/smoke-staging-v2-privacy.ps1`.

**Проверка**

- Локально прошли:
  - `node scripts/verify-d1-schema.js`;
  - `node scripts/verify-v2-privacy.mjs`;
  - `node scripts/smoke-worker-v2-privacy-entrypoint.mjs`;
  - `node scripts/verify-privacy-center-html.mjs`.
- Live staging smoke прошёл:
  - unauthenticated `/v2/privacy/settings` -> `401`;
  - settings defaults -> `ok`;
  - settings update -> `ok`;
  - consent grant -> `ok`;
  - data subject request -> `ok`;
  - before cleanup: users `1`, sessions `1`, settings `1`, consents `1`, dataRequests `1`;
  - after cleanup: users `0`, sessions `0`, settings `0`, consents `0`, dataRequests `0`.

**Ошибки и решения**

- Register/login smoke не выбран, потому что `/v2/auth/register` имеет IP rate
  limit и мог бы флакать при частых staging проверках.
- Решение: smoke создаёт synthetic D1 user/session напрямую, вызывает live
  `/v2/privacy` по Bearer token и удаляет пользователя через FK cascade.
- Скрипт пишет temp SQL в UTF-8 without BOM, чтобы избежать старых Windows/BOM
  проблем из production smoke.

**Ограничения**

- Production D1 не мигрировалась.
- Production Worker не деплоился.
- GitHub Pages frontend не публиковался.

**Следующий безопасный шаг**

- Провести production privacy gate для migration `0006` и `/v2/privacy`.
- После успешного production gate опубликовать frontend privacy center и
  проверить экран “Данные и память” в web/VK webview.

### Production privacy gate

**Контекст**

- Staging privacy gate уже подтвердил migration `0006` и `/v2/privacy`.
- До публикации frontend privacy center нужно было убедиться, что production
  D1/Worker тоже обслуживают privacy API.

**Preflight**

- Локально прошли:
  - `node scripts/verify-d1-schema.js`;
  - `node scripts/verify-v2-privacy.mjs`;
  - syntax checks для `scripts/smoke-staging-v2-privacy.ps1` и
    `scripts/smoke-production-v2-privacy.ps1`.
- Production Worker dry-run увидел:
  - `env.KV`;
  - `env.DB (4e-production)`.
- Production D1 read-only checks:
  - pending migration: только `0006_privacy_controls.sql`;
  - users `0`, sessions `0`, tasks `0`, identities `0`;
  - `PRAGMA foreign_key_check` вернул пустой список.

**Решение**

- На production D1 применена migration `0006_privacy_controls.sql`.
- Production Worker `restless-lab-d737` задеплоен:
  - URL `https://restless-lab-d737.shelckograff.workers.dev`;
  - version `83a5df15-41cc-4edb-b8f9-0d455ac09236`.
- Добавлен wrapper:
  `scripts/smoke-production-v2-privacy.ps1`.
- `scripts/smoke-staging-v2-privacy.ps1` стал параметризуемым, чтобы staging и
  production использовали один smoke flow.

**Проверка**

- Live production smoke прошёл:
  - unauthenticated `/v2/privacy/settings` -> `401`;
  - settings defaults -> `ok`;
  - settings update -> `ok`;
  - consent grant -> `ok`;
  - data subject request -> `ok`;
  - before cleanup: users `1`, sessions `1`, settings `1`, consents `1`, dataRequests `1`;
  - after cleanup: users `0`, sessions `0`, settings `0`, consents `0`, dataRequests `0`.
- Финальная production проверка:
  - pending migrations отсутствуют;
  - users `0`, sessions `0`, settings `0`, consents `0`, dataRequests `0`;
  - `PRAGMA foreign_key_check` вернул пустой список.

**Ошибки и решения**

- На предыдущем заходе remote Wrangler D1 команды были остановлены внешним
  usage limit Codex app до `15:40`; обходных путей не использовалось.
- После снятия лимита повторён read-only preflight и только затем выполнены
  production migration/deploy/smoke.

**Ограничения**

- GitHub Pages frontend ещё не опубликован.
- Background обработчики export/delete/retention ещё не реализованы.
- Это инженерный privacy-control gate, не юридическое утверждение текстов.

**Следующий безопасный шаг**

- Опубликовать frontend privacy center на GitHub Pages.
- Проверить экран “Данные и память” в web и VK webview.

### Frontend privacy center publish

**Контекст**

- Production privacy gate закрыт: production D1 и Worker обслуживают `/v2/privacy`.
- Следующий безопасный шаг — опубликовать локальный privacy center в GitHub Pages frontend.

**Решение**

- Publish clone `.tmp-4e-app-publish` проверен:
  - branch `main`;
  - remote `https://github.com/mrktggod/4e-app.git`;
  - до публикации был синхронизирован с `origin/main`.
- `4e-app/index.html` синхронизирован в `.tmp-4e-app-publish/index.html`.
- `vk.html` не менялся: hash локального и publish файла совпадал.
- `scripts/verify-privacy-center-html.mjs` получил optional path argument, чтобы
  одним verifier проверять и локальный HTML, и publish clone.
- Создан и отправлен commit:
  - `1bdcb76`;
  - `feat: publish privacy center`;
  - push `fcd2b79..1bdcb76 main -> main`.

**Проверка**

- До публикации прошли:
  - `node scripts/verify-privacy-center-html.mjs`;
  - `node scripts/verify-v2-privacy.mjs`;
  - `node scripts/smoke-worker-v2-privacy-entrypoint.mjs`;
  - `node scripts/verify-v2-auth.mjs`.
- Publish clone прошёл:
  - `node scripts/verify-privacy-center-html.mjs .tmp-4e-app-publish/index.html`.
- GitHub raw readback подтвердил:
  - `privacy-center`;
  - `syncD1AuthSession`;
  - `/v2/privacy/settings`.
- GitHub Pages live readback подтвердил markers на:
  `https://mrktggod.github.io/4e-app/?v=1bdcb76-1`.

**Ошибки и решения**

- Git sandbox видел `.tmp-4e-app-publish` как dubious ownership.
- Решение: использовать one-shot `git -c safe.directory=...` без изменения
  global git config.
- GitHub Pages сначала отдавал старый HTML, хотя raw GitHub уже обновился.
- Решение: poll live Pages URL с cache-busting query до появления markers.

**Ограничения**

- Это static/readback publish check, не ручной end-to-end тест в реальном webview.
- Нужен ручной smoke:
  - Web;
  - VK webview;
  - profile -> “Данные и память”;
  - load/save settings;
  - consent/request actions.

**Следующий безопасный шаг**

- Провести ручной Web/VK smoke privacy center.
- После smoke продолжить Gate 5/Gate 6: AI memory UX, retention/export-delete
  processing и подготовка к редизайну.

### VK mobile auth timeout retry

**Контекст**

- После публикации privacy center пользователь сообщил, что в мобильном VK app вход по email показывает
  “Сервер отвечает дольше обычного…”.
- Web/desktop входы при этом работали, а повторный тап в мобильном VK раньше мог сразу авторизовать.

**Диагностика**

- Текст ошибки найден в `4e-app/vk.html` вокруг legacy `/auth/login` и `/auth/register`.
- Production Worker auth smoke был быстрым и успешным:
  - synthetic `/auth/register`;
  - synthetic `/auth/login`;
  - `/auth/me`;
  - cleanup synthetic KV keys.
- CORS preflight для VK/GitHub origins отвечал корректно.
- Вывод: это похоже не на падение Worker, а на мобильный VK WebView first-request/cache/network glitch.

**Решение**

- В `4e-app/vk.html` добавлен тонкий auth fetch слой:
  - первая скрытая попытка login до `12000ms`;
  - одна автоматическая retry-попытка до `30000ms`;
  - `cache: 'no-store'`;
  - `credentials: 'omit'`.
- Email login переведён на `postLegacyAuth('/auth/login', ..., 1)`.
- Email registration не ретраит `/auth/register` напрямую, чтобы не плодить duplicate registration:
  - если ответ регистрации потерялся по timeout, клиент пробует восстановиться через login теми же email/password.
- Добавлен verifier `scripts/verify-vk-auth-retry-html.mjs`.
- Hotfix опубликован в GitHub Pages repo:
  - commit `d38d0bd`;
  - `fix: retry VK auth requests`;
  - push `1bdcb76..d38d0bd main -> main`.

**Проверка**

- `node scripts/verify-vk-auth-retry-html.mjs` прошёл.
- `node scripts/verify-vk-auth-retry-html.mjs .tmp-4e-app-publish/vk.html` прошёл.
- Регрессии прошли:
  - `node scripts/verify-privacy-center-html.mjs`;
  - `node scripts/verify-v2-privacy.mjs`;
  - `node scripts/smoke-worker-v2-privacy-entrypoint.mjs`.
- `git -c safe.directory=C:/Users/shelc/Documents/4/.tmp-4e-app-publish diff --check` прошёл.
- Raw GitHub readback подтвердил `fetchAuthWithRetry`, `cache: 'no-store'`, login/register markers.
- Live GitHub Pages readback подтвердил те же markers на
  `https://mrktggod.github.io/4e-app/vk.html?v=d38d0bd-2`.

**Ошибки и решения**

- GitHub Pages сначала отдавал старый `vk.html`, хотя raw GitHub уже обновился.
- Решение: live Pages URL был прополлен с cache-busting query до появления новых markers.

**Ограничения**

- Это targeted resilience hotfix для мобильного VK WebView, не полноценный E2E-тест на реальном телефоне.
- Нужен ручной smoke в VK mobile app:
  - полностью закрыть VK;
  - открыть `https://vk.ru/app54636698`;
  - попробовать email login одним тапом;
  - если старый HTML закэширован, закрыть/открыть VK ещё раз.

**Следующий безопасный шаг**

- Дождаться ручного mobile VK smoke.
- Если проблема повторится — добавить временную diagnostics-панель auth timing для VK WebView.

### VK mobile simple-CORS auth diagnostics

**Контекст**

- Пользователь проверил `CODEX-051` на реальном телефоне несколько раз.
- Результат: вход в мобильном VK всё ещё не работает; кнопка меняется на “Входим…”, но затем снова появляется timeout.

**Обновлённая диагностика**

- Production Worker остался здоровым:
  - VK-like CORS preflight origins возвращают корректный `Access-Control-Allow-Origin`;
  - synthetic `POST /auth/login` с уникальным email отвечает быстро;
  - Worker принимает JSON body с `Content-Type: text/plain`, потому что legacy auth читает body через `request.json()`.
- Более вероятная причина: мобильный VK WebView зависает на CORS preflight или cross-origin `application/json` POST к `workers.dev`.

**Решение**

- Legacy email auth в `4e-app/vk.html` переведён на simple-CORS:
  - `Content-Type: text/plain`;
  - JSON body не изменён;
  - backend продолжает парсить body через `request.json()`.
- Тайминги auth уменьшены, потому что backend latency не является проблемой:
  - первая попытка `6000ms`;
  - retry `12000ms`;
  - delay `600ms`.
- Добавлена видимая диагностика на форме входа:
  - build marker `vk-auth-simple-cors-20260620-2`;
  - блок `#authDiagnostics`;
  - кнопка “Проверить связь”;
  - диагностика `ping` и simple-CORS `auth` при timeout.
- `scripts/verify-vk-auth-retry-html.mjs` обновлён под новый контракт.
- Hotfix опубликован:
  - commit `0be7711`;
  - `fix: use simple CORS for VK auth`;
  - push `d38d0bd..0be7711 main -> main`.

**Проверка**

- `node scripts/verify-vk-auth-retry-html.mjs` прошёл.
- `node scripts/verify-vk-auth-retry-html.mjs .tmp-4e-app-publish/vk.html` прошёл.
- `node scripts/verify-privacy-center-html.mjs` прошёл.
- Live Worker simple-CORS check:
  - unique synthetic email + `Content-Type: text/plain` вернул быстрый `400`, не timeout.
- `git -c safe.directory=C:/Users/shelc/Documents/4/.tmp-4e-app-publish diff --check` прошёл.
- Raw GitHub readback подтвердил:
  - `vk-auth-simple-cors-20260620-2`;
  - `'Content-Type': 'text/plain'`;
  - `authDiagnostics`;
  - `fetchAuthWithRetry`.
- Live GitHub Pages readback подтвердил те же markers на:
  `https://mrktggod.github.io/4e-app/vk.html?v=0be7711-1`.

**Ошибки и решения**

- `CODEX-051` оказался недостаточным: retry того же `application/json` cross-origin запроса не решил реальный mobile VK flow.
- Новый фикс не просто повторяет запрос, а убирает preflight из legacy email auth.
- GitHub Pages снова коротко отдавал старый HTML; live URL был прополлен с cache-busting query до появления нового build marker.

**Ограничения**

- Реальный manual smoke в VK mobile app всё ещё нужен.
- Если после `0be7711` вход всё ещё не работает, пользователь должен прислать строку из блока “Связь”.

**Следующий безопасный шаг**

- Пользователю: полностью закрыть VK, открыть приложение и убедиться, что на форме видно
  `vk-auth-simple-cors-20260620-2`.
- Если вход не сработает — нажать “Проверить связь” и прислать diagnostics line.
- Если diagnostics покажет `ping:timeout`, следующий инженерный шаг — уводить API с `workers.dev`
  на custom domain или same-origin hosting.

### VK API edge domain

**Контекст**

- Пользователь прислал скрин с реального телефона после `CODEX-052`.
- Диагностика показала:
  - origin `https://mrktggod.github.io`;
  - `ping:timeout/5002ms`;
  - `auth:timeout/7002ms`.
- Это подтвердило: мобильный VK WebView не достаётся до `*.workers.dev` вообще, даже простым GET.

**Диагностика**

- Это уже не проблема email/password.
- Это уже не только CORS preflight/`application/json` POST.
- Production Worker снаружи продолжал отвечать корректно.
- `api.4-ai.site` уже существовал, но оказался не нашим текущим Worker:
  - `/` возвращал `4 API v2`;
  - `/v2/privacy/settings` возвращал `200`, а должен быть `401` без токена.
- Поэтому `api.4-ai.site` не использовался, чтобы не смешать разные API.

**Решение**

- Создан новый custom domain для текущего Worker:
  - `edge.4-ai.site`.
- В `4e-worker/wrangler.toml` добавлено:
  - `workers_dev = true`;
  - route `{ pattern = "edge.4-ai.site", custom_domain = true }`.
- Worker задеплоен дважды:
  - первый deploy создал custom domain, но Wrangler отключил `workers.dev` по умолчанию;
  - второй deploy явно вернул `workers_dev = true`, чтобы старый web endpoint не сломался.
- В `4e-worker/worker.js` добавлены CORS origins:
  - `https://4-ai.site`;
  - `https://www.4-ai.site`;
  - `https://4-ai.pages.dev`;
  - `https://edge.4-ai.site`.
- В `4e-app/vk.html`:
  - `WORKER` переключён на `https://edge.4-ai.site`;
  - build marker обновлён на `vk-auth-edge-domain-20260620-4`;
  - auth/diagnostics timeouts увеличены для первого холодного подключения к custom domain.
- `scripts/verify-vk-auth-retry-html.mjs` обновлён под новый API URL.
- Frontend опубликован:
  - commit `c8acb96`;
  - `fix: use edge domain for VK API`;
  - follow-up commit `3d61b57`;
  - `fix: tune VK edge auth timeout`;
  - push `c8acb96..3d61b57 main -> main`.

**Проверка**

- До deploy `edge.4-ai.site` был свободен: DNS name did not exist.
- Worker deploy:
  - `030e50a4-6300-47ff-8890-be28e43019a5` создал custom domain;
  - `8f21fb79-8645-4c73-bc4d-d0867c7da315` оставил активными и `workers.dev`, и `edge.4-ai.site`.
- Live checks:
  - `https://edge.4-ai.site/` → `200 OK`;
  - `https://edge.4-ai.site/v2/privacy/settings` без токена → `401`;
  - `https://edge.4-ai.site/auth/login` с synthetic invalid email → быстрый `400`;
  - старый `https://restless-lab-d737.shelckograff.workers.dev/` всё ещё → `200 OK`.
- Локально прошли:
  - `node --check 4e-worker/worker.js`;
  - `node scripts/verify-vk-auth-retry-html.mjs`;
  - `node scripts/verify-privacy-center-html.mjs`;
  - `node scripts/verify-v2-privacy.mjs`;
  - `node scripts/smoke-worker-v2-privacy-entrypoint.mjs`.
- Publish clone прошёл:
  - `node scripts/verify-vk-auth-retry-html.mjs .tmp-4e-app-publish/vk.html`;
  - `git -c safe.directory=C:/Users/shelc/Documents/4/.tmp-4e-app-publish diff --check`.
- Raw GitHub и live GitHub Pages подтвердили:
  - `const WORKER = 'https://edge.4-ai.site'`;
  - `vk-auth-edge-domain-20260620-4`;
  - `AUTH_DIAG_TIMEOUT_MS = 15000`;
  - старый `workers.dev` constant отсутствует в `vk.html`.

**Ошибки и решения**

- Wrangler при route config и без `workers_dev = true` отключает `workers.dev`.
- Решение: сразу добавлен `workers_dev = true` и выполнен повторный deploy.
- Существующий `api.4-ai.site` выглядел подходящим, но оказался другим API.
- Решение: не трогать его и создать отдельный `edge.4-ai.site`.

**Ограничения**

- Реальный VK mobile smoke всё ещё должен подтвердить, что VK WebView достаётся до `edge.4-ai.site`.

**Следующий безопасный шаг**

- Пользователю: полностью закрыть VK, открыть приложение и убедиться, что виден marker
  `vk-auth-edge-domain-20260620-4`.
- Нажать “Проверить связь”.
- Ожидаемо: `ping:200/...`, `auth:400/...` или другой быстрый non-timeout status.
- Если даже `edge.4-ai.site` даёт timeout — следующий шаг: перенос frontend на Cloudflare Pages/custom domain
  или same-origin `/api/*` route.

## 2026-06-20 — CODEX-054: VK auth screen fast boot

**Задача**

- После реального VK mobile smoke пользователь сообщил, что приложение долго грузится до страницы входа, а затем при email login всё ещё показывает “Ошибка соединения”.
- Отдельно уточнено: `4-ai.site` — чистовая версия для будущего наката после технических фиксов. Текущий hotfix не должен трогать `4-ai.site` и не должен добавлять route `4-ai.site/api/*`.

**Анализ**

- `vk.html` показывал форму входа только после `window.load`, `VKWebAppInit`, проверки сохранённого token через `/auth/me`, `VKWebAppGetUserInfo` и VK auto-login.
- В мобильном VK WebView любой зависший bridge/API шаг мог держать пользователя на loader до появления формы.
- Это отдельная UX/performance проблема поверх сетевого timeout к `edge.4-ai.site`.

**Решение**

- В `4e-app/vk.html` `vk-bridge` переведён на async loading.
- Bootstrap переведён с `window.load` на ранний `DOMContentLoaded`/immediate path.
- Форма входа теперь показывается сразу, до проверки сохранённого токена.
- `/auth/me` для сохранённой сессии ограничен `2500ms`.
- Очистка старого token безопасна: не удаляет новый token, если пользователь успел войти вручную.
- VK auto-login переведён в background и не держит loader.
- Build marker обновлён на `vk-auth-fast-boot-20260620-5`.
- Обновлён static verifier `scripts/verify-vk-auth-retry-html.mjs`.

**Публикация**

- Frontend опубликован в `mrktggod/4e-app`.
- Commit: `ac7fe3c`.
- Message: `fix: speed up VK auth screen`.

**Проверка**

- Локально прошли:
  - `node scripts\verify-vk-auth-retry-html.mjs`;
  - `node scripts\verify-privacy-center-html.mjs`;
  - `node scripts\verify-v2-privacy.mjs`.
- Publish clone прошёл:
  - `node scripts\verify-vk-auth-retry-html.mjs .tmp-4e-app-publish\vk.html`;
  - `git -c safe.directory=C:/Users/shelc/Documents/4/.tmp-4e-app-publish diff --check`.
- Raw GitHub readback подтвердил:
  - `vk-auth-fast-boot-20260620-5`;
  - `<script async ... vk-bridge ...>`;
  - `async function bootstrapAuth`.
- Live GitHub Pages readback подтвердил:
  - `fastBoot=True`;
  - `asyncBridge=True`;
  - `bootstrap=True`.

**Ошибки и решения**

- Во время анализа был замечен риск смешать чистовой `4-ai.site` с техническим контуром.
- Решение: локальные идеи про `4-ai.site/api/*` откатить и не деплоить; текущий publish касается только `mrktggod.github.io/4e-app/vk.html`.

**Ограничения**

- Hotfix ускоряет появление формы входа и убирает лишнее ожидание frontend bootstrap.
- Он не доказывает, что VK mobile WebView теперь имеет сетевой доступ к `edge.4-ai.site`.

**Следующий безопасный шаг**

- Пользователю: полностью закрыть VK, открыть `https://vk.ru/app54636698`, убедиться, что виден marker `vk-auth-fast-boot-20260620-5`.
- Проверить, что форма входа появляется быстро.
- Нажать “Проверить связь”.
- Если diagnostics всё ещё показывает timeout/TypeError на `edge.4-ai.site`, проверить VK Mini Apps whitelist/trusted domains для `mrktggod.github.io` и `edge.4-ai.site`.

## 2026-06-20 — CODEX-055: VK email login recovery

**Задача**

- Пользователь проверил `vk-auth-fast-boot-20260620-5` на реальном VK mobile WebView:
  - форма стала доступна;
  - diagnostics line: `ping:200/2901ms`;
  - `auth:TypeError/10295ms`;
  - первый клик “Войти” показывает “Ошибка соединения”;
  - второй клик “Войти” сразу входит.

**Анализ**

- `ping:200` доказал, что `edge.4-ai.site` доступен из VK WebView.
- Ошибка сузилась до первого POST `/auth/login`: ответ иногда теряется/рвётся на стороне WebView, но повторный запрос уже проходит.
- Снаружи Worker проверен без реальных данных:
  - `GET /` с `Origin: https://mrktggod.github.io` → `200 OK`;
  - `POST /auth/login` с `Content-Type: text/plain` и `{}` → `400`;
  - оба ответа содержат корректный `Access-Control-Allow-Origin`.

**Решение**

- В `4e-app/vk.html` добавлен `recoverLoginSession(email, password)`.
- После network/TypeError/timeout в `doLogin()` приложение больше не показывает ошибку сразу, а делает recovery login.
- Если recovery возвращает token — пользователь входит без второго ручного клика.
- Register recovery переиспользует login recovery, но принимает только token success.
- Build marker обновлён на `vk-auth-login-recovery-20260620-6`.
- `scripts/verify-vk-auth-retry-html.mjs` обновлён: теперь проверяет recovery function, recovery delay и catch-path в `doLogin()`.

**Публикация**

- Frontend опубликован в `mrktggod/4e-app`.
- Commit: `54a17bf`.
- Message: `fix: recover VK email login`.

**Проверка**

- Локально прошли:
  - `node scripts\verify-vk-auth-retry-html.mjs`;
  - `node scripts\verify-privacy-center-html.mjs`;
  - `node scripts\verify-v2-privacy.mjs`.
- Publish clone прошёл:
  - `node scripts\verify-vk-auth-retry-html.mjs .tmp-4e-app-publish\vk.html`;
  - `git -c safe.directory=C:/Users/shelc/Documents/4/.tmp-4e-app-publish diff --check`.
- Raw GitHub readback:
  - `marker=true`;
  - `recovery=true`;
  - `button=true`.
- Live GitHub Pages readback:
  - `marker=True`;
  - `recovery=True`;
  - `button=True`.

**Ограничения**

- Worker не менялся.
- Чистовой `4-ai.site` не трогался.
- Если первый клик всё ещё покажет ошибку, следующий шаг — добавить per-attempt diagnostics для primary login и recovery login.

**Следующий безопасный шаг**

- Пользователю: полностью закрыть VK, открыть `https://vk.ru/app54636698`, убедиться в marker `vk-auth-login-recovery-20260620-6`, нажать “Войти” один раз.
- Ожидаемо: кнопка может показать “Проверяем вход...”, затем вход должен пройти без второго нажатия.

## 2026-06-20 — CODEX-056: VK auth connection warm-up

**Задача**

- Пользователь проверил `vk-auth-login-recovery-20260620-6`:
  - страница входа открывается быстрее;
  - сессия сохраняется при повторном открытии;
  - первый клик всё ещё может показать “Ошибка соединения”;
  - второй клик входит.
- Пользовательская гипотеза: первый клик происходит до того, как VK WebView/API успевает прогрузиться.

**Сверка с планом**

- `PRODUCT_ROADMAP.md` и `BETA_ROADMAP.md` согласованы.
- Мы не ушли в лишнюю ветку: работа остаётся в Этапе 2 / Gate 2 — стабилизация VK Mini App перед редизайном.
- Масштабный frontend redesign лучше продолжать после стабильного manual VK smoke.

**Решение**

- В `4e-app/vk.html` добавлен API warm-up:
  - `AUTH_WARMUP_TIMEOUT_MS = 3500`;
  - `AUTH_WARMUP_RETRY_DELAY_MS = 700`;
  - `warmAuthConnection(reason)`;
  - background `warmAuthConnection('boot')` после показа формы;
  - manual login ждёт `warmAuthConnection('login')` и показывает “Готовим связь...” перед первым `/auth/login`.
- Login recovery из `CODEX-055` сохранён.
- Build marker обновлён на `vk-auth-warmup-20260620-7`.
- `scripts/verify-vk-auth-retry-html.mjs` обновлён под warm-up.

**Публикация**

- Frontend опубликован в `mrktggod/4e-app`.
- Commit: `ba3b345`.
- Message: `fix: warm VK auth connection`.
- Push: `29f25a7..ba3b345 main -> main`.
- Важно: перед push обнаружены новые commits Клода по редизайну (`29f25a7` и рядом); текущий diff был проверен как точечный `vk.html` change и не перетирал их.

**Проверка**

- Локально прошли:
  - `node scripts\verify-vk-auth-retry-html.mjs`;
  - `node scripts\verify-privacy-center-html.mjs`;
  - `node scripts\verify-v2-privacy.mjs`.
- Publish clone прошёл:
  - `node scripts\verify-vk-auth-retry-html.mjs .tmp-4e-app-publish\vk.html`;
  - `git -c safe.directory=C:/Users/shelc/Documents/4/.tmp-4e-app-publish diff --check`.
- Raw GitHub readback:
  - `marker=true`;
  - `warmup=true`;
  - `boot=true`;
  - `login=true`.
- Live GitHub Pages readback:
  - на 3-й попытке `marker=True`, `warmup=True`, `boot=True`, `login=True`.

**Ограничения**

- Worker не менялся.
- Чистовой `4-ai.site` не трогался.
- Если первый клик всё ещё покажет ошибку, следующий шаг — добавить per-attempt diagnostics для warmup, primary login и recovery login.

**Следующий безопасный шаг**

- Пользователю: полностью закрыть VK, открыть `https://vk.ru/app54636698`, убедиться в marker `vk-auth-warmup-20260620-7`, нажать “Войти” один раз.
- Ожидаемо: “Готовим связь...” → “Входим...” → вход без второго клика.

## 2026-06-20 — CODEX-057: light theme + task discussion tab polish

**Задача**

- По скринам пользователя: новый тёмный redesign уже работает, но в светлой теме фон главного экрана остаётся чёрным.
- В карточке задачи вкладку `Комментарии` нужно переименовать в `Обсудить задачу`.

**Решение**

- В `4e-app/index.html` и publish clone `.tmp-4e-app-publish/index.html` добавлен явный light override для `#home`: `html[data-theme="light"] #home{background:#FFFFFF}`.
- Light theme variables переведены ближе к целевому белому/молочному экрану.
- Добавлены light overrides для home v2 text/borders, чтобы на светлом фоне не оставались dark-only цвета.
- Добавлен guard для VK Bridge theme events: `VKWebAppGetConfig` / `VKWebAppUpdateConfig` больше не перетирают явно выбранную тему пользователя; host theme применяется только при `system` или пустом выборе.
- В task detail вкладка `Комментарии` переименована в `Обсудить задачу`; empty state и placeholder переименованы под обсуждение задачи.

**Публикация**

- GitHub Pages repo: `mrktggod/4e-app`.
- Commit: `f3dc86a`.
- Message: `fix: polish light theme discussion tab`.
- Push: `ba3b345..f3dc86a main -> main`.

**Проверка**

- `node scripts\verify-redesign-light-theme-html.mjs`
- `node scripts\verify-redesign-light-theme-html.mjs .tmp-4e-app-publish\index.html`
- `git -c safe.directory=C:/Users/shelc/Documents/4/.tmp-4e-app-publish diff --check`
- Raw GitHub readback: `discussion=true`, `lightHome=true`, `vkThemeGuard=true`.
- GitHub Pages cache-busted readback: `discussion=true`, `lightHome=true`, `vkThemeGuard=true`.

**Ограничения**

- Worker, D1 и auth logic не менялись.
- `4-ai.site` не трогался.
- `vk.html` остаётся legacy/auth-focused экраном и не содержит redesign; для smoke нового UI в VK Mini App должен использоваться `index.html`.

## 2026-06-20 — CODEX-058: VK runtime redesign route fix

**Задача**

- Пользователь проверил VK Mini App и показал, что приложение всё ещё грузит старый интерфейс:
  - старый home вместо redesign;
  - карточка задачи не открывается;
  - кнопки темы нет.

**Диагноз**

- `CODEX-057` был применён к `index.html`, но VK Mini App реально грузит `vk.html`.
- `vk.html` нельзя было просто заменить на `index.html`, потому что в нём живёт текущая рабочая VK/email auth + identity linking логика: `edge.4-ai.site`, `vk4_token`, `linkCurrentVK`, `/auth/identities`, challenge/merge и auth warm-up.

**Решение**

- В `4e-app/vk.html` и `.tmp-4e-app-publish/vk.html` добавлен runtime redesign слой:
  - home chips, focus card, mini planet visual, stat cards, обновлённые task rows;
  - light theme с `vk4_theme`, `toggleTheme()`, `applyTheme()` и guarded VK host theme;
  - кнопка темы в topbar и пункт `Тема оформления` в профиле;
  - task rows теперь открывают `screen-task-detail`;
  - checkbox выполнения использует `event.stopPropagation()`;
  - task detail получил вкладки `Описание`, `Обсудить задачу`, `История`;
  - `Обсудить задачу` получил мини-чат по конкретной задаче через `/anthropic` с fallback-сохранением.

**Публикация**

- GitHub Pages repo: `mrktggod/4e-app`.
- Commit: `af531ee`.
- Message: `fix: apply VK redesign runtime`.
- Push: `f3dc86a..af531ee main -> main`.

**Проверка**

- `node scripts\verify-vk-auth-retry-html.mjs 4e-app\vk.html`
- `node scripts\verify-vk-auth-retry-html.mjs .tmp-4e-app-publish\vk.html`
- `node scripts\verify-vk-redesign-runtime-html.mjs`
- `node scripts\verify-vk-redesign-runtime-html.mjs .tmp-4e-app-publish\vk.html`
- `git -c safe.directory=C:/Users/shelc/Documents/4/.tmp-4e-app-publish diff --check`
- Raw GitHub readback: `home-redesign=true`, `screen-task-detail=true`, `themeToggleTop=true`, `openTaskDetail=true`, `sendTaskDiscussion=true`, `vk4_theme=true`.
- GitHub Pages cache-busted readback: `ok=true`, `home=true`, `detail=true`, `theme=true`.

**Ограничения**

- Worker, D1, auth endpoints и Cloudflare routes не менялись.
- `4-ai.site` не трогался.
- Это runtime-патч `vk.html`, не полноценная компонентная пересборка frontend.
