# REPORT-2026-07-23-45 - VK home beta parity

## Outcome

DONE.

Implemented the smallest safe VK home parity slice from already loaded local task data: focus summary, urgent/overdue/next-deadline metadata chips, and a top-priority task row that opens the existing task detail screen. No backend endpoint, payment, entitlement, auth contract, product pricing/copy promise, production deploy, CAL, VK Pay, or broad glass redesign was touched.

## Root Cause

- `vk.html:303` rendered the VK home surface with a simplified focus card, metric cards and task list.
- `vk.html:1427` previously updated only the active count and task list, so the home screen did not expose "what matters today" metadata even though priority/deadline/task status already existed locally.

## Changed Files

- `vk.html` - added focus-summary/chip/top-task UI and derived home summary helpers.
- `scripts/vk-home-parity-smoke.mjs` - added static/local DOM smoke for VK home focus metadata.
- `package.json` - added `npm run smoke:vk-home-parity`.
- `FILE_MAP.md`, `FILE_MAP_UI.md` - updated line counts and VK home ranges.
- `pm/inbox/BRIEF-2026-07-23-45-vk-home-beta-parity.md` - marked `DONE`.
- `pm/backlog.md` - marked `VK-HOME-PARITY-001` `Done` and narrowed remaining VK parity gaps.
- `shared/WORK_LOG.md`, `DEVELOPMENT_LOG.md` - recorded the task.

## Evidence

`npm run smoke:vk-home-parity`

```text
VK home parity smoke: PASS
```

DOM evidence from the smoke:

```text
taskCount = 3
focusSummary includes overdue priority wording
focusUrgent = 1 urgent task
focusOverdue = 1 overdue task
homePriorityRow.dataset.taskId = urgent
homePriorityTitle = Critical beta task
homePriorityRow click opens task detail for urgent
```

`npm run test:e2e:vk`

```text
2 passed
```

`node scripts/check-cp1251-mojibake.mjs`

```text
CP1251 mojibake check passed: 0 suspicious tokens
```

`npm run check:ui-architecture`

```text
inline style attributes = 299 / 465
inline event handlers = 401 / 402
style tags = 0 / 0
inline script tags = 3 / 3
```

`npm run check:portable-paths`

```text
Portable path check passed.
```

`git diff --check`

```text
exit code 0
```

## Manual Tail

NEEDS-REAL: live VK Mini App/device smoke and visual confirmation remain Yuri-only. This run used local source/static evidence only and did not deploy.
