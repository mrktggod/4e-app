# BACK-019 - task card mobile smoke

Goal: close improved task cards only after a narrow mobile viewport smoke, not only by source reading. Task cards are core UI, so readability, swipe behavior, and no horizontal overflow are the acceptance surface.

## Implemented Surface

| Layer | Evidence |
| --- | --- |
| Card renderer | Cards show number/priority, tag, deadline, two-line title clamp, and overdue state. |
| Swipe actions | `Done`, `Cancel`, and `Move` actions are rendered by `renderTaskCard`. |
| Visual hierarchy | Task title, contact/direction, deadline, and state are visually separated. |
| Regression smoke | `npm run smoke:back019` opens a 390x844 Chrome/CDP harness and tests layout plus tap/swipe behavior. |

## Mobile Smoke Checklist

| ID | Scenario | Expected | Result |
| --- | --- | --- | --- |
| BACK-019-QA-001 | Open active task list at 390px width | No horizontal scroll; cards are not clipped | PASS 2026-07-19: `viewportWidth=390`, `documentScrollWidth=390` |
| BACK-019-QA-002 | Long task title, 80+ characters | Title is clamped to max 2 lines and layout stays stable | PASS 2026-07-19: renderer inline override removed; `lineClamp=2`, `longTitleHeight=38` |
| BACK-019-QA-003 | Long contact/person name | Name does not push deadline/actions outside the card | PASS 2026-07-19: long person fixture rendered without card overflow |
| BACK-019-QA-004 | Overdue task | Overdue state is visible but not presented as app failure | PASS 2026-07-19: overdue fixture rendered as `.is-overdue` without failures |
| BACK-019-QA-005 | Swipe left/right on a card | Actions appear predictably and do not accidentally open detail | PASS 2026-07-19: pointer smoke opened left/right swipe states |
| BACK-019-QA-006 | Tap card | Opens detail for the expected task | PASS 2026-07-19: tap opened task id `plain` |
| BACK-019-QA-007 | Tap `Done` | Task completion path receives the expected task id | PASS 2026-07-19: done action received task id `overdue` |
| BACK-019-QA-008 | Tap `Move` | Move/deadline path receives the expected task id | PASS 2026-07-19: move action received task id `long-title` |
| BACK-019-QA-009 | Several cards in a row | Vertical rhythm is readable; bottom nav does not cover last card | PASS 2026-07-19: `lastCardBottom=428`, `navTop=764` |

## Raw Proof

```text
npm run smoke:back019
ok: true
viewportWidth: 390
documentScrollWidth: 390
longTitleHeight: 38
longTitleMaxTwoLines: 37.8
longTitleLineClamp: 2
lastCardBottom: 428
navTop: 764
swipeRightTransform: translateX(96px)
```

## Failure Handling

| Failure | Severity | Action |
| --- | --- | --- |
| Cannot open or complete a task | P0/P1 | Fix before beta invite |
| Swipe triggers wrong action | P1 | Fix before wider beta |
| Layout overflow on normal mobile viewport | P1 | Fix before wider beta |
| Long text wraps poorly but action remains available | P2 | Can enter beta backlog |
| Color/icon is unclear | P3 | Polish backlog |

## Done Rule

`BACK-019` can remain `Done` because:

- mobile smoke passed on a narrow 390x844 viewport;
- tap and swipe do not conflict;
- done/move actions receive the expected task id;
- the last card is not covered by bottom navigation;
- no P0/P1 findings were produced by the smoke.
