status: DONE

# REPORT-BRIEF-2026-07-20-26-layout-overlaps-from-gpt-qa

## Result
Applied narrow layout-only CSS fixes for the three GPT-QA overlap findings. No prices, payment logic, auth logic, entitlement logic, production deploy, CAL, or secrets were touched.

## Fixes
- Subscription CTA vs bottom nav: increased subscription scroll reserve and scroll padding in `styles/screens/home.less:656`; added bottom margin to subscription primary CTA selectors at `styles/screens/home.less:847`.
- Chat quick-actions/input vs bottom nav: added CSS nav suppression for active chat conversation at `styles/screens/voice.less:461`; added conversation scroll/chips/input safe-area reserve at `styles/screens/voice.less:535`, `styles/screens/voice.less:552`, and `styles/screens/voice.less:556`.
- Global nav on auth screens: added CSS fallback hiding `#global-nav`, `.bottom-nav`, and `.bottom-nav-v2` on onboarding/login/forgot/reset screens at `styles/layout.less:81`.
- Built CSS artifacts: `styles.css` and `styles.min.css`.

## Verification
- `npm run build:css`: passed.
- `npm run smoke:back050`: passed, `"ok": true`, `failures: []`, `documentScrollWidth: 390`, `viewportWidth: 390`.
- `node scripts/check-cp1251-mojibake.mjs`: passed, `0 suspicious tokens`.
- `bash scripts/check-ui-architecture.sh`: passed, inline handlers `397 / 402`, inline script tags `3 / 3`.
- Staged `node scripts/check-js-syntax.mjs`: passed with `no staged JS or HTML files`.
- `git diff --cached --check`: passed.
- `bash scripts/check-portable-paths.sh`: passed.

## Staging / Visual Proof
No staging deploy was performed by this automation. Local headless mobile proof is `smoke:back050`; subscription/chat overlap changes are source+CSS artifact proof and should be visually checked on the next direct staging/preview deployment.

## NEED-CLAUDE Tail
No NEED-CLAUDE tail. The worktree was clean before this task, and the fixes were narrow CSS-only changes on the committed redesign surface.

## Commit
This commit; exact pushed SHA is recorded in the automation final summary.
