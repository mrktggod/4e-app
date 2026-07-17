# NEW-008 — chat keyboard live smoke

Цель: закрывать баг перекрытия AI-чата клавиатурой только после живой проверки на телефоне/Telegram Mini App. Headless smoke подтверждает CSS-механику, но mobile keyboard меняет viewport, safe-area и Telegram chrome не так, как desktop browser.

## 1. Что уже доказано

| Layer | Evidence |
| --- | --- |
| Platform adapter | `platform-adapter.js` пишет `--app-keyboard-offset` вместо `body.paddingBottom` hack |
| Ask bar | `.ask-bar--keyboard-open` поднимает панель ввода над клавиатурой |
| Local smoke | `--app-keyboard-offset=260px`, `ask-bar padding-bottom=276px`, `input.bottom=568` при viewport 844 |
| Browser/headless result | Поле не перекрыто нижней навигацией в локальном smoke |

## 2. Live keyboard smoke checklist

| ID | Scenario | Expected | Result |
| --- | --- | --- | --- |
| NEW-008-QA-001 | Открыть AI-чат на телефоне без клавиатуры | Ask bar видим, не перекрыт bottom nav | Not run |
| NEW-008-QA-002 | Tap в input, открыть клавиатуру | Input остаётся полностью видимым над клавиатурой | Not run |
| NEW-008-QA-003 | Набрать длинный текст | Поле/строка ввода не уезжает за экран | Not run |
| NEW-008-QA-004 | Отправить сообщение с открытой клавиатурой | Сообщение отправляется, composer остаётся usable | Not run |
| NEW-008-QA-005 | Закрыть клавиатуру | Ask bar возвращается к нормальной позиции | Not run |
| NEW-008-QA-006 | Перейти на другой экран и обратно | Keyboard offset не залипает | Not run |
| NEW-008-QA-007 | Telegram Mini App | Telegram chrome/safe-area не перекрывает input | Not run |
| NEW-008-QA-008 | Mobile browser | Browser viewport resize не ломает ask bar | Not run |
| NEW-008-QA-009 | iOS/Android, если доступны оба | Нет platform-specific regressions | Not run |

## 3. Failure handling

| Failure | Severity | Action |
| --- | --- | --- |
| Input скрыт клавиатурой | P1, fix before beta chat use |
| Send button недоступен | P1 |
| Offset залипает после закрытия клавиатуры | P1/P2 depending on recovery |
| Только небольшой визуальный gap | P3 polish |
| Ломается только TMA, browser ok | Keep `NEW-008` open and fix platform-specific path |

## 4. Done rule

`NEW-008` можно переводить в `Done`, только если:

- live mobile keyboard smoke пройден;
- input и send button доступны с открытой клавиатурой;
- offset не залипает после закрытия клавиатуры/навигации;
- Telegram Mini App case не конфликтует с `NEW-006`;
- P0/P1 findings заведены в `pm/bugs.md` или исправлены.