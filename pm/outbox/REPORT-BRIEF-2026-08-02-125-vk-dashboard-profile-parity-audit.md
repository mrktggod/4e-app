# REPORT-BRIEF-2026-08-02-125-vk-dashboard-profile-parity-audit

status: DONE
lessons_read: 1

## Gap Matrix

| Area | Current VK State | Current Coverage | Gap / Follow-up |
| --- | --- | --- | --- |
| Dashboard visual shell | `vk.html:468` has a compact topbar with one logo; `vk.html:483` has a VK-specific home redesign, not the current Telegram/web dashboard shell. | `npm run smoke:vk-header-logo` verifies one topbar logo and no duplicate home logo. | Visual parity is intentionally partial. Follow-up should choose whether VK gets the full current dashboard shell or remains a compact VK-specific shell. |
| Dashboard cards/actions | `vk.html:509` renders done/active/promises/progress stat cards; `vk.html:517` has a clickable priority row. The stat cards themselves are not wired as dashboard filters like web/Telegram metrics. | `npm run smoke:vk-home-parity` verifies focus summary, metric notes, urgent/overdue/next-deadline chips and top task row. | Add a small VK dashboard filter/action brief if Alexey wants done/tasks/promises cards clickable. |
| Focus/day chips | `vk.html:487` renders static chips for today/hot/people/week; focus meta chips at `vk.html:500` update data. | `npm run smoke:vk-home-parity` checks metadata exists. | No test proves chip click behavior because chips are currently static. Follow-up should define expected chip behavior first. |
| Profile buttons | `vk.html:689` shows identities; `vk.html:692` refreshes VK identity; `vk.html:706` privacy and `vk.html:710` support are links; `vk.html:714`, `vk.html:718`, `vk.html:722`, `vk.html:732` show toasts/placeholder states; logout at `vk.html:737`. | `npm run smoke:vk-profile-parity` verifies account summary, identity list, privacy/support links, security/session and AI-memory pointers, local-only notification entry. | Several profile rows are placeholders by design. Follow-up should make one row at a time functional, starting with notification settings or security/session handoff. |
| Task navigation | `vk.html:740` bottom nav covers home/calendar/ask/stats/profile; task row/detail paths exist. | `npm run test:e2e:vk`, `npm run smoke:vk-task-detail-edit`, `npm run smoke:vk-task-actions`, `npm run smoke:vk-task-complete` passed. | Coverage is good for mocked navigation and basic actions; no live VK host coverage claimed. |
| Existing Playwright/static coverage | VK has e2e shell/navigation plus static smokes for home, profile, task detail edit, calendar date keys, header logo, auth session, AI chat errors/parity, task actions, task completion. | All listed commands passed in this run. | Missing visual screenshot diff against web/Telegram, clickable metric/chip checks, and placeholder-profile-row behavior checks. |

## Recommended Follow-up Briefs

1. `VK dashboard metric filters`: make done/tasks/promises/progress cards clickable or explicitly non-clickable with disabled affordance; add focused smoke.
2. `VK focus chips behavior`: define and implement today/hot/people/week chip filtering; add static or Playwright smoke.
3. `VK profile row actions`: convert one placeholder row at a time into a real target or clear disabled state; start with notification settings because it is local-only today.
4. `VK visual parity decision`: product/design decision whether VK should adopt the current Telegram/web dashboard shell or keep a VK-specific compact shell.
5. `VK visual regression screenshots`: add screenshot evidence for dashboard/profile dark/light without claiming live VK host coverage.

## Verification

- `$env:AUTOTEST_PORT='4186'; npm run test:e2e:vk` - PASS, 4/4 tests. Default port `4174` is occupied on this workstation, so a free port was required.
- `npm run smoke:vk-home-parity` - PASS.
- `npm run smoke:vk-profile-parity` - PASS.
- `npm run smoke:vk-task-detail-edit` - PASS.
- `npm run smoke:vk-calendar-date-key` - PASS.
- `npm run smoke:vk-header-logo` - PASS.
- `npm run smoke:vk-auth-session` - PASS.
- `npm run smoke:vk-ai-chat-errors` - PASS.
- `npm run smoke:vk-ai-chat-parity` - PASS.
- `npm run smoke:vk-task-actions` - PASS.
- `npm run smoke:vk-task-complete` - PASS.
- `node scripts/check-cp1251-mojibake.mjs` - PASS, `0 suspicious tokens`.
- `git diff --check` - PASS.

## Commit

- App commit: d069c9d0cdbca2247e9c90e0e731248d8f8a6ad9

## Honest Tails

- No runtime VK redesign was attempted.
- No live VK host or live account flow was tested.
- No production deploy, no merge into `main`, no CAL, no prices, no secrets, no payment or entitlement changes.
- Pre-existing unrelated local modifications were left untouched.
