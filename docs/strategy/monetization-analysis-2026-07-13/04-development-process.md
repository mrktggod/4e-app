# 4. Процесс разработки без лишних действий

## 4.1. Главный bottleneck процесса

Проблема не в длинных сессиях. Проблема в том, что длинная работа не заканчивается коротким воспроизводимым release cycle.

Сейчас путь выглядит так:

`много кода в накопительной ветке → часть manual/direct staging deploy → статус Done/Ready for QA → main и production отстают → следующий слой кода`

Целевой путь:

`цель спринта → code checkpoints → автоматический staging → один human packet → integration review → main → production smoke → Done`

Длинная сессия может пройти весь путь и продолжаться столько, сколько полезно. Искусственная остановка после каждого микрошагa не нужна.

## 4.2. Реальные рабочие поверхности

| Поверхность | Роль | Решение |
|---|---|---|
| `Documents\4\.tmp-4e-app-publish` | Канонический app repo | Оставить рабочим |
| `Documents\4\4e-worker` | Канонический worker repo | Оставить рабочим |
| `Documents\4\4e-bot-repo` | Bot repo | Оставить, отдельно проверить актуальность runtime |
| `Documents\4\4e-app` | Копия без `.git` | Не работать; позже архивировать после diff |
| `Desktop\4\Версия\4e-app` | Независимая грязная копия | Только источник уникальных материалов до миграции |
| `Desktop\4\Версия\4e-worker` | Копия с ошибочным remote | Не использовать до отдельного разбора |
| `Documents\4` root git | Unborn repo без коммитов | Не считать repo; удаление только отдельным подтверждённым действием |

Нельзя удалять копии импульсно: сначала snapshot/diff и перенос уникальных промо/документов. После этого неконанические копии переводятся в read-only archive.

## 4.3. Накопительные ветки

`feat/admin-tariff-api` больше не feature branch:

- app: 142 коммита впереди `origin/main`, 46 файлов, примерно `+8838/-2188`;
- worker: 24 коммита впереди `origin/main`, 7 файлов, примерно `+2069/-62`;
- внутри смешаны независимые product, auth, payment, referral, analytics, infra и QA изменения.

Разбирать историю обратно на десятки идеальных PR сейчас дороже, чем сделать один контролируемый integration release. Но продолжать добавлять новые области ещё дороже.

### Одноразовая стабилизация

1. Завершить или feature-flag текущий минимальный `HOME-001`.
2. Зафиксировать app/worker release candidate SHA.
3. Получить diff-by-area, а не читать 142 коммита по одному.
4. Закрыть security/release P0.
5. Пройти staging packet.
6. Создать один integration PR для app и один для worker с честным scope.
7. После merge обновить все новые ветки от `main`.

### После стабилизации

Ветка соответствует одной измеримой цели спринта, но внутри может содержать несколько зависимых задач. Например:

`feat/activation-first-plan` = HOME-minimal + ONBOARD-001 + activation events.

Это совместимо с длинной сессией и убирает микроветки на каждую строку.

## 4.4. CI и deploy

### Подтверждённые поломки

1. App `Path guard` падает, потому что runner не содержит `rg`; скрипт после этого ошибочно считает все счётчики нулевыми и сообщает ложные архитектурные нарушения.
2. Последние worker `Deploy Worker` падают: в GitHub Actions нет доступного `CLOUDFLARE_API_TOKEN` для non-interactive wrangler.
3. App API smoke на PR обращается к production worker и создаёт production test accounts; cleanup удаляет задачу, но не аккаунты.
4. App staging deploy не является штатным автоматическим шагом; использовались временные direct deployment artifacts.
5. Production deploy workflows привязаны к `main`, а основная работа живёт далеко впереди `main`.

### Минимальный pipeline

```text
push/PR
  → encoding/path/UI/JS/build guards
  → worker unit/API smoke локально или на staging
  → auto deploy app + worker staging
  → smoke со staging test users и cleanup
  → human-only checklist, если есть mobile/payment/RF label
  → approve + merge main
  → production deploy
  → post-deploy smoke с commit/deployment evidence
  → Done
```

### Статусы вместо двусмысленного Done

