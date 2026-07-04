# Staging contour — `BACK-034`

Короткая памятка по «грязной» версии без касания production.

## 1. Worker staging

- Папка: `<worker-repo-root>`
- Worker name: `restless-lab-d737-staging`
- URL: `https://restless-lab-d737-staging.shelckograff.workers.dev`
- KV: `4e-tasks-staging`
- D1: `4e-staging`
- Команды:

```powershell
npx wrangler d1 migrations apply DB --env staging --remote
npx wrangler deploy --env staging
```

## 2. Mini App dev

- Репозиторий: `<repo-root>`
- Ветка: `dev`
- Pages project: `4-ai-staging`
- Alias: `https://4-ai-staging.pages.dev/`
- В `dev` ветке `index.html` по умолчанию смотрит на staging worker:

```js
const WORKER='https://restless-lab-d737-staging.shelckograff.workers.dev';
```

- Username staging-бота не хранится в репозитории. Для ручного smoke можно открыть dev Mini App с query-параметром:

```text
?bot=<staging_bot_username>
```

Пример:

```text
https://<dev-mini-app-url>/?bot=MyStagingBot
```

Тогда кнопка `Войти через Telegram` откроет нужного бота без нового коммита.

Если staging worker пока не умеет вернуть `startToken`, `dev`-ветка всё равно открывает Telegram-бота напрямую как fallback. Дальше вход продолжается через кнопку `web_app` в самом боте.

## 3. Secrets staging

Проверено:

- в staging worker уже есть `BOT_API_TOKEN`;
- для полного AI smoke нужны те же secrets, что и в prod worker, как минимум `ANTHROPIC_KEY`.

Проверка secrets:

```powershell
npx wrangler secret list --env staging
```

Если секрета не хватает, Юрий добавляет его вручную, не вставляя значение в репозиторий:

```powershell
npx wrangler secret put ANTHROPIC_KEY --env staging
npx wrangler secret put OPENAI_KEY --env staging
npx wrangler secret put RESEND_KEY --env staging
npx wrangler secret put VK_SECRET_KEY --env staging
```

## 4. Если нужен polling-бот локально

Node-бот в `4e-worker/src/bot/` читает переменные окружения, а не secrets Worker:

- `BOT_TOKEN`
- `ANTHROPIC_API_KEY`
- `WORKER_URL`
- `MINI_APP_URL`

Минимальный запуск:

```powershell
$env:BOT_TOKEN='<Юрий вставляет сам>'
$env:ANTHROPIC_API_KEY='<Юрий вставляет сам>'
$env:WORKER_URL='https://restless-lab-d737-staging.shelckograff.workers.dev'
$env:MINI_APP_URL='https://<dev-mini-app-url>/'
node src/bot/index.js
```

## 5. Smoke checklist

1. `GET /` на staging worker возвращает `200 OK`
2. `d1 migrations list DB --env staging --remote` пустой после apply
3. dev Mini App открывается отдельно от production
4. dev Mini App ходит только в staging worker
5. `Войти через Telegram` открывает staging-бота через `?bot=<username>`
