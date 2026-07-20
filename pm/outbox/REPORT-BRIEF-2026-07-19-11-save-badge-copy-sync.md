status: DONE

# REPORT-BRIEF-2026-07-19-11-save-badge-copy-sync

## Result

Aligned the fallback yearly subscription badge copy from `Выгода 20%` to `Выгода 16%` in the app and worker fallback config. Numeric prices, Stars, trial settings, KV tariff config, payment logic, and entitlement logic were not changed.

## Changed Files

- `index.html:729` - static yearly badge now says `Выгода 16%`.
- `index.html:2382` - `DEFAULT_TARIFF_CONFIG.year.saveBadge` now defaults to `Выгода 16%`.
- Worker `worker.js:97` - fallback yearly badge now says `Выгода 16%`.
- `pm/inbox/BRIEF-2026-07-19-11-save-badge-copy-sync.md` - marked DONE.
- `pm/outbox/REPORT-BRIEF-2026-07-19-11-save-badge-copy-sync.md` - this report.

## Raw Proof

Before:

```text
index.html:729:<div class="pricing-badge-save" id="pricing-year-badge">Выгода 20%</div>
index.html:2382:saveBadge: 'Выгода 20%'
worker.js:97:saveBadge: "Выгода 20%",
BeforeCyrillicMarkers=106
```

After:

```text
index.html:729:<div class="pricing-badge-save" id="pricing-year-badge">Выгода 16%</div>
index.html:2382:saveBadge: 'Выгода 16%'
worker.js:97:saveBadge: "Выгода 16%",
AfterCyrillicMarkers=106
```

Checks:

```text
node scripts/check-cp1251-mojibake.mjs
CP1251 mojibake check passed: 0 suspicious tokens
git diff --check
```

## Commits

- App commit: `d2f465b0795f9e1f0784f85a4ccae3913a38a893`
- Worker commit: `faa95dcd58794365ec54ea68002d534589b27cdb`

## Honest Tails

- `NEEDS-REAL`: no manual staging Pages deployment or screenshot/DOM proof was performed in this pass.
- `bash scripts/check-portable-paths.sh` could not run because `bash` is not available in this PowerShell environment.
- No production deploy.
- No merge into `main`.
- No CAL, price, secret, payment, or entitlement work.
