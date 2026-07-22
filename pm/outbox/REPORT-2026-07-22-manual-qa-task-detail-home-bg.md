status: MANUAL-QA-INTAKE

# Manual QA intake — task detail and bottom nav background — 2026-07-22

## Context

Alexey manually tested `https://qa-b7076e2.4-ai-staging.pages.dev/` on iPhone at about 21:04-21:05 MSK and reported that login succeeded, but several UI blockers remain.

Runtime code was not changed in this intake. Current working tree already contains uncommitted changes in `index.html`, `styles/screens/home.less`, built CSS and PM files from another active session, so the fix must not overwrite that work.

## Findings

### BUG-2026-07-22-001 — reminder time trigger still does not work

Manual result: the button for setting a notification/reminder time in the task detail card does not work.

Expected fix direction: replace the nested interactive structure with a real 44x44 trigger and a sibling picker/popover. Preserve the existing reminder save/update path; do not touch notification delivery/backend logic.

### BUG-2026-07-22-002 — tag popup is still layered under other controls

Manual result: tags can be added, but the popup/input still appears under deadline and priority cards, partially blocking the add button.

Visual evidence:

- `docs/tasks/assets/manual-qa-2026-07-22-task-detail-tag-popup-blocked.png`
- `docs/tasks/assets/manual-qa-2026-07-22-task-detail-tag-popup-keyboard.png`

Expected fix direction: make the tag editor its own mobile-safe surface. Place the add button below the input, avoid native datalist overlay, and prevent the tag surface from overlapping deadline/priority controls.

### BUG-2026-07-22-003 — long title wraps but hero still hides content

Manual result: long title now wraps and stays inside the card horizontally, but when text reaches the side it still shifts/gets hidden and the message text is not visible enough. The hero needs to expand downward so the full content can fit.

Visual evidence:

- `docs/tasks/assets/manual-qa-2026-07-22-task-detail-tag-popup-blocked.png`

Expected fix direction: allow the task-detail hero to grow vertically within safe bounds. Avoid fixed-height/absolute clipping for title/description content and keep deadline/priority readable.

### New visual issue — extra background behind bottom nav

Manual result: on the home/profile screens there is an extra background/plate below or behind the bottom menu area.

Visual evidence:

- `docs/tasks/assets/manual-qa-2026-07-22-home-bottom-bg.png`
- `docs/tasks/assets/manual-qa-2026-07-22-profile-bottom-bg.png`

Expected fix direction: inspect bottom-nav safe-area/background layers. The nav should reserve touch space without leaving a visible stray panel behind it.

## Stop reason

Code fix is blocked by concurrent uncommitted work in the same files:

- `index.html`
- `styles/screens/home.less`
- `styles.css`
- `styles.min.css`
- `FILE_MAP_UI.md`
- PM/status files

Next executor should first preserve/commit/resolve that work, then handle the task-detail fixes as narrow briefs `31-33`; the bottom-nav background should become a separate narrow UI bug or be folded into the current focus/home visual brief if that is the source.
