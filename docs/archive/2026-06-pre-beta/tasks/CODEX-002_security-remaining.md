# CODEX-002 — Оставшиеся P0 безопасности

**Приоритет:** высокий
**Статус:** security-код выполнен; `VK_SECRET_KEY` настроен; valid live VK Mini App login ждёт ручной smoke-test
**Предусловие:** security-части CODEX-001 выполнены; git remote/структура repo остаётся отдельным организационным пунктом.

---

## Контекст

После CODEX-001 Gate 0 будет закрыт по HMAC. Остаются P0-проблемы из технического аудита:
серверная верификация Telegram и VK identity, и CORS.

---

## Задача 1 — Серверная проверка Telegram initData

**Проблема:** Worker сейчас доверяет `user.id` который браузер присылает сам.
Нужно проверять подпись `initData` от Telegram Web App на сервере.

**Что сделать:**
- В Worker добавить верификацию `initData` (HMAC-SHA256 с Bot Token как ключом)
- Проверять `auth_date` — не старше 5 минут
- `/auth/telegram` принимать полный `initData`, не просто `{user}`
- Обновить frontend: передавать `tg.initData`, а не только `tg.initDataUnsafe.user`
- Протестировать на staging перед production

**Фактический статус на 2026-06-19:** выполнено.

- Worker проверяет `Telegram.WebApp.initData` по HMAC-SHA256 алгоритму Telegram Mini Apps.
- Проверяется `auth_date`: не старше 5 минут и не больше 60 секунд в будущем.
- `/auth/telegram` больше не принимает голый `{ telegramId }`/`{ user }` без signed `initData`.
- `/auth/link-telegram` тоже требует signed `initData`.
- Frontend `4e-app/index.html` обновлён: Telegram auto-login и кнопка Telegram login отправляют `initData`.
- Bot-side `x-action: telegram-auth` не изменён, потому что он уже защищён HMAC bot→Worker.
- Локальный тест: `node scripts/verify-telegram-initdata.mjs` проверяет valid/tampered/stale synthetic initData.
- Staging deployed: `4d8ceff2-f6c2-4c6f-91f5-a4289fb0cc91`.
- Production deployed: `45236ba6-3955-46ec-8c17-7268283c1308`.
- Production smoke-test:
  - `POST /auth/telegram {}` → `400`
  - `POST /auth/telegram {"telegramId":"123"}` → `400`
  - `POST /auth/telegram` с fake/stale signed payload → `401`
  - `GET /` → `200`
  - `GET /tasks` без сессии → `401`
  - unsigned bot action `save-task` → `401`

**Ограничение проверки:** валидный live-login нужно отдельно открыть внутри настоящего Telegram WebApp, потому что staging не имеет `BOT_API_TOKEN`, а production secret нельзя читать/использовать для synthetic valid payload.

---

## Задача 2 — Серверная проверка VK launch params

**Проблема:** Worker принимает `vk_user_id` от клиента без верификации.
Нужно проверять подпись VK launch parameters.

**Что сделать:**
- В Worker добавить верификацию VK signed params (HMAC-SHA256 с VK Secret Key)
- Secret Key хранить в Cloudflare Secrets как `VK_SECRET_KEY`
- `/auth/vk` принимать полный query string launch params, проверять подпись
- Обновить `vk.html`: передавать `window.location.search` или `vkBridge` params
- Протестировать на staging

**Фактический статус на 2026-06-19:** security-код выполнен, `VK_SECRET_KEY` настроен, valid live VK Mini App login ждёт ручной smoke-test.

- Worker проверяет VK launch params по HMAC-SHA256 и base64url `sign`.
- В подпись включаются только параметры с префиксом `vk_`, отсортированные по ключу.
- `/auth/vk` больше не принимает голый `{ vk_user_id }` как источник identity.
- Если `VK_SECRET_KEY` не настроен, `/auth/vk` возвращает контролируемый `503`, а не создаёт небезопасную сессию.
- Canonical frontend `4e-app/vk.html` и VK branch в `4e-app/index.html` отправляют `launchParams: window.location.search`.
- Frontend changes опубликованы в `mrktggod/4e-app` commit `5cdfbb945d68209980fba094fb5e5af8f7cd3577`.
- GitHub Pages проверен: публичные `index.html` и `vk.html` отдают `initData`/`launchParams` payloads вместо старых `telegramId`/`vk_user_id`.
- Добавлен локальный тест `scripts/verify-vk-launch-params.mjs`: valid/tampered/missing-sign.
- Staging deployed: `a17a3073-a1f6-4df4-811d-c26e48dc960a`.
- Production deployed: `0b4a6ef6-b026-4fcd-ac26-679ab236949b`.
- Production smoke-test до установки `VK_SECRET_KEY`:
  - `GET /` → `200`
  - `GET /tasks` без сессии → `401`
  - `POST /anthropic` без сессии → `401`
  - `POST /auth/vk {"vk_user_id":"123"}` → `503`
  - `POST /auth/vk {}` → `503`

**Дополнение 2026-06-19:** `VK_SECRET_KEY` добавлен в Cloudflare Worker Secrets пользователем вручную. После проверки обнаружен regression: legacy payload `{ vk_user_id }` возвращал Cloudflare `500/1101`. Добавлен и задеплоен hotfix `97eddb50-0b09-4b4c-9184-d802a65aaa30`: `/auth/vk` безопасно нормализует пустой/битый/legacy JSON и возвращает контролируемый `400`, не создавая сессию. Post-deploy smoke: `GET /` → `200`, hostile CORS origin → `403`, `POST /auth/vk {}` → `400`, `POST /auth/vk {"vk_user_id":"123"}` → `400`. Следующий шаг — valid live smoke-test из VK Mini App, после чего Gate 0 закрыт полностью.

---

## Задача 3 — CORS allowlist

**Проблема:** Worker возвращает `Access-Control-Allow-Origin: *` с credentials — это ошибка браузера и дыра.

**Что сделать:**
- Заменить `*` на точный список: `https://mrktggod.github.io`, `https://vk.com`
- Добавить поддержку `localhost` только в staging/dev окружении
- Протестировать: запрос с неизвестного origin должен получить CORS-ошибку

**Фактический статус на 2026-06-19:** выполнено.

- Worker больше не возвращает `Access-Control-Allow-Origin: *`.
- Allowed origins:
  - `https://mrktggod.github.io`
  - `https://vk.com`
  - `https://m.vk.com`
  - `https://web.telegram.org`
  - `https://webk.telegram.org`
  - `https://webz.telegram.org`
  - production/staging Worker origins
- `localhost` разрешён только для staging/dev Worker host.
- Staging deployed: `b3a33b48-9985-4afe-9162-d3492f85d429`.
- Production deployed: `ab72b8fa-1a70-4c63-9033-152c35923052`.
- Smoke-test:
  - production allowed preflight `Origin: https://mrktggod.github.io` → `204` + matching `Access-Control-Allow-Origin`.
  - production hostile preflight `Origin: https://evil.example` → `403` without `Access-Control-Allow-Origin`.
  - production localhost preflight → `403`.
  - staging localhost preflight → `204`.

---

## После выполнения

- Добавить запись в `DEVELOPMENT_HISTORY.md`
- После добавления `VK_SECRET_KEY` и live VK smoke-test обновить статус Gate 0 в `docs/BETA_ROADMAP.md` → закрыт
- Переходить к Этапу 2 (VK + редизайн) по `docs/PRODUCT_ROADMAP.md`
