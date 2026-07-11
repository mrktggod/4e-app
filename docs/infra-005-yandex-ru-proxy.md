# INFRA-005 — runbook для RU API proxy

Этот runbook нужен для быстрого поднятия промежуточного российского API-адреса для VK Mini App, пока основной backend остаётся на Cloudflare Workers.

## Что уже готово

- OpenAPI spec: [infra/yandex-api-gateway/ru-proxy-openapi.yaml](/C:/Users/shelc/Documents/4/.tmp-4e-app-publish/infra/yandex-api-gateway/ru-proxy-openapi.yaml)
- VK build с параметром `VK_API_BASE_URL`: [scripts/build-vk-hosting.mjs](/C:/Users/shelc/Documents/4/.tmp-4e-app-publish/scripts/build-vk-hosting.mjs)
- Операционная задача: [docs/tasks/INFRA-005-yandex-ru-proxy-step1.md](/C:/Users/shelc/Documents/4/.tmp-4e-app-publish/docs/tasks/INFRA-005-yandex-ru-proxy-step1.md)
- Yandex API Gateway создан: `ai-ru-proxy`
- Технический домен gateway: `https://d5dg7uthvqp4ebomg3rl.ccx97b51.apigw.yandexcloud.net`

## Команды

Создать gateway:

```powershell
yc serverless api-gateway create `
  --name ai-ru-proxy `
  --spec infra/yandex-api-gateway/ru-proxy-openapi.yaml `
  --variables backend_origin=https://edge.4-ai.site,backend_host=edge.4-ai.site
```

Обновить существующий gateway:

```powershell
yc serverless api-gateway update `
  --name ai-ru-proxy `
  --spec infra/yandex-api-gateway/ru-proxy-openapi.yaml `
  --variables backend_origin=https://edge.4-ai.site,backend_host=edge.4-ai.site
```

Собрать VK artifact с новым API base:

```powershell
$env:VK_API_BASE_URL = "https://d5dg7uthvqp4ebomg3rl.ccx97b51.apigw.yandexcloud.net"
npm run build:vk-hosting
```

Задеплоить VK hosting:

```powershell
$env:VK_API_BASE_URL = "https://d5dg7uthvqp4ebomg3rl.ccx97b51.apigw.yandexcloud.net"
npm run deploy:vk-hosting
```

Текущий статус деплоя VK hosting: сборка проходит, `.vk-hosting-dist/index.html` получает новый API base, но `vk-miniapps-deploy` в non-interactive запуске остановился на `access_token is missing`. Нужен VK deploy token / ручной deploy session.

## Проверки

1. Локально проверить артефакт:

```powershell
Select-String -Path .vk-hosting-dist/index.html -Pattern 'https://'
```

2. Убедиться, что в артефакте нет старого base:

```powershell
Select-String -Path .vk-hosting-dist/index.html -Pattern 'edge.4-ai.site'
```

3. После деплоя пройти VK phone-smoke без VPN:
   - вход;
   - загрузка задач;
   - открытие карточки;
   - AI/любой auth ping.

## Остаток ручных блокеров

- VK deploy token / авторизованная deploy-сессия для `vk-miniapps-deploy`.
- Ручной VK deploy confirm code, если VK запросит подтверждение.
- Mobile smoke из РФ-сети без VPN.
