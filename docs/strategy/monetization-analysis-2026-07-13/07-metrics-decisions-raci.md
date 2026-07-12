# 7. Метрики, решения, RACI и stop/go-gates

## 7.1. North star на текущем этапе

**Activated planning days:** число пользователей, которые открыли полезный персональный план минимум в 3 разные даты за 7 дней.

Почему не регистрации/задачи:

- регистрация не означает ценность;
- одна задача не доказывает привычку;
- paid conversion без повторного использования может быть случайным;
- три planning days связывают activation и раннее удержание.

## 7.2. Воронка

| Stage | Событие | Определение |
|---|---|---|
| Acquisition | `app_opened` | Открыта app entry с source/campaign |
| Signup | `signup_completed` | Создан canonical user |
| Activation 1 | `first_task_created` | Первая реальная задача сохранена |
| Activation 2 | `tasks_3_created` | Есть три реальные задачи |
| Aha | `first_plan_viewed` | Персональный plan render с данными пользователя |
| Depth | `ai_action_succeeded` | AI помог с планом/декомпозицией/сообщением |
| Retention | `planning_day_active` | Plan открыт в отдельную календарную дату |
| Revenue intent | `paywall_viewed` | Paywall реально показан |
| Checkout | `checkout_started` | Provider flow начат |
| Revenue | `payment_succeeded` | Backend-verified payment |
| Referral | `referral_activated` | Приглашённый достиг first plan/D1 по правилу |

## 7.3. Настоящий D1/D7

Текущий `/analytics/summary` считать «new activity windows», а не retention.

Для cohort retention:

- cohort = дата `signup_completed` или `first_plan_viewed`;
- D1 = пользователь совершил meaningful event на следующий календарный день;
- D7 = meaningful event на седьмой день/окно, определённое командой;
- отдельно считать all users и referred users;
- timezone пользователя учитывать, иначе утренние открытия будут перескакивать между днями.

Meaningful event для beta: `planning_day_active`, `task_created`, `task_completed`, `ai_action_succeeded`. Простое открытие login screen не считать возвратом ценности.

## 7.4. Метрики первого месяца

Цели ниже — рабочие decision thresholds, а не внешние industry benchmarks.

| Метрика | Цель/вопрос |
|---|---|
| Invited beta users | 5–10 |
| First task | Видно, где отваливаются |
| First plan | Главный activation gate |
| Time to first plan | Стремиться ≤ 60 секунд после входа |
| D1 / D7 | Получить фактические значения, не угадывать |
| Planning days per user | Кто использовал план в 3 даты за 7 дней |
| Paywall view → checkout | Видно намерение |
| Checkout → verified payment | Видно надёжность rail |
| Real payments | Минимум 3 как first monetization proof |
| Referral activation | Не signup, а first plan/D1 |
| Payment support incidents | Должно быть 0 неразрешимых |

## 7.5. Unit economics, которых сейчас нет

Нельзя считать CAC/LTV по цене 990 ₽ без:

- фактической retention/churn;
- среднего plan mix;
- provider fees/refunds;
- LLM token cost;
- speech/transcription cost;
- infra cost;
- referral bonus liability;
- ручной поддержки и promo production.

Минимальный расчёт на пользователя:

```text
gross contribution = net payment
  - AI cost
  - voice/transcription cost
  - infra allocation
  - payment fees/refunds
  - referral reward cost
  - variable support cost
```

До этого paid ads не запускать: CAC ceiling неизвестен.

## 7.6. Главные решения по влиянию

| Приоритет | Решение | Почему блокирует |
|---:|---|---|
| 1 | Обязателен ли Yandex/ПД gate до первой оплаты | Внутренний roadmap требует это перед монетизацией |
| 2 | Первый payment rail | Нельзя одновременно доводить всё |
| 3 | Payment integrity design | Без него реальная продажа небезопасна |
| 4 | Цена и trial первой когорты | 30 дней откладывают learning; live config уже публикует цену |
| 5 | Reward condition рефералки | Влияет на fraud, cost и time-to-pay |
| 6 | Release candidate app/worker | Production сейчас не совпадает со staging |
| 7 | Минимум HOME/BACK-055 до beta | Нужен scope control |
| 8 | Первичный ICP и один use case | Определяет promo и willingness-to-pay |

## 7.7. Рекомендованные решения

### Первый rail

Выбрать тот канал, где backend verification можно закрыть быстрее и проверить с первой когортой. Предварительный порядок:

1. Telegram Stars для Telegram-когорты — после защиты trusted bot completion и amount/charge validation.
2. CloudPayments для web/card — после HMAC, amount/plan и idempotency.
3. VK Pay — только после server-side verification, а не локальной смены UI plan.
4. ЮKassa — второй web-provider, не блокирует первые оплаты.

Это техническая рекомендация, не финансовое/юридическое заключение.

### Trial

Не менять live молча. Для learning выбрать один вариант:

- 30 дней остаются, но founder offer показывается после Day 7;
- для новой beta cohort trial сокращается до 7/14 дней;
- платный beta с сопровождением.

### Referral

Reward после activation; inviter bonus после D1 или первой оплаты. Текущие +30 дней за signup оставить только как тестовый flow до решения.

## 7.8. RACI

| Domain | Responsible | Accountable | Consulted | Informed |
|---|---|---|---|---|
| Product priority / scope | Алексей + Юрий | Алексей | Codex/Claude | Команда |
| App implementation | Codex/Юрий | Назначенный владелец спринта | Алексей | Команда |
| Worker/payment security | Codex/Юрий | Юрий/тех. владелец | Алексей | Команда |
| Manual mobile/RF smoke | Алексей | Алексей | Юрий | Codex/Claude |
| VK admin confirmation | Владелец VK app | Алексей/Юрий | Codex | Команда |
| Price/trial/offer | Алексей + Юрий | Алексей | Beta users | Команда |
| Legal/data gate | Алексей + Юрий | Оператор ПД | Профильный специалист | Команда |
| Analytics definitions | Codex + product owner | Алексей | Юрий | Команда |
| Beta recruitment/interviews | Алексей + Юрий | Алексей | Codex | Команда |
| Promo assets/content | Назначенный владелец | Юрий/Алексей | Beta users | Команда |
| Referral policy | Product owner | Алексей | Tech/legal | Команда |

## 7.9. Review cadence

### Во время длинной сессии

- checkpoint после законченного слоя, не по таймеру;
- commit/test/staging evidence;
- human packet накапливается отдельно.

### Ежедневно в beta

- 15 минут: новые P0/P1, activation, feedback;
- не обсуждать Later backlog.

### Раз в 7 дней

- planning days, D1/D7, paywall/payment, cost-to-serve;
- решение продолжить/изменить один slice;
- roadmap обновляется одним digest.

## 7.10. Go/no-go gates

### Public promo GO

- release candidate в production;
- legal/data gate решён;
- truthful conversion entry;
- first-plan работает;
- source/campaign attribution;
- нет P0 auth/data/payment.

### Payment GO

- provider authenticity;
- amount/plan validation;
- idempotency;
- canonical user mapping;
- refund/recovery path;
- one real smoke.

### Referral GO

- activation reward rule;
- self/duplicate/velocity protections;
- events;
- two-user smoke;
- platform claims соответствуют реальности.

### Paid ads GO

- activation и retention измерены;
- минимум несколько реальных оплат;
- cost-to-serve и CAC ceiling посчитаны;
- landing/paywall/message согласованы.
