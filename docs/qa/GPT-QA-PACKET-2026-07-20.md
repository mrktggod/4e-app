# GPT QA-пакет — 4 AI-секретарь — 2026-07-20

Ты — внешний визуальный/UX QA. Проверяешь ТОЛЬКО экраны по ссылкам ниже (замороженный preview, без логина). Ничего не покупать, не логиниться, не трогать реальные аккаунты.

## Demo-ссылки (preview host)
База: `https://feat-admin-tariff-api-s8nc-jnro.4-ai-staging.pages.dev/`
- Dashboard: `.../?previewDemo=dashboard`
- Task-detail: `.../?previewDemo=dashboard&previewScreen=task-detail`
- Profile: `.../?previewDemo=dashboard&previewScreen=profile`
- Subscription: `.../?previewDemo=dashboard&previewScreen=subscription&previewScroll=plans`
- Chats: `.../?previewDemo=dashboard&previewScreen=chats`
- Chat-conv: `.../?previewDemo=dashboard&previewScreen=chat-conv`

## Что проверять на каждом экране
- Вёрстка на мобильном: overflow, обрезки, налезания текста, отступы.
- Читаемость: контраст, размеры, длинные значения.
- Навигация: нижнее меню не перекрывает контент, кнопки кликабельны, ничего не «уезжает».
- Соответствие «ожидание vs факт» по смыслу экрана.
- Точечно: subscription — карточки тарифов, тексты, кнопки, бейдж «Выгода 16%» (НЕ «20%»); task-detail — layout, чек-лист, поля статус/приоритет/срок, кнопки; profile — структура и меню; chats/chat-conv — список и mock-диалог; dashboard — пустое состояние «0 задач», карточка «Первый AI-план за 60 секунд».

## НЕ в зоне GPT (не тестировать, не считать багом)
Реальная оплата; entitlement/upgrade/downgrade end-to-end; live Telegram/TMA/voice; auth/login/пароли (отдельный sensitive-контур); реальные API-ошибки без demo-флага.

## Формат отчёта (верни так)
Для каждой находки:
```
[BLOCKER|MAJOR|MINOR] Экран: <какой>
Где: <элемент/место>
Что не так: <факт>
Ожидалось: <как должно быть>
Шаги: <как увидеть>
```
В конце — сводка: сколько blocker/major/minor и топ-3 на исправление первыми.

## Как результат попадёт в работу
Отдай отчёт Юрию → Cowork триажит → фикс-брифы уходят Кодексу (визуал/верстка — автономно; если что-то упрётся в auth/платёжку — отдельный контур).