- `Todo`
- `In Progress`
- `Code Ready`
- `Staging Passed`
- `Human QA Passed`
- `Merged`
- `Production Passed / Done`
- `Blocked — human/external`

`Ready for QA` без окружения и owner недостаточен.

## 4.5. Документы: что оставить источником правды

Сейчас одна информация дублируется в roadmap, backlog, bugs, QA, WORK_LOG, DEVELOPMENT_LOG и team-sync. Статусы расходятся, FILE_MAP устаревает, а агент читает тысячи строк перед микроправкой.

Целевой контур:

| Документ | Роль | Частота |
|---|---|---|
| `shared/ROADMAP.md` | Стратегические решения и горизонты | Еженедельно/по decision gate |
| `pm/backlog.md` | Единый реестр задач и текущий статус | По изменению задачи |
| `pm/NOW.md` | Максимум три активные lanes + human packet | Ежедневно/по спринту |
| `pm/bugs.md` | Только незакрытые дефекты и ссылки на task | По багу |
| `shared/WORK_LOG.md` | Один digest результата с evidence | В конце спринта/дня, не каждый микрошаг |
| `DEVELOPMENT_LOG.md` | Только важные архитектурные/операционные решения | По необходимости |
| `pm/team-sync.md` | Последний handoff между людьми | После передачи |

Не нужно писать один и тот же статус в пять файлов. Backlog хранит статус; WORK_LOG — доказательство; roadmap — решение.

## 4.6. Правила длинной сессии

### Оставляем

- длинный uninterrupted спринт;
- последовательные зависимые шаги;
- несколько маленьких commit checkpoints;
- продолжение до реального результата или human blocker;
- автоматическую работу, пока человек недоступен.

### Добавляем

1. В начале: одна строка результата спринта.
2. Перед каждым новым слоем: проверка, не расширяется ли цель.
3. Каждые несколько законченных шагов: commit с рабочим состоянием.
4. После code milestone: staging/automation, а не новая фича.
5. В конце: один status packet — SHA, deployment, tests, failures, human next actions.

### Убираем

- новую сессию для каждого зависимого микрошагa;
- повторный полный onboarding в пределах одного спринта;
- обязательную ручную backup-копию файла, если рабочая ветка и clean checkpoint уже есть;
- двойной шаблон WORK_LOG в `AGENTS.md`;
- устаревший список открытого техдолга в `AGENTS.md`;
- чтение всего WORK_LOG/DEVELOPMENT_LOG вместо последних digest + mapped task docs.

## 4.7. WIP без запрета долгих сессий

Ограничивается не время, а количество одновременно незавершённых результатов:

- Lane A — release/reliability;
- Lane B — activation/product;
- Lane C — human QA/decision packet.

Внутри Lane B можно долго разрабатывать HOME + onboarding + analytics, если они составляют один activation slice. Нельзя одновременно добавлять CAL-002, MAX, offline mode и weekly Wrapped.

## 4.8. Human blockers

Ручные задачи не должны останавливать автоматическую работу по одной. Они собираются в один пакет с URL, аккаунтом, ожидаемым результатом и полем evidence.

На 14 июля пакет включает:

- Telegram web fallback;
- Telegram WebView voice;
- mobile/safe-area/keyboard;
- HOME смысловой smoke;
- РФ-доступность;
- test accounts;
- выбранные платёжные live flows;
- referral two-user flow после готовности.

Подробный порядок: [06-manual-sprint-2026-07-14.md](06-manual-sprint-2026-07-14.md).

## 4.9. Что перестать делать сразу

- Работать из неконанической app/worker копии.
- Добавлять новые области в `feat/admin-tariff-api` после фиксации release slice.
- Считать staging/direct smoke эквивалентом production shipped.
- Гонять PR smoke против production с созданием неочищаемых аккаунтов.
- Делать ручной staging deploy штатным механизмом.
- Продолжать новые каналы до beta/платежа.
- Обновлять одну и ту же формулировку в пяти журналах.
- Хранить `pending` там, где уже есть commit/deployment evidence.
- Смешивать `VIRAL-005` и `ONBOARD-001` как две разработки.
