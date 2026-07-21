# BACK-066 - VK functional parity audit

**Date:** 2026-07-22
**Status:** DONE for source audit, `NEEDS-REAL` for phone/VK smoke
**Branch:** `feat/admin-tariff-api`

## Scope

Source-only comparison of `vk.html` against the main `index.html` surface. No runtime code, VK Pay, payment, entitlement, production deploy, `main`, CAL, or secrets were touched.

## Anchors Reviewed

- `vk.html:286` home, `321` task detail, `359` AI chat, `377` calendar, `393` stats, `406` profile.
- `vk.html:962` enter app, `983` profile apply, `1270` load tasks, `1289` render tasks, `1337` task command detection, `1363` chat task save, `1426` task detail, `1508` AI chat, `1562` calendar, `1589` stats.
- `index.html:330` home, `414` ask, `444` task detail, `504` calendar, `541` statistics, `613` notifications, `633` profile, `696` subscription, `3114` load tasks, `3467` quick-add, `5607` task detail, `6358` chat task creation, `6871` calendar deadlines, `8052` chats.

## Parity Table

| Scenario | Main app | VK surface | Status | Notes |
| --- | --- | --- | --- | --- |
| Auth/login/register | Email/TG/VK/Yandex-oriented main auth, privacy/legal links, reset flows | Email login/register plus VK bridge auto-login/linking | Partial | VK auth is intentionally simpler; reset/privacy/legal surfaces are not parity-complete. |
| Home / plan day | Rich HOME-001 shell, top rows, focus, metrics, nav actions | Mobile home with focus card, four stats, active task list | Partial | Stable but simplified; no notifications/action feed entry and less context. |
| Task list card | Main cards include richer metadata/actions and shared renderer coverage | `taskHTML()` shows title, deadline, type, done button | Partial | Missing priority/person/status/description depth in list card. |
| Task detail | Main detail supports title/person/priority/deadline/status/originalMsg edits, reminders, checklist/history | VK detail shows title/meta/status/description, local discussion, done | Missing P1 edit parity | No server-backed edit title/person/priority/deadline/originalMsg flow. |
| Task creation | Main quick-add, AI-chat, voice, detail flows share task save/dedup helpers | VK task creation only through AI chat command heuristic | Partial / source risk | `isTaskCommand()` and `inferTaskDeadline()` use JS `\b`; this is likely Cyrillic-unsafe, same class caught in BACK-065. No `originalMsg`. |
| AI chat | Main ask has remote history, task creation/action tags, profile/facts context | VK chat calls `/anthropic`, stores local history slice `20`, tries simple task save | Partial | Missing remote `/ai/messages`, memory facts, `<task_actions>`, normalized `<create_task>` parity. |
| Task discussion | Main task detail has worker-backed task chat/mutations | VK task discussion is localStorage only, last 30 messages | Partial | Useful fallback, but not shared across devices/sessions. |
| Calendar | Main calendar has deadline list and shared parsers | VK month grid highlights exact ISO deadlines and day list | Partial | Relative deadlines and all-deadline overview are missing. |
| Stats | Main statistics screen has richer done/active/progress sections | VK simple counters and synthetic bars | Partial | Good enough for quick glance, not full product analytics parity. |
| Profile/account | Main profile has extended profile, privacy, security, sessions, devices, AI memory, support | VK profile has avatar/name/email, identities, theme, support, logout | Partial | Missing extended profile/privacy/security/AI-memory surfaces. |
| Notifications | Main has notifications action feed/settings | VK has no notifications screen | Missing | BACK-064 remains separate delivery/salience work; VK surface lacks visible notification parity. |
| Payment/VK Pay | Main has subscription/payment surfaces | VK profile has VK Pay button | Out of scope | Payment/VK Pay changes are explicitly excluded from this audit/fix path. |
| Mobile shell stability | Main has TMA-specific safe-area/keyboard rules | VK has compact shell and bottom nav | NEEDS-REAL | Source suggests simpler shell; phone VK/browser smoke is still required. |

## Recommended P1 Fix Briefs

1. `BACK-066A` - VK chat task intent/deadline parsing: replace Cyrillic-unsafe `\b` regex, preserve `originalMsg`, and align title cleanup with BACK-065 without importing the full main monolith.
2. `BACK-066B` - VK task detail edit MVP: allow title, deadline, status/done, person, and description/original text updates through existing `x-action:update-task`.
3. `BACK-066C` - VK AI chat parity slice: keep local simplicity but add normalized task title/originalMsg and graceful state for unsupported task actions.
4. `BACK-066D` - VK calendar deadline parity: render an all-deadlines list and support the same date strings that existing tasks can contain.
5. `BACK-066E` - VK profile/settings parity: expose minimum privacy/support/session/account state or clear graceful links to the main surface.

## Stop Point

Do not mark `BACK-066` Done until a mobile VK/browser shell smoke verifies login -> home -> task list -> task detail -> create/edit task -> AI chat -> calendar -> profile. VK Pay/payment remains out of scope.
