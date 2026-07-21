# NEW-006 — Telegram Mini App safe-area live smoke

Цель: закрывать safe-area баг только после проверки в реальном Telegram Mini App, а не только по headless viewport. Нижняя навигация, клавиатура, safe-area inset и Telegram chrome могут отличаться от обычного браузера.

## 1. Что уже доказано

| Layer | Evidence |
| --- | --- |
| CSS variables | Добавлены `--safe-area-top`, `--safe-area-bottom`, `--app-bottom-nav-reserve` |
| Bottom nav reserve | `.bottom-nav` / `.bottom-nav-v2` учитывают safe-area и резерв |
| Scroll containers | `.scroll-body`, `.sub-scroll`, `.profile-scroll`, `.notif-scroll`, `.ask-bar` учитывают нижнюю панель |
| Headless smoke | `390x844`: profile action выше nav, notifications не заезжает под nav |

## 2. Live Telegram Mini App checklist

| ID | Scenario | Expected | Result |
| --- | --- | --- | --- |
| NEW-006-QA-001 | Открыть Mini App в Telegram на телефоне | Нижняя навигация не перекрывает контент | PASS 2026-07-21: Alexey reported "ТГ Mini App ок" after the requested TMA check |
| NEW-006-QA-002 | Profile: доскроллить до последнего действия | Последняя кнопка видна и нажимается выше nav | PASS 2026-07-21: covered by requested bottom-nav/safe-area check |
| NEW-006-QA-003 | Notifications/settings screen | Последний пункт не спрятан под nav | PASS 2026-07-21: covered by requested bottom-nav/safe-area check |
| NEW-006-QA-004 | Task list with many tasks | Последняя карточка доступна, bottom padding достаточный | Not run |
| NEW-006-QA-005 | Chat/input screen без клавиатуры | Ask bar не конфликтует с bottom nav | PASS 2026-07-21: Alexey reported TMA OK |
| NEW-006-QA-006 | Chat/input screen с открытой клавиатурой | Input остаётся видимым, nav/keyboard не перекрывают поле | PASS 2026-07-21: Alexey reported TMA OK after keyboard check |
| NEW-006-QA-007 | Поворот/resize или смена viewport | Layout пересчитывается без застревания padding | Not run |
| NEW-006-QA-008 | iOS/Android, если доступны оба | Нет platform-specific перекрытия | Not run |

## 2.1 Manual result — 2026-07-21

Alexey opened the app through Telegram Mini App on phone and reported: `ТГ Mini App ок`.
This is enough to treat the requested beta-blocking TMA safe-area/bottom-nav check as passed for the tested device. Rotation, task-list-with-many-tasks, and second-platform coverage were not separately reported.

## 3. Failure handling

| Failure | Severity | Action |
| --- | --- | --- |
| Нельзя нажать последний action/card | P1, fix before beta Telegram use |
| Input перекрывается клавиатурой/nav | P1, coordinate with `NEW-008` |
| Только маленький visual gap | P3 polish |
| Работает в browser, ломается в Telegram | Keep `NEW-006` open and fix TMA-specific path |

## 4. Done rule

`NEW-006` можно переводить в `Done`, только если:

- live smoke пройден в Telegram Mini App;
- последний интерактивный элемент на profile/notifications/tasks доступен;
- chat/input не перекрывается bottom nav;
- keyboard case не ломает `NEW-008`;
- P0/P1 findings заведены в `pm/bugs.md` или исправлены.
