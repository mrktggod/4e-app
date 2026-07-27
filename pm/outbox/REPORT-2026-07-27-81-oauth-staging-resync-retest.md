status: DONE

# REPORT-2026-07-27-81-oauth-staging-resync-retest

## Коротко

VK ID и Яндекс ID теперь стартуют на staging. До экрана ввода аккаунта провайдеров переход есть. В реальные аккаунты я не входил.

## Что сделал

1. Собрал чистый staging-артефакт из текущей версии `feat/admin-tariff-api` после коммита `1bea145`.
2. Развернул его в Cloudflare Pages project `4-ai-staging`, branch `dev`.
3. Проверил и общий staging-адрес, и прямой адрес новой сборки:
   - `https://4-ai-staging.pages.dev/`
   - `https://749b4408.4-ai-staging.pages.dev/`

Команда staging-развёртывания:

```text
PAGES_WORKER_TARGET=staging npm run build:worker-assets
npx wrangler pages deploy .pages-dist --project-name 4-ai-staging --branch dev
```

Production не трогался. `main` не трогался.

## Raw evidence: общий staging

Before VK click:

```json
{
  "url": "https://4-ai-staging.pages.dev/",
  "platformGlobal": true,
  "platformIsAdapter": true,
  "worker": "https://restless-lab-d737-staging.shelckograff.workers.dev",
  "startOAuthType": "undefined"
}
```

After VK click:

```json
{
  "url": "https://id.vk.com/authorize?response_type=code&client_id=54636698&redirect_uri=https%3A%2F%2F4-ai-staging.pages.dev%2F&scope=vkid.personal_info+email&state=<redacted>&code_challenge=<redacted>&code_challenge_method=S256",
  "authStartStatus": 200,
  "errors": []
}
```

Before Yandex click:

```json
{
  "url": "https://4-ai-staging.pages.dev/",
  "platformGlobal": true,
  "platformIsAdapter": true,
  "worker": "https://restless-lab-d737-staging.shelckograff.workers.dev",
  "startOAuthType": "undefined"
}
```

After Yandex click:

```json
{
  "url": "https://passport.yandex.ru/pwl-yandex?retpath=https%3A%2F%2Foauth.yandex.ru%2Fauthorize%3Fresponse_type%3Dcode%26client_id%3Ddd486526ed154436b51ec6921fff7c3e%26redirect_uri%3Dhttps%253A%252F%252F4-ai-staging.pages.dev%252F%26scope%3Dlogin%253Ainfo%2Blogin%253Aemail%2Blogin%253Aavatar%26state%3D<redacted>%26code_challenge%3D<redacted>%26code_challenge_method%3DS256&noreturn=1&origin=oauth&cause=auth&process_uuid=<redacted>",
  "authStartStatus": 200,
  "errors": []
}
```

## Raw evidence: прямая сборка

Direct URL: `https://749b4408.4-ai-staging.pages.dev/`.

- Before VK/Yandex: `platformGlobal=true`, `platformIsAdapter=true`, `worker=https://restless-lab-d737-staging.shelckograff.workers.dev`.
- VK click redirected to `https://id.vk.com/authorize?...`.
- Yandex click redirected to `https://passport.yandex.ru/pwl-yandex?...`.
- `/auth/vk-id/start` and `/auth/yandex-id/start` both returned HTTP 200.
- No page errors were captured.

## Что Юрию нужно знать

Проблема была похожа на устаревшую staging-сборку. После обновления staging кнопки VK ID и Яндекс ID больше не показывают ошибку "сервис входа временно недоступен", а открывают страницы провайдеров. Полный вход в живые аккаунты не проверялся и остаётся ручной проверкой.

## Проверка

- `node scripts/check-cp1251-mojibake.mjs`: passed, 0 suspicious tokens.
