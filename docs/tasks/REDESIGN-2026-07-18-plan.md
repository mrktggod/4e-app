# REDESIGN-2026-07-18 plan

Date: 2026-07-18
Scope: intake plan for Yuri's new visual redesign references after app/worker merge to main.
Mode: plan only. No runtime code, no payment/auth logic, no price/CAL/native changes.

## 1. Preconditions checked

- App PR #27 was merged to main and production checks were green after worker deploy.
- Worker main deploy was green after `CF_API_TOKEN` was added to the worker GitHub repo.
- This plan is prepared on a separate branch: `codex/redesign-intake-plan`.
- Raw mockup exports stay outside the app repo under `<design-reference-root>` and are treated as visual references, not code to paste into `index.html` or `vk.html`.

## 2. Reference inventory

| Reference | Size / format | Intended target in current app | Theme coverage | Notes |
| --- | ---: | --- | --- | --- |
| `4_chat_light_v1.html` | about 12 KB HTML | `#chat-conv` conversation screen | Light | Soft-glass chat layout with assistant/user bubbles, plan card, confirm block, bottom composer. |
| `4_chat_dark_v2_handoff (1).zip` / `4_chat_dark_v2.html` | about 20 KB HTML inside zip | `#chat-conv` conversation screen | Dark plus token variants | Same chat structure as light; zip contains `index.html`, `4_chat_dark_v2.html`, `README.txt`. |
| `4_profile_light_v1.html` | about 88 KB HTML | `#profile` and extended profile form | Light | Profile hero, premium card, personal data rows, settings rows, save/logout. |
| `4_profile_dark_v2.html` | about 1.3 MB HTML | `#profile` and extended profile form | Dark/reference variant | Heavy export with embedded assets. Use only as visual reference; do not copy raw file into app repo. |
| `4_task_detail_light_v1.html` | about 1.3 MB HTML | `#task-detail` | Light only | Task hero, metadata, participant avatars, status card, embedded chat/messages, composer/action row. |
| `4_task_detail_light_v1_handoff ...zip` | about 1.9 MB zip | `#task-detail` | Light | Handoff bundle for task detail. Treat as reference only. |
| PNG references | 1.2-1.7 MB each | Global atmosphere / previous design direction | Mixed | Non-code references. If preserved later, store optimized images only under docs/design-reference, not app runtime. |

## 3. Current implementation mapping

| App area | Current files / selectors | Current state | Redesign risk |
| --- | --- | --- | --- |
| Profile | `index.html`, `styles/screens/profile.less`, `scripts/task-ui-renderers.js` via `openProfile()` and `renderExtendedProfile()` | Already has dark/light theme variables, extended personal data, status badges, save button, notification controls and AI memory rows. | Medium. Mostly CSS/layout work, but profile has many real data fields and must preserve form state, verification badges and accessibility. |
| Chat conversation | `#chat-conv`, `styles/screens/voice.less`, chat/message functions in `index.html` | Conversation screen exists and has responsive desktop overrides. Styling currently lives partly in `voice.less`. | Medium-high. Composer and message flow are interaction-heavy; visual changes must not break send, task actions, AI replies or keyboard behavior. |
| Task detail | `#task-detail`, `styles/screens/tasks.less`, `scripts/platform-adapter.js`, task render/edit functions in `index.html` | Rich screen with task fields, person/contact actions, checklist, reminders, comments/chat and bottom actions. Existing markup still includes legacy inline styles for `#task-detail-tabs` and `#task-detail-actions`. | High. Most complex screen. Good redesign candidate, but must be split carefully and can also pay down existing inline debt. |
| Home | `#home`, `styles/screens/home.less` | HOME-001 already implemented separately. | Out of scope. No home mockup was provided in this batch. Do not redesign home in this pass. |

## 4. Token comparison and proposed LESS translation

Current app tokens are simple global CSS variables in `styles/variables.less`:

| Current token family | Current examples | Mockup token family | Proposed handling |
| --- | --- | --- | --- |
| Background | `--bg`, `--bg2`, `--bg3` | `--bg-a`, `--bg-b`, `--bg-c`, `--bg-top`, `--bg-mid`, `--bg-bottom` | Add semantic LESS/CSS variables for redesign surfaces, not raw per-file names. Example: `--surface-page-a`, `--surface-page-b`, `--surface-panel`. |
| Text | `--text`, `--text2`, `--muted` | `--ink`, `--text`, `--text-2`, `--muted`, task detail `--text-main`, `--text-sub` | Keep current semantic names, add screen-scoped aliases where needed. Avoid changing global contrast until one screen is validated. |
| Accent | `--green`, `--green2`, `--green3`, `--green-dark` | `--green`, `--green-deep`, `--green-lite`, `--green-strong`, `--green-soft`, `--icon-green` | Map to a small accent scale: base, strong, soft, muted. Do not introduce one-off greens per component. |
| Glass | current `.glass` and theme overrides | `--glass-top`, `--glass-mid`, `--glass-bottom`, `--glass-stroke`, `--soft-stroke`, `--glass-fill-*` | Create reusable glass mixin/classes in LESS, then apply per screen. Do not paste inline backdrop styles. |
| Radius | implicit values across files | `--card-radius=20px`, `--row-radius=16px` | Consolidate into variables like `--radius-card`, `--radius-row`, `--radius-pill`. |
| Shadows | `--shadow` | layered `--shadow`, `--shadow-sm` with inset highlights | Introduce `--shadow-glass` and `--shadow-glass-sm`; verify performance and contrast on mobile. |

