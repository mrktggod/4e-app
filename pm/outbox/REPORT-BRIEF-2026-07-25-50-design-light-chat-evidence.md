status: DONE

# REPORT-BRIEF-2026-07-25-50 — light-theme AI-chat/chats/chat-conv evidence

## Итог

Задача выполнена как evidence-first. Код и CSS не менялись, потому что явного узкого CSS-бага раскладки не найдено.

## Что сделано

- Сняты DOM-метрики и скриншоты для `#ask`, `#chats`, `#chat-conv`.
- Проверены viewport `360x800`, `390x844`, `430x932`.
- Проверены темы `dark` и `light`.
- Проверены normal, keyboard-focus, empty, loading, error probes.

## Доказательства

- Evidence-документ: `docs/tasks/DESIGN-LIGHT-CHAT-2026-07-25-evidence.md`
- DOM-метрики: `docs/tasks/assets/design-light-chat-2026-07-25/DESIGN-LIGHT-CHAT-2026-07-25-dom-metrics.json`
- Скриншоты: `docs/tasks/assets/design-light-chat-2026-07-25/`

Сводка автоматического прогона:

```text
screenshots: 48
records: 48
activeIds: ask, chats, chat-conv
horizontalOverflow: 0
bottomRisks: 0
```

## Находки

- `AI-chat`: input и send есть; voice/attachment внутри composer нет. Это не CSS-баг, а продуктовый контракт/долг.
- `chat-conv`: input, send, attachment и voice есть.
- `chats`: composer не ожидается, проверены поиск и список.
- Light-тема: `.chat-row-prev` и `.conv-sub` на границе контраста около `4.34:1`. Это ниже целевого `4.5:1`, но лучше чинить отдельным brief по secondary text, а не в evidence-задаче.

## Верификация

```text
node scripts/check-cp1251-mojibake.mjs
git diff --check
```

Фактический вывод:

```text
CP1251 mojibake check passed: 0 suspicious tokens
git diff --check: без вывода
```
