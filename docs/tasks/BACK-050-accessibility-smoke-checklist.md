# BACK-050 — accessibility smoke checklist

Цель: закрывать accessibility baseline только после ручного keyboard/mobile smoke. Кодовые labels, aria-атрибуты и dialog semantics уже полезны, но accessibility ломается именно в реальном tab/focus/error-flow.

## 1. Что уже реализовано

| Layer | Evidence |
| --- | --- |
| Auth/forms | Labels, `aria-describedby`, `aria-invalid`, field errors |
| Toast | `#toast` работает как `status`/`alert` live-region |
| Dialogs | quick-add/contact/biometric consent получили dialog semantics |
| Focus behavior | focus-in/focus-return, Escape/Tab handling, visible focus |

## 2. Keyboard smoke checklist

| ID | Scenario | Expected | Result |
| --- | --- | --- | --- |
| BACK-050-QA-001 | Tab through login form | Focus order: email/password/button/social links, no hidden trap | Not run |
| BACK-050-QA-002 | Submit empty/invalid login form | Error is visible, field has invalid state, focus remains understandable | Not run |
| BACK-050-QA-003 | Registration form with invalid email | Error is tied to field and not only color-coded | Not run |
| BACK-050-QA-004 | Open quick-add dialog | Focus moves into dialog | Not run |
| BACK-050-QA-005 | Press Escape in quick-add | Dialog closes and focus returns to opener | Not run |
| BACK-050-QA-006 | Tab inside quick-add | Focus does not escape behind modal unexpectedly | Not run |
| BACK-050-QA-007 | Open contact/person picker | Focus starts on meaningful control and can reach all choices | Not run |
| BACK-050-QA-008 | Toast appears after action | Screen-reader-visible live-region role is appropriate | Not run |
| BACK-050-QA-009 | Bottom navigation by keyboard | Each nav item is reachable and has visible focus | Not run |
| BACK-050-QA-010 | Mobile viewport | Focus ring is visible and not hidden by keyboard/bottom nav | Not run |

## 3. Screen-reader copy spot check

| Area | Expected |
| --- | --- |
| Auth inputs | Label communicates field purpose |
| Password visibility button | Name communicates show/hide intent |
| Dialog close buttons | Name communicates close action |
| Task actions | Done/move/delete actions are distinguishable |
| Toast/error | User can understand what changed |

## 4. Failure handling

| Failure | Severity | Action |
| --- | --- | --- |
| Cannot log in/register by keyboard | P0/P1, fix before beta |
| Dialog traps user or loses focus | P1, fix before wider beta |
| Error visible only by color | P1/P2 depending on flow |
| Focus ring invisible on core controls | P2 |
| Minor label copy awkward | P3 |

## 5. Done rule

`BACK-050` можно переводить в `Done`, только если:

- keyboard smoke прошёл для auth и core dialogs;
- errors are perceivable without color only;
- focus return works after closing dialogs;
- bottom navigation is reachable;
- P0/P1 findings заведены в `pm/bugs.md` или исправлены.