Important observation: the task detail mockup uses a blue-ish text palette (`--text-main=#17324a`) while profile/chat are warm neutral and green. During implementation, choose whether task detail intentionally gets that editorial blue tone or whether it should be normalized into the global 4 palette. This is a product/design decision before broad rollout.

## 5. Implementation order, smallest safe path

Recommended order from lowest to highest risk:

1. Profile light shell
   - Why first: profile is mostly structured cards/rows and already has matching data fields.
   - Files likely touched: `styles/screens/profile.less`, possibly small class additions in `index.html` if current hooks are insufficient.
   - DoD: visual profile hero, premium card and personal/settings rows move toward soft-glass; existing fields still save; no new inline styles/handlers.

2. Chat conversation shell
   - Why second: chat mockup is compact and defines a reusable soft-glass message language.
   - Files likely touched: `styles/screens/voice.less` or a new `styles/screens/chat.less` included from `styles/main.less`; minimal markup class additions if needed.
   - DoD: assistant/user bubbles, plan card and composer match reference direction; sending message and task-confirm actions still work.

3. Task detail light redesign
   - Why third: largest interaction surface and highest regression risk.
   - Files likely touched: `styles/screens/tasks.less`, `index.html`, maybe `scripts/platform-adapter.js` only if class toggles need cleanup.
   - DoD: remove or reduce existing inline debt around `#task-detail-tabs` and `#task-detail-actions`; preserve edit/save, person/contact, checklist, chat/comments, reminder and bottom actions.

4. Dark variants
   - Why after light: current app already has `[data-theme="light"]` overrides, while default dark is production baseline. Apply token model after at least one light implementation is stable.
   - DoD: no contrast regression, no duplicated theme-specific CSS pasted from exports.

## 6. Expected diff size

| Screen | Expected size | Risk notes |
| --- | ---: | --- |
| Profile | Small/medium, about 80-180 LESS lines plus small markup class cleanup | Good first slice. Avoid rewriting profile data logic. |
| Chat | Medium, about 120-260 LESS lines | Composer/keyboard behavior must be smoke-tested. |
| Task detail | Large, about 250-500 LESS lines plus markup cleanup | Needs its own branch/smoke. Do not combine with profile/chat implementation. |
| Token layer | Small, about 30-80 lines | Add semantic variables/mixins only when the first implementation slice needs them. |

## 7. Guardrails for implementation

- No new `style=""`, `onclick`, `oninput`, `onchange`, inline `<style>` or inline `<script>` in `index.html` / `vk.html`.
- New styles go to LESS screen files and are built with `npm run build:css`.
- Events go through existing handlers or `addEventListener` / delegated listeners.
- Keep accessibility baseline on every touched screen: labels/aria labels, visible focus, touch target size, reduced motion behavior where motion is added.
- Run the UI guards and smoke only after each single-screen slice, not after a huge multi-screen diff.
- Do not touch payment/auth logic, prices, CAL, native, or beta invite flows in redesign branches.

## 8. Proposed next branch sequence

| Branch | Scope | Merge target |
| --- | --- | --- |
| `codex/redesign-profile-soft-glass` | Profile only | PR/go-no-go before main |
| `codex/redesign-chat-soft-glass` | Chat conversation only | PR/go-no-go before main |
| `codex/redesign-task-detail-soft-glass` | Task detail only | PR/go-no-go before main |

Each branch should be cut from current `main`, deployed/smoked on staging, and reviewed before any production merge.

## 9. Explicit non-scope

- HOME-001 is already implemented separately and is not part of this redesign intake. No home mockup was provided in this batch.
- Raw AI-export HTML files are not production code. Do not paste them into app runtime.
- Do not store heavy base64 HTML exports in the app repo. If references need to be preserved, create a docs-only design-reference package with optimized screenshots and a short manifest.
- Do not remove `<design-reference-root>` or old `redesign/patches/`; they are separate sources and need a separate cleanup decision.

## 10. Recommendation

Start with `codex/redesign-profile-soft-glass` after this plan is confirmed. Profile gives the best ratio of visible polish to regression risk, and it lets us establish the shared soft-glass token layer before touching chat/composer or task-detail editing flows.
