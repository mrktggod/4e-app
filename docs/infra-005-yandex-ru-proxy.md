# INFRA-005 — runbook для RU API proxy

Этот runbook нужен для быстрого поднятия промежуточного российского API-адреса для VK Mini App, пока основной backend остаётся на Cloudflare Workers.

## Что уже готово

- OpenAPI spec: [infra/yandex-api-gateway/ru-proxy-openapi.yaml](../infra/yandex-api-gateway/ru-proxy-openapi.yaml)
- VK build с параметром `VK_API_BASE_URL`: [scripts/build-vk-hosting.mjs](../scripts/build-vk-hosting.mjs)
- Операционная задача: [docs/tasks/INFRA-005-yandex-ru-proxy-step1.md](tasks/INFRA-005-yandex-ru-proxy-step1.md)
- Yandex API Gateway создан: `ai-ru-proxy`
- Технический домен gateway: `https://d5dg7uthvqp4ebomg3rl.ccx97b51.apigw.yandexcloud.net`

## Команды

Создать gateway:

```powershell
yc serverless api-gateway create `
  --name 4-ai-ru-proxy `
  --spec infra/yandex-api-gateway/ru-proxy-openapi.yaml `
  --variables backend_origin=https://edge.4-ai.site,backend_host=edge.4-ai.site
```

Обновить существующий gateway:

```powershell
yc serverless api-gateway update `
  --name 4-ai-ru-proxy `
  --spec infra/yandex-api-gateway/ru-proxy-openapi.yaml `
  --variables backend_origin=https://edge.4-ai.site,backend_host=edge.4-ai.site
```

Собрать VK artifact с новым API base:

```powershell
$env:VK_API_BASE_URL = "https://<gateway-domain>"
npm run build:vk-hosting
```

Задеплоить VK hosting:

```powershell
$env:VK_API_BASE_URL = "https://<gateway-domain>"
npm run deploy:vk-hosting
```

Текущий статус деплоя VK hosting: сборка проходит, `.vk-hosting-dist/index.html` получает новый API base, сохранённый VK token найден в configstore, version `1783760421` загружена. Dev URLs обновлены на `https://stage-app54636698-6d0441567e74.pages.vk-apps.com/index.html`. Production deploy остановился на ручном подтверждении VK: `Please, enter code from Administration`.

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

- Ручной VK deploy confirm code из Administration для production deploy.
- Mobile smoke из РФ-сети без VPN.
