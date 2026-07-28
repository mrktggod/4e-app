# REPORT-BRIEF-2026-07-24-56-glass-package2-visual-qa-handoff

Outcome: `DONE`

## Scope

Closed the package 2 visual QA handoff for the already completed glass slices.
No new runtime design family was added. The only code change was a narrow
`smoke:back050` reliability fix: the script now uses the same Windows
Chrome/Edge candidates and bounded Chrome cleanup pattern as the working
home smoke.

Production and `main` were untouched. No CAL, price, payment, entitlement,
auth-security or secret work was touched.

## Brief / Commit Matrix

| Brief | Outcome | Commit |
| --- | --- | --- |
| `BRIEF-2026-07-24-53-glass-home-focus-dashboard-package2.md` | `DONE` | `60dd5979d8e9a2859c2acbf73e31733afb669afd` |
| `BRIEF-2026-07-24-54-glass-task-list-card-family-package2.md` | `DONE` | `a839a26d9b88c985f223de4cc4ca291d0b78158a` |
| `BRIEF-2026-07-24-55-glass-profile-menu-package2.md` | `DONE` | `2fa8e39da4dd1e3f126d8f932a1f050d8ad9f007` |

## Evidence Set

Home/focus light and dark at 390x844:

- `docs/tasks/assets/HOME-001-dashboard-smoke-2026-07-20-light.png`
- `docs/tasks/assets/HOME-001-dashboard-smoke-2026-07-20-dark.png`
- `npm run smoke:home001`: `ok=true`, `failures=[]`, `viewportWidth=390`, `documentScrollWidth=390`, `homeRows=3`, `dark.scrollWidth=390`, `light.scrollWidth=390`.

Task list with overdue, normal and completed states:

- `docs/tasks/assets/BACK-019-task-card-glass-2026-07-27-light.png`
- `docs/tasks/assets/BACK-019-task-card-glass-2026-07-27-dark.png`
- `npm run smoke:back019`: `ok=true`, `failures=[]`, `viewportWidth=390`, `documentScrollWidth=390`, `doneFetchCount=1`, `doneFailureToast="Не удалось завершить задачу"`, `lastCardBottom=631`, `navTop=764`.

Profile/menu light and dark at 390x844:

- `docs/tasks/assets/PROFILE-glass-package2-2026-07-28-light.png`
- `docs/tasks/assets/PROFILE-glass-package2-2026-07-28-dark.png`
- `npm run smoke:profile-glass`: `PASS`, both themes `viewportWidth=390`, `documentScrollWidth=390`, profile visible, row touch target `44px`.

Desktop overflow:

- `npm run test:e2e:web`: `16 passed`.
- Desktop coverage includes `navigation-safe-area.spec.ts` home bottom navigation without horizontal overflow and global navigation without horizontal overflow.

## Verification

```text
npm run smoke:home001
PASS: ok=true, failures=[]

npm run smoke:back019
PASS: ok=true, failures=[]

npm run smoke:back050
PASS: ok=true, failures=[]

npm run smoke:profile-glass
PASS

npm run test:e2e:web
PASS: 16 passed
```

```text
node --check scripts/back-050-accessibility-smoke.mjs
PASS

node scripts/check-cp1251-mojibake.mjs
CP1251 mojibake check passed: 0 suspicious tokens

$env:BASH_PATH='C:\Program Files\Git\bin\bash.exe'; npm run check:portable-paths
Portable path check passed.

git diff --check
PASS
```

## Implemented vs Deferred Families

Implemented in package 2:

- home/focus dashboard surfaces;
- Telegram task-list cards, including overdue, normal, completed and swipe/done states;
- safe Telegram profile/menu surfaces excluding subscription/security-sensitive rows.

Deferred:

- global `DESIGN-GLASS-001` completion;
- global form fields and dialogs;
- chat conversation surface consolidation;
- task-detail variable consolidation;
- reference file restoration under `pm/design-references/`;
- real Telegram Mini App phone visual QA.

## Morning Review Questions

1. Should package 3 start with dialogs/forms or chat conversation surfaces?
2. Should missing `pm/design-references/` files be restored to app PM storage or kept only in private docs?
3. Is the task-detail `--detail-*` token family acceptable until a separate consolidation brief?
4. Should real TMA phone visual QA be scheduled before any next glass package?
5. Are subscription/security profile rows intentionally excluded from glass row hover treatment for beta?
