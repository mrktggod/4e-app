# REPORT BRIEF-2026-07-29-99z prod Playwright+k6

status: DONE
date: 2026-07-29
branch: feat/admin-tariff-api
base_url: https://app.4-ai.site
edge_url: https://edge.4-ai.site

## Scope

По явному подтверждению Юрия выполнен полный prod smoke-прогон текущими сценариями проекта:

- `test:e2e:web`
- `test:e2e:telegram`
- `test:e2e:vk`
- `load:smoke`

Merge/deploy не выполнялись. Проверки запускались против `https://app.4-ai.site`.

## Results

### Web

Command:

```powershell
$env:BASE_URL='https://app.4-ai.site'; npx playwright test autotests/tests/web --reporter=line --workers=1
```

Result: PASS, 16/16.

Покрыто текущим набором: auth legal links, mobile touch targets, app shell, privacy route, ask composer/voice entrypoint, keyboard spacing, home/global navigation safe area on mobile and desktop Chromium.

Итог: по текущему Playwright-набору критичных визуальных или технических регрессий на web-prod не найдено.

### Telegram

Command:

```powershell
$env:BASE_URL='https://app.4-ai.site'; npx playwright test autotests/tests/telegram-app --reporter=line --workers=1
```

Result: PASS, 2/2.

Покрыто текущим набором: Telegram Mini App opens with mocked host data on mobile and desktop Chromium.

Итог: клиентская Telegram-оболочка проходит smoke, но это mock-host проверка, не реальная проверка внутри клиента Telegram.

### VK

Command:

```powershell
$env:BASE_URL='https://app.4-ai.site'; npx playwright test autotests/tests/vk-app --reporter=line --workers=1
```

Result: PASS, 4/4.

Покрыто текущим набором: VK Mini App opens with mocked launch params; mocked navigation covers home, detail, ask, calendar, stats and profile on mobile and desktop Chromium.

Итог: клиентская VK-оболочка и основные mock-навигации проходят smoke, но это mock-launch/mock-API проверка, не полноценный прогон внутри VK клиента.

### k6 load smoke

Command:

```powershell
$env:BASE_URL='https://app.4-ai.site'; npm run load:smoke
```

Result: PASS.

Key metrics:

- VUs: 3
- Duration: 10s
- Requests: 42
- Checks: 42/42 passed
- Failed requests: 0.00%
- `http_req_duration p95`: 644.62ms
- Thresholds: `http_req_failed rate<0.01` passed; `http_req_duration p95<1000` passed
- Checked routes: `/index.html`, `/vk.html`, `/privacy.html`

Итог: короткий prod static smoke выдержан без HTTP-ошибок и без превышения p95-порога.

## Findings

Критичных падений по текущим автоматическим проверкам нет.

Главное ограничение: Telegram и VK сейчас проверяются через mocked host data / mocked launch params. Это хорошо ловит регрессии клиентской оболочки, но не заменяет отдельный ночной прогон через реальные платформенные клиенты/host-контексты.

## Recommended sprint follow-up

1. Добавить ночной matrix-прогон: web prod smoke, telegram mock smoke, vk mock smoke, k6 smoke.
2. Разделить отчёт по поверхностям: Web, Telegram, VK, Load.
3. Следующим слоем добавить real-host ручку или полуавтомат для Telegram/VK, потому что текущий Playwright не подтверждает поведение внутри реальных клиентов.
4. Подключить агентную перекрёстную проверку: один агент запускает тесты и пишет факты, второй проверяет покрытие/слепые зоны и создаёт follow-up brief.
