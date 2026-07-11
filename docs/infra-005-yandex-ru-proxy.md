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

- `folder-id` / доступ к Yandex Cloud.
- Технический домен gateway после создания.
- Ручной VK deploy confirm code.
- Mobile smoke из РФ-сети без VPN.
