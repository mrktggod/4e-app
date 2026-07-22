# REPORT-BRIEF-2026-07-22-36-privacy-surface-regression-smoke

## Outcome

status: DONE

## Artifact Evidence

- `scripts/build-pages-whitelist.mjs` requires `privacy.html`.
- `npm run build:worker-assets` produced `.pages-dist/privacy.html`.
- `.pages-dist/privacy.html` contains RKN number `102299/77`.
- `.pages-dist/privacy.html` has a non-empty `<title>` and `<h1>`.

## UI Link Evidence

- `index.html` contains `data-privacy-policy-link` anchors for onboarding and the shared login/register legal note.
- All checked privacy links have `href="privacy.html"`.
- `openPrivacyPolicy()` targets `new URL('privacy.html', window.location.href)`.
- `bindPrivacyPolicyLinks()` binds `[data-privacy-policy-link]`.
- `styles/layout.less` gives `.auth-legal-link` `display:inline-flex` and `min-height:44px`.

## Changed Files

- `package.json`
- `scripts/privacy-surface-smoke.mjs`
- `pm/inbox/BRIEF-2026-07-22-36-privacy-surface-regression-smoke.md`
- `pm/outbox/REPORT-BRIEF-2026-07-22-36-privacy-surface-regression-smoke.md`

## Raw Output

Commands:

```text
npm run build:worker-assets
npm run smoke:privacy-surface
```

Key output:

```json
{
  "artifact": {
    "privacyHtmlIncluded": true,
    "rknNumberFound": true
  },
  "links": {
    "count": 2,
    "onboarding": true,
    "loginRegister": true,
    "hrefs": ["privacy.html", "privacy.html"],
    "handlerTargetsPrivacyHtml": true
  },
  "hitArea": {
    "selector": ".auth-legal-link",
    "minHeight44": true,
    "inlineFlex": true
  }
}
```

## Verification

- `npm run build:worker-assets`
- `npm run smoke:privacy-surface`
- `node --check scripts/privacy-surface-smoke.mjs`
- `node scripts/check-cp1251-mojibake.mjs`
- `git diff --check`
- `scripts/check-portable-paths.sh` via Git Bash

## Commit

Pending this task commit.

## Boundaries

Legal policy text was not changed. No production deploy, `main` merge, payment, entitlement, auth-security logic, CAL, or secrets work was done.
