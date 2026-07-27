# REPORT - BRIEF-2026-07-27-83 VK task-detail separate surface parity

Status: DONE

## Summary

Implemented a narrow VK-only task-detail parity slice in `vk.html`. The task detail screen keeps the existing editable title/status/priority/deadline path, but now has a clearer detail summary: status pill, priority/deadline tiles, explicit completion hint, 44px back target, and return-to-previous-screen behavior.

No auth, payment, entitlement, VK Pay, production, or shared shell migration work was touched.

## Changes

- `vk.html`
  - Added task-detail summary CSS and markup for visible status/priority/deadline hierarchy.
  - Replaced hard-coded detail back-to-home with `taskDetailReturnScreen` fallback behavior.
  - Kept existing worker update path for title/status/priority/deadline.
  - Kept completion failure behavior: failed completion leaves the task visible.
- `scripts/vk-task-detail-edit-smoke.mjs`
  - Extended static smoke to cover return hint, status pill, priority tile, deadline tile, and completion hint.
- `FILE_MAP.md`, `FILE_MAP_UI.md`
  - Updated line counts and VK ranges.

## Verification

- `npm run smoke:vk-task-detail-edit` - PASS
- `npm run smoke:vk-task-complete` - PASS
- `npm run test:e2e:vk` - PASS, 4/4

## Notes

This intentionally does not port the desktop/Telegram task-detail shell into VK. The VK surface remains separate and only gets the narrow visible parity needed by the brief.
