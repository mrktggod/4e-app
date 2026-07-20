status: NEW

# BRIEF-2026-07-20-morning-refine-01-auth-avatar-login-diagnose

## ⚠️ Delivery note (read first)
This brief is a refined re-issue of `pm/inbox/BRIEF-2026-07-19-10a-auth-avatar-login-diagnose.md`, which sat in `pm/inbox/` as an **untracked, uncommitted file** for a full day and was never processed. The 2026-07-20 06:00 audit found the pre-dawn Codex Automation run's own report explicitly listed only 4 *tracked* inbox briefs and none of the 8 untracked ones written by Cowork on 2026-07-19 — meaning Codex Automation likely syncs only via `git origin`, not the raw local folder. Cowork's sandbox has no `git push` credentials this session (confirmed: dry-run push failed with "could not read Username", terminal prompts disabled), so this file itself may suffer the same fate. **If you (Codex, human session, or automation) are reading this from disk without it being committed on origin yet — please `git add pm/inbox/BRIEF-2026-07-20-morning-refine-01-auth-avatar-login-diagnose.md && git commit && git push` first**, so the next automation cycle can see it too.

## Context
Юрий's manual QA on production 2026-07-19 found 3 bugs (register itself works fine — yesterday's 500 was a one-off). Priority: high, beta blockers. Auth/user-data is a **sensitive zone** — diagnosis and repro must be done autonomously only on FRESH staging test accounts; a fix that changes password/hash/account-merge logic must NOT be applied autonomously — mark NEED-CLAUDE with a plan instead. Do not touch real Yuri/user data or credentials.

## Tasks (diagnose + root-cause; narrow autonomous fix only if obvious and outside core auth logic)

1. **🔴 Login fails with "wrong password".** Reproduce on staging with a fresh email: register (password ≥6 chars) → immediately login with the same password. Check:
   - does the password/hash actually persist at register and match at login (root cause file:line in worker);
   - does the backend accept a password <6 chars at register (UI enforces "minimum 6") — if so, that's a front/back validation mismatch;
   - is there an email-canonicalization mismatch (case/whitespace) causing login to look up the wrong user.
   Give an exact root cause. If the fix is narrow and does NOT change hash/session schema — propose it; applying an auth fix is still NEED-CLAUDE (review), not autonomous.

2. **🔴 Avatar leaks into a new account via Telegram.** Reproduce: fresh account → check whether another user's avatar appears. Diagnose the source: does a localStorage draft (`extendedProfileDraft` or similar) bleed into the new account? Does account-merge by Telegram ID/device pull in someone else's profile? Root cause file:line. Cross-account leak = privacy issue; if it touches merge/session logic → NEED-CLAUDE; if it's purely a client-side cache bug not cleared on fresh login → a narrow fix is acceptable.

3. **🟡 Avatar doesn't save in the web version.** Diagnose where avatar save/load breaks in web vs Telegram: not reaching backend, not persisting, or not read back on render. Root cause; narrow fix if obvious and outside auth logic.

## Stop Points
- ❌ prod, merge to `main`, CAL, prices, secrets, payment/entitlement.
- ❌ auto-applying an auth fix that changes password/hash/session/merge logic — NEED-CLAUDE with a plan only.
- Fresh test accounts only; do not touch real data.

## Verification
- Staging repro with RAW evidence (steps + API responses), root cause file:line per bug.
- `node scripts/check-cp1251-mojibake.mjs` = 0 on any commit.

## Report
`pm/outbox/REPORT-BRIEF-2026-07-20-morning-refine-01-auth-avatar-login-diagnose.md`: root cause file:line per bug, reproduced yes/no (RAW), proposed fix, status DONE (if a safe narrow fix was made) or NEED-CLAUDE (if it's core auth logic — with a plan for morning review).
