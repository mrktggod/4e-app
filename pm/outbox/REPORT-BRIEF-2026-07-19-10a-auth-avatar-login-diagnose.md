status: NEED-CLAUDE

# REPORT-BRIEF-2026-07-19-10a-auth-avatar-login-diagnose

## Result

This brief is a duplicate of the refined 2026-07-20 auth/avatar diagnostic brief. I did not rerun staging auth diagnostics and did not change auth, password, session, merge, payment, entitlement, production, or `main`.

## Existing Work Reused

- Refined brief: `pm/inbox/BRIEF-2026-07-20-morning-refine-01-auth-avatar-login-diagnose.md`
- Existing report: `pm/outbox/REPORT-BRIEF-2026-07-20-morning-refine-01-auth-avatar-login-diagnose.md`
- Existing app commit: `3829712 test(auth): diagnose avatar login staging bugs`

## Outcome

`NEED-CLAUDE`: the existing diagnostic found auth/profile lifecycle bugs and intentionally stopped before password/session/merge/profile persistence fixes. The report contains raw staging evidence, root-cause file:line candidates, and proposed fix paths.

## Verification

```text
node scripts/check-cp1251-mojibake.mjs
CP1251 mojibake check passed: 0 suspicious tokens
```

## Honest Tails

- No duplicate staging account run was performed for this older duplicate brief.
- No production deploy.
- No merge into `main`.
- No CAL, price, secret, payment, or entitlement work.
