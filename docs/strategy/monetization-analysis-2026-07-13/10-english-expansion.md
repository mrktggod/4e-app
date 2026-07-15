# 10. English expansion: i18n, новый ICP и закрытая beta

**Дата решения:** 13 июля 2026 года
**Статус:** стратегия и рекомендуемый rollout; разработка не начата.

## Короткий вывод

Английская версия имеет смысл, но перевод интерфейса сам по себе не расширит аудиторию. Нужны одновременно:

- узкий англоязычный ICP;
- рабочий i18n-слой;
- один путь до первого плана;
- корректные English voice/AI/date/time flows;
- один безопасный платёжный канал;
- английские privacy/terms/refund/support;
- отдельная проверяемая воронка.

Решение: **заложить i18n сейчас, но не отдавать ему больше 20% разработки до первых 3–5 оплат на основном рынке; после этого провести закрытую English beta Web + Telegram.**

## Почему не широкий «AI planner for everyone»

Англоязычная категория уже плотная:

- [Motion](https://www.usemotion.com/) автоматически планирует задачи в календаре и постоянно перестраивает день;
- [Sunsama](https://sunsama.com/features/daily-planning-and-shutdown) продаёт спокойный guided daily planning ritual;
- [Akiflow](https://akiflow.com/pricing) объединяет задачи, календарь, voice и AI assistant;
- [Reclaim](https://reclaim.ai/pricing) предлагает free/paid calendar optimization;
- [Ohai](https://www.ohai.ai/) показывает силу узкой ниши — household manager вместо generic assistant.

У 4 пока нет календарных/email/Slack-интеграций уровня этих продуктов. Поэтому прямое позиционирование «ещё один AI daily planner» ведёт в сравнение по чужим сильным сторонам.

## Первый English ICP

**Англоязычные независимые консультанты, владельцы небольших агентств, fractional-специалисты и solo founders, которые ведут клиентскую работу в Telegram и голосовых сообщениях.**

Их боль:

- обещания рождаются в Telegram быстрее, чем попадают в todo;
- одновременно ведутся несколько клиентов и людей;
- потерянное обещание стоит дороже потерянной задачи;
- обычный planner требует перейти в отдельный интерфейс и вручную восстановить контекст;
- голосовые заметки и сообщения не превращаются в проверяемый следующий шаг.

### Рабочее позиционирование

> **Your AI follow-through assistant for Telegram. Say it or send it — 4 remembers who you promised what, turns it into a next step, and shows what matters today.**

Главное отличие:

`person → commitment → next step → today's plan → follow-through`

Telegram — не вечная граница продукта, а beachhead channel. После подтверждения спроса расширение идёт в Web/PWA, email/calendar capture и только затем в более широкий рынок.

## Текущее техническое состояние

`English` в настройках сейчас декоративный:

- `index.html` показывает список языков;
- `setLanguage()` меняет radio/display, пишет `localStorage.app_lang` и показывает русский toast;
- `app_lang` больше не читается;
- язык не восстанавливается и не применяется;
- в списке уже есть mojibake у Spanish/French/Chinese labels.

Русский язык зашит в:

- HTML labels, placeholders, aria/title;
- toast/error/empty states;
- даты, валюту, pluralization и date parsing;
- AI system prompts;
- SpeechRecognition `ru-RU`;
- Whisper `language=ru`;
- worker errors и notifications;
- Telegram bot commands/reminders/analyzer prompt;
- emails;
- privacy/consent/support;
- отдельную VK-поверхность.

Приблизительный аудит строк:

| Поверхность | Оценка RU-хардкода |
|---|---:|
| `index.html` | ~462 уникальных visible fragments + ~54 attributes + ~194 JS strings |
| `vk.html` | ~60 visible + ~7 attributes + ~19 JS strings |
| `privacy.html` | ~101 visible fragments |
| app scripts | ~65+ уникальных RU JS strings |
| worker + bot | ~230 строк с кириллицей в активных JS modules |

Это отдельный i18n-слой, а не механическая замена кнопок.

## Архитектура i18n

### Минимум

- `locales/ru.js` и `locales/en.js` с одинаковыми keys;
- `t(key, params)` для динамических строк;
- `data-i18n` / `data-i18n-placeholder` / `data-i18n-aria-label` для статического HTML;
- `Intl.DateTimeFormat`, `Intl.NumberFormat`, plural rules;
- `locale` + timezone в canonical user profile;
- explicit user switch + Telegram/browser fallback;
- localStorage только как кеш, backend profile — источник между устройствами;
- обновление `<html lang>`;
- AI отвечает на locale пользователя;
- voice recognition/transcription использует выбранный язык;
- API возвращает стабильные error codes, frontend локализует message;
- fallback `en → ru` только в закрытой beta с telemetry missing keys.

### Правило для новых экранов

Новые/изменяемые экраны сразу используют `t()` и locale-aware formatting. Старый UI переводится по критическому маршруту, а не массовым refactor.

### Что сделать прямо сейчас

- скрыть/пометить неподдерживаемые языки;
- исправить mojibake language labels;
- не обещать «язык изменится после перезапуска», пока перевод не работает;
- подготовить `ru/en` infrastructure параллельно с `ONBOARD-001` и HOME, без отдельного большого rewrite.

## Объём English pilot

Первый маршрут:

`invite → signup → 3 tasks → first plan → AI/voice → return → paywall → payment → Premium → support`

### Переводить в пилоте

- auth и onboarding;
- Home;
- quick add и task detail;
- AI chat и decomposition;
- voice/transcription;
- основные notifications/reminders;
- paywall, price, checkout, payment errors;
- Telegram `/start`, login return и ключевые reminder messages;
- transactional emails;
- privacy summary, terms, refund и support.

### Не переводить в пилоте

- `vk.html` и VK-specific flows;
- admin/QA/internal docs;
- полный FAQ и вторичные settings;
- старый blog/SEO archive;
- demo fixtures;
- MAX/RuStore/native;
- Workspace/offline/calendar Later;
- streak/Wrapped/AI character;
- все языки кроме `ru/en`;
- годовой тариф и все payment providers.

## Оценка разработки

| Объём | Оценка |
|---|---:|
| i18n infrastructure + critical EN route | 3–5 dev-дней |
| bilingual smoke | 1–2 дня |
| полный `index.html` + QA | 8–12 dev-дней |
| VK | 2–4 dev-дня |
| worker/bot/email/notifications/speech/privacy | 5–8 dev-дней |
| полный качественный i18n | ориентировочно 15–25 dev-дней |

Оценка не включает новые integrations, legal review и новый глобальный card-processing контур.

## 0–30 дней

Основной поток не меняется:

- payment integrity;
- `ONBOARD-001`;
- корректные events;
- закрытая RU beta;
- первые 3–5 оплат.

English lane — максимум 20%:

1. 5–8 интервью с English ICP.
2. Проверка одного use case: `capture client commitments → get today's plan`.
3. i18n foundation только в critical route.
4. English text/voice input и AI response.
5. Privacy/terms/refund/support draft для одной выбранной юрисдикции/когорты.
6. 3–5 неплатёжных usability tests.

Gate: минимум 3 интервью подтверждают повторяющуюся боль и минимум 3 человека самостоятельно получают first plan; работа не переносит текущий payment release.

## 31–60 дней: закрытая English beta

Когорта: 12–20 квалифицированных пользователей из одного юридически/платёжно понятного сегмента.

Acquisition:

- тёплые знакомства;
- Telegram communities;
- точечный founder outreach;
- одна English landing/conversion entry;
- никаких paid ads.

Платёж:

- один месячный plan;
- Telegram Stars для цифровой услуги внутри Telegram после закрытия trusted completion/amount/idempotency;
- не копировать `990 ₽` как `990 Stars`;
- English payment support и recovery/refund flow;
- web/card не запускать до подтверждения merchant jurisdiction, валюты, налогов и возвратов.

Decision thresholds:

- ≥8 пользователей увидели first plan;
- ≥4 открыли полезный plan в 3 разные даты;
- ≥3 начали checkout;
- ≥2 совершили backend-verified payment;
- 0 неразрешимых payment/support incidents.

## 61–90 дней: ограниченное расширение

Только после gate:

- 30–50 пользователей в той же когорте;
- второй acquisition channel, но не второй рынок;
- два screen-first ролика `voice → plan` и `client promise → next action`;
- referral beta после activation/D1, без reward за signup;
- перевод следующих экранов по support logs;
- отдельный учёт AI/voice cost, Stars proceeds и support для `locale=en`.

90-day GO:

- ≥18 first plans;
- ≥9 пользователей с тремя planning days;
- ≥5 реальных оплат;
- нет P0 data/access/payment;
- есть повторяемый источник активированных пользователей.

Если оплаты нет при retention — менять offer/price. Если retention нет — чинить daily ritual. Если first value не возникает — English rollout заморозить.

## Что меняется в roadmap

- `I18N-001` создаётся как P2 product/growth task.
- i18n foundation можно делать рядом с activation slice.
- полноценная English beta стартует только после первых 3–5 оплат и payment safety gate.
- VK/full localization не входят в первый English release.
- широкий international launch не заменяет основной путь к монетизации.
