# INFRA-005 — RU proxy for VK API access, step 1

**Дата:** 2026-07-05  
**Владелец:** Codex + Алексей  
**Тип:** Infra  
**Приоритет:** P0  
**Статус:** In Progress  
**Рекомендуемая ветка:** `feat/infra-005-yandex-ru-proxy-step1`

## Контекст

VK hosting в белом списке мобильных сетей РФ, `edge.4-ai.site` — нет. Поэтому VK Mini App может открыться, но API-вызовы до Cloudflare worker ломаются на мобильном интернете без VPN.

Шаг 1 не переносит весь backend в Яндекс. Его цель — дать VK-поверхности российскую точку входа, которая честно проксирует запросы на текущий `https://edge.4-ai.site`.

## Что подготовлено в коде

1. `infra/yandex-api-gateway/ru-proxy-openapi.yaml` — готовый OpenAPI spec для Yandex API Gateway:
   - проксирует `/` и `/{path+}`;
   - использует `x-yc-apigateway-integration:http`;
   - пробрасывает исходные headers и query (`"*": "*"`),
   - принудительно ставит upstream `Host: edge.4-ai.site`,
   - не перехватывает CORS preflight на gateway (`origin: false`), чтобы `OPTIONS` шёл в текущий API.
2. `scripts/build-vk-hosting.mjs` теперь принимает `VK_API_BASE_URL` и подменяет `const WORKER = '...'` в `.vk-hosting-dist/index.html` во время сборки VK-артефакта.

## Ручные шаги Алексея

1. Подготовить или подтвердить `folder-id` в Yandex Cloud.
2. Убедиться, что локально доступен и авторизован CLI `yc`.
3. Создать gateway по spec:

```powershell
yc serverless api-gateway create `
  --name 4-ai-ru-proxy `
  --spec infra/yandex-api-gateway/ru-proxy-openapi.yaml `
  --variables backend_origin=https://edge.4-ai.site,backend_host=edge.4-ai.site
```

4. Получить технический домен gateway:

```powershell
yc serverless api-gateway get --name 4-ai-ru-proxy
```

5. Собрать и задеплоить VK hosting уже с российским API-адресом:

```powershell
$env:VK_API_BASE_URL = "https://<gateway-domain>"
npm run deploy:vk-hosting
```

6. Проверить, что `.vk-hosting-dist/index.html` содержит новый API base, а не `https://edge.4-ai.site`.
7. Прогнать phone-smoke VK Mini App без VPN.

## Опционально после шага 1

- Если технический домен gateway подходит, можно жить на нём до отдельного DNS-шага.
- Если нужен красивый адрес (`ru.4-ai.site`), это отдельный ручной слой: DNS + custom domain в Яндексе/сертификат. Для шага 1 не блокирует.

## Не делать в этом шаге

- Не переносить PostgreSQL и весь API в Яндекс.
- Не менять production Telegram Mini App.
- Не трогать `edge.4-ai.site` как основной backend для мира.
