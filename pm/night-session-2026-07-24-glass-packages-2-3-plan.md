# Long night session extension - DESIGN-GLASS-001 packages 2 and 3

Window: 2026-07-24 -> 2026-07-25  
Goal: use the new autonomous visual/test tooling to move more of the design
system tonight while keeping each task narrow, reviewable and reversible.

## Source of truth

- Reference image: `pm/design-references/glass-card-reference.png`
- Reference spec: `pm/design-references/glass-card-reference-spec.md`
- Package 1 plan: `pm/night-session-2026-07-24-glass-reference-plan.md`
- Existing test map: `FILE_MAP.md`, `package.json`,
  `docs/qa/autotest-agent-playbook.md`

## Package 2 - primary Telegram surfaces

| Order | Brief | Intended result | Expected commit |
| ---: | --- | --- | --- |
| 5 | `BRIEF-2026-07-24-53-glass-home-focus-dashboard-package2` | Home/focus dashboard uses shared glass primitives | `feat(ui): apply glass system to home dashboard` |
| 6 | `BRIEF-2026-07-24-54-glass-task-list-card-family-package2` | Repeated task-list cards match the new task-detail language | `feat(ui): apply glass system to task cards` |
| 7 | `BRIEF-2026-07-24-55-glass-profile-menu-package2` | Safe profile/menu surfaces align without touching auth/payment | `feat(ui): apply glass system to profile menu` |
| 8 | `BRIEF-2026-07-24-56-glass-package2-visual-qa-handoff` | Evidence and review questions for package 2 | `docs(ui): close glass package 2` |

## Package 3 - interactions and parity

| Order | Brief | Intended result | Expected commit |
| ---: | --- | --- | --- |
| 9 | `BRIEF-2026-07-24-57-glass-forms-dialogs-controls-package3` | Safe buttons, fields, dialogs and popups align with tokens | `feat(ui): apply glass system to controls` |
| 10 | `BRIEF-2026-07-24-58-glass-chat-conversation-package3` | Telegram chat panel/composer uses the reference language | `feat(ui): apply glass system to chat` |
| 11 | `BRIEF-2026-07-24-59-glass-vk-parity-package3` | Safe VK surfaces visually align with Telegram glass system | `feat(vk): align safe surfaces with glass system` |
| 12 | `BRIEF-2026-07-24-60-glass-package3-final-qa-handoff` | Final evidence index, full gate and morning review list | `docs(ui): close glass night packages` |

## Runner rule

Process briefs in filename order after package 1. One brief equals one task,
one report and one commit. Stop honestly when a dependency, focused smoke or
visual regression fails; do not flatten several packages into one broad commit.

## Test leverage

- Home/focus: `npm run smoke:home001`
- Task cards: `npm run smoke:back019`
- Accessibility/dialogs: `npm run smoke:back050`
- Reminder/tag popups: `npm run smoke:back067-reminder`,
  `npm run smoke:back068-tag-popup`
- Chat/keyboard/history: `npm run test:e2e:web`,
  `npm run smoke:chat-history40`, `npm run smoke:back065`
- VK parity: `npm run smoke:vk-home-parity`,
  `npm run smoke:vk-profile-parity`, `npm run smoke:vk-task-detail-edit`,
  `npm run smoke:vk-calendar-date-key`, `npm run test:e2e:vk`
- Handoffs: `npm run qa:prebeta`

## Permanent boundaries

- No production deploy.
- No merge into `main`.
- No CAL, prices, payments, entitlement, auth-security or secrets.
- No one-shot global restyle.
- No new inline styles or inline handlers.
- No weakening tests or hiding flaky results.
- No hardcoded screenshot sample content.

## Morning review

The final package 3 report should let Alexey and Yuri decide quickly:

1. Which Telegram surfaces now feel coherent with the reference?
2. Which VK surfaces are visually close enough for beta?
3. Which controls still need a sensitive-area review before restyling?
4. Did any automation test reveal design regressions?
5. What remains for a later design package rather than this night?
