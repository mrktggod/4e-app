status: NEED-CLAUDE-PENDING-REVIEW

## ⚠️ Delivery note
Same untracked-file delivery risk as `-01`/`-02` — see `-01`'s note.

# BRIEF-2026-07-21-morning-refine-03-platform-global-alias-investigate

## ⚠️ This is an investigation + report brief, NOT an autonomous-apply brief.
Do the investigation and live re-tests below. If the narrow one-line fix at the end still looks safe after full regression evidence, propose it and mark **NEED-CLAUDE** with the evidence attached — Cowork (Claude) will review before it's applied. Do not commit the fix itself without that review, even if the diff looks trivial: this single line activates many previously-dead code paths at once (see below), and a couple of them (OAuth) have user-facing failure behavior that needs a live click-through, not just a code read.

## Context
While reviewing the auth-avatar-login diagnosis (`3829712`), Cowork found what looks like the actual root cause behind it, and a wider risk than the one bug that was reported:

**`window.PLATFORM` is referenced 17+ times across `scripts/auth.js` and `scripts/auth-handlers.js` (e.g. `auth.js:6,10,11,15,19,100,106,110,114,119,126,130,134,138,142,160,167,171,194`) but is never assigned anywhere as a global.**
- `scripts/platform-adapter.js:1110` sets `window.FourPlatform = {...}` — a different name.
- `index.html:1839` reads `const PLATFORM = window.FourPlatform || {}` — but this is a **local const inside index.html's own inline `<script>` block**, not a global; it only helps index.html's own inline code, not the separately-loaded `scripts/auth.js` / `scripts/auth-handlers.js` files.
- Grepped the whole repo for `window.PLATFORM\s*=` and `PLATFORM\s*=` (excluding the `?.` reads) — no other assignment exists.
- Net effect: every `window.PLATFORM?.xxx` check in `auth.js`/`auth-handlers.js` evaluates to `undefined`, so these files always take their `: <fallback>` branch, never the intended platform-adapter delegation. This exactly explains the password-error bug in brief `-01` (the "modern" branch at `auth.js:171` never runs; only the buggy legacy branch at line 180 does).

## Why this matters more broadly than the one bug already found
Look at `scripts/auth.js:9-11`:
```js
async function createOAuthPkce(){
    if(!window.PLATFORM?.createOAuthPkce) throw new Error('platform adapter unavailable');
    return window.PLATFORM.createOAuthPkce();
}
```
There is **no fallback** here — if `window.PLATFORM` is always undefined, every call to `createOAuthPkce()` throws `'platform adapter unavailable'`. This function is used to start VK ID / Yandex ID OAuth login (`BACK-045`, currently marked "Ready for QA" in `pm/backlog.md`, based on a code-read verification in `EVIDENCE-AUDIT-2026-07-17.md` that did NOT check this specific `auth.js` → `window.PLATFORM` call chain — that audit only confirmed the functions exist in `platform-adapter.js` and are reachable from index.html's own local `PLATFORM` const, not that `auth.js` can reach them). **If this reproduces live, VK ID/Яндекс ID login may currently be completely broken in production/staging**, despite being marked Ready for QA.

Other functions with working fallbacks (so lower urgency, but still silently running the "wrong"/legacy path instead of the intended platform-adapter one): `isValidEmail` (fallback is a looser `.includes('@')` check), referral capture/attribution helpers, Telegram start/return URL helpers, `setFormFieldError`/`clearFormErrors` (this brief's `-01`).

## Tasks
1. **Live re-test first, before touching any code.** On staging, actually click through VK ID login start and Yandex ID login start (or the closest staging-safe equivalent — check `pm/backlog.md` BACK-045 for how it was smoke-tested before) and capture whether it throws `'platform adapter unavailable'` or an equivalent console error. This is the single most important thing to confirm or refute in this brief.
2. Grep both files for every `window.PLATFORM` reference and list, for each, whether the current codebase has a working fallback or a hard failure (like `createOAuthPkce`) when `window.PLATFORM` is undefined. Build a short table.
3. If confirmed broken (or found to be effectively dead code with only harmless fallbacks): propose the fix. The obvious minimal fix is adding, at the end of `scripts/platform-adapter.js` right after `window.FourPlatform = {...}` is assigned:
   ```js
   window.PLATFORM = window.FourPlatform;
   ```
   This alone would activate all 17+ delegation points simultaneously. **Do not apply this without a full regression smoke pass covering: login (correct + wrong password), register, forgot-password/reset, referral link capture/attribution, VK ID start, Yandex ID start, Telegram launch detection** — because some of these paths have never actually run with `window.PLATFORM` defined, and their behavior (even if "more correct" per the refactor's intent) has never been live-verified together. Mark this **NEED-CLAUDE** with the before/after smoke evidence attached; Cowork will review the diff and the regression evidence before it's applied.
4. Update `docs/tasks/EVIDENCE-AUDIT-2026-07-17.md` or `pm/backlog.md` BACK-045/ARCH-001 rows with an honest note that the auth.js→window.PLATFORM chain was not covered by the original verification, regardless of what you find (even if OAuth turns out fine live, the verification gap itself is worth recording).

## Stop points
- ❌ Do not apply the `window.PLATFORM = window.FourPlatform` fix (or any equivalent) without NEED-CLAUDE review + attached regression evidence — mark it NEED-CLAUDE even if it looks obviously safe.
- ❌ prod, merge to `main`, CAL, prices, secrets, payment/entitlement.
- ❌ Do not touch backend OAuth/session/password logic — this is a client-side wiring investigation.

## Verification
- Live click-through evidence for OAuth start (screenshot/console log/network tab, not just code read).
- Table of all `window.PLATFORM` call sites with fallback-safe vs hard-fail classification.
- `node scripts/check-cp1251-mojibake.mjs` = 0 on any doc/code change.

## Report
`pm/outbox/REPORT-BRIEF-2026-07-21-morning-refine-03-platform-global-alias-investigate.md`: live OAuth re-test result, call-site table, proposed fix (if any) with regression-smoke plan attached, status **NEED-CLAUDE** (always, per stop point above — do not mark this DONE even if you apply and test the fix yourself).
