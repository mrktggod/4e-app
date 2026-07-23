# REPORT-2026-07-23-43-vk-beta-readiness-map

## Outcome

DONE.

VK beta readiness is clear enough for the runner: do the local, narrow parity slices first; classify auth/session and AI-chat as Claude-reviewed scope work; leave live VK/device smoke to Yuri. No runtime code was changed in this brief.

## VK Beta Blockers In Priority Order

1. `VK-AUTH-SESSION-001` / `BRIEF-2026-07-23-48-vk-auth-session-claude-scope`: saved `vk4_token` can be removed after timeout or transient `/auth/me` failure. This is auth-adjacent and must be `NEED-CLAUDE` before code.
2. `VK-AI-CHAT-001` / `BRIEF-2026-07-23-49-vk-ai-chat-claude-scope`: manual signal says VK AI chat is broken; source masks real `/anthropic` failures. Needs root-cause proof and reviewed fix plan before code.
3. `VK-TASK-DETAIL-001` / `BRIEF-2026-07-23-44-vk-task-detail-beta-parity`: task detail is mostly read-only. Safe local slice if it only adds server-backed edit/detail parity and avoids reminders, payments and entitlement.
4. `VK-HOME-PARITY-001` / `BRIEF-2026-07-23-45-vk-home-beta-parity`: home/focus/task metadata is simplified. Safe local slice if it keeps VK home stable and does not merge broad `DESIGN-GLASS-001`.
5. `VK-PROFILE-001` / `BRIEF-2026-07-23-46-vk-profile-beta-parity`: profile information architecture is thin; safe if subscription/payment remains untouched.
6. `VK-CALENDAR-001` / `BRIEF-2026-07-23-47-vk-calendar-parser-beta-parity`: parser/date grouping parity is safe if it stays local fixtures and is explicitly not CAL work.
7. Live VK Mini App/device smoke: `NEED-YURI` after local slices, because it uses real VK accounts/device/container.

## Existing Brief Order

The current filenames are correctly ordered for the night runner:

- `43-vk-beta-readiness-map`: docs-only map, closes first so the runner has a clear queue.
- `44-vk-task-detail-beta-parity`: highest safe runtime value; task edit/detail is the obvious P1 user gap.
- `45-vk-home-beta-parity`: visible beta first screen; depends on preserving stability and avoiding glass-system sprawl.
- `46-vk-profile-beta-parity`: P2 IA/navigation parity; must not touch subscription/payment.
- `47-vk-calendar-parser-beta-parity`: safe parser/test work; explicitly not CAL.
- `48-vk-auth-session-claude-scope`: sensitive auth-adjacent scope only.
- `49-vk-ai-chat-claude-scope`: sensitive AI/auth/entitlement diagnostic scope only.

## Manual Tails For Yuri

- Run a real VK Mini App/mobile smoke after local code slices: login, refresh, home, task list, task detail edit, AI chat, calendar and profile.
- Confirm which exact web-VK or VK-hosted URL Alexey considers the beta surface.
- Decide separately on any VK Pay, entitlement, production deploy, `main` merge, secrets, CAL or live account/provider work.

## Raw Evidence

Commands and files reviewed:

```text
Get-Content pm/inbox/BRIEF-2026-07-23-43-vk-beta-readiness-map.md -Raw
Get-Content pm/vk-parity-plan-2026-07-23.md -Raw
Get-Content docs/tasks/BACK-066-vk-functional-parity-audit-2026-07-22.md -Raw
Get-Content docs/tasks/BACK-066-vk-stable-line-functional-parity.md -Raw
rg -n "VK-BETA|VK-TASK|VK-HOME|VK-PROFILE|VK-CALENDAR|VK-AUTH|VK-AI|BACK-066|VK beta" pm shared docs
```

Evidence anchors:

- `pm/backlog.md`: VK beta readiness queue rows `VK-BETA-READINESS-001` through `VK-AI-CHAT-001`.
- `shared/ROADMAP.md`: VK beta requirement and autonomous/manual boundaries.
- `pm/vk-parity-plan-2026-07-23.md`: auth/session and AI-chat are `NEED-CLAUDE`; task-detail, home, calendar and profile are ready/fixable local slices.
- `docs/tasks/BACK-066-vk-functional-parity-audit-2026-07-22.md`: remaining gaps after `BACK-066A`.

## Verification

Shared guards are run before commit:

```text
node scripts/check-cp1251-mojibake.mjs
npm run check:portable-paths
npm run check:ui-architecture
git diff --check
```

Commit SHA: this commit.
