# LANDING-001: sales site plan for 4 AI-секретарь

Status: plan only, no implementation.

## Goal

Create a separate marketing landing page for 4 AI-секретарь: a personal AI task secretary for Telegram, VK, and web. The page can reuse the Auros reference only as a structural pattern: navigation, hero, feature cards, stat counters, testimonials area, and recessed final CTA. It must not reuse Auros copy, claims, imagery, teal/pink brand colors, or crypto-finance tone.

## Visual Direction

The landing should feel like the existing 4 AI product: green glass, calm task focus, and a useful assistant rather than a fintech terminal. Use depth through surface tones and translucent panels, not drop shadows.

### Color Mapping

| Auros role | Do not copy | 4 AI landing mapping |
| --- | --- | --- |
| Deep dark canvas | `#012624` teal abyss | Near-black green app canvas: `#050a08` / `#020605` for dark sections |
| Recessed footer/card surface | `#011d1c` | Deeper black-green: `#010403`, used for footer CTA well |
| Raised feature surface | `#003734` | Product glass surface: `rgba(255,255,255,0.08)` on dark, existing light glass tokens on light |
| Main text | cyan-white / pure white | Existing app text tokens; dark mode hero text around `#f2f5e9` |
| Muted text | `#bbc7c6` | Existing muted text token, with green-gray tint |
| Stat accent | pale pink | Brand green glow: `#bce64b` / existing `#9AC23C` |
| CTA gradient | teal-to-pink | Green-only CTA gradient, for example `#bce64b` to `#8fbd32`; reserve for primary buttons only |

Rules:

- Do not use Auros teal/pink gradients as background decoration.
- Keep the strongest accent on primary CTAs and important stat numbers only.
- Use surface-color steps and glass borders instead of shadows.
- Keep the page readable in both dark and light product contexts, but make the first version dark-first.

### Typography

Use Inter or the existing product font stack. The Auros reference uses tight display tracking, but the 4 AI implementation should keep letter spacing neutral to match the product UI rules.

Recommended type roles:

- Hero H1: 56-72px desktop, 36-42px mobile, weight 600 or 700.
- Section headings: 32-44px desktop, 28-32px mobile.
- Body: 16-18px, line-height 1.45-1.6.
- Labels: uppercase by casing and weight, not by wide tracking.
- Buttons and nav: 14-16px, compact and direct.

## Page Outline

### 1. Navigation

Purpose: make the product clear immediately and keep the first screen action-oriented.

Suggested items:

- Logo/name: `4 AI`
- Links: `Как работает`, `Возможности`, `Тарифы`, `FAQ`
- Primary CTA: `Запустить в Telegram`
- Optional secondary entry: `Открыть web`

### 2. Hero

The H1 should be the product name, not an abstract slogan.

Suggested copy:

- H1: `4 AI-секретарь`
- Supporting text: `Личный AI-помощник, который превращает сообщения, голос и идеи в задачи, напоминания и фокус дня. Работает в Telegram, VK и web.`
- Primary CTA: `Начать в Telegram`
- Secondary CTA: `Открыть web-версию`

Hero visual:

- Use a product-like glass task/focus composition, not an abstract crypto visual.
- A simple animated or static preview can show: incoming message -> task -> reminder -> focus list.
- Avoid Auros particle spheres and molecule diagrams unless rebuilt as clearly 4 AI product visuals.

### 3. Feature Cards

Use 3-5 surface cards with no drop shadows. Each card should describe a real product capability, not a marketing claim.

Candidate cards:

- `AI-чат`: помогает разобрать сообщение и предложить следующую задачу.
- `Голос`: быстро фиксирует мысли и поручения, когда неудобно печатать.
- `Умные напоминания`: возвращает к важному без ручной сортировки всего списка.
- `Память и контекст`: учитывает прошлые задачи и договорённости внутри продукта.
- `Telegram, VK и web`: можно начать в мессенджере и продолжить в интерфейсе.

