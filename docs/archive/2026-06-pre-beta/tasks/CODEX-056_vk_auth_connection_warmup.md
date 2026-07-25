# CODEX-056 — VK auth connection warm-up

Дата: 2026-06-20
Статус: опубликовано в GitHub Pages

## Контекст

После `CODEX-055` пользователь повторно проверил VK mobile WebView:

- экран входа открывается быстрее;
- сессия сохраняется при повторном открытии приложения;
- первый клик “Войти” всё ещё может показать “Ошибка соединения”;
- второй клик входит;
- пользовательская гипотеза: первый клик происходит до того, как WebView/API успевает полностью прогрузиться.

Скрин показал marker `vk-auth-login-recovery-20260620-6`, кнопку “Входим...” и diagnostics:

- `ping:timeout/15001ms`;
- `auth:TypeError/1350ms`.

## Вывод

Симптом уже не похож на постоянную серверную ошибку: повторный вход и сохранение сессии работают. Вероятнее всего, первый manual POST уходит слишком рано относительно прогрева мобильного WebView/network stack.

По общему плану это всё ещё Этап 2 / Gate 2: стабилизировать VK Mini App до большого редизайна. Переходить к масштабному frontend redesign до стабильного входа рискованно.

## Решение

В `4e-app/vk.html` добавлен короткий прогрев API:

- marker обновлён на `vk-auth-warmup-20260620-7`;
- добавлены `AUTH_WARMUP_TIMEOUT_MS = 3500` и `AUTH_WARMUP_RETRY_DELAY_MS = 700`;
- добавлена функция `warmAuthConnection(reason)`;
- при показе формы запускается background `warmAuthConnection('boot')`;
- при manual login первый клик сначала показывает “Готовим связь...” и ждёт `warmAuthConnection('login')`;
- затем отправляет `/auth/login`;
- существующий login recovery остаётся на месте.

## Публикация

- Репозиторий: `mrktggod/4e-app`
- Commit: `ba3b345`
- Message: `fix: warm VK auth connection`
- Push: `29f25a7..ba3b345 main -> main`
- Live URL: `https://mrktggod.github.io/4e-app/vk.html`

## Проверка

Пройдены проверки:

- `node scripts\verify-vk-auth-retry-html.mjs`
- `node scripts\verify-privacy-center-html.mjs`
- `node scripts\verify-v2-privacy.mjs`
- `node scripts\verify-vk-auth-retry-html.mjs .tmp-4e-app-publish\vk.html`
- `git -c safe.directory=C:/Users/shelc/Documents/4/.tmp-4e-app-publish diff --check`
- Raw GitHub readback: `marker=true`, `warmup=true`, `boot=true`, `login=true`.
- Live GitHub Pages readback: на 3-й попытке `marker=True`, `warmup=True`, `boot=True`, `login=True`.

## План-сверка

`PRODUCT_ROADMAP.md` и `BETA_ROADMAP.md` согласованы:

- мы не ушли в лишнюю ветку;
- текущая работа остаётся в Этапе 2 / Gate 2;
- следующий переход к редизайну стоит делать после ручного smoke `vk-auth-warmup-20260620-7`.

## Ручной smoke

1. Полностью закрыть VK.
2. Открыть `https://vk.ru/app54636698`.
3. Убедиться, что marker `vk-auth-warmup-20260620-7`.
4. Ввести email/password.
5. Нажать “Войти” один раз.
6. Ожидаемо: кнопка может коротко показать “Готовим связь...”, затем “Входим...”, затем приложение входит без второго клика.

Если первый клик всё ещё покажет ошибку, следующий шаг — добавить per-attempt diagnostics для warmup, primary login и recovery login прямо в diagnostics line.
