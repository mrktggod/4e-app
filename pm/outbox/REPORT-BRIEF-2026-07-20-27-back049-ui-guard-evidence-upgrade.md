status: DONE

# REPORT-BRIEF-2026-07-20-27-back049-ui-guard-evidence-upgrade

## Result
Upgraded BACK-049 evidence from generic source/process evidence to `LIVE/PARTIAL` process/tooling proof in `docs/tasks/EVIDENCE-AUDIT-2026-07-17.md`. No product runtime files were changed.

## Guard Pattern References
- Baselines: `scripts/check-ui-architecture.sh:6-9` sets max inline styles `465`, inline handlers `402`, style tags `0`, inline script tags `3`.
- Pattern counter: `scripts/check-ui-architecture.sh:11-20` uses `rg -o`.
- Inline script counter: `scripts/check-ui-architecture.sh:22-30` counts `<script>` tags except external `src=` scripts.
- Counted patterns: `scripts/check-ui-architecture.sh:34-37` counts `style=`, `on[a-z]+=`, `<style`, and inline script tags.
- Required CSS artifact: `scripts/check-ui-architecture.sh:65-68` requires `styles.min.css`.
- Fail condition: `scripts/check-ui-architecture.sh:39-49` and `scripts/check-ui-architecture.sh:72-75`.
- Product rule: `docs/ui-architecture-rules.md:28-31` bans new inline `style`, inline handlers, inline `<style>`, inline `<script>`, and requires `styles.min.css`.

## Current HEAD Guard Run
```text
UI architecture guard: inline style attributes = 356 / 465
UI architecture guard: inline event handlers = 397 / 402
UI architecture guard: style tags = 0 / 0
UI architecture guard: inline script tags = 3 / 3
```

## Negative Scratch Test
Scratch file was created outside the git tree at `%TEMP%\back049-ui-guard-negative.html`, with a valid `styles.min.css` link and 403 deliberate `onclick` handlers. It was removed after the test.

```text
Scratch: %TEMP%\back049-ui-guard-negative.html
UI architecture guard: inline style attributes = 0 / 465
UI architecture guard: style tags = 0 / 0
UI architecture guard: inline script tags = 0 / 3
Exit code: 1
UI architecture guard failed: inline event handlers = 403, allowed max = 402

New UI code must not increase legacy inline debt.
Use:
- styles/**/*.less for visual styles;
- BEM-like class names for UI blocks and elements;
- addEventListener or delegated JS handlers instead of onclick/oninput/onchange in HTML.
```

## Verification
- `bash scripts/check-ui-architecture.sh`: passed on current HEAD with baseline counts above.
- Negative scratch test: failed as expected with exit code `1`.
- `node scripts/check-cp1251-mojibake.mjs`: passed, `0 suspicious tokens`.
- Staged `node scripts/check-js-syntax.mjs`: passed with `no staged JS or HTML files`.
- `git diff --cached --check`: passed.
- `bash scripts/check-portable-paths.sh`: passed.

## Safety
No `index.html`, `vk.html`, `styles/**`, Worker, payment, entitlement, auth-security, production, CAL, secret, or deploy behavior was changed. The local absolute temp path from the raw command output is normalized to `%TEMP%` for portable-path compliance.

## Commit
This commit; exact pushed SHA is recorded in the automation final summary.
