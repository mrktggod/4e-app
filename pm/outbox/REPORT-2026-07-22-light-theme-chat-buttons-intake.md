status: QA-INTAKE

# Light theme chat buttons intake — 2026-07-22

## Context

Alexey reported that one day after the redesign the UI still has missing/empty chat buttons in the light theme. This should not be treated as a simple "wait for cache" issue anymore.

Runtime code was not changed in this intake. Current working tree already has concurrent uncommitted changes in `index.html`, `styles/screens/home.less`, built CSS and PM files, so this report only records the finding and fix direction.

## Manual finding

In light theme, the chat buttons/surface are still visually empty or missing.

Impact: manual QA cannot reliably verify chat actions on the light theme, and users may see an apparently broken chat UI even when the underlying handlers exist.

## Source hint

Quick source scan shows the light-theme override block in `styles/screens/light-redesign.less` covers these major surfaces:

- `#home`
- `#profile`
- `#task-detail`
- `#subscription`

The same scan did not show an equivalent focused light-theme coverage block for the chat surfaces:

- `#ask`
- `#chats`
- `#chat-conv`

Relevant markup exists in `index.html`:

- `#ask` and `.ask-plan-row` quick buttons around the AI chat welcome surface
- `#chats` / `#chat-conv` chat list and conversation surfaces

Likely root-cause area: light theme color/background/icon contrast rules are incomplete for chat screens, or the deployed build has a mismatch between HTML and CSS/SW cache for those screens.

## Expected fix direction

1. Reproduce on a real mobile viewport in light theme.
2. Verify whether the issue appears in regular mobile browser and Telegram WebView.
3. Add focused light-theme rules for `#ask`, `#chats`, and `#chat-conv` buttons/icons/text, using existing design tokens.
4. Add a 390x844 smoke/screenshot fixture that opens light theme chat surfaces and asserts visible button text/icons.
5. If Telegram differs from browser after browser is green, treat the remaining issue as Telegram WebView/service-worker cache separately.

## Stop points

- Do not overwrite current uncommitted redesign/focus work.
- No production deploy.
- No merge into `main`.
- No auth-security, payment, entitlement, CAL, secrets or broad redesign architecture work.
