# REPORT - BRIEF-2026-07-27-84 profile premium banner remove

Status: DONE

## Summary

Removed the misleading Premium / trial-days banner from profile surfaces while keeping subscription access reachable through the profile subscription row and the dedicated subscription screen.

No prices, plan rules, entitlement logic, payment logic, VK Pay flow, production deploy, or `main` merge were changed.

## Changes

- `index.html`
  - Removed the profile-only `profile-premium-card` block that said `Premium активен · осталось 14 дней`.
  - Kept the profile subscription row (`showSubScreen('subscription')`) and the subscription screen intact.
- `vk.html`
  - Removed the profile-only `trial-banner`, trial-days display, and payment CTA banner.
  - Left the existing profile subscription row reachable.
  - Made the old trial-days update null-safe so VK profile render does not fail after the DOM removal.
- `scripts/profile-premium-banner-smoke.mjs`
  - Added a focused DOM smoke for web/VK profile banner removal and subscription reachability.
- `package.json`, `FILE_MAP.md`, `FILE_MAP_UI.md`
  - Registered the smoke and updated maps.

## Verification

- `npm run smoke:profile-premium-banner` - PASS
- `npm run smoke:home001` - PASS
- `npm run test:e2e:vk` - PASS, 4/4
- `node scripts/check-cp1251-mojibake.mjs` - PASS, 0 suspicious tokens

## Notes

`index.html` had a pre-existing unstaged language-row deletion before this task. I staged only the profile premium-card removal for this brief and left that unrelated change untouched.
