# REPORT-BRIEF-2026-07-22-35-smart007-memory-ui-regression-smoke

## Outcome

status: DONE

## Cases Added

- Long HTML-like payload is rendered as text, not executable markup.
- XSS probe flag remains `0`.
- Long memory row keeps `scrollWidth=390` and delete button visible.
- Local empty state appears after injected facts are cleared and disables the forget-all button.
- Local error state uses sanitized user-facing text with no `token`, `authorization`, `bearer`, `stack`, `trace`, `sql`, `d1`, `kv`, `password`, or `secret` markers.
- Reload after deleting one staging fact renders the remaining 3 rows.
- Reload after clearing all staging facts renders 0 rows and the empty state.

## Changed Files

- `scripts/smart-007-memory-fixture-smoke.mjs`
- `pm/inbox/BRIEF-2026-07-22-35-smart007-memory-ui-regression-smoke.md`
- `pm/outbox/REPORT-BRIEF-2026-07-22-35-smart007-memory-ui-regression-smoke.md`

## Raw Output

Command:

```text
npm run smoke:smart007
```

Key proof:

```text
facts.poll.1: 200 ... count=4
facts.delete-one: 200 ...
facts.after-delete-one: 200 ...
facts.clear-all: 200 ...
facts.after-clear: 200 ...
smart-007-memory-fixture-smoke: OK
```

DOM proof:

```json
{
  "dom": {
    "rows": 4,
    "scrollWidth": 390,
    "localProbe": {
      "textLength": 320,
      "textIncludesPayload": true,
      "htmlEscaped": true,
      "xssFlag": 0,
      "longLayout": {
        "scrollWidth": 390,
        "rowHeight": 83,
        "buttonVisible": true
      },
      "emptyForgetDisabled": true,
      "hasTechnicalLeak": false
    }
  },
  "domAfterDelete": {
    "rows": 3,
    "scrollWidth": 390
  },
  "domAfterClear": {
    "rows": 0,
    "emptyText": "Пока пусто. Когда в диалоге появятся устойчивые факты о вас, они появятся здесь.",
    "forgetDisabled": true,
    "scrollWidth": 390
  },
  "afterDeleteCount": 3,
  "afterClearCount": 0
}
```

The run used a fresh synthetic `smart007-fixture-* @example.org` test account. Tokens were redacted in script output.

## Verification

- `node --check scripts/smart-007-memory-fixture-smoke.mjs`
- `node scripts/check-cp1251-mojibake.mjs`
- `git diff --check -- scripts/smart-007-memory-fixture-smoke.mjs`
- `npm run smoke:smart007`

## Commit

Pending this task commit.

## Boundaries

No AI-memory v2/v3, production deploy, `main` merge, payment, entitlement, auth-security, CAL, personal data, or secrets work was done. Runtime product behavior was not changed; this is a regression-evidence upgrade to the existing smoke.
