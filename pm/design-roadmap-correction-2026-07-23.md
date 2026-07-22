# Корректировка design-roadmap — 2026-07-23

Статус: PROPOSAL / runtime не изменялся

## Главный вывод

Редизайн нельзя считать завершённым одним общим статусом. Текущий desktop/browser smoke подтверждает устойчивую главную на 390×844, но ручные iPhone/TMA-скриншоты доказывают три P1-дефекта task-detail, а два разных контракта нижней навигации создают платформенную регрессию. Следующая волна должна идти маленькими brief-ами с отдельным visual gate для каждой поверхности.

## Здоровье экранов

| Слой | Статус | Доказательство | Что закрывает |
| --- | --- | --- | --- |
| Главная | PASS-AUTOMATED / NEEDS-LATEST-VISUAL | smoke:home001 2026-07-23: 390×844, dark/light, 3 строки, 4 метрики, overflow=0 | Новый screenshot focus summary на точном preview |
| Фокус-панель | PARTIAL | текущий код рендерит summary и 3 задачи; старый BLOCKED-CONCURRENT-WORK больше не соответствует чистой ветке | BRIEF-DESIGN-FOCUS-VISUAL-001 |
| AI-chat | PARTIAL | короткая история сохраняется; окно источника ограничено последними 40 сообщениями без pagination | BRIEF-DESIGN-LIGHT-CHAT-001 + отдельное решение по истории |
| Chats / chat-conv | PARTIAL | функции и light overrides есть, но актуального dark/light/mobile visual sweep нет | BRIEF-DESIGN-LIGHT-CHAT-001 |
| Task-detail reminder | FAIL-P1 | iPhone/TMA: selector времени не нажимается; в index.html select вложен в button | BRIEF-DESIGN-P1-REMINDER-001 |
| Task-detail tag popup | FAIL-P1 | iPhone/TMA: input+datalist и клавиатура перекрывают hero | BRIEF-DESIGN-P1-TAG-001 |
| Task-detail hero | FAIL-P1 | длинные tag/title заходят под срок и priority; текст обрезается | BRIEF-DESIGN-TASK-HERO-001 |
| Profile | PARTIAL | ручной screenshot показывает нижний фон/резерв; avatar QA заблокирован отключённым UI | BRIEF-DESIGN-PROFILE-001 после P1 |
| Bottom nav / safe area | FAIL-MANUAL / PASS-HOME-AUTO | home-smoke зелёный, но ручные home/profile screenshots показывают лишний слой; home и global nav имеют разные action-set | BRIEF-NAV-CONTRACT-001 и BRIEF-NAV-SAFE-AREA-001 |
| Light theme | PARTIAL | home-smoke зелёный; chat/light правила существуют, но ручной intake частично устарел и не перепроверен | BRIEF-DESIGN-LIGHT-CHAT-001 |
| Service worker / cache | PARTIAL | network-first есть, cache version фиксирован; controllerchange не перезагружает клиент | BRIEF-SW-CACHE-001 |

## Почему task-detail остаётся хрупким

- styles/screens/tasks.less содержит 33 selector-вхождения detail-redesign-hero и несколько поздних override-слоёв.
- Hero принудительно фиксировался по высоте, а tag/title и правые metadata-cards живут в конкурирующих absolute/clamp правилах.
- index.html:462 содержит интерактивный select внутри button и параллельный custom popover.
- index.html:464 использует нативный datalist внутри абсолютной tag-панели, поэтому поведение зависит от WebView и клавиатуры.

Это не повод для широкого редизайна. Нужен один устойчивый layout contract: обычный document flow для title/tag, отдельная правая metadata-column только при достаточной ширине и sheet/popover вне hero для редактирования.

## Порядок работ

### 1. P1 manual blockers

1. BRIEF-DESIGN-P1-REMINDER-001 — разделить trigger, hidden/native select и popover; один hit target не меньше 44×44; проверить iPhone TMA, Android TMA и browser.
2. BRIEF-DESIGN-P1-TAG-001 — заменить datalist-overlay на управляемый sheet/dialog с явными Сохранить/Отмена и keyboard-safe viewport.
3. После двух фиксов повторить реальную отправку уведомления; сам delivery остаётся NEED-YURI.

### 2. Light theme и видимость chat controls

BRIEF-DESIGN-LIGHT-CHAT-001: AI-chat, chats и chat-conv в dark/light на 360×800, 390×844 и 430×932. Проверить input, send/voice/attachment actions, contrast, keyboard, empty/loading/error. Сначала evidence, затем только точечные CSS-правки.

### 3. Task-detail layout

BRIEF-DESIGN-TASK-HERO-001: длинный title, один длинный tag, четыре tags, отсутствующий deadline и самая длинная priority-label. DoD: нет overlap/clip/horizontal scroll; hero растёт по контенту; metadata не перекрывает текст; screenshot diff на 360/390/430 плюс iPhone TMA.

### 4. Bottom nav и safe area

- BRIEF-NAV-CONTRACT-001: принять один action contract для home и остальных экранов. Сейчас home center ведёт в AI-chat с long-press voice, а global nav имеет отдельные voice и AI-chat элементы.
- BRIEF-NAV-SAFE-AREA-001: один reserve token для app viewport, browser toolbar и env(safe-area-inset-bottom); проверить последнюю карточку, profile footer, keyboard-open и landscape.

### 5. VK parity, autologin и AI-chat

Работать по pm/vk-parity-plan-2026-07-23.md. Сначала session reliability и диагностируемый AI response, затем task-detail parity. VK Pay, entitlement и production не входят.

### 6. Cache / service worker

BRIEF-SW-CACHE-001: матрица first load / second load / update / offline / cleared storage. Добавить только после отдельного brief безопасную UX-реакцию на waiting worker и controllerchange. Проверить, что HTML, JS и CSS одной версии и что screenshot report записывает PWA_VERSION.

### 7. Broader polish

Profile rhythm, desktop shell, animation polish, fine spacing и дальнейший BEM cleanup идут только после P1 и parity. Большой merge старых redesign-веток запрещён: они расходятся с текущей веткой и годятся только как reference.

## Evidence gate для каждого design brief

1. Точный commit/preview URL и surface: browser, Telegram WebView или VK WebView.
2. Тестовые данные без персональных данных Юрия.
3. До/после на одинаковом viewport, theme и состоянии.
4. Functional assertion: control не только выглядит, но и выполняет действие.
5. Screenshot diff + raw console/network errors.
6. Ручной verdict для Telegram/VK WebView; desktop emulation не закрывает real-device gate.

## Решения, которые нужны от человека

- Юрий/Алексей: единый nav contract — центр AI-chat с long-press voice или два отдельных действия.
- Юрий/Алексей: public desktop web остаётся mobile-column с подсказкой или получает desktop shell.
- Юрий: после UI-фикса провести real Telegram notification delivery/sound/vibration smoke.
