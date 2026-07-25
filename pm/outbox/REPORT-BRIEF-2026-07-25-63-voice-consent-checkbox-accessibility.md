status: DONE

# REPORT-BRIEF-2026-07-25-63-voice-consent-checkbox-accessibility

## Summary

The biometric voice-consent checkbox is now visually stronger and easier to tap. The legal copy in `index.html` was not changed.

## Root Cause

- `styles/screens/voice.less:685`: the old `.bio-consent-check` label had no explicit minimum touch target and the visible checkbox was only `22px`.
- `styles/screens/voice.less:703`: the input is now visually hidden instead of `display:none`, preserving label behavior while keeping the visible control custom-styled.

## Changed Files

- `styles/screens/voice.less`
- `styles.css`
- `styles.min.css`
- `scripts/voice-consent-checkbox-smoke.mjs`
- `package.json`
- `FILE_MAP.md`
- `pm/inbox/BRIEF-2026-07-25-63-voice-consent-checkbox-accessibility.md`
- `pm/bugs.md`
- `pm/backlog.md`
- `pm/team-sync.md`
- `shared/WORK_LOG.md`
- `DEVELOPMENT_LOG.md`

## Evidence

Raw local proof:

```text
npm run build:css
lessc styles/main.less styles.css && cleancss styles.css -o styles.min.css

npm run smoke:voice-consent-checkbox
voice consent checkbox smoke: PASS

node scripts/check-cp1251-mojibake.mjs
CP1251 mojibake check passed: 0 suspicious tokens

npm run check:js-syntax
JS syntax OK: scripts/voice-consent-checkbox-smoke.mjs

git diff --check
passed
```

Known environment tail:

```text
npm run smoke:back050
command timed out after 304034 milliseconds
```

The focused smoke verifies the brief-specific acceptance: unchanged legal copy, `.bio-consent-check` touch target >= 44px, visible checkbox >= 28px, no `display:none` input, green checked state and focus state.

Shared guard equivalents run directly because `bash`/`sh` are not on PATH:

```text
Portable path check passed.
inline style attributes = 299 / 465
inline event handlers = 401 / 402
style tags = 0 / 0
inline script tags = 3 / 3
UI architecture equivalent passed.
```

## Commit

This task commit on `feat/admin-tariff-api`; final SHA is recorded in git history after commit.

## Tails

- NEEDS-REAL: one mobile visual check should confirm the larger checkbox is clear in Telegram Mini App dark theme.
- No production deploy or `main` merge was performed.