### 4. Workflow Strip

Short visual sequence:

`Сообщение` -> `Задача` -> `Напоминание` -> `Фокус дня`

This section should make the product understandable in one glance. It can use four compact glass steps instead of a large illustration.

### 5. Placeholder Stats

Stats are allowed only as placeholders until Yuri approves real numbers. They must be visibly marked as placeholders in the plan and must not be shipped as real claims.

Safe placeholder examples:

- `[placeholder] 3 канала`: Telegram, VK, web.
- `[placeholder] 1 экран фокуса`: задачи, которые требуют внимания сейчас.
- `[placeholder] <1 минуты`: пример желаемого времени фиксации задачи, not a measured claim.

Before implementation, replace placeholders with real approved metrics or remove the stats block.

### 6. Testimonials

Do not invent quotes.

Use one of two approaches:

- Keep a reserved block titled `Отзывы появятся после беты`.
- Replace testimonials with short product scenarios until real beta feedback exists.

Preferred v1: scenarios, because an empty testimonial block weakens the page.

Scenario examples:

- `Когда нужно быстро сохранить голосовую мысль.`
- `Когда поручение прилетело в мессенджере и его нельзя потерять.`
- `Когда день уже забит, а надо понять, что делать первым.`

### 7. Pricing Teaser

Do not publish prices in this task.

Suggested section:

- Heading: `Подписка внутри продукта`
- Text: `Тарифы и лимиты лучше показать после решения Юрия по упаковке и ценам. До этого блок должен вести в продукт или объяснять, что подписка подключается внутри приложения.`
- CTA: `Посмотреть в приложении`

### 8. FAQ / Trust

Short FAQ candidates:

- `Где работает 4 AI-секретарь?` Telegram, VK, web.
- `Нужно ли переносить все задачи вручную?` Нет, стартовый сценарий строится вокруг сообщений, голоса и быстрых задач.
- `Можно ли подключить оплату сразу?` Только после отдельного решения по тарифам и оплате.
- `Что с приватностью?` Не давать новых юридических обещаний без утверждённого текста.

### 9. Recessed Footer CTA

Use the deepest surface tone with one strong green CTA.

Suggested copy:

- Heading: `Начните с одного сообщения`
- Text: `Отправьте задачу или голосовую мысль, а 4 AI-секретарь поможет довести её до следующего действия.`
- CTA: `Запустить в Telegram`

## Technical Placement

Recommended v1: create a static landing route inside the existing app repository after Yuri approves this plan.

Why:

- Fastest path to a preview.
- Reuses existing brand tokens, CSS discipline, and product assets.
- Keeps the first version close to the current app while the message is still being tested.

Trade-offs:

- SEO and content publishing are cleaner in a separate marketing repo later.
- A separate repo is better if the team wants blog/content workflows, many landing experiments, or non-product deploy ownership.
- Root domain changes, DNS, production deployment, and pricing copy require explicit Yuri approval.

Proposed path for implementation after approval:

- Build first as `/landing/` or `landing.html` on a preview environment.
- Do not replace the current product entry screen until Yuri approves the traffic route.
- Decide later whether `/` becomes marketing and the app moves behind a clear `app` route/subdomain.

## Open Questions For Yuri

1. Primary CTA target: Telegram bot, web app, or waitlist?
2. Exact public name: `4 AI-секретарь`, `4 AI`, or another spelling?
3. Which channels can be promised on the landing at launch: Telegram, VK, web?
4. Are there real beta quotes or metrics we are allowed to publish?
5. Should the first version mention pricing at all, or only say that subscription is inside the product?
6. Should the landing live in the app repository first, or do we want a separate marketing site from day one?

## Acceptance Criteria For Future Implementation

- First viewport clearly shows the product name and CTA.
- No Auros text, numbers, images, or crypto-finance claims are reused.
- Placeholder stats and testimonials are replaced or removed before public launch.
- No price, payment, domain, DNS, or production changes happen without explicit approval.
