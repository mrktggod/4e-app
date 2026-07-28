# REPORT-BRIEF-2026-07-24-55-glass-profile-menu-package2

Outcome: `DONE`

## What Changed

Closed the safe Telegram profile/menu package 2 glass slice after briefs 53 and 54 were completed.

Changed files:

- `styles/screens/profile.less`
  - profile hero and safe profile cards now use shared `--glass-*` surface, stroke, radius, shadow, blur and reduced-transparency fallback tokens;
  - safe menu rows keep 44px touch targets and get shared glass focus/hover treatment;
  - referral field and secondary copy button use shared glass control radius/surface tokens.
- `styles.css`, `styles.min.css`
  - rebuilt from LESS.
- `scripts/profile-glass-smoke.mjs`
  - opens Telegram profile at 390x844 in light and dark themes;
  - saves screenshots and asserts profile visibility, no horizontal overflow, glass radius, blur, shadow, row target size and referral control radius.
- `package.json`
  - adds `npm run smoke:profile-glass`.

No profile persistence, identity logic, auth, password reset, payments, subscription, entitlement, price, CAL, VK, production deploy or `main` work was changed.

## Sensitive Rows Excluded

The profile settings rows tied to subscription and security are excluded from the new interactive row glass treatment:

- `Подписка`
- `Безопасность`

They stay reachable but were not converted into new active/hover glass controls in this slice.

## Proof

Commands run before commit:

```text
node scripts/check-cp1251-mojibake.mjs
CP1251 mojibake check passed: 0 suspicious tokens

npm run build:css
exit 0

npm run smoke:profile-glass
profile glass smoke: PASS
light: viewportWidth=390, documentScrollWidth=390, heroBorderRadius=30px, heroBackdropFilter=blur(26px) saturate(1.28), rowMinHeight=44px, refInputBorderRadius=24px
dark: viewportWidth=390, documentScrollWidth=390, heroBorderRadius=28px, heroBackdropFilter=blur(24px) saturate(1.25), rowMinHeight=44px, refInputBorderRadius=22px

npm run test:e2e:web
16 passed

PowerShell equivalent of scripts/check-portable-paths.sh
Portable path check passed.

PowerShell equivalent of scripts/check-ui-architecture.sh
inline style attributes = 292 / 465
inline event handlers = 401 / 402
style tags = 0 / 0
inline script tags = 3 / 3

git diff --check
exit 0
```

`npm run check:portable-paths` and `npm run check:ui-architecture` could not run through `scripts/run-bash-script.mjs` because `bash` is not available in PATH in this session; the same guard logic was run directly without calling a shell through an absolute drive path.

`npm run smoke:back050` did not finish within the local run limit in three attempts, including one with `CHROME_PATH=msedge`. It produced no assertion output before timeout. The profile-specific accessibility/touch target part is covered by `smoke:profile-glass`; BACK-050 remains a local tool/runtime tail, not a known profile regression.

## Screenshots

- `docs/tasks/assets/PROFILE-glass-package2-2026-07-28-light.png`
- `docs/tasks/assets/PROFILE-glass-package2-2026-07-28-dark.png`

## Remaining Manual Tail

Real Telegram Mini App visual QA on a phone remains manual-only.

## Commit

Included in this task commit on `feat/admin-tariff-api`. The final SHA is recorded in the runner report after commit creation.